import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.tsx';
import { ConceptGallery } from './concepts/ConceptGallery.tsx';
import { setupServiceWorker } from './app/serviceWorker.ts';
import './styles/base.css';

setupServiceWorker();

// Koncepty světa zůstávají dostupné na ?koncepty, ať je s čím srovnávat.
const showConcepts = new URLSearchParams(window.location.search).has('koncepty');

createRoot(document.getElementById('root')!).render(
  <StrictMode>{showConcepts ? <ConceptGallery /> : <App />}</StrictMode>,
);
