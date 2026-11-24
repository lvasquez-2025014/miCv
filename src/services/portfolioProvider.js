import portfolioConfig from '../data/portfolio';
import { selectPortfolioViewModel } from '../data/selectors';

/**
 * Capa de acceso a datos del portafolio.
 *
 * Actualmente consume la configuración estática en `src/data/portfolio.js`.
 * Arquitectura preparada para conectar en el futuro un backend, CMS o una sesión
 * autenticada de edición sin modificar los componentes de presentación.
 */

export const PORTFOLIO_CAPABILITIES = Object.freeze({
  source: 'local-config',
  authMode: 'public',
  editable: false,
});

export function getPortfolioSnapshot(overrideConfig) {
  return selectPortfolioViewModel(overrideConfig ?? portfolioConfig);
}

/**
 * Contrato de extensión futuro para clientes HTTP o autenticación externa.
 * @typedef {Object} PortfolioAdapter
 * @property {() => Promise<ReturnType<typeof selectPortfolioViewModel>>} load
 * @property {() => Promise<{ authenticated: boolean }>} [getSession]
 */

export function createStaticPortfolioAdapter(source = portfolioConfig) {
  return {
    capabilities: PORTFOLIO_CAPABILITIES,
    async load() {
      return selectPortfolioViewModel(source);
    },
  };
}

