import { Link } from 'react-router-dom';
import logo from '../assets/logo/cimat-logo.png';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.siteFooter}>
            <div className={styles.footerInner}>
                <div className={styles.brand}>
                    <img src={logo} alt="CIMAT" />
                    <p>
                        Cintas adhesivas industriales para reparación, aislación, sellado y alta
                        temperatura.
                    </p>
                </div>

                <nav aria-label="Navegación del pie de página">
                    <h2>Sitio</h2>
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/catalogo">Catálogo</Link></li>
                        <li><Link to="/contacto">Contacto</Link></li>
                        <li><Link to="/carrito">Carrito</Link></li>
                    </ul>
                </nav>

                <div>
                    <h2>Contacto</h2>
                    <ul>
                        <li><a href="mailto:contacto@cimat.com">contacto@cimat.com</a></li>
                    </ul>
                </div>
            </div>

            <p className={styles.copy}>© 2026 CIMAT. Todos los derechos reservados.</p>
        </footer>
    );
}