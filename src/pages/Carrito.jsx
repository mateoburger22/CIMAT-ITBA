import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../data/productos.js';
import styles from './Carrito.module.css';

export default function Carrito() {
    const { items, count, subtotal, changeQty, removeItem } = useCart();

    return (
        <>
            <section className={styles.pageHeader} aria-labelledby="carrito-title">
                <div className={styles.pageHeaderInner}>
                    <nav className={styles.breadcrumb} aria-label="Migas de pan">
                        <ol>
                            <li><Link to="/">Inicio</Link></li>
                            <li aria-current="page">Carrito</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Tu pedido</p>
                    <h1 id="carrito-title">Carrito de compras</h1>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.layout}>
                    {items.length === 0 ? (
                        <div className={styles.empty}>
                            <p className="eyebrow">Tu carrito</p>
                            <h2>Tu carrito está vacío</h2>
                            <p>
                                Todavía no agregaste productos. Explorá el catálogo y elegí los
                                que necesitás.
                            </p>
                            <Link to="/catalogo" className="btn btn-primary">
                                Ir al catálogo
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div>
                                <ul className={styles.items} aria-label="Productos en el carrito">
                                    {items.map((item) => (
                                        <li key={item.sku} className={styles.item}>
                                            <div className={styles.visual} aria-hidden="true">
                                                {item.image ? (
                                                    <img src={item.image} alt="" />
                                                ) : (
                                                    <span>CIMAT</span>
                                                )}
                                            </div>
                                            <div className={styles.info}>
                                                <p className={styles.sku}>{item.sku}</p>
                                                <h2 className={styles.name}>{item.name}</h2>
                                                <p className={styles.desc}>
                                                    {formatPrice(item.price)} c/u
                                                </p>
                                            </div>
                                            <div className={styles.qty} aria-label="Cantidad">
                                                <button
                                                    type="button"
                                                    className={styles.qtyBtn}
                                                    onClick={() => changeQty(item.sku, -1)}
                                                    aria-label="Reducir cantidad"
                                                >
                                                    −
                                                </button>
                                                <span className={styles.qtyValue}>{item.qty}</span>
                                                <button
                                                    type="button"
                                                    className={styles.qtyBtn}
                                                    onClick={() => changeQty(item.sku, 1)}
                                                    aria-label="Aumentar cantidad"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className={styles.price}>
                                                {formatPrice(item.price * item.qty)}
                                            </p>
                                            <button
                                                type="button"
                                                className={styles.remove}
                                                onClick={() => removeItem(item.sku)}
                                                aria-label={`Eliminar ${item.name} del carrito`}
                                            >
                                                Eliminar
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/catalogo" className={styles.backLink}>
                                    ← Seguir comprando
                                </Link>
                            </div>

                            <aside className={styles.summary} aria-labelledby="resumen-title">
                                <h2 id="resumen-title">Resumen del pedido</h2>
                                <dl className={styles.summaryRows}>
                                    <div className={styles.summaryRow}>
                                        <dt>Subtotal ({count} {count === 1 ? 'artículo' : 'artículos'})</dt>
                                        <dd>{formatPrice(subtotal)}</dd>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <dt>Envío</dt>
                                        <dd className={styles.shipping}>A calcular</dd>
                                    </div>
                                    <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
                                        <dt>Total</dt>
                                        <dd>{formatPrice(subtotal)}</dd>
                                    </div>
                                </dl>
                                <p className={styles.note}>
                                    El costo de envío se calcula al confirmar tu dirección.
                                </p>
                                <Link
                                    to="/checkout"
                                    className={`btn btn-primary ${styles.summaryCta}`}
                                >
                                    Iniciar compra
                                </Link>
                            </aside>
                        </>
                    )}
                </div>
            </section>
        </>
    );
}