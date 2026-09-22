# Design systém — Papírové divadlo

Závazné. Když je něco v rozporu s tímhle dokumentem, opraví se to, ne dokument.

## Svět

Ručně vystřižené loutkové divadlo. Vrstvy papíru zasunuté v drážkách, prosvícené
teplou lampou zezadu. Mikuláš sedí v hledišti a scéna se hraje pro něj. Kulisák,
kluk od lamp, mu dělá společnost.

Postup je fyzický: každé zvládnuté písmeno nebo číslo natrvalo rozsvítí jednu
lampičku na rampě a do scény sjede další kulisa. Žádné body, žádné hvězdičky.
Divadlo se postupně zaplňuje a rozsvěcí — to je celá motivace.

## Kostra

Všechno vychází z **cesty** a všechno se na ni vrací.

```
dotek  →  CESTA  ⇄  sezení (úloha ⇄ mezihra)  →  děkovačka  →  CESTA
                 ⇄  rodičovská zóna
```

Cesta je domovská obrazovka, ne mapa schovaná za tlačítkem. Dítě na ní vidí
naráz tři věci: kde je (Kulisák stojí na místě, kde se pokračuje), co má za
sebou (rozsvícené lampy, na které se dá klepat) a co ho čeká (další zastávky
jsou vidět dopředu, jen zhasnuté). Hraje se klepnutím na to velké svítící
místo, ne přes menu.

**Ze sezení se dá kdykoliv odejít.** Domeček vlevo nahoře, bez ptaní a bez
potvrzování. Postup se ukládá po každé odpovědi, takže se nic neztratí.
Aplikace, ze které se nedá odejít, je past, a past pětiletému nenabízíme.

## Dvojí postup

Postup se ukazuje na dvou místech a každé odpovídá na jinou otázku:

| Kde | Co říká | Odpovídá na |
|---|---|---|
| **Rampa** u paty jeviště | kolik úloh z tohohle sezení je za mnou | „kdy to skončí?" |
| **Cesta** na domovské obrazovce | kolik písmen a čísel už umím | „jak jsem daleko?" |

Rampa je cíl sezení: rozsvítit ji celou. Do dvanácti úloh je jedna lampička
jedna úloha, u delších sezení se plní poměrně. Nikdy se nenasytí a nikdy
neukazuje nic jiného než právě běžící sezení.

## Principy

1. **Papír, ne sklo a chrom.** Každá plocha je výstřižek. Má trhaný okraj, vlákno
   a vrhá stín na to pod sebou.
2. **Nepřesnost je záměr.** Barevné plochy jsou vytištěné dvakrát, jednou o pár
   pixelů vedle a světlejší. Špatný soutisk je to, co dělá starý dětský tisk starým
   dětským tiskem.
3. **Pod sklem je vždycky vidět scéna.** Sklo rozostřuje, neschovává.
4. **Znak je neprůhledný a obří.** Vždycky. Bez výjimky.
5. **Animace nikdy nezdržuje.** Dítě smí klepnout kdykoliv a úloha musí reagovat.
6. **Nic se nepoužívá, co vyžaduje čtení.** Ani v ovládání, ani v navigaci.

## Tokeny

```css
--paper:        #F3E5CA;   /* základní papír, obloha */
--paper-deep:   #E2CCA4;   /* prkna jeviště */
--paper-edge:   #C3A377;   /* hrany, linky prken */
--ink:          #241C16;   /* text, obrysy */
--ink-soft:     #3B2A20;   /* střechy, tyčky, stíny */
--madder:       #B0392B;   /* sukno, akcent */
--madder-deep:  #8E2C21;   /* záhyby drapérie */
--madder-dark:  #631A14;   /* nejhlubší záhyb */
--ochre:        #D69C36;   /* zlatá šňůra, praporky */
--teal:         #2F6B62;   /* stromy, Kulisákův kabát */
--teal-deep:    #24564F;
--lamp:         #F7C86B;   /* světlo rampy, okna */
--lamp-bright:  #FBDC9A;   /* rozsvícená lampička */
--wood:         #7A5C3B;   /* rámy, podstavce */
--wood-deep:    #5C4429;
```

Zakázané barvy: cokoliv studeného. Žádná modrá, fialová, neon. Zeleň je jen
smrková `--teal`, nikdy jarní ani tyrkysová.

## Sklo

```css
--glass-tint:     rgba(243, 229, 202, 0.10);
--glass-edge:     linear-gradient(155deg, rgba(255,252,242,.9),
                  rgba(255,252,242,.1) 45%, rgba(59,42,32,.45));
--glass-sheen:    linear-gradient(to bottom, rgba(255,252,243,.3), transparent);
--glass-shadow:   0 14px 30px -14px rgba(59,42,32,.6);
--glass-blur:     5px;
--glass-saturate: 1.25;
```

Sklo je diapozitiv kouzelné laterny. Rám je **vrstva nad sklem**, nikdy jeho
rodič — jinak sklo rozostřuje rám místo scény a je slepé.

Pod každým znakem je zákal (`radial-gradient` z `--paper` s klesající průhledností),
tak jak se diapozitivy malovaly. Řeší to kontrast znaku nad pestrou scénou.

Blur nikdy výš než 8 px. Měří se to, ne odhaduje: na starším iPadu je každá další
skleněná vrstva měřitelná ztráta.

## Typografie

**Andika**, řezy 400 a 700, hostované lokálně, podmnožiny latin a latin-ext.
Navržená pro výuku čtení — jednoznačné tvary tam, kde jiné fonty matou (I × l × 1).

| Použití | Velikost |
|---|---|
| Znak v úloze | `clamp(70px, 10vw, 138px)`, 700 |
| Znak při seznámení | `clamp(140px, 26vw, 360px)`, 700 |
| Otázka | `clamp(19px, 2.5vw, 33px)`, 400 |
| Rodičovská zóna | `clamp(15px, 1.6vw, 19px)`, 400 |

Žádný druhý font. Žádné velké písmo pro nadpisy v rodičovské zóně — ta má být
tiše funkční, ne designová.

## Pohyb

Všechno je loutka na tyčce nebo papír na provázku.

| Situace | Pružina |
|---|---|
| Dosednutí dlaždice | `stiffness: 170, damping: 15` |
| Cedule shora | `stiffness: 70, damping: 11` |
| Klepnutí | `scale: 0.965`, okamžitě |
| Houpání v klidu | 8–9 s perioda, `easeInOut`, amplituda pod 2° |

- Žádné lineární easingy. Nikde.
- Žádná animace nad 700 ms na cestě dítěte.
- Každý prvek se houpe **jinou periodou**. Synchronní pohyb vypadá jako stroj.
- Správná odpověď = krátká reakce ve stylu světa: lampička cukne, kulisa se
  zhoupne, Kulisák nadskočí. **Nikdy konfety.**
- Chyba = jemné zavrtění, 250 ms, amplituda 6 px. Nikdy červená, nikdy zvuk dolů.

`prefers-reduced-motion`: pružiny se zkrátí na okamžitý přechod, parallax se vypne,
scéna se hýbe už jen světlem.

## Zakázáno

- Fialovomodré a růžovooranžové gradienty.
- Inter, systémový font, jakýkoliv grotesk.
- Emoji jako ikona. Kdekoliv.
- Zaoblená karta s `box-shadow` na bílém pozadí.
- Konfety, třpytky, lesklé 3D bubliny.
- Stock ilustrace. Všechno je kreslené v SVG přímo v kódu.
- Všechno vycentrované v jednom sloupci. Cedule visí vlevo, Kulisák stojí vpravo,
  dlaždice stojí v mírném oblouku a každá jinak vysoko.
- Průhledný nebo obtažený znak.
- Text, bez kterého se appka neovládá.

## Dotyk

- Dotykový cíl nejmíň **88 px**, u dlaždic odpovědí výrazně víc.
- Žádné scrollování v úlohách. Žádné časové limity. Žádné pop-upy.
- Zoom, výběr textu a menu po přidržení jsou vypnuté globálně.
- Klepnutí na cokoliv to vždycky i vysloví.

## Výkon

Cíl 60 fps na starším iPadu.

- Zrno je **dlaždice 140 px**, nikdy `feTurbulence` přes celou plochu. (Tahle
  chyba byla v první verzi a byla tak drahá, že screenshot nedoběhl do minuty.)
- `feDisplacementMap` a podobné filtry jen na malých prvcích, nikdy na skupině
  přes celou scénu.
- Skleněných vrstev nejvýš pět naráz.
- Parallax jde přes `transform`, nikdy přes `top`/`left`.
- Když snímkovost spadne pod 50 fps, blur se degraduje na poloprůhlednou vrstvu
  s texturou.
