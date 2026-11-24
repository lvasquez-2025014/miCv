import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

const SPARKS = [
  { angle: -75, dist: 20, size: 3.2, tone: 'ember' },
  { angle: -25, dist: 23, size: 2.6, tone: 'white' },
  { angle: 28, dist: 19, size: 3.0, tone: 'ember' },
  { angle: 82, dist: 21, size: 2.5, tone: 'white' },
  { angle: 145, dist: 22, size: 3.1, tone: 'ember' },
  { angle: -140, dist: 18, size: 2.6, tone: 'white' },
];

/**
 * Botón táctil Liquid Glass para dar Like o Estrella con micro-estallido de chispas.
 * Soporta variantes: 'hud' | 'pill' | 'icon'
 */
export function StarLikeButton({
  active = false,
  count = 0,
  loading = false,
  onToggle,
  icon = 'star',
  label = 'Dar estrella',
  activeLabel = 'Estrella dada',
  variant = 'pill',
  ariaLabel,
  className = '',
}) {
  const reducedMotion = useReducedMotionPreference();
  const [burstKey, setBurstKey] = useState(0);
  const timerRef = useRef(0);

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  const handleClick = (event) => {
    event.stopPropagation();
    const becomingActive = !active;
    onToggle?.();
    if (becomingActive && !reducedMotion) {
      setBurstKey((k) => k + 1);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setBurstKey(0), 650);
    }
  };

  const Icon = icon === 'heart' ? Heart : Star;
  const iconSize = variant === 'icon' ? 15 : variant === 'hud' ? 14 : 15;
  const displayLabel = active ? activeLabel : label;
  const computedAria =
    ariaLabel ||
    `${displayLabel}${count > 0 ? `, ${count} ${count === 1 ? 'voto' : 'votos'}` : ''}`;

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={computedAria}
      title={displayLabel}
      whileTap={reducedMotion ? undefined : { scale: 0.93 }}
      className={[
        'void-like-btn',
        `void-like-btn--${variant}`,
        active ? 'void-like-btn--active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="void-like-btn__icon-wrap" aria-hidden="true">
        <motion.span
          className="void-like-btn__icon"
          animate={
            active && !reducedMotion
              ? { scale: [1, 1.32, 0.96, 1], rotate: icon === 'star' ? [0, -14, 6, 0] : 0 }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Icon size={iconSize} fill={active ? 'currentColor' : 'none'} strokeWidth={1.85} />
        </motion.span>

        <AnimatePresence>
          {burstKey > 0 ? (
            <span key={burstKey} className="void-spark-burst">
              {SPARKS.map((spark, idx) => {
                const rad = (spark.angle * Math.PI) / 180;
                const tx = Math.cos(rad) * spark.dist;
                const ty = Math.sin(rad) * spark.dist;
                return (
                  <motion.span
                    key={idx}
                    className={`void-spark void-spark--${spark.tone}`}
                    style={{ width: spark.size, height: spark.size }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: tx, y: ty, opacity: 0, scale: 0.25 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
                  />
                );
              })}
            </span>
          ) : null}
        </AnimatePresence>
      </span>

      {variant !== 'icon' ? (
        <span className="void-like-btn__label">{displayLabel}</span>
      ) : null}

      {count > 0 || variant !== 'icon' ? (
        <span className="void-like-btn__count" aria-hidden="true">
          {loading && count === 0 ? '·' : count}
        </span>
      ) : null}
    </motion.button>
  );
}

