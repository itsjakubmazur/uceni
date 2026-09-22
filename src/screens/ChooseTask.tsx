import { Sign } from '../theatre/Sign.tsx';
import { Slide, type SlideFeedback } from '../theatre/Slide.tsx';
import { glyphOf } from '../app/speechFor.ts';
import { numberById } from '../content/items.numbers.ts';
import { letterById } from '../content/items.letters.ts';
import type { ItemId } from '../engine/types.ts';

/** Výška každého diapozitivu je jiná — stojí v oblouku, ne v řadě. */
const LIFTS = [0, 34, 12, 26];
const TILTS = [-1.4, 0.6, 1.6, -0.8];

export function ChooseTask({
  itemId,
  options,
  picked,
  mistakes,
  onPick,
}: {
  itemId: ItemId;
  options: ItemId[];
  picked: ItemId | null;
  mistakes: number;
  onPick: (id: ItemId) => void;
}) {
  return (
    <>
      <Sign>{question(itemId)}</Sign>

      <div className="absolute inset-x-0 bottom-[18.5%] z-20 flex items-end justify-center gap-[clamp(8px,3vw,52px)] px-[3%]">
        {options.map((id, i) => (
          <Slide
            key={id}
            glyph={glyphOf(id)}
            lift={LIFTS[i % LIFTS.length]!}
            tilt={TILTS[i % TILTS.length]!}
            index={i}
            feedback={feedbackFor(id, itemId, picked, mistakes)}
            correct={id === itemId}
            onPick={() => onPick(id)}
          />
        ))}
      </div>
    </>
  );
}

function feedbackFor(
  id: ItemId,
  correctId: ItemId,
  picked: ItemId | null,
  mistakes: number,
): SlideFeedback {
  if (picked === id && id === correctId) return 'correct';
  if (picked === id) return 'wrong';
  // Po dvou chybách začne správná možnost jemně dýchat.
  if (mistakes >= 2 && id === correctId) return 'hint';
  return 'none';
}

/** Otázka se skládá ze stejných kusů jako promluva, aby se nerozešly. */
function question(itemId: ItemId): React.ReactNode {
  const num = numberById.get(itemId as `num:${number}`);
  if (num) {
    return (
      <>
        Kde je <strong className="font-bold">{num.digitName}</strong>?
      </>
    );
  }
  const letter = letterById.get(itemId as `let:${string}`);
  if (!letter) return null;
  return letter.soundInsideWord ? (
    <>
      Kde je písmeno ze slova <strong className="font-bold">{letter.word}</strong>?
    </>
  ) : (
    <>
      Kde je písmeno od <strong className="font-bold">{letter.wordGenitive}</strong>?
    </>
  );
}
