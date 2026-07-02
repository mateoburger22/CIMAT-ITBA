'use client';

/* ========================================================================
   ProductImageLightbox.js
   Foto de la ficha de producto que se amplía a pantalla completa al
   clickearla. Cliente porque maneja estado (abierto/cerrado) y eventos
   de teclado. La página padre (Server) solo le pasa src y alt.

   Accesibilidad: el disparador es un <button> (no un div con onClick),
   el overlay es role="dialog", y se cierra con Escape, con el botón ✕
   o clickeando el fondo.
   ======================================================================== */

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './ProductImageLightbox.module.css';

export default function ProductImageLightbox({ src, alt }) {
    const [open, setOpen] = useState(false);

    // Mientras está abierto: Escape cierra y el fondo no scrollea.
    useEffect(() => {
        if (!open) return;

        function onKeyDown(e) {
            if (e.key === 'Escape') setOpen(false);
        }

        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen(true)}
                aria-label={`Ampliar imagen de ${alt}`}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    className={styles.thumb}
                    priority
                />
                <span className={styles.hint} aria-hidden="true">
                    Ampliar +
                </span>
            </button>

            {open && (
                <div
                    className={styles.overlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Imagen ampliada de ${alt}`}
                    onClick={() => setOpen(false)}
                >
                    <div className={styles.frame}>
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            sizes="100vw"
                            className={styles.full}
                        />
                    </div>
                    <button
                        type="button"
                        className={styles.close}
                        onClick={() => setOpen(false)}
                        aria-label="Cerrar imagen ampliada"
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    );
}
