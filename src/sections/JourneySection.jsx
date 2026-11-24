import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { EDITORIAL_EASE, fadeUpVariants, viewportOnce } from '../animations/motion';
import { LiquidSurface } from '../components/LiquidSurface';

export function JourneySection({ journey }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!journey || journey.entries.length === 0) return null;

  const activeEntry = journey.entries[activeIndex] || journey.entries[0];

  return (
    <section id="experiencia" className="section-shell" aria-labelledby="experiencia-heading">
      <div className="container">
        <motion.div
          className="section-header"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="section-eyebrow">
            <span className="section-eyebrow__index">03</span>
            <span>Aprendizaje</span>
            <span className="section-eyebrow__jp" aria-hidden="true">軌跡</span>
          </div>

          <div>
            <h2 id="experiencia-heading" className="section-heading">
              Experiencia y <em>aprendizaje.</em>
            </h2>
            {journey.subtitle ? <p className="section-lead">{journey.subtitle}</p> : null}
          </div>
        </motion.div>

        <div className="journey-grid">
          <div
            className="journey-rail"
            role="tablist"
            aria-label="Capítulos de evolución y aprendizaje"
          >
            {journey.entries.map((entry, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`journey-panel-${entry.id}`}
                  id={`journey-tab-${entry.id}`}
                  className={`journey-tab ${isActive ? 'journey-tab--active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="journey-active-bg"
                      className="journey-tab__bg"
                      transition={{ duration: 0.4, ease: EDITORIAL_EASE }}
                    />
                  ) : null}

                  <span className="journey-tab__spine" aria-hidden="true" />
                  <span className="journey-tab__index">{entry.indexLabel}</span>
                  <span className="journey-tab__content">
                    <span className="journey-tab__kind">{entry.kind || entry.period}</span>
                    <span className="journey-tab__title">{entry.title}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <LiquidSurface className="journey-stage">
            <span className="journey-stage__watermark" aria-hidden="true">
              {activeEntry.indexLabel}
            </span>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeEntry.id}
                id={`journey-panel-${activeEntry.id}`}
                role="tabpanel"
                aria-labelledby={`journey-tab-${activeEntry.id}`}
                className="journey-stage__inner"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.34, ease: EDITORIAL_EASE }}
              >
                <div className="panel-head">
                  <span className="journey-badge">
                    <Compass size={13} />
                    <span>{activeEntry.period}</span>
                  </span>

                  {activeEntry.isPlaceholder ? (
                    <span className="placeholder-tag">Hito editable</span>
                  ) : activeEntry.kind ? (
                    <span className="panel-label">{activeEntry.kind}</span>
                  ) : null}
                </div>

                <h3 className="journey-stage__title">{activeEntry.title}</h3>

                {activeEntry.summary ? (
                  <p className="journey-stage__summary">{activeEntry.summary}</p>
                ) : null}

                {activeEntry.focus.length > 0 ? (
                  <div className="journey-stage__footer">
                    <span className="modal-label">Áreas de enfoque</span>
                    <div className="chip-list">
                      {activeEntry.focus.map((topic) => (
                        <span key={topic} className="glass-chip">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </LiquidSurface>
        </div>
      </div>
    </section>
  );
}
