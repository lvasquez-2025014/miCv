/**
 * Configuración central del portafolio.
 *
 * Edita únicamente este archivo para completar tus datos reales.
 * Los elementos marcados con `isPlaceholder: true` son espacios identificables
 * para que puedas probar toda la experiencia (incluido GlassFolder) sin inventar
 * información personal, experiencia laboral ni métricas falsas.
 */

export const portfolio = {
  meta: {
    lang: 'es',
    title: 'Void*',
    description:
      'Portafolio interactivo con estética Liquid Glass, dirección cinematográfica y proyectos explorables.',
  },

  identity: {
    /** Reemplaza por tu nombre real o firma profesional. */
    name: 'Ludwing X AI',
    monogram: '',
    /** Opcional: pega aquí un SVG (<svg>...</svg>) o URL de tu propio logo para la animación inicial Glass Reveal. */
    introLogo: '',
    role: 'Portafolio · 2026 (BETA)',
    sceneTag: '',
    statement: {
      lead: 'Dev.Jr',
      accent: 'en proceso.',
    },
    intro:
      'Aprendiendo, construyendo proyectos reales y puliendo cada detalle paso a paso.',
    availability: '',
    location: '',
    isPlaceholder: false,
  },

  /**
   * Proyectos explorables mediante GlassFolder.
   *
   * Para añadir tus proyectos reales:
   * 1. Sustituye título, resumen, descripción y tecnologías confirmadas.
   * 2. Coloca tus capturas en `public/projects/` y enlázalas en `coverImage` y `gallery`.
   * 3. Añade `repoUrl` y `liveUrl` (si existe demo).
   * 4. Cambia `isPlaceholder` a `false` (o elimínalo).
   *
   * Presets de arte líquido disponibles para GlassFolder:
   * 'voidStorm' | 'eclipseAsh' | 'overcast' | 'monarch' | 'shadowInk' | 'systemFrost' | 'glacier' | 'twilight' | 'aurora' | 'dusk' | 'ember'
   */
  projects: [
    {
      id: 'literatura-proyect',
      title: 'Literatura Proyect',
      year: '2026',
      category: 'Readme and Readline',
      summary:
        'Plataforma educativa diseñada para impulsar la comprensión lectora y el aprendizaje general en alumnos de cualquier nivel académico.',
      description:
        'Integra seguimiento continuo de progreso y tabla de posiciones (ranking) para mantener la motivación, además de un modo historia con más de 30 niveles repletos de lecturas variadas y desafíos interactivos.',
      credits: 'Este proyecto fue hecho por Ludwing, Estaban, Gahel',
      role: '',
      technologies: [],
      coverImage: '/projects/literatura-proyect.jpg',
      embedUrl: 'https://literatura-proyect.vercel.app',
      gallery: [
        {
          title: 'Vista en vivo',
          caption: 'Aplicación interactiva en tiempo real desde literatura-proyect.vercel.app.',
          embedUrl: 'https://literatura-proyect.vercel.app',
          image: '/projects/literatura-proyect.jpg',
          art: 'voidStorm',
        },
        {
          title: 'Captura principal',
          caption: 'Pantalla de inicio — Readme and Readline: lee, aprende y avanza hacia el éxito.',
          image: '/projects/literatura-proyect.jpg',
          art: 'overcast',
        },
      ],
      repoUrl: '',
      liveUrl: 'https://literatura-proyect.vercel.app',
      art: 'voidStorm',
      seed: 11,
      tone: 'dark',
      isPlaceholder: false,
    },
    {
      id: 'oficial-auth',
      title: 'Oficial Auth',
      year: '2026',
      category: 'Auth & Licencias',
      summary:
        'Sistema administrador de aplicaciones con sistema de creación de usuarios y licencias, pensado especialmente para proyectos hechos en C++ con libcurl.',
      description:
        'Panel centralizado para administrar aplicaciones, generar y validar licencias y controlar el acceso de usuarios mediante API, listo para integrarse en proyectos desarrollados en C++ con libcurl.',
      role: '',
      technologies: ['C++', 'libcurl'],
      coverImage: '/projects/oficial-auth.jpg',
      embedUrl: '',
      gallery: [
        {
          title: 'Oficial Auth',
          caption: 'Pantalla de acceso — administrador de aplicaciones, usuarios y licencias.',
          image: '/projects/oficial-auth.jpg',
          art: 'eclipseAsh',
        },
      ],
      repoUrl: '',
      liveUrl: 'https://api-frontend-navy.vercel.app/',
      art: 'eclipseAsh',
      seed: 23,
      tone: 'dark',
      isPlaceholder: false,
    },
    {
      id: 'alexshop',
      title: 'AlexShop',
      year: '2026',
      status: 'En desarrollo',
      category: 'Tienda Digital',
      summary:
        'Esta aplicacion web esta pensada para realizar compras de diamantes para el juego ff donde se automatizan',
      description:
        'Actualmente esta en desarrollo aun faltan funciones UI/UX por definir, esta es una beta de como se llegaria a ver y a funcionar',
      role: '',
      technologies: [],
      coverImage: '/projects/alexshop.jpg',
      embedUrl: 'https://www.alexshop.pro',
      gallery: [
        {
          title: 'Vista en vivo',
          caption: 'Aplicación interactiva en tiempo real desde www.alexshop.pro.',
          embedUrl: 'https://www.alexshop.pro',
          image: '/projects/alexshop.jpg',
          art: 'overcast',
        },
        {
          title: 'Captura principal',
          caption: 'Pantalla de acceso de AlexShop — plataforma en desarrollo.',
          image: '/projects/alexshop.jpg',
          art: 'eclipseAsh',
        },
      ],
      repoUrl: '',
      liveUrl: 'https://www.alexshop.pro',
      art: 'overcast',
      seed: 37,
      tone: 'dark',
      isPlaceholder: false,
    },
  ],

  /**
   * Sección Sobre mí — Pendiente de personalizar paso a paso.
   */
  about: {
    headline: '',
    bio: '',
    interests: [],
    skillGroups: [],
    isPlaceholder: false,
  },

  /**
   * Sección Aprendizaje — Pendiente de personalizar paso a paso.
   */
  journey: {
    heading: '',
    subtitle: '',
    entries: [],
  },

  /**
   * Sección Contacto — Pendiente de personalizar paso a paso.
   */
  contact: {
    headline: '',
    note: '',
    email: '',
    socials: [],
    isPlaceholder: false,
  },

  /**
   * Sistema de Likes y Estrellas (1–5 ★) para visitantes.
   * - Conectado a `/api/appreciation` (Vercel Serverless Function + MongoDB Atlas) para que
   *   cualquier visitante vea y acumule los likes globales en tiempo real.
   * - Si aún no hay `MONGODB_URI` configurada o se ejecuta sin backend local, usa respaldo
   *   automático en `localStorage` sin inventar contadores.
   */
  appreciation: {
    enabled: true,
    eyebrow: 'FEEDBACK · VALORACIÓN',
    headline: '¿Te gustó el portafolio?',
    note: 'Deja una calificación con estrellas o un like si te gustó la experiencia.',
    storageKey: 'void-portfolio-appreciation-v1',
    endpoint: '/api/appreciation',
  },
};

export default portfolio;
