import { useEffect, useState } from 'react';

/**
 * Clasificación adaptativa de rendimiento:
 * - 'lite': móviles de gama baja (<= 4 GB RAM o <= 4 hilos), modo ahorro de datos o movimiento reducido.
 * - 'medium': móviles y tablets estándar (pantalla táctil / viewport compacto).
 * - 'high': escritorio o hardware con puntero fino y capacidad completa.
 */
export function detectPerformanceTier() {
  if (typeof window === 'undefined') return 'high';

  const reducedMotion = Boolean(
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  if (reducedMotion) return 'lite';

  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') {
    return 'lite';
  }

  const cores = Number(nav.hardwareConcurrency) || 0;
  const memory = Number(nav.deviceMemory) || 0;
  const isCoarse = Boolean(window.matchMedia?.('(pointer: coarse)').matches);
  const isSmallViewport = window.innerWidth <= 900;
  const isMobileLike = isCoarse || isSmallViewport;

  if ((cores > 0 && cores <= 2) || (memory > 0 && memory <= 2)) {
    return 'lite';
  }

  if (isMobileLike) {
    if ((cores > 0 && cores <= 4) || (memory > 0 && memory <= 4)) {
      return 'lite';
    }
    return 'medium';
  }

  return 'high';
}

export function applyPerformanceTierAttribute(tier) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.perf = tier;
}

export function usePerformanceProfile() {
  const [tier, setTier] = useState(() => detectPerformanceTier());

  useEffect(() => {
    const update = () => {
      const next = detectPerformanceTier();
      setTier(next);
      applyPerformanceTierAttribute(next);
    };

    update();
    const mqMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const mqCoarse = window.matchMedia?.('(pointer: coarse)');
    mqMotion?.addEventListener?.('change', update);
    mqCoarse?.addEventListener?.('change', update);
    window.addEventListener('resize', update, { passive: true });

    return () => {
      mqMotion?.removeEventListener?.('change', update);
      mqCoarse?.removeEventListener?.('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return {
    tier,
    isLite: tier === 'lite',
    isMobileTier: tier !== 'high',
    isHigh: tier === 'high',
  };
}

