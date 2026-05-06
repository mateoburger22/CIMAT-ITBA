/* ========================================================================
   app/productos/[id]/page.js — Ficha individual de producto
   Server Component. La ruta es DINÁMICA: el [id] entre corchetes le dice a
   Next que ese segmento es un parámetro variable.

   Convivencia Server/Client en la misma página:
     - El render principal (info, foto, descripción) es Server → HTML estático.
     - El contador + botón "Agregar al carrito" vive en <AddToCartBlock>, que
       es Client. Next maneja la frontera automáticamente.
   ======================================================================== */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    productos,
    getProductoBySlug,
    formatPrice,
    lineas,
} from '@/data/productos';
import AddToCartBlock from '@/components/AddToCartBlock';
import styles from './page.module.css';

// generateStaticParams le dice a Next qué valores de [id] existen.
// Next pre-renderiza UNA página HTML por cada producto en build-time
// (9 productos → 9 URLs estáticas). Resultado: navegación instantánea
// y mejor SEO porque cada ficha es un archivo HTML real.
export function generateStaticParams() {
    return productos.map((p) => ({ id: p.sku.toLowerCase() }));
}

// generateMetadata genera el <title> y <meta description> dinámicamente
// por producto. En Next 16, params es un Promise que hay que await.
export async function generateMetadata({ params }) {
    const { id } = await params;
    const product = getProductoBySlug(id);
    if (!product) {
        return { title: 'Producto no encontrado — Polytape' };
    }
    return {
        title: `${product.name} — Polytape`,
        // Sacamos los <strong> de la description para que sea texto plano.
        description: product.description.replace(/<[^>]+>/g, ''),
    };
}

export default async function ProductoDetalle({ params }) {
    const { id } = await params;
    const product = getProductoBySlug(id);

    // Si el slug no coincide con ningún producto, Next sirve automáticamente
    // su página 404 (app/not-found.js o el fallback default).
    if (!product) {
        notFound();
    }

    const linea = lineas.find((l) => l.id === product.linea);

    return (
        <>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderInner}>
                    <nav className={styles.breadcrumb} aria-label="Migas de pan">
                        <ol>
                            <li>
                                <Link href="/">Inicio</Link>
                            </li>
                            <li>
                                <Link href="/catalogo">Catálogo</Link>
                            </li>
                            <li aria-current="page">{product.name}</li>
                        </ol>
                    </nav>
                </div>
            </section>

            <section className={styles.product}>
                <div className={styles.productInner}>
                    <div className={styles.visual}>
                        {product.image && (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="(max-width: 900px) 100vw, 50vw"
                                style={{
                                    objectFit: 'contain',
                                    padding: 'var(--space-lg)',
                                }}
                                priority
                            />
                        )}
                    </div>

                    <div className={styles.info}>
                        {linea && (
                            <p className="eyebrow">
                                Línea {linea.numero} · {linea.nombre}
                            </p>
                        )}
                        <h1>{product.name}</h1>
                        <p className={styles.sku}>SKU: {product.sku}</p>
                        <p className={styles.price}>{formatPrice(product.price)}</p>

                        {/* dangerouslySetInnerHTML porque la description tiene <strong>.
                            Es seguro: los datos vienen de productos.js. */}
                        <div
                            className={styles.desc}
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />

                        {/* Componente cliente: solo el bloque interactivo.
                            El resto de la página queda en Server. */}
                        <AddToCartBlock product={product} />

                        <Link href="/catalogo" className={styles.backLink}>
                            ← Volver al catálogo
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
