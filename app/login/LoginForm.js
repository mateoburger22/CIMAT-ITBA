'use client';

/* ========================================================================
   app/login/LoginForm.js
   Form de login (Client Component). Usa el hook `useActionState` para:
     · invocar la Server Action `loginAction` al hacer submit,
     · mantener en estado el `{ error }` que devuelva,
     · exponer `isPending` mientras la action está en vuelo.
   Si la action redirige, este componente ni siquiera ve la respuesta.
   ======================================================================== */

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from './actions';
import styles from './page.module.css';

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction, null);

    return (
        <form action={formAction} className={styles.form} noValidate>
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

            {state?.error && (
                <p className={styles.error} role="alert">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                className="btn btn-primary"
                disabled={isPending}
            >
                {isPending ? 'Ingresando…' : 'Ingresar'}
            </button>

            <p className={styles.altLink}>
                ¿No tenés cuenta? <Link href="/registro">Crear una</Link>
            </p>
        </form>
    );
}
