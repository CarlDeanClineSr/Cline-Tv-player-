# Cline-Tv-player-

A custom CRT-style web player built to play curated Internet Archive video and audio streams through the Imperial Physics Observatory site.

## Current V168 structure

- `index.html` — CRT television interface, dynamic tuner, retry handling, OSD, diagnostics, and radio-scope visualization.
- `catalog.js` — core A-J television/movie catalog and programming engine.
- `x_minus_one_catalog.js` — 122 verified original MP3 X Minus One broadcasts.
- `star_trek_tos_catalog.js` — 80 verified Star Trek Original Series files: Season 1 = 30, Season 2 = 26, Season 3 = 24.
- `harvest_tng.js` — 73 verified harvested TNG programs currently available from the scanned Archive sources.
- `harvest_ds9.js` — 70 verified harvested DS9 programs currently available from the scanned Archive sources.
- `harvest_voyager.js` — 66 verified harvested Voyager programs currently available from the scanned Archive sources.
- `harvest_star_trek_continues.js` — 11 verified Star Trek Continues programs.
- `harvest_hitchcock_s1.js`, `harvest_hitchcock_s2.js`, `harvest_hitchcock_s3.js` — 116 verified Alfred Hitchcock Presents programs from the harvested items.
- `harvest_buck_rogers.js` — 33 verified Buck Rogers program files.
- `harvest_man_from_atlantis.js` — 13 verified Man from Atlantis program files.
- `radio_channels.js` — assembles the generated catalogs into dedicated channels and applies small runtime catalog repairs.
- `archive-browser.html` — browser utility for inspecting playable files inside an Internet Archive item.

## Current V168 inventory

The catalog currently assembles to **1,096 playable entries** across **18 channels**:

- **974 video entries**
- **122 audio entries**

Channel layout:

- `A` — 67 mixed programs
- `B` — 156 programs; the **80 verified Star Trek TOS files play first, consecutively**, followed by the previous B programming
- `C` — 81 mixed programs
- `D` — 63 mixed programs
- `E` — 43 mixed programs
- `F` — 50 mixed programs
- `G` — 22 programs
- `H` — 30 programs
- `I` — 28 programs
- `J` — 52 programs
- `K` — X Minus One Radio, 122 verified MP3 broadcasts
- `L` — Star Trek TNG, 73 verified harvested programs
- `M` — Star Trek DS9, 70 verified harvested programs
- `N` — Star Trek Voyager, 66 verified harvested programs
- `O` — Star Trek Continues, 11 verified programs
- `P` — Alfred Hitchcock Presents, 116 verified harvested programs
- `Q` — Buck Rogers, 33 verified program files
- `R` — Man from Atlantis, 13 verified program files

The word **verified** here means the Colab pipeline received playable bytes from the Archive media endpoint using lightweight ranged requests. It does not mean every series is complete; TNG, DS9, and Voyager currently contain the portions exposed by the Archive items harvested so far.

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
