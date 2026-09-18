# Owner-supplied programming additions

This batch adds links, not copies of the media. Source basis: the six direct MP4
URLs supplied by Carl and the three attached Archive.org directory listings.
Their names and SHA-256 hashes are recorded in `tools/programming-additions.json`.
There is no wider catalog harvesting or external runtime dependency.

## Placement

- Channel 4, SCI-FI SERIES: 104 Twilight Zone MP4 entries, appended as one block.
  Original pilot S01E00 followed by S01E01-36; colorized S02E01-29; colorized
  S03E01-37. S02E27 also has a separately listed `v2` MP4: it is retained beside
  the first version and labeled `alternate v2`. No claim is made that those two
  files have different content; their source paths differ.
- Channel 3, MOVIE VAULT: The Man Who Saw Tomorrow (1981), then The Longest Day (1962).
- Channel 12, MONSTER DRIVE-IN: Earth vs. the Flying Saucers (Color).

All six directly supplied URLs are preserved exactly. The three supplied sample
Twilight Zone URLs replace their directory-listing host aliases, rather than
creating additional copies of the same item/file. Other MP4 filenames and URLs
come directly from the attached lists. MKVs, images, torrents, and metadata are
not added. Season 2/3 episode titles were not supplied, so none are invented.
The original pilot is named according to the owner's source listing, not
independently authenticated episode history.

## Source and publication

`index.html` retains its existing 5,534 entries at reviewed base
`87bab117c15d5bb8b37625f21ce4d79661f84000`.
The editable supplement is `tools/programming-additions.json`. The existing
`tools/prepare_site.py` validates and embeds it into `_site/index.html` before
category/ID initialization. The published player is still self-contained;
visitors make no separate catalog request. Source `index.html` opened by itself
contains the original catalog only. Use the prepared site to test the additions.

The additions only append to existing channel arrays. Original entries, order,
URLs, explicit IDs, and duplicate occurrence order are not rewritten. At this
batch the effective catalog is **26 channels / 5,641 entries**, up by **107**.
The existing guide and resume logic use the effective catalog normally.
Fan assets, navigators, channel labels, radio modes, and `nodes.json` are untouched.

```sh
python3 tools/prepare_site.py
node --test tests/*.test.cjs
```

The supplement tests inspect the *published* catalog, preserve every original
program and ID, check numerical episode ordering and all supplied URLs, reject
duplicate file paths across Archive host aliases, and check repeatable building.
The fan publication test still verifies exact source preservation after removing
only the documented fan hooks and the validated programming block.

## Playback evidence and limits

The owner reports that the three directly linked Twilight Zone samples work.
The attached listings identify the remaining files; this is not a full playback
certification. No movies or episodes are downloaded or rehosted by this change.
Availability, codec support, seeking, and playback still depend on Archive.org
and the viewer's browser. Existing player retry and picture checks are unchanged.
No science repository, workflow schedule, credentials, or permissions are changed.
