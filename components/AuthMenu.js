'use client';

/* ========================================================================
   AuthMenu.js
   Muestra "Iniciar sesión" o el nombre del usuario + botón "Salir" en el
   Header, dependiendo de si hay sesión.

   Es Client porque escucha `onAuthStateChange` para refrescarse en vivo
   cuando el usuario hace login/logout en otra pestaña, y porque vive
   adentro del Header (que también es Client).

   El logout dispara una Server Action (`signOut`) vía `<form>` para que
   las cookies se limpien en el servidor. Así, el primer render después
   del redirect ya viene sin sesión.
   ======================================================================== */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './AuthMenu.module.css';

export default function AuthMenu() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // 1) Estado inicial: ¿hay sesión?
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setLoading(false);
        });

        // 2) Suscripción a cambios: login/logout en cualquier pestaña.
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Mientras resuelve la sesión inicial no mostramos nada: evita el
    // "flash" de "Iniciar sesión" cuando el usuario sí está logueado.
    if (loading) return <div className={styles.placeholder} aria-hidden="true" />;

    if (!user) {
        return (
            <Link href="/login" className={styles.loginLink}>
                Iniciar sesión
            </Link>
        );
    }

    const displayName =
        user.user_metadata?.full_name?.split(' ')[0] || user.email;

    return (
        <div className={styles.menu}>
            <Link href="/cuenta/pedidos" className={styles.greeting}>
                Hola, {displayName}
            </Link>
            <form method="post" action="/api/auth/logout">
                <button type="submit" className={styles.logoutBtn}>
                    Salir
                </button>
            </form>
        </div>
    );
}
