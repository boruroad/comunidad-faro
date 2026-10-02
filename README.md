# Comunidad F.A.R.O. - Sitio web

Sitio oficial de Comunidad F.A.R.O. migrado a Angular 20.

La app conserva la propuesta visual y de contenido del sitio original, con datos editables desde configuración y despliegue estático sencillo.

## Stack

- Angular 20
- TypeScript
- CSS

## Requisitos

- Node.js 20+ o 22+
- npm 10+

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
npm start
```

La app queda disponible en:

http://localhost:4200

## Scripts

- `npm start`: servidor de desarrollo con recarga automática
- `npm run build`: compilación de producción
- `npm run watch`: compilación en modo watch (development)
- `npm test`: pruebas unitarias (Karma/Jasmine)

## Estructura principal

```text
src/
	app/
		app.ts
		app.html
		faro-config.ts
	styles.css
public/
	assets/
	data/
	favicon/
	robots.txt
	sitemap.xml
```

## Configuración de contenido

La mayor parte del contenido editable está centralizada en:

- `src/app/faro-config.ts`

Ahí puedes ajustar:

- Información de reunión semanal
- Estado de transmisión en vivo
- Lanzamientos de música
- Newsletter y redes sociales
- Preguntas frecuentes

## Build para producción

```bash
npm run build
```

Salida generada en:

- `dist/faro-angular`

## Despliegue

Frontend y API se publican juntos, bajo el mismo dominio, con la misma estructura de
carpetas que en el repo:

- `dist/faro-angular/browser/*` (el build de Angular) se copia al docroot del hosting.
- La carpeta `api/` se copia completa junto al build (mismo nivel, como en local).
- El `.htaccess` incluido en el build (viene de `public/.htaccess`) enruta `/api/*` al
  front-controller `api/public/index.php` y hace fallback a `index.html` para las rutas
  de Angular (SPA routing).
- En el servidor, crea un `api/.env` real (no lo subas al repo) usando
  `api/.env.production.example` como referencia: credenciales de la base de datos,
  `FRONTEND_URL`, `MAIL_FROM_ADDRESS`, etc.
- Antes de la primera carga, corre el `ALTER`/schema pendiente en
  `api/database/migrations/` contra la base de datos de producción.

```bash
npm run build
```

Salida generada en `dist/faro-angular/browser` (usa automaticamente
`environment.production.ts`, que ya apunta a `https://faro.neitanworales.com`).

## Notas

- El proyecto incluye `.gitignore` para artefactos de Angular/Node y archivos locales.
- Si se actualiza contenido desde otra fuente, se recomienda mantener paridad editando `faro-config.ts` y validando con `npm run build`.
