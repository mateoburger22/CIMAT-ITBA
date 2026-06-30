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
     5. Vaciar cart_items.
     6. Redirigir a /confirmacion/[orderId].
   ======================================================================== */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

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

    // 7) Vaciar el carrito
    await supabase.from('cart_items').delete().eq('user_id', user.id);

    // 8) Redirigir a la página de confirmación con el id de la orden
    revalidatePath('/', 'layout');
    redirect(`/confirmacion/${order.id}`);
}
