# Programming additions — September 26, 2026

This file records the programming work that belongs to the rebuilt **27-channel** TV model.

## Current source-of-truth

- `index.html` is the authoritative TV catalog.
- `CH 1` means the `ch1` source array, `CH 2` means `ch2`, and so on through `CH 27`.
- The physical channel dial maps directly to those 27 source arrays.
- `tools/programming-additions.json` contains only supplemental entries that still need to be appended during publication.
- The 15 supplied movie URLs are already present in the base `ch2` catalog. They remain recorded in the manifest's provenance list, but are **not** appended a second time.

## Supplemental programming

- **CH 4 — SCI-FI TV SERIES:** 104 Twilight Zone MP4 entries, including the original pilot and the supplied colorized Season 2/3 material. Season 2 Episode 27 has a separately listed `v2` file and remains explicitly labeled as an alternate.
- **CH 3 — SCI-FI & FANTASY MOVIES:** `The Man Who Saw Tomorrow (1981)` and `The Longest Day (1962)`.
- **CH 12 — MONSTER MOVIES:** `Earth vs. the Flying Saucers (Color)`.
- **CH 24 — DOCUMENTARIES:** the supplied Mutual of Omaha's Wild Kingdom programming remains classified as documentary/nature television.

## Duplicate-control rule

Before a supplemental entry is published, its Archive.org file identity must not already exist in the source catalog. This prevents the same movie or file from being inserted twice merely because it was supplied again in a later batch or appears under a different Archive.org host alias.

## Publication

`tools/prepare_site.py` builds `_site/index.html` from the source catalog and then appends the validated supplement. The TV page is self-contained and does not mount the FAN or Navigator into the TV interface.

The preserved FAN and Navigator source files are legacy material only; their exact pre-rebuild state is retained on the backup branch documented in `REBUILD_BACKUP_2026-09-26.md`.

## Playback limits

The catalog records links; it does not download or rehost the media. Playback, seeking, codec support, and Archive.org availability remain dependent on the source file and the viewer's browser.
