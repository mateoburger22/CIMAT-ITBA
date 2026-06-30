'use client';

/* ========================================================================
   CartContext.js
   Estado global del carrito persistido en Supabase (tabla cart_items).
   Reemplaza al carrito localStorage de la fase anterior.

   Reglas:
     · Si NO hay sesión: el carrito viene vacío y addItem redirige a /login.
       (Decisión de diseño: como la tabla es por user_id y RLS exige
       auth.uid() = user_id, agregar al carrito sin sesión no tendría
       a dónde escribir).
     · Si hay sesión: leemos cart_items joineando productos para tener
       nombre/precio/imagen al render. Insert/update/delete van directo
       a Supabase y refrescamos el estado local.

   Forma externa que consumen los componentes (no cambia respecto a antes):
     · items: [{producto_id, sku, name, price, image, qty}]
     · count, subtotal
     · addItem(product, qty), changeQty(sku, delta), removeItem(sku), clearCart()
   ======================================================================== */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CartContext = createContext(null);

// Lee las filas del carrito del usuario actual joineando con productos
// para tener el detalle visual (name/price/image) en una sola query.
async function fetchCart(supabase) {
    const { data, error } = await supabase
        .from('cart_items')
        .select('quantity, productos (id, sku, name, price, image)')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error leyendo carrito:', error);
        return [];
    }

    // Aplanar al shape que esperan los componentes.
    return (data ?? [])
        .filter((row) => row.productos)
        .map((row) => ({
            producto_id: row.productos.id,
            sku: row.productos.sku,
            name: row.productos.name,
            price: row.productos.price,
            image: row.productos.image,
            qty: row.quantity,
        }));
}

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [user, setUser] = useState(null);
    const [hydrated, setHydrated] = useState(false);
    const router = useRouter();

    // Cliente singleton por mount: una instancia, reutilizada en cada call.
    const supabase = useMemo(() => createClient(), []);

    // 1) Sesión inicial + suscripción a cambios.
    useEffect(() => {
        let active = true;

        supabase.auth.getUser().then(async ({ data }) => {
            if (!active) return;
            setUser(data.user);
            if (data.user) {
                setItems(await fetchCart(supabase));
            }
            setHydrated(true);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const u = session?.user ?? null;
            setUser(u);
            if (u) {
                setItems(await fetchCart(supabase));
            } else {
                setItems([]);
            }
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    const refresh = useCallback(async () => {
        if (!user) return;
        setItems(await fetchCart(supabase));
    }, [supabase, user]);

    const addItem = useCallback(
        async (product, qty = 1) => {
            if (!user) {
                router.push('/login');
                return;
            }
            // cart_items tiene unique(user_id, producto_id). Buscamos
            // primero y decidimos insert vs update (no hay increment
            // nativo en supabase-js).
            const existing = items.find((i) => i.producto_id === product.id);
            if (existing) {
                await supabase
                    .from('cart_items')
                    .update({ quantity: existing.qty + qty })
                    .eq('user_id', user.id)
                    .eq('producto_id', product.id);
            } else {
                await supabase.from('cart_items').insert({
                    user_id: user.id,
                    producto_id: product.id,
                    quantity: qty,
                });
            }
            await refresh();
        },
        [supabase, user, items, refresh, router]
    );

    const changeQty = useCallback(
        async (sku, delta) => {
            if (!user) return;
            const item = items.find((i) => i.sku === sku);
            if (!item) return;
            const newQty = item.qty + delta;
            if (newQty <= 0) {
                await supabase
                    .from('cart_items')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('producto_id', item.producto_id);
            } else {
                await supabase
                    .from('cart_items')
                    .update({ quantity: newQty })
                    .eq('user_id', user.id)
                    .eq('producto_id', item.producto_id);
            }
            await refresh();
        },
        [supabase, user, items, refresh]
    );

    const removeItem = useCallback(
        async (sku) => {
            if (!user) return;
            const item = items.find((i) => i.sku === sku);
            if (!item) return;
            await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)
                .eq('producto_id', item.producto_id);
            await refresh();
        },
        [supabase, user, items, refresh]
    );

    const clearCart = useCallback(async () => {
        if (!user) return;
        await supabase.from('cart_items').delete().eq('user_id', user.id);
        setItems([]);
    }, [supabase, user]);

    const value = {
        items,
        count: items.reduce((acc, i) => acc + i.qty, 0),
        subtotal: items.reduce((acc, i) => acc + i.price * i.qty, 0),
        hydrated,
        isAuthenticated: Boolean(user),
        addItem,
        changeQty,
        removeItem,
        clearCart,
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
