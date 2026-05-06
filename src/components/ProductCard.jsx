import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../data/productos.js';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    const [qty, setQty] = useState(1);          // contador local de cuántos agregar
    const [added, setAdded] = useState(false);  // feedback visual del botón

    function handleAdd() {
        addItem(product, qty);   // suma `qty` unidades al carrito
        setAdded(true);
        setQty(1);               // reset al default
        setTimeout(() => setAdded(false), 900);
    }

    function dec() {
        setQty((q) => Math.max(1, q - 1));   // mínimo 1
    }
    function inc() {
        setQty((q) => q + 1);
    }

    return (
        <article className={styles.card}>
            <div className={styles.visual}>
                {product.image && <img src={product.image} alt={product.name} />}
            </div>

            <div className={styles.body}>
                <p className={styles.sku}>{product.sku}</p>
                <h3 className={styles.title}>{product.name}</h3>

                {/* dangerouslySetInnerHTML porque las descripciones tienen <strong>.
                    Es seguro porque los datos vienen de productos.js (lo escribimos nosotros),
                    no de input del usuario. */}
                <p
                    className={styles.desc}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                />

                <p className={styles.price}>{formatPrice(product.price)}</p>

                {/* Bloque de acciones: Ver detalle arriba, Agregar + contador abajo */}
                <div className={styles.actions}>
                    <Link to="/producto" className={`btn btn-primary ${styles.detail}`}>
                        Ver detalle
                    </Link>

                    <div className={styles.addRow}>
                        <button
                            type="button"
                            className={styles.addBtn}
                            onClick={handleAdd}
                            disabled={added}
                        >
                            {added ? 'Agregado ✓' : 'Agregar'}
                        </button>

                        <div className={styles.qty} aria-label="Cantidad a agregar">
                            <button
                                type="button"
                                className={styles.qtyBtn}
                                onClick={dec}
                                aria-label="Reducir cantidad"
                            >
                                −
                            </button>
                            <span className={styles.qtyValue} aria-live="polite">
                                {qty}
                            </span>
                            <button
                                type="button"
                                className={styles.qtyBtn}
                                onClick={inc}
                                aria-label="Aumentar cantidad"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}