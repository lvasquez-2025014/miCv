# Portafolio Interactivo — The Void Storm × Smoked Liquid Glass

Portafolio web interactivo construido con **React 19**, **Vite 6**, **Framer Motion**, **GSAP** y shaders **WebGL / WebGL2**, gestionado con **pnpm**.

## Características principales

- **Apertura WebGL2 (`GlassIconReveal`)**: refracción óptica con dispersión cromática en vidrio ahumado oscuro.
- **Hero Cinematográfico 4K (`HyperframesHeroStage`)**: escena de *The Void* en 4K con levitación GSAP, humo oscuro de vacío, rayos volumétricos de tormenta, destellos en los ojos y brasas reactivas al puntero.
- **Barra flotante líquida (`LiquidNavbar`)**: navegación tipo gota de agua en WebGL con ondas interactivas y sonido cristalino opcional.
- **Galería de proyectos (`GlassFolder`)**: carpetas interactivas multicapa de cristal líquido con 1 tarjeta por carpeta y modal con soporte para **`<iframe>` interactivo en vivo** (como *Literatura Proyect*).
- **Sistema de Estrellas (1–5 ★) y Likes (♥)**: sincronizado entre el Hero, el modal de proyectos y la barra inferior, con persistencia en `localStorage` y soporte opcional para endpoint remoto (`appreciation.endpoint`).

## Desarrollo local

```bash
pnpm install
pnpm dev
```

Compilación de producción y vista previa:

```bash
pnpm build
pnpm preview
```

## Personalización rápida

Todo el contenido editable (nombre, proyectos, enlaces, experiencia, contacto y endpoint opcional de likes) está centralizado en:

- `src/data/portfolio.js`

## Despliegue en Vercel y MongoDB Atlas

El proyecto incluye `vercel.json` y la función serverless `api/appreciation.js` lista para guardar likes y calificaciones globales en **MongoDB Atlas**:

1. Crea un clúster gratuito (M0) en [MongoDB Atlas](https://www.mongodb.com/atlas), habilita acceso de red `0.0.0.0/0` y copia tu cadena de conexión (`MONGODB_URI`).
2. Importa este repositorio en [Vercel](https://vercel.com/new) — Vercel detectará automáticamente **Vite** y aplicará `vercel.json` (`pnpm install --frozen-lockfile`, `pnpm run build`, salida en `dist`).
3. En **Settings → Environment Variables**, agrega:
   - `ENABLE_EXPERIMENTAL_COREPACK` = `1`
   - `MONGODB_URI` = tu cadena `mongodb+srv://...`
   - `MONGODB_DB` = `portfolio_cv` *(opcional)*
4. Pulsa **Deploy**. Cualquier visitante verá y acumulará en tiempo real los likes y estrellas globales guardados en MongoDB.

