# Cline-Tv-player-

A custom CRT-style web player for curated Internet Archive video streams through the Imperial Physics Observatory site.

## V171 — Man Cave rebuild

V171 replaces the over-broad V169/V170 channel experiment with a tighter video-first man-cave lineup. The large Mega Harvester database remains available as a verified source pool, but the live tuner is no longer a dump of every search result.

### Live channel plan

- `A` — **MOVIE VAULT** — restores the large live-action movie bank. Obvious cartoons, preschool titles and Pokémon-style child programming are filtered out rather than deleting the movie catalog wholesale.
- `B` — **STAR TREK UNIVERSE** — all currently verified Star Trek catalogs play together: 80 TOS files, 16 Star Trek Continues/bonus files, 176 TNG files, 173 DS9 files and 168 Voyager files. This is the full 613-program verified Trek block currently in the repo.
- `C` — **STAR WARS / SCI-FI TV** — live-action Star Wars/sci-fi movies plus Project UFO, Buck Rogers, Man From Atlantis, Space: 1999, UFO, The Prisoner, Captain Scarlet and selected Amazing Stories.
- `D` — **MONSTERS / KOLCHAK** — the 22 verified Kolchak: The Night Stalker files plus selected monster, horror and drive-in material.
- `E` — **DRAGNET / HITCHCOCK / WESTERNS** — deliberately narrow adult classic-TV section: verified Dragnet television, Alfred Hitchcock Presents and The Lone Ranger material. Captain Nice, Miss Marple, Sherlock Holmes, Cavalcade filler and similar loose "classic TV" matches are not scheduled here.
- `F` — **MUSCLE CARS / RACING** — tightly filtered 1964-1970-era automobile/racing material. Verified current examples include 1967 Chevy II Nova, 1967 Dodge Dart, circa-1966 Ford Falcon and 1966 Pontiac GTO clips. Child/toy-car material is filtered out.
- `G` — **SCIENCE / SPACE / UFO** — science, astronomy, NASA/space, Earth/ocean/geology, Cosmos/Connections-style documentary material and the existing science/UFO documentaries.
- `H` — **WAR / NEWS / HISTORY** — video history/news material only. Radio drama and Churchill audio are not scheduled.

## Removed from the live tuner

The live schedule does not include X Minus One, OTR detective/western drama, international shortwave-audio dumps, the old music-radio replacement channel, Schoolhouse Rock, Pokémon, Yu-Gi-Oh!, the 1967-1970 Spider-Man cartoon or the large cartoon/preschool movie groups.

Section E also no longer uses the broad catch-all classic-TV filter that admitted Captain Nice, Miss Marple, Sherlock Holmes and Cavalcade material. Those source records can remain in the verified archive pool without being put on the live tuner.

The source catalogs remain useful research material in GitHub/Drive; the registry simply does not schedule them.

## What is deliberately pending

The 5,306-row Mega pool did not contain good verified matches for several requested man-cave categories. Rather than fake them from unrelated search hits, they are reserved for a targeted Archive harvest:

- **All in the Family**
- classic **football / NFL** games, highlights and documentaries
- **fishing** and outdoors television
- **hunting / sportsman** television
- more **1964-1970 muscle-car**, dealer-film, drag-racing, Trans-Am/NASCAR and period automotive material

Once verified, those can become additional coherent tuner channels instead of being mixed randomly into unrelated programming.

## Player behavior

The CRT/static/retry/player mechanics remain essentially unchanged. The smaller green OSD and lettered lower tuner remain in place, and the OSD shows the current position within each channel so long series are easier to navigate.

## Data / verification

The Mega Harvester V2 produced 5,306 canonical ranged-GET-tested records from 759 Internet Archive items. Search-profile labels are treated only as discovery clues; live scheduling uses stricter source/title/media filtering.

`verified` means the pipeline successfully received media bytes from the exact Archive media endpoint using a lightweight ranged GET. It does not by itself establish copyright/public-domain status, historical completeness or browser codec compatibility.

## Current architecture

- `index.html` — CRT/player shell and tuner interface.
- `catalog.js` — original large movie/legacy catalog; V171 filters and reorganizes it at runtime instead of destructively rewriting it.
- `star_trek_tos_catalog.js` — verified 80-file TOS catalog.
- `harvest_tng.js`, `harvest_ds9.js`, `harvest_voyager.js`, `harvest_star_trek_continues.js` — verified Star Trek expansion catalogs.
- `harvest_hitchcock_s1.js`, `harvest_hitchcock_s2.js`, `harvest_hitchcock_s3.js` — verified Hitchcock catalogs.
- `harvest_buck_rogers.js`, `harvest_man_from_atlantis.js` — verified classic science-fiction catalogs.
- `refined_catalog_utils.js` + `refined_data_01.js` through `refined_data_24.js` — retained Mega Harvester source pool.
- `mancave_extras.js` — exact verified Kolchak and muscle-car extras selected from the Mega PASS database.
- `programming_registry.js` — V171 man-cave channel assembly.
- `v171_cleanup.js` — final child/cartoon, Section E and car-year cleanup plus duplicate guard.
- `radio_channels.js` — generated-data loader; no live radio channel registration.

The browser console remains the authoritative live inventory after all runtime filtering has completed.