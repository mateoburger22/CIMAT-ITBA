/* ========================================================================
   app/confirmacion/page.js — Confirmación (Server Component)
   100% estática. No tiene interactividad ni lee del carrito (intencional:
   queremos que esta página sea recargable sin perder el mensaje).
   ======================================================================== */

import styles from './page.module.css';

export const metadata = {
    title: 'Pedido confirmado — Polytape',
};

export default function Confirmacion() {
    return (
        <section className={styles.confirmation}>
            <div className={styles.inner}>
                <p className="eyebrow">CIMAT</p>
                <h1>Pedido confirmado</h1>
            </div>
        </section>
    );
}
