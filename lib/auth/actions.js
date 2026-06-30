'use server';

/* ========================================================================
   lib/auth/actions.js
   Server Actions de sesión compartidas. Por ahora solo `signOut`, usada
   por el botón del Header. La invocamos como `<form action={signOut}>`:
   el submit dispara la action en el servidor, que limpia las cookies de
   sesión y redirige al home.
   ======================================================================== */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    // Que se re-renderice todo lo que dependa de sesión (Header, etc.).
    revalidatePath('/', 'layout');
    redirect('/');
}
