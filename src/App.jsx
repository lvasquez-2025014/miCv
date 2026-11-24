import { useCallback, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { FloatingNav } from './components/FloatingNav';
import { Footer } from './components/Footer';
import { HyperframesHeroStage } from './components/HyperframesHeroStage';
import { IntroCurtain } from './components/IntroCurtain';
import { PrecisionCursor } from './components/PrecisionCursor';
import { useActiveSection } from './hooks/useActiveSection';
import { useAppreciation } from './hooks/useAppreciation';
import { usePerformanceProfile } from './hooks/usePerformanceProfile';
import { usePortfolio } from './hooks/usePortfolio';
import { useReducedMotionPreference } from './hooks/useReducedMotionPreference';
import { AboutSection } from './sections/AboutSection';
import { ContactSection } from './sections/ContactSection';
import { HeroSection } from './sections/HeroSection';
import { JourneySection } from './sections/JourneySection';
import { ProjectsSection } from './sections/ProjectsSection';

export default function App() {
  const data = usePortfolio();
  const reducedMotion = useReducedMotionPreference();
  const perf = usePerformanceProfile();
  const [introReady, setIntroReady] = useState(reducedMotion);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [requestedFolder, setRequestedFolder] = useState(null);
  const appreciation = useAppreciation(data.appreciation, { soundEnabled });

  const sectionIds = useMemo(
    () => data.sections.map((section) => section.id),
    [data.sections]
  );

  const activeSection = useActiveSection(sectionIds);

  const handleIntroComplete = useCallback(() => {
    setIntroReady(true);
  }, []);

  const handleJumpToProject = useCallback((projectId) => {
    setRequestedFolder({ id: projectId, ts: Date.now() });
    const el = document.getElementById('proyectos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = data.meta.lang;
    document.title = data.meta.title;

    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', data.meta.description);
  }, [data.meta]);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#contenido" className="skip-link">
        Ir al contenido principal
      </a>

      <HyperframesHeroStage introReady={introReady} perf={perf} />
      {!perf.isLite ? <div className="grain-layer" aria-hidden="true" /> : null}
      <PrecisionCursor />

      <IntroCurtain
        identity={data.identity}
        reducedMotion={reducedMotion}
        perf={perf}
        onComplete={handleIntroComplete}
      />

      <FloatingNav
        sections={data.sections}
        activeSection={activeSection}
        sound={soundEnabled}
        perf={perf}
      />

      <HeroSection
        identity={data.identity}
        projects={data.projects}
        introReady={introReady}
        appreciation={appreciation}
        perf={perf}
        onJumpToProject={handleJumpToProject}
      />

      <main id="contenido">
        <ProjectsSection
          projects={data.projects}
          appreciation={appreciation}
          requestedFolder={requestedFolder}
        />

        <AboutSection about={data.about} perf={perf} />

        <JourneySection journey={data.journey} />

        <ContactSection
          contact={data.contact}
          availability={data.identity.availability}
          perf={perf}
        />
      </main>

      <Footer
        identity={data.identity}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />
    </MotionConfig>
  );
}
