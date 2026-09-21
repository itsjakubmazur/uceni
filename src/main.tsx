import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConceptGallery } from './concepts/ConceptGallery.tsx';
import './styles/base.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConceptGallery />
  </StrictMode>,
);
