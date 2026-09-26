# CLINE CLASSIC TV — CHANNEL PLAN

This is the working editorial plan for the rebuild. The number on the physical channel dial is the same number used by the corresponding `chN` array in `index.html`.

| CH | Working name | What belongs here |
|---:|---|---|
| 1 | STAR TREK & CLOSE ENCOUNTERS | Star Trek and Close Encounters material |
| 2 | FEATURE MOVIES | The main movie library. Feature films only; this is the channel that will grow toward the large movie catalog. No episodes, radio, documentaries, clips, shorts, or random Archive uploads. |
| 3 | SCI-FI & FANTASY MOVIES | Dedicated genre-film lane. Keep actual feature films here when they are specifically science-fiction/fantasy and are not part of the monster channel. |
| 4 | SCI-FI TV SERIES | Complete science-fiction television series and episodes |
| 5 | SPACE TV: 1999 · UFO · CAPTAIN SCARLET | Space 1999, UFO, Captain Scarlet and closely related series |
| 6 | HORROR & THE NIGHT STALKER | Kolchak and appropriate classic horror programming |
| 7 | DRAGNET & HITCHCOCK | Dragnet and Alfred Hitchcock Presents |
| 8 | OUTER LIMITS & TV COMMERCIALS | The Outer Limits plus historically useful period television commercials/interstitials |
| 9 | SCIENCE · COSMOS · CONNECTIONS | Science and science-history documentary programming |
| 10 | EDUCATION · HISTORY · SCHOOLHOUSE ROCK | Schoolhouse Rock, educational material, and appropriate historical/war documentaries |
| 11 | RADIO: X MINUS ONE | Old-time science-fiction radio |
| 12 | MONSTER MOVIES | Godzilla and other monster-film programming. Godzilla belongs here rather than being duplicated elsewhere. |
| 13 | SPORTS | General sports programming |
| 14 | RADIO: JOHNNY DOLLAR | Yours Truly, Johnny Dollar |
| 15 | RADIO: 21ST PRECINCT | 21st Precinct |
| 16 | RADIO: RICHARD DIAMOND | Richard Diamond, Private Detective |
| 17 | RADIO: GUNSMOKE | Gunsmoke radio |
| 18 | RADIO: HISTORICAL BROADCASTS | Churchill and other historically significant broadcasts |
| 19 | CLASSIC TV & COMEDY | General classic television and comedy that does not belong to a more specific channel |
| 20 | CARTOONS | Rocky & Bullwinkle and other appropriate classic cartoons |
| 21 | FAMILY TV | Reading Rainbow and other family-oriented programming |
| 22 | CLASSIC FILMS & EDUCATION | Educational films and non-feature classic film material; do not use this as a dumping ground for feature movies |
| 23 | SPACE & APOLLO | Apollo, space history, and closely related film material |
| 24 | DOCUMENTARIES: WILD KINGDOM & NOVA | Documentary series such as Wild Kingdom and NOVA |
| 25 | RADIO: JAZZ & MUSIC | Jazz, music, and appropriate music radio |
| 26 | SPORTS: WIDE WORLD OF SPORTS | ABC Wide World of Sports and related sports programming |
| 27 | IN SEARCH OF | In Search Of and related mystery/unknown investigative programming |

## Editorial rules

### Channel 2 is special

Channel 2 is the movie library. A program does not go into CH 2 merely because it is an Archive.org MP4.

It must be:

- a feature-length movie or a clearly identified television movie;
- identifiable by title;
- appropriate to the historical period/catalog;
- a real watchable video source;
- not an episode of a series;
- not a documentary episode;
- not a commercial, clip, compilation, radio recording, or miscellaneous upload.

### No duplicates just to fill channels

One program should have one home channel unless there is a deliberate editorial reason documented in the index.

### The index is the authority

The visible `// CH N: ...` section and `const chN = [...]\` are the source of truth. The player reads those arrays directly.

### Additions

New programming additions must name the actual destination CH. A manifest may append to that existing array, but it must never reinterpret CH numbers as category numbers.

### Audit before expansion

Before adding hundreds of new programs, audit the existing channels for:

1. wrong genre;
2. duplicate programs;
3. broken Archive.org URLs;
4. entries that are not actually movies when placed in CH 2;
5. programs that belong in a more specific existing channel.

Only after that audit should the movie harvest be allowed to add to CH 2.
