import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { EDITORIAL_EASE, fadeUpVariants, viewportOnce } from '../animations/motion';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { LiquidSurface } from './LiquidSurface';
import { StarLikeButton } from './StarLikeButton';

const RATING_LABELS = {
  1: 'Curioso',
  2: 'Interesante',
  3: 'Muy bueno',
  4: 'Excelente',
  5: 'Brutal',
};

const STAR_SPARKS = [
  { angle: -90, dist: 20 },
  { angle: -30, dist: 19 },
  { angle: 30, dist: 19 },
  { angle: 90, dist: 18 },
  { angle: 150, dist: 19 },
  { angle: -150, dist: 19 },
];

/**
 * Barra de valoración interactiva (1-5 estrellas + botón Me gusta) en Liquid Glass ahumado.
 * Comparte estado real con el HUD del Hero y persiste en localStorage (o endpoint remoto).
 */
export function AppreciationBar({ appreciation, config }) {
  const reducedMotion = useReducedMotionPreference();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [burstStar, setBurstStar] = useState({ star: 0, key: 0 });
  const burstTimerRef = useRef(0);

  useEffect(() => {
    return () => window.clearTimeout(burstTimerRef.current);
  }, []);

  if (!config?.enabled || !appreciation) return null;

  const {
    portfolioLiked,
    portfolioLikes,
    userRating,
    averageRating,
    ratingsCount,
    togglePortfolioLike,
    setPortfolioRating,
  } = appreciation;

  const visualStars = hoveredStar || userRating;
  const activeDescriptor = visualStars ? RATING_LABELS[visualStars] : '';

  const handleStarClick = (star) => {
    const nextRating = setPortfolioRating(star);
    if (nextRating > 0 && !reducedMotion) {
      setBurstStar((prev) => ({ star: nextRating, key: prev.key + 1 }));
      window.clearTimeout(burstTimerRef.current);
      burstTimerRef.current = window.setTimeout(() => {
        setBurstStar((prev) => ({ ...prev, star: 0 }));
      }, 650);
    }
  };

  return (
    <section
      className="appreciation-shell"
      aria-labelledby="appreciation-heading"
    >
      <div className="container">
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={{ duration: 0.72, ease: EDITORIAL_EASE }}
        >
          <LiquidSurface dark className="appreciation-card">
            <span className="anime-corner anime-corner--tl" aria-hidden="true" />
            <span className="anime-corner anime-corner--br" aria-hidden="true" />

            <div className="appreciation-card__copy">
              <div className="appreciation-card__eyebrow">
                <Sparkles size={13} aria-hidden="true" />
                <span>{config.eyebrow || 'FEEDBACK · VALORACIÓN'}</span>
                <span className="section-eyebrow__jp" aria-hidden="true">評価</span>
              </div>

              <h2 id="appreciation-heading" className="appreciation-card__title">
                {config.headline || '¿Te gustó el portafolio?'}
              </h2>

              <p className="appreciation-card__note" aria-live="polite">
                {userRating > 0
                  ? `Gracias por valorar con ${userRating}/5 ${userRating === 1 ? 'estrella' : 'estrellas'}${averageRating > 0 && ratingsCount > 1 ? ` · Promedio ${averageRating.toFixed(1)} (${ratingsCount})` : ''}.`
                  : portfolioLiked
                    ? 'Gracias por dejar tu like en esta experiencia.'
                    : config.note || 'Deja una calificación con estrellas o un like si te gustó lo que viste.'}
              </p>
            </div>

            <div className="appreciation-card__controls">
              {/* Calificación 1–5 estrellas */}
              <div className="void-rating-group">
                <div
                  className="void-stars"
                  role="radiogroup"
                  aria-label="Calificar portafolio de 1 a 5 estrellas"
                  onMouseLeave={() => setHoveredStar(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= visualStars;
                    const isSelected = star === userRating;
                    const showBurst = burstStar.star === star;

                    return (
                      <motion.button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Calificar con ${star} ${star === 1 ? 'estrella' : 'estrellas'} (${RATING_LABELS[star]})`}
                        className={`void-star-btn${filled ? ' void-star-btn--filled' : ''}${isSelected ? ' void-star-btn--selected' : ''}`}
                        onMouseEnter={() => setHoveredStar(star)}
                        onFocus={() => setHoveredStar(star)}
                        onBlur={() => setHoveredStar(0)}
                        onClick={() => handleStarClick(star)}
                        whileHover={reducedMotion ? undefined : { scale: 1.16, y: -2 }}
                        whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                      >
                        <Star
                          size={19}
                          fill={filled ? 'currentColor' : 'none'}
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />

                        <AnimatePresence>
                          {showBurst ? (
                            <span key={burstStar.key} className="void-spark-burst" aria-hidden="true">
                              {STAR_SPARKS.map((sp, idx) => {
                                const rad = (sp.angle * Math.PI) / 180;
                                return (
                                  <motion.span
                                    key={idx}
                                    className={`void-spark ${idx % 2 === 0 ? 'void-spark--ember' : 'void-spark--white'}`}
                                    style={{ width: 3, height: 3 }}
                                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                    animate={{
                                      x: Math.cos(rad) * sp.dist,
                                      y: Math.sin(rad) * sp.dist,
                                      opacity: 0,
                                      scale: 0.2,
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
                                  />
                                );
                              })}
                            </span>
                          ) : null}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>

                <span className="void-rating-caption">
                  {activeDescriptor ? (
                    <>
                      <strong>{visualStars}/5</strong> · {activeDescriptor}
                    </>
                  ) : ratingsCount > 0 ? (
                    <>
                      <strong>{averageRating.toFixed(1)}</strong> · {ratingsCount}{' '}
                      {ratingsCount === 1 ? 'voto' : 'votos'}
                    </>
                  ) : (
                    'Elige 1–5 estrellas'
                  )}
                </span>
              </div>

              <span className="appreciation-divider" aria-hidden="true" />

              {/* Botón Me gusta principal */}
              <StarLikeButton
                icon="heart"
                variant="pill"
                active={portfolioLiked}
                count={portfolioLikes}
                loading={!appreciation.remoteLoaded}
                onToggle={togglePortfolioLike}
                label="Me gustó"
                activeLabel="Te gustó"
              />
            </div>
          </LiquidSurface>
        </motion.div>
      </div>
    </section>
  );
}

