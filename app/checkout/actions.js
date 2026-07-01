'use server';

/* ========================================================================
   app/checkout/actions.js
   Server Action que CONFIRMA la compra. Crítica: nunca confiamos en
   precios ni cantidades que viajan en el form (los podría tocar el
   usuario en el cliente). Re-leemos cart_items + productos en el server
   y calculamos el total acá.

   Pasos:
     1. Validar sesión (RLS ya lo hace, pero queremos un error claro).
     2. Leer cart_items joineando productos. Si vacío → error.
     3. Insertar fila en `orders` con el total real y los datos de envío.
     4. Insertar las filas en `order_items` (snapshot histórico).
     5. Crear la PREFERENCIA en Mercado Pago (Checkout Pro).
     6. Redirigir al usuario a la pasarela de MP (init_point).

   OJO: el carrito NO se vacía acá. Se vacía recién cuando el pago queda
   'approved' (lo hace el webhook /api/mp/webhook, o el respaldo de la página
   de confirmación). Así, si el usuario cancela el pago, no pierde el carrito.
   ======================================================================== */

import { redirect } from 'next/navigation';
import { Preference } from 'mercadopago';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mpClient } from '@/lib/mercadopago';

export async function placeOrderAction(_prevState, formData) {
    const supabase = await createClient();

    // 1) Sesión
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Tu sesión expiró. Iniciá sesión de nuevo.' };
    }

    // 2) Datos de envío del form
    const shipping = {
        shipping_full_name: String(formData.get('nombre') ?? '').trim(),
        shipping_email: String(formData.get('email') ?? '').trim(),
        shipping_phone: String(formData.get('telefono') ?? '').trim(),
        shipping_address: String(formData.get('direccion') ?? '').trim(),
        shipping_city: String(formData.get('ciudad') ?? '').trim(),
        shipping_postal_code: String(formData.get('cp') ?? '').trim(),
    };
    if (Object.values(shipping).some((v) => !v)) {
        return { error: 'Completá todos los datos de envío.' };
    }

    // 3) Carrito real (server-side, ignoramos el cliente)
    const { data: cart, error: cartError } = await supabase
        .from('cart_items')
        .select('quantity, productos (id, sku, name, price)')
        .order('id', { ascending: true });

    if (cartError) {
        return { error: 'No pudimos leer tu carrito. Probá de nuevo.' };
    }
    const validCart = (cart ?? []).filter((row) => row.productos);
    if (validCart.length === 0) {
        return { error: 'Tu carrito está vacío.' };
    }

    // 4) Total calculado con los precios CANÓNICOS de la DB
    const total = validCart.reduce(
        (acc, row) => acc + row.productos.price * row.quantity,
        0
    );

    // 5) Insertar la orden
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: user.id,
            status: 'pendiente',
            total,
            ...shipping,
        })
        .select('id')
        .single();

    if (orderError || !order) {
        return { error: 'No pudimos crear el pedido. Probá de nuevo.' };
    }

    // 6) Insertar los items (copia histórica de sku/name/price)
    const itemsToInsert = validCart.map((row) => ({
        order_id: order.id,
        producto_id: row.productos.id,
        sku: row.productos.sku,
        name: row.productos.name,
        price: row.productos.price,
        quantity: row.quantity,
    }));
    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

    if (itemsError) {
        // La orden ya existe pero sin items: borramos para que no quede huérfana.
        await supabase.from('orders').delete().eq('id', order.id);
        return { error: 'No pudimos guardar los productos del pedido.' };
    }

    // 7) Crear la preferencia de pago en Mercado Pago (Checkout Pro).
    //    external_reference = id de nuestra orden: es el hilo que nos permite,
    //    cuando MP nos avise del pago, saber A QUÉ orden corresponde.
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    let initPoint;
    try {
        const preference = await new Preference(mpClient()).create({
            body: {
                items: validCart.map((row) => ({
                    id: String(row.productos.id),
                    title: row.productos.name,
                    quantity: row.quantity,
                    unit_price: row.productos.price,
                    currency_id: 'ARS',
                })),
                external_reference: String(order.id),
                // A dónde vuelve el usuario según el resultado del pago. Siempre
                // a la confirmación: ahí mostramos el estado y verificamos.
                back_urls: {
                    success: `${site}/confirmacion/${order.id}`,
                    pending: `${site}/confirmacion/${order.id}`,
                    failure: `${site}/confirmacion/${order.id}`,
                },
                // MP redirige solo al aprobarse (sin que el usuario toque "volver").
                auto_return: 'approved',
                // URL server-a-servidor donde MP nos notifica el pago.
                notification_url: `${site}/api/mp/webhook`,
                payer: {
                    name: shipping.shipping_full_name,
                    email: shipping.shipping_email,
                },
            },
        });

        initPoint = preference.init_point;

        // Guardamos el id de preferencia para trazabilidad. Va por el cliente
        // admin porque `orders` no tiene política de UPDATE para el usuario.
        await createAdminClient()
            .from('orders')
            .update({ mp_preference_id: preference.id })
            .eq('id', order.id);
    } catch {
        // Si MP falla, la orden 'pendiente' quedaría huérfana: la borramos
        // (order_items cae por ON DELETE CASCADE). Admin porque el usuario no
        // tiene política de DELETE sobre orders.
        await createAdminClient().from('orders').delete().eq('id', order.id);
        return {
            error: 'No pudimos iniciar el pago con Mercado Pago. Probá de nuevo.',
        };
    }

    // 8) Mandar al usuario a pagar. redirect() lanza, así que va FUERA del try.
    redirect(initPoint);
}
