/* Entry point: el primer JS que corre. Monta React en el <div id="root">. */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import App from './App.jsx';

import './styles/reset.css';
import './styles/globals.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* BrowserRouter habilita las rutas del lado del cliente.
            CartProvider hace que el carrito esté disponible en TODA la app. */}
        <BrowserRouter>
            <CartProvider>
                <App />
            </CartProvider>
        </BrowserRouter>
    </StrictMode>
);