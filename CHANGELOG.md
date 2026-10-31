# Changelog

Todos los cambios relevantes de Hoenn TCG. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [1.2.0] - 2026-10-31

### Cambiado
- **Next.js 14 → 16.4** y **React 18 → 19**: APIs de request asíncronas (#22), `middleware.ts` → `proxy.ts` y Turbopack (#24).
- **ESLint 9** con flat config nativa de `eslint-config-next` 16 y reglas de TypeScript (#23, #24).
- **Zod 4** con `z.email()` y `z.url()` restringido a https (#19).
- **Nodemailer 10** (#20) y **Node.js 22 LTS** (#21).
- El carrito usa `useSyncExternalStore` y se sincroniza entre pestañas (#24).

### Seguridad
- Corregidos todos los avisos de `npm audit` (críticos en Next.js y next-auth; altos en Zod, nodemailer y postcss): **0 vulnerabilidades** (#18–#24).
- SMTP con STARTTLS obligatorio y TLS ≥ 1.2 (#20).
- Auditoría bloqueante en CI y Dependabot semanal (#25).

## [1.1.0] - 2026-10-30

### Agregado
- **Pagos con Webpay Plus (Transbank):** reserva de stock, confirmación (*commit*) en el servidor y devolución del stock si el pago se rechaza o se anula (#15).
- Correo de confirmación de compra (#11) y avisos al cliente cuando cambia el estado del pedido, con código de seguimiento (#12).
- Sincronización de precios y stock del carrito con el servidor, y botón para vaciarlo (#14).
- Ordenar la tienda por precio, nombre o más recientes, con contador de resultados (#8).
- Admin: exportar pedidos a CSV con protección contra *CSV injection* (#9).
- Admin: estados y filtros para las solicitudes de colecciones (#10).
- SEO: `sitemap.xml` y `robots.txt` (#4); metadatos, Open Graph y JSON-LD por producto (#5).
- Página 404 propia (#6), *error boundary* y pantallas de carga (#7).
- `SECURITY.md` y `CONTRIBUTING.md` (#1); Node 20 fijado con `.nvmrc` (#3).

### Seguridad
- Rate limiting en checkout (10/min), wishlist (30/min) y API admin (60/min), con `429` y `Retry-After` (#13).
- CI con lint, chequeo de tipos, pruebas, auditoría de dependencias y build (#16).

## [1.0.0] - 2026-10-30

### Agregado
- Tienda con singles, sellados y graduadas, con precios autocalculados (1 USD = $900 CLP).
- Autenticación con Google, Facebook y correo/contraseña con verificación; roles cliente y admin.
- Panel admin en tiempo real con KPIs, gráficos, conversión, gestión de productos y pedidos.
- Módulo "Compramos tus cartas" con subida de fotos y correo al administrador.
- Seguridad: Prisma, sanitización XSS, CSRF, rate limit de login, bcrypt cost 12 y headers con CSP por nonce.
