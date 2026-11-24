import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { SPRING_MAGNETIC } from '../animations/motion';
import { useFinePointer } from '../hooks/useFinePointer';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

function MagneticActive({ children, strength, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, SPRING_MAGNETIC);
  const smoothY = useSpring(y, SPRING_MAGNETIC);

  const handleMouseMove = (event) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', x: smoothX, y: smoothY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.span>
  );
}

/**
 * En pantallas táctiles evita instanciar motionValues y springs innecesarios.
 */
export function Magnetic({ children, strength = 0.28, className = '' }) {
  const isFine = useFinePointer();
  const reducedMotion = useReducedMotionPreference();

  if (!isFine || reducedMotion) {
    return <span className={`magnetic-static${className ? ` ${className}` : ''}`}>{children}</span>;
  }

  return (
    <MagneticActive strength={strength} className={className}>
      {children}
    </MagneticActive>
  );
}
