# Cline-Tv-player-

A self-contained CRT-style web player for curated Internet Archive video streams through the Imperial Physics Observatory site.

## The file that runs the player

**The root `index.html` is the complete player.** It contains the screen, green OSD, controls, static/retry behavior, every channel, and every program URL. It has no JavaScript catalog dependencies.

To edit programming, open `index.html` and search for:

`CLINE CLASSIC TV — EDITABLE SINGLE-FILE PROGRAM CATALOG`

Every channel is a normal array written the long way:

`const A = [ ... ];`

Each program is one visible line:

`{ n: "Program title", u: "direct media URL" },`

Add, remove, rename, reorder, or move those lines directly. The `categories` list immediately after the channel arrays determines the lower tuner order and channel labels.

## Backup

`2/index.html` is retained as the older self-contained backup supplied by Carl.

## Current flattened schedule

The one-time rebuild flattened **1,170 live entries across 8 channels** into the root `index.html`. The browser console remains the final operational check.

## Repository structure

The player no longer depends on generated catalog, harvester, loader, registry, patch, or cleanup files. Those temporary architecture files were removed after their live schedule was flattened.
