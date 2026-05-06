import styles from './Confirmacion.module.css';

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