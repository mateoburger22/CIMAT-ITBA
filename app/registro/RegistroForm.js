/* ========================================================================
   app/registro/RegistroForm.js
   Form de alta. Postea normal (POST) al Route Handler /api/auth/registro.
   El `errorMessage` lo decide la página leyendo ?error=... de la URL.
   ======================================================================== */

import Link from 'next/link';
import styles from './page.module.css';

export default function RegistroForm({ errorMessage }) {
    return (
        <form
            method="post"
            action="/api/auth/registro"
            className={styles.form}
            noValidate
        >
            <div className={styles.field}>
                <label htmlFor="full_name" className={styles.label}>
                    Nombre completo
                </label>
                <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    required
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>
                    Contraseña (mín. 6 caracteres)
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="password_confirm" className={styles.label}>
                    Repetir contraseña
                </label>
                <input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                />
            </div>

            {errorMessage && (
                <p className={styles.error} role="alert">
                    {errorMessage}
                </p>
            )}

            <button type="submit" className="btn btn-primary">
                Crear cuenta
            </button>

            <p className={styles.altLink}>
                ¿Ya tenés cuenta? <Link href="/login">Iniciar sesión</Link>
            </p>
        </form>
    );
}
