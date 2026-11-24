import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EDITORIAL_EASE, fadeUpVariants, viewportOnce } from '../animations/motion';
import GlassFolder from '../components/glass-folder/GlassFolder';
import { ProjectModal } from '../components/ProjectModal';

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
  const [folderWidth, setFolderWidth] = useState(332);

  useEffect(() => {
    const el = slotRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const update = () => {
      const available = el.clientWidth;
      if (available > 0) {
        setFolderWidth(Math.min(340, Math.max(256, Math.floor(available - 12))));
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

export function ProjectsSection({ projects, categories, appreciation }) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [openFolderId, setOpenFolderId] = useState(null);
  const [modalState, setModalState] = useState({ project: null, slide: 0 });

  const visibleProjects =
    activeCategory === 'Todos'
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  const handleInspect = (project, slide = 0) => {
    setModalState({ project, slide });
  };

  const modalProjectId = modalState.project?.id;

  return (
    <section id="proyectos" className="section-shell" aria-labelledby="proyectos-heading">
      <div className="container">
        <motion.div
          className="section-header"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="section-eyebrow">
            <span className="section-eyebrow__index">01</span>
            <span>Proyectos</span>
            <span className="section-eyebrow__jp" aria-hidden="true">作品</span>
          </div>

          <div>
            <h2 id="proyectos-heading" className="section-heading">
              Archivo interactivo en <em>vidrio líquido.</em>
            </h2>
            <p className="section-lead">
              Abre cualquier carpeta y haz clic en su tarjeta para explorar la vista en vivo y toda
              la información del proyecto.
            </p>
          </div>
        </motion.div>

        {categories.length > 1 ? (
          <div className="filter-bar" role="group" aria-label="Filtrar proyectos por categoría">
            {['Todos', ...categories].map((category) => (
              <button
                key={category}
                type="button"
                className={`filter-pill ${activeCategory === category ? 'filter-pill--active' : ''}`}
                aria-pressed={activeCategory === category}
                onClick={() => {
                  setActiveCategory(category);
                  setOpenFolderId(null);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}

        <div className="projects-gallery">
          {visibleProjects.map((project, index) => (
            <ProjectFolderPedestal
              key={project.id}
              project={project}
              index={index}
              isOpen={openFolderId === project.id}
              hasAnyOpen={openFolderId !== null}
              likeCount={appreciation?.projectLikes?.[project.id] || 0}
              onToggleOpen={setOpenFolderId}
              onInspect={handleInspect}
            />
          ))}
        </div>
      </div>

      <ProjectModal
        project={modalState.project}
        initialSlide={modalState.slide}
        isLiked={Boolean(modalProjectId && appreciation?.likedProjects?.[modalProjectId])}
        likeCount={modalProjectId ? appreciation?.projectLikes?.[modalProjectId] || 0 : 0}
        onToggleLike={
          modalProjectId && appreciation
            ? () => appreciation.toggleProjectLike(modalProjectId)
            : undefined
        }
        onClose={() => setModalState({ project: null, slide: 0 })}
      />
    </section>
  );
}
