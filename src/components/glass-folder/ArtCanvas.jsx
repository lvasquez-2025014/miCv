import { useEffect, useRef, useState } from 'react';
import { paintLiquidArt, recipeOf } from './artEngine';

export function ArtCanvas({
  art = 'twilight',
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

  const recipe = recipeOf(art);
  const key = JSON.stringify(recipe);
  const pw = Math.max(16, Math.round(w * density));
  const ph = Math.max(16, Math.round(h * density));

  useEffect(() => {
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
  }, [key, seed, pw, ph, priority]);

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

