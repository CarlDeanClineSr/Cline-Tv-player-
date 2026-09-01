# Cline-Tv-player-

A custom CRT-style web player built to play curated Internet Archive video and audio streams through the Imperial Physics Observatory site.

## Current V169 structure

- `index.html` — CRT television interface, dynamic tuner, retry handling, OSD, diagnostics, and radio-scope visualization.
- `catalog.js` — core A-J television/movie catalog and programming engine.
- `x_minus_one_catalog.js` — 122 verified original MP3 X Minus One broadcasts.
- `star_trek_tos_catalog.js` — 80 verified Star Trek Original Series files.
- `harvest_tng.js` — 176 verified TNG program files from the ST9 batch.
- `harvest_ds9.js` — 173 verified DS9 program files.
- `harvest_voyager.js` — 168 verified Voyager program files.
- `harvest_star_trek_continues.js` — 16 verified Star Trek Continues / bonus files.
- `harvest_hitchcock_s1.js`, `harvest_hitchcock_s2.js`, `harvest_hitchcock_s3.js` — 116 verified Alfred Hitchcock Presents programs.
- `harvest_buck_rogers.js` — 33 verified Buck Rogers files.
- `harvest_man_from_atlantis.js` — 17 verified Man From Atlantis files.
- `schoolhouse_rock_catalog.js` — 73 verified Schoolhouse Rock / bonus MP4 files woven through cartoon channels.
- `refined_catalog_utils.js` + `refined_data_01.js` through `refined_data_24.js` — compact source/filename catalogs selected from the 5,306-entry Mega Harvester pool.
- `radio_channels.js` — parser-blocking loader for generated catalogs.
- `programming_registry.js` — final channel assembly, Schoolhouse weaving, refined Mega channels, automobile commercial breaks, Star Trek ordering, repairs, and inventory logging.
- `archive-browser.html` — browser utility for inspecting playable files inside an Internet Archive item.
- `discovered_collections.js` — retained discovery source data; not loaded into the live schedule.

## Current V169 inventory

The assembled live schedule is **4,819 playable entries** across **22 channels**:

- **2,346 video entries**
- **2,473 audio entries**
- **0 direct duplicate URLs** in the validated scheduling model

Channel layout:

- `A` — 70 mixed programs
- `B` — **689 programs; all Star Trek plays first as one uninterrupted block**
  - 80 Star Trek TOS files
  - 16 Star Trek Continues / bonus files
  - 176 Star Trek TNG files
  - 173 Star Trek DS9 files
  - 168 Star Trek Voyager files
  - followed by the previous 76 Channel-B programs
- `C` — 84 mixed programs
- `D` — 91 mixed/cartoon programs, including Schoolhouse Rock
- `E` — 70 mixed/cartoon programs, including Schoolhouse Rock
- `F` — 77 mixed/cartoon programs, including Schoolhouse Rock
- `G` — 25 programs
- `H` — 32 programs
- `I` — 30 programs
- `J` — 54 programs
- `K` — X Minus One Radio, 122 broadcasts
- `L` — Alfred Hitchcock Presents, 118 entries after commercial weaving
- `M` — Buck Rogers, 35 entries after commercial weaving
- `N` — Man From Atlantis, 19 entries after commercial weaving
- `O` — **OTR Detective / Mystery, 1,272 audio programs**
- `P` — **OTR Westerns, 273 audio programs**
- `Q` — **WWII Radio / History, 51 programs**
- `R` — **International / Shortwave Audio, 745 audio programs**
- `S` — **Classic TV / Cartoons, 785 entries after commercial weaving**
- `T` — **Science / Education, 84 entries after commercial weaving**
- `U` — **Shock / Drive-In, 67 entries after commercial weaving**
- `V` — **Holiday Radio / TV, 26 entries after commercial weaving**

## Mega Harvester refinement

Mega Harvester V2 produced 5,306 canonical ranged-GET-tested records from 759 Archive items. The original search profiles were intentionally broad discovery nets and were **not treated as trustworthy final categories**. For example, Schoolhouse Rock surfaced under a car-commercial search, and unrelated radio could surface under NASA or WWII keyword searches.

The V169 refinement uses source identifier, filename/title, media type, recognizable series structure, and existing-player overlap checks to turn that discovery pool into scheduled programming:

- **3,295 newly selected programs** were assigned to channels O-V.
- **38 verified vintage automobile ads** were selected as commercial breaks.
- Those ads are woven once each through video-heavy channels A, C-J, L-N and S-V.
- **Channel B is excluded from commercials** so its Star Trek block remains uninterrupted.
- Roughly 1,700 noisy, ambiguous, unrelated, questionable, or lower-confidence records remain in the Drive master database as reserve material rather than being blindly scheduled.
- Additional records were withheld because they overlapped material already represented in the player or were alternate discovery copies.

The refined pool includes large runs of Yours Truly Johnny Dollar, The Whistler, Dragnet radio, Suspense, Philip Marlowe, Richard Diamond, 21st Precinct, Gunsmoke radio, Tales of the Texas Rangers, Winston Churchill wartime broadcasts, international/shortwave recordings, Reading Rainbow, Rocky & Bullwinkle, Amazing Stories, Captain Scarlet, Space: 1999, The Prisoner, UFO, X-Men: The Animated Series, Connections, Cosmos, educational films, Kolchak, Shock/drive-in horror, and holiday programming.

## Commercial breaks

The 38 automobile spots are real ranged-GET-tested Archive media selected from the noisy commercial search results. They include period Ford, Chevrolet, Plymouth, Dodge, Chrysler, Pontiac, Oldsmobile, Edsel, AC-Delco, seat-belt, and international automobile advertising. They are not given tuner positions; they are woven between regular programs so the TV feels more like an old broadcast schedule.

## Verification meaning

`verified` means the Colab pipeline successfully received media bytes from the Archive endpoint using a lightweight ranged GET and preserved the exact Archive identifier/filename used to construct the direct URL. It does **not** mean:

- the item is necessarily public domain or cleared for redistribution;
- every browser can decode every codec/container;
- every series is historically complete;
- an initial Archive search label was semantically correct.

## Colab -> TV workflow

1. Use Archive searches to discover promising identifiers.
2. Query Archive metadata rather than guessing filenames.
3. Run lightweight ranged-GET media tests.
4. Preserve PASS records plus identifier, filename, format, size, source/original relationship, rights/license fields, language, and direct URL.
5. Canonicalize alternate encodings.
6. Reclassify broad-search results using actual source/content evidence.
7. Filter existing player material and obvious duplicates/noise.
8. Export compact generated JavaScript catalogs.
9. Load the generated catalogs before `programming_registry.js`.
10. Hard-refresh the site and inspect F12 diagnostics.

## Audio display

Audio programs do not leave a blank CRT. The player shows a star-field / centered radio-scope animation behind the native audio controls while the OSD identifies the channel and program. The visualization follows playback state/time without routing cross-origin Archive audio through a WebAudio `MediaElementSource`, avoiding a common CORS failure mode.

## Rights / source discipline

Internet Archive availability does not automatically mean an item is public-domain or cleared for redistribution. Preserve Archive identifiers, rights/license metadata, scanner results, and the reserve database so the source and status of each catalog entry remain traceable.
