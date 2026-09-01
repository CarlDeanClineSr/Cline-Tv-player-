# Cline-Tv-player-

A custom CRT-style web player built to play curated Internet Archive video and audio streams through the Imperial Physics Observatory site.

## V170 — Boomer / 13+ cleanup

V170 deliberately simplifies the live schedule. The previous 4,819-entry V169 experiment proved that the player could scale, but it also showed that a huge search-derived schedule becomes confusing when child programming, radio drama, cartoons, unrelated search hits, and adult material all share the same tuner.

The live player is now organized around **nine coherent channels, A-I**. The old Mega Harvester records remain in GitHub/Drive as a verified source pool, but `programming_registry.js` decides what is actually scheduled.

### Live channel plan

- `A` — **MOVIES / ACTION** — live-action / older feature films, franchise runs, disaster/action material, classic live-action Disney such as Herbie/Love Bug, plus occasional vintage automobile commercials.
- `B` — **STAR TREK** — the verified Star Trek block remains uninterrupted: TOS, Star Trek Continues, TNG, DS9 and Voyager. No commercial injection on B.
- `C` — **CLASSIC TV** — selected live-action classic television; cartoon/kid series and bonus clutter such as deleted scenes/promos are filtered out.
- `D` — **HORROR / DRIVE-IN** — adult/teen horror, exploitation, drive-in films and Kolchak-type material.
- `E` — **SCIENCE / UFO** — science, space, documentary and educational material intended for a general/adult audience; child education series are filtered out.
- `F` — **HITCHCOCK / MYSTERY** — Alfred Hitchcock Presents plus selected live-action mystery programming.
- `G` — **60s-70s SCI-FI TV** — Project UFO, Buck Rogers, Man From Atlantis and selected classic live-action science-fiction television.
- `H` — **MUSIC / TALK** — verified vintage music/audio and television talk. The first V170 replacement pool contains 88 verified 1920s jazz tracks, 22 Dick Cavett programs and two verified vintage music-film items. The schedule runs four music tracks, then one talk show, instead of behaving like a random radio-dramas dump.
- `I` — **WAR / NEWS / HISTORY** — video news/history/PSA material only. Radio drama and Winston Churchill audio are excluded from the live schedule.

## Removed from the live player

V170 does **not** schedule X Minus One, OTR detective/mystery dramas, radio western dramas, international shortwave-audio dumps, Schoolhouse Rock, the 1967-1970 Spider-Man cartoon series, Pokémon, Yu-Gi-Oh!, or the large child/cartoon movie groups from the original A-J catalog.

The source files are generally retained in the repository or Drive as research/archive material rather than being destroyed. They simply are not loaded into the live television schedule.

## Commercial breaks

Verified vintage automobile commercials remain part of the experience. They are distributed as interstitials through selected entertainment channels rather than receiving their own tuner position.

Channel B is excluded so Star Trek remains continuous. Channel I is excluded so serious history/news programming is not interrupted by car advertising.

## V170 tuner / OSD changes

- The lower channel dial now represents only nine channels.
- The lower dial displays the actual channel letters `A-I` instead of a crowded run of numbers.
- The lower label ring is slightly larger so the channel marks align more naturally around the knob.
- The green on-screen title display is approximately 25% smaller.
- The OSD now shows the current position and channel total, e.g. `CH C • CLASSIC TV • 14/126`, so clicking through a long series is less disorienting.
- The playback engine, Archive retry behavior, static transition and audio-scope mechanism remain fundamentally unchanged.

## Data / verification

The Mega Harvester V2 produced 5,306 canonical ranged-GET-tested records from 759 Archive items. V170 uses that database as a source pool rather than treating the original search-profile labels as trustworthy categories.

`verified` means the Colab pipeline successfully received media bytes from the Archive endpoint using a lightweight ranged GET and preserved the exact Archive identifier/filename. It does **not** by itself establish copyright/public-domain status, historical completeness, or browser codec compatibility.

## Current architecture

- `index.html` — V170 CRT/player shell, smaller OSD, lettered channel dial, diagnostics and audio scope.
- `catalog.js` — original core catalog; V170 filters it at runtime rather than destructively rewriting the source list.
- `star_trek_tos_catalog.js` — verified 80-file Star Trek TOS catalog.
- `harvest_tng.js`, `harvest_ds9.js`, `harvest_voyager.js`, `harvest_star_trek_continues.js` — verified Star Trek expansion catalogs.
- `harvest_hitchcock_s1.js`, `harvest_hitchcock_s2.js`, `harvest_hitchcock_s3.js` — verified Hitchcock catalogs.
- `harvest_buck_rogers.js`, `harvest_man_from_atlantis.js` — verified classic science-fiction catalogs.
- `refined_catalog_utils.js` + `refined_data_01.js` through `refined_data_24.js` — retained verified Mega source pool. Drama/cartoon arrays may exist here but are not automatically channels in V170.
- `boomer_music_talk.js` — verified 1920s jazz, Dick Cavett and vintage music-film additions.
- `radio_channels.js` — data loader.
- `programming_registry.js` — V170 adult/boomer filtering, ordering, channel assembly and commercial weaving.

The browser console remains the authoritative live inventory: V170 diagnostics print every final channel count plus total video/audio entries after all filtering and duplicate removal have run.
