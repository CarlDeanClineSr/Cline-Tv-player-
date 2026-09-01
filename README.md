# Cline-Tv-player-

A custom CRT-style web player built to play curated Internet Archive video and audio streams through the Imperial Physics Observatory site.

## Current V167 structure

- `index.html` — CRT television interface, tuner/player logic, retry handling, OSD, system diagnostics, and the V167 radio-scope visualization.
- `catalog.js` — core A-J television/movie catalog, Archive base URLs, channel programming, franchise grouping, and channel weaving.
- `x_minus_one_catalog.js` — 122 verified original MP3 X Minus One broadcasts produced by the Colab scanner/canonicalizer.
- `radio_channels.js` — registers dedicated radio channels without bloating or rewriting the core catalog. Channel K is currently `X MINUS ONE RADIO`.
- `archive-browser.html` — browser utility for discovering playable files inside an Internet Archive item.

## Current channel expansion

The channel selector is now dynamic. It draws the number of channel positions from `categories.length`, so adding K, L, M, etc. no longer requires changing a hard-coded `10` in the tuner display.

Current dedicated expansion:

- `K` — X Minus One Radio (122 verified MP3 broadcasts)

Reserved next radio channels:

- `L` — War / News Radio
- `M` — Holiday Radio
- `N` — International / Non-English Radio

## Colab -> TV workflow

1. Use the Archive hunter/search cells in `UNIVERSAL_HARVEST` to find promising Internet Archive identifiers.
2. Run the Imperial Physics Archive Scanner on the identifiers.
3. Keep the ranged-GET `PASS` results rather than trusting filenames alone.
4. Run the canonicalizer so Archive derivatives (for example MP3 + OGG copies of the same recording) collapse to one preferred TV entry.
5. Export a dedicated JavaScript catalog such as `x_minus_one_catalog.js`.
6. Add that generated catalog file to this repository.
7. Register it in `radio_channels.js` as a new channel.
8. Hard-refresh the site and check the F12 console diagnostics before considering the batch complete.

## V167 audio display

Audio programs no longer leave a blank CRT. When an audio file is selected, `index.html` shows a star-field / centered radio-scope animation behind the native audio controls while the OSD identifies the channel and program.

The scope deliberately does **not** route cross-origin Archive audio through a WebAudio `MediaElementSource`. That keeps normal playback isolated from browser CORS restrictions. The scope follows playback time/state for a broadcast-style visual effect; it is not presented as a laboratory measurement of the audio waveform.

## Archive Browser

Open `archive-browser.html` in a browser, then paste either:

- a full Internet Archive item URL such as `https://archive.org/details/ITEM_IDENTIFIER`, or
- just the item identifier.

The utility reads the Archive metadata API, lists browser-playable `.mp4`, `.webm`, `.mp3`, `.m4a`, `.ogg`, `.wav`, `.flac`, and related files, lets you test them in the browser, and can copy either direct media URLs or ready-to-paste catalog entries in this form:

```js
{n: "Program Title", u: "https://archive.org/download/ITEM/file.mp3"},
```

## Expansion targets already represented in the Colab notebook

The existing harvest notebook already contains dedicated Archive search cells for material including vintage science/early television, 1965-1973 car commercials, World War II newsreels, antique audio, and Shock Theater / drive-in material. Feed the promising identifiers from those searches into the verified scanner before adding them to the live catalog.

## Rights / source discipline

Internet Archive availability does not automatically mean an item is public-domain or cleared for redistribution. Preserve the Archive item identifier, rights/license fields, and scanner results so the source of every catalog entry remains traceable.
