import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds) {
  const [activeId, setActiveId] = useState(sectionIds[0] || 'inicio');

  useEffect(() => {
    if (!sectionIds.length || typeof IntersectionObserver === 'undefined') return undefined;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return undefined;

    const visibilityMap = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibilityMap.set(entry.target.id, entry.intersectionRatio);
        });

        let bestId = activeId;
        let maxRatio = -1;

        sectionIds.forEach((id) => {
          const ratio = visibilityMap.get(id) ?? 0;
          if (ratio > maxRatio) {
            maxRatio = ratio;
            bestId = id;
          }
        });

        if (maxRatio > 0) {
          setActiveId(bestId);
        }
      },
      {
        rootMargin: '-22% 0px -35% 0px',
        threshold: [0, 0.15, 0.35, 0.6, 0.85],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds.join('|')]);

  return activeId;
}

