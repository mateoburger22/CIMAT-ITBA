'use client';

/* ========================================================================
   app/checkout/page.js — Checkout (Client Component)
   Cliente: maneja form submit, useEffect, navegación programática.

   En Next la API de navegación cambia respecto a react-router:
     useNavigate() → useRouter() de 'next/navigation'
     navigate('/x')                → router.push('/x')
     navigate('/x', { replace })   → router.replace('/x')
   ======================================================================== */

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/productos';
import styles from './page.module.css';

export default function Checkout() {
    const { items, count, subtotal, clearCart } = useCart();
    const router = useRouter();

    // Si entran al checkout con carrito vacío, los mandamos al catálogo
    useEffect(() => {
        if (items.length === 0) {
            router.replace('/catalogo');
        }
    }, [items.length, router]);

    function handleSubmit(e) {
        e.preventDefault();
        // En esta fase no enviamos nada al backend.
        // Fase 5 (Backend): acá llamamos a Mercado Pago.
        clearCart();
        router.push('/confirmacion');
    }

    if (items.length === 0) {
        return null; // mientras redirige
    }

    return (
        <>
            <section className={styles.pageHeader} aria-labelledby="checkout-title">
                <div className={styles.pageHeaderInner}>
                    <nav className={styles.breadcrumb} aria-label="Migas de pan">
                        <ol>
                            <li><Link href="/">Inicio</Link></li>
                            <li><Link href="/carrito">Carrito</Link></li>
                            <li aria-current="page">Checkout</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Finalizar compra</p>
                    <h1 id="checkout-title">Tus datos de envío</h1>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.layout}>
                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                        <fieldset className={styles.fieldset}>
                            <legend>Datos personales</legend>

                            <div className={styles.row}>
                                <label className={styles.field}>
                                    <span className={styles.label}>Nombre completo</span>
                                    <input type="text" name="nombre" required autoComplete="name" />
                                </label>
                            </div>

                            <div className={`${styles.row} ${styles.rowTwo}`}>
                                <label className={styles.field}>
                                    <span className={styles.label}>Email</span>
                                    <input type="email" name="email" required autoComplete="email" />
                                </label>
                                <label className={styles.field}>
                                    <span className={styles.label}>Teléfono</span>
                                    <input type="tel" name="telefono" required autoComplete="tel" />
                                </label>
                            </div>
                        </fieldset>

                        <fieldset className={styles.fieldset}>
                            <legend>Dirección de envío</legend>

                            <div className={styles.row}>
                                <label className={styles.field}>
                                    <span className={styles.label}>Dirección</span>
                                    <input
                                        type="text"
                                        name="direccion"
                                        required
                                        autoComplete="street-address"
                                        placeholder="Calle y número"
                                    />
                                </label>
                            </div>

                            <div className={`${styles.row} ${styles.rowTwo}`}>
                                <label className={styles.field}>
                                    <span className={styles.label}>Ciudad</span>
                                    <input
                                        type="text"
                                        name="ciudad"
                                        required
                                        autoComplete="address-level2"
                                    />
                                </label>
                                <label className={styles.field}>
                                    <span className={styles.label}>Código postal</span>
                                    <input
                                        type="text"
                                        name="cp"
                                        required
                                        autoComplete="postal-code"
                                        inputMode="numeric"
                                    />
                                </label>
                            </div>
                        </fieldset>

                        <button type="submit" className={`btn btn-primary ${styles.submit}`}>
                            Confirmar pedido
                        </button>
                    </form>

                    <aside className={styles.summary} aria-label="Resumen del pedido">
                        <h2>Tu pedido</h2>
                        <ul className={styles.summaryItems}>
                            {items.map((i) => (
                                <li key={i.sku} className={styles.summaryItem}>
                                    <span>
                                        {i.name} <em>×{i.qty}</em>
                                    </span>
                                    <span>{formatPrice(i.price * i.qty)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.summaryTotal}>
                            <span>
                                Total ({count} {count === 1 ? 'artículo' : 'artículos'})
                            </span>
                            <strong>{formatPrice(subtotal)}</strong>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}
