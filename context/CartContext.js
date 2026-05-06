'use client';

/* ========================================================================
   CartContext.js
   Estado global del carrito. Cliente-only porque usa localStorage y eventos
   del navegador. En Next.js, la directiva 'use client' marca este módulo
   (y todos sus consumidores) como parte del bundle del cliente.
   ======================================================================== */

import {
    createContext,
    useContext,
    useEffect,
    useReducer,
    useState,
} from 'react';

const CartContext = createContext(null);

// Versionada por si en el futuro cambia la estructura del item.
const STORAGE_KEY = 'cimat-cart-v1';

// Reducer puro: recibe estado + acción, devuelve estado nuevo. Nunca muta.
function cartReducer(state, action) {
    switch (action.type) {
        case 'HYDRATE': {
            // Reemplaza el estado entero con lo guardado en localStorage o
            // sincronizado desde otra pestaña.
            return Array.isArray(action.payload) ? action.payload : state;
        }
        case 'ADD': {
            const { product, qty } = action.payload;
            const existing = state.find((i) => i.sku === product.sku);
            if (existing) {
                return state.map((i) =>
                    i.sku === product.sku ? { ...i, qty: i.qty + qty } : i
                );
            }
            return [
                ...state,
                {
                    sku: product.sku,
                    name: product.name,
                    price: product.price,
                    image: product.image || '',
                    qty,
                },
            ];
        }
        case 'CHANGE_QTY': {
            const { sku, delta } = action.payload;
            return state
                .map((i) => (i.sku === sku ? { ...i, qty: i.qty + delta } : i))
                .filter((i) => i.qty > 0);
        }
        case 'REMOVE':
            return state.filter((i) => i.sku !== action.payload.sku);
        case 'CLEAR':
            return [];
        default:
            return state;
    }
}

export function CartProvider({ children }) {
    // Empezamos vacío para que el primer render del servidor (SSR) y del cliente
    // coincidan. Si arrancáramos con datos de localStorage, el server tendría
    // un valor distinto y React tiraría error de hidratación.
    const [items, dispatch] = useReducer(cartReducer, []);
    const [hydrated, setHydrated] = useState(false);

    // 1) Hidratar desde localStorage en el cliente, después del primer render.
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    dispatch({ type: 'HYDRATE', payload: parsed });
                }
            }
        } catch {
            /* JSON corrupto → ignorar y arrancar vacío */
        }
        setHydrated(true);
    }, []);

    // 2) Persistir cambios — solo después de la hidratación inicial, así no
    //    pisamos el localStorage con [] en el primer render.
    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items, hydrated]);

    // 3) Sincronización entre pestañas: si otra pestaña modifica localStorage,
    //    refrescamos nuestro estado vía la acción HYDRATE.
    useEffect(() => {
        function handleStorage(e) {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const next = JSON.parse(e.newValue);
                    if (Array.isArray(next)) {
                        dispatch({ type: 'HYDRATE', payload: next });
                    }
                } catch {
                    /* ignorar */
                }
            }
        }
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const value = {
        items,
        count: items.reduce((acc, i) => acc + i.qty, 0),
        subtotal: items.reduce((acc, i) => acc + i.price * i.qty, 0),
        addItem: (product, qty = 1) =>
            dispatch({ type: 'ADD', payload: { product, qty } }),
        changeQty: (sku, delta) =>
            dispatch({ type: 'CHANGE_QTY', payload: { sku, delta } }),
        removeItem: (sku) => dispatch({ type: 'REMOVE', payload: { sku } }),
        clearCart: () => dispatch({ type: 'CLEAR' }),
    };

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error('useCart debe usarse dentro de un <CartProvider>');
    }
    return ctx;
}
