/**
 * Curvas y variantes de movimiento compartidas.
 * Diseñadas con inercia editorial rápida en salida y desaceleración prolongada.
 */

export const EDITORIAL_EASE = [0.16, 1, 0.3, 1];
export const SMOOTH_EASE = [0.22, 1, 0.36, 1];

export const SPRING_MAGNETIC = {
  stiffness: 240,
  damping: 20,
  mass: 0.4,
};

export const SPRING_CURSOR = {
  stiffness: 380,
  damping: 32,
  mass: 0.35,
};

export const SPRING_DRAWER = {
  type: 'spring',
  stiffness: 290,
  damping: 32,
  mass: 0.85,
};

export const lineMaskVariants = {
  hidden: {
    y: '110%',
    opacity: 0,
  },
  visible: (delay = 0) => ({
    y: '0%',
    opacity: 1,
    transition: {
      duration: 0.9,
      delay,
      ease: EDITORIAL_EASE,
    },
  }),
};

export const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 26,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      delay,
      ease: EDITORIAL_EASE,
    },
  }),
};

export const viewportOnce = {
  once: true,
  amount: 0.18,
};

