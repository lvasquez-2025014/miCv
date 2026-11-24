import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Star, X } from 'lucide-react';
import { EDITORIAL_EASE, fadeUpVariants, viewportOnce } from '../animations/motion';
import { LiquidSurface } from '../components/LiquidSurface';
import { StarLikeButton } from '../components/StarLikeButton';
import GlassFolder from '../components/glass-folder/GlassFolder';

function ProjectFolderPedestal({
  project,
  index,
  isOpen,
  hasAnyOpen,
  likeCount,
  onToggleOpen,
  onInspect,
}) {
  const slotRef = useRef(null);
  const [folderWidth, setFolderWidth] = useState(324);

  useEffect(() => {
    const el = slotRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const update = () => {
      const available = el.clientWidth;
      if (available > 0) {
        setFolderWidth(Math.min(340, Math.max(236, Math.floor(available - 8))));
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const folderMenu = [
    {
      label: 'Ver información completa',
      onSelect: () => onInspect(project, 0),
    },
    ...(project.liveUrl
      ? [
        {
          label: 'Abrir demostración ↗',
          onSelect: () => window.open(project.liveUrl, '_blank', 'noopener,noreferrer'),
        },
      ]
      : []),
    ...(project.repoUrl
      ? [
        {
          label: 'Abrir repositorio ↗',
          onSelect: () => window.open(project.repoUrl, '_blank', 'noopener,noreferrer'),
        },
      ]
      : []),
  ];

  const handleFileSelect = () => {
    onInspect(project, 0);
  };

  const isDimmed = hasAnyOpen && !isOpen;
  const metaLabel = [
    project.status,
    project.category,
    project.year,
    likeCount > 0 ? `★ ${likeCount}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <motion.article
      className={`project-pedestal${isOpen ? ' project-pedestal--open' : ''}${isDimmed ? ' project-pedestal--dimmed' : ''}`}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.72, delay: index * 0.08, ease: EDITORIAL_EASE }}
    >
      <div ref={slotRef} className="project-pedestal__stage">
        <span className="project-pedestal__aura" aria-hidden="true" />
        <GlassFolder
          label={project.title}
          meta={metaLabel}
          tone={project.tone}
          art={project.art}
          seed={project.seed}
          image={project.coverImage || undefined}
          files={project.folderFiles}
          action="more"
          menu={folderMenu}
          open={isOpen}
          onOpenChange={(next) => onToggleOpen(next ? project.id : null)}
          onFileSelect={handleFileSelect}
          width={folderWidth}
          appear
          appearDelay={index * 90}
        />
      </div>
    </motion.article>
  );
}

export function ProjectsSection({ projects, appreciation, requestedFolder }) {
  const [openFolderId, setOpenFolderId] = useState(null);
  const [modalState, setModalState] = useState({ project: null, slide: 0 });
  const [ModalComponent, setModalComponent] = useState(null);

  const loadModal = () => {
    if (ModalComponent) return;
    import('../components/ProjectModal').then((mod) => {
      setModalComponent(() => mod.ProjectModal);
    });
  };

  useEffect(() => {
    if (!requestedFolder?.id) return;
    loadModal();
    setOpenFolderId(requestedFolder.id);
  }, [requestedFolder]);

  const openProject = useMemo(
    () => projects.find((project) => project.id === openFolderId) || null,
    [projects, openFolderId]
  );

  const totalProjectStars = useMemo(() => {
    const map = appreciation?.projectLikes;
    if (!map) return 0;
    return projects.reduce((sum, project) => sum + (Number(map[project.id]) || 0), 0);
  }, [projects, appreciation?.projectLikes]);

  const handleToggleOpen = (nextId) => {
    if (nextId) loadModal();
    setOpenFolderId(nextId);
  };

  const handleInspect = (project, slide = 0) => {
    loadModal();
    setModalState({ project, slide });
  };

  const modalProjectId = modalState.project?.id;

  return (
    <section id="proyectos" className="section-shell section-shell--projects" aria-labelledby="proyectos-heading">
      <div className="container">
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <LiquidSurface dark className="projects-hud-bar">
            <div className="projects-hud-bar__left">
              <span className="projects-hud-bar__index">01</span>
              <h2 id="proyectos-heading" className="projects-hud-bar__title">
                Mis Proyectos
              </h2>
              <span className="projects-hud-bar__count">
                {String(projects.length).padStart(2, '0')}
              </span>
            </div>

            <div className="projects-hud-bar__right">
              <AnimatePresence mode="wait">
                {openProject ? (
                  <motion.div
                    key={openProject.id}
                    className="projects-hud-bar__active"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.24, ease: EDITORIAL_EASE }}
                  >
                    <span className="projects-hud-bar__selected">{openProject.title}</span>

                    {openProject.status ? (
                      <span className="project-status-pill">
                        <span className="project-status-pill__dot" aria-hidden="true" />
                        <span>{openProject.status}</span>
                      </span>
                    ) : null}

                    {appreciation ? (
                      <StarLikeButton
                        icon="star"
                        variant="hud"
                        active={Boolean(appreciation.likedProjects?.[openProject.id])}
                        count={appreciation.projectLikes?.[openProject.id] || 0}
                        loading={!appreciation.remoteLoaded}
                        onToggle={() => appreciation.toggleProjectLike(openProject.id)}
                        label="Estrella"
                        activeLabel="Con estrella"
                      />
                    ) : null}

                    <button
                      type="button"
                      className="projects-hud-bar__open"
                      onClick={() => handleInspect(openProject, 0)}
                    >
                      <span>Abrir vista</span>
                      <ArrowUpRight size={14} />
                    </button>

                    <button
                      type="button"
                      className="projects-hud-bar__close"
                      onClick={() => setOpenFolderId(null)}
                      aria-label="Cerrar carpeta"
                      title="Cerrar carpeta"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    className="projects-hud-bar__idle"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.24, ease: EDITORIAL_EASE }}
                  >
                    {totalProjectStars > 0 ? (
                      <span className="projects-hud-bar__stars" title="Estrellas totales en proyectos">
                        <Star size={12} fill="currentColor" aria-hidden="true" />
                        <span>{totalProjectStars}</span>
                      </span>
                    ) : null}
                    <span className="projects-hud-bar__hint">
                      <span className="pulse-dot" aria-hidden="true" />
                      <span>Haz clic en una carpeta para abrir</span>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </LiquidSurface>
        </motion.div>

        <div className="projects-gallery">
          {projects.map((project, index) => (
            <ProjectFolderPedestal
              key={project.id}
              project={project}
              index={index}
              isOpen={openFolderId === project.id}
              hasAnyOpen={openFolderId !== null}
              likeCount={appreciation?.projectLikes?.[project.id] || 0}
              onToggleOpen={handleToggleOpen}
              onInspect={handleInspect}
            />
          ))}
        </div>
      </div>

      {ModalComponent ? (
        <ModalComponent
          project={modalState.project}
          initialSlide={modalState.slide}
          isLiked={Boolean(modalProjectId && appreciation?.likedProjects?.[modalProjectId])}
          likeCount={modalProjectId ? appreciation?.projectLikes?.[modalProjectId] || 0 : 0}
          viewClicks={appreciation?.projectViewClicks}
          clickedViews={appreciation?.clickedProjectViews}
          remoteLoaded={Boolean(appreciation?.remoteLoaded)}
          onViewClick={appreciation?.recordProjectViewClick}
          onToggleLike={
            modalProjectId && appreciation
              ? () => appreciation.toggleProjectLike(modalProjectId)
              : undefined
          }
          onClose={() => setModalState({ project: null, slide: 0 })}
        />
      ) : null}
    </section>
  );
}
