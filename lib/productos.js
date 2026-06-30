/* ========================================================================
   lib/productos.js
   Acceso de SOLO LECTURA al catálogo desde la base. Se usa en Server
   Components (catálogo y ficha de producto). Cliente que abre = un nuevo
   cliente de Supabase por petición, con las cookies de sesión del usuario
   actual; igual la tabla `productos` tiene RLS "lectura pública", así que
   anda logueado o no.
   ======================================================================== */

import { createClient } from '@/lib/supabase/server';

// Lista todo el catálogo. Usado por /catalogo. Lo ordenamos por id para
// que mantenga el orden del seed (línea reparación → aislación → sellado).
export async function getAllProductos() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('productos')
        .select('id, sku, name, description, price, linea, image')
        .order('id', { ascending: true });

    if (error) throw error;
    return data;
}

// Busca un producto por su slug de URL (sku en lowercase).
// Ej: 'cimat-rw-050' → fila con sku 'CIMAT-RW-050'.
// Postgres permite comparar case-insensitive con `ilike` sin wildcards.
export async function getProductoBySlug(slug) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('productos')
        .select('id, sku, name, description, price, linea, image')
        .ilike('sku', slug)
        .maybeSingle();

    if (error) throw error;
    return data; // null si no existe → la página llama notFound()
}
