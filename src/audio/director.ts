import { audio } from './AudioEngine.ts';

/**
 * Režie hlasu.
 *
 * Aplikace, která komentuje úplně všechno, je po minutě otravná. „Ještě jeden
 * tah" po každém tahu, „Výborně" po každé odpovědi a celá otázka znovu při
 * každém opakování téže položky — přesně tohle dospělého udolá za minutu
 * a dítě za třicet vteřin.
 *
 * Režie proto dělá tři věci:
 *
 * 1. **Mlčí.** Část správných odpovědí dostane jen zvuk a reakci scény.
 *    Pochvala, která nezazní pokaždé, něco znamená.
 * 2. **Neopakuje se.** Stejná věta nezazní dvakrát během `COOLDOWN_MS`
 *    a z variant se vybírá tak, aby po sobě nešly dvě stejné.
 * 3. **Zkracuje.** Když dítě položku v sezení už potkalo, nedostane celou
 *    otázku znovu, ale jen krátké pobídnutí.
 */

/** Jak dlouho se stejná věta nesmí zopakovat. */
const COOLDOWN_MS = 90_000;

/**
 * Jak často zazní mluvená pochvala.
 *
 * Většina správných odpovědí dostane jen tón a reakci scény. Pochvala po
 * každé odpovědi není pochvala, je to zvuková kulisa — a po dvaceti úlohách
 * je k nesnesení.
 */
const PRAISE_CHANCE = 0.35;

export class SpeechDirector {
  private lastSaid = new Map<string, number>();
  private lastVariant = new Map<string, string>();
  private saidOnce = new Set<string>();

  /** Přehraje promluvy za sebou. Vrací, jestli něco opravdu zaznělo. */
  say(...ids: string[]): boolean {
    const now = Date.now();
    const fresh = ids.filter((id) => now - (this.lastSaid.get(id) ?? -Infinity) > COOLDOWN_MS);
    if (!fresh.length) return false;
    for (const id of fresh) this.lastSaid.set(id, now);
    void audio.say(...fresh);
    return true;
  }

  /**
   * Přehraje jen jednou za sezení.
   *
   * Pro pokyny, které dítě pochopí napoprvé: jak se počítá, jak se obtahuje.
   * Podruhé už je to vysvětlování něčeho, co zrovna dělá.
   */
  sayOnce(key: string, ...ids: string[]): boolean {
    if (this.saidOnce.has(key)) return false;
    this.saidOnce.add(key);
    return this.say(...ids);
  }

  /** Přehraje bez ohledu na to, kdy zazněla naposledy. Pro věci, které nesmí chybět. */
  sayAlways(...ids: string[]): void {
    const now = Date.now();
    for (const id of ids) this.lastSaid.set(id, now);
    audio.stop();
    void audio.say(...ids);
  }

  /**
   * Vybere z variant tu, která nezazněla naposledy, a upřednostní ty,
   * které jsou nejdéle nepoužité.
   */
  pick(group: string, ids: readonly string[]): string {
    const last = this.lastVariant.get(group);
    const candidates = ids.filter((id) => id !== last);
    const pool = candidates.length ? candidates : [...ids];

    const oldest = pool.reduce((best, id) => {
      const a = this.lastSaid.get(id) ?? -Infinity;
      const b = this.lastSaid.get(best) ?? -Infinity;
      return a < b ? id : best;
    }, pool[0]!);

    this.lastVariant.set(group, oldest);
    return oldest;
  }

  /**
   * Pochvala. Nezazní pokaždé — a to je záměr, ne šetření.
   *
   * Vrací `true`, když se mluvilo, aby volající věděl, jestli má radost
   * dorovnat scénou. První zvládnutá položka v sezení se pochválí vždycky.
   */
  praise(ids: readonly string[], always = false): boolean {
    if (!always && Math.random() > PRAISE_CHANCE) return false;
    const id = this.pick('praise', ids);
    this.lastSaid.set(id, Date.now());
    audio.stop();
    void audio.say(id);
    return true;
  }

  /** Povzbuzení po chybě. Tohle zazní vždycky, dítě potřebuje slyšet, že se nic neděje. */
  encourage(ids: readonly string[]): void {
    const id = this.pick('encourage', ids);
    this.lastSaid.set(id, Date.now());
    void audio.say(id);
  }

  /** Nové sezení začíná s čistou pamětí, jinak by první minuta byla němá. */
  reset(): void {
    this.lastSaid.clear();
    this.lastVariant.clear();
    this.saidOnce.clear();
  }
}

export const director = new SpeechDirector();
