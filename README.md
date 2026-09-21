# Mikuláš se učí

Webová aplikace, která předškoláka naučí čísla a písmena — celá přes hlas, obrázky a dotyk.
Žádný text není potřeba k ovládání. Primárně iPad (na šířku i na výšku), sekundárně telefon.

- [DESIGN.md](DESIGN.md) — závazný design systém světa
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — struktura, datový model, engine, hlas, PWA
- [docs/WORDS.md](docs/WORDS.md) — slova k písmenům, obsah čísel
- [docs/CONCEPTS.md](docs/CONCEPTS.md) — tři koncepty světa, ze kterých se vybíralo

## Spuštění

```bash
npm install
npm run dev          # Vite vypíše i adresu „Network" — tu otevři na iPadu
```

```bash
npm run build
npm run preview
```

Postranní vchody pro vývoj a kontrolu, v běžném provozu na ně nikdo nesáhne:

| Adresa | Co ukáže |
|---|---|
| `?koncepty` | tři původní koncepty světa a maskoty |
| `?uloha=pocitani&polozka=num:7` | klepací počítání |
| `?uloha=obrazek&polozka=let:M` | přiřazení obrázku k písmenu |
| `?uloha=obtahovani&polozka=let:M` | obtahování prstem |
| `?uloha=mapa&hotovo=11` | mapa s vymyšleným postupem |

## Jak se to učí

Obě hlavní české metody prvopočátečního čtení učí **hlásku**, ne název písmene; názvy
a abeceda jsou učivo druhé třídy. Syntéza ale izolovanou hlásku vyslovit neumí, takže
se vyvozuje ze tří slov — přesně jak to dělá učitelka:

> „Poslouchej. Mikuláš. Máma. Med. Slyšíš, jak začínají stejně?"

Písmeno pak v promluvách vystupuje jako **„písmeno od Mikuláše"** a nikdy se nevysloví
samo. Podrobnosti proč jsou v hlavičce [`src/content/items.letters.ts`](src/content/items.letters.ts).

Položka prochází pěti stupni: seznámení → poznávání ze dvou → poznávání ze tří až čtyř →
přiřazení (počet k číslici, obrázek k písmenu) → obtahování. **Zvládnutá je při čtyřech
správných z posledních pěti pokusů ve stupni 3 a výš**, počítá se jen správně napoprvé
a bez nápovědy. Nová položka se odemkne až po zvládnutí předchozí, nejvýš dvě rozpracované
naráz. Zvládnuté se vracejí v rostoucích intervalech měřených v sezeních, ne ve dnech.

Chyba nikdy není červená: špatná volba se jemně zavrtí, hlas pojmenuje, co dítě vybralo,
a nabídne další pokus. Po dvou chybách začne správná možnost dýchat, po třetí se úloha
vyřeší jako ukázka, aby dítě neuvízlo.

## Hlas

Aplikace za běhu nikam nevolá. Všech ~383 promluv se **jednou** předgeneruje do
`public/audio/` a commitne do repa; v prohlížeči se přehrávají jen hotové soubory.
Web Speech API je pouze nouzová záloha, kdyby soubor chyběl.

Texty jsou **výhradně** v [`src/content/speech.ts`](src/content/speech.ts).

### Výběr hlasu

```bash
npm run voices
open voice-samples/index.html      # poslechni na iPadu, přes jeho reproduktor
```

Vygeneruje osm vět, které pokrývají to nejtěžší z celé aplikace, ve čtyřech variantách
tempa. Výchozí je **Zuzana Premium, 145 slov za minutu s delšími pauzami mezi větami** —
vybráno poslechem. Prémiovou variantu stáhneš v *Nastavení → Zpřístupnění → Čtení
a mluvení → Hlas systému → Spravovat hlasy → Čeština*; skript si ji najde sám.

### Vygenerování sady

```bash
npm run audio:dry                  # ukáže, co by se generovalo
npm run audio                      # jen chybějící a změněné
npm run audio -- --only=letter.M.intro,praise.3
npm run audio -- --rate=160 --pause=0
npm run audio -- --force
```

Manifest v `public/audio/manifest.json` drží hash textu i nastavení hlasu, takže změna
jednoho slova přegeneruje pár klipů, ne celou sadu. Je zároveň tím, co za běhu mapuje ID
promluvy na soubor — proto můžou mít soubory ASCII názvy (`letter.R_.intro.m4a`)
a nevadí rozdíl mezi macOS (NFD) a Linuxem (NFC) v kódování diakritiky.

Na macOS je výstup **m4a/AAC**: mp3 neumí macOS kódovat bez ffmpeg, kdežto `afconvert`
je v systému vždycky. Safari i iOS m4a přehrají a aplikaci na formátu nezáleží.

V rodičovské zóně na kartě **Hlasy** jde každou promluvu přehrát, označit k přegenerování
a případně k ní napsat lepší text. Označené se zkopírují jako seznam pro `--only=`.

## Přidání položky

1. Písmeno → [`src/content/items.letters.ts`](src/content/items.letters.ts)
   (slovo, 2. a 4. pád, dvě slova se stejným začátkem, zaměnitelné znaky, klíč ilustrace).
   Číslo → [`src/content/items.numbers.ts`](src/content/items.numbers.ts).
2. Obrázek přikresli do [`src/theatre/Illustrations.tsx`](src/theatre/Illustrations.tsx)
   pod stejným klíčem.
3. Tahy pro obtahování do [`src/content/strokes.ts`](src/content/strokes.ts), pokud jde
   o nový znak.
4. Promluvy se odvodí ze šablon samy.
5. `npm test` ověří, že slovo začíná správnou hláskou, ilustrace i tahy existují, ID
   nekolidují a promluva neobsahuje název písmene.
6. `npm run audio` dogeneruje jen nové klipy.

## Rodičovská zóna

Podrž **pravý horní roh tři vteřiny**. Během držení se plní tenký oblouk. Obsahuje přehled
zvládnutých položek a posledních sezení, délku sezení, zapnutí a vypnutí oblastí, hlasitosti,
přepínač „říkat i názvy písmen" (výchozí vypnuto), smazání postupu a přehled všech promluv.

## Testy a kontrola vzhledu

```bash
npm test             # engine a obsah, čisté funkce bez prohlížeče
npm run typecheck
npm run shots        # screenshoty konceptů v rozlišení iPadu a telefonu
npm run flow         # projde aplikaci jako dítě a hlásí chyby v konzoli
```

`shots` a `flow` potřebují běžící `npm run preview`. Když Playwright hledá prohlížeč jinde,
než kde leží, cesta se předá přes `CHROMIUM_PATH`.

## Nasazení

Vercel, bez konfigurace navíc — [`vercel.json`](vercel.json) má build, SPA přesměrování
i hlavičky pro cache.

```bash
npx vercel            # poprvé: propojí projekt
npx vercel --prod
```

Nebo přes web: v Vercelu *Add New → Project*, vybrat repozitář, nechat výchozí nastavení
(Vite se detekuje sám) a nasadit.

Offline: service worker předukládá **všechno včetně audia**, dohromady kolem 8 MB.
První načtení je proto delší, zato appka funguje i na chatě bez signálu. Nová verze se
nikdy nenasadí uprostřed úlohy — čeká, až bude Mikuláš na rozcestníku.

Na iPadu se přidá na plochu přes *Sdílet → Přidat na plochu*; pak běží na celou obrazovku
bez adresního řádku.

## Struktura

| Adresář | Co v něm je |
|---|---|
| `src/content/` | veškerá data: položky, slova, promluvy, tahy |
| `src/engine/` | pedagogika jako čisté funkce, žádný React ani IO |
| `src/data/` | postup za rozhraním `ProgressRepository` (IndexedDB, později Supabase) |
| `src/audio/` | přehrávání promluv, syntéza efektů ve Web Audio |
| `src/theatre/` | jeviště, rampa, diapozitivy, ilustrace, počítané motivy |
| `src/screens/` | jednotlivé obrazovky a typy úloh |
| `src/mascots/` | Kulisák a zahozené návrhy |
| `src/concepts/` | původní tři koncepty světa, ponechané pro srovnání |
| `scripts/` | generování hlasu a kontrola vzhledu |

Pravidlo: `engine/` nesmí importovat nic z `react`, `data/` ani `audio/`. Bere stav,
vrací rozhodnutí. Proto je celá pedagogika testovatelná bez prohlížeče.
