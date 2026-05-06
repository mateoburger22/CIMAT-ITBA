import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración mínima de Vite. El plugin de React traduce el JSX a JS normal.
export default defineConfig({
    plugins: [react()],
});