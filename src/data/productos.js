/* ========================================================================
   productos.js
   Catálogo de productos como datos. Cada producto es un objeto con la misma
   estructura. El componente ProductCard se encarga de renderizarlos.
   ======================================================================== */

// Importamos las imágenes para que Vite las procese y nos devuelva la URL final
// (con hash para cache busting). En vanilla las referenciábamos por ruta string.
import armortape from '../assets/img/productos/armortape.png';
import electrictape from '../assets/img/productos/electrictape.png';
import polytape from '../assets/img/productos/polytape.png';

export const productos = [
    // --- Línea 01: Reparación con fibra de vidrio ---
    {
        sku: 'CIMAT-RW-050',
        name: 'Repair Wrap 50 mm',
        description:
            'Cinta de fibra de vidrio activada con agua. Endurece en 30 min y queda con resistencia mecánica permanente. <strong>50 mm × 3,65 m</strong>.',
        price: 24500,
        linea: 'reparacion',
        image: armortape,
    },
    {
        sku: 'CIMAT-RW-075',
        name: 'Repair Wrap 75 mm',
        description:
            'Versión intermedia para tuberías de mayor diámetro y reparaciones estructurales. <strong>75 mm × 3,65 m</strong>.',
        price: 35800,
        linea: 'reparacion',
        image: armortape,
    },
    {
        sku: 'CIMAT-RW-100',
        name: 'Repair Wrap Heavy Duty 100 mm',
        description:
            'Versión reforzada para tuberías industriales de gran diámetro y aplicaciones bajo presión. <strong>100 mm × 3,65 m</strong>.',
        price: 48900,
        linea: 'reparacion',
        image: armortape,
    },

    // --- Línea 02: Aislación eléctrica ---
    {
        sku: 'CIMAT-PVC-019',
        name: 'Aislante PVC Premium 19 mm',
        description:
            'Cinta vinílica negra dieléctrica para conexiones eléctricas hasta <strong>600 V</strong>. Adhesivo permanente y elasticidad de uso profesional. <strong>19 mm × 20 m</strong>.',
        price: 4200,
        linea: 'aislacion',
        image: electrictape,
    },
    {
        sku: 'CIMAT-AF-019',
        name: 'Auto-Fundente 19 mm',
        description:
            'Cinta de goma EPR auto-vulcanizable. Sin adhesivo: se funde sobre sí misma. Aprobada para conexiones hasta <strong>69 kV</strong>. <strong>19 mm × 9 m</strong>.',
        price: 12300,
        linea: 'aislacion',
        image: electrictape,
    },
    {
        sku: 'CIMAT-CPK-005',
        name: 'Color Pack Eléctrico',
        description:
            'Set de 5 cintas vinílicas en colores de identificación de fases (negro, rojo, azul, verde, amarillo). <strong>19 mm × 6 m</strong> c/u.',
        price: 18500,
        linea: 'aislacion',
        image: electrictape,
    },

    // --- Línea 03: Sellado de tuberías ---
    {
        sku: 'CIMAT-SH-050',
        name: 'Sellador Hidráulico Universal',
        description:
            'Cinta autofusionante de silicona para reparar fugas en cañerías sin secado. Resiste hasta <strong>2,5 bar</strong>. <strong>50 mm × 3 m</strong>.',
        price: 9800,
        linea: 'sellado',
        image: polytape,
    },
    {
        sku: 'CIMAT-PTF-012',
        name: 'PTFE Industrial 12 mm',
        description:
            'Cinta de teflón densidad alta para sellar roscas en agua, gas y aire comprimido. <strong>12 mm × 12 m</strong>.',
        price: 3500,
        linea: 'sellado',
        image: polytape,
    },
    {
        sku: 'CIMAT-AFP-075',
        name: 'Anti-Fugas Pro 75 mm',
        description:
            'Cinta epoxy reforzada para reparaciones definitivas en cañerías de alta presión. <strong>75 mm × 1,5 m</strong>.',
        price: 22400,
        linea: 'sellado',
        image: polytape,
    },
];

// Metadata de cada línea (para los headers de sección del catálogo)
export const lineas = [
    {
        id: 'reparacion',
        numero: '01',
        nombre: 'Reparación con fibra de vidrio',
        descripcion:
            'Cintas activadas con agua que endurecen en minutos. Refuerzo estructural permanente para tuberías, mangueras y piezas dañadas.',
    },
    {
        id: 'aislacion',
        numero: '02',
        nombre: 'Aislación eléctrica',
        descripcion:
            'Cintas dieléctricas certificadas para conexiones de baja, media y alta tensión en entornos industriales y obras eléctricas.',
    },
    {
        id: 'sellado',
        numero: '03',
        nombre: 'Sellado de tuberías',
        descripcion:
            'Cintas selladoras para juntas, roscas y reparaciones en sistemas de gas, agua y aire comprimido.',
    },
];

// Helper para formatear precios en pesos argentinos. Lo usamos desde varios componentes.
export function formatPrice(value) {
    return '$' + value.toLocaleString('es-AR');
}