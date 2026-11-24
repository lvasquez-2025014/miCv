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
  const [remoteLoaded, setRemoteLoaded] = useState(!endpoint);
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastRemoteFetchRef = useRef(0);
  const mutationSeqRef = useRef(0);

  const applyRemoteTotals = useCallback(
    (remote, expectedSeq) => {
      setRemoteLoaded(true);
      if (!remote || expectedSeq !== mutationSeqRef.current) return;
      setState((prev) => {
        const remoteProjectLikes = remote.projectLikes || {};
        const syncedLikedProjects = {};
        for (const id of Object.keys(prev.likedProjects || {})) {
          if ((remoteProjectLikes[id] || 0) > 0) syncedLikedProjects[id] = true;
        }

        const remoteViewClicks = remote.projectViewClicks || {};
        const syncedClickedViews = {};
        for (const key of Object.keys(prev.clickedProjectViews || {})) {
          if ((remoteViewClicks[key] || 0) > 0) syncedClickedViews[key] = true;
        }

        const merged = normalizeAppreciationState({
          ...prev,
          portfolioLiked: remote.portfolioLikes > 0 ? prev.portfolioLiked : false,
          userRating: remote.ratingsCount > 0 ? prev.userRating : 0,
          likedProjects: syncedLikedProjects,
          clickedProjectViews: syncedClickedViews,
          portfolioLikes: remote.portfolioLikes,
          ratingSum: remote.ratingSum,
          ratingsCount: remote.ratingsCount,
          projectLikes: remoteProjectLikes,
          projectViewClicks: remoteViewClicks,
          mode: 'remote',
        });
        writeLocalAppreciation(merged, storageKey);
        return merged;
      });
    },
    [storageKey]
  );

  // Hidratación segura tras montar (evita desajustes SSR/CSR) + sincronización MongoDB
  useEffect(() => {
    const local = readLocalAppreciation(storageKey);
    setState(local);
    setHydrated(true);

    if (!endpoint) {
      setRemoteLoaded(true);
      return undefined;
    }

    const controller = new AbortController();
    const seqAtStart = mutationSeqRef.current;
    lastRemoteFetchRef.current = Date.now();
    fetchRemoteAppreciation(endpoint, controller.signal).then((remote) =>
      applyRemoteTotals(remote, seqAtStart)
    );

    const refresh = () => {
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      if (Date.now() - lastRemoteFetchRef.current < 15000) return;
      const seq = mutationSeqRef.current;
      lastRemoteFetchRef.current = Date.now();
      fetchRemoteAppreciation(endpoint).then((remote) => applyRemoteTotals(remote, seq));
    };

    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      controller.abort();
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [storageKey, endpoint, applyRemoteTotals]);

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
          ...(patch.projectLikes !== undefined ? { projectLikes: patch.projectLikes } : {}),
          ...(patch.projectViewClicks !== undefined
            ? { projectViewClicks: patch.projectViewClicks }
            : {}),
          mode: 'remote',
        });
        writeLocalAppreciation(next, storageKey);
        return next;
      });
    },
    [storageKey]
  );

  const togglePortfolioLike = useCallback(() => {
    mutationSeqRef.current += 1;
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
      mutationSeqRef.current += 1;
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
      mutationSeqRef.current += 1;
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

  const recordProjectViewClick = useCallback(
    (projectId, view) => {
      if (!projectId || (view !== 'live' && view !== 'capture')) return false;
      const key = `${projectId}__${view}`;
      const prev = stateRef.current;
      if (prev.clickedProjectViews?.[key]) return false;

      mutationSeqRef.current += 1;
      const nextClickedViews = {
        ...prev.clickedProjectViews,
        [key]: true,
      };
      const nextViewClicks = {
        ...prev.projectViewClicks,
        [key]: (prev.projectViewClicks?.[key] || 0) + 1,
      };

      const next = normalizeAppreciationState({
        ...prev,
        clickedProjectViews: nextClickedViews,
        projectViewClicks: nextViewClicks,
      });

      setState(next);
      writeLocalAppreciation(next, storageKey);

      if (endpoint) {
        sendRemoteAppreciation(endpoint, {
          type: 'project-view-click',
          projectId,
          view,
        }).then(applyRemotePatch);
      }

      return true;
    },
    [storageKey, endpoint, applyRemotePatch]
  );

  const averageRating = useMemo(() => {
    if (!state.ratingsCount) return 0;
    return Math.round((state.ratingSum / state.ratingsCount) * 10) / 10;
  }, [state.ratingSum, state.ratingsCount]);

  return {
    ...state,
    averageRating,
    hydrated,
    remoteLoaded,
    togglePortfolioLike,
    setPortfolioRating,
    toggleProjectLike,
    recordProjectViewClick,
  };
}

