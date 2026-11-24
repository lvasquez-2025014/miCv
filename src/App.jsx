import { useCallback, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { AppreciationBar } from './components/AppreciationBar';
import { AtmosphericCanvas } from './components/AtmosphericCanvas';
import { FloatingNav } from './components/FloatingNav';
import { Footer } from './components/Footer';
import { IntroCurtain } from './components/IntroCurtain';
import { PrecisionCursor } from './components/PrecisionCursor';
import { useActiveSection } from './hooks/useActiveSection';
import { useAppreciation } from './hooks/useAppreciation';
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
  const [introReady, setIntroReady] = useState(reducedMotion);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const appreciation = useAppreciation(data.appreciation, { soundEnabled });

  const sectionIds = useMemo(
    () => data.sections.map((section) => section.id),
    [data.sections]
  );

  const activeSection = useActiveSection(sectionIds);

  const handleIntroComplete = useCallback(() => {
    setIntroReady(true);
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

      <AtmosphericCanvas />
      <div className="grain-layer" aria-hidden="true" />
      <PrecisionCursor />

      <IntroCurtain
        identity={data.identity}
        reducedMotion={reducedMotion}
        onComplete={handleIntroComplete}
      />

      <FloatingNav
        sections={data.sections}
        activeSection={activeSection}
        sound={soundEnabled}
      />

      <HeroSection
        identity={data.identity}
        projectCount={data.projects.length}
        introReady={introReady}
        appreciation={appreciation}
      />

      <main id="contenido">
        <ProjectsSection
          projects={data.projects}
          categories={data.projectCategories}
          appreciation={appreciation}
        />

        <AboutSection about={data.about} />

        <JourneySection journey={data.journey} />

        <ContactSection
          contact={data.contact}
          availability={data.identity.availability}
        />

        <AppreciationBar
          appreciation={appreciation}
          config={data.appreciation}
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
