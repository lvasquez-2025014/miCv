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

## Despliegue en Vercel

El proyecto ya incluye `vercel.json` listo para importar directamente desde GitHub:

1. Importa este repositorio en [Vercel](https://vercel.com/new).
2. Vercel detectará automáticamente **Vite** y aplicará `vercel.json` (`pnpm install --frozen-lockfile`, `pnpm run build`, salida en `dist`).
3. En **Settings → Environment Variables**, agrega `ENABLE_EXPERIMENTAL_COREPACK=1` para garantizar que Vercel utilice exactamente `pnpm@12.9.1` definido en `package.json`.
4. Pulsa **Deploy**.

