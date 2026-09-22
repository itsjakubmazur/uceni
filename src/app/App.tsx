import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Stage } from '../theatre/Stage.tsx';
import { StartScreen } from '../screens/StartScreen.tsx';
import { RoadScreen } from '../screens/RoadScreen.tsx';
import { IntroTask } from '../screens/IntroTask.tsx';
import { ChooseTask } from '../screens/ChooseTask.tsx';
import { CountTask } from '../screens/CountTask.tsx';
import { MatchTask } from '../screens/MatchTask.tsx';
import { TraceTask } from '../screens/TraceTask.tsx';
import { Interlude } from '../screens/Interlude.tsx';
import { EndScreen } from '../screens/EndScreen.tsx';
import { ParentZone } from '../screens/ParentZone.tsx';
import { ParentCorner } from '../screens/ParentCorner.tsx';
import { useSession } from './useSession.ts';
import { LETTERS } from '../content/items.letters.ts';
import { NUMBERS } from '../content/items.numbers.ts';
import type { EngineState, ItemId } from '../engine/types.ts';

/**
 * Divadlo zůstává na místě a mění se jen to, co se na něm hraje. Proto je
 * `Stage` nad přepínáním obrazovek — scéna se nikdy nepřekresluje a přechody
 * jsou plynulé.
 *
 * Kostra je jednoduchá a všude vede zpátky na cestu:
 *
 *   dotek  →  CESTA  ⇄  sezení (úloha, mezihra)  →  konec  →  CESTA
 *                    ⇄  rodičovská zóna
 */
export function App() {
  const session = useSession();
  const [picked, setPicked] = useState<ItemId | null>(null);

  const preview = previewFromUrl();
  if (preview) {
    const reload = () => window.location.reload();
    return (
      <Stage progress={{ done: 4, total: 10 }} showMascot={preview.kind !== 'cesta'}>
        {preview.kind === 'pocitani' && <CountTask itemId={preview.itemId} onDone={reload} />}
        {preview.kind === 'obtahovani' && <TraceTask itemId={preview.itemId} onDone={reload} />}
        {preview.kind === 'mezihra' && <Interlude variant={preview.count} onDone={reload} />}
        {preview.kind === 'cesta' && (
          <RoadScreen
            state={fakeProgress(preview.count)}
            area="letters"
            onChangeArea={() => {}}
            onPlay={reload}
          />
        )}
        {preview.kind === 'obrazek' && (
          <MatchTask
            itemId={preview.itemId}
            options={preview.options}
            picked={null}
            mistakes={0}
            onPick={reload}
          />
        )}
      </Stage>
    );
  }

  if (session.phase === 'locked') {
    return <StartScreen onStart={() => void session.begin()} />;
  }

  if (session.phase === 'rodice') {
    return (
      <ParentZone
        repo={session.repo}
        state={session.state}
        settings={session.settings}
        onClose={session.goHome}
        onSettingsChange={session.changeSettings}
        onReset={session.resetProgress}
      />
    );
  }

  const { task } = session;
  const playing = session.phase === 'task' || session.phase === 'interlude';

  return (
    <Stage
      progress={playing ? session.progress : undefined}
      onBack={playing || session.phase === 'end' ? session.goHome : undefined}
      showMascot={session.phase !== 'cesta'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          data-uloha={session.phase === 'task' && task ? `${task.itemId} ${task.kind}` : undefined}
          key={
            session.phase === 'interlude'
              ? `mezihra-${session.interlude?.variant ?? 0}`
              : `${session.phase}-${task?.itemId ?? ''}-${task?.kind ?? ''}`
          }
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {session.phase === 'cesta' && (
            <RoadScreen
              state={session.state}
              area={session.area}
              onChangeArea={session.setArea}
              onPlay={session.chooseArea}
            />
          )}

          {session.phase === 'task' && task?.kind === 'intro' && (
            <IntroTask itemId={task.itemId} onDone={session.finishIntro} />
          )}

          {session.phase === 'task' && task?.kind === 'choose' && (
            <ChooseTask
              itemId={task.itemId}
              options={task.options}
              picked={picked}
              mistakes={session.mistakes}
              onPick={(id) => {
                setPicked(id);
                session.answer(id);
                if (id !== task.itemId) window.setTimeout(() => setPicked(null), 400);
              }}
            />
          )}

          {session.phase === 'task' && task?.kind === 'count' && (
            <CountTask itemId={task.itemId} onDone={session.finishCount} />
          )}

          {session.phase === 'task' && task?.kind === 'match' && (
            <MatchTask
              itemId={task.itemId}
              options={task.options}
              picked={picked}
              mistakes={session.mistakes}
              onPick={(id) => {
                setPicked(id);
                session.answer(id);
                if (id !== task.itemId) window.setTimeout(() => setPicked(null), 400);
              }}
            />
          )}

          {session.phase === 'task' && task?.kind === 'trace' && (
            <TraceTask itemId={task.itemId} onDone={session.finishCount} />
          )}

          {session.phase === 'interlude' && session.interlude && (
            <div data-mezihra={session.interlude.variant} className="absolute inset-0">
              <Interlude variant={session.interlude.variant} onDone={session.finishInterlude} />
            </div>
          )}

          {session.phase === 'end' && (
            <EndScreen mastered={session.masteredToday} onHome={session.goHome} />
          )}
        </motion.div>
      </AnimatePresence>

      <ParentCorner onOpen={session.openParentZone} />
    </Stage>
  );
}

/**
 * Náhled jedné obrazovky pro vývoj a kontrolu vzhledu:
 *   ?uloha=cesta&hotovo=8
 *   ?uloha=pocitani&polozka=num:7
 *   ?uloha=obrazek&polozka=let:M
 *   ?uloha=obtahovani&polozka=let:M
 *   ?uloha=mezihra&varianta=1
 *
 * V hotové aplikaci se na tyhle parametry nikdy nesáhne.
 */
function previewFromUrl(): { kind: string; itemId: ItemId; options: ItemId[]; count: number } | null {
  const params = new URLSearchParams(window.location.search);
  const kind = params.get('uloha');
  const known = ['pocitani', 'obrazek', 'obtahovani', 'mezihra', 'cesta'];
  if (!kind || !known.includes(kind)) return null;
  const itemId = (params.get('polozka') as ItemId) ?? 'num:5';
  const options = (params.get('moznosti') ?? `${itemId},let:P,let:S`).split(',') as ItemId[];
  const count = Number(params.get('hotovo') ?? params.get('varianta') ?? 0);
  return { kind, itemId, options, count };
}

/** Vymyšlený postup pro náhled cesty. Nikdy se nikam neukládá. */
function fakeProgress(count: number): EngineState {
  const order = [...LETTERS.map((l) => l.id), ...NUMBERS.map((n) => n.id)] as ItemId[];
  const items = Object.fromEntries(
    order.map((id, i) => [
      id,
      {
        itemId: id,
        area: id.startsWith('num') ? 'numbers' : 'letters',
        state: i < count ? 'mastered' : i === count ? 'learning' : 'locked',
        stage: 1,
        recent: [],
        stageStreak: 0,
        review: null,
        updatedAt: 0,
        dirty: false,
      },
    ]),
  );
  return { sessionIndex: 0, items } as unknown as EngineState;
}
