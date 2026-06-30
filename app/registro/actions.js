'use server';

/* ========================================================================
   app/registro/actions.js
   Server Action de alta. signUp con email + password + full_name como
   user_metadata. El trigger SQL `handle_new_user` corre en la base y crea
   la fila en public.profiles con ese full_name (ver 03-trigger.sql).
   ======================================================================== */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function registerAction(_prevState, formData) {
    const fullName = String(formData.get('full_name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('password_confirm') ?? '');

    if (!fullName || !email || !password) {
        return { error: 'Completá todos los campos.' };
    }
    if (password.length < 6) {
        return { error: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    if (password !== passwordConfirm) {
        return { error: 'Las contraseñas no coinciden.' };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // raw_user_meta_data en auth.users; el trigger lo lee con
            // `new.raw_user_meta_data ->> 'full_name'`.
            data: { full_name: fullName },
        },
    });

    if (error) {
        // Errores comunes: email ya registrado, email inválido.
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    // Tras signUp, Supabase ya deja la sesión abierta (si el proyecto
    // no exige confirmar email, que es el default en proyectos nuevos).
    redirect('/catalogo');
}
