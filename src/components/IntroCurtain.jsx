import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EDITORIAL_EASE } from '../animations/motion';
import { GlassReveal21st } from './glass-reveal/GlassIconReveal';

export function IntroCurtain({ identity, reducedMotion, onComplete }) {
  const [visible, setVisible] = useState(!reducedMotion);
  const doneRef = useRef(false);
  const exitTimerRef = useRef(0);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    window.clearTimeout(exitTimerRef.current);
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

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

    // Respaldo de seguridad por si el dispositivo pausa rAF
    const failsafe = window.setTimeout(finish, 6000);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(failsafe);
      window.clearTimeout(exitTimerRef.current);
    };
  }, [reducedMotion, visible, finish]);

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
          exit={{
            opacity: 0,
            scale: 1.03,
            filter: 'blur(12px)',
            transition: { duration: 0.72, ease: EDITORIAL_EASE },
          }}
        >
          <GlassReveal21st
            logo={identity.introLogo || undefined}
            loop={false}
            speed={1.2}
            tileSize={280}
            onFinish={handleRevealFinish}
            className="intro-curtain__stage"
            label={identity.isPlaceholder ? 'Animación de apertura' : identity.name}
          />

          <button
            type="button"
            className="intro-skip-btn"
            onClick={finish}
          >
            Saltar
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
