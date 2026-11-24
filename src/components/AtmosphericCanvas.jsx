import { useEffect, useRef } from 'react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

/**
 * Atmósfera oscura tormentosa de The Void para todo el fondo de la página:
 * velos de niebla salvia-pizarra, sombras de vacío, marcas de registro finas
 * y motas de ceniza plateada / brasa sutil con paralaje.
 */
export function AtmosphericCanvas({ perf }) {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotionPreference();
  const tier = perf?.tier || 'high';
  const disabled = tier === 'lite';

  useEffect(() => {
    if (disabled) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const isMobile = tier !== 'high';
    const maxDpr = isMobile ? 1 : 1.5;
    const minFrameMs = isMobile ? 42 : 16;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    let rafId = 0;
    let lastRender = 0;
    let hidden = document.hidden;

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let clouds = [];
    let motes = [];

    const seed = () => {
      clouds = isMobile
        ? [
            { xRatio: 0.24, yRatio: 0.26, rRatio: 0.5, alpha: 0.085, speed: 0.14 },
            { xRatio: 0.78, yRatio: 0.72, rRatio: 0.52, alpha: 0.075, speed: -0.12 },
          ]
        : [
            { xRatio: 0.18, yRatio: 0.24, rRatio: 0.48, alpha: 0.09, speed: 0.16 },
            { xRatio: 0.82, yRatio: 0.46, rRatio: 0.54, alpha: 0.075, speed: -0.14 },
            { xRatio: 0.48, yRatio: 0.82, rRatio: 0.52, alpha: 0.08, speed: 0.12 },
          ];

      const count = isMobile
        ? Math.min(10, Math.max(6, Math.floor(width / 90)))
        : Math.min(24, Math.max(10, Math.floor(width / 82)));
      motes = Array.from({ length: count }, (_, i) => {
        const s = (i + 3) * 1.913;
        return {
          x: (((Math.sin(s * 19.31) * 43758.545) % 1) + 1) % 1 * width,
          y: (((Math.cos(s * 61.17) * 19341.123) % 1) + 1) % 1 * height,
          vx: -0.07 - (i % 3) * 0.04,
          vy: -0.09 - (i % 4) * 0.035,
          r: 1.0 + (i % 3) * 0.75,
          depth: 0.35 + (i % 4) * 0.2,
          warm: i % 4 === 0,
        };
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reducedMotion) render(0);
    };

    const render = (time) => {
      if (!reducedMotion && !hidden && lastRender && time - lastRender < minFrameMs) {
        rafId = requestAnimationFrame(render);
        return;
      }
      lastRender = time;

      ctx.clearRect(0, 0, width, height);

      pointer.x += (pointer.tx - pointer.x) * 0.055;
      pointer.y += (pointer.ty - pointer.y) * 0.055;
      const t = time * 0.00035;

      // Velos sutiles de nubes salvia-pizarra en movimiento lento
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        const cx = c.xRatio * width + Math.sin(t * c.speed + i * 2) * 48 + pointer.x * 20;
        const cy = c.yRatio * height + Math.cos(t * c.speed + i) * 28 + pointer.y * 14;
        const rad = Math.max(width, height) * c.rRatio;

        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rad);
        grad.addColorStop(0, `rgba(128, 148, 144, ${c.alpha})`);
        grad.addColorStop(0.55, `rgba(54, 68, 66, ${c.alpha * 0.45})`);
        grad.addColorStop(1, 'rgba(7, 10, 12, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Cruces finas de registro cinematográfico
      if (!isMobile) {
        ctx.strokeStyle = 'rgba(218, 232, 228, 0.08)';
        ctx.lineWidth = 1;
        const marks = [
          [width * 0.06, height * 0.24],
          [width * 0.94, height * 0.3],
          [width * 0.08, height * 0.78],
          [width * 0.92, height * 0.76],
        ];
        for (const [mx, my] of marks) {
          const px = mx + pointer.x * 5;
          const py = my + pointer.y * 5;
          ctx.beginPath();
          ctx.moveTo(px - 7, py);
          ctx.lineTo(px + 7, py);
          ctx.moveTo(px, py - 7);
          ctx.lineTo(px, py + 7);
          ctx.stroke();
        }
      }

      // Cenizas de tormenta plateadas y escasas brasas cálidas
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        if (!reducedMotion) {
          m.x += m.vx;
          m.y += m.vy;
          if (m.x < -20) m.x = width + 20;
          if (m.y < -20) m.y = height + 20;
        }
        const mx = m.x + pointer.x * 20 * m.depth;
        const my = m.y + pointer.y * 15 * m.depth;

        const g = ctx.createRadialGradient(mx, my, 0, mx, my, m.r * 4.5);
        if (m.warm) {
          g.addColorStop(0, 'rgba(242, 206, 158, 0.46)');
          g.addColorStop(0.4, 'rgba(217, 181, 138, 0.16)');
          g.addColorStop(1, 'rgba(217, 181, 138, 0)');
        } else {
          g.addColorStop(0, 'rgba(222, 236, 234, 0.38)');
          g.addColorStop(1, 'rgba(164, 186, 182, 0)');
        }
        ctx.beginPath();
        ctx.arc(mx, my, m.r * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      if (!reducedMotion && !hidden) {
        rafId = requestAnimationFrame(render);
      }
    };

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      pointer.tx = (e.clientX / Math.max(1, width) - 0.5) * 2;
      pointer.ty = (e.clientY / Math.max(1, height) - 0.5) * 2;
    };

    const onVisibility = () => {
      hidden = document.hidden;
      if (!hidden && !reducedMotion) {
        lastRender = 0;
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(render);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    if (!isMobile) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }
    document.addEventListener('visibilitychange', onVisibility);

    if (!reducedMotion) {
      rafId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      if (!isMobile) {
        window.removeEventListener('pointermove', onPointerMove);
      }
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion, tier, disabled]);

  if (disabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="atmospheric-backdrop"
    />
  );
}
