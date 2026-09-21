import { describe, expect, it } from 'vitest';
import { LETTERS, spokenName } from '../src/content/items.letters.ts';
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

  it('má u každého písmene slovo i ilustraci', () => {
    for (const l of LETTERS) {
      expect(l.word.length, l.glyph).toBeGreaterThan(1);
      expect(l.illustration, l.glyph).toMatch(/^[a-z]+$/);
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
      for (const suffix of ['intro', 'this', 'where', 'tryFind', 'word', 'pickPicture']) {
        expect(speechById.has(`letter.${l.glyph}.${suffix}`), `${l.glyph}.${suffix}`).toBe(true);
      }
    }
    for (const n of NUMBERS) {
      expect(speechById.has(`number.${n.value}.intro`), String(n.value)).toBe(true);
    }
  });

  it('uvedou znak jeho názvem a ukotví slovem', () => {
    for (const l of LETTERS) {
      const intro = speechById.get(`letter.${l.glyph}.intro`)!.text;
      expect(intro, l.glyph).toContain(spokenName(l));
      expect(intro, l.glyph).toContain(l.word);
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
