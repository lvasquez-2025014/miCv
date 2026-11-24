import { ArrowUp, Volume2, VolumeX } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { Magnetic } from './Magnetic';

export function Footer({ identity, soundEnabled, onToggleSound }) {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <BrandMark monogram={identity.monogram} />
          <span>
            © {year}
            {identity.name ? ` · ${identity.name}` : ''}
          </span>
        </div>

        <div className="site-footer__actions">
          <button
            type="button"
            className="back-to-top"
            aria-pressed={soundEnabled}
            onClick={onToggleSound}
            title="Activar o silenciar sonido de agua en la barra"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{soundEnabled ? 'Audio activo' : 'Audio'}</span>
          </button>

          <Magnetic strength={0.2}>
            <button type="button" className="back-to-top" onClick={scrollToTop}>
              <span>Volver arriba</span>
              <ArrowUp size={13} />
            </button>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
}
