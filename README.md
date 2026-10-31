# Hoenn TCG · E-commerce de Pokémon TCG

Tienda online de Pokémon TCG con estética inspirada en el trío legendario de Hoenn (**Latios · Latias · Rayquaza**). Incluye catálogo con precios autocalculados, autenticación con roles, panel de administración en tiempo real, módulo "Compramos tus cartas" y una capa de seguridad con pruebas automatizadas.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS · Prisma (SQLite) · NextAuth (OAuth2 + JWT) · NodeMailer 10 · Recharts · Zod 4 · Vitest · ESLint 9

## Puesta en marcha

Requiere **Node.js 22 LTS** o superior (ver `.nvmrc`; con nvm: `nvm use`).

```bash
npm install
cp .env.example .env        # completa NEXTAUTH_SECRET (openssl rand -base64 32)
npm run setup               # crea la BD y carga catálogo + admin + datos demo
npm run dev                 # http://localhost:3000
```

| Usuario | Correo | Contraseña |
|---|---|---|
| Admin | `admin@hoenn.tcg` | `CambiaEsta#Clave2026` (cámbiala en `.env` antes del seed) |
| Clientes demo | `demo1@cliente.cl` … `demo6@cliente.cl` | `Demo#Cliente2026` |

Sin SMTP configurado, los correos (verificación y colecciones) se imprimen en la consola del servidor, así que puedes copiar el enlace de verificación desde ahí.

## Paleta

| Token | Color | Uso |
|---|---|---|
| Latios Blue | `#0052D4` | Botones principales, badges, estados activos |
| Latias Red | `#FF2A54` | Ofertas, CTA secundarias, notificaciones |
| Rayquaza Emerald | `#00C853` | Precios, verificación, stock, éxito |
| Rayquaza Gold | `#FFD700` | Bordes de cartas secretas / alt-art, rareza |
| Fondo | `#0F172A` | Dark mode por defecto con brillo "holo" |

## Funcionalidades

**Catálogo y precios.** Tasa fija `1 USD = $900 CLP` (`src/lib/pricing.ts`). El precio CLP se calcula siempre en el servidor a partir del precio USD.
- Singles: Latios & Latias GX Alt Art #170 ($1.080.000), Latios IR #203 ($22.500) y Rayquaza VMAX Alt Art #218 ($360.000).
- Sellados: Booster Boxes Surging Sparks y Cielos Evolutivos, y ETBs. Sus precios son referencias editables.
- Graduadas: Latias & Latios GX PSA 10 y Rayquaza Gold Star PSA 9/10, con estado **No disponible**.

**Autenticación y roles.** Google, Facebook y registro con correo y contraseña, con verificación por correo. Sesiones JWT firmadas de 8 h.
- **Cliente:** perfil, historial de pedidos, seguimiento de envío con código de tracking y wishlist.
- **Admin:** dashboard que se refresca cada 30 s con ventas totales, margen, órdenes activas, inventario crítico, gráficos, métricas de conversión y tabla de transacciones. También gestiona precios, stock, habilitar/deshabilitar productos, estados de pedidos y solicitudes de colecciones.

**Compramos tus cartas** (`/vende-tus-cartas`). Formulario con nombre, correo, teléfono, descripción, valor estimado en USD o CLP y hasta 6 fotos. Envía un correo al `ADMIN_EMAIL` con las fotos adjuntas usando NodeMailer (compatible con SendGrid vía SMTP).

**Pagos con Webpay Plus (Transbank).** Activa `PAYMENT_PROVIDER="webpay"` en `.env`. Por defecto usa el ambiente de **integración** con las credenciales públicas de prueba (tarjeta VISA `4051 8856 0044 6623`, CVV `123`, RUT `11.111.111-1`, clave `123`). Flujo:
1. Se crea el pedido en estado *Pago pendiente* y se reserva el stock.
2. El cliente paga en Webpay.
3. Al volver, el servidor hace el *commit* y verifica estado, código, monto y orden.
4. Si el pago se rechaza o se anula, el pedido se cancela y el stock se devuelve.

Para producción: `WEBPAY_ENV="production"` más `WEBPAY_COMMERCE_CODE` y `WEBPAY_API_KEY` de Transbank.

**Imágenes.** Por defecto cada producto muestra una carta "holo" original generada con CSS/SVG. Para usar imágenes oficiales, el admin pega la URL `https://` en **Admin → Productos → Imagen**.

## Seguridad (OWASP Top 10)

| Control | Implementación |
|---|---|
| Inyección SQL/NoSQL | Prisma ORM (consultas parametrizadas) + validación de tipos con Zod |
| XSS | `sanitizeText()` elimina todo el HTML de los inputs; React escapa la salida; `escapeHtml()` en correos |
| CSRF | Double-submit cookie + verificación de `Origin` en checkout, admin, wishlist, registro y colecciones; NextAuth trae su propio CSRF |
| Fuerza bruta | Rate limit de **5 intentos/minuto** por IP y por cuenta en login y registro |
| Contraseñas | bcrypt con **cost factor 12**, política de contraseña robusta y comparación en tiempo constante |
| Dependencias | `npm audit` sin vulnerabilidades, bloqueante en CI; Dependabot semanal |
| Correo | SMTP con STARTTLS obligatorio y TLS ≥ 1.2 |
| Headers | CSP con nonce por request (en `src/proxy.ts`), HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy (equivalente a Helmet) |
| Control de acceso | Middleware por rol + revalidación del rol contra la BD en cada acción admin |
| Subidas | Validación por magic bytes (JPG/PNG/WEBP), máx. 5 MB, nombres generados por el servidor, guardadas fuera de `/public` y servidas solo al admin |
| Lógica de negocio | Precios y stock recalculados en el servidor dentro de una transacción; el cliente nunca define el precio |
| Enumeración | Registro y login responden igual exista o no la cuenta |

### Pruebas

```bash
npm test
```

59 pruebas en `tests/` cubren:
- precios
- rate limiting (el 6º intento se bloquea)
- payloads XSS
- CSRF, incluido un origen atacante
- bcrypt cost ≥ 12
- validación anti-inyección
- archivos disfrazados
- headers y CSP

El workflow de GitHub Actions (`.github/workflows/ci.yml`) corre las pruebas y el build en cada push.

## Producción

- Cambia `DATABASE_URL` a PostgreSQL (`provider = "postgresql"` en `prisma/schema.prisma`).
- Para varias instancias, reemplaza el rate limiter en memoria por Redis/Upstash.
- Pasa Webpay a producción con tus credenciales de Transbank (ver sección Pagos).
- Configura los callbacks OAuth: `https://TU-DOMINIO/api/auth/callback/google` y `/facebook`.
