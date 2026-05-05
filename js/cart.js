/* ========================================================================
   cart.js
   Lógica del carrito: estado en localStorage, render del widget del header,
   render de la página del carrito y formulario de checkout.
   Se carga en TODAS las páginas para que el badge y el dropdown estén siempre
   sincronizados con el contenido real del carrito.
   ======================================================================== */

(function () {
    'use strict';

    // --------------------------------------------------------------------
    // 1) Estado: leer/guardar en localStorage
    // --------------------------------------------------------------------

    // Clave única bajo la que guardamos el JSON del carrito.
    // Si en el futuro cambia la estructura, podemos versionar esta clave (cimat-cart-v2).
    const STORAGE_KEY = 'cimat-cart-v1';

    /**
     * Lee el carrito de localStorage y devuelve un array de items.
     * Cada item: { sku, name, price, qty }
     * Si no hay nada o si está corrupto, devuelve [].
     */
    function readCart() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            // Si el JSON está roto (p.ej. el usuario lo editó a mano) reseteamos.
            return [];
        }
    }

    /**
     * Guarda el carrito en localStorage y dispara un evento custom
     * para que cualquier componente abierto re-renderice.
     */
    function writeCart(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        document.dispatchEvent(new CustomEvent('cart:change'));
    }

    // --------------------------------------------------------------------
    // 2) Operaciones sobre el carrito
    // --------------------------------------------------------------------

    function addItem(product) {
        const items = readCart();
        const existing = items.find((i) => i.sku === product.sku);
        if (existing) {
            existing.qty += 1;
            // Si el item viejo no tenía imagen y el nuevo sí, la actualizamos.
            // Esto permite migrar items de carritos viejos sin que tengan que vaciarlo.
            if (!existing.image && product.image) {
                existing.image = product.image;
            }
        } else {
            items.push({
                sku: product.sku,
                name: product.name,
                price: product.price,
                image: product.image || '',
                qty: 1,
            });
        }
        writeCart(items);
    }

    function changeQty(sku, delta) {
        const items = readCart();
        const item = items.find((i) => i.sku === sku);
        if (!item) return;
        item.qty += delta;
        // Si la cantidad llega a 0, sacamos el item del carrito.
        const next = items.filter((i) => i.qty > 0);
        writeCart(next);
    }

    function removeItem(sku) {
        const items = readCart().filter((i) => i.sku !== sku);
        writeCart(items);
    }

    function clearCart() {
        writeCart([]);
    }

    function totals() {
        const items = readCart();
        const count = items.reduce((acc, i) => acc + i.qty, 0);
        const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
        return { items, count, subtotal };
    }

    // --------------------------------------------------------------------
    // 3) Helpers de formato
    // --------------------------------------------------------------------

    function formatPrice(value) {
        // Pesos argentinos con separador de miles "."
        return '$' + value.toLocaleString('es-AR');
    }

    // --------------------------------------------------------------------
    // 4) Render del widget del header (dropdown)
    // --------------------------------------------------------------------

    function renderWidget() {
        const widget = document.querySelector('.cart-widget');
        if (!widget) return;

        const { items, count, subtotal } = totals();

        // Badge: muestra cantidad si hay items, lo oculta si está vacío.
        const badge = widget.querySelector('.cart-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.hidden = false;
            } else {
                badge.hidden = true;
            }
        }

        // Actualiza el aria-label del summary para lectores de pantalla.
        const summary = widget.querySelector('summary');
        if (summary) {
            summary.setAttribute(
                'aria-label',
                count > 0
                    ? `Ver carrito de compras, ${count} ${count === 1 ? 'artículo' : 'artículos'}`
                    : 'Ver carrito de compras, vacío'
            );
        }

        const dropdown = widget.querySelector('.cart-dropdown');
        if (!dropdown) return;

        if (items.length === 0) {
            // Estado vacío
            dropdown.innerHTML = `
                <p class="cart-dropdown__heading">Tu carrito</p>
                <p class="cart-dropdown__empty">Tu carrito está vacío.</p>
                <a href="catalogo.html" class="btn btn-primary cart-dropdown__cta">Ir al catálogo</a>
            `;
            return;
        }

        // Estado con items
        const itemsHtml = items
            .map((i) => {
                const visual = i.image
                    ? `<img src="${i.image}" alt="">`
                    : `<span>CIMAT</span>`;
                return `
                <li class="cart-dropdown__item">
                    <div class="cart-dropdown__visual" aria-hidden="true">${visual}</div>
                    <div class="cart-dropdown__info">
                        <p class="cart-dropdown__name">${i.name}</p>
                        <p class="cart-dropdown__meta">×${i.qty} · ${formatPrice(i.price * i.qty)}</p>
                    </div>
                </li>
            `;
            })
            .join('');

        dropdown.innerHTML = `
            <p class="cart-dropdown__heading">Tu carrito</p>
            <ul class="cart-dropdown__items">${itemsHtml}</ul>
            <div class="cart-dropdown__total">
                <span>Total</span>
                <strong>${formatPrice(subtotal)}</strong>
            </div>
            <a href="carrito.html" class="btn btn-primary cart-dropdown__cta">Ver carrito completo</a>
        `;
    }

    // --------------------------------------------------------------------
    // 5) Cerrar el dropdown al hacer click afuera
    // --------------------------------------------------------------------

    function setupOutsideClick() {
        const widget = document.querySelector('.cart-widget');
        if (!widget) return;

        document.addEventListener('click', (e) => {
            if (widget.open && !widget.contains(e.target)) {
                widget.open = false;
            }
        });

        // ESC también cierra el dropdown (mejor accesibilidad).
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && widget.open) {
                widget.open = false;
            }
        });
    }

    // --------------------------------------------------------------------
    // 6) Botones "Agregar" del catálogo
    // --------------------------------------------------------------------

    function setupCatalogAddButtons() {
        // Cada botón "Agregar" tiene data-attributes con la info del producto.
        // Usamos delegación de eventos para manejarlos a todos con un único listener.
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-add-to-cart]');
            if (!btn) return;
            e.preventDefault();
            addItem({
                sku: btn.dataset.sku,
                name: btn.dataset.name,
                price: parseInt(btn.dataset.price, 10),
                image: btn.dataset.image || '',
            });
            // Feedback visual rápido: cambia el texto del botón un instante.
            const original = btn.textContent;
            btn.textContent = 'Agregado ✓';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = original;
                btn.disabled = false;
            }, 900);
        });
    }

    // --------------------------------------------------------------------
    // 7) Render de la página del carrito (carrito.html)
    // --------------------------------------------------------------------

    function renderCartPage() {
        const layout = document.querySelector('.cart-layout');
        if (!layout) return; // Solo corre en carrito.html

        const { items, count, subtotal } = totals();

        if (items.length === 0) {
            layout.innerHTML = `
                <div class="cart-empty">
                    <p class="eyebrow">Tu carrito</p>
                    <h2>Tu carrito está vacío</h2>
                    <p>Todavía no agregaste productos. Explorá el catálogo y elegí los que necesitás.</p>
                    <a href="catalogo.html" class="btn btn-primary">Ir al catálogo</a>
                </div>
            `;
            return;
        }

        const itemsHtml = items
            .map((i) => {
                const visual = i.image
                    ? `<img src="${i.image}" alt="">`
                    : `<span>CIMAT</span>`;
                return `
                <li class="cart-item" data-sku="${i.sku}">
                    <div class="cart-item__visual" aria-hidden="true">${visual}</div>
                    <div class="cart-item__info">
                        <p class="cart-item__sku">${i.sku}</p>
                        <h2 class="cart-item__name">${i.name}</h2>
                        <p class="cart-item__desc">${formatPrice(i.price)} c/u</p>
                    </div>
                    <div class="cart-item__qty" aria-label="Cantidad">
                        <button type="button" class="qty-btn" data-qty="-1" aria-label="Reducir cantidad">−</button>
                        <span class="qty-value">${i.qty}</span>
                        <button type="button" class="qty-btn" data-qty="1" aria-label="Aumentar cantidad">+</button>
                    </div>
                    <p class="cart-item__price">${formatPrice(i.price * i.qty)}</p>
                    <button type="button" class="cart-item__remove" data-remove aria-label="Eliminar ${i.name} del carrito">
                        Eliminar
                    </button>
                </li>
            `;
            })
            .join('');

        layout.innerHTML = `
            <div class="cart-items-wrapper">
                <ul class="cart-items" aria-label="Productos en el carrito">${itemsHtml}</ul>
                <a href="catalogo.html" class="cart-back-link">← Seguir comprando</a>
            </div>

            <aside class="cart-summary" aria-labelledby="resumen-title">
                <h2 id="resumen-title">Resumen del pedido</h2>
                <dl class="cart-summary__rows">
                    <div class="cart-summary__row">
                        <dt>Subtotal (${count} ${count === 1 ? 'artículo' : 'artículos'})</dt>
                        <dd>${formatPrice(subtotal)}</dd>
                    </div>
                    <div class="cart-summary__row">
                        <dt>Envío</dt>
                        <dd class="cart-summary__shipping">A calcular</dd>
                    </div>
                    <div class="cart-summary__row cart-summary__row--total">
                        <dt>Total</dt>
                        <dd>${formatPrice(subtotal)}</dd>
                    </div>
                </dl>
                <p class="cart-summary__note">El costo de envío se calcula al confirmar tu dirección.</p>
                <a href="checkout.html" class="btn btn-primary cart-summary__cta">Iniciar compra</a>
            </aside>
        `;
    }

    function setupCartPageActions() {
        const layout = document.querySelector('.cart-layout');
        if (!layout) return;

        // Delegación de eventos: un único listener en el contenedor maneja todos los clicks.
        layout.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            if (!item) return;
            const sku = item.dataset.sku;

            if (e.target.matches('[data-qty]')) {
                const delta = parseInt(e.target.dataset.qty, 10);
                changeQty(sku, delta);
            } else if (e.target.matches('[data-remove]')) {
                removeItem(sku);
            }
        });
    }

    // --------------------------------------------------------------------
    // 8) Checkout (checkout.html)
    // --------------------------------------------------------------------

    function renderCheckoutSummary() {
        const summaryBox = document.querySelector('[data-checkout-summary]');
        if (!summaryBox) return;

        const { items, count, subtotal } = totals();

        if (items.length === 0) {
            // Si alguien entra a /checkout con el carrito vacío, lo mandamos al catálogo.
            window.location.replace('catalogo.html');
            return;
        }

        const rows = items
            .map(
                (i) => `
                <li class="checkout-summary__item">
                    <span>${i.name} <em>×${i.qty}</em></span>
                    <span>${formatPrice(i.price * i.qty)}</span>
                </li>
            `
            )
            .join('');

        summaryBox.innerHTML = `
            <h2>Tu pedido</h2>
            <ul class="checkout-summary__items">${rows}</ul>
            <div class="checkout-summary__total">
                <span>Total (${count} ${count === 1 ? 'artículo' : 'artículos'})</span>
                <strong>${formatPrice(subtotal)}</strong>
            </div>
        `;
    }

    function setupCheckoutForm() {
        const form = document.querySelector('[data-checkout-form]');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // En esta fase no enviamos nada al backend: solo simulamos la confirmación.
            // En la fase 5 esto va a llamar a Mercado Pago.
            clearCart();
            window.location.href = 'confirmacion.html';
        });
    }

    // --------------------------------------------------------------------
    // 9) Inicialización
    // --------------------------------------------------------------------

    function init() {
        renderWidget();
        renderCartPage();
        renderCheckoutSummary();
        setupOutsideClick();
        setupCatalogAddButtons();
        setupCartPageActions();
        setupCheckoutForm();

        // Cuando cambia el carrito (en cualquier parte del código), re-renderizamos.
        // También escuchamos el evento 'storage' del navegador, que se dispara cuando
        // OTRA pestaña modifica localStorage: así dos pestañas abiertas se mantienen sincronizadas.
        document.addEventListener('cart:change', () => {
            renderWidget();
            renderCartPage();
        });
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY) {
                renderWidget();
                renderCartPage();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
