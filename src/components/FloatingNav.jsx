import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { LiquidNavbar, NimbusIcons } from './liquid-navbar/LiquidNavbar';

const SECTION_VISUALS = {
  inicio: { icon: NimbusIcons.home, fx: 'glow' },
  proyectos: { icon: NimbusIcons.folder, fx: 'drop' },
  'sobre-mi': { icon: NimbusIcons.user, fx: 'wave' },
  experiencia: { icon: NimbusIcons.globe, fx: 'spin' },
  contacto: { icon: NimbusIcons.plane, fx: 'plane' },
};

export function FloatingNav({ sections, activeSection, sound = false, perf }) {
  const [lockedIndex, setLockedIndex] = useState(null);
  const lockTimerRef = useRef(0);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  const navItems = useMemo(
    () =>
      sections.map((section) => {
        const preset = SECTION_VISUALS[section.id] || {
          icon: NimbusIcons.drop,
          fx: 'pop',
        };
        return {
          label: section.label,
          href: `#${section.id}`,
          icon: preset.icon,
          fx: preset.fx,
        };
      }),
    [sections]
  );

  const observedIndex = useMemo(() => {
    const idx = sections.findIndex((section) => section.id === activeSection);
    return idx >= 0 ? idx : 0;
  }, [sections, activeSection]);

  const activeIndex = lockedIndex ?? observedIndex;

  useEffect(() => {
    return () => {
      window.clearTimeout(lockTimerRef.current);
    };
  }, []);

  const handleSelect = (index) => {
    setLockedIndex(index);
    window.clearTimeout(lockTimerRef.current);
    lockTimerRef.current = window.setTimeout(() => {
      setLockedIndex(null);
    }, 850);
  };

  return (
    <>
      <div className="nav-wrap">
        <div className="nav-wrap__inner">
          <LiquidNavbar
            items={navItems}
            active={activeIndex}
            onChange={handleSelect}
            tone="dark"
            perfTier={perf?.tier || 'high'}
            sound={sound}
            ariaLabel="Navegación principal"
          />
        </div>
      </div>

      {/* Riel lateral discreto de progreso de lectura (solo escritorio) */}
      {!perf?.isMobileTier ? (
        <div className="scroll-rail" aria-hidden="true">
          <motion.div className="scroll-rail__fill" style={{ scaleY: smoothProgress }} />
        </div>
      ) : null}
    </>
  );
}
