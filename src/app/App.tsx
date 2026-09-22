import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Stage } from '../theatre/Stage.tsx';
import { StartScreen } from '../screens/StartScreen.tsx';
import { HomeScreen } from '../screens/HomeScreen.tsx';
import { IntroTask } from '../screens/IntroTask.tsx';
import { ChooseTask } from '../screens/ChooseTask.tsx';
import { CountTask } from '../screens/CountTask.tsx';
import { MatchTask } from '../screens/MatchTask.tsx';
import { TraceTask } from '../screens/TraceTask.tsx';
import { EndScreen } from '../screens/EndScreen.tsx';
import { MapScreen } from '../screens/MapScreen.tsx';
import { Interlude } from '../screens/Interlude.tsx';
import { ParentZone } from '../screens/ParentZone.tsx';
import { ParentCorner } from '../screens/ParentCorner.tsx';
import { useSession } from './useSession.ts';
import type { EngineState, ItemId } from '../engine/types.ts';
import { LETTERS } from '../content/items.letters.ts';
import { NUMBERS } from '../content/items.numbers.ts';

/**
 * Celé divadlo zůstává na místě a mění se jen to, co se na něm hraje.
 * Proto je Stage nad přepínáním obrazovek — scéna se nikdy nepřekresluje
 * a přechody jsou plynulé.
 */
export function App() {
  const session = useSession();
  const [picked, setPicked] = useState<ItemId | null>(null);

  // Náhled jedné úlohy pro vývoj a kontrolu vzhledu:
  //   ?uloha=pocitani&polozka=num:5
  //   ?uloha=obrazek&polozka=let:M
  //   ?uloha=obtahovani&polozka=let:M
  //   ?uloha=mapa&hotovo=8
  //   ?uloha=mezihra&varianta=1
  const preview = previewFromUrl();
  if (preview) {
    const reload = () => window.location.reload();
    return (
      <Stage litCount={4}>
        {preview.kind === 'pocitani' && <CountTask itemId={preview.itemId} onDone={reload} />}
        {preview.kind === 'obtahovani' && <TraceTask itemId={preview.itemId} onDone={reload} />}
        {preview.kind === 'mezihra' && (
          <Interlude variant={preview.count} onDone={() => window.location.reload()} />
        )}
        {preview.kind === 'mapa' && (
          <MapScreen state={fakeProgress(preview.count)} onBack={reload} />
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

  return (
    <Stage litCount={session.litCount}>
      <AnimatePresence mode="wait">
        <motion.div
          data-uloha={
            session.phase === 'task' && task ? `${task.itemId} ${task.kind}` : undefined
          }
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
          {session.phase === 'home' && (
            <HomeScreen onChoose={session.chooseArea} onMap={session.showMap} areas={session.settings.areas} />
          )}

          {session.phase === 'map' && <MapScreen state={session.state} onBack={session.goHome} />}

          {session.phase === 'interlude' && session.interlude && (
            <div data-mezihra={session.interlude.variant} className="absolute inset-0">
              <Interlude variant={session.interlude.variant} onDone={session.finishInterlude} />
            </div>
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

          {session.phase === 'end' && (
            <EndScreen
              mastered={session.masteredToday}
              touched={session.state ? masteredIds(session.state) : []}
              onHome={session.goHome}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <ParentCorner onOpen={session.openParentZone} />
    </Stage>
  );
}

/** Náhled úlohy z adresy. V hotové aplikaci se na tyhle parametry nikdy nesáhne. */
function previewFromUrl(): { kind: string; itemId: ItemId; options: ItemId[]; count: number } | null {
  const params = new URLSearchParams(window.location.search);
  const kind = params.get('uloha');
  if (!kind || !['pocitani', 'obrazek', 'obtahovani', 'mapa', 'mezihra'].includes(kind)) return null;
  const itemId = (params.get('polozka') as ItemId) ?? 'num:5';
  const options = (params.get('moznosti') ?? `${itemId},let:P,let:S`).split(',') as ItemId[];
  const count = Number(params.get('hotovo') ?? params.get('varianta') ?? 0);
  return { kind, itemId, options, count };
}

/** Vymyšlený postup pro náhled mapy. Nikdy se nikam neukládá. */
function fakeProgress(count: number): EngineState {
  const order = [...LETTERS.map((l) => l.id), ...NUMBERS.map((n) => n.id)] as ItemId[];
  const items = Object.fromEntries(
    order.map((id, i) => [
      id,
      {
        itemId: id,
        area: id.startsWith('num') ? 'numbers' : 'letters',
        state: i < count ? 'mastered' : 'locked',
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

function masteredIds(state: NonNullable<ReturnType<typeof useSession>['state']>): ItemId[] {
  return Object.values(state.items)
    .filter((p) => p.state !== 'locked')
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((p) => p.itemId);
}
