import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { productos, lineas } from '../data/productos.js';
import styles from './Catalogo.module.css';

export default function Catalogo() {
    return (
        <>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderInner}>
                    <nav className={styles.breadcrumb} aria-label="Migas de pan">
                        <ol>
                            <li><Link to="/">Inicio</Link></li>
                            <li aria-current="page">Catálogo</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Catálogo de productos</p>
                </div>
            </section>

            <nav className={styles.categoryFilter} aria-label="Filtrar por línea de producto">
                <ul>
                    {lineas.map((l) => (
                        <li key={l.id}>
                            <a href={`#${l.id}`}>{l.nombre}</a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Una sección por línea: filtramos los productos del array según linea.id */}
            {lineas.map((linea, idx) => {
                const productosLinea = productos.filter((p) => p.linea === linea.id);
                const sectionClass = `${styles.productSection} ${idx % 2 === 1 ? styles.productSectionAlt : ''}`;

                return (
                    <section
                        key={linea.id}
                        id={linea.id}
                        className={sectionClass}
                        aria-labelledby={`${linea.id}-title`}
                    >
                        <div className={styles.productSectionHeader}>
                            <p className="eyebrow">Línea {linea.numero}</p>
                            <h2 id={`${linea.id}-title`}>{linea.nombre}</h2>
                            <p>{linea.descripcion}</p>
                        </div>

                        <ul className={styles.productGrid}>
                            {productosLinea.map((p) => (
                                <li key={p.sku}>
                                    <ProductCard product={p} />
                                </li>
                            ))}
                        </ul>
                    </section>
                );
            })}

            <section className={styles.cta} aria-labelledby="cta-title">
                <div className={styles.ctaInner}>
                    <h2 id="cta-title">¿No estás seguro de qué cinta usar?</h2>
                    <p>
                        Contanos tu aplicación y te recomendamos el producto correcto.
                        Cotizaciones por volumen sin compromiso.
                    </p>
                    <Link to="/contacto" className="btn btn-dark">
                        Pedir asesoramiento
                    </Link>
                </div>
            </section>
        </>
    );
}