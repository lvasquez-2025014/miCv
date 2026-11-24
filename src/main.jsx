import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  applyPerformanceTierAttribute,
  detectPerformanceTier,
} from './hooks/usePerformanceProfile';
import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';
import App from './App';

applyPerformanceTierAttribute(detectPerformanceTier());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

