# Polytape — CIMAT

Ecommerce de cintas adhesivas industriales: reparación con fibra de vidrio activada con agua, aislación eléctrica, sellado de tuberías y aplicaciones de alta temperatura.

## Sobre el proyecto

Proyecto de la materia **71.38 Programación Web** (Q1 2026, ITBA). El desarrollo se hace progresivamente, siguiendo las fases del programa:

1. **Fase 1** — HTML semántico + CSS (estructura y estilo) ✅
2. **Fase 2** — JavaScript (funcionalidad e interactividad) ✅
3. **Fase 3** — Migración a React (componentes y estado) ✅
4. **Fase 4** — Migración a **Next.js** (App Router, rutas dinámicas, SSG) ← **estamos acá**
5. **Fase 5** — Backend, base de datos e integración con Mercado Pago

## Stack actual

- **Framework**: [Next.js 16](https://nextjs.org/) con App Router
- **UI**: React 19 + JavaScript (sin TypeScript)
- **Estilos**: CSS Modules + custom properties para tokens de marca
- **Fonts**: `next/font` (Inter + Barlow Condensed self-hosted)
- **Imágenes**: `next/image` (WebP/AVIF + srcset automático)
- **Estado del carrito**: Context API + useReducer + localStorage (SSR-safe)
- **Hosting previsto**: Vercel (CI/CD desde GitHub)

## Cómo correrlo

```bash
npm install      # primera vez
npm run dev      # http://localhost:3000
```

Otros comandos:

```bash
npm run build    # build de producción + prerenderizado estático
npm run start    # servir el build en local
npm run lint     # ESLint
```

## Estructura

```
Polytape/
├── app/                        # App Router — una carpeta por ruta
│   ├── layout.js               # raíz: <html>, fonts, Header, Footer, CartProvider
│   ├── page.js                 # /  (Home)
│   ├── globals.css             # estilos globales + tokens de marca
│   ├── catalogo/page.js        # /catalogo
│   ├── carrito/page.js         # /carrito
│   ├── checkout/page.js        # /checkout
│   ├── confirmacion/page.js    # /confirmacion
│   ├── contacto/page.js        # /contacto
│   └── productos/[id]/page.js  # /productos/<sku>  (ruta dinámica, SSG)
├── components/                 # componentes compartidos (.js + .module.css)
├── context/CartContext.js      # carrito global, 'use client'
├── data/productos.js           # catálogo + helpers (formatPrice, getProductoBySlug)
├── public/                     # estáticos servidos en /
│   ├── img/productos/
│   └── logo/
└── docs/
    ├── prompts/                # logs de cada sesión con IA (entregable de la materia)
    └── NEXT-MIGRATION-PRIMER.md
```

## Rutas

| URL | Render | Descripción |
|---|---|---|
| `/` | Static | Home con hero + 4 categorías + why-cimat + CTA |
| `/catalogo` | Static | Lista de productos por línea (Reparación / Aislación / Sellado) |
| `/productos/[id]` | SSG | Ficha individual — 9 URLs prerenderizadas en build-time |
| `/carrito` | Static | Lista editable + resumen lateral |
| `/checkout` | Static | Form de datos personales + dirección |
| `/confirmacion` | Static | Mensaje "Pedido confirmado" |
| `/contacto` | Static | Form de contacto (sin backend en esta fase) |

Las páginas marcadas como **Static** son HTML pre-fabricado en build-time. Las **SSG** son estáticas pero generadas dinámicamente con `generateStaticParams` (una por producto).

## Carpeta `docs/`

- **`docs/prompts/`** — registro obligatorio de los prompts usados con IA (entregable del Momento 4 del parcial).
- **`docs/NEXT-MIGRATION-PRIMER.md`** — contexto de arranque para la migración Fase 3 → Fase 4.

## Próximos pasos (Fase 5)

- Backend con API Routes de Next o servicio externo (Supabase).
- Persistencia del carrito en base de datos (no solo localStorage).
- Integración con Mercado Pago (Sandbox + webhooks).
- Auth básica.
