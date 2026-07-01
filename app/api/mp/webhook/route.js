/* ========================================================================
   app/api/mp/webhook/route.js
   Webhook de Mercado Pago (POST). MP nos llama servidor-a-servidor cada vez
   que cambia el estado de un pago. NO llega ninguna sesión de usuario, por eso
   trabajamos con el cliente admin (service role) que saltea RLS.

   SEGURIDAD: nunca confiamos en lo que trae la notificación. El body solo nos
   dice "mirá el pago X". Nosotros consultamos ESE pago directo a la API de MP
   con nuestro Access Token: esa respuesta es la fuente de verdad del estado.
   Así, aunque alguien falsee una notificación, no puede marcar nada como
   pagado sin que MP lo confirme.

   Flujo:
     1. Sacar el id del pago (viene en el body y/o en el query, según el evento).
     2. Consultar el pago real en MP.
     3. Si status === 'approved', pasar la orden (external_reference) a 'pagada',
        guardar mp_payment_id y vaciar el carrito del dueño.
        El filtro .eq('status','pendiente') hace la operación IDEMPOTENTE:
        aunque MP reintente la notificación, solo actúa la primera vez.
   ======================================================================== */

import { Payment } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request) {
    try {
        const url = new URL(request.url);
        const body = await request.json().catch(() => ({}));

        // El evento puede venir como { type, data: { id } } (body) o como
        // ?type=payment&data.id=... / ?topic=payment&id=... (query).
        const type =
            body?.type ??
            url.searchParams.get('type') ??
            url.searchParams.get('topic');
        const paymentId =
            body?.data?.id ??
            url.searchParams.get('data.id') ??
            url.searchParams.get('id');

        // Solo nos interesan eventos de pago con un id concreto.
        if (type !== 'payment' || !paymentId) {
            return new Response('ignored', { status: 200 });
        }

        // Fuente de verdad: el pago según MP.
        const payment = await new Payment(mpClient()).get({ id: paymentId });
        const orderId = Number(payment.external_reference);

        if (payment.status === 'approved' && Number.isInteger(orderId)) {
            const admin = createAdminClient();
            const { data: order } = await admin
                .from('orders')
                .update({ status: 'pagada', mp_payment_id: String(payment.id) })
                .eq('id', orderId)
                .eq('status', 'pendiente') // idempotencia: solo la 1ra vez
                .select('user_id')
                .maybeSingle();

            // Recién con el pago aprobado vaciamos el carrito del comprador.
            if (order) {
                await admin
                    .from('cart_items')
                    .delete()
                    .eq('user_id', order.user_id);
            }
        }

        return new Response('ok', { status: 200 });
    } catch (error) {
        // Devolvemos 500 para que MP reintente ante fallos transitorios
        // (ej. no pudimos consultar el pago). Logueamos para depurar en Vercel.
        console.error('[mp webhook] error:', error);
        return new Response('error', { status: 500 });
    }
}
