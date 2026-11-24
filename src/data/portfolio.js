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
    title: 'Portafolio — Creative Developer',
    description:
      'Portafolio interactivo con estética Liquid Glass, dirección cinematográfica y proyectos explorables.',
  },

  identity: {
    /** Reemplaza por tu nombre real o firma profesional. */
    name: '[Tu Nombre]',
    monogram: '',
    /** Opcional: pega aquí un SVG (<svg>...</svg>) o URL de tu propio logo para la animación inicial Glass Reveal. */
    introLogo: '',
    role: 'Creative Developer · Frontend & IA',
    sceneTag: 'BEYOND THE SYSTEM · 2026',
    statement: {
      lead: 'Interfaces de vidrio,',
      accent: 'código con precisión.',
    },
    intro:
      'Construyo experiencias web interactivas donde la ingeniería frontend, la dirección visual y la inteligencia artificial conviven en un mismo sistema.',
    availability: '[Disponibilidad por definir]',
    location: '[Ciudad / Remoto]',
    isPlaceholder: true,
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
      credits: 'Hecho por Ludwing, Estaban, Gahel',
      role: '',
      technologies: [],
      coverImage: '/projects/literatura-proyect.png',
      embedUrl: 'https://literatura-proyect.vercel.app',
      gallery: [
        {
          title: 'Vista en vivo',
          caption: 'Aplicación interactiva en tiempo real desde literatura-proyect.vercel.app.',
          embedUrl: 'https://literatura-proyect.vercel.app',
          image: '/projects/literatura-proyect.png',
          art: 'voidStorm',
        },
        {
          title: 'Captura principal',
          caption: 'Pantalla de inicio — Readme and Readline: lee, aprende y avanza hacia el éxito.',
          image: '/projects/literatura-proyect.png',
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
      id: 'proyecto-02',
      title: '[Proyecto 02 · Experiencia Web]',
      year: '2026',
      category: 'Frontend Creativo',
      summary:
        'Espacio reservado para una interfaz interactiva con foco en diseño visual, movimiento y rendimiento.',
      description:
        'Explica brevemente el reto de diseño, la estructura de componentes y cómo lograste una experiencia fluida en escritorio y móvil.',
      role: '[Tu rol en el proyecto]',
      technologies: ['[Tecnología 1]', '[Tecnología 2]', '[Tecnología 3]'],
      coverImage: '',
      gallery: [
        {
          title: 'Escena principal',
          caption: 'Reemplaza por una captura del proyecto publicado.',
          image: '',
          art: 'eclipseAsh',
        },
        {
          title: 'Sistema de diseño',
          caption: 'Componentes reutilizables y microinteracciones.',
          image: '',
          art: 'voidStorm',
        },
      ],
      repoUrl: '',
      liveUrl: '',
      art: 'eclipseAsh',
      seed: 23,
      tone: 'dark',
      isPlaceholder: true,
    },
    {
      id: 'proyecto-03',
      title: '[Proyecto 03 · Sistema / Herramienta]',
      year: '2025',
      category: 'Arquitectura Web',
      summary:
        'Espacio reservado para una herramienta, automatización o producto digital desarrollado por ti.',
      description:
        'Resume el objetivo práctico del sistema, las decisiones técnicas clave y lo que aprendiste durante su desarrollo.',
      role: '[Tu rol en el proyecto]',
      technologies: ['[Tecnología 1]', '[Tecnología 2]'],
      coverImage: '',
      gallery: [
        {
          title: 'Panel principal',
          caption: 'Espacio para captura real de la aplicación.',
          image: '',
          art: 'overcast',
        },
        {
          title: 'Estructura técnica',
          caption: 'Vista de arquitectura o flujo de datos.',
          image: '',
          art: 'eclipseAsh',
        },
      ],
      repoUrl: '',
      liveUrl: '',
      art: 'overcast',
      seed: 37,
      tone: 'dark',
      isPlaceholder: true,
    },
  ],

  /**
   * Sección Sobre mí — Enfoque editorial y habilidades por confirmar.
   */
  about: {
    headline: 'Construir software que se sienta como un espacio cuidado.',
    bio: '[Completa aquí tu presentación personal en 2 o 3 frases claras: quién eres, qué te motiva a programar y qué tipo de experiencias disfrutas crear.]',
    interests: [
      {
        title: 'Diseño de interfaces',
        detail: 'Sistemas visuales coherentes, tipografía con carácter y tactilidad en cada transición.',
      },
      {
        title: 'Ingeniería frontend',
        detail: 'Arquitectura modular, accesibilidad real y rendimiento estable en cualquier pantalla.',
      },
      {
        title: 'Inteligencia artificial',
        detail: 'Integración de flujos generativos y asistentes útiles dentro de productos cotidianos.',
      },
    ],
    skillGroups: [
      {
        category: 'Frontend e Interacción',
        items: ['[Confirmar stack frontend, ej. React, Vite, CSS]'],
      },
      {
        category: 'Inteligencia Artificial',
        items: ['[Confirmar herramientas o APIs de IA que utilizas]'],
      },
      {
        category: 'Flujo y Diseño',
        items: ['[Confirmar herramientas de diseño, Git o backend]'],
      },
    ],
    isPlaceholder: true,
  },

  /**
   * Sección Experiencia y aprendizaje — Evolución sin inventar historial laboral.
   */
  journey: {
    heading: 'Evolución, práctica y aprendizaje continuo.',
    subtitle:
      'Sustituye cada capítulo por tus hitos reales: formación, proyectos clave, estudios o colaboraciones.',
    entries: [
      {
        id: 'etapa-01',
        period: '[Periodo / Etapa 01]',
        kind: 'Fundamentos',
        title: 'Bases de desarrollo web y pensamiento modular',
        summary:
          '[Describe tus primeros proyectos sólidos, cursos clave o el momento en que consolidaste tu base de desarrollo.]',
        focus: ['HTML semántico', 'CSS moderno', 'JavaScript'],
        isPlaceholder: true,
      },
      {
        id: 'etapa-02',
        period: '[Periodo / Etapa 02]',
        kind: 'Especialización',
        title: 'Interfaces interactivas, arquitectura de componentes y diseño',
        summary:
          '[Añade aquí cómo evolucionaste hacia aplicaciones React, sistemas de diseño, animaciones y experiencia de usuario.]',
        focus: ['React', 'Arquitectura UI', 'Movimiento y accesibilidad'],
        isPlaceholder: true,
      },
      {
        id: 'etapa-03',
        period: '[Periodo / Etapa 03]',
        kind: 'Exploración actual',
        title: 'Productos digitales impulsados por inteligencia artificial',
        summary:
          '[Detalla qué estás construyendo o investigando actualmente con IA, automatización o interfaces experimentales.]',
        focus: ['Flujos con IA', 'Prototipado creativo', 'Sistemas web'],
        isPlaceholder: true,
      },
    ],
  },

  /**
   * Sección Contacto — Reemplaza por tu correo y perfiles reales.
   */
  contact: {
    headline: 'Conversemos sobre tu próxima idea.',
    note: 'Abierto a proyectos creativos, colaboraciones técnicas y nuevas oportunidades.',
    email: '[tu-correo@dominio.com]',
    socials: [
      {
        label: 'GitHub',
        handle: '[github.com/tu-usuario]',
        url: '',
      },
      {
        label: 'LinkedIn',
        handle: '[linkedin.com/in/tu-usuario]',
        url: '',
      },
      {
        label: 'X / Portfolio',
        handle: '[enlace-opcional]',
        url: '',
      },
    ],
    isPlaceholder: true,
  },

  /**
   * Sistema de Likes y Estrellas (1–5 ★) para visitantes.
   * - Por defecto guarda el estado real en `localStorage` (sin inflar ni inventar contadores).
   * - Opcional: coloca en `endpoint` la URL de un servicio JSON (Cloudflare Worker, Supabase,
   *   Upstash/Vercel API) que acepte GET y POST para compartir contadores globales entre visitantes.
   */
  appreciation: {
    enabled: true,
    eyebrow: 'FEEDBACK · VALORACIÓN',
    headline: '¿Te gustó el portafolio?',
    note: 'Deja una calificación con estrellas o un like si te gustó la experiencia.',
    storageKey: 'void-portfolio-appreciation-v1',
    endpoint: '',
  },
};

export default portfolio;
