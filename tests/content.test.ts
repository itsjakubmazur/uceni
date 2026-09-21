import { describe, expect, it } from 'vitest';
import { LETTERS } from '../src/content/items.letters.ts';
import { NUMBERS, COUNTING_WORDS } from '../src/content/items.numbers.ts';
import { SPEECH, VARIANT_GROUPS, speechById } from '../src/content/speech.ts';
import { safeFileBase, hashLine } from '../scripts/lib/manifest.ts';

describe('písmena', () => {
  it('má jedinečná ID i znaky', () => {
    expect(new Set(LETTERS.map((l) => l.id)).size).toBe(LETTERS.length);
    expect(new Set(LETTERS.map((l) => l.glyph)).size).toBe(LETTERS.length);
  });

  it('začíná Mikulášovým písmenem', () => {
    expect(LETTERS[0]!.glyph).toBe('M');
    expect(LETTERS[0]!.word).toBe('Mikuláš');
  });

  it('má ke každému písmenu dvě další slova se stejným začátkem', () => {
    for (const l of LETTERS) {
      expect(l.echoWords, l.glyph).toHaveLength(2);
      const all = [l.word, ...l.echoWords].map((w) => w.toLowerCase());
      expect(new Set(all).size, `${l.glyph}: slova se opakují`).toBe(3);
      if (l.soundInsideWord) continue;
      for (const w of l.echoWords) {
        expect(w.toUpperCase().startsWith(l.glyph), `${l.glyph} → ${w}`).toBe(true);
      }
    }
  });

  it('má u každého písmene slovo ve všech potřebných pádech i ilustraci', () => {
    for (const l of LETTERS) {
      expect(l.word.length, l.glyph).toBeGreaterThan(1);
      expect(l.illustration, l.glyph).toMatch(/^[a-z]+$/);
      expect(l.wordGenitive.length, l.glyph).toBeGreaterThan(1);
      expect(l.wordAccusative.length, l.glyph).toBeGreaterThan(1);
    }
  });

  it('slovo začíná hláskou písmene — kromě Y, které to má přiznané', () => {
    for (const l of LETTERS) {
      if (l.soundInsideWord) {
        expect(l.word.toUpperCase().includes(l.glyph), l.glyph).toBe(true);
        continue;
      }
      expect(l.word.toUpperCase().startsWith(l.glyph), `${l.glyph} → ${l.word}`).toBe(true);
    }
  });

  it('nemá sama sebe mezi zaměnitelnými znaky', () => {
    for (const l of LETTERS) expect(l.confusables).not.toContain(l.glyph);
  });

  it('drží M a N daleko od sebe, aby se nepletly hned zkraje', () => {
    const m = LETTERS.findIndex((l) => l.glyph === 'M');
    const n = LETTERS.findIndex((l) => l.glyph === 'N');
    expect(n - m).toBeGreaterThan(8);
  });
});

describe('čísla', () => {
  it('učí se v pořadí 1–10, 0, 11–20', () => {
    expect(NUMBERS.map((n) => n.value)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ]);
  });

  it('má kostkové rozvržení jen do šesti', () => {
    for (const n of NUMBERS) expect(n.diceLayout, n.glyph).toBe(n.value >= 1 && n.value <= 6);
  });

  it('páruje šestku s devítkou', () => {
    expect(NUMBERS.find((n) => n.value === 6)!.confusables).toContain(9);
    expect(NUMBERS.find((n) => n.value === 9)!.confusables).toContain(6);
  });

  it('má počítací slovo pro každé číslo od jedné do dvaceti', () => {
    expect(COUNTING_WORDS).toHaveLength(20);
    expect(COUNTING_WORDS[0]).toBe('jedna');
    expect(COUNTING_WORDS[19]).toBe('dvacet');
  });
});

describe('promluvy', () => {
  it('mají jedinečná ID', () => {
    expect(new Set(SPEECH.map((s) => s.id)).size).toBe(SPEECH.length);
  });

  it('nikdy nepoužijí izolovanou hlásku', () => {
    // Promluva o jediném slově kratším než tři znaky by znamenala „Mmm".
    for (const s of SPEECH) {
      expect(s.text.trim().length, s.id).toBeGreaterThan(2);
      expect(s.text, s.id).toMatch(/[.!?]$/);
    }
  });

  it('pokrývají každé písmeno i číslo', () => {
    for (const l of LETTERS) {
      for (const suffix of ['intro', 'this', 'where', 'tryFind', 'word', 'pickPicture', 'pickPictureRetry']) {
        expect(speechById.has(`letter.${l.glyph}.${suffix}`), `${l.glyph}.${suffix}`).toBe(true);
      }
    }
    for (const n of NUMBERS) {
      expect(speechById.has(`number.${n.value}.intro`), String(n.value)).toBe(true);
    }
  });

  it('ukotví písmeno slovem a nikdy nevysloví znak samotný', () => {
    for (const l of LETTERS) {
      const forms = [l.word, l.wordGenitive, l.wordAccusative];
      for (const suffix of ['intro', 'this', 'where', 'tryFind', 'word', 'pickPicture', 'pickPictureRetry']) {
        const text = speechById.get(`letter.${l.glyph}.${suffix}`)!.text.toLowerCase();
        const anchored = forms.some((form) => text.includes(form.toLowerCase()));
        expect(anchored, `${l.glyph}.${suffix}: „${text}"`).toBe(true);
      }
    }
  });

  it('vyvodí hlásku ze tří slov, ne z izolovaného zvuku', () => {
    for (const l of LETTERS) {
      const intro = speechById.get(`letter.${l.glyph}.intro`)!.text;
      for (const word of [l.word, ...l.echoWords]) {
        expect(intro.toLowerCase(), l.glyph).toContain(word.toLowerCase());
      }
    }
  });

  it('drží název písmene stranou v samostatné promluvě', () => {
    // Název je učivo 2. třídy. Smí existovat, ale nesmí se vloudit jinam.
    for (const l of LETTERS) {
      expect(speechById.get(`letter.${l.glyph}.name`)!.text).toBe(`Říká se mu ${l.letterName}.`);
    }
  });

  it('neobsahují názvy písmen ani protahované hlásky', () => {
    // „eř", „em", „bé" dítěti překážejí při skládání slov; „Mmm" syntéza neumí.
    // \b je v JS jen ASCII, takže by „obtažené" falešně matchlo „en“.
    // Hranice slova proto hlídáme přes Unicode písmena.
    // „té" a „já" jsou zároveň běžná česká slova, ty hlídat nejde.
    const NAMES = 'em|en|es|ef|el|er|eř|eš|bé|cé|čé|dé|gé|há|chá|ká|pé|vé|žet|zet|ypsilon';
    const letterNames = new RegExp(`(?<!\\p{L})(${NAMES})(?!\\p{L})`, 'iu');
    for (const s of SPEECH) {
      if (s.id.endsWith('.name')) continue; // jediné místo, kde název smí zaznít
      expect(s.text, s.id).not.toMatch(letterNames);
      expect(s.text, s.id).not.toMatch(/(.)\1{2,}/i);
    }
  });

  it('se ptají na obrázek v prvním pádu, ne ve čtvrtém', () => {
    // „Kde je sovu?" je přesně ten druh chyby, kterou dítě nenahlásí.
    for (const l of LETTERS) {
      const q = speechById.get(`letter.${l.glyph}.pickPicture`)!.text;
      expect(q, l.glyph).toBe(`Kde je ${l.word}?`);
    }
  });

  it('mají dost variant pochval i povzbuzení', () => {
    expect(VARIANT_GROUPS.praise.length).toBeGreaterThanOrEqual(5);
    expect(VARIANT_GROUPS.encourage.length).toBeGreaterThanOrEqual(5);
    for (const id of [...VARIANT_GROUPS.praise, ...VARIANT_GROUPS.encourage]) {
      expect(speechById.has(id), id).toBe(true);
    }
  });

  it('nikdy dítěti neřeknou, že je to špatně', () => {
    for (const s of SPEECH) {
      expect(s.text.toLowerCase(), s.id).not.toMatch(/špatn|chyb|nesprávn|ne!/);
    }
  });
});

describe('názvy souborů', () => {
  it('jsou vždy ASCII, aby přežily cestu z Macu na Linux', () => {
    for (const s of SPEECH) {
      expect(safeFileBase(s.id), s.id).toMatch(/^[A-Za-z0-9._-]+$/);
    }
  });

  it('nekolidují mezi sebou', () => {
    const names = SPEECH.map((s) => safeFileBase(s.id));
    expect(new Set(names).size).toBe(names.length);
  });

  it('odliší háčkovaná písmena od holých', () => {
    expect(safeFileBase('letter.Ř.intro')).not.toBe(safeFileBase('letter.R.intro'));
  });
});

describe('hash promluvy', () => {
  const sig = { voice: 'Zuzana', rate: 160 };

  it('je stejný pro stejný vstup', () => {
    expect(hashLine('Tohle je M.', sig)).toBe(hashLine('Tohle je M.', sig));
  });

  it('se změní při změně textu i při změně hlasu', () => {
    expect(hashLine('Tohle je M.', sig)).not.toBe(hashLine('Tohle je N.', sig));
    expect(hashLine('Tohle je M.', sig)).not.toBe(hashLine('Tohle je M.', { ...sig, rate: 150 }));
  });
});

describe('ilustrace', () => {
  it('existují ke každému písmenu', async () => {
    const { hasIllustration } = await import('../src/theatre/Illustrations.tsx');
    for (const l of LETTERS) {
      expect(hasIllustration(l.illustration), `${l.glyph} → ${l.illustration}`).toBe(true);
    }
  });

  it('nemají přebytečné položky, které nikam nepatří', async () => {
    const { illustrationIds } = await import('../src/theatre/Illustrations.tsx');
    const used = new Set(LETTERS.map((l) => l.illustration));
    for (const id of illustrationIds()) {
      expect(used.has(id), `ilustrace „${id}" není k žádnému písmenu`).toBe(true);
    }
  });
});

describe('tahy pro obtahování', () => {
  it('existují ke každému písmenu i číslu', async () => {
    const { missingStrokes } = await import('../src/content/strokes.ts');
    const glyphs = [...LETTERS.map((l) => l.glyph), ...NUMBERS.map((n) => n.glyph)];
    expect(missingStrokes(glyphs)).toEqual([]);
  });

  it('začínají příkazem přesunu, jinak by je prohlížeč nevykreslil', async () => {
    const { strokesFor } = await import('../src/content/strokes.ts');
    for (const l of LETTERS) {
      for (const stroke of strokesFor(l.glyph)) {
        expect(stroke.d.trim().startsWith('M'), `${l.glyph}: ${stroke.d}`).toBe(true);
      }
    }
  });

  it('skládají víceznakový nápis vedle sebe', async () => {
    const { strokesForText } = await import('../src/content/strokes.ts');
    const { strokes, width } = strokesForText('12');
    expect(width).toBe(200);
    expect(new Set(strokes.map((s) => s.offsetX))).toEqual(new Set([0, 100]));
  });
});

describe('směr tahů', () => {
  it('vede svislice shora dolů, ne zdola nahoru', async () => {
    const { strokesFor } = await import('../src/content/strokes.ts');
    for (const glyph of ['M', 'N', 'P', 'B', 'D', 'E', 'F', 'H', 'I', 'K', 'L', 'R', 'T']) {
      const first = strokesFor(glyph)[0]!;
      const m = /^M\s*(-?[\d.]+)[ ,]+(-?[\d.]+)\s*L\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/.exec(first.d);
      if (!m) continue;
      const [x1, y1, x2, y2] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
      const vertical = Math.abs(x2 - x1) < 2;
      if (vertical) expect(y2, `${glyph}: první tah jde vzhůru`).toBeGreaterThan(y1);
    }
  });
});
