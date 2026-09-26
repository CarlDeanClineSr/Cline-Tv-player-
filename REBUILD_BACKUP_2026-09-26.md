# TV REBUILD BACKUP — 2026-09-26

This repository is being rebuilt from the lessons learned in V188.

## Exact rollback point

- Backup branch: `backup/pre-tv-rebuild-2026-09-26`
- Backup commit: `acd2dbea10e1393cba335f8cff156c8a83e9fd7c`
- The backup branch preserves the complete repository as it existed immediately before the new TV rebuild began.

## What is being kept

The physical TV layout, screen proportions, controls, program dial, channel dial, volume control, playback controls, fullscreen behavior, and Archive.org playback mechanism are the foundation of the rebuild.

## What is being removed from the TV page

- Stellar Navigator link
- FAN link/integration
- FAN/Navigator publication hooks

The standalone legacy feature files remain preserved in the repository for now, and the complete pre-rebuild repository is preserved on the backup branch.

## New source-of-truth rule

`index.html` is the authoritative TV catalog.

- `CH 1` means channel 1.
- `CH 2` means channel 2.
- ...
- `CH 27` means channel 27.
- The physical channel dial follows those same numbers.
- No seven-channel grouping layer is permitted.
- No hidden translation layer may move a program from one CH array to another.
- Programming additions must be assigned to the actual source `chN` they belong to.
- Channel names must describe the actual programming carried by that channel.

## Rebuild order

1. Stabilize `index.html`.
2. Establish the channel plan and channel names.
3. Audit existing programs against those channel assignments.
4. Add only verified, appropriate programs.
5. Test the physical channel dial against the actual CH arrays.
6. Test media playback.
7. Only then expand the catalog.

Do not rebuild the old abstraction layer.
