import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EDITORIAL_EASE } from '../animations/motion';

export function IntroCurtain({ identity, reducedMotion, perf, onComplete }) {
  const isLite = Boolean(perf?.isLite);
  const isMobile = Boolean(perf?.isMobileTier);
  const [visible, setVisible] = useState(!reducedMotion);
  const [RevealComponent, setRevealComponent] = useState(null);
  const doneRef = useRef(false);
  const exitTimerRef = useRef(0);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    window.clearTimeout(exitTimerRef.current);
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

  // Carga bajo demanda del shader WebGL2 solo en dispositivos no-lite
  useEffect(() => {
    if (reducedMotion || isLite || !visible) return undefined;
    let active = true;
    import('./glass-reveal/GlassIconReveal')
      .then((mod) => {
        if (active) setRevealComponent(() => mod.GlassReveal21st);
      })
      .catch(() => {
        if (active) finish();
      });
    return () => {
      active = false;
    };
  }, [reducedMotion, isLite, visible, finish]);

  useEffect(() => {
    if (reducedMotion) {
      finish();
      return undefined;
    }
    if (!visible) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        finish();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    // En gama baja: apertura ligera GPU-only (620ms) sin descargar WebGL2 ni calcular SDF 1024×1024
    const failsafe = window.setTimeout(finish, isLite ? 620 : 6000);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(failsafe);
      window.clearTimeout(exitTimerRef.current);
    };
  }, [reducedMotion, visible, isLite, finish]);

  const handleRevealFinish = useCallback(() => {
    window.clearTimeout(exitTimerRef.current);
    exitTimerRef.current = window.setTimeout(finish, 360);
  }, [finish]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="intro-curtain"
          initial={{ opacity: 1 }}
          exit={
            isMobile
              ? {
                  opacity: 0,
                  transition: { duration: 0.42, ease: EDITORIAL_EASE },
                }
              : {
                  opacity: 0,
                  scale: 1.03,
                  filter: 'blur(12px)',
                  transition: { duration: 0.72, ease: EDITORIAL_EASE },
                }
          }
        >
          {isLite ? (
            <motion.div
              className="intro-lite-emblem"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.42, ease: EDITORIAL_EASE }}
              aria-hidden="true"
            >
              <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
                <path
                  d="M32 6L54 32L32 58L10 32L32 6Z"
                  fill="#020304"
                  stroke="#C8DCD8"
                  strokeOpacity="0.48"
                  strokeWidth="1.5"
                />
                <circle cx="26" cy="31.5" r="2.1" fill="#F2F7F6" />
                <circle cx="38" cy="31.5" r="2.1" fill="#F2F7F6" />
              </svg>
            </motion.div>
          ) : RevealComponent ? (
            <RevealComponent
              logo={identity.introLogo || undefined}
              loop={false}
              speed={1.2}
              tileSize={isMobile ? 240 : 280}
              maxDpr={isMobile ? 1.5 : 2}
              onFinish={handleRevealFinish}
              className="intro-curtain__stage"
              label={identity.isPlaceholder ? 'Animación de apertura' : identity.name}
            />
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
