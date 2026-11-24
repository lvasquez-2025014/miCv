import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

// Coordenadas exactas medidas sobre la escena de The Void (16:9)
const IMG_W = 3840;
const IMG_H = 2160;
const LEFT_EYE = { u: 0.4954, v: 0.2258 };
const RIGHT_EYE = { u: 0.5106, v: 0.2254 };
const CAPE_EDGE = { u: 0.29, v: 0.64 };

function parseObjectPosition(value) {
  const parts = String(value || '50% 24%').trim().split(/\s+/);
  const parseAxis = (token, fallback) => {
    if (!token) return fallback;
    if (token.endsWith('%')) return parseFloat(token) / 100;
    if (token === 'left' || token === 'top') return 0;
    if (token === 'center') return 0.5;
    if (token === 'right' || token === 'bottom') return 1;
    return fallback;
  };
  return [parseAxis(parts[0], 0.5), parseAxis(parts[1], 0.24)];
}

function projectImagePoint(u, v, imgEl, containerRect, canvasW, canvasH) {
  const rect = imgEl.getBoundingClientRect();
  const [posX, posY] = parseObjectPosition(getComputedStyle(imgEl).objectPosition);

  const boxW = rect.width;
  const boxH = rect.height;
  const imgRatio = IMG_W / IMG_H;
  const boxRatio = boxW / Math.max(1, boxH);

  let drawnW;
  let drawnH;
  if (boxRatio > imgRatio) {
    drawnW = boxW;
    drawnH = boxW / imgRatio;
  } else {
    drawnH = boxH;
    drawnW = boxH * imgRatio;
  }

  const offsetX = (boxW - drawnW) * posX;
  const offsetY = (boxH - drawnH) * posY;

  const invX = canvasW / Math.max(1, containerRect.width);
  const invY = canvasH / Math.max(1, containerRect.height);

  return {
    x: (rect.left - containerRect.left + offsetX + u * drawnW) * invX,
    y: (rect.top - containerRect.top + offsetY + v * drawnH) * invY,
    scale: (drawnW * invX) / 1376,
  };
}

/**
 * Escena Hero HyperFrames (The Void — 4K UHD) + motor volumétrico HD en Canvas:
 * - Silueta Vantablack levitando con respiración/flotación GSAP y paralaje 3D al cursor.
 * - Brillo sutil y destello frío fijado exactamente a los dos puntos blancos de sus ojos.
 * - Volutas oscuras de humo de vacío desprendiéndose del borde de la capa.
 * - Rayos volumétricos de tormenta, relámpagos orgánicos, neblina y brasas con bokeh.
 */
export function HyperframesHeroStage({ introReady, scrollY, scrollScale }) {
  const rootRef = useRef(null);
  const rigRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotionPreference();

  // Levitación cinematográfica + zoom GSAP + paralaje suave al cursor
  useEffect(() => {
    const root = rootRef.current;
    const rig = rigRef.current;
    if (!root || !rig) return undefined;

    if (reducedMotion) {
      gsap.set(root, { opacity: 1 });
      gsap.set(rig, { scale: 1.02, x: 0, y: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(root, { opacity: 0.2 }, { opacity: 1, duration: 0.8, ease: 'power2.out' });

      gsap.fromTo(
        rig,
        { scale: 1.02, x: 0, y: 4 },
        {
          scale: 1.095,
          x: 8,
          y: -9,
          duration: 8.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }
      );
    }, root);

    const quickX = gsap.quickTo('.hf-camera-parallax', 'x', { duration: 1.0, ease: 'power3.out' });
    const quickY = gsap.quickTo('.hf-camera-parallax', 'y', { duration: 1.0, ease: 'power3.out' });

    const onMove = (event) => {
      if (event.pointerType === 'touch') return;
      const nx = event.clientX / Math.max(1, window.innerWidth) - 0.5;
      const ny = event.clientY / Math.max(1, window.innerHeight) - 0.5;
      quickX(-nx * 18);
      quickY(-ny * 12);
    };

    const onLeave = () => {
      quickX(0);
      quickY(0);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry?.isIntersecting ?? true;
        gsap.getTweensOf(rig).forEach((tw) => (inView ? tw.resume() : tw.pause()));
      },
      { threshold: 0.02 }
    );

    observer.observe(root);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      observer.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      ctx.revert();
    };
  }, [reducedMotion, introReady]);

  // Motor Canvas HD: ojos blancos de The Void, humo oscuro de vacío, rayos y tormenta
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const img = imgRef.current;
    if (!canvas || !root || !img) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = 0;
    let visible = true;
    let hidden = document.hidden;

    const pointer = { x: -9999, y: -9999, nx: 0, ny: 0, tx: 0, ty: 0, active: false };
    let eyePresence = 0.35;
    let manualFlash = 0;
    let nextStormAt = 1.8;
    let stormStart = -10;

    // 7 haces volumétricos difusos entre las nubes de tormenta
    const rays = [
      { angle: -0.44, spread: 0.095, alpha: 0.085, speed: 0.32, phase: 0.2 },
      { angle: -0.25, spread: 0.12, alpha: 0.12, speed: 0.26, phase: 1.5 },
      { angle: -0.07, spread: 0.11, alpha: 0.14, speed: 0.3, phase: 2.8 },
      { angle: 0.09, spread: 0.125, alpha: 0.15, speed: 0.24, phase: 4.1 },
      { angle: 0.26, spread: 0.1, alpha: 0.11, speed: 0.36, phase: 5.0 },
      { angle: 0.43, spread: 0.09, alpha: 0.08, speed: 0.28, phase: 0.9 },
      { angle: 0.58, spread: 0.08, alpha: 0.055, speed: 0.21, phase: 3.4 },
    ];

    // Volutas oscuras de vacío que se desprenden del borde de la capa flotante
    const voidSmoke = Array.from({ length: 16 }, (_, i) => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 18 + (i % 5) * 14,
      life: (i / 16) * 3.2,
      maxLife: 2.8 + (i % 4) * 0.7,
      phase: i * 1.9,
    }));

    // 36 cenizas y brasas en 3 planos de profundidad
    const particles = Array.from({ length: 36 }, (_, i) => {
      const plane = i < 14 ? 0 : i < 29 ? 1 : 2;
      const s = (i + 5) * 1.6180339;
      return {
        plane,
        x: (((Math.sin(s * 17.3) * 43758.5) % 1) + 1) % 1,
        y: (((Math.cos(s * 53.7) * 19341.2) % 1) + 1) % 1,
        vx: plane === 0 ? -0.015 : plane === 1 ? -0.038 : -0.068,
        vy: plane === 0 ? -0.01 : plane === 1 ? -0.028 : -0.044,
        r:
          plane === 0
            ? 1.1 + (i % 3) * 0.45
            : plane === 1
              ? 1.5 + (i % 3) * 0.65
              : 4.2 + (i % 3) * 2.2,
        phase: s * 3.7,
        flicker: 2.0 + (i % 5) * 0.65,
      };
    });

    const resetSmoke = (m, cape, sc) => {
      m.x = cape.x + (Math.random() - 0.35) * 95 * sc;
      m.y = cape.y + (Math.random() - 0.5) * 85 * sc;
      m.vx = -(0.35 + Math.random() * 0.65) * sc;
      m.vy = -(0.12 + Math.random() * 0.35) * sc;
      m.r = (16 + Math.random() * 26) * sc;
      m.life = 0;
      m.maxLife = 2.6 + Math.random() * 1.8;
    };

    const resize = () => {
      const rect = root.getBoundingClientRect();
      width = Math.max(1, root.clientWidth || rect.width);
      height = Math.max(1, root.clientHeight || rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cape = projectImagePoint(CAPE_EDGE.u, CAPE_EDGE.v, img, rect, width, height);
      voidSmoke.forEach((m, idx) => {
        resetSmoke(m, cape, cape.scale);
        m.life = (idx / voidSmoke.length) * m.maxLife;
      });

      if (reducedMotion) render(performance.now());
    };

    let last = performance.now();

    const computeStormIntensity = (t) => {
      if (reducedMotion) return 0.1;
      if (t >= nextStormAt) {
        stormStart = t;
        nextStormAt = t + 4.8 + ((Math.sin(t * 13.7) * 0.5 + 0.5) * 3.4);
      }
      const age = t - stormStart;
      if (age < 0 || age > 1.35) return 0;
      const p1 = Math.exp(-Math.pow((age - 0.14) / 0.1, 2)) * 0.85;
      const p2 = Math.exp(-Math.pow((age - 0.45) / 0.16, 2)) * 0.58;
      return Math.min(1, p1 + p2);
    };

    const render = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      ctx.clearRect(0, 0, width, height);

      pointer.nx += (pointer.tx - pointer.nx) * 0.065;
      pointer.ny += (pointer.ty - pointer.ny) * 0.065;
      manualFlash *= Math.pow(0.06, dt);

      const t = reducedMotion ? 1.0 : now * 0.001;
      const storm = Math.min(1.15, computeStormIntensity(t) + manualFlash);

      const stageRect = root.getBoundingClientRect();
      const leftEye = projectImagePoint(LEFT_EYE.u, LEFT_EYE.v, img, stageRect, width, height);
      const rightEye = projectImagePoint(RIGHT_EYE.u, RIGHT_EYE.v, img, stageRect, width, height);
      const cape = projectImagePoint(CAPE_EDGE.u, CAPE_EDGE.v, img, stageRect, width, height);
      const sc = Math.max(0.55, leftEye.scale);

      const midEyeX = (leftEye.x + rightEye.x) * 0.5;
      const midEyeY = (leftEye.y + rightEye.y) * 0.5;

      // Intensidad sutil de la mirada al acercar el cursor
      let targetEye = 0.42 + 0.14 * Math.sin(t * 1.9);
      if (pointer.active) {
        const dist = Math.hypot(pointer.x - midEyeX, pointer.y - midEyeY);
        const prox = Math.max(0, 1 - dist / (380 * sc));
        targetEye += prox * 0.65;
      }
      targetEye = Math.min(1.25, targetEye + manualFlash * 0.5);
      eyePresence += (targetEye - eyePresence) * Math.min(1, dt * 6);

      // 1. Humo oscuro de vacío desprendiéndose suavemente del borde de la capa
      for (let i = 0; i < voidSmoke.length; i++) {
        const m = voidSmoke[i];
        if (!reducedMotion) {
          m.life += dt;
          m.x += (m.vx + Math.sin(t * 1.5 + m.phase) * 0.16) * (dt * 60);
          m.y += (m.vy + Math.cos(t * 1.2 + m.phase) * 0.1) * (dt * 60);
          if (m.life >= m.maxLife) resetSmoke(m, cape, sc);
        }
        const prog = m.life / m.maxLife;
        const alpha = Math.sin(prog * Math.PI) * 0.32;
        const rad = m.r * (0.75 + prog * 1.15);
        const sg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, rad);
        sg.addColorStop(0, `rgba(4, 6, 8, ${alpha})`);
        sg.addColorStop(0.55, `rgba(10, 14, 16, ${alpha * 0.45})`);
        sg.addColorStop(1, 'rgba(10, 14, 16, 0)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(m.x, m.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Iluminación de tormenta y rayos volumétricos detrás/alrededor de The Void
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const flashAlpha = 0.06 + storm * 0.38;
      const flashX = width * 0.5 + pointer.nx * 16;
      const flashY = height * 0.16 + pointer.ny * 10;
      const flashGrad = ctx.createRadialGradient(
        flashX,
        flashY,
        10,
        flashX,
        flashY,
        Math.max(width, height) * 0.6
      );
      flashGrad.addColorStop(0, `rgba(218, 236, 240, ${flashAlpha})`);
      flashGrad.addColorStop(0.35, `rgba(148, 182, 192, ${flashAlpha * 0.45})`);
      flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(0, 0, width, height);

      // Rayos volumétricos suaves desde el cielo nublado
      const originX = width * 0.51 + pointer.nx * 22;
      const originY = -height * 0.14;
      const rayLen = Math.hypot(width, height) * 1.12;

      for (let i = 0; i < rays.length; i++) {
        const r = rays[i];
        const sway = Math.sin(t * r.speed + r.phase) * 0.05;
        const aMid = Math.PI * 0.5 + r.angle + sway;
        const halfSpread = r.spread * 0.5;
        const pulse = 0.72 + 0.28 * Math.sin(t * (r.speed * 1.5) + r.phase);
        const rayAlpha = r.alpha * pulse * (1 + storm * 0.65);

        const x1 = originX + Math.cos(aMid - halfSpread) * rayLen;
        const y1 = originY + Math.sin(aMid - halfSpread) * rayLen;
        const x2 = originX + Math.cos(aMid + halfSpread) * rayLen;
        const y2 = originY + Math.sin(aMid + halfSpread) * rayLen;

        const g = ctx.createLinearGradient(
          originX,
          originY,
          originX + Math.cos(aMid) * rayLen * 0.82,
          originY + Math.sin(aMid) * rayLen * 0.82
        );
        g.addColorStop(0, `rgba(220, 234, 236, ${rayAlpha})`);
        g.addColorStop(0.5, `rgba(186, 206, 210, ${rayAlpha * 0.36})`);
        g.addColorStop(1, 'rgba(186, 206, 210, 0)');

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fillStyle = g;
        ctx.fill();
      }

      // 3. Los dos puntos blancos mínimos e inquietantes de los ojos de The Void
      for (const eye of [leftEye, rightEye]) {
        const bloomR = (10 + eyePresence * 9) * sc;
        const eg = ctx.createRadialGradient(eye.x, eye.y, 0.5, eye.x, eye.y, bloomR);
        eg.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, 0.78 + eyePresence * 0.22)})`);
        eg.addColorStop(0.28, `rgba(220, 236, 248, ${0.42 * eyePresence})`);
        eg.addColorStop(1, 'rgba(180, 214, 240, 0)');
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, bloomR, 0, Math.PI * 2);
        ctx.fill();

        // Destello horizontal ultra fino y contenido al acercar el cursor
        if (eyePresence > 0.52) {
          const fw = (14 + (eyePresence - 0.52) * 34) * sc;
          const fg = ctx.createLinearGradient(eye.x - fw, eye.y, eye.x + fw, eye.y);
          fg.addColorStop(0, 'rgba(255, 255, 255, 0)');
          fg.addColorStop(0.5, `rgba(240, 248, 255, ${(eyePresence - 0.52) * 0.65})`);
          fg.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = fg;
          ctx.fillRect(eye.x - fw, eye.y - 0.7 * sc, fw * 2, 1.4 * sc);
        }
      }

      // 4. Cenizas y brasas en 3 planos de profundidad
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!reducedMotion) {
          const turbX = Math.sin(t * 1.1 + p.phase) * 0.007;
          const turbY = Math.cos(t * 0.9 + p.phase) * 0.004;
          p.x += (p.vx + turbX) * dt;
          p.y += (p.vy + turbY) * dt;
          if (p.x < -0.08) p.x = 1.08;
          if (p.y < -0.08) {
            p.y = 1.08;
            p.x = 0.15 + Math.random() * 0.9;
          }
        }

        const parallaxMul = p.plane === 0 ? 10 : p.plane === 1 ? 24 : 42;
        const px = p.x * width + pointer.nx * parallaxMul;
        const py = p.y * height + pointer.ny * (parallaxMul * 0.7);
        const twinkle = 0.52 + 0.48 * Math.sin(t * p.flicker + p.phase);

        if (p.plane === 0) {
          const rad = p.r * 3.0;
          const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
          g.addColorStop(0, `rgba(216, 232, 236, ${0.42 * twinkle})`);
          g.addColorStop(1, 'rgba(216, 232, 236, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.plane === 1) {
          const rad = p.r * 3.6;
          const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
          g.addColorStop(0, `rgba(255, 244, 218, ${0.82 * twinkle})`);
          g.addColorStop(0.34, `rgba(232, 184, 126, ${0.42 * twinkle})`);
          g.addColorStop(1, 'rgba(232, 168, 98, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const rad = p.r * 2.6;
          const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
          g.addColorStop(0, `rgba(245, 236, 215, ${0.22 * twinkle})`);
          g.addColorStop(1, 'rgba(225, 182, 128, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      if (!reducedMotion && visible && !hidden) {
        rafId = requestAnimationFrame(render);
      }
    };

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      const rect = root.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.tx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      pointer.ty = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      pointer.active =
        pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
    };

    const onPointerDown = (e) => {
      if (reducedMotion) return;
      const rect = root.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        manualFlash = 0.85;
      }
    };

    const onLeave = () => {
      pointer.active = false;
      pointer.tx = 0;
      pointer.ty = 0;
    };

    const onVisibility = () => {
      hidden = document.hidden;
      if (!hidden && visible && !reducedMotion) {
        last = performance.now();
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(render);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible && !hidden && !reducedMotion) {
          last = performance.now();
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.02 }
    );

    resize();
    observer.observe(root);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    if (!reducedMotion) {
      rafId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion]);

  return (
    <motion.div
      ref={rootRef}
      className="hf-hero-stage"
      aria-hidden="true"
      style={{ y: scrollY, scale: scrollScale }}
    >
      <div className="hf-camera-parallax">
        <div ref={rigRef} className="hf-camera-rig">
          <img
            ref={imgRef}
            className="hf-bg-photo"
            src="/hyperframes/hero-4k.jpg"
            alt=""
            width={3840}
            height={2160}
            decoding="async"
            fetchPriority="high"
            draggable={false}
          />
        </div>
      </div>

      {/* Motor volumétrico HD fijado a los ojos blancos y humo de The Void */}
      <canvas ref={canvasRef} className="hf-vfx-canvas" />

      <div className="hf-vignette" />
      <div className="hf-readability-scrim" />
      <div className="hf-bottom-fade" />
    </motion.div>
  );
}
