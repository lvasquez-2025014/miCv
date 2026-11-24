/**
 * Selectores y normalizadores del portafolio Liquid Glass.
 * Transforman la configuración editable en modelos limpios para cada sección
 * y generan automáticamente las hojas interactivas internas de cada GlassFolder.
 */

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

const isValidUrl = (value) => {
  const url = clean(value);
  if (!url) return false;
  return (
    url.startsWith('https://') ||
    url.startsWith('http://') ||
    url.startsWith('mailto:') ||
    url.startsWith('/') ||
    url.startsWith('#')
  );
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value));

const normalizeStatement = (statement) => {
  if (typeof statement === 'string') {
    return { lead: clean(statement), accent: '' };
  }
  if (statement && typeof statement === 'object') {
    return {
      lead: clean(statement.lead),
      accent: clean(statement.accent),
    };
  }
  return { lead: '', accent: '' };
};

function buildFolderFiles(project) {
  const firstShot = project.gallery[0];
  return [
    {
      kind: 'preview',
      name: project.title,
      meta: project.embedUrl ? 'Vista en vivo' : project.year || 'Ver proyecto',
      image: project.coverImage || firstShot?.image || undefined,
      art: !project.coverImage && !firstShot?.image ? firstShot?.art || project.art : undefined,
    },
  ];
}

function normalizeProjects(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && typeof item === 'object' && clean(item.title))
    .map((item, idx) => {
      const gallery = Array.isArray(item.gallery)
        ? item.gallery
          .filter((g) => g && typeof g === 'object')
          .map((g, gIdx) => ({
            title: clean(g.title) || `Vista ${gIdx + 1}`,
            caption: clean(g.caption),
            embedUrl: isValidUrl(g.embedUrl) ? clean(g.embedUrl) : '',
            image: isValidUrl(g.image) ? clean(g.image) : '',
            art: clean(g.art) || clean(item.art) || 'voidStorm',
          }))
        : [];

      const project = {
        id: clean(item.id) || `proyecto-${idx + 1}`,
        indexLabel: String(idx + 1).padStart(2, '0'),
        title: clean(item.title),
        year: clean(item.year),
        category: clean(item.category) || 'Proyecto',
        summary: clean(item.summary),
        description: clean(item.description),
        credits: clean(item.credits),
        role: clean(item.role),
        technologies: Array.isArray(item.technologies)
          ? item.technologies.map(clean).filter(Boolean)
          : [],
        coverImage: isValidUrl(item.coverImage) ? clean(item.coverImage) : '',
        embedUrl: isValidUrl(item.embedUrl) ? clean(item.embedUrl) : '',
        gallery,
        repoUrl: isValidUrl(item.repoUrl) ? clean(item.repoUrl) : '',
        liveUrl: isValidUrl(item.liveUrl) ? clean(item.liveUrl) : '',
        art: clean(item.art) || 'voidStorm',
        seed: typeof item.seed === 'number' ? item.seed : (idx + 1) * 13,
        tone: item.tone === 'light' ? 'light' : 'dark',
        isPlaceholder: Boolean(item.isPlaceholder),
      };

      return {
        ...project,
        folderFiles: buildFolderFiles(project),
      };
    });
}

export function selectPortfolioViewModel(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const idRaw = safe.identity || {};

  const name = clean(idRaw.name);
  const cleanNameForMonogram = name.replace(/[\[\]]/g, '').trim();
  const monogram =
    clean(idRaw.monogram) ||
    (!idRaw.isPlaceholder && cleanNameForMonogram
      ? cleanNameForMonogram
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('')
      : '');

  const rawStatement = normalizeStatement(idRaw.statement);
  const statement =
    rawStatement.lead || rawStatement.accent
      ? rawStatement
      : { lead: name || 'Portafolio creativo', accent: '' };

  const identity = {
    name,
    monogram,
    introLogo: clean(idRaw.introLogo),
    role: clean(idRaw.role),
    sceneTag: clean(idRaw.sceneTag),
    statement,
    intro: clean(idRaw.intro),
    availability: clean(idRaw.availability),
    location: clean(idRaw.location),
    isPlaceholder: Boolean(idRaw.isPlaceholder),
  };

  const projects = normalizeProjects(safe.projects);
  const projectCategories = Array.from(
    new Set(projects.map((p) => p.category).filter(Boolean))
  );

  const aboutRaw = safe.about || {};
  const about = {
    headline: clean(aboutRaw.headline),
    bio: clean(aboutRaw.bio),
    interests: Array.isArray(aboutRaw.interests)
      ? aboutRaw.interests
        .filter((i) => i && clean(i.title))
        .map((i, idx) => ({
          id: `interest-${idx + 1}`,
          indexLabel: String(idx + 1).padStart(2, '0'),
          title: clean(i.title),
          detail: clean(i.detail),
        }))
      : [],
    skillGroups: Array.isArray(aboutRaw.skillGroups)
      ? aboutRaw.skillGroups
        .filter((g) => g && clean(g.category) && Array.isArray(g.items))
        .map((g, idx) => ({
          id: `group-${idx + 1}`,
          category: clean(g.category),
          items: g.items.map(clean).filter(Boolean),
        }))
        .filter((g) => g.items.length > 0)
      : [],
    isPlaceholder: Boolean(aboutRaw.isPlaceholder),
  };

  const journeyRaw = safe.journey || {};
  const journey = {
    heading: clean(journeyRaw.heading) || 'Experiencia y aprendizaje',
    subtitle: clean(journeyRaw.subtitle),
    entries: Array.isArray(journeyRaw.entries)
      ? journeyRaw.entries
        .filter((e) => e && clean(e.title))
        .map((e, idx) => ({
          id: clean(e.id) || `etapa-${idx + 1}`,
          indexLabel: String(idx + 1).padStart(2, '0'),
          period: clean(e.period),
          kind: clean(e.kind),
          title: clean(e.title),
          summary: clean(e.summary),
          focus: Array.isArray(e.focus) ? e.focus.map(clean).filter(Boolean) : [],
          isPlaceholder: Boolean(e.isPlaceholder),
        }))
      : [],
  };

  const contactRaw = safe.contact || {};
  const rawEmail = clean(contactRaw.email);
  const contact = {
    headline: clean(contactRaw.headline) || 'Contacto',
    note: clean(contactRaw.note),
    email: rawEmail,
    emailIsReal: isValidEmail(rawEmail),
    socials: Array.isArray(contactRaw.socials)
      ? contactRaw.socials
        .filter((s) => s && clean(s.label))
        .map((s) => ({
          label: clean(s.label),
          handle: clean(s.handle),
          url: isValidUrl(s.url) ? clean(s.url) : '',
        }))
      : [],
    isPlaceholder: Boolean(contactRaw.isPlaceholder),
  };

  const sections = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'sobre-mi', label: 'Sobre mí' },
    { id: 'experiencia', label: 'Aprendizaje' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const metaRaw = safe.meta || {};
  const meta = {
    lang: clean(metaRaw.lang) || 'es',
    title:
      clean(metaRaw.title) ||
      [identity.isPlaceholder ? '' : identity.name, identity.role].filter(Boolean).join(' — ') ||
      'Portafolio — Creative Developer',
    description:
      clean(metaRaw.description) ||
      identity.intro ||
      'Portafolio interactivo Liquid Glass.',
  };

  const appreciationRaw = safe.appreciation || {};
  const appreciation = {
    enabled: appreciationRaw.enabled !== false,
    eyebrow: clean(appreciationRaw.eyebrow) || 'FEEDBACK · VALORACIÓN',
    headline: clean(appreciationRaw.headline) || '¿Te gustó el portafolio?',
    note:
      clean(appreciationRaw.note) ||
      'Deja una calificación con estrellas o un like si te gustó la experiencia.',
    storageKey: clean(appreciationRaw.storageKey) || 'void-portfolio-appreciation-v1',
    endpoint: isValidUrl(appreciationRaw.endpoint) ? clean(appreciationRaw.endpoint) : '',
  };

  return {
    meta,
    identity,
    projects,
    projectCategories,
    about,
    journey,
    contact,
    appreciation,
    sections,
  };
}
