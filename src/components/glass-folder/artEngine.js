/**
 * Motor procedural de arte líquido para GlassFolder y superficies Liquid Glass.
 * Conserva el algoritmo original de ruido FBM con doble deformación de dominio,
 * sobremuestreo Catmull-Rom, sombreado especular y cola compartida por presupuesto de frame.
 */

export const ART_PRESETS = {
  // Recetas The Void Storm (Vacío Obsidiana + Nubes Gris Salvia + Brasas Tenues)
  voidStorm: {
    style: 'marble',
    colors: ['#040607', '#0e1518', '#263435', '#516360', '#8b9b96', '#c8dcd8', '#090d0f'],
    scale: 0.68,
    warp: 3.15,
    angle: -0.52,
    gloss: 0.52,
    veins: 0.58,
  },
  eclipseAsh: {
    style: 'streak',
    colors: ['#030506', '#10181a', '#2c3a3a', '#687976', '#b8c9c5', '#d9b58a', '#0c1214'],
    scale: 0.7,
    warp: 1.9,
    angle: -0.34,
    gloss: 0.38,
    veins: 0.42,
  },
  overcast: {
    style: 'marble',
    colors: ['#050809', '#131c1e', '#324242', '#647674', '#9eb2ae', '#e2ecea', '#101719'],
    scale: 0.72,
    warp: 2.8,
    angle: 0.48,
    gloss: 0.46,
    veins: 0.48,
  },

  // Recetas originales de GlassFolder
  aurora: {
    style: 'streak',
    colors: ['#f4efe9', '#e9c2b8', '#c2433f', '#2a1e2a', '#22395e', '#6f97c2', '#e5edf4'],
    scale: 0.7,
    warp: 1.4,
    angle: -0.62,
    gloss: 0.18,
    veins: 0,
  },
  ember: {
    style: 'marble',
    colors: ['#07090c', '#16252c', '#3d5f68', '#1a1416', '#a3201a', '#ef4a2b', '#ff8a5c'],
    scale: 0.62,
    warp: 3.2,
    angle: -0.5,
    gloss: 0.55,
    veins: 0.6,
  },
  dusk: {
    style: 'marble',
    colors: ['#120c18', '#3e2850', '#8f6c9c', '#2b1a24', '#b3502f', '#eab08a', '#fbe7d2'],
    scale: 0.75,
    warp: 3.6,
    angle: 0.8,
    gloss: 0.5,
    veins: 0.5,
  },
  glacier: {
    style: 'streak',
    colors: ['#f7f8fa', '#d9e2ea', '#9fb4c7', '#e8edf2', '#bccbd8', '#ffffff'],
    scale: 0.7,
    warp: 1.6,
    angle: 0.35,
    gloss: 0.25,
    veins: 0,
  },
  verdant: {
    style: 'marble',
    colors: ['#070b08', '#173024', '#4f7a5a', '#141812', '#a7843a', '#e9cf87', '#fbf3d6'],
    scale: 0.7,
    warp: 3.4,
    angle: 2.1,
    gloss: 0.5,
    veins: 0.5,
  },

  // Recetas cinematográficas anime (Gris Plata + Tinta Sumi + Azul Cobalto)
  monarch: {
    style: 'marble',
    colors: ['#d6dddc', '#aeb8b7', '#354346', '#0a0e10', '#0f62fe', '#5aa8ff', '#ced7dc'],
    scale: 0.68,
    warp: 3.1,
    angle: -0.55,
    gloss: 0.54,
    veins: 0.6,
  },
  shadowInk: {
    style: 'streak',
    colors: ['#d8dfde', '#b1bbba', '#4e5c5e', '#161e20', '#070a0c', '#0f62fe', '#c8dcf0'],
    scale: 0.72,
    warp: 1.75,
    angle: -0.32,
    gloss: 0.34,
    veins: 0.45,
  },
  systemFrost: {
    style: 'marble',
    colors: ['#d7dfde', '#b8c8d4', '#506575', '#131b1f', '#0a0e12', '#1d7afc', '#a8cceb'],
    scale: 0.7,
    warp: 2.75,
    angle: 0.52,
    gloss: 0.48,
    veins: 0.4,
  },

  // Recetas crepusculares adicionales
  twilight: {
    style: 'streak',
    colors: ['#080d1d', '#16284c', '#3b649c', '#8bc8ff', '#d8c5df', '#f1a188', '#fde4d8'],
    scale: 0.66,
    warp: 1.85,
    angle: -0.52,
    gloss: 0.34,
    veins: 0.14,
  },
  sakuraMist: {
    style: 'marble',
    colors: ['#0b0f1f', '#21294a', '#5b6b9e', '#968ec7', '#d49ea8', '#f4c0b1', '#fbf1ec'],
    scale: 0.72,
    warp: 2.8,
    angle: 0.48,
    gloss: 0.44,
    veins: 0.25,
  },
  moonlight: {
    style: 'marble',
    colors: ['#060a14', '#101d35', '#23426e', '#5890c7', '#9dd1ff', '#e4f0ff'],
    scale: 0.68,
    warp: 2.6,
    angle: -0.78,
    gloss: 0.48,
    veins: 0.32,
  },
};

export function hexToRgb(hex) {
  let h = String(hex || '').trim().replace(/^#/, '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = /^[0-9a-f]{6}$/i.test(h) ? parseInt(h, 16) : 0x808080;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

export function fanSlot(index, count) {
  return count <= 1 ? 0 : (index / (count - 1)) * 2 - 1;
}

export function recipeOf(art) {
  if (typeof art === 'string') {
    return ART_PRESETS[art] || ART_PRESETS.voidStorm;
  }
  return art && typeof art === 'object' ? art : ART_PRESETS.voidStorm;
}

function makeFbm(seed) {
  const r = rng(seed);
  const perm = new Uint8Array(512);
  const grad = new Float32Array(512);
  const p = [];
  for (let i = 0; i < 256; i++) p.push(i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = p[i];
    p[i] = p[j];
    p[j] = t;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  for (let i = 0; i < 256; i++) {
    const a = r() * Math.PI * 2;
    grad[i * 2] = Math.cos(a);
    grad[i * 2 + 1] = Math.sin(a);
  }

  const noise = (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const h00 = perm[X + perm[Y]] * 2;
    const h10 = perm[X + 1 + perm[Y]] * 2;
    const h01 = perm[X + perm[Y + 1]] * 2;
    const h11 = perm[X + 1 + perm[Y + 1]] * 2;
    const d00 = grad[h00] * xf + grad[h00 + 1] * yf;
    const d10 = grad[h10] * (xf - 1) + grad[h10 + 1] * yf;
    const d01 = grad[h01] * xf + grad[h01 + 1] * (yf - 1);
    const d11 = grad[h11] * (xf - 1) + grad[h11 + 1] * (yf - 1);
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    return d00 + u * (d10 - d00) + v * (d01 - d00 + u * (d11 - d01 - d10 + d00));
  };

  return (x, y, octaves) => {
    let sum = 0;
    let amp = 0.5;
    let cx = x;
    let cy = y;
    for (let i = 0; i < octaves; i++) {
      sum += amp * noise(cx, cy);
      const nx = 1.6 * cx + 1.2 * cy + 7.1;
      cy = -1.2 * cx + 1.6 * cy + 3.3;
      cx = nx;
      amp *= 0.5;
    }
    return sum;
  };
}

export function createArtJob(width, height, recipe, seed) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const colors = Array.isArray(recipe.colors) && recipe.colors.length >= 2
    ? recipe.colors
    : ['#0b1020', '#8bc8ff'];
  const stops = colors.map((c, i) => ({ t: i / (colors.length - 1), c: hexToRgb(c) }));
  const scale = recipe.scale ?? 0.7;
  const warp = recipe.warp ?? 3;
  const gloss = recipe.gloss ?? 0.4;
  const veins = recipe.veins ?? 0;
  const streak = recipe.style === 'streak';

  const fbm = makeFbm(seed * 977 + 13);
  const r = rng(seed + 1);
  const ox = r() * 50;
  const oy = r() * 50;
  const angle = (recipe.angle ?? 0) + (r() - 0.5) * 0.5;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const m = Math.min(w, h);

  const gw = Math.ceil(w / 2) + 3;
  const gh = Math.ceil(h / 2) + 3;
  const G = new Float32Array(gw * gh);
  const GQ = new Float32Array(gw * gh);
  const F = new Float32Array(w * h);
  const Q = new Float32Array(w * h);
  const pixels = new Uint8ClampedArray(w * h * 4);
  let row = 0;

  const field = (gy) => {
    for (let gx = 0; gx < gw; gx++) {
      const u = ((gx - 1) * 2 - w / 2) / m;
      const v = ((gy - 1) * 2 - h / 2) / m;
      let px = (u * ca - v * sa) * scale;
      let py = (u * sa + v * ca) * scale;
      if (streak) {
        px *= 0.14;
        py *= 2.2;
      }
      px += ox;
      py += oy;
      const qx = fbm(px, py, 3);
      const qy = fbm(px + 5.2, py + 1.3, 3);
      const rx = fbm(px + warp * qx + 1.7, py + warp * qy + 9.2, 3);
      const ry = fbm(px + warp * qx + 8.3, py + warp * qy + 2.8, 3);
      G[gy * gw + gx] = fbm(px + warp * rx, py + warp * ry, 4);
      GQ[gy * gw + gx] = Math.sqrt(qx * qx + qy * qy);
    }
  };

  const upsample = () => {
    const cr = (a, b, c, d) => (-a + 9 * b + 9 * c - d) / 16;
    const T = new Float32Array(w * gh);

    for (let gy = 0; gy < gh; gy++) {
      const rOff = gy * gw;
      for (let x = 0; x < w; x++) {
        const c = (x >> 1) + 1;
        T[gy * w + x] =
          x & 1
            ? cr(G[rOff + c - 1], G[rOff + c], G[rOff + c + 1], G[rOff + c + 2])
            : G[rOff + c];
      }
    }

    for (let y = 0; y < h; y++) {
      const c = (y >> 1) + 1;
      for (let x = 0; x < w; x++) {
        F[y * w + x] =
          y & 1
            ? cr(T[(c - 1) * w + x], T[c * w + x], T[(c + 1) * w + x], T[(c + 2) * w + x])
            : T[c * w + x];
        const gx = (x >> 1) + 1;
        const q0 = GQ[c * gw + gx];
        const qx = x & 1 ? (q0 + GQ[c * gw + gx + 1]) / 2 : q0;
        const q1 =
          y & 1
            ? x & 1
              ? (GQ[(c + 1) * gw + gx] + GQ[(c + 1) * gw + gx + 1]) / 2
              : GQ[(c + 1) * gw + gx]
            : qx;
        Q[y * w + x] = (qx + q1) / 2;
      }
    }
  };

  const colorize = () => {
    const sample = [];
    const stride = Math.max(1, Math.floor(F.length / 4096));
    for (let i = 0; i < F.length; i += stride) sample.push(F[i]);
    sample.sort((a, b) => a - b);

    const lo = sample[Math.floor(sample.length * 0.02)] ?? 0;
    const hi = sample[Math.floor(sample.length * 0.98)] ?? 1;
    const k = 1 / (hi - lo || 1);
    const lx = -0.55;
    const ly = -0.65;
    const lz = 0.52;
    const slope = k * m * 0.012;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        let t = (F[i] - lo) * k;
        t = t < 0 ? 0 : t > 1 ? 1 : t;

        let j = 1;
        while (j < stops.length - 1 && stops[j].t < t) j++;
        const a = stops[j - 1];
        const b = stops[j];
        let f = (t - a.t) / (b.t - a.t || 1);
        f = f < 0 ? 0 : f > 1 ? 1 : f;
        f = f * f * (3 - 2 * f);

        const gx = (F[x < w - 1 ? i + 1 : i] - F[x > 0 ? i - 1 : i]) * slope;
        const gy = (F[y < h - 1 ? i + w : i] - F[y > 0 ? i - w : i]) * slope;
        const nd = (-gx * lx - gy * ly + lz) / Math.sqrt(gx * gx + gy * gy + 1);
        const spec = Math.pow(nd > 0 ? nd : 0, 24) * gloss * 255;
        const silk = 1 + 0.035 * Math.sin(t * 150 + Q[i] * 24);
        const vein = veins * Math.max(0, 1 - Math.abs(Q[i] - 0.42) * 14) * 0.6;
        const lit = (0.82 + 0.28 * nd) * silk * (1 - vein);

        pixels[i * 4] = (a.c[0] + (b.c[0] - a.c[0]) * f) * lit + spec;
        pixels[i * 4 + 1] = (a.c[1] + (b.c[1] - a.c[1]) * f) * lit + spec;
        pixels[i * 4 + 2] = (a.c[2] + (b.c[2] - a.c[2]) * f) * lit + spec;
        pixels[i * 4 + 3] = 255;
      }
    }
  };

  const step = (rows) => {
    if (row >= gh) return true;
    const end = Math.min(gh, row + Math.max(1, rows));
    while (row < end) field(row++);
    if (row < gh) return false;
    upsample();
    colorize();
    return true;
  };

  return { width: w, height: h, pixels, step };
}

// Cola compartida con presupuesto de 7ms/frame para evitar bloqueos de interfaz
const artCache = new Map();
const queue = [];
let pumping = false;

function pump() {
  if (pumping || typeof requestAnimationFrame === 'undefined') return;
  pumping = true;

  const tick = () => {
    const until = performance.now() + 7;
    while (queue.length && performance.now() < until) {
      const head = queue[0];
      if (head.job.step(4)) {
        queue.shift();
        const canvas = document.createElement('canvas');
        canvas.width = head.job.width;
        canvas.height = head.job.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(
            new ImageData(head.job.pixels, canvas.width, canvas.height),
            0,
            0
          );
        }
        head.done(canvas);
      }
    }

    if (queue.length) {
      requestAnimationFrame(tick);
    } else {
      pumping = false;
    }
  };

  requestAnimationFrame(tick);
}

export function paintLiquidArt(recipe, seed, width, height, priority = 0) {
  if (typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  const key = JSON.stringify([recipe, seed, width, height]);
  let promise = artCache.get(key);

  if (!promise) {
    promise = new Promise((done) => {
      let at = queue.length;
      while (at > 1 && queue[at - 1].priority > priority) at--;
      queue.splice(at, 0, {
        job: createArtJob(width, height, recipe, seed),
        priority,
        done,
      });
      pump();
    });
    artCache.set(key, promise);
  }

  return promise;
}

