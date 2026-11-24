import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Maximize2, RotateCw } from 'lucide-react';

const DESKTOP_W = 1280;
const DESKTOP_H = 800;

function formatHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return String(url || '').replace(/^https?:\/\//, '');
  }
}

/**
 * Visor Liquid Glass con iframe responsivo escalado desde 1280×800 para mostrar
 * aplicaciones web en vivo con proporción de escritorio real y póster de respaldo.
 */
export function LiveIframePreview({
  url,
  title = 'Vista en vivo',
  poster = '',
  compact = false,
  onExpand,
  className = '',
}) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(compact ? 0.28 : 0.42);
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoaded(false);
  }, [url, reloadKey]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const update = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setScale(w / DESKTOP_W);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const host = formatHost(url);

  return (
    <div
      className={[
        'live-frame',
        compact ? 'live-frame--compact' : 'live-frame--modal',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="live-frame__bar">
        <div className="live-frame__addr">
          <span
            className={`live-frame__dot${loaded ? ' live-frame__dot--ready' : ''}`}
            aria-hidden="true"
          />
          <span className="live-frame__host">{host}</span>
        </div>

        <div className="live-frame__tools">
          <button
            type="button"
            className="live-frame__tool"
            onClick={() => setReloadKey((k) => k + 1)}
            aria-label={`Recargar ${title}`}
            title="Recargar vista"
          >
            <RotateCw size={12} />
          </button>

          {onExpand ? (
            <button
              type="button"
              className="live-frame__tool"
              onClick={onExpand}
              aria-label={`Ampliar ${title}`}
              title="Ampliar en visor"
            >
              <Maximize2 size={12} />
            </button>
          ) : null}

          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="live-frame__tool"
            aria-label={`Abrir ${title} en una nueva pestaña`}
            title="Abrir sitio en pestaña nueva"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div ref={viewportRef} className="live-frame__viewport">
        {poster ? (
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className={`live-frame__poster${loaded ? ' live-frame__poster--hidden' : ''}`}
            loading="lazy"
          />
        ) : null}

        {!loaded ? (
          <div className="live-frame__status" aria-hidden="true">
            <span>Cargando vista en vivo…</span>
          </div>
        ) : null}

        <iframe
          key={reloadKey}
          src={url}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
          className={`live-frame__iframe${loaded ? ' live-frame__iframe--ready' : ''}`}
          style={{
            width: `${DESKTOP_W}px`,
            height: `${DESKTOP_H}px`,
            transform: `scale(${scale})`,
          }}
        />
      </div>
    </div>
  );
}

