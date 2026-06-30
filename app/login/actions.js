'use server';

/* ========================================================================
   app/login/actions.js
   Server Action de login. Vive en el SERVIDOR: el form la invoca como si
   fuera un endpoint, pero el código no viaja al navegador (mejor: el
   navegador ni siquiera ve la lógica de auth).

   Forma del retorno: `{ error: string } | undefined`. Si no hay error
   redirigimos a `/catalogo` y la función no retorna nada. Si hay error,
   useActionState() del componente cliente lo recibe y lo muestra.
   ======================================================================== */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(_prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        return { error: 'Completá email y contraseña.' };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: String(email),
        password: String(password),
    });

    if (error) {
        // Mensaje genérico para no filtrar si el email existe o no.
        return { error: 'Credenciales inválidas.' };
    }

    // Invalidamos el cache de toda la app: las páginas que dependen del
    // usuario (Header, carrito, mis pedidos) deben re-renderizarse.
    revalidatePath('/', 'layout');
    redirect('/catalogo');
}
