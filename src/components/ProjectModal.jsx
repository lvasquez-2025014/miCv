import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Github, Globe, Layers, X } from 'lucide-react';
import { EDITORIAL_EASE } from '../animations/motion';
import { ArtCanvas } from './glass-folder/ArtCanvas';
import { LiveIframePreview } from './LiveIframePreview';
import { StarLikeButton } from './StarLikeButton';

export function ProjectModal({
  project,
  initialSlide = 0,
  isLiked = false,
  likeCount = 0,
  onToggleLike,
  onClose,
}) {
  const closeRef = useRef(null);
  const [slideIdx, setSlideIdx] = useState(initialSlide);

  useEffect(() => {
    setSlideIdx(initialSlide);
  }, [project?.id, initialSlide]);

  useEffect(() => {
    if (!project) return undefined;
    const prevOverflow = document.body.style.overflow;
    const prevFocused = document.activeElement;
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
      if (prevFocused instanceof HTMLElement) prevFocused.focus();
    };
  }, [project, onClose]);

  const slides =
    project && project.gallery.length > 0
      ? project.gallery
      : project
        ? [
            {
              title: project.title,
              caption: project.summary,
              image: project.coverImage,
              art: project.art,
            },
          ]
        : [];

  const activeSlide = slides[slideIdx] || slides[0];
  const isEmbedSlide = Boolean(activeSlide?.embedUrl);

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.article
            className={`project-modal liquid-panel${isEmbedSlide ? ' project-modal--embed' : ''}`}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.42, ease: EDITORIAL_EASE }}
          >
            <div className="project-modal__header">
              <div className="project-modal__eyebrow">
                <span className="section-eyebrow__index">{project.indexLabel}</span>
                <span>{project.category}</span>
                {project.year ? <span>· {project.year}</span> : null}
                {project.isPlaceholder ? (
                  <span className="placeholder-tag">Por completar</span>
                ) : null}
              </div>

              <button
                ref={closeRef}
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Cerrar vista de proyecto"
              >
                <X size={18} />
              </button>
            </div>

            <div className="project-modal__body">
              {/* Visor de iframe en vivo, capturas o arte líquido */}
              <div className="project-modal__media">
                <div
                  className={`project-modal__stage${isEmbedSlide ? ' project-modal__stage--embed' : ''}`}
                >
                  {isEmbedSlide ? (
                    <LiveIframePreview
                      url={activeSlide.embedUrl}
                      title={`${project.title} — ${activeSlide.title}`}
                      poster={activeSlide.image || project.coverImage}
                    />
                  ) : activeSlide?.image ? (
                    <img src={activeSlide.image} alt={activeSlide.title || project.title} />
                  ) : (
                    <ArtCanvas
                      art={activeSlide?.art || project.art}
                      seed={project.seed + slideIdx * 7}
                      w={680}
                      h={400}
                      density={1}
                      priority={0}
                      className="project-modal__art"
                    />
                  )}

                  {!isEmbedSlide && activeSlide?.caption ? (
                    <div className="project-modal__caption">
                      <strong>{activeSlide.title}</strong>
                      <span>{activeSlide.caption}</span>
                    </div>
                  ) : null}
                </div>

                {slides.length > 1 ? (
                  <div className="project-modal__thumbs" role="tablist" aria-label="Capturas del proyecto">
                    {slides.map((slide, idx) => (
                      <button
                        key={`${slide.title}-${idx}`}
                        type="button"
                        role="tab"
                        aria-selected={idx === slideIdx}
                        className={`modal-thumb ${idx === slideIdx ? 'modal-thumb--active' : ''}`}
                        onClick={() => setSlideIdx(idx)}
                      >
                        {slide.embedUrl ? <Globe size={13} /> : <Layers size={13} />}
                        <span>{slide.title}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Información técnica y enlaces */}
              <div className="project-modal__info">
                <h3 id="project-modal-title" className="project-modal__title">
                  {project.title}
                </h3>

                {project.role ? (
                  <p className="project-modal__role">{project.role}</p>
                ) : null}

                {project.summary ? (
                  <p className="project-modal__summary">{project.summary}</p>
                ) : null}

                {project.description ? (
                  <p className="project-modal__desc">{project.description}</p>
                ) : null}

                {project.credits ? (
                  <p className="project-credits project-credits--modal">{project.credits}</p>
                ) : null}

                {project.technologies.length > 0 ? (
                  <div className="project-modal__section">
                    <span className="modal-label">Tecnologías</span>
                    <div className="chip-list">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="glass-chip">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="project-modal__actions">
                  {onToggleLike ? (
                    <StarLikeButton
                      icon="star"
                      variant="pill"
                      active={isLiked}
                      count={likeCount}
                      onToggle={onToggleLike}
                      label="Dar estrella"
                      activeLabel="Con estrella"
                    />
                  ) : null}

                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-primary"
                    >
                      <span>Ver demostración</span>
                      <ArrowUpRight size={15} />
                    </a>
                  ) : null}

                  {project.repoUrl ? (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-glass"
                    >
                      <Github size={15} />
                      <span>Repositorio</span>
                    </a>
                  ) : null}

                  {!project.liveUrl && !project.repoUrl ? (
                    <p className="project-modal__hint">
                      Añade <code>repoUrl</code> y <code>liveUrl</code> en{' '}
                      <code>src/data/portfolio.js</code> para activar los enlaces externos.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

