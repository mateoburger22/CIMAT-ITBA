/* ========================================================================
   app/login/page.js
   Server Component: arma el shell de la página (breadcrumb, header) y
   delega el form a un Client Component (`LoginForm`) para poder usar
   `useActionState`. Si ya hay sesión, redirigimos a /catalogo.
   ======================================================================== */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';
import styles from './page.module.css';

export const metadata = {
    title: 'Iniciar sesión — Polytape',
};

export default async function LoginPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect('/catalogo');

    return (
        <>
            <section className={styles.pageHeader}>
                <div className={styles.pageHeaderInner}>
                    <nav className={styles.breadcrumb} aria-label="Migas de pan">
                        <ol>
                            <li>
                                <Link href="/">Inicio</Link>
                            </li>
                            <li aria-current="page">Iniciar sesión</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Acceso de clientes</p>
                    <h1>Iniciar sesión</h1>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.formWrap}>
                    <LoginForm />
                </div>
            </section>
        </>
    );
}
