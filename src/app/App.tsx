import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Stage } from '../theatre/Stage.tsx';
import { StartScreen } from '../screens/StartScreen.tsx';
import { HomeScreen } from '../screens/HomeScreen.tsx';
import { IntroTask } from '../screens/IntroTask.tsx';
import { ChooseTask } from '../screens/ChooseTask.tsx';
import { CountTask } from '../screens/CountTask.tsx';
import { EndScreen } from '../screens/EndScreen.tsx';
import { useSession } from './useSession.ts';
import type { ItemId } from '../engine/types.ts';

/**
 * Celé divadlo zůstává na místě a mění se jen to, co se na něm hraje.
 * Proto je Stage nad přepínáním obrazovek — scéna se nikdy nepřekresluje
 * a přechody jsou plynulé.
 */
export function App() {
  const session = useSession();
  const [picked, setPicked] = useState<ItemId | null>(null);

  // Náhled jedné úlohy pro vývoj a kontrolu vzhledu: ?uloha=pocitani&polozka=num:5
  const preview = previewFromUrl();
  if (preview) {
    return (
      <Stage litCount={4}>
        <CountTask itemId={preview} onDone={() => window.location.reload()} />
      </Stage>
    );
  }

  if (session.phase === 'locked') {
    return <StartScreen onStart={() => void session.begin()} />;
  }

  const { task } = session;

  return (
    <Stage litCount={session.litCount}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${session.phase}-${task?.itemId ?? ''}-${task?.kind ?? ''}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {session.phase === 'home' && <HomeScreen onChoose={session.chooseArea} />}

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

          {session.phase === 'end' && (
            <EndScreen
              mastered={session.masteredToday}
              touched={session.state ? masteredIds(session.state) : []}
              onHome={session.goHome}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Stage>
  );
}

/** Náhled úlohy z adresy. V hotové aplikaci se na tyhle parametry nikdy nesáhne. */
function previewFromUrl(): ItemId | null {
  const params = new URLSearchParams(window.location.search);
  if (params.get('uloha') !== 'pocitani') return null;
  return (params.get('polozka') as ItemId) ?? 'num:5';
}

function masteredIds(state: NonNullable<ReturnType<typeof useSession>['state']>): ItemId[] {
  return Object.values(state.items)
    .filter((p) => p.state !== 'locked')
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((p) => p.itemId);
}
