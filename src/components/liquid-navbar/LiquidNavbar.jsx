import * as React from 'react';
import './LiquidNavbar.css';

/**
 * Nimbus UI · Liquid Navbar — "Waterline"
 * Cápsula de agua WebGL con gota activa elástica, separación en microgotas
 * en saltos largos, ondas reactivas al puntero/clic y microescenas por icono.
 * Incluye respaldo CSS automático si WebGL no está disponible.
 */

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

const wrapIcon = (children) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const NimbusIcons = {
  home: wrapIcon(
    <>
      <path d="M3.5 11.2 12 4l8.5 7.2" />
      <path d="M6 9.6V20h12V9.6" />
      <path className="nv-door" d="M10 20v-5h4v5Z" />
    </>
  ),
  folder: wrapIcon(
    <>
      <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4.2l2 2.2h6.8a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5Z" />
      <path d="M3.5 10.5h17" />
    </>
  ),
  globe: wrapIcon(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17" />
    </>
  ),
  plane: wrapIcon(
    <path d="M21 12.2 3.6 5.4l2.7 6.8-2.7 6.4L21 12.2Zm-14.7 0H13" />
  ),
  drop: wrapIcon(
    <path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z" />
  ),
  user: wrapIcon(
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20c1.2-3.4 4-5 7.2-5s6 1.6 7.2 5" />
    </>
  ),
};

const DEFAULT_ITEMS = [
  { label: 'Inicio', icon: NimbusIcons.home, fx: 'glow' },
  { label: 'Proyectos', icon: NimbusIcons.folder, fx: 'drop' },
  { label: 'Sobre mí', icon: NimbusIcons.user, fx: 'wave' },
  { label: 'Aprendizaje', icon: NimbusIcons.globe, fx: 'spin' },
  { label: 'Contacto', icon: NimbusIcons.plane, fx: 'plane' },
];

const PAD = 14;

/* ---------- WebGL Water Shader ---------- */
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uPill;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark);
 vec3 c=mix(vec3(0.,.14,.36),vec3(.02,.04,.05),uDark)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,mix(.5,.22,uDark)*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(.80,.95,1.),vec3(.70,.80,.78),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
 float la=rim*.22;vec3 lc=mix(vec3(0.,.42,.78),vec3(.50,.64,.62),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,mix(.35,.18,uDark))*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`;

function makeState() {
  return {
    a: { x: 0, v: 0 },
    b: { x: 0, v: 0 },
    sy: { s: 1, v: 0 },
    lead: 0,
    lagFrom: 0,
    sats: [],
    rips: [],
    t: { x: 0, cy: 0, q: 0, r: 21 },
    q: 0,
    mouse: { x: 0, y: 0, s: 0, on: false },
    moving: false,
    split: false,
    ready: false,
    w: 0,
    h: 0,
    visible: true,
    reduce: false,
    raf: 0,
    last: 0,
    time: 0,
    glc: null,
  };
}

function initGL(canvas) {
  const gl = canvas.getContext('webgl', {
    premultipliedAlpha: true,
    alpha: true,
    antialias: false,
  });
  if (!gl) return null;

  const compile = (type, src) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  gl.useProgram(program);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const loc = gl.getAttribLocation(program, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  for (const name of [
    'uRes',
    'uDpr',
    'uTime',
    'uPill',
    'uBlob',
    'uSy',
    'uRip',
    'uMouse',
    'uDark',
    'uAmb',
  ]) {
    u[name] = gl.getUniformLocation(program, name);
  }
  return { gl, u };
}

function supportsRefraction(perfTier) {
  if (perfTier !== 'high' || typeof window === 'undefined' || typeof CSS === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  const isTouch = Boolean(window.matchMedia?.('(pointer: coarse)').matches);
  if (isTouch) return false;
  return (
    /Chrome\/|Chromium\/|Edg\//.test(ua) &&
    !/Firefox\//.test(ua) &&
    Boolean(CSS.supports?.('backdrop-filter', 'url(#a)'))
  );
}

export function LiquidNavbar({
  items = DEFAULT_ITEMS,
  defaultActive = 0,
  active,
  onChange,
  tone = 'dark',
  perfTier = 'high',
  compact,
  sound = false,
  ariaLabel = 'Navegación principal',
  className,
  style,
}) {
  const [inner, setInner] = React.useState(defaultActive);
  const current = active ?? inner;
  const navRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const dropRef = React.useRef(null);
  const itemRefs = React.useRef([]);
  const iconRefs = React.useRef([]);
  const audio = React.useRef(null);
  const st = React.useRef(makeState());
  const [gl, setGl] = React.useState(perfTier === 'lite' ? 'off' : 'on');
  const [refract, setRefract] = React.useState(false);
  const [fx, setFx] = React.useState({ i: -1, n: 0 });

  const dark = tone === 'dark' ? 1 : 0;
  const darkRef = React.useRef(dark);
  darkRef.current = dark;
  const tierRef = React.useRef(perfTier);
  tierRef.current = perfTier;

  const draw = React.useCallback(() => {
    const s = st.current;
    const T = s.t;
    const sep = Math.abs(s.a.x - s.b.x);
    const thin = Math.min(sep / (2 * (s.q + T.r) || 1), 1);
    const r = T.r * (1 - 0.3 * thin);

    if (s.glc) {
      const { gl: g, u } = s.glc;
      const dpr = Math.min(window.devicePixelRatio || 1, tierRef.current === 'high' ? 2 : 1);
      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
      g.uniform2f(u.uRes, s.w + PAD * 2, s.h + PAD * 2);
      g.uniform1f(u.uDpr, dpr);
      g.uniform1f(u.uTime, s.time);
      g.uniform4f(u.uPill, PAD, PAD, s.w, s.h);

      const blobs = new Float32Array(24);
      const sy = new Float32Array(6).fill(1);
      const head = s.lead === 0 ? s.a : s.b;
      const tail = s.lead === 0 ? s.b : s.a;

      blobs.set(
        [
          head.x,
          T.cy,
          s.q * (1 - 0.25 * thin),
          T.r * (1 - 0.12 * thin),
          tail.x,
          T.cy,
          s.q * (1 - 0.8 * thin),
          T.r * (1 - 0.5 * thin),
        ],
        0
      );
      sy[0] = sy[1] = s.sy.s;
      s.sats.slice(0, 4).forEach((d, i) => blobs.set([d.x, d.y, 0, d.r], 8 + i * 4));

      g.uniform4fv(u.uBlob, blobs);
      g.uniform1fv(u.uSy, sy);

      const rips = new Float32Array(24);
      s.rips.slice(-6).forEach((p, i) => rips.set([p.x, p.y, p.age, p.amp], i * 4));
      g.uniform4fv(u.uRip, rips);
      g.uniform3f(u.uMouse, s.mouse.x, s.mouse.y, s.mouse.s);
      g.uniform1f(u.uDark, darkRef.current);
      g.uniform1f(u.uAmb, s.reduce || tierRef.current !== 'high' ? 0 : 1);

      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.TRIANGLES, 0, 3);
    } else if (dropRef.current) {
      const left = Math.min(s.a.x, s.b.x) - s.q - r - PAD;
      const width = sep + 2 * (s.q + r);
      dropRef.current.style.width = `${width}px`;
      dropRef.current.style.transform = `translateX(${left}px) scaleY(${s.sy.s})`;
    }
  }, []);

  const step = React.useCallback((dt, now) => {
    const s = st.current;
    const T = s.t;
    s.time += dt;
    s.q += (T.q - s.q) * Math.min(1, dt * 12);
    const bodies = [s.a, s.b];
    let still = true;

    if (s.reduce) {
      s.a.x = s.b.x = T.x;
      s.a.v = s.b.v = 0;
      s.sy.s = 1;
      s.sats = [];
    } else {
      bodies.forEach((B, i) => {
        const lead = i === s.lead;
        const k = lead ? 210 : 72;
        const c = lead ? 25 : 13;
        const f = !lead && now < s.lagFrom ? 0.08 : 1;
        B.v += (k * (T.x - B.x) - c * B.v) * dt * f;
        B.x += B.v * dt;

        const lo = PAD + 6 + s.q + T.r - 3;
        const hi = PAD + s.w - 6 - s.q - T.r + 3;
        if (B.x < lo || B.x > hi) {
          s.sy.v -= Math.min(Math.abs(B.v), 900) * 0.0016;
          B.x = Math.max(lo, Math.min(hi, B.x));
          B.v *= -0.25;
        }
        if (Math.abs(T.x - B.x) > 0.3 || Math.abs(B.v) > 3) still = false;
      });

      const L = bodies[s.lead];
      const syT = 1 - 0.2 * Math.min(Math.abs(L.v) / 1500, 1);
      s.sy.v += (280 * (syT - s.sy.s) - 9 * s.sy.v) * dt;
      s.sy.s += s.sy.v * dt;
      if (Math.abs(s.sy.s - 1) > 0.002 || Math.abs(s.sy.v) > 0.02) still = false;

      // Rotura del cuello líquido en saltos largos
      const sep = Math.abs(s.a.x - s.b.x);
      const r = T.r * (1 - 0.3 * Math.min(sep / (2 * (T.q + T.r) || 1), 1));
      if (!s.split && s.moving && sep - 2 * T.q - 2 * r > -6) {
        s.split = true;
        const lo = bodies[1 - s.lead];
        const hi = bodies[s.lead];
        [0.3, 0.5, 0.72].forEach((t, j) => {
          s.sats.push({
            x: lo.x + (hi.x - lo.x) * t + (Math.random() - 0.5) * 6,
            y: T.cy + (Math.random() - 0.5) * 10,
            vx: (lo.v + hi.v) * 0.45,
            vy: (Math.random() - 0.5) * 60,
            r: 5 + Math.random() * 3 - j * 0.5,
            k: 70 + Math.random() * 90,
          });
        });
      }

      s.sats = s.sats.filter((d) => {
        d.vx += (d.k * (T.x - d.x) - 9 * d.vx) * dt;
        d.vy += (90 * (T.cy - d.y) - 7 * d.vy) * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.x = Math.max(PAD + 8 + d.r, Math.min(PAD + s.w - 8 - d.r, d.x));
        d.y = Math.max(T.cy - T.r + d.r, Math.min(T.cy + T.r - d.r, d.y));
        if (Math.abs(T.x - d.x) < T.q + T.r * 0.5) d.r -= dt * 26;
        return d.r > 0.6;
      });
      if (s.sats.length) still = false;
    }

    if (s.moving && still) {
      s.moving = false;
      if (s.split || !s.reduce) {
        s.rips.push({ x: T.x, y: T.cy, age: 0, amp: s.split ? 1.2 : 0.7 });
      }
    }

    s.rips.forEach((p) => {
      p.age += dt;
    });
    s.rips = s.rips.filter((p) => p.age < 2.4);

    const target = s.mouse.on ? 1 : 0;
    s.mouse.s += (target - s.mouse.s) * Math.min(1, dt * 7);
  }, []);

  const loop = React.useCallback(() => {
    const s = st.current;
    if (s.raf || typeof requestAnimationFrame === 'undefined') return;
    s.last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - s.last) / 1000, 1 / 30);
      s.last = now;
      step(dt, now);
      draw();
      const busy = s.moving || s.rips.length || s.sats.length || s.mouse.s > 0.01;
      const keepIdle = !s.reduce && tierRef.current === 'high';
      if (s.visible && (keepIdle || busy)) {
        s.raf = requestAnimationFrame(tick);
      } else {
        s.raf = 0;
      }
    };
    s.raf = requestAnimationFrame(tick);
  }, [draw, step]);

  const measure = React.useCallback(() => {
    const nav = navRef.current;
    const el = itemRefs.current[current];
    if (!nav || !el) return;

    const s = st.current;
    s.w = nav.offsetWidth;
    s.h = nav.offsetHeight;
    const T = s.t;
    T.r = el.offsetHeight / 2;
    T.q = Math.max(0, el.offsetWidth / 2 - T.r);
    T.cy = PAD + el.offsetTop + el.offsetHeight / 2;
    const nx = PAD + el.offsetLeft + el.offsetWidth / 2;

    if (!s.ready) {
      s.a.x = s.b.x = nx;
      s.q = T.q;
      s.ready = true;
    } else if (Math.abs(nx - T.x) > 0.5) {
      s.lead = Math.abs(nx - s.a.x) <= Math.abs(nx - s.b.x) ? 0 : 1;
      s.lagFrom = performance.now() + 70;
      s.moving = true;
      s.split = false;
    }
    T.x = nx;

    const cv = canvasRef.current;
    if (cv && s.glc) {
      const dpr = Math.min(window.devicePixelRatio || 1, tierRef.current === 'high' ? 2 : 1);
      const W = s.w + PAD * 2;
      const Hh = s.h + PAD * 2;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hh * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(Hh * dpr);
        cv.style.width = `${W}px`;
        cv.style.height = `${Hh}px`;
      }
    }
    loop();
  }, [current, loop]);

  React.useEffect(() => {
    setRefract(supportsRefraction(perfTier));
    const s = st.current;
    s.reduce = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

    const cv = canvasRef.current;
    if (perfTier === 'lite') {
      s.glc = null;
      setGl('off');
    } else {
      s.glc = cv ? initGL(cv) : null;
      setGl(s.glc ? 'on' : 'off');
    }

    const lost = (e) => {
      e.preventDefault();
      s.glc = null;
      setGl('off');
    };
    cv?.addEventListener('webglcontextlost', lost);

    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting;
      if (s.visible) loop();
    });
    if (navRef.current) io.observe(navRef.current);

    const vis = () => {
      s.visible = document.visibilityState === 'visible';
      if (s.visible) loop();
    };
    document.addEventListener('visibilitychange', vis);

    return () => {
      cv?.removeEventListener('webglcontextlost', lost);
      io.disconnect();
      document.removeEventListener('visibilitychange', vis);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [loop, perfTier]);

  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure, items.length, compact]);

  const measureRef = React.useRef(measure);
  measureRef.current = measure;

  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return undefined;
    let lastW = -1;
    const ro = new ResizeObserver(() => {
      const w = navRef.current?.offsetWidth ?? 0;
      if (w !== lastW) {
        lastW = w;
        st.current.ready = false;
        measureRef.current();
      }
    });
    if (navRef.current) ro.observe(navRef.current);

    let alive = true;
    document.fonts?.ready?.then(() => {
      if (!alive) return;
      st.current.ready = false;
      measureRef.current();
    });

    return () => {
      alive = false;
      ro.disconnect();
    };
  }, []);

  React.useEffect(() => {
    loop();
  }, [tone, loop]);

  const local = (clientX, clientY) => {
    const r = navRef.current.getBoundingClientRect();
    return { x: clientX - r.left + PAD, y: clientY - r.top + PAD };
  };

  const ripple = (x, y, amp) => {
    const s = st.current;
    if (s.reduce) return;
    s.rips.push({ x, y, age: 0, amp });
    loop();
  };

  const iconCenter = (i) => {
    const el = iconRefs.current[i];
    if (!el || !navRef.current) return null;
    const b = el.getBoundingClientRect();
    return local(b.left + b.width / 2, b.top + b.height / 2);
  };

  const plip = () => {
    if (!sound) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = (audio.current ||= new AC());
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(420 + Math.random() * 80, t);
      o.frequency.exponentialRampToValueAtTime(1500, t + 0.07);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.18);
    } catch {
      // Silencio si el navegador restringe WebAudio
    }
  };

  const select = (i) => {
    const kind = items[i]?.fx ?? (items[i]?.icon ? 'pop' : 'none');
    setFx((f) => ({ i, n: f.n + 1 }));
    plip();
    const c = iconCenter(i);
    if (c && kind === 'drop') setTimeout(() => ripple(c.x, st.current.t.cy, 1.4), 430);
    if (c && kind === 'plane') ripple(c.x, c.y, 0.6);
    if (i !== current) {
      if (active === undefined) setInner(i);
      onChange?.(i, items[i]);
    }
  };

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (current + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
    select(next);
    itemRefs.current[next]?.focus();
  };

  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || !navRef.current) return;
    const p = local(e.clientX, e.clientY);
    const s = st.current;
    s.mouse.x = p.x;
    s.mouse.y = p.y;
    s.mouse.on = true;
    loop();
  };

  return (
    <nav
      ref={navRef}
      className={['nimbus-nav', className].filter(Boolean).join(' ')}
      data-tone={tone}
      data-gl={gl}
      data-compact={compact === undefined ? undefined : String(compact)}
      data-refract={refract ? 'on' : 'off'}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      onPointerMove={onMove}
      onPointerLeave={() => {
        st.current.mouse.on = false;
        loop();
      }}
      onPointerDown={(e) => {
        if (!navRef.current) return;
        const p = local(e.clientX, e.clientY);
        ripple(p.x, p.y, 0.8);
      }}
      style={style}
    >
      {refract ? (
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <filter
            id="nimbus-refract"
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.02"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="soft"
              scale="60"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
      ) : null}

      <span className="nimbus-glass" aria-hidden="true" />
      <canvas className="nimbus-water" ref={canvasRef} aria-hidden="true" />
      <span className="nimbus-drop" ref={dropRef} aria-hidden="true" />

      {items.map((item, i) => {
        const kind = item.fx ?? 'pop';
        const playing = fx.i === i && kind !== 'none';
        const commonProps = {
          ref: (el) => {
            itemRefs.current[i] = el;
          },
          className: 'nimbus-item',
          'aria-current': i === current ? 'page' : undefined,
          onClick: () => select(i),
        };

        const content = (
          <>
            {item.icon ? (
              <span
                className="nv-ico"
                key={playing ? fx.n : 0}
                data-fx={playing ? kind : undefined}
                ref={(el) => {
                  iconRefs.current[i] = el;
                }}
              >
                {item.icon}
              </span>
            ) : null}
            <span className="nimbus-label">{item.label}</span>
          </>
        );

        return item.href ? (
          <a key={item.label + i} {...commonProps} href={item.href} aria-label={item.label}>
            {content}
          </a>
        ) : (
          <button
            key={item.label + i}
            {...commonProps}
            type="button"
            aria-label={item.label}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}

export { LiquidNavbar as Component };
export default LiquidNavbar;

