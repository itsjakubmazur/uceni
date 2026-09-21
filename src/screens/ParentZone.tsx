import { useEffect, useMemo, useState } from 'react';
import { SPEECH } from '../content/speech.ts';
import { LETTERS } from '../content/items.letters.ts';
import { NUMBERS } from '../content/items.numbers.ts';
import { audio } from '../audio/AudioEngine.ts';
import type { ProgressRepository, SessionRecord, Settings, SpeechFlag } from '../data/ProgressRepository.ts';
import type { EngineState, ItemId } from '../engine/types.ts';

/**
 * Rodičovská zóna.
 *
 * Schválně nevzhledná. Je to nástroj pro dospělého, ne další kus divadla —
 * kdyby vypadala lákavě, Mikuláš by se do ní chtěl dostat. Otevírá se
 * podržením rohu na tři vteřiny, takže na ni nešahne omylem.
 */

type Tab = 'postup' | 'nastaveni' | 'hlas';

export function ParentZone({
  repo,
  state,
  settings,
  onClose,
  onSettingsChange,
  onReset,
}: {
  repo: ProgressRepository;
  state: EngineState | null;
  settings: Settings;
  onClose: () => void;
  onSettingsChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<Tab>('postup');

  return (
    <div className="absolute inset-0 z-[70] overflow-auto bg-[#F4EFE6] font-andika text-[#241C16]">
      <header className="sticky top-0 flex items-center gap-3 border-b border-[#D8CDBA] bg-[#F4EFE6] px-5 py-3">
        <h1 className="text-[19px] font-bold">Pro rodiče</h1>
        <nav className="ml-4 flex gap-1">
          {(['postup', 'nastaveni', 'hlas'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-md px-3 py-1.5 text-[15px]"
              style={{
                background: tab === t ? '#241C16' : 'transparent',
                color: tab === t ? '#F4EFE6' : '#241C16',
              }}
            >
              {{ postup: 'Postup', nastaveni: 'Nastavení', hlas: 'Hlasy' }[t]}
            </button>
          ))}
        </nav>
        <button
          onClick={onClose}
          className="ml-auto rounded-md border border-[#C3A377] px-4 py-1.5 text-[15px]"
        >
          Zavřít
        </button>
      </header>

      <main className="mx-auto max-w-[900px] px-5 py-6">
        {tab === 'postup' && <Progress repo={repo} state={state} />}
        {tab === 'nastaveni' && (
          <Preferences settings={settings} onChange={onSettingsChange} onReset={onReset} />
        )}
        {tab === 'hlas' && <Voices repo={repo} />}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------- postup */

function Progress({ repo, state }: { repo: ProgressRepository; state: EngineState | null }) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    void repo.listSessions(10).then(setSessions);
  }, [repo]);

  const rows = [
    { title: 'Písmena', items: LETTERS.map((l) => ({ id: l.id as ItemId, glyph: l.glyph })) },
    { title: 'Čísla', items: NUMBERS.map((n) => ({ id: n.id as ItemId, glyph: n.glyph })) },
  ];

  const mastered = state ? Object.values(state.items).filter((p) => p.state === 'mastered').length : 0;

  return (
    <div className="flex flex-col gap-7">
      <p className="text-[15px] text-[#5C4429]">
        Zvládnuto <strong>{mastered}</strong> z {LETTERS.length + NUMBERS.length}. Položka se počítá
        za zvládnutou, když ji Mikuláš trefí čtyřikrát z posledních pěti pokusů napoprvé.
      </p>

      {rows.map((row) => (
        <section key={row.title}>
          <h2 className="mb-2 text-[16px] font-bold">{row.title}</h2>
          <div className="flex flex-wrap gap-1.5">
            {row.items.map(({ id, glyph }) => {
              const p = state?.items[id];
              const label =
                p?.state === 'mastered' ? 'zvládnuté' : p?.state === 'learning' ? 'rozpracované' : 'zamčené';
              return (
                <span
                  key={id}
                  title={`${glyph} — ${label}${p ? `, stupeň ${p.stage}` : ''}`}
                  className="grid h-11 w-11 place-items-center rounded-md text-[17px] font-bold"
                  style={{
                    background:
                      p?.state === 'mastered' ? '#F7C86B' : p?.state === 'learning' ? '#E2CCA4' : '#E6DFD2',
                    color: p?.state === 'locked' || !p ? '#A99B85' : '#241C16',
                    outline: p?.state === 'learning' ? '2px dashed #B0392B' : 'none',
                    outlineOffset: '-2px',
                  }}
                >
                  {glyph}
                </span>
              );
            })}
          </div>
        </section>
      ))}

      <section>
        <h2 className="mb-2 text-[16px] font-bold">Poslední sezení</h2>
        {sessions.length === 0 ? (
          <p className="text-[15px] text-[#7A6A52]">Zatím žádné dokončené sezení.</p>
        ) : (
          <table className="w-full text-left text-[15px]">
            <thead className="text-[13px] uppercase tracking-wide text-[#7A6A52]">
              <tr>
                <th className="py-1">Kdy</th>
                <th>Úloh</th>
                <th>Napoprvé</th>
                <th>Nově zvládnuto</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-t border-[#E0D7C6]">
                  <td className="py-1.5">{new Date(s.startedAt).toLocaleString('cs-CZ')}</td>
                  <td>{s.taskCount}</td>
                  <td>{s.correctFirstTry}</td>
                  <td>{s.newlyMastered.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------- nastavení */

function Preferences({
  settings,
  onChange,
  onReset,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-col gap-7">
      <Field label={`Délka sezení: ${settings.sessionMinutes} minut`}>
        <input
          type="range"
          min={3}
          max={25}
          step={1}
          value={settings.sessionMinutes}
          onChange={(e) => onChange({ sessionMinutes: Number(e.target.value) })}
          className="w-full max-w-[420px]"
        />
        <p className="mt-1 text-[14px] text-[#7A6A52]">
          Sezení se nikdy neutne uprostřed úlohy a v poslední pětině už nezavádí nic nového,
          aby skončilo úspěchem.
        </p>
      </Field>

      <Field label="Co se procvičuje">
        <div className="flex gap-5">
          <Toggle
            checked={settings.areas.numbers}
            label="Čísla"
            onChange={(v) => onChange({ areas: { ...settings.areas, numbers: v } })}
          />
          <Toggle
            checked={settings.areas.letters}
            label="Písmena"
            onChange={(v) => onChange({ areas: { ...settings.areas, letters: v } })}
          />
        </div>
      </Field>

      <Field label="Říkat i názvy písmen">
        <Toggle
          checked={settings.sayLetterNames}
          label={'„Říká se mu em."'}
          onChange={(v) => onChange({ sayLetterNames: v })}
        />
        <p className="mt-1 max-w-[560px] text-[14px] text-[#7A6A52]">
          Výchozí je vypnuto. Názvy písmen jsou učivo druhé třídy a v pěti letech překážejí
          při skládání slov: kdo zná M jako „em" a Á jako „á", přečte MÁMA jako „em-á-em-á".
          Aplikace proto písmeno ukotvuje slovem.
        </p>
      </Field>

      <Field label="Hlasitost">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 text-[15px]">
            <span className="w-16">Hlas</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.speechVolume}
              onChange={(e) => onChange({ speechVolume: Number(e.target.value) })}
              className="w-[260px]"
            />
          </label>
          <label className="flex items-center gap-3 text-[15px]">
            <span className="w-16">Zvuky</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.effectsVolume}
              onChange={(e) => onChange({ effectsVolume: Number(e.target.value) })}
              className="w-[260px]"
            />
          </label>
        </div>
      </Field>

      <Field label="Smazat postup">
        {confirming ? (
          <div className="flex items-center gap-3">
            <span className="text-[15px]">Opravdu? Tohle se nedá vrátit.</span>
            <button
              className="rounded-md bg-[#B0392B] px-4 py-1.5 text-[15px] text-white"
              onClick={() => {
                onReset();
                setConfirming(false);
              }}
            >
              Smazat
            </button>
            <button className="text-[15px] underline" onClick={() => setConfirming(false)}>
              Zrušit
            </button>
          </div>
        ) : (
          <button
            className="rounded-md border border-[#B0392B] px-4 py-1.5 text-[15px] text-[#B0392B]"
            onClick={() => setConfirming(true)}
          >
            Smazat postup
          </button>
        )}
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-[16px] font-bold">{label}</h2>
      {children}
    </section>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[15px]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/* ----------------------------------------------------------------- hlasy */

/**
 * Přehled promluv.
 *
 * Každou jde přehrát a označit k přegenerování, případně k ní rovnou napsat
 * lepší text. Označené se dají zkopírovat jako seznam pro generovací skript,
 * takže se nemusí přegenerovávat celá sada kvůli třem větám.
 */
function Voices({ repo }: { repo: ProgressRepository }) {
  const [flags, setFlags] = useState<SpeechFlag[]>([]);
  const [filter, setFilter] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    void repo.listSpeechFlags().then(setFlags);
  }, [repo]);

  const flagged = useMemo(() => new Map(flags.map((f) => [f.speechId, f])), [flags]);

  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return SPEECH;
    return SPEECH.filter(
      (s) => s.id.toLowerCase().includes(needle) || s.text.toLowerCase().includes(needle),
    );
  }, [filter]);

  const toggle = async (id: string, editedText?: string) => {
    if (flagged.has(id) && editedText === undefined) {
      const next = flags.filter((f) => f.speechId !== id);
      setFlags(next);
      await repo.clearSpeechFlags();
      for (const f of next) await repo.flagSpeech(f);
      return;
    }
    const flag: SpeechFlag = { speechId: id, editedText, ts: Date.now() };
    setFlags((prev) => [...prev.filter((f) => f.speechId !== id), flag]);
    await repo.flagSpeech(flag);
  };

  const exportList = flags
    .map((f) => (f.editedText ? `${f.speechId}\t${f.editedText}` : f.speechId))
    .join('\n');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Hledat v promluvách"
          className="w-[280px] rounded-md border border-[#C3A377] bg-white px-3 py-1.5 text-[15px]"
        />
        <span className="text-[14px] text-[#7A6A52]">
          {shown.length} z {SPEECH.length} · označeno {flags.length}
        </span>
      </div>

      {flags.length > 0 && (
        <section className="rounded-md border border-[#C3A377] bg-[#FBF7EF] p-3">
          <h2 className="mb-1 text-[15px] font-bold">K přegenerování</h2>
          <p className="mb-2 text-[14px] text-[#7A6A52]">
            Zkopíruj a spusť: <code className="text-[13px]">npm run audio -- --only=…</code>
          </p>
          <textarea
            readOnly
            value={exportList}
            rows={Math.min(6, flags.length + 1)}
            className="w-full rounded border border-[#D8CDBA] bg-white p-2 font-mono text-[13px]"
          />
          <div className="mt-2 flex gap-2">
            <button
              className="rounded-md border border-[#C3A377] px-3 py-1 text-[14px]"
              onClick={() => void navigator.clipboard?.writeText(flags.map((f) => f.speechId).join(','))}
            >
              Zkopírovat ID
            </button>
            <button
              className="rounded-md border border-[#C3A377] px-3 py-1 text-[14px]"
              onClick={() => {
                setFlags([]);
                void repo.clearSpeechFlags();
              }}
            >
              Zrušit všechny značky
            </button>
          </div>
        </section>
      )}

      <ul className="flex flex-col divide-y divide-[#E0D7C6]">
        {shown.map((line) => {
          const flag = flagged.get(line.id);
          return (
            <li key={line.id} className="flex flex-wrap items-center gap-3 py-2">
              <button
                className="rounded-md border border-[#C3A377] px-3 py-1 text-[14px]"
                style={{ background: playing === line.id ? '#F7C86B' : 'transparent' }}
                onClick={async () => {
                  setPlaying(line.id);
                  await audio.unlock();
                  await audio.say(line.id);
                  setPlaying(null);
                }}
              >
                Přehrát
              </button>
              <code className="w-[210px] shrink-0 text-[13px] text-[#7A6A52]">{line.id}</code>
              <span className="flex-1 text-[15px]">{line.text}</span>
              {line.note && <span className="w-full text-[13px] text-[#9A8A70]">{line.note}</span>}
              <label className="flex items-center gap-1.5 text-[14px]">
                <input
                  type="checkbox"
                  checked={Boolean(flag)}
                  onChange={() => void toggle(line.id)}
                />
                přegenerovat
              </label>
              {flag && (
                <input
                  defaultValue={flag.editedText ?? line.text}
                  placeholder="upravený text"
                  onBlur={(e) => void toggle(line.id, e.target.value)}
                  className="w-full rounded border border-[#D8CDBA] bg-white px-2 py-1 text-[14px]"
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
