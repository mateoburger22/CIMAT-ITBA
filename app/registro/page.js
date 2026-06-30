/* ========================================================================
   app/registro/page.js
   Server Component. Si ya hay sesión, manda al catálogo. Si no, muestra
   el form (Client Component).
   ======================================================================== */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RegistroForm from './RegistroForm';
import styles from './page.module.css';

export const metadata = {
    title: 'Crear cuenta — Polytape',
};

export default async function RegistroPage() {
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
                            <li aria-current="page">Crear cuenta</li>
                        </ol>
                    </nav>
                    <p className="eyebrow">Acceso de clientes</p>
                    <h1>Crear cuenta</h1>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.formWrap}>
                    <RegistroForm />
                </div>
            </section>
        </>
    );
}
