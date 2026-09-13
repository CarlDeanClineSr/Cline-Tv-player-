# Cline TV Fan Tuner — working V1

This is a functional sound synthesizer, not the earlier generated UI mockup and not a recording or a validated acoustic reconstruction of a Penney's/Penncrest fan. The vintage metal-box appearance is an SVG/CSS illustration inspired by the owner's reference photographs. Cline TV keeps its own name.

## Use

On the published TV page, select **FAN** beside **TV**, then **Start fan**. Choose Low/Medium/High or tune the motor tone, deep hum, blade whoosh, airflow tone, enclosure resonance, and grille hiss separately. Fan volume is independent of TV volume. Screen light dims the entire page; Dark screen blanks it while retaining sound. Tap the dark screen to wake it. Use TV to return to the same program/time. Entering FAN saves and cancels TV/radio playback and its retry timers; leaving closes the fan's audio context.

Settings are stored under `cline-fan-v1`, separately from TV preferences. Sound never autostarts from a saved preference. On reopening, saved volume is capped at 50% and display light is raised to at least 25%, so a previous session cannot unexpectedly reopen loud or nearly invisible. Blocked storage does not prevent use.

The sleep selector supports continuous play, 30 minutes, 1 hour, 2 hours, or 4 hours. The final ten-second fade is scheduled on the audio clock, not only a JavaScript timer. If the browser suspends the entire audio context, this clock also pauses. Screen Wake Lock is optional and may be denied or released by the browser; its state is displayed. Screen dimming is a page overlay, not a hardware-brightness adjustment. Actual locked-screen/background playback remains device-dependent; no overnight guarantee is made.

## Integration and preservation

`index.html`, its 26 channels / 5,534 entries at the reviewed base, and every existing navigator/registry file remain unchanged. `tools/prepare_site.py` adds exactly a FAN anchor and a deferred `assets/fan-host.js` reference to the **published copy** `_site/index.html`. It checks its anchors and required assets, is idempotent, and fails on a missing anchor rather than guessing. The source TV file remains independently usable without the new module; `fan.html` is also a standalone page when served with its adjacent assets.

The host mounts `fan.html?embedded=1` inside the existing screen and temporarily hides the TV-only knobs. Returning to TV restores the original layout and resume selection. Messages must come from the actual fan frame and the same origin. The FAN anchor falls back to the standalone page if the host script is unavailable. No external audio stream, package, image, tracking service, or new workflow is required.

## Audio design and limits

Native Web Audio oscillators supply hum layers; filtered noise supplies airflow/hiss. An AudioWorklet generates continuous noise on supported secure sites. A compatibility fallback uses independent 19- and 23-second noise loops. Modest EQ, a high-pass filter, a bounded waveshaper, gain ramps, and a conservative default volume avoid the original prototype's large uncontrolled bass boost. Digital headroom is not a guarantee of physical loudness: start with your device volume low. Small speakers may not reproduce the deep tones.

## Verification performed

- Base Pages artifact fetched through the GitHub connector; ZIP SHA-256 `d97e182a9e8ae2a372f6b5c5c01fb56d2553d6c13f2c3a36d57e6128291e1757`.
- Recovered `index.html` matches Git blob `b4fbd19b32c2211f5a7feeb502a97668873c2c72` at base commit `a14fa0e9c9235c37600132746ea03efe1247dac2`.
- Eleven new dependency-free tests cover publication preservation/idempotence, asset syntax, bounded settings, silent initialization, audio-clock sleep ramps, continuous mode, worklet output, message guards, and explicit synthesis labeling.
- Local headless Chromium exercised TV/FAN/TV, no overlapping TV/radio, Start, presets, slider updates, dark/wake, audio-context disposal, and an accelerated sleep deadline. Sampled native audio output was nonzero and remained within the designed bound in the tested configurations.
- Rendering checked at 1440x1000, 390x844, 844x390, 768x1024, and 1920x1080. Compact fan panels scroll vertically; no horizontal overflow was found in these cases.
- Local browser network/file navigation was administratively blocked. Browser tests therefore used an **offline inline/srcdoc harness**, adapting asset transport and opaque-origin messaging only; they exercised compatibility audio, not a live HTTPS AudioWorklet. The worklet processor was separately unit-tested. These checks are not an actual iPhone, Android, overnight, Bluetooth, or casting test.

Run the existing full suite before publication:

```sh
python3 tools/prepare_site.py
node --test tests/*.test.cjs
```

No NVCPP, Roman, Gannon, archived research repositories, catalog URLs, or channel numbering are changed by this feature.
