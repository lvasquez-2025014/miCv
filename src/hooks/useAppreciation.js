import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_STORAGE_KEY,
  fetchRemoteAppreciation,
  normalizeAppreciationState,
  playStarChime,
  readLocalAppreciation,
  sendRemoteAppreciation,
  writeLocalAppreciation,
} from '../services/appreciationService';

/**
 * Hook compartido para likes del portafolio, calificación de 1-5 estrellas
 * y estrellas por proyecto. Sincroniza en tiempo real entre Hero, Proyectos y Footer,
 * así como entre pestañas abiertas del navegador.
 */
export function useAppreciation(config, { soundEnabled = false } = {}) {
  const storageKey = config?.storageKey || DEFAULT_STORAGE_KEY;
  const endpoint = config?.endpoint || '';

  const [state, setState] = useState(() => normalizeAppreciationState(null));
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Hidratación segura tras montar (evita desajustes SSR/CSR) + carga opcional remota
  useEffect(() => {
    const local = readLocalAppreciation(storageKey);
    setState(local);
    setHydrated(true);

    if (!endpoint) return undefined;

    const controller = new AbortController();
    fetchRemoteAppreciation(endpoint, controller.signal).then((remote) => {
      if (!remote) return;
      setState((prev) => {
        const merged = normalizeAppreciationState({
          ...prev,
          portfolioLikes: Math.max(prev.portfolioLiked ? 1 : 0, remote.portfolioLikes),
          ratingSum: Math.max(prev.userRating, remote.ratingSum),
          ratingsCount: Math.max(prev.userRating > 0 ? 1 : 0, remote.ratingsCount),
          projectLikes: remote.projectLikes
            ? { ...prev.projectLikes, ...remote.projectLikes }
            : prev.projectLikes,
          mode: 'remote',
        });
        writeLocalAppreciation(merged, storageKey);
        return merged;
      });
    });

    return () => controller.abort();
  }, [storageKey, endpoint]);

  // Sincronización entre pestañas
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onStorage = (event) => {
      if (event.key !== storageKey) return;
      setState(readLocalAppreciation(storageKey));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  const applyRemotePatch = useCallback(
    (patch) => {
      if (!patch) return;
      setState((prev) => {
        const next = normalizeAppreciationState({
          ...prev,
          ...(patch.portfolioLikes !== undefined ? { portfolioLikes: patch.portfolioLikes } : {}),
          ...(patch.ratingSum !== undefined ? { ratingSum: patch.ratingSum } : {}),
          ...(patch.ratingsCount !== undefined ? { ratingsCount: patch.ratingsCount } : {}),
          ...(patch.projectLikes ? { projectLikes: { ...prev.projectLikes, ...patch.projectLikes } } : {}),
          mode: 'remote',
        });
        writeLocalAppreciation(next, storageKey);
        return next;
      });
    },
    [storageKey]
  );

  const togglePortfolioLike = useCallback(() => {
    const prev = stateRef.current;
    const nextLiked = !prev.portfolioLiked;
    const delta = nextLiked ? 1 : -1;
    const next = normalizeAppreciationState({
      ...prev,
      portfolioLiked: nextLiked,
      portfolioLikes: Math.max(0, prev.portfolioLikes + delta),
    });

    setState(next);
    writeLocalAppreciation(next, storageKey);

    if (soundEnabled && nextLiked) {
      playStarChime(5);
    }

    if (endpoint) {
      sendRemoteAppreciation(endpoint, {
        type: 'portfolio-like',
        liked: nextLiked,
        delta,
      }).then(applyRemotePatch);
    }

    return nextLiked;
  }, [storageKey, endpoint, soundEnabled, applyRemotePatch]);

  const setPortfolioRating = useCallback(
    (stars) => {
      const prev = stateRef.current;
      const clamped = Math.max(0, Math.min(5, Math.round(Number(stars) || 0)));
      // Si se vuelve a pulsar la misma estrella activa, permite retirar la calificación
      const nextRating = prev.userRating === clamped ? 0 : clamped;

      const hadRating = prev.userRating > 0;
      const hasRating = nextRating > 0;

      const nextCount = Math.max(
        0,
        prev.ratingsCount + (hasRating && !hadRating ? 1 : !hasRating && hadRating ? -1 : 0)
      );
      const nextSum = Math.max(0, prev.ratingSum - prev.userRating + nextRating);

      const next = normalizeAppreciationState({
        ...prev,
        userRating: nextRating,
        ratingsCount: nextCount,
        ratingSum: nextSum,
      });

      setState(next);
      writeLocalAppreciation(next, storageKey);

      if (soundEnabled && nextRating > 0) {
        playStarChime(nextRating);
      }

      if (endpoint) {
        sendRemoteAppreciation(endpoint, {
          type: 'portfolio-rating',
          previousRating: prev.userRating,
          rating: nextRating,
        }).then(applyRemotePatch);
      }

      return nextRating;
    },
    [storageKey, endpoint, soundEnabled, applyRemotePatch]
  );

  const toggleProjectLike = useCallback(
    (projectId) => {
      if (!projectId) return false;
      const prev = stateRef.current;
      const wasLiked = Boolean(prev.likedProjects[projectId]);
      const nextLiked = !wasLiked;
      const delta = nextLiked ? 1 : -1;

      const nextLikedProjects = { ...prev.likedProjects };
      if (nextLiked) nextLikedProjects[projectId] = true;
      else delete nextLikedProjects[projectId];

      const currentCount = prev.projectLikes[projectId] || 0;
      const nextProjectLikes = {
        ...prev.projectLikes,
        [projectId]: Math.max(0, currentCount + delta),
      };

      const next = normalizeAppreciationState({
        ...prev,
        likedProjects: nextLikedProjects,
        projectLikes: nextProjectLikes,
      });

      setState(next);
      writeLocalAppreciation(next, storageKey);

      if (soundEnabled && nextLiked) {
        playStarChime(4);
      }

      if (endpoint) {
        sendRemoteAppreciation(endpoint, {
          type: 'project-like',
          projectId,
          liked: nextLiked,
          delta,
        }).then(applyRemotePatch);
      }

      return nextLiked;
    },
    [storageKey, endpoint, soundEnabled, applyRemotePatch]
  );

  const averageRating = useMemo(() => {
    if (!state.ratingsCount) return 0;
    return Math.round((state.ratingSum / state.ratingsCount) * 10) / 10;
  }, [state.ratingSum, state.ratingsCount]);

  return {
    ...state,
    averageRating,
    hydrated,
    togglePortfolioLike,
    setPortfolioRating,
    toggleProjectLike,
  };
}

