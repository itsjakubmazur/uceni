import { useState } from 'react';
import { Kulisak } from '../mascots/Kulisak.tsx';
import { Blikalka } from '../mascots/Blikalka.tsx';
import { Perko } from '../mascots/Perko.tsx';
import type { MascotState } from '../mascots/types.ts';

/**
 * Tři maskoti vedle sebe, aby si Mikuláš mohl vybrat.
 *
 * Každý má přepínatelné stavy — právě na nich je poznat charakter:
 * Kulisák se uklání, Blikalka bliká bříškem, Pérko cuká jako mechanika.
 */

const STATES: { id: MascotState; label: string }[] = [
  { id: 'waiting', label: 'Čeká' },
  { id: 'talking', label: 'Mluví' },
  { id: 'joy', label: 'Raduje se' },
  { id: 'sleeping', label: 'Spí' },
];

const MASCOTS = [
  { id: 'kulisak', name: 'Kulisák', world: 'Papírové divadlo', Component: Kulisak, bg: '#F3E5CA', fg: '#2A1E16' },
  { id: 'blikalka', name: 'Blikalka', world: 'Noční zahrada', Component: Blikalka, bg: '#14291F', fg: '#FFF3D6' },
  { id: 'perko', name: 'Pérko', world: 'Hodinářská dílna', Component: Perko, bg: '#3A2A1E', fg: '#F1E3BE' },
];

export function MascotGallery() {
  const [state, setState] = useState<MascotState>('waiting');
  const [mouth, setMouth] = useState(0.6);

  return (
    <div className="flex h-full w-full flex-col bg-[#1B140F] font-andika">
      <div className="grid flex-1 grid-cols-1 sm:grid-cols-3">
        {MASCOTS.map(({ id, name, world, Component, bg, fg }) => (
          <div key={id} className="flex flex-col items-center justify-center gap-4 p-4" style={{ background: bg }}>
            <div className="w-[min(62%,240px)]">
              <Component state={state} mouth={mouth} />
            </div>
            <div className="text-center" style={{ color: fg }}>
              <p className="text-[clamp(20px,2.4vw,30px)] font-bold leading-none">{name}</p>
              <p className="mt-1 text-[clamp(12px,1.4vw,17px)] opacity-70">{world}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 bg-[#1B140F] p-3">
        {STATES.map((s) => (
          <button
            key={s.id}
            onClick={() => setState(s.id)}
            className="rounded-full px-5 py-2 text-[15px]"
            style={{
              background: state === s.id ? '#E3C567' : 'rgba(241,227,190,.12)',
              color: state === s.id ? '#1B140F' : '#F1E3BE',
            }}
          >
            {s.label}
          </button>
        ))}
        {state === 'talking' && (
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={mouth}
            onChange={(e) => setMouth(Number(e.target.value))}
            className="ml-2 w-32"
            aria-label="hlasitost"
          />
        )}
      </div>
    </div>
  );
}
