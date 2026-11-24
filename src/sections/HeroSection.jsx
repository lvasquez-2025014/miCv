import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, FolderOpen, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { EDITORIAL_EASE, lineMaskVariants } from '../animations/motion';
import { LiquidSurface } from '../components/LiquidSurface';
import { Magnetic } from '../components/Magnetic';
import { StarLikeButton } from '../components/StarLikeButton';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

const RATING_LABELS = {
  1: 'Curioso',
  2: 'Interesante',
  3: 'Muy bueno',
  4: 'Excelente',
  5: 'Brutal',
};

const STAR_SPARKS = [
  { angle: -90, dist: 16 },
  { angle: -30, dist: 15 },
  { angle: 30, dist: 15 },
  { angle: 90, dist: 14 },
  { angle: 150, dist: 15 },
  { angle: -150, dist: 15 },
];

function HeroParallaxStage({ targetRef, children }) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, 68]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.88], [1, 0.25]);

  return (
    <motion.div className="container hero__stage" style={{ y: textY, opacity: fadeOut }}>
      {children}
    </motion.div>
  );
}

export function HeroSection({
  identity,
  projects = [],
  introReady,
  appreciation,
  perf,
  onJumpToProject,
}) {
  const sectionRef = useRef(null);
  const reducedMotion = useReducedMotionPreference();
  const staticScroll = reducedMotion || Boolean(perf?.isLite);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [burstStar, setBurstStar] = useState({ star: 0, key: 0 });
  const burstTimerRef = useRef(0);
  const projectCount = projects.length;

  useEffect(() => {
    return () => window.clearTimeout(burstTimerRef.current);
  }, []);

  const { lead, accent } = identity.statement;
  const animateState = introReady ? 'visible' : 'hidden';

  const userRating = appreciation?.userRating || 0;
  const averageRating = appreciation?.averageRating || 0;
  const ratingsCount = appreciation?.ratingsCount || 0;
  const portfolioLikes = appreciation?.portfolioLikes || 0;
  const likesLoading = !appreciation?.remoteLoaded && portfolioLikes === 0;
  const visualStars = hoveredStar || userRating;

  const likesSummaryText = likesLoading
    ? 'Cargando...'
    : portfolioLikes === 0
      ? 'Sé el primero en dar me gusta'
      : portfolioLikes === 1
        ? 'Le gustó a 1 persona más'
        : `Le gustó a ${portfolioLikes} personas más`;

  const handleStarClick = (star) => {
    if (!appreciation?.setPortfolioRating) return;
    const nextRating = appreciation.setPortfolioRating(star);
    if (nextRating > 0 && !reducedMotion) {
      setBurstStar((prev) => ({ star: nextRating, key: prev.key + 1 }));
      window.clearTimeout(burstTimerRef.current);
      burstTimerRef.current = window.setTimeout(() => {
        setBurstStar((prev) => ({ ...prev, star: 0 }));
      }, 650);
    }
  };

  const stageContent = (
    <>
      <div className="hero__signature">
        {identity.role ? (
          <motion.div
            className="hero__status-pill"
            initial={{ opacity: 0, y: 10 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.65, delay: 0.08, ease: EDITORIAL_EASE }}
          >
            <span className="pulse-dot" aria-hidden="true" />
            <span>
              {identity.name ? `${identity.name} · ` : ''}
              {identity.role}
            </span>
          </motion.div>
        ) : null}

        {lead || accent ? (
          <div className="hero__title-frame">
            <span className="anime-crosshair anime-crosshair--tl anime-crosshair--storm" aria-hidden="true" />
            <span className="anime-crosshair anime-crosshair--br anime-crosshair--storm" aria-hidden="true" />

            <h1 className="hero__title hero__title--storm">
              {lead ? (
                <span className="line-mask">
                  <motion.span
                    style={{ display: 'block' }}
                    variants={lineMaskVariants}
                    initial="hidden"
                    animate={animateState}
                    custom={0.1}
                  >
                    {lead}
                  </motion.span>
                </span>
              ) : null}

              {accent ? (
                <span className="line-mask">
                  <motion.span
                    className="hero__title-accent hero__title-accent--storm"
                    style={{ display: 'block' }}
                    variants={lineMaskVariants}
                    initial="hidden"
                    animate={animateState}
                    custom={0.2}
                  >
                    {accent}
                  </motion.span>
                </span>
              ) : null}
            </h1>
          </div>
        ) : null}

        {identity.intro ? (
          <motion.p
            className="hero__intro hero__intro--storm"
            initial={{ opacity: 0, y: 14 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.7, delay: 0.26, ease: EDITORIAL_EASE }}
          >
            {identity.intro}
          </motion.p>
        ) : null}

        <motion.div
          className="hero__focus-tags"
          initial={{ opacity: 0, y: 12 }}
          animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.68, delay: 0.31, ease: EDITORIAL_EASE }}
          aria-label="Áreas actuales de desarrollo"
        >
          {/* <span className="hero__focus-tag">Web Apps</span>
          <span className="hero__focus-tag">APIs &amp; Auth</span>
          <span className="hero__focus-tag">C++ / libcurl</span> */}
        </motion.div>

        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 14 }}
          animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.7, delay: 0.36, ease: EDITORIAL_EASE }}
        >
          <Magnetic strength={0.22}>
            <a href="#proyectos" className="btn-cobalt">
              <FolderOpen size={15} />
              <span>Ver proyectos</span>
              <ArrowUpRight size={15} />
            </a>
          </Magnetic>

          <Magnetic strength={0.18}>
            <a href="#sobre-mi" className="btn-storm-glass">
              <span>Sobre mí</span>
              <ArrowDownRight size={15} />
            </a>
          </Magnetic>
        </motion.div>
      </div>

      {/* Columna central libre para The Void + indicador sutil de scroll en PC */}
      <div className="hero__center-spacer" aria-hidden="true">
        <a href="#proyectos" className="hero__scroll-cue" tabIndex={-1}>
          <span className="hero__scroll-cue-line" />
          <span>Explorar</span>
        </a>
      </div>

      {/* Columna derecha en PC: índice rápido arriba + cápsula de archivo/valoración abajo */}
      <div className="hero__right-rail">
        {projects.length > 0 ? (
          <motion.div
            className="hero__builds-slot"
            initial={{ opacity: 0, y: -14 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -14 }}
            transition={{ duration: 0.75, delay: 0.3, ease: EDITORIAL_EASE }}
          >
            <LiquidSurface dark className="hero-builds-card">
              <div className="hero-builds-card__head">
                <span className="hero-builds-card__tag">Proyectos activos</span>
                <span className="hero-builds-card__count">
                  {String(projectCount).padStart(2, '0')}
                </span>
              </div>

              <div className="hero-builds-card__list">
                {projects.slice(0, 3).map((project) => {
                  const stars = appreciation?.projectLikes?.[project.id] || 0;
                  return (
                    <button
                      key={project.id}
                      type="button"
                      className="hero-builds-card__item"
                      onClick={() => onJumpToProject?.(project.id)}
                    >
                      <span className="hero-builds-card__idx">{project.indexLabel}</span>
                      <span className="hero-builds-card__info">
                        <span className="hero-builds-card__name">{project.title}</span>
                        <span className="hero-builds-card__meta">
                          {project.status || project.category}
                          {stars > 0 ? ` · ★ ${stars}` : ''}
                        </span>
                      </span>
                      <ArrowUpRight size={14} className="hero-builds-card__arrow" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </LiquidSurface>
          </motion.div>
        ) : null}

        {/* Tarjeta minimalista de me gusta y valoración en Liquid Glass */}
        {appreciation ? (
          <motion.div
            className="hero__hud-slot"
            initial={{ opacity: 0, y: 20 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.38, ease: EDITORIAL_EASE }}
          >
            <LiquidSurface dark className="hero-system-hud hero-system-hud--minimal">
              <div className="hero-system-hud__like-row">
                <span className="hero-system-hud__likes-text" aria-live="polite">
                  {likesSummaryText}
                </span>

                <StarLikeButton
                  icon="heart"
                  variant="hud"
                  showCount={false}
                  active={appreciation.portfolioLiked}
                  count={portfolioLikes}
                  loading={!appreciation.remoteLoaded}
                  onToggle={appreciation.togglePortfolioLike}
                  label="Me gusta"
                  activeLabel="Te gustó"
                />
              </div>

              <div className="hero-system-hud__stars-row">
                <div
                  className="void-stars void-stars--hud"
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
                        className={`void-star-btn void-star-btn--hud${filled ? ' void-star-btn--filled' : ''}${isSelected ? ' void-star-btn--selected' : ''}`}
                        onMouseEnter={() => setHoveredStar(star)}
                        onFocus={() => setHoveredStar(star)}
                        onBlur={() => setHoveredStar(0)}
                        onClick={() => handleStarClick(star)}
                        whileHover={reducedMotion ? undefined : { scale: 1.14, y: -1 }}
                        whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                      >
                        <Star
                          size={16}
                          fill={filled ? 'currentColor' : 'none'}
                          strokeWidth={1.8}
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
                                    style={{ width: 2.6, height: 2.6 }}
                                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                    animate={{
                                      x: Math.cos(rad) * sp.dist,
                                      y: Math.sin(rad) * sp.dist,
                                      opacity: 0,
                                      scale: 0.2,
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
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

                {ratingsCount > 0 ? (
                  <span className="hero-system-hud__score" title={`${ratingsCount} valoraciones`}>
                    {averageRating.toFixed(1)}
                  </span>
                ) : null}
              </div>
            </LiquidSurface>
          </motion.div>
        ) : null}
      </div>
    </>
  );

  return (
    <header id="inicio" ref={sectionRef} className="hero hero--hyperframes">
      {/* En gama baja omite useScroll/useTransform para mantener scroll nativo puro */}
      {staticScroll ? (
        <div className="container hero__stage">{stageContent}</div>
      ) : (
        <HeroParallaxStage targetRef={sectionRef}>{stageContent}</HeroParallaxStage>
      )}
    </header>
  );
}
