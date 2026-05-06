'use client';

/* ========================================================================
   app/contacto/page.js — Contacto (Client Component)
   Form sin backend: al hacer submit muestra "Mensaje enviado" en lugar
   del form. Cuando llegue la fase de backend (Mercado Pago / API),
   este handler se conecta a un endpoint real.
   ======================================================================== */

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Contacto() {
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        // En esta fase no enviamos a ningún lado.
        // Próxima fase: POST a /api/contacto o servicio de email.
        setSubmitted(true);
    }

    return (
        <>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderInner}>
                    <nav className={styles.breadcrumb} aria-label="Migas de pan">
                        <ol>
                            <li>
                                <Link href="/">Inicio</Link>
                            </li>
                            <li aria-current="page">Contacto</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Estamos para ayudarte</p>
                    <h1>Contacto</h1>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.layout}>
                    {submitted ? (
                        <div className={styles.success}>
                            <p className="eyebrow">Listo</p>
                            <h2>Mensaje enviado</h2>
                            <p>
                                Recibimos tu consulta y te respondemos dentro de las próximas
                                24 horas hábiles.
                            </p>
                            <Link href="/" className="btn btn-primary">
                                Volver al inicio
                            </Link>
                        </div>
                    ) : (
                        <form className={styles.form} onSubmit={handleSubmit} noValidate>
                            <fieldset className={styles.fieldset}>
                                <legend>Tus datos</legend>

                                <div className={styles.row}>
                                    <label className={styles.field}>
                                        <span className={styles.label}>Nombre completo</span>
                                        <input
                                            type="text"
                                            name="nombre"
                                            required
                                            autoComplete="name"
                                        />
                                    </label>
                                </div>

                                <div className={`${styles.row} ${styles.rowTwo}`}>
                                    <label className={styles.field}>
                                        <span className={styles.label}>Email</span>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            autoComplete="email"
                                        />
                                    </label>
                                    <label className={styles.field}>
                                        <span className={styles.label}>
                                            Teléfono (opcional)
                                        </span>
                                        <input type="tel" name="telefono" autoComplete="tel" />
                                    </label>
                                </div>
                            </fieldset>

                            <fieldset className={styles.fieldset}>
                                <legend>Tu consulta</legend>

                                <div className={styles.row}>
                                    <label className={styles.field}>
                                        <span className={styles.label}>Asunto</span>
                                        <input
                                            type="text"
                                            name="asunto"
                                            required
                                            placeholder="Ej: Consulta por cinta de fibra de vidrio"
                                        />
                                    </label>
                                </div>

                                <div className={styles.row}>
                                    <label className={styles.field}>
                                        <span className={styles.label}>Mensaje</span>
                                        <textarea
                                            name="mensaje"
                                            rows={6}
                                            required
                                            placeholder="Contanos qué necesitás. Si es para una aplicación específica, dejanos detalles técnicos."
                                        />
                                    </label>
                                </div>
                            </fieldset>

                            <button
                                type="submit"
                                className={`btn btn-primary ${styles.submit}`}
                            >
                                Enviar mensaje
                            </button>
                        </form>
                    )}

                    <aside
                        className={styles.sidebar}
                        aria-label="Otras formas de contacto"
                    >
                        <h2>Otras vías</h2>

                        <div className={styles.contactItem}>
                            <p className={styles.contactLabel}>Email</p>
                            <a href="mailto:contacto@cimat.com">contacto@cimat.com</a>
                        </div>

                        <div className={styles.contactItem}>
                            <p className={styles.contactLabel}>Teléfono</p>
                            <a href="tel:+541140000000">+54 11 4000-0000</a>
                        </div>

                        <div className={styles.contactItem}>
                            <p className={styles.contactLabel}>Horario</p>
                            <p className={styles.contactValue}>Lun a Vie · 9 a 18 hs</p>
                        </div>

                        <div className={styles.contactItem}>
                            <p className={styles.contactLabel}>Dirección</p>
                            <p className={styles.contactValue}>
                                Av. Industrial 1234,
                                <br />
                                CABA, Argentina
                            </p>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}
