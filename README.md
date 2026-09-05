# Cline Classic TV — V171

A self-contained CRT player and stellar navigator, published by GitHub Pages. No paid backend, account system, or running home computer is required.

## Player: `index.html`

The complete TV remains in one file: catalog, CRT styling, guide, controls, and playback logic. Media continues to load from the exact URLs in the catalog. There are no catalog dependencies or external JavaScript libraries.

- **GUIDE:** search by program title or channel, filter by channel or favorite channels, and select a program without stepping through every entry. Opening the guide does not pause playback.
- **Remembered positions:** returning to a channel or reopening the player resumes its last program and time. Volume, mute, and favorite channels are remembered in this browser. Clearing site storage clears these preferences; playback still works when storage is blocked.
- **Share:** copies a link to the current program and playback time. Incoming shared selections take priority over saved positions. If automatic clipboard access is unavailable, select and copy the displayed link.
- **Start over:** restart the selected program. Previous/Next and CH −/+ work on touchscreens and keyboards; the original tuners also remain.
- **Recovery:** loading, buffering, and tap-to-play messages stay visible. Retries are bounded and cancelled when changing selections. A stalled active stream gets a 30-second recovery window. After four retries, playback moves on; an entirely failed catalog sweep stops for manual retry.
- **Up next:** shows the next program, including the transition to the next channel at the end of a channel.

Position is saved about every five seconds during playback, and when pausing, switching, hiding, or leaving the page. Resume requires a seekable source. Browsers may require a tap before sound starts.

## Editing programming

Search `index.html` for `V170 MASTER CATALOG DATA COMPRESSION` (the preserved catalog boundary). `ch1` through `ch10` contain the existing title/URL entries. `mk(base, [...])` uses alternating titles and URL suffixes; `mks([...])` uses alternating titles and full URLs. Keep each title paired with its URL. `categories` determines channel order and labels.

V171 preserves all **832 entries across 10 channels**, including the repeated 80-episode block in channel 1. No programs were removed or reordered. The guide is built from these same arrays, so adding a program updates both playback and search. Program IDs derive from the URL plus occurrence within its channel; renaming or moving a unique program within that channel preserves its share link. Moving it to another channel, changing its URL, or rearranging identical duplicate occurrences can affect old links.

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
