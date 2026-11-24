/**
 * Servicio de persistencia para el sistema de Likes y Estrellas.
 *
 * - Funciona de inmediato sin servidor usando localStorage + sincronización entre pestañas.
 * - No inventa ni infla contadores falsos (parte siempre de 0 en modo local).
 * - Si se configura `appreciation.endpoint` en `src/data/portfolio.js`, consulta y envía
 *   eventos reales (GET / POST JSON) con respaldo automático en localStorage.
 */

export const DEFAULT_STORAGE_KEY = 'void-portfolio-appreciation-v1';

export const EMPTY_APPRECIATION_STATE = Object.freeze({
  portfolioLiked: false,
  portfolioLikes: 0,
  userRating: 0,
  ratingSum: 0,
  ratingsCount: 0,
  projectLikes: {},
  likedProjects: {},
  projectViewClicks: {},
  clickedProjectViews: {},
  mode: 'local',
});

const clampRating = (value) => {
  const n = Math.round(Number(value) || 0);
  return n >= 1 && n <= 5 ? n : 0;
};

const nonNegInt = (value) => Math.max(0, Math.floor(Number(value) || 0));

export function normalizeAppreciationState(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      ...EMPTY_APPRECIATION_STATE,
      projectLikes: {},
      likedProjects: {},
      projectViewClicks: {},
      clickedProjectViews: {},
    };
  }

  const likedProjects = {};
  if (raw.likedProjects && typeof raw.likedProjects === 'object') {
    for (const [id, flag] of Object.entries(raw.likedProjects)) {
      if (flag) likedProjects[id] = true;
    }
  }

  const clickedProjectViews = {};
  if (raw.clickedProjectViews && typeof raw.clickedProjectViews === 'object') {
    for (const [key, flag] of Object.entries(raw.clickedProjectViews)) {
      if (flag) clickedProjectViews[key] = true;
    }
  }

  const isRemote = raw.mode === 'remote';

  const projectLikes = {};
  if (raw.projectLikes && typeof raw.projectLikes === 'object') {
    for (const [id, count] of Object.entries(raw.projectLikes)) {
      const safe = nonNegInt(count);
      if (safe > 0) projectLikes[id] = safe;
    }
  }
  if (!isRemote) {
    for (const id of Object.keys(likedProjects)) {
      if (!projectLikes[id]) projectLikes[id] = 1;
    }
  }

  const projectViewClicks = {};
  if (raw.projectViewClicks && typeof raw.projectViewClicks === 'object') {
    for (const [key, count] of Object.entries(raw.projectViewClicks)) {
      const safe = nonNegInt(count);
      if (safe > 0) projectViewClicks[key] = safe;
    }
  }
  if (!isRemote) {
    for (const key of Object.keys(clickedProjectViews)) {
      if (!projectViewClicks[key]) projectViewClicks[key] = 1;
    }
  }

  const portfolioLiked = Boolean(raw.portfolioLiked);
  const portfolioLikes = isRemote
    ? nonNegInt(raw.portfolioLikes)
    : Math.max(portfolioLiked ? 1 : 0, nonNegInt(raw.portfolioLikes));

  const userRating = clampRating(raw.userRating);
  const ratingsCount = isRemote
    ? nonNegInt(raw.ratingsCount)
    : Math.max(userRating > 0 ? 1 : 0, nonNegInt(raw.ratingsCount));
  const ratingSum = isRemote
    ? nonNegInt(raw.ratingSum)
    : Math.max(userRating, nonNegInt(raw.ratingSum));

  return {
    portfolioLiked,
    portfolioLikes,
    userRating,
    ratingSum,
    ratingsCount,
    projectLikes,
    likedProjects,
    projectViewClicks,
    clickedProjectViews,
    mode: isRemote ? 'remote' : 'local',
  };
}

export function readLocalAppreciation(storageKey = DEFAULT_STORAGE_KEY) {
  if (typeof window === 'undefined') return normalizeAppreciationState(null);
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return normalizeAppreciationState(null);
    return normalizeAppreciationState(JSON.parse(raw));
  } catch {
    return normalizeAppreciationState(null);
  }
}

export function writeLocalAppreciation(state, storageKey = DEFAULT_STORAGE_KEY) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Modo privado o cuota agotada: mantener estado en memoria
  }
}

export async function fetchRemoteAppreciation(endpoint, signal) {
  if (!endpoint || typeof fetch === 'undefined') return null;
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal,
    });
    if (!response.ok) {
      console.warn(`[appreciation] GET ${endpoint} respondió HTTP ${response.status}`);
      return null;
    }
    const ct = response.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return null;
    const data = await response.json();
    if (!data || typeof data !== 'object') return null;
    return {
      portfolioLikes: nonNegInt(data.portfolioLikes ?? data.likes),
      ratingSum: nonNegInt(data.ratingSum),
      ratingsCount: nonNegInt(data.ratingsCount),
      projectLikes:
        data.projectLikes && typeof data.projectLikes === 'object' ? data.projectLikes : {},
      projectViewClicks:
        data.projectViewClicks && typeof data.projectViewClicks === 'object'
          ? data.projectViewClicks
          : {},
    };
  } catch {
    return null;
  }
}

export async function sendRemoteAppreciation(endpoint, payload) {
  if (!endpoint || typeof fetch === 'undefined') return null;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.warn(`[appreciation] POST ${endpoint} respondió HTTP ${response.status}`);
      return null;
    }
    const ct = response.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return null;
    const data = await response.json().catch(() => null);
    if (!data || typeof data !== 'object') return null;
    return {
      portfolioLikes:
        data.portfolioLikes !== undefined || data.likes !== undefined
          ? nonNegInt(data.portfolioLikes ?? data.likes)
          : undefined,
      ratingSum: data.ratingSum !== undefined ? nonNegInt(data.ratingSum) : undefined,
      ratingsCount: data.ratingsCount !== undefined ? nonNegInt(data.ratingsCount) : undefined,
      projectLikes:
        data.projectLikes && typeof data.projectLikes === 'object' ? data.projectLikes : undefined,
      projectViewClicks:
        data.projectViewClicks && typeof data.projectViewClicks === 'object'
          ? data.projectViewClicks
          : undefined,
    };
  } catch {
    return null;
  }
}

let sharedAudioCtx = null;

/**
 * Destello sonoro cristalino ultra sutil (solo si el usuario activó Audio en el footer).
 */
export function playStarChime(step = 3) {
  if (typeof window === 'undefined') return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (sharedAudioCtx ||= new AC());
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const baseFreq = notes[Math.min(notes.length - 1, Math.max(0, step - 1))] || 659.25;

    const osc = ctx.createOscillator();
    const harm = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    harm.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.03, now + 0.14);
    harm.frequency.setValueAtTime(baseFreq * 2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.075, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(0.22, now);

    osc.connect(gain);
    harm.connect(harmGain).connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    harm.start(now);
    osc.stop(now + 0.26);
    harm.stop(now + 0.26);
  } catch {
    // Silencio si el navegador bloquea WebAudio
  }
}

