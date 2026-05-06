import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
    return (
        <>
            <a className="skip-link" href="#main">
                Saltar al contenido principal
            </a>
            <Header />
            <main id="main">
                {/* Acá se renderiza la página actual (Home, Catalogo, etc.) */}
                <Outlet />
            </main>
            <Footer />
        </>
    );
}