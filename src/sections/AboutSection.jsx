import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { EDITORIAL_EASE, fadeUpVariants, viewportOnce } from '../animations/motion';
import { LiquidSurface } from '../components/LiquidSurface';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

export function AboutSection({ about, perf }) {
  const statementRef = useRef(null);
  const reducedMotion = useReducedMotionPreference();
  const skipScrub = reducedMotion || Boolean(perf?.isLite);

  useEffect(() => {
    if (!about?.headline || skipScrub || !statementRef.current) return undefined;

    const words = statementRef.current.querySelectorAll('.scrub-word');
    if (!words.length) return undefined;

    let cancelled = false;
    let ctx = null;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        if (cancelled || !statementRef.current) return;
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          gsap.fromTo(
            words,
            { opacity: 0.25 },
            {
              opacity: 1,
              stagger: 0.08,
              ease: 'none',
              scrollTrigger: {
                trigger: statementRef.current,
                start: 'top 84%',
                end: 'bottom 52%',
                scrub: true,
              },
            }
          );
        }, statementRef);
      }
    );

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [about?.headline, skipScrub]);

  if (!about) return null;

  const headlineWords = about.headline ? about.headline.split(/\s+/).filter(Boolean) : [];

  return (
    <section id="sobre-mi" className="section-shell" aria-labelledby="sobre-mi-heading">
      <div className="container">
        <motion.div
          className="section-header"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="section-eyebrow">
            <span className="section-eyebrow__index">02</span>
            <span id="sobre-mi-heading">Sobre mí</span>
            <span className="section-eyebrow__jp" aria-hidden="true">輪郭</span>
          </div>

          <div>
            {headlineWords.length > 0 ? (
              <p ref={statementRef} className="scrub-statement">
                {headlineWords.map((word, idx) => (
                  <span key={`${word}-${idx}`} className="scrub-word">
                    {word}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </motion.div>

        {/* Escena arquitectónica anime enmarcada en vidrio líquido */}
        <motion.div
          className="anime-scene-banner liquid-panel"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.8, ease: EDITORIAL_EASE }}
        >
          <span className="anime-corner anime-corner--tl" aria-hidden="true" />
          <span className="anime-corner anime-corner--tr" aria-hidden="true" />
          <span className="anime-corner anime-corner--bl" aria-hidden="true" />
          <span className="anime-corner anime-corner--br" aria-hidden="true" />

          <picture className="anime-scene-banner__picture">
            <source media="(max-width: 900px)" srcSet="/anime/system-horizon-mobile.jpg" />
            <img
              src={perf?.isMobileTier ? '/anime/system-horizon-mobile.jpg' : '/anime/system-horizon.jpg'}
              alt="Escena arquitectónica minimalista en vidrio y niebla plata"
              className="anime-scene-banner__img"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="anime-scene-banner__veil" aria-hidden="true" />
          <div className="anime-scene-banner__meta">
            <span className="anime-scene-banner__code">SCENE 02 // OBSERVATORY</span>
            <span className="anime-scene-banner__jp" aria-hidden="true">静寂と構造</span>
          </div>
        </motion.div>

        <div className="about-grid">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.72, ease: EDITORIAL_EASE }}
          >
            <LiquidSurface className="about-bio-panel">
              <div className="panel-head">
                <span className="panel-label">Perfil y enfoque</span>
                {about.isPlaceholder ? (
                  <span className="placeholder-tag">Por completar</span>
                ) : null}
              </div>

              {about.bio ? <p className="about-bio">{about.bio}</p> : null}

              {about.interests.length > 0 ? (
                <div className="interests-list">
                  {about.interests.map((interest) => (
                    <div key={interest.id} className="interest-row">
                      <span className="interest-row__idx">{interest.indexLabel}</span>
                      <div>
                        <h3 className="interest-row__title">{interest.title}</h3>
                        {interest.detail ? (
                          <p className="interest-row__detail">{interest.detail}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </LiquidSurface>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.72, delay: 0.1, ease: EDITORIAL_EASE }}
          >
            <LiquidSurface className="about-skills-panel">
              <div className="panel-head">
                <span className="panel-label">Habilidades y herramientas</span>
              </div>

              <div className="skill-groups">
                {about.skillGroups.map((group) => (
                  <div key={group.id} className="skill-group">
                    <h3 className="skill-group__title">{group.category}</h3>
                    <div className="chip-list">
                      {group.items.map((item) => (
                        <span key={item} className="glass-chip">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </LiquidSurface>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
