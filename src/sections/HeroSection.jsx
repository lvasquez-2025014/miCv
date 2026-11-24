import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, FolderOpen } from 'lucide-react';
import { EDITORIAL_EASE, lineMaskVariants } from '../animations/motion';
import { HyperframesHeroStage } from '../components/HyperframesHeroStage';
import { LiquidSurface } from '../components/LiquidSurface';
import { Magnetic } from '../components/Magnetic';
import { StarLikeButton } from '../components/StarLikeButton';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

export function HeroSection({ identity, projectCount, introReady, appreciation, perf }) {
  const sectionRef = useRef(null);
  const reducedMotion = useReducedMotionPreference();
  const staticScroll = reducedMotion || Boolean(perf?.isLite);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, staticScroll ? 0 : 68]);
  const artY = useTransform(scrollYProgress, [0, 1], [0, staticScroll ? 0 : 44]);
  const artScale = useTransform(scrollYProgress, [0, 1], [1.0, staticScroll ? 1.0 : 1.06]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.88], [1, staticScroll ? 1 : 0.25]);

  const { lead, accent } = identity.statement;
  const animateState = introReady ? 'visible' : 'hidden';

  return (
    <header id="inicio" ref={sectionRef} className="hero hero--hyperframes">
      {/* Composición animada portada desde hyperframes/compositions/hero-scene.html */}
      <HyperframesHeroStage
        introReady={introReady}
        scrollY={artY}
        scrollScale={artScale}
        perf={perf}
      />

      {/* Sello vertical japonés */}
      <div className="anime-vertical-stamp anime-vertical-stamp--light" aria-hidden="true">
        <span>第一幕 · 序章</span>
        <span className="anime-vertical-stamp__line" />
        <span>創造と知能のシステム</span>
      </div>

      {/* Contenido editorial + cápsula Liquid Glass */}
      <motion.div
        className="container hero__stage"
        style={staticScroll ? undefined : { y: textY, opacity: fadeOut }}
      >
        <div className="hero__editorial">
          <motion.div
            className="hero__pill-row"
            initial={{ opacity: 0, y: 12 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.7, delay: 0.06, ease: EDITORIAL_EASE }}
          >
            <span className="hero__role-pill hero__role-pill--storm">
              <span className="pulse-dot" aria-hidden="true" />
              <span>{identity.role || 'Creative Developer'}</span>
            </span>

            {identity.isPlaceholder ? (
              <span className="placeholder-tag placeholder-tag--obsidian">Perfil editable</span>
            ) : null}
          </motion.div>

          {identity.sceneTag ? (
            <motion.p
              className="hero__system-line hero__system-line--storm"
              initial={{ opacity: 0, y: 10 }}
              animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.7, delay: 0.12, ease: EDITORIAL_EASE }}
            >
              <span className="hero__system-rule" aria-hidden="true" />
              <span>{identity.sceneTag}</span>
              <span className="hero__system-rule" aria-hidden="true" />
            </motion.p>
          ) : null}

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
                    custom={0.22}
                  >
                    {accent}
                  </motion.span>
                </span>
              ) : null}
            </h1>
          </div>

          {identity.intro ? (
            <motion.p
              className="hero__intro hero__intro--storm"
              initial={{ opacity: 0, y: 18 }}
              animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ duration: 0.75, delay: 0.3, ease: EDITORIAL_EASE }}
            >
              {identity.intro}
            </motion.p>
          ) : null}

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 18 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.75, delay: 0.38, ease: EDITORIAL_EASE }}
          >
            <Magnetic strength={0.22}>
              <a href="#proyectos" className="btn-cobalt">
                <FolderOpen size={16} />
                <span>Explorar proyectos</span>
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

          <motion.div
            className="hero__meta-strip hero__meta-strip--storm"
            initial={{ opacity: 0 }}
            animate={introReady ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.85, delay: 0.5 }}
          >
            <span>{identity.name}</span>
            {identity.location ? <span>{identity.location}</span> : null}
            {identity.availability ? <span>{identity.availability}</span> : null}
          </motion.div>
        </div>

        {/* Cápsula flotante Liquid Glass sobre la escena HyperFrames */}
        <motion.div
          className="hero__hud-slot"
          initial={{ opacity: 0, y: 22 }}
          animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          transition={{ duration: 0.85, delay: 0.42, ease: EDITORIAL_EASE }}
        >
          <LiquidSurface dark className="hero-system-hud hero-system-hud--storm">
            <span className="anime-corner anime-corner--tl" aria-hidden="true" />
            <span className="anime-corner anime-corner--tr" aria-hidden="true" />
            <span className="anime-corner anime-corner--bl" aria-hidden="true" />
            <span className="anime-corner anime-corner--br" aria-hidden="true" />

            <div className="hero-system-hud__top">
              <span className="hero-system-hud__tag">[ SYSTEM · ARCHIVE ]</span>
              <span className="hero-system-hud__jp">作品目録</span>
            </div>

            <div className="hero-system-hud__row">
              <div className="cinema-caption">
                <span className="cinema-caption__label">Carpetas interactivas</span>
                <strong className="cinema-caption__value">
                  {String(projectCount).padStart(2, '0')}{' '}
                  {projectCount === 1 ? 'proyecto' : 'proyectos'}
                </strong>
              </div>

              <a href="#proyectos" className="cinema-jump cinema-jump--storm" aria-label="Abrir galería de proyectos">
                <span>Abrir</span>
                <ArrowUpRight size={14} />
              </a>
            </div>

            {appreciation ? (
              <div className="hero-system-hud__like-row">
                <span className="hero-system-hud__like-hint">
                  {appreciation.userRating > 0
                    ? `Valorado · ${appreciation.userRating}/5 ★`
                    : '¿Te gustó la escena?'}
                </span>

                <StarLikeButton
                  icon="heart"
                  variant="hud"
                  active={appreciation.portfolioLiked}
                  count={appreciation.portfolioLikes}
                  onToggle={appreciation.togglePortfolioLike}
                  label="Me gusta"
                  activeLabel="Te gustó"
                />
              </div>
            ) : null}
          </LiquidSurface>
        </motion.div>
      </motion.div>
    </header>
  );
}
