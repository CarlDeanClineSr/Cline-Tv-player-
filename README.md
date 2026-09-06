# Cline Classic TV

A self-contained CRT player and stellar navigator, published by GitHub Pages. No paid backend, account system, or running home computer is required.

## Player: `index.html`

The complete TV remains in one file: catalog, CRT styling, guide, controls, and playback logic. Media continues to load from the exact URLs in the catalog. There are no catalog dependencies or external JavaScript libraries.

- **GUIDE:** search by program title or channel, filter by channel or favorite channels, and select a program without stepping through every entry. Opening the guide does not pause playback. Search covers the entire catalog; results appear in batches of 100 with a Show more button to keep large catalogs responsive.
- **Remembered positions:** returning to a channel or reopening the player resumes its last program and time. Volume, mute, and favorite channels are remembered in this browser. Clearing site storage clears these preferences; playback still works when storage is blocked.
- **Share:** copies a link to the current program and playback time. Incoming shared selections take priority over saved positions. If automatic clipboard access is unavailable, select and copy the displayed link.
- **Start over:** restart the selected program. The PROGRAM knob changes programs; the CHANNEL knob changes channels. Click for next, right-click for previous, or use arrow keys while a knob is focused. On touchscreens, swipe a knob up/right for next or down/left for previous. On larger screens, click a numbered channel marker to tune directly. Small round buttons provide Guide, Start over, Favorite, Share, and Full screen.
- **Recovery:** loading and buffering notices appear briefly on the screen; the green overlay fades after 3.5 seconds. A separate tap-to-play control remains available when autoplay needs a gesture. Retries are bounded and cancelled when changing selections. A stalled active stream gets a 30-second recovery window. After four retries, playback moves on; an entirely failed catalog sweep stops for manual retry.
- **Up next:** appears in the temporary green on-screen message, including the transition to the next channel at the end of a channel.

Position is saved about every five seconds during playback, and when pausing, switching, hiding, or leaving the page. Resume requires a seekable source. Browsers may require a tap before sound starts.

## Editing programming

Search `index.html` for `V170 MASTER CATALOG DATA COMPRESSION` (the preserved catalog boundary). `ch1` through `ch26` contain title/URL entries. The dated recovery block appends verified additions to the original channels and defines the new channels. `mk(base, [...])` uses alternating titles and URL suffixes; `mks([...])` uses alternating titles and full URLs. Keep each title paired with its URL. `categories` determines channel order and labels.

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

## Mega harvest expansion — September 6, 2026

**26 channels, 5,521 entries.** This update adds 4,222 entries while preserving all 1,299 previous entries in their existing channels and order.

The uploaded `mega_harvest_catalog.csv` supplied 3,121 additions. Its remaining rows comprised 481 already-present/repeated URLs, 257 mirrored broadcasts with the same series and broadcast date, and 1,447 off-theme search matches. The separate 40-row failures file was not imported. Profile labels were checked against actual collection names: for example, Howard Stern and video-game recordings were not treated as NASA, and a modern web series was not treated as holiday TV.

Another 1,101 entries came from exact filenames in retrieved Archive.org metadata for NASA, NOVA/PBS, and Wide World of Sports collections. One sample per included collection returned media data in a small ranged request; this does not certify every file's playback or codec. Duplicate science titles, duplicate films, identical byte hashes, and 104 fragments of a single documentary were excluded. The uploaded PASS statuses are the owner's saved scan results, not a fresh test of every stream. Source URLs remain unchanged for imported CSV records.

| New channel | Programming | Entries |
| --- | --- | ---: |
| 14 | Johnny Dollar / Philip Marlowe | 540 |
| 15 | Dragnet Radio / 21st Precinct | 413 |
| 16 | Suspense / Whistler / Diamond | 526 |
| 17 | Gunsmoke / Texas Rangers | 273 |
| 18 | WWII Broadcasts / Shortwave | 197 |
| 19 | Classic TV Variety | 119 |
| 20 | Cartoon Club / Superheroes | 369 |
| 21 | Reading Rainbow / Schoolhouse | 155 |
| 22 | Vintage Classroom / Industry | 91 |
| 23 | NASA / Mercury / Gemini / Apollo | 34 |
| 24 | NOVA / Cosmos / Connections | 1055 |
| 25 | Classic Jazz / Radio Books | 123 |
| 26 | Wide World of Sports | 17 |

Existing Sci-Fi Series, Dragnet/Hitchcock, Monster Drive-In, and Racing/Retro Reels channels also receive additions. `tools/mega-import-audit.json` records a disposition for each uploaded row and the extra-collection results; it is excluded from the published site.

The desktop channel knob is larger, has evenly spaced numbered buttons and a single pointer, and shows its current channel in the center. Program/Volume/Channel labels share the same center line. The big-screen tube remains 942 × 706.5 CSS pixels at a 1920 × 1080 viewport, matching the preceding layout. The 4:3 tube and CRT effects remain. Compact viewports show the current channel instead of crowding 26 numbers; all channels remain accessible through the guide. Controls stay to the right of the screen, including portrait phones. Landscape is the roomier phone view.

Browser checks covered 390 × 844, 844 × 390, 768 × 1024, 1024 × 768, and 1920 × 1080 CSS-pixel viewports. The landscape-height correction was rechecked at approximately 373.3 × 280 pixels for the tube. Browser interactions checked direct numbered tuning, guide filtering, favorites, sharing, Mercury playback, and acquisition of node 1001 with its stored sky-viewer link. These checks simulate viewport sizes in desktop Chrome; they do not emulate an actual iPhone, Android touch stack, or casting receiver. Automated checks cover swipe direction and duplicate-click suppression. The cloud preview refused the fullscreen request, so native fullscreen could not be confirmed there; the existing failure message appeared. Actual-device fullscreen and casting remain unverified.

### Repeatable responsive preview

No package installation is needed. Run `python3 tools/prepare_site.py`, then `npm run dev`. The dependency-free development server serves the project on port 4173; its `/_preview` page provides phone, tablet, and TV viewport presets. The preview displays the prepared `_site/` files, so rerun preparation after editing. This preview tooling is optional and does not run for GitHub Pages visitors.

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
