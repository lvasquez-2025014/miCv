import { useEffect, useRef, useState } from 'react';
import { paintLiquidArt, recipeOf } from './artEngine';

function buildCssGradient(recipe) {
  const c = Array.isArray(recipe?.colors) && recipe.colors.length >= 2
    ? recipe.colors
    : ['#070a0c', '#1c282a', '#647674', '#c8dcd8'];
  const c0 = c[0];
  const c1 = c[Math.min(2, c.length - 1)];
  const c2 = c[Math.min(4, c.length - 1)];
  const c3 = c[c.length - 1];
  return `radial-gradient(120% 90% at 22% 18%, ${c2}aa 0%, transparent 58%), radial-gradient(100% 80% at 84% 76%, ${c1}cc 0%, transparent 62%), linear-gradient(140deg, ${c0} 0%, ${c1} 52%, ${c3} 100%)`;
}

export function ArtCanvas({
  art = 'voidStorm',
  seed = 3,
  w = 340,
  h = 272,
  density = 1,
  priority = 0,
  className = '',
  style,
}) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  const isLite =
    typeof document !== 'undefined' && document.documentElement.dataset.perf === 'lite';
  const recipe = recipeOf(art);
  const key = JSON.stringify(recipe);
  const pw = Math.max(16, Math.round(w * density));
  const ph = Math.max(16, Math.round(h * density));

  useEffect(() => {
    if (isLite) return undefined;
    let live = true;
    setReady(false);

    paintLiquidArt(JSON.parse(key), seed, pw, ph, priority).then((src) => {
      const canvas = ref.current;
      if (!live || !canvas || !src) return;
      canvas.width = src.width;
      canvas.height = src.height;
      canvas.getContext('2d')?.drawImage(src, 0, 0);
      setReady(true);
    });

    return () => {
      live = false;
    };
  }, [key, seed, pw, ph, priority, isLite]);

  // En móviles gama baja evita el cálculo FBM píxel a píxel en CPU y usa degradado instantáneo GPU
  if (isLite) {
    return (
      <div
        aria-hidden="true"
        className={className}
        data-ready="true"
        style={{
          width: w,
          height: h,
          maxWidth: 'none',
          background: buildCssGradient(recipe),
          ...style,
        }}
      />
    );
  }

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      data-ready={ready || undefined}
      style={{ width: w, height: h, maxWidth: 'none', ...style }}
    />
  );
}
