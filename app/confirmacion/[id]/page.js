/* ========================================================================
   app/confirmacion/[id]/page.js
   Página de confirmación dinámica. La ruta es /confirmacion/123 donde 123
   es el id de la orden recién creada.

   Es Server Component asíncrono: lee `orders` + `order_items` desde
   Supabase. RLS asegura que solo el dueño puede leer su orden — si otro
   usuario escribe un id ajeno en la URL, la query devuelve null y
   mostramos 404.
   ======================================================================== */

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/data/productos';
import styles from './page.module.css';

export const metadata = {
    title: 'Pedido confirmado — Polytape',
};

export default async function Confirmacion({ params }) {
    const { id } = await params;
    const orderId = Number(id);
    if (!Number.isInteger(orderId)) notFound();

    const supabase = await createClient();

    // Sin sesión no podemos validar que el pedido sea suyo → /login.
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: order } = await supabase
        .from('orders')
        .select(
            'id, status, total, created_at, shipping_full_name, shipping_address, shipping_city, shipping_postal_code'
        )
        .eq('id', orderId)
        .maybeSingle();

    // Si la orden no existe o no es del usuario actual (RLS la oculta),
    // mostramos 404 para no filtrar la existencia de ids ajenos.
    if (!order) notFound();

    const { data: items } = await supabase
        .from('order_items')
        .select('sku, name, price, quantity')
        .eq('order_id', orderId)
        .order('id', { ascending: true });

    const fecha = new Date(order.created_at).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <section className={styles.confirmation}>
            <div className={styles.inner}>
                <p className="eyebrow">CIMAT</p>
                <h1>¡Gracias por tu compra!</h1>
                <p className={styles.intro}>
                    Tu pedido <strong>#{order.id}</strong> quedó registrado el{' '}
                    {fecha} con estado <em>{order.status}</em>.
                </p>

                <div className={styles.card}>
                    <h2>Resumen del pedido</h2>
                    <ul className={styles.items}>
                        {(items ?? []).map((item) => (
                            <li key={item.sku} className={styles.item}>
                                <div>
                                    <p className={styles.itemName}>{item.name}</p>
                                    <p className={styles.itemMeta}>
                                        {item.sku} · ×{item.quantity}
                                    </p>
                                </div>
                                <p className={styles.itemPrice}>
                                    {formatPrice(item.price * item.quantity)}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.total}>
                        <span>Total</span>
                        <strong>{formatPrice(order.total)}</strong>
                    </div>
                </div>

                <div className={styles.card}>
                    <h2>Envío</h2>
                    <p>{order.shipping_full_name}</p>
                    <p>
                        {order.shipping_address} — {order.shipping_city} (CP{' '}
                        {order.shipping_postal_code})
                    </p>
                </div>

                <div className={styles.actions}>
                    <Link href="/cuenta/pedidos" className="btn btn-primary">
                        Ver mis pedidos
                    </Link>
                    <Link href="/catalogo" className="btn btn-outline">
                        Seguir comprando
                    </Link>
                </div>
            </div>
        </section>
    );
}
