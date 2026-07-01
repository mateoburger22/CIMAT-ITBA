/* ========================================================================
   app/login/LoginForm.js
   Form de login. Postea normal (POST) al Route Handler /api/auth/login,
   que valida, crea la sesión (escribe la cookie) y redirige.

   No usa Server Action porque en esta versión de Next las cookies escritas
   dentro de una Server Action no persistían. El `errorMessage` lo decide la
   página leyendo ?error=... de la URL cuando el login falla.
   ======================================================================== */

import Link from 'next/link';
import styles from './page.module.css';

export default function LoginForm({ errorMessage }) {
    return (
        <form
            method="post"
            action="/api/auth/login"
            className={styles.form}
            noValidate
        >
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
                    Contraseña
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                />
            </div>

            {errorMessage && (
                <p className={styles.error} role="alert">
                    {errorMessage}
                </p>
            )}

            <button type="submit" className="btn btn-primary">
                Ingresar
            </button>

            <p className={styles.altLink}>
                ¿No tenés cuenta? <Link href="/registro">Crear una</Link>
            </p>
        </form>
    );
}
