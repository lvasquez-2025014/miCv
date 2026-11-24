import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ArtCanvas } from './ArtCanvas';
import { fanSlot, hashString, rng } from './artEngine';
import './GlassFolder.css';

const W = 340;
const H = 272;
const HEADROOM = 54;
const FRONT_TOP = 74;
const FRONT_H = H - FRONT_TOP;
const SHEET_W = 272;
const SHEET_H = 184;
const MAX_VISIBLE = 4;

const BACK_PATH =
  'M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z';

const FRONT_PATH =
  `M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 ${FRONT_H - 22}` +
  `A22 22 0 0 1 318 ${FRONT_H}L22 ${FRONT_H}A22 22 0 0 1 0 ${FRONT_H - 22}Z`;

/**
 * GlassFolder — Carpeta interactiva Liquid Glass de 3 capas reales.
 * Conserva geometría, refracción, bisagra 3D, hojas interiores en abanico,
 * paralaje por cursor y accesibilidad completa por teclado y dispositivos táctiles.
 */
export default function GlassFolder({
  label = 'Proyecto',
  meta,
  tone = 'dark',
  art = 'voidStorm',
  seed = 3,
  image,
  files: filesProp = [],
  action = 'more',
  onAdd,
  onFilesChange,
  menu = [],
  labelPlacement = 'bottom-left',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onFileSelect,
  width = 330,
  appear = true,
  appearDelay = 0,
  className = '',
  style,
}) {
  const uid = useId().replace(/:/g, '');
  const rootRef = useRef(null);
  const filesRef = useRef(null);
  const hitRef = useRef(null);
  const keyRef = useRef(null);
  const menuRef = useRef(null);

  const [files, setFiles] = useState(filesProp);
  const idsRef = useRef(filesProp.map((_, i) => i));
  const nextIdRef = useRef(filesProp.length);
  const [dropped, setDropped] = useState(null);
  const [bump, setBump] = useState(0);

  // Mantiene las hojas sincronizadas si cambian los datos del proyecto
  useEffect(() => {
    setFiles(filesProp);
    idsRef.current = filesProp.map((_, i) => i);
    nextIdRef.current = filesProp.length;
  }, [filesProp]);

  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;

  const setOpen = useCallback(
    (next) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange]
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [entered, setEntered] = useState(!appear);

  const k = width / W;
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const density = Math.min(1.5, Math.max(1, dpr)) * k;

  // Ensamblaje al entrar en pantalla
  useEffect(() => {
    if (!appear) return undefined;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setEntered(true);
      return undefined;
    }

    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        timer = window.setTimeout(() => setEntered(true), appearDelay);
      },
      { threshold: 0.2 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [appear, appearDelay]);

  // Seguimiento suave del cursor para luz especular y paralaje 3D (ignora touch)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    let raf = 0;
    let px = 0;
    let py = 0;

    const write = () => {
      raf = 0;
      el.style.setProperty('--gf-px', px.toFixed(3));
      el.style.setProperty('--gf-py', py.toFixed(3));
    };

    const move = (e) => {
      if (e.pointerType === 'touch') return;
      const rect = el.getBoundingClientRect();
      px = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      py = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    };

    const leave = () => {
      px = 0;
      py = 0;
      if (!raf) raf = requestAnimationFrame(write);
    };

    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);

    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Hojas ocultas quedan fuera del orden de tabulación cuando está cerrada
  useEffect(() => {
    filesRef.current?.toggleAttribute('inert', !open);
  }, [open]);

  // Cierre con Escape o clic fuera
  useEffect(() => {
    if (!open && !menuOpen) return undefined;

    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (menuOpen) {
        setMenuOpen(false);
        keyRef.current?.focus();
      } else {
        setOpen(false);
        hitRef.current?.focus();
      }
    };

    const onDown = (e) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (menuOpen && !menuRef.current?.contains(target) && !keyRef.current?.contains(target)) {
        setMenuOpen(false);
      }
      if (
        open &&
        !menuOpen &&
        !rootRef.current?.contains(target) &&
        !(target instanceof Element && target.closest('[data-gf-toggle]'))
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, menuOpen, setOpen]);

  useEffect(() => {
    if (menuOpen) {
      menuRef.current?.querySelector('[role=menuitem]')?.focus();
    }
  }, [menuOpen]);

  const addFile = () => {
    const made = onAdd?.(files);
    const file = made || { name: `Archivo ${files.length + 1}`, meta: 'Nuevo' };
    const next = [...files, file];
    const id = nextIdRef.current++;
    idsRef.current = [...idsRef.current, id];
    setFiles(next);
    setDropped(id);
    setBump((b) => b + 1);
    onFilesChange?.(next);
  };

  const menuItems = [
    {
      label: open ? 'Cerrar carpeta' : 'Abrir carpeta',
      onSelect: () => setOpen(!open),
    },
    ...menu,
  ];

  const onMenuKey = (e) => {
    const items = Array.from(menuRef.current?.querySelectorAll('[role=menuitem]') ?? []);
    if (!items.length) return;
    const at = items.indexOf(document.activeElement);
    const go = (i) => {
      e.preventDefault();
      items[(i + items.length) % items.length]?.focus();
    };
    if (e.key === 'ArrowDown') go(at + 1);
    else if (e.key === 'ArrowUp') go(at - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(items.length - 1);
    else if (e.key === 'Tab') setMenuOpen(false);
  };

  const start = Math.max(0, files.length - MAX_VISIBLE);
  const visible = files.slice(start);
  const count = files.length;
  const metaLine = meta ?? `${count} ${count === 1 ? 'elemento' : 'elementos'}`;

  return (
    <div
      ref={rootRef}
      className={`gf-root${className ? ` ${className}` : ''}`}
      data-tone={tone}
      data-open={open || undefined}
      data-entered={entered || undefined}
      data-place={labelPlacement}
      style={{ width, height: (H + HEADROOM) * k, ...style }}
    >
      <div
        className="gf-stage"
        style={{ transform: `translateY(${HEADROOM * k}px) scale(${k})` }}
      >
        <div className="gf-tilt">
          <div className="gf-shadow" aria-hidden="true" />

          {/* Panel trasero con arte líquido o captura */}
          <div
            className="gf-back"
            style={{ clipPath: `path('${BACK_PATH}')` }}
            aria-hidden="true"
          >
            {image ? (
              <img
                className="gf-art"
                src={image}
                alt=""
                width={W + 24}
                height={H + 24}
                draggable={false}
              />
            ) : art !== 'none' ? (
              <ArtCanvas
                className="gf-art"
                art={art}
                seed={seed}
                w={W + 24}
                h={H + 24}
                density={density}
                priority={0}
              />
            ) : null}
            <div className="gf-back-sheen" />
          </div>

          <svg
            className="gf-rim gf-back-rim"
            viewBox={`0 0 ${W} ${H}`}
            aria-hidden="true"
          >
            <path d={BACK_PATH} />
          </svg>

          {/* Panel frontal de cristal líquido articulado */}
          <div
            key={bump}
            className={`gf-front${bump ? ' gf-front--bump' : ''}`}
            style={{ clipPath: `path('${FRONT_PATH}')` }}
          >
            <div className="gf-tint" aria-hidden="true" />
            <div className="gf-spec" aria-hidden="true" />

            <svg
              className="gf-rim gf-front-rim"
              viewBox={`0 0 ${W} ${FRONT_H}`}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`gf-rim-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
                  <stop offset="0.36" stopColor="#c8dcd8" stopOpacity="0.38" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0.14" />
                </linearGradient>
              </defs>
              <path d={FRONT_PATH} stroke={`url(#gf-rim-${uid})`} />
            </svg>

            <button
              ref={hitRef}
              type="button"
              className="gf-hit"
              data-cursor-label={open ? 'Cerrar' : 'Abrir'}
              aria-expanded={open}
              aria-label={`${open ? 'Cerrar' : 'Abrir'} ${label}, ${count} ${count === 1 ? 'elemento' : 'elementos'}`}
              onClick={() => {
                setMenuOpen(false);
                setOpen(!open);
              }}
            />

            <div className="gf-label">
              <span className="gf-title">{label}</span>
              <span className="gf-meta" key={metaLine}>
                {metaLine}
              </span>
            </div>
          </div>

          {/* Hojas interiores */}
          <div
            ref={filesRef}
            className="gf-files"
            role="list"
            aria-label={`Contenido de ${label}`}
          >
            {visible.map((file, v) => {
              const id = idsRef.current[start + v] ?? v;
              const slot = fanSlot(v, visible.length);
              const jitter = rng(hashString(file.name) + id);
              const picture = Boolean(file.art || file.image);

              const inner = (
                <>
                  {picture ? (
                    file.image ? (
                      <img
                        className="gf-sheet-art"
                        src={file.image}
                        alt=""
                        width={SHEET_W}
                        height={SHEET_H}
                        draggable={false}
                      />
                    ) : (
                      <ArtCanvas
                        className="gf-sheet-art"
                        art={file.art}
                        seed={hashString(file.name) % 997}
                        w={SHEET_W}
                        h={SHEET_H}
                        density={Math.min(density, 1.25)}
                        priority={1}
                      />
                    )
                  ) : (
                    <span className="gf-lines" aria-hidden="true">
                      <i style={{ width: '86%' }} />
                      <i style={{ width: '92%' }} />
                      <i style={{ width: '64%' }} />
                      <i style={{ width: '88%' }} />
                      <i style={{ width: '42%' }} />
                    </span>
                  )}

                  <span className="gf-sheet-head">
                    <span className="gf-sheet-name">{file.name}</span>
                    {file.meta ? <span className="gf-sheet-meta">{file.meta}</span> : null}
                  </span>
                </>
              );

              const single = visible.length === 1;
              const common = {
                className: `gf-sheet${picture ? ' gf-sheet--art' : ''}${id === dropped ? ' gf-sheet--drop' : ''}`,
                'data-cursor-label': 'Ver',
                style: {
                  '--gf-slot': slot,
                  '--gf-depth': visible.length - 1 - v,
                  '--gf-jx': single ? '0px' : `${((jitter() - 0.5) * 10).toFixed(2)}px`,
                  '--gf-jr': single ? '0deg' : `${((jitter() - 0.5) * 3.2).toFixed(2)}deg`,
                  zIndex: v + 1,
                },
                onAnimationEnd: id === dropped ? () => setDropped(null) : undefined,
              };

              const isExternal = typeof file.href === 'string' && file.href.startsWith('http');

              return (
                <div key={id} role="listitem" className="gf-sheet-slot">
                  {file.href ? (
                    <a
                      {...common}
                      href={file.href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noreferrer noopener' : undefined}
                      onClick={() => onFileSelect?.(file, start + v)}
                    >
                      {inner}
                    </a>
                  ) : (
                    <button
                      {...common}
                      type="button"
                      onClick={() => onFileSelect?.(file, start + v)}
                    >
                      {inner}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botón de acción (+ / ···) */}
          {action !== 'none' ? (
            <button
              ref={keyRef}
              type="button"
              className={`gf-key gf-key--${action}`}
              aria-label={
                action === 'add'
                  ? `Agregar elemento a ${label}`
                  : `Más opciones para ${label}`
              }
              aria-haspopup={action === 'more' ? 'menu' : undefined}
              aria-expanded={action === 'more' ? menuOpen : undefined}
              aria-controls={action === 'more' ? `gf-menu-${uid}` : undefined}
              onClick={() => (action === 'add' ? addFile() : setMenuOpen((m) => !m))}
            >
              {action === 'add' ? (
                <svg
                  key={bump}
                  className="gf-glyph gf-glyph--plus"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 4.5v15M4.5 12h15" />
                </svg>
              ) : (
                <svg
                  className="gf-glyph gf-glyph--more"
                  viewBox="0 0 30 12"
                  aria-hidden="true"
                >
                  <rect x="1" y="1.5" width="8" height="9" rx="3.4" />
                  <rect x="11" y="1.5" width="8" height="9" rx="3.4" />
                  <rect x="21" y="1.5" width="8" height="9" rx="3.4" />
                </svg>
              )}
            </button>
          ) : null}

          {/* Menú de vidrio */}
          {action === 'more' ? (
            <div
              ref={menuRef}
              id={`gf-menu-${uid}`}
              role="menu"
              aria-label={`Opciones de ${label}`}
              className="gf-menu"
              data-open={menuOpen || undefined}
              onKeyDown={onMenuKey}
            >
              {menuItems.map((item, idx) => (
                <button
                  key={`${item.label}-${idx}`}
                  type="button"
                  role="menuitem"
                  tabIndex={menuOpen ? -1 : undefined}
                  disabled={!menuOpen}
                  className={`gf-menu-item${item.danger ? ' gf-menu-item--danger' : ''}`}
                  onClick={() => {
                    setMenuOpen(false);
                    keyRef.current?.focus();
                    item.onSelect?.();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
