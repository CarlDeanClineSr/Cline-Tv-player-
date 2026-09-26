# Legacy TV Features Preserved During Rebuild

These features are intentionally no longer mounted or linked from the TV page.

## Exact source files preserved

### Stellar Navigator
- `navigator.html`
- `sphere-navigator.html`
- `assets/sphere-ui.js`
- `docs/SPHERICAL_NAVIGATOR.md`
- `docs/CC_SIGNATURES.md`
- `.github/workflows/sphere-navigator.yml`

### FAN
- `fan.html`
- `assets/fan-host.js`
- `assets/fan-audio.js`
- `assets/fan-ui.js`
- `assets/fan-noise-worklet.js`
- `docs/FAN_TUNER.md`

## Full repository rollback

The complete pre-rebuild repository is preserved on:

`backup/pre-tv-rebuild-2026-09-26`

Rollback commit:

`acd2dbea10e1393cba335f8cff156c8a83e9fd7c`

The standalone source files above are therefore retained for reference, while the TV page is being rebuilt independently.
