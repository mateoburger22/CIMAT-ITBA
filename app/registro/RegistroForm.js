'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from './actions';
import styles from './page.module.css';

export default function RegistroForm() {
    const [state, formAction, isPending] = useActionState(registerAction, null);

    return (
        <form action={formAction} className={styles.form} noValidate>
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
                {isPending ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>

            <p className={styles.altLink}>
                ¿Ya tenés cuenta? <Link href="/login">Iniciar sesión</Link>
            </p>
        </form>
    );
}
