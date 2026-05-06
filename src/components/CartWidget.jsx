import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../data/productos.js';
import styles from './CartWidget.module.css';

export default function CartWidget() {
    const { items, count, subtotal } = useCart();
    const [open, setOpen] = useState(false);
    const widgetRef = useRef(null);
    const location = useLocation();

    // Cerrar al navegar a otra página
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    // Cerrar al hacer click afuera
    useEffect(() => {
        if (!open) return;
        function handleClick(e) {
            if (widgetRef.current && !widgetRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        function handleKey(e) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    return (
        <div className={styles.cartWidget} ref={widgetRef}>
            <button
                type="button"
                className={styles.cartLink}
                aria-expanded={open}
                aria-label={`Ver carrito de compras, ${count > 0 ? count + (count === 1 ? ' artículo' : ' artículos') : 'vacío'}`}
                onClick={() => setOpen((o) => !o)}
            >
                Carrito
                {count > 0 && <span className={styles.cartBadge}>{count}</span>}
            </button>

            {open && (
                <div className={styles.cartDropdown}>
                    <p className={styles.heading}>Tu carrito</p>

                    {items.length === 0 ? (
                        <>
                            <p className={styles.empty}>Tu carrito está vacío.</p>
                            <Link to="/catalogo" className={`btn btn-primary ${styles.cta}`}>
                                Ir al catálogo
                            </Link>
                        </>
                    ) : (
                        <>
                            <ul className={styles.items}>
                                {items.map((item) => (
                                    <li key={item.sku} className={styles.item}>
                                        <div className={styles.visual} aria-hidden="true">
                                            {item.image ? (
                                                <img src={item.image} alt="" />
                                            ) : (
                                                <span>CIMAT</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className={styles.itemName}>{item.name}</p>
                                            <p className={styles.itemMeta}>
                                                ×{item.qty} · {formatPrice(item.price * item.qty)}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.total}>
                                <span>Total</span>
                                <strong>{formatPrice(subtotal)}</strong>
                            </div>
                            <Link to="/carrito" className={`btn btn-primary ${styles.cta}`}>
                                Ver carrito completo
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}