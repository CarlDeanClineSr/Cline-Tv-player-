# Cline-Tv-player-

A custom CRT-style web player built to play curated Internet Archive video and audio streams through the Imperial Physics Observatory site.

## Current structure

- `index.html` — CRT television interface, tuner/player logic, retry handling, OSD, and system diagnostics.
- `catalog.js` — media catalog, Archive base URLs, channel programming, franchise grouping, and channel weaving.
- `archive-browser.html` — utility for discovering playable files inside an Internet Archive item without manually digging through file indexes.

## Archive Browser

Open `archive-browser.html` in a browser, then paste either:

- a full Internet Archive item URL such as `https://archive.org/details/ITEM_IDENTIFIER`, or
- just the item identifier.

The utility reads the Archive metadata API, lists browser-playable `.mp4`, `.webm`, `.mp3`, `.m4a`, `.ogg`, `.wav`, `.flac`, and related files, lets you test them in the browser, and can copy either direct media URLs or ready-to-paste catalog entries in this form:

```js
{n: "Program Title", u: "https://archive.org/download/ITEM/file.mp3"},
```

This is intended to make expansion into old-time radio, science fiction drama, vintage television, documentaries, commercials, and other curated Archive material much faster while still allowing every chosen file to be tested before it is added to the live catalog.

## Important

Internet Archive availability does not automatically mean an item is public-domain or cleared for redistribution. Check the Archive item page's rights/license information before adding media to a public-facing catalog.
