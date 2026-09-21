# Mikuláš se učí — architektura a datový model

Návrh k schválení (fáze 1). Zatím bez kódu.

---

## 1. Struktura projektu

```
/
├─ public/
│  ├─ audio/{speechId}.mp3        předgenerované promluvy (jediný zdroj hlasu za běhu)
│  ├─ audio/manifest.json         id → {hash, provider, voice, generatedAt, bytes}
│  ├─ fonts/andika-*.woff2        subset s češtinou (latin-ext)
│  └─ icons/                      PWA ikony, maskable
├─ scripts/
│  ├─ compare-voices.ts           fáze 2: 6 vět × 3 provideři → /voice-samples
│  ├─ generate-audio.ts           generuje jen chybějící/změněné (hash textu)
│  ├─ providers/                  elevenlabs.ts | azure.ts | google.ts (jedno rozhraní)
│  └─ lib/manifest.ts
├─ src/
│  ├─ content/     ← VEŠKERÁ DATA, žádná data v komponentách
│  │  ├─ items.numbers.ts         0–20, počítané motivy, kostkové rozvržení
│  │  ├─ items.letters.ts         pořadí, slovo, ilustrace, zaměnitelné znaky
│  │  ├─ words.ts                 slovo → ilustrace + pádové tvary pro promluvy
│  │  ├─ strokes.ts               tahy pro obtahování (SVG path + směr + pořadí)
│  │  ├─ speech.ts                id → text (+ SSML per provider), varianty
│  │  ├─ curriculum.ts            pořadí odemykání, prahy stupňů, konfigurace
│  │  └─ map.ts                   uzly cesty světem, souřadnice, co se rozsvítí
│  ├─ engine/      ← ČISTÉ FUNKCE, 100 % pokryté Vitestem, žádné React/IO
│  │  ├─ types.ts
│  │  ├─ mastery.ts               zvládnutí, postup mezi stupni
│  │  ├─ scheduler.ts             odemykání, spaced repetition
│  │  ├─ taskFactory.ts           stavba úlohy + výběr distraktorů
│  │  ├─ session.ts               plán sezení, mix nové/opakování, ukončení
│  │  └─ confusables.ts           M/N, E/F, 6/9, …
│  ├─ data/        ← persistence za rozhraním
│  │  ├─ ProgressRepository.ts    interface (jediné, co zná zbytek appky)
│  │  ├─ dexie/                   implementace IndexedDB
│  │  └─ memory/                  in-memory pro testy a Storybook-like náhledy
│  ├─ audio/
│  │  ├─ AudioEngine.ts           unlock, fronta, preload, ducking
│  │  ├─ speech.ts                play(id) / playSequence(ids) / fallback WebSpeech
│  │  ├─ sfx.ts                   Web Audio syntéza (žádné samply)
│  │  └─ mouth.ts                 AnalyserNode → amplituda pro maskota
│  ├─ scenes/                     vrstvy světa, parallax, denní světlo, drobný život
│  ├─ mascot/                     SVG postavička + stavy
│  ├─ components/                 sklo, dlaždice, znak, ilustrace slov
│  ├─ screens/                    Domů, Úloha, Mapa, Konec sezení, Rodičovská zóna
│  ├─ app/                        router, providery, reducer sezení
│  └─ styles/                     tokeny (CSS proměnné) + Tailwind theme
└─ tests/                         Vitest (engine), Playwright (screenshoty)
```

**Pravidlo:** `engine/` nesmí importovat nic z `react`, `data/` ani `audio/`. Bere stav, vrací
rozhodnutí. Proto je celá pedagogika testovatelná bez prohlížeče.

## 2. Stav a tok dat

```
ProgressRepository (IndexedDB)
        ↓ načte při startu
   SessionProvider (React useReducer, drží celý běžící stav v paměti)
        ↓ volá čisté funkce
   engine/session.nextTask(state) → Task
        ↓ render
   screens/TaskScreen → components + audio.play(speech.id)
        ↓ dítě odpoví
   engine/mastery.applyAttempt(state, attempt) → nový stav
        ↓ zápis (debounced, fire-and-forget)
   ProgressRepository.recordAttempt / upsertItemProgress
```

Žádný globální state manager navíc — React context + `useReducer`. Engine je čistý, takže
reducer je tenký a testy nepotřebují React.

## 3. Datový model

### 3.1 Obsah (statický, v `content/`)

```ts
type ItemId = `num:${number}` | `let:${string}`;   // "num:7", "let:M", "let:CH"

interface NumberItem {
  id: ItemId; kind: 'number';
  value: number;              // 0–20
  glyph: string;              // "7"
  countable: CountableId;     // motiv počítaných předmětů (dle světa)
  diceLayout: boolean;        // true pro 1–6 (subitizing)
  confusables: ItemId[];      // ["num:9"] u šestky
}

interface LetterItem {
  id: ItemId; kind: 'letter';
  glyph: string;              // "M", "CH"
  wordId: WordId;             // "mikulas"
  confusables: ItemId[];      // ["let:N"] u M
  letterNameOverride?: string;// jak má TTS znak vyslovit, viz §6
}

interface Word {
  id: WordId;
  nominative: string;         // "Mikuláš"
  illustration: IllustrationId; // klíč do registru SVG komponent
}

interface Stroke { d: string; startHint: [number, number]; order: number; }
interface StrokeSet { itemId: ItemId; viewBox: string; strokes: Stroke[]; }
```

### 3.2 Postup (IndexedDB)

```ts
type Stage = 1|2|3|4|5;   // seznámení, ze 2, ze 3–4, přiřazení, obtahování

interface Attempt {
  id: string; itemId: ItemId; stage: Stage;
  correct: boolean;        // správně napoprvé (druhý pokus se do mastery nepočítá)
  helped: boolean;         // byla zvýrazněna nápověda
  ts: number; sessionId: string;
}

interface ItemProgress {
  itemId: ItemId;
  state: 'locked' | 'learning' | 'mastered';
  stage: Stage;
  recent: boolean[];       // posledních 5 pokusů ze stupně ≥3 (napoprvé)
  stageStreak: number;     // správné v aktuálním stupni po sobě
  masteredAt?: number;
  review: { interval: number; dueAtSession: number; lapses: number } | null;
  unlockedAt?: number;
  updatedAt: number; dirty: boolean;      // pro budoucí Supabase sync
}

interface SessionRecord {
  id: string; startedAt: number; endedAt?: number;
  taskCount: number; correctFirstTry: number;
  itemsTouched: ItemId[]; newlyMastered: ItemId[];
  sessionIndex: number;    // monotónní čítač, jednotka pro opakovací intervaly
}

interface Settings {
  sessionMinutes: number;          // default 10
  areas: { numbers: boolean; letters: boolean };
  voiceId: string;                 // vybraný hlas z fáze 2
  sayLetterNames: boolean;         // „Říká se mu em." — učivo 2. třídy, výchozí false
  reducedMotion: 'auto' | 'on' | 'off';
  effectsVolume: number; speechVolume: number;
}

interface SpeechFlag { speechId: string; reason?: string; editedText?: string; ts: number; }
// rodičovská zóna: „označit k přegenerování"
```

Tabulky v Dexie: `itemProgress`, `attempts`, `sessions`, `settings`, `speechFlags`.
Každý záznam má `updatedAt` + `dirty` → pozdější Supabase sync umí last-write-wins bez migrace.

### 3.3 Rozhraní datové vrstvy

```ts
export interface ProgressRepository {
  init(): Promise<void>;
  loadSnapshot(): Promise<ProgressSnapshot>;          // vše potřebné pro engine, jedním čtením
  recordAttempt(a: Attempt): Promise<void>;
  saveItemProgress(p: ItemProgress[]): Promise<void>;
  startSession(): Promise<SessionRecord>;
  endSession(id: string, summary: SessionSummary): Promise<void>;
  getSettings(): Promise<Settings>;  saveSettings(s: Partial<Settings>): Promise<void>;
  flagSpeech(f: SpeechFlag): Promise<void>;  listSpeechFlags(): Promise<SpeechFlag[]>;
  exportAll(): Promise<ExportBundle>;  importAll(b: ExportBundle): Promise<void>;
  resetProgress(): Promise<void>;
}
```

Implementace `DexieProgressRepository` dnes, `SupabaseProgressRepository` (nebo
`SyncingRepository` obalující obě) později. Appka zná jen interface.

## 4. Pedagogický engine

### Stupně a postup v rámci položky
| Stupeň | Úloha | Přechod dál |
|---|---|---|
| 1 | Seznámení | po 1. zobrazení (klepání opakuje hlas, bez hodnocení) |
| 2 | Poznávání ze 2 | 2× správně napoprvé po sobě |
| 3 | Poznávání ze 3–4 (i zaměnitelné) | počítá se do mastery |
| 4 | Přiřazení (počet↔číslice, obrázek↔písmeno) | počítá se do mastery |
| 5 | Obtahování | nehodnotí se přísně, vždy „povede se" |

**Zvládnuto:** 4 z posledních 5 pokusů ve stupni ≥3 správně napoprvé. Pak se položka
přesune do opakovacího režimu; stupeň 5 (obtahování) zůstává dostupný jako radost.

**Odemykání:** položky jdou v pevném pořadí, nová se odemkne po zvládnutí předchozí,
nejvýš **2 rozpracované naráz** (`state === 'learning'`). Čísla a písmena mají vlastní
frontu, takže lze mít 2 rozpracovaná čísla i 2 písmena, pokud jsou obě oblasti zapnuté.

**Opakování (spaced repetition):** jednotkou je *sezení*, ne dny (dítě nehraje denně).
Intervaly `1 → 2 → 4 → 8 → 16` sezení. Správně → další interval, chyba → zpět o dva kroky
a `lapses++`. Plánovač naplní **20–30 %** úloh sezení splatnými opakováními (když žádná
splatná nejsou, vezme nejdéle nevídanou zvládnutou položku).

**Distraktory** (`taskFactory`): 1 správná + N nesprávných. Nejdřív vizuálně vzdálené,
po 3 správných ve stupni 3 se s rostoucí pravděpodobností přimíchá `confusables`.
Distraktor se nikdy nebere z položek, které dítě ještě nevidělo ve stupni 1.

**Chyba:** nikdy červená. 1. chyba → jemné zavrtění špatné dlaždice + promluva
„Tohle je N." + „Zkus najít M." (dvě skládané nahrávky, viz §6). 2. chyba → správná
možnost začne dýchat/svítit. 3. chyba → hlas dopoví a úloha se vyřeší jako ukázka.
Do mastery se zapisuje jen první pokus.

**Sezení:** rozpočet v minutách (default 10, nastavitelný). Nikdy se neutne uprostřed
úlohy. V poslední minutě plánovač zařadí jen jisté položky, aby sezení končilo úspěchem.
Závěr: maskot + mapa + promluva „Dneska ses naučil písmeno M a číslo tři."

## 5. Zvuk

- **Unlock (iPad Safari):** první dotek kdekoliv přehraje ticho v `AudioContext`,
  `context.resume()`. Do té doby appka nic nemluví — úvodní obrazovka je jen „klepni".
- **Fronta:** jedna promluva naráz, `playSequence(['letter.N.this','letter.M.find'])`
  s krátkou mezerou. Nová úloha frontu vyprázdní.
- **Preload:** při renderu úlohy se přednačtou klipy následující úlohy (engine umí
  `peekNext()`), plus všechny varianty pochval.
- **Fallback:** chybí-li soubor (nemělo by nastat, vše je v PWA cache) → Web Speech API
  `cs-CZ`, označeno v konzoli, aby to bylo vidět.
- **Efekty:** syntéza ve Web Audio — měkký útok, pentatonika laděná do světa, každá
  správná odpověď o stupeň výš v akordu, chyba = neutrální dřevěný „ťuk", ne bzučák.
  Sdílený `AudioContext` s promluvami, efekty se při řeči ztiší (ducking).
- **Pusa maskota:** `AnalyserNode` na výstupu řeči → `getByteTimeDomainData` → RMS →
  spring na výšku pusy. Při `prefers-reduced-motion` jen 3 statické pozice.

## 6. Hlas a promluvy

`content/speech.ts` je jediný zdroj textů:

```ts
interface SpeechLine {
  id: string;                    // "letter.M.intro"
  text: string;                  // "Tohle je M. M jako Mikuláš."
  ssml?: { azure?: string; google?: string; elevenlabs?: string };
  variants?: string[];           // pochvaly: 5–8 znění
  note?: string;                 // pokyn pro generování / poznámka pro rodiče
}
```

**Skládání místo kombinatorické exploze.** Oprava „Tohle je N. Zkus najít M." by při
29 písmenech znamenala 841 nahrávek. Místo toho dvě sady: `letter.X.this`
(„Tohle je N.") + `letter.X.find` („Zkus najít M.") a runtime je přehraje za sebou.
Totéž u počítání: `count.1`…`count.20` jako samostatné klipy pro klepací počítání
+ celá věta `number.7.total` („Je jich sedm.").

**Odhad objemu:** ~29 písmen × 5 + 21 čísel × 4 + 20 počítadel + ~15 pochval/povzbuzení
+ ~30 systémových ≈ **300 klipů, cca 2–4 MB** v mono MP3 48 kbps. Bez problému do PWA cache.

**ROZHODNUTO: hláska se vyvodí ze tří slov. Název písmene je volitelný a vypnutý.**

Opřeno o to, jak se čtení učí v české první třídě:

- **Analyticko-syntetická metoda** vyvodí slovo z mluvené řeči a rozloží ho na
  hlásky. „Nečtou se názvy písmen, ale vyslovuje se pouze odpovídající samostatná
  hláska."
- **Genetická metoda** slovo hláskuje a skládá (L-U-K = LUK) s cílem, „aby si dítě
  každé písmeno propojilo s odpovídající hláskou". Jede na **velkých tiskacích
  a na celé abecedě od začátku** — přesně na tom stojí i tahle aplikace.
- **Abeceda, tedy názvy písmen, je učivo 2. třídy**, o dva roky později.
- U předškoláka je cílem **sluchové vnímání a fonematické uvědomování**: slyšet
  první hlásku ve slově, skládat slova ze dvou tří hlásek. Ne abeceda.

Hlásku samotnou ale syntéza nepřehraje: izolovaný znak přečte názvem („em", „eř"),
protahovaná hláska („Mmmikuláš") zní jako koktání a u ražených hlásek (P T K D B C G Č)
nejde vyslovit ani člověkem. Používáme proto postup z hodiny — **vyvození hlásky
z více slov**, kde dítě hlásku vytáhne samo:

| Situace | Promluva |
|---|---|
| Seznámení | „Poslouchej. Mikuláš. Máma. Med. Slyšíš, jak začínají stejně?" |
| Kreslení znaku | „A takhle se to píše." (společné pro všechna písmena) |
| Úloha | „Kde je písmeno od Mikuláše?" |
| Oprava po chybě | „To je písmeno od nosu. Zkus najít písmeno od Mikuláše." |
| Přiřazení obrázku | „Kde je Mikuláš?" |
| Y (jediná výjimka) | „Poslouchej. Myš. Sýr. Motýl. Slyšíš to uprostřed?" |

Trojice slov je v datech u každého písmene (`echoWords`) a nepotřebuje ilustraci,
jen zazní. Název písmene existuje jako samostatná promluva `letter.X.name`
(„Říká se mu em.") a přehraje se **jen když si to rodič v rodičovské zóně zapne**;
výchozí stav je vypnuto.

**Srovnání hlasů (fáze 2), stejných 6 vět:**
1. „Tohle je M. M jako Mikuláš."
2. „Tohle je Ř."
3. „Spočítáme to spolu. Jedna, dvě, tři."
4. „To je ono! Moc ti to jde."
5. „Tohle je N. Zkus najít M."
6. „Dneska ses naučil písmeno M a číslo tři. Zítra se na tebe těším."

**ROZHODNUTO: provider je systémový hlas macOS (`say` + `afconvert`).** Azure padl na
registraci, která vyžaduje vlastní tenant i platební kartu. Systémová **Zuzana
v prémiové variantě** je proti základní výrazně lepší, je to rodilá čeština, běží
offline a nestojí nic. Skript si prémiovou variantu vybere sám, pokud je stažená.
Varianty ke srovnání:

| varianta | tempo | |
|---|---|---|
| tempo-klidne | 140 slov/min | |
| tempo-stredni | 160 slov/min | |
| tempo-svizne | 180 slov/min | |
| tempo-s-pauzami | 145 + delší ticho mezi větami | ✅ vybráno |

Výstup do `voice-samples/` + `voice-samples/index.html` pro poslech vedle sebe na iPadu.
Rozhraní `TtsProvider` zůstává, takže výměna providera je výměna jednoho souboru;
`elevenlabs.ts` je hotový pro případ, že by systémový hlas přestal stačit.
Klíče jen v `.env.local`, skripty běží v Node, klient je nikdy nevidí.

**Generování:** `scripts/generate-audio.ts` spočítá `sha256(text + provider + voice + ssml)`,
porovná s `public/audio/manifest.json` a vygeneruje jen rozdíl. `--only=id1,id2` pro
přegenerování označených z rodičovské zóny.

## 7. PWA a offline

`vite-plugin-pwa`, strategie `generateSW`, precache `**/*.{js,css,html,woff2,svg,mp3,png}`,
`maximumFileSizeToCacheInBytes` zvednout kvůli audiu. Úvodní stažení proběhne najednou
s ukazatelem v rodičovské zóně („offline připraveno"). Aktualizace: `autoUpdate`, ale nová
verze se aktivuje až mimo běžící sezení.

## 8. Kvalita a výkon

- **Vitest** na `engine/` (mastery, scheduler, taskFactory, session) a na `data/` proti
  in-memory implementaci. Cíl: každé pravidlo z §4 má test.
- **Playwright** screenshoty: iPad 1180×820 a 820×1180, telefon 390×844, po každé
  vizuální změně, hodnocení proti `DESIGN.md`.
- **iPad Safari priorita:** autoplay až po dotyku, `backdrop-filter` jen na omezeném počtu
  vrstev (měřím `requestAnimationFrame` a při poklesu pod ~50 fps degraduji blur na
  poloprůhlednou vrstvu s texturou), `touch-action: manipulation`, zamčený zoom,
  `-webkit-user-select: none`, `-webkit-touch-callout: none`, `overscroll-behavior: none`.
- `prefers-reduced-motion` → springy se zkrátí na okamžitý přechod, parallax vypnut,
  scéna se hýbe jen světlem.

## 9. Co potřebuju od tebe rozhodnout

Rozhodnuto:
- ✅ Název appky: **Mikuláš se učí**
- ✅ Výslovnost znaku: hláska se vyvodí ze tří slov, název je volitelný (§6)
- ✅ TTS: systémový hlas macOS, Zuzana Premium, tempo 145 s pauzami mezi větami

Zbývá:
1. **Vygenerovat audio** — `npm run audio` na Macu, viz README.
2. **Délka sezení** — beru default 10 min, nastavitelné v rodičovské zóně.
