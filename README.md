# Mikuláš se učí

Webová aplikace, která předškoláka naučí čísla a písmena — celá přes hlas, obrázky a dotyk.
Primárně iPad (landscape i portrait), jazyk čeština.

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — struktura, datový model, engine, hlas, PWA
- [docs/WORDS.md](docs/WORDS.md) — slova k písmenům, obsah čísel

## Stav

| Fáze | Co | Stav |
|---|---|---|
| 1 | Architektura, datový model, slova | hotovo |
| 2 | Hlas: srovnání a generování | skripty hotové, čeká se na vygenerování |
| 3 | Koncepty světa a maskota | vybráno papírové divadlo + Kulisák, viz [DESIGN.md](DESIGN.md) |
| 4 | Engine a čísla | hotovo: seznámení, poznávání, počítání |
| 5–8 | Písmena, obtahování, mapa, rodičovská zóna, deploy | před námi |

## Hlas

Aplikace za běhu nikam nevolá. Všechny promluvy se **jednou** předgenerují do
`public/audio/` a commitnou do repa; v prohlížeči se pak přehrávají jen hotové soubory.
Web Speech API je pouze nouzová záloha, kdyby soubor chyběl.

Texty promluv jsou **výhradně** v [`src/content/speech.ts`](src/content/speech.ts).
Nikde jinde v kódu žádný text, který se má vyslovit, nebude.

### Poslech a výběr hlasu

```bash
npm install
npm run voices                      # macOS Zuzana ve třech tempech + varianta s pauzami
open voice-samples/index.html       # poslechni si to, ideálně na iPadu
```

Vygeneruje šest vět, které pokrývají to nejtěžší z celé aplikace (mimo jiné „Tohle je eř."
a počítání „jedna, dvě, tři"), v několika variantách vedle sebe.

Výchozí nastavení je **tempo 145 slov za minutu s delším tichem mezi větami** — vybráno
poslechem na iPadu, pro pětiletého je srozumitelnější než svižnější varianty.

Hlas **Zuzana** je součástí macOS a prémiová varianta zní výrazně líp než základní.
Stáhneš ji v *Nastavení → Zpřístupnění → Čtení a mluvení → Hlas systému →
Spravovat hlasy → Čeština*. Skript si ji vybere sám — mezi českými hlasy hledá
nejdřív „Premium", pak „Enhanced", teprve pak základní. Ověřit, co systém vidí:

```bash
say -v '?' | grep cs_CZ
```

Hláska se nevyslovuje izolovaně, ale vyvodí se ze tří slov („Poslouchej. Mikuláš.
Máma. Med. Slyšíš, jak začínají stejně?") — tak, jak se to dělá v první třídě.
Název písmene je učivo 2. třídy a přehraje se jen na přání rodiče. Proč přesně,
je v hlavičce [`src/content/items.letters.ts`](src/content/items.letters.ts).

### Vygenerování celé sady

```bash
npm run audio:dry                   # ukáže, co by se generovalo, nic nevytvoří
npm run audio                       # vygeneruje jen chybějící a změněné
npm run audio -- --rate=160         # jiné tempo, výchozí je 145
npm run audio -- --pause=0          # bez delších pauz mezi větami
npm run audio -- --voice="Zuzana (Premium)"
npm run audio -- --only=letter.M.intro,praise.3
npm run audio -- --force            # znovu úplně všechno
```

Skript si vede `public/audio/manifest.json` s hashem textu a nastavení hlasu. Když později
prohodíš slovo u jednoho písmene, přegeneruje se pár souborů, ne celá sada. Manifest je
zároveň to, co za běhu mapuje ID promluvy na soubor — proto můžou mít soubory ASCII názvy
(`letter.R_.intro.m4a`) a nevadí rozdíl mezi macOS a Linuxem v kódování diakritiky.

Na macOS je výstup **m4a/AAC**, ne mp3: macOS neumí mp3 kódovat bez doinstalování ffmpeg,
kdežto `afconvert` je v systému vždycky. Safari i iOS m4a přehrají bez problémů.

### Jiný provider

Providery jsou za jedním rozhraním v [`scripts/tts/`](scripts/tts/). Kromě macOS je
připravený ElevenLabs:

```bash
echo 'ELEVENLABS_API_KEY=...' >> .env.local     # .env.local je v .gitignore
npm run voices -- --provider=elevenlabs
npm run audio  -- --provider=elevenlabs
```

Celá sada má ~383 promluv a asi 8 200 znaků, takže se vejde i do free tieru.
Klíč čte **jen** Node při generování, do klientského kódu se nikdy nedostane.

## Přidání položky

1. Písmeno → `src/content/items.letters.ts`, číslo → `src/content/items.numbers.ts`.
2. Promluvy se z položek odvodí samy (šablony jsou v `src/content/speech.ts`).
3. `npm test` ověří, že slovo začíná správnou hláskou, ID nekolidují a texty jsou v pořádku.
4. `npm run audio` dogeneruje jen nové klipy.

## Spuštění

```bash
npm run dev          # Vite vypíše i adresu „Network" — tu otevři na iPadu
npm run build
npm run preview
```

Koncepty světa zůstávají dostupné na `?koncepty`. Jednotlivou úlohu si jde
prohlédnout bez proklikávání: `?uloha=pocitani&polozka=num:7`.

## Testy a kontrola vzhledu

```bash
npm test             # engine a obsah, čisté funkce bez prohlížeče
npm run typecheck
npm run shots        # screenshoty konceptů v rozlišení iPadu a telefonu
npm run flow         # projde appku jako dítě a hlásí chyby v konzoli
```

`shots` a `flow` potřebují běžící `npm run preview` a Chromium. V prostředí,
kde Playwright hledá prohlížeč jinde, než kde leží, se cesta předá přes
`CHROMIUM_PATH`.

## Struktura

| Adresář | Co v něm je |
|---|---|
| `src/content/` | veškerá data: položky, slova, promluvy |
| `src/engine/` | pedagogika jako čisté funkce, žádný React ani IO |
| `src/data/` | postup za rozhraním `ProgressRepository` (IndexedDB, později Supabase) |
| `src/audio/` | přehrávání promluv, syntéza efektů |
| `src/theatre/` | jeviště, rampa, diapozitivy, počítané motivy |
| `src/screens/` | jednotlivé obrazovky |
| `src/mascots/` | Kulisák a zahozené návrhy |
| `scripts/` | generování hlasu a kontrola vzhledu |
