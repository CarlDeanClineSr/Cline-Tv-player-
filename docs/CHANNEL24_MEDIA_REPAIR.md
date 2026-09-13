# Channel 24: repair the source files, not the radio display

Requested by Carl after programs 11–14 and 105 skipped without a picture.

## Diagnosis from the actual files

The selected Big Pacific originals (10–14) contain HEVC/H.265 video and AAC audio. Sampled original NOVA files including 103 and 105 likewise contain HEVC video, not an absent video track. A browser that plays AAC but cannot decode that HEVC track can appear audio-only. The previous picture guard properly skips an undecoded source but cannot convert its codec.

Archive.org's file metadata lists H.264 IA derivatives of the same programs, commonly named `.ia.mp4`. The repair uses an explicitly listed derivative with an exact `original` relationship, nonzero video dimensions and matching duration (within 2 seconds or 0.2%). Filenames are not guessed by changing extensions.

## Changes

- 831 existing Channel 24 source links updated: 830 listed H.264 IA derivative selections and Carl's supplied H.264 Catastrophe recording.
- Big Pacific episodes 1–5 remain programs 10–14.
- Program 103, In the Event of Catastrophe, uses `archive.org/download/youtube-j64mtjMTfIE/j64mtjMTfIE.mp4`; Archive.org redirects it to the same storage-host file Carl provided. This is an alternate recording of the same title; edits/timing may differ from the previous recording.
- Program 105 remains Blueprints in the Bloodstream and uses its own listed H.264 derivative.
- 13 Cosmos: A Personal Voyage episodes are appended together, in episode order, at positions 1056–1068. Channel 24 now has 1068 programs.
- No original programs removed. None of the sampled reported failures proved to be a genuinely audio-only original.
- Existing numerical positions and persistent program IDs are preserved for all 1055 original entries. Explicit `id` values keep old shared links and favorites associated with the same programs despite their corrected media URLs.
- Other channels, cabinet, controls, playback guard, radio visualization, and navigator data are unchanged.

## Evidence and verification limits

The read-only inspection captured metadata for all 11 Archive items supplying the original 1055 entries, plus Carl's supplied item. Every original path was listed. Metadata-qualified replacement selection is broader than the limited playback sample: this does not claim all 831 complete episodes were watched.

Public source inspections ran in Actions 34730278893 (metadata and prefixes), 34730463192 (larger samples and original tail metadata), and 34730577734 (Cosmos and the repeated Big Pacific request). One request for the episode-5 derivative returned HTTP 500; a later bounded request returned 206 with a usable H.264/AAC sample. A transient server error is not proof of audio-only content.

FFprobe identified H.264/AAC in the sampled replacement bytes and all 13 Cosmos prefixes. Chromium decoded selected real prefixes using the unchanged player engine and local Blob-backed media, including programs 11–14 and 105. This is not direct remote end-to-end playback in Carl's browser, nor a promise of future Archive.org availability. Browser navigation from the test environment was blocked; the Blob test did not bypass or make external browser requests.

Source-selection report: `tools/channel24-media-repair.json` records old/new URLs, preserved IDs, provider checksums, dimensions and durations. Provider full-file checksums were recorded, not recomputed from partial samples. Original HEVC identification used actual MP4 metadata; missing moov errors in too-short initial prefixes were not treated as broken full files.

The source-specific H.264 copies may be lower resolution than the originals (Big Pacific is 854×480 instead of 1920×1080), trading resolution for usable browser playback. The player cannot repair a source containing only a title card, black frames, or a damaged later segment.

Nine new offline catalog tests supplement, rather than replace, the existing playback and navigator tests. No network-dependent tests, scheduled catalog changes, or new provider polling remain in the final repair.
