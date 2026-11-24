import { useRef } from 'react';
import { useFinePointer } from '../hooks/useFinePointer';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

/**
 * Superficie Liquid Glass reactiva al puntero sin re-renderizados de React.
 * Actualiza --mx / --my por rAF para proyectar refracción especular y brillo de borde.
 */
export function LiquidSurface({
  as: Tag = 'div',
  className = '',
  children,
  dark = false,
  ...props
}) {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const isFine = useFinePointer();
  const reducedMotion = useReducedMotionPreference();
  const interactive = isFine && !reducedMotion;

  const onPointerMove = (event) => {
    if (!interactive || event.pointerType === 'touch' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.style.setProperty('--mx', `${x.toFixed(1)}%`);
      ref.current.style.setProperty('--my', `${y.toFixed(1)}%`);
      ref.current.dataset.glint = 'on';
    });
  };

  const onPointerLeave = () => {
    if (!ref.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    delete ref.current.dataset.glint;
  };

  return (
    <Tag
      ref={ref}
      className={`liquid-panel liquid-surface${dark ? ' liquid-panel--obsidian' : ''}${className ? ` ${className}` : ''}`}
      onPointerMove={interactive ? onPointerMove : undefined}
      onPointerLeave={interactive ? onPointerLeave : undefined}
      {...props}
    >
      <span className="liquid-surface__glint" aria-hidden="true" />
      <span className="liquid-surface__rim" aria-hidden="true" />
      {children}
    </Tag>
  );
}

