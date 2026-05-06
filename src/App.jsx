/* App.jsx — define las rutas. Cada <Route> mapea una URL a un componente. */

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Carrito from './pages/Carrito.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmacion from './pages/Confirmacion.jsx';

export default function App() {
    return (
        <Routes>
            {/* Layout envuelve todas las rutas con header + footer.
                Los componentes hijos se renderizan en el <Outlet /> del Layout. */}
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/confirmacion" element={<Confirmacion />} />
            </Route>
        </Routes>
    );
}