import { useEffect, useState } from 'react';
import { PaperWorld } from './paper/PaperWorld.tsx';
import { GardenWorld } from './garden/GardenWorld.tsx';
import { WorkshopWorld } from './workshop/WorkshopWorld.tsx';
import { MascotGallery } from './MascotGallery.tsx';

/**
 * Rozcestník tří konceptů.
 *
 * Přepínač je schválně nenápadný proužek dole: koncepty se mají posuzovat
 * celé, ne přes ovládání. V hotové aplikaci nic takového nebude.
 */

const VIEWS = {
  paper: { name: 'Papírové divadlo', Component: PaperWorld },
  garden: { name: 'Noční zahrada', Component: GardenWorld },
  workshop: { name: 'Hodinářská dílna', Component: WorkshopWorld },
  maskoti: { name: 'Maskoti', Component: MascotGallery },
} as const;

type ViewId = keyof typeof VIEWS;

const isViewId = (v: string | null): v is ViewId => v !== null && v in VIEWS;

export function ConceptGallery() {
  const initial = new URLSearchParams(window.location.search).get('concept');
  const [id, setId] = useState<ViewId>(isViewId(initial) ? initial : 'paper');

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('concept', id);
    window.history.replaceState({}, '', url);
  }, [id]);

  const { Component } = VIEWS[id];

  return (
    <div className="relative h-full w-full">
      <Component />
      <nav className="absolute bottom-0 left-1/2 z-[60] flex -translate-x-1/2 gap-1 rounded-t-xl bg-black/45 p-1 backdrop-blur-md">
        {(Object.keys(VIEWS) as ViewId[]).map((key) => (
          <button
            key={key}
            onClick={() => setId(key)}
            className="rounded-lg px-3 py-1.5 text-[13px] font-bold"
            style={{
              background: id === key ? 'rgba(255,246,222,.92)' : 'transparent',
              color: id === key ? '#1B140F' : 'rgba(255,246,222,.75)',
            }}
          >
            {VIEWS[key].name}
          </button>
        ))}
      </nav>
    </div>
  );
}
