# Cline-Tv-player-

A custom CRT-style web player built to play curated Internet Archive video and audio streams through the Imperial Physics Observatory site.

## Current V168 structure

- `index.html` — CRT television interface, dynamic tuner, retry handling, OSD, diagnostics, and radio-scope visualization.
- `catalog.js` — core A-J television/movie catalog and programming engine.
- `x_minus_one_catalog.js` — 122 verified original MP3 X Minus One broadcasts.
- `star_trek_tos_catalog.js` — 80 verified Star Trek Original Series files: Season 1 = 30, Season 2 = 26, Season 3 = 24.
- `harvest_tng.js` — 176 verified TNG program files from the full ST9 batch.
- `harvest_ds9.js` — 173 verified DS9 program files from the full ST9 batch.
- `harvest_voyager.js` — 168 verified Voyager program files from the full ST9 batch.
- `harvest_star_trek_continues.js` — 16 verified Star Trek Continues / bonus files.
- `harvest_hitchcock_s1.js`, `harvest_hitchcock_s2.js`, `harvest_hitchcock_s3.js` — 116 verified Alfred Hitchcock Presents programs.
- `harvest_buck_rogers.js` — 33 verified Buck Rogers program files.
- `harvest_man_from_atlantis.js` — 17 verified Man from Atlantis program files, including four S00 TV-movie/special files plus 13 series episodes.
- `schoolhouse_rock_catalog.js` — 73 verified original MP4 Schoolhouse Rock / bonus files from Archive item `schoolhouse-rock-30th`.
- `radio_channels.js` — assembles the generated catalogs into channels, spreads Schoolhouse Rock through cartoon programming, and applies small runtime catalog repairs.
- `archive-browser.html` — browser utility for inspecting playable files inside an Internet Archive item.
- `discovered_collections.js` — compact backup of the 724-program Colab discovery batch; it is retained as source data and is not loaded by the live player.

## Current V168 inventory

The live catalog now assembles to **1,486 playable entries** across **14 channels**:

- **1,364 video entries**
- **122 audio entries**
- **0 intentional duplicate URL entries** in the scheduled layout

Channel layout:

- `A` — 67 mixed programs
- `B` — **689 programs; all Star Trek plays first as one continuous block**
  - 80 Star Trek TOS files
  - 16 Star Trek Continues / bonus files
  - 176 Star Trek TNG files
  - 173 Star Trek DS9 files
  - 168 Star Trek Voyager files
  - followed by the previous 76 Channel-B programs
- `C` — 81 mixed programs
- `D` — 88 mixed/cartoon programs, including 25 Schoolhouse Rock clips woven through the existing schedule
- `E` — 67 mixed/cartoon programs, including 24 Schoolhouse Rock clips woven through the existing schedule
- `F` — 74 mixed/cartoon programs, including 24 Schoolhouse Rock clips woven through the existing schedule
- `G` — 22 programs
- `H` — 30 programs
- `I` — 28 programs
- `J` — 52 programs
- `K` — X Minus One Radio, 122 verified MP3 broadcasts
- `L` — Alfred Hitchcock Presents, 116 verified programs from Seasons 1-3
- `M` — Buck Rogers in the 25th Century, 33 verified program files
- `N` — Man From Atlantis, 17 verified program files

The 73 Schoolhouse Rock files were independently re-verified by the Mega Archive Harvester using ranged GET requests. They are not taken on trust from manually generated URL text. All 73 selected rows returned HTTP 206 and `video/mp4` as original Archive files.

The separate 25-file TNG discovery item is retained in the batch source as alternate evidence, but it is not scheduled because those programs are already represented in the larger verified ST9 TNG set.

The word **verified** here means the Colab pipeline received playable bytes from the Archive media endpoint using lightweight ranged requests. It does not by itself establish copyright/public-domain status.

## Colab -> TV workflow

1. Use an Archive hunter/search cell in `UNIVERSAL_HARVEST` to find promising Internet Archive identifiers.
2. Query the Archive metadata endpoint instead of guessing filenames.
3. Run lightweight ranged-GET playback tests on candidate media.
4. Keep the `PASS` records and preserve the source identifier, filename, format, size, rights/license fields, and direct URL.
5. Canonicalize alternate encodings so one logical program becomes one preferred TV entry when appropriate.
6. Export a dedicated JavaScript catalog.
7. Load that generated catalog before `radio_channels.js`.
8. Register it as a channel or weave it into an existing channel.
9. Hard-refresh the site and check F12 console diagnostics.

## Audio display

Audio programs do not leave a blank CRT. The player shows a star-field / centered radio-scope animation behind the native audio controls while the OSD identifies the channel and program. The effect follows playback time/state without routing cross-origin Archive audio through a WebAudio `MediaElementSource`, avoiding a common CORS failure mode.

## Expansion targets

The working Colab notebook already includes Archive searching for material such as vintage science and educational television, 1960s-1970s commercials, World War II newsreels/radio, holiday programming, antique audio, Shock Theater / drive-in material, and other vintage collections. The long-term design is intentionally catalog-driven so thousands of additional verified entries can be added without rewriting the player core.

## Rights / source discipline

Internet Archive availability does not automatically mean an item is public-domain or cleared for redistribution. Preserve Archive identifiers, rights/license metadata, and scanner results so the source and status of each catalog entry remain traceable.
