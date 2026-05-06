'use client';

/* ========================================================================
   Header.js
   Cliente porque usa usePathname() para detectar la ruta activa y subraya
   el item de nav correspondiente. En Vite usábamos NavLink de react-router
   que hace lo mismo automáticamente; en Next no existe — lo reimplementamos
   con usePathname() y una clase condicional.
   ======================================================================== */

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import CartWidget from './CartWidget';
import styles from './Header.module.css';

function NavItem({ href, exact, children }) {
    const pathname = usePathname();
    // exact: true → match estricto (para "/"). false → match con startsWith
    // (para "/catalogo" que también debería estar activo en sub-rutas si las hubiera).
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
        <Link href={href} className={active ? styles.active : undefined}>
            {children}
        </Link>
    );
}

export default function Header() {
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
                        <li>
                            <NavItem href="/" exact>
                                Inicio
                            </NavItem>
                        </li>
                        <li>
                            <NavItem href="/catalogo">Catálogo</NavItem>
                        </li>
                        <li>
                            <NavItem href="/contacto">Contacto</NavItem>
                        </li>
                    </ul>
                </nav>

                <CartWidget />
            </div>
        </header>
    );
}
