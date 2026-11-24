import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { SPRING_CURSOR } from '../animations/motion';
import { useFinePointer } from '../hooks/useFinePointer';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

export function PrecisionCursor() {
  const isFine = useFinePointer();
  const reducedMotion = useReducedMotionPreference();
  const enabled = isFine && !reducedMotion;

  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [label, setLabel] = useState('');

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, SPRING_CURSOR);
  const ringY = useSpring(dotY, SPRING_CURSOR);

  useEffect(() => {
    if (!enabled) return undefined;

    const onMove = (event) => {
      dotX.set(event.clientX);
      dotY.set(event.clientY);
      setVisible(true);

      const target = event.target;
      if (!(target instanceof Element)) return;

      const labelNode = target.closest('[data-cursor-label]');
      if (labelNode) {
        setLabel(labelNode.getAttribute('data-cursor-label') || '');
        setInteractive(true);
        return;
      }

      const activeNode = target.closest('a, button, [data-cursor="active"]');
      setLabel('');
      setInteractive(Boolean(activeNode));
    };

    const onLeave = () => {
      setVisible(false);
      setInteractive(false);
      setLabel('');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled, dotX, dotY]);

  if (!enabled || !visible) return null;

  const ringClass = [
    'precision-cursor-ring',
    label ? 'precision-cursor-ring--label' : interactive ? 'precision-cursor-ring--active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="precision-cursor-dot"
        style={{ x: dotX, y: dotY, opacity: label ? 0 : 1 }}
      />
      <motion.div
        aria-hidden="true"
        className={ringClass}
        style={{ x: ringX, y: ringY }}
      >
        {label ? <span className="precision-cursor-label">{label}</span> : null}
      </motion.div>
    </>
  );
}
