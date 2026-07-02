'use client';

/* ========================================================================
   Header.js
   Cliente porque usa usePathname() para detectar la ruta activa y subraya
   el item de nav correspondiente. En Vite usábamos NavLink de react-router
   que hace lo mismo automáticamente; en Next no existe — lo reimplementamos
   con usePathname() y una clase condicional.

   En mobile (<641px) el nav horizontal no entra: se reemplaza por un botón
   hamburguesa que despliega los mismos links en un panel debajo del header.
   El panel se cierra solo al navegar (efecto sobre pathname).
   ======================================================================== */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import CartWidget from './CartWidget';
import AuthMenu from './AuthMenu';
import styles from './Header.module.css';

function NavItem({ href, exact, extra, children }) {
    const pathname = usePathname();
    // exact: true → match estricto (para "/"). false → match con startsWith.
    // extra: prefijos adicionales que también activan el item (p. ej. Catálogo
    // queda activo en /productos/[id], que conceptualmente es parte de él).
    const active = exact
        ? pathname === href
        : [href, ...(extra ?? [])].some((p) => pathname.startsWith(p));
    return (
        <Link href={href} className={active ? styles.active : undefined}>
            {children}
        </Link>
    );
}

const navLinks = [
    { href: '/', exact: true, label: 'Inicio' },
    { href: '/catalogo', extra: ['/productos'], label: 'Catálogo' },
    { href: '/contacto', label: 'Contacto' },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    // Al navegar a otra ruta, el panel mobile se cierra solo.
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    return (
        <header className={styles.siteHeader}>
            <div className={styles.headerInner}>
                <Link
                    href="/"
                    className={styles.logo}
                    aria-label="CIMAT, ir al inicio"
                >
                    <Image
                        src="/logo/cimat-logo.png"
                        alt="CIMAT"
                        width={240}
                        height={59}
                        priority
                    />
                </Link>

                <nav className={styles.mainNav} aria-label="Navegación principal">
                    <ul>
                        {navLinks.map((l) => (
                            <li key={l.href}>
                                <NavItem href={l.href} exact={l.exact} extra={l.extra}>
                                    {l.label}
                                </NavItem>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={styles.headerActions}>
                    <AuthMenu />
                    <CartWidget />
                    <button
                        type="button"
                        className={styles.menuBtn}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-nav"
                        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        onClick={() => setMenuOpen((o) => !o)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </div>

            <nav
                id="mobile-nav"
                className={styles.mobileNav}
                data-open={menuOpen}
                aria-label="Navegación principal (mobile)"
            >
                <ul>
                    {navLinks.map((l) => (
                        <li key={l.href}>
                            <NavItem href={l.href} exact={l.exact} extra={l.extra}>
                                {l.label}
                            </NavItem>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}
