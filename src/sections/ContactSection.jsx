import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
import { EDITORIAL_EASE, fadeUpVariants, viewportOnce } from '../animations/motion';
import { LiquidSurface } from '../components/LiquidSurface';
import { Magnetic } from '../components/Magnetic';

export function ContactSection({ contact, availability }) {
  const [copied, setCopied] = useState(false);

  if (!contact) return null;

  const handleCopy = async () => {
    if (!contact.emailIsReal) return;
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  return (
    <section id="contacto" className="section-shell" aria-labelledby="contacto-heading">
      <div className="container">
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          transition={{ duration: 0.78, ease: EDITORIAL_EASE }}
        >
          <LiquidSurface dark className="contact-card contact-card--obsidian">
            <img
              src="/anime/system-horizon.jpg"
              alt=""
              aria-hidden="true"
              className="contact-card__scene"
              loading="lazy"
            />
            <div className="contact-card__glow" aria-hidden="true" />

            <div className="contact-card__eyebrow">
              <span className="section-eyebrow">
                <span className="section-eyebrow__index">04</span>
                <span>Contacto</span>
                <span className="section-eyebrow__jp" aria-hidden="true">連絡</span>
              </span>

              {availability ? (
                <span className="obsidian-pill">
                  <span className="pulse-dot" aria-hidden="true" />
                  <span>{availability}</span>
                </span>
              ) : null}
            </div>

            <div className="contact-grid">
              <div>
                <h2 id="contacto-heading" className="contact-headline">
                  {contact.headline}
                </h2>

                {contact.note ? <p className="contact-note">{contact.note}</p> : null}

                <div className="contact-email-row">
                  {contact.emailIsReal ? (
                    <>
                      <Magnetic strength={0.18}>
                        <button
                          type="button"
                          className="contact-email-pill"
                          onClick={handleCopy}
                          aria-live="polite"
                        >
                          <span>{contact.email}</span>
                          {copied ? <Check size={15} color="#edf3f2" /> : <Copy size={15} />}
                        </button>
                      </Magnetic>

                      <Magnetic strength={0.2}>
                        <a href={`mailto:${contact.email}`} className="btn-cobalt">
                          <Mail size={15} />
                          <span>{copied ? 'Copiado' : 'Escribir correo'}</span>
                        </a>
                      </Magnetic>
                    </>
                  ) : (
                    <div className="contact-placeholder-bar">
                      <span className="contact-email-pill contact-email-pill--muted">
                        <Mail size={15} />
                        <span>{contact.email || '[tu-correo@dominio.com]'}</span>
                      </span>
                      <span className="placeholder-tag placeholder-tag--obsidian">
                        Editar en portfolio.js
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {contact.socials.length > 0 ? (
                <div className="contact-socials" aria-label="Enlaces profesionales">
                  {contact.socials.map((item) =>
                    item.url ? (
                      <a
                        key={item.label}
                        href={item.url}
                        target={item.url.startsWith('http') ? '_blank' : undefined}
                        rel={item.url.startsWith('http') ? 'noreferrer noopener' : undefined}
                        className="social-row"
                      >
                        <span>
                          <span className="social-row__label">{item.label}</span>
                          {item.handle ? (
                            <span className="social-row__handle">{item.handle}</span>
                          ) : null}
                        </span>
                        <ArrowUpRight size={17} />
                      </a>
                    ) : (
                      <div key={item.label} className="social-row social-row--pending">
                        <span>
                          <span className="social-row__label">{item.label}</span>
                          {item.handle ? (
                            <span className="social-row__handle">{item.handle}</span>
                          ) : null}
                        </span>
                        <span className="placeholder-tag placeholder-tag--obsidian">
                          Pendiente
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : null}
            </div>
          </LiquidSurface>
        </motion.div>
      </div>
    </section>
  );
}
