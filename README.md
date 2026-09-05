# Cline Classic TV

A self-contained CRT player and stellar navigator, published by GitHub Pages. No paid backend, account system, or running home computer is required.

## Player: `index.html`

The complete TV remains in one file: catalog, CRT styling, guide, controls, and playback logic. Media continues to load from the exact URLs in the catalog. There are no catalog dependencies or external JavaScript libraries.

- **GUIDE:** search by program title or channel, filter by channel or favorite channels, and select a program without stepping through every entry. Opening the guide does not pause playback.
- **Remembered positions:** returning to a channel or reopening the player resumes its last program and time. Volume, mute, and favorite channels are remembered in this browser. Clearing site storage clears these preferences; playback still works when storage is blocked.
- **Share:** copies a link to the current program and playback time. Incoming shared selections take priority over saved positions. If automatic clipboard access is unavailable, select and copy the displayed link.
- **Start over:** restart the selected program. The PROGRAM knob changes programs; the CHANNEL knob changes channels. Click for next, right-click for previous, or use arrow keys while a knob is focused. Small round buttons provide Guide, Start over, Favorite, Share, and Full screen.
- **Recovery:** loading and buffering notices appear briefly on the screen; the green overlay fades after 3.5 seconds. A separate tap-to-play control remains available when autoplay needs a gesture. Retries are bounded and cancelled when changing selections. A stalled active stream gets a 30-second recovery window. After four retries, playback moves on; an entirely failed catalog sweep stops for manual retry.
- **Up next:** appears in the temporary green on-screen message, including the transition to the next channel at the end of a channel.

Position is saved about every five seconds during playback, and when pausing, switching, hiding, or leaving the page. Resume requires a seekable source. Browsers may require a tap before sound starts.

## Editing programming

Search `index.html` for `V170 MASTER CATALOG DATA COMPRESSION` (the preserved catalog boundary). `ch1` through `ch13` contain title/URL entries. The dated recovery block appends verified additions to the original channels and defines the new channels. `mk(base, [...])` uses alternating titles and URL suffixes; `mks([...])` uses alternating titles and full URLs. Keep each title paired with its URL. `categories` determines channel order and labels.

The September 5 programming recovery preserves all **925 entries from the preceding version**, including the repeated 80-episode block in channel 1. Those entries retain their channels and order; new material is appended. The guide is built from these same arrays, so adding a program updates both playback and search. Program IDs derive from the URL plus occurrence within its channel; renaming or moving a unique program within that channel preserves its share link. Moving it to another channel, changing its URL, or rearranging identical duplicate occurrences can affect old links.

## September 5, 2026 programming recovery

The screen, CRT styling, controls, fullscreen layout, and stellar navigator are unchanged. **374 additions bring the player to 1,299 entries across 13 channels.**

| Channel | Added entries |
| --- | ---: |
| 3 · Movie Vault | 28 |
| 5 · Space 1999 / UFO | 1 |
| 7 · Dragnet / Hitchcock | 7 |
| 9 · Science Docs | 42 |
| 10 · Cartoons / Family / Schoolhouse | 72 |
| 11 · Old-Time Radio / X Minus One | 133 |
| 12 · Monster Drive-In | 21 |
| 13 · Racing / Retro Reels | 70 |

Recovered from the owner's V175-ish repository backup and saved Drive player/catalog files. New URLs were matched to exact public filenames in Archive.org metadata on September 5, 2026. Duplicate URLs across Archive.org hostnames, alternate OGG radio copies, and repeated titles were skipped. Existing entries were not deduplicated or rewritten. Titles that named an entire collection were corrected to identify the linked episode or film.

The radio channel includes the 122 MP3 entries from the saved X Minus One catalog. Radio uses the existing audio player and animated display; positions, volume, guide, favorites, and sharing use the same controls as TV. Sample X Minus One and Mercury Theatre streams returned HTTP 206 audio data. Metadata checks do not guarantee every codec or future availability; Archive.org serves the media independently.

## Stellar navigator: `navigator.html`

The navigator reads the actual compact fields in `nodes.json` (`i`, `t`, `d`, `l`, `r`, `e`, `h`, `u`) and also accepts their previous long names. Values are displayed as supplied, and the sky-viewer link comes directly from the record. The page does not establish scientific validation or freshness of those values.

- Look up a node, follow its stored sky-viewer link, or share `navigator.html#node=1001`.
- The last successful target is remembered in this browser.
- The navigator fetches a small manifest and only the requested 1,000-record section; it keeps at most four sections in memory.
- Changing targets cancels older lookups, and errors offer a retry without replacing record data.

`nodes.json` stays the authoritative registry. The deploy workflow runs `python3 tools/prepare_site.py` to prepare `_site/` and generate its `nodes/manifest.json` and numbered JSON sections. Never hand-edit those generated sections. No registry generation runs on visitors' devices. The original `nodes.json` and existing public backups remain in the published output for compatibility.

## Publishing and checks

A push to `main` uses the existing GitHub Pages workflow. It prepares the site, runs `node --test tests/site.test.cjs`, then publishes `_site/`. A failed check prevents publication. No new hosting service or domain configuration is involved.

Local checks, from the repository directory:

```sh
python3 tools/prepare_site.py
node --test tests/site.test.cjs
```

For local web use, serve `_site/` with an ordinary static HTTP server. Opening the TV file directly still supports the self-contained player, but navigator fetches need HTTP/HTTPS and the prepared sections.

The tests cover guide selection, channel resume, shared selections, stale retries, autoplay messages, end-of-channel transitions, unavailable storage, registry field mapping, and preservation of every registry record. These are simulated browser-event tests; they do not certify third-party media availability, codecs, or actual device rendering.

Existing backup files, `2/index.html`, and other historical files are retained. Git history also retains the previous player and navigator.
