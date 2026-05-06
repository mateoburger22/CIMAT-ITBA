import { NavLink, Link } from 'react-router-dom';
import CartWidget from './CartWidget.jsx';
import logo from '../assets/logo/cimat-logo.png';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.siteHeader}>
            <div className={styles.headerInner}>
                <Link to="/" className={styles.logo} aria-label="CIMAT, ir al inicio">
                    <img src={logo} alt="CIMAT" />
                </Link>

                <nav className={styles.mainNav} aria-label="Navegación principal">
                    <ul>
                        {/* NavLink agrega automáticamente la clase 'active'
                            cuando la URL coincide. */}
                        <li>
                            <NavLink
                                to="/"
                                end
                                className={({ isActive }) => (isActive ? styles.active : undefined)}
                            >
                                Inicio
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/catalogo"
                                className={({ isActive }) => (isActive ? styles.active : undefined)}
                            >
                                Catálogo
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/contacto"
                                className={({ isActive }) => (isActive ? styles.active : undefined)}
                            >
                                Contacto
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <CartWidget />
            </div>
        </header>
    );
}