# Cline Coordinates (CC) — harmonic reference layer 0.2.1

Design direction: Carl Dean Cline Sr. This increment preserves each node's stored harmonic value in the craft-centered map without relabeling it as a measured frequency or sensor lock.

## What the audit actually found

A read-only audit ran in GitHub Actions run `34370838950` on PR #2, commit `f7de2bec82d0c78d0129f16f90ace5704027c4ff`.

Source: the unchanged `nodes.json`.
SHA-256: `33c050a5d538a51ba4aa9677c1b3684460278683c860d2a79284ebbc97ee7a95`.
Artifact ID: `10111828235`, containing `cc-signature-diagnostics.json` and `sphere-registry-audit.json`.
Artifact ZIP SHA-256: `5d6d5948cb0379f4b22e72cdb319bb892508a0cb15171bfcf3d646ec0d97c793`.

| Diagnostic | Result |
| --- | ---: |
| Rows with finite h | 100,000 |
| Distinct stored h values | 15,398 |
| Values shared by multiple rows | 6,361 |
| Rows whose h is also used by another row | 90,963 |
| Rows with h = 5.3735 (node 3) | 1 |
| Rows with h = 0.0396 (node 97006) | 114 |

Exact equality is a comparison of stored numbers only. Node 3's value being unique in this file does not establish a physical measurement or uniquely locate a spacecraft. Other positions outside the registry, rounding, sensor uncertainty and missing units are not represented by that count.

### Calculated-value hypothesis

All 100,000 rows are numerically compatible with

```
h approximately (25 - m) / d
```

under explicitly assumed nearest-rounding half-widths d +/- 0.005, m +/- 0.005, and h +/- 0.00005. This is an exploratory relationship inferred from the stored numbers, NOT the recovered original generator. It is not independently measured harmonic evidence. The constant 25 is part of this hypothesis, not a physical constant.

Node 3 contains d=1, m=19.63, h=5.3735. The formula from rounded fields gives 5.37. Node 97006 contains d=477.75, m=6.1, h=0.0396; the formula gives approximately 0.03956044.

### Generated-direction hypothesis

Using only integer row index j=0..N-1, N=100000, the following mathematical grid closely reproduces the stored directions:

```
y = 1 - 2*j/(N-1)
theta = pi*(sqrt(5)-1)*j
x = sqrt(1-y*y)*cos(theta)
z = sqrt(1-y*y)*sin(theta)
RA = atan2(y,x) modulo 360 degrees
Dec = asin(z)
```

99,999 of the 100,000 stored RA/Dec pairs fall within the diagnostic's 0.000050001-degree component tolerance. The maximum Dec discrepancy is 0.00005000159574120033 degrees: one row narrowly exceeds that chosen tolerance, and the audit reports it rather than changing the threshold.

For the full-precision coordinates in the existing sky-viewer links, the maximum coordinate-component difference is 0.00000012570285434776451 degrees. 99,615 pairs meet the tighter 1e-8-degree criterion. All 100,000 pairs were tested. The existing links were parsed locally, not fetched.

This is strong numerical evidence of a generated spherical grid. It does not identify who produced the original generator, and it does not establish a physical catalog source. A generated point can aim a real sky viewer without becoming a measured star at the stored distance. The correct current treatment is **legacy generated-grid/reference data, not authenticated stellar telemetry**. Original bytes are retained.

## What is implemented

- The new map displays the exact stored harmonic number for the selected permanent point.
- It records unknown quantity, units, measurement time, instrument, source record and uncertainty as null.
- It counts rows sharing that exact number and shows up to 12 other point keys.
- Moving the craft preserves the legacy reference value but recomputes geometric range/rank independently. It does not pretend the stored number is the signal a relocated receiver would measure.
- Signature metadata is included in the geometry JSON snapshot.
- State stays `NOT_EVALUATED_NO_SENSOR_MODEL`; `navigationLock` is always false.
- The original navigator, raw node registry and TV program catalog are not rewritten.

`assets/cc-signature.js` is the reference index. `tools/cc_registry_diagnostics.cjs` is the reproducible diagnostic. It is audit-only and never rewrites coordinates, harmonic values, units or classifications in the source file.

## Measurement-based successor: design, not implemented

Keep three distinct objects:

1. **Legacy reference:** the present h number, with its unknown physical meaning.
2. **Predicted observable:** a documented model of what a particular sensor would measure at a chosen position, velocity and time.
3. **Actual observation:** independent recorded sensor data, with instrument calibration and uncertainties.

A measured reference must identify the physical quantity, unit, frequency band or period where applicable, observation epoch/time scale, frame, source and receiver positions, instrument/calibration, source product ID and checksum, feature extraction method/version, and uncertainty or covariance. Different quantities cannot be compared as the same number because their decimal values happen to agree. Measured and simulated references remain distinct.

A future estimator would compare an observation y with candidate predictions g_i(position, velocity, time, instrument). Under a justified Gaussian error model, one possible residual is

```
D_i^2 = (y - g_i)^T C_i^-1 (y - g_i)
```

C_i must be a valid covariance of the comparable residuals. A small residual is compatibility, not a posterior probability or an automatic lock. Multiple landmarks, competing candidates, sensor failures, ambiguous matches, model mismatch and an explicit NO_FIX state are needed. This prototype does not implement that estimator or an actuator interface.

A complete closed loop needs independent observations that update the state and uncertainty, followed by later observations testing the prediction. Fetching a registry number, moving a simulated origin, or finding the same scalar is not such a loop.

Names may be hidden from the pilot's display. Persistent object identity and catalog/source provenance are still necessary behind it. Numeric and string identifiers both work in software; their serialization type does not create navigational accuracy. This implementation remains static Euclidean geometry, not a relativistic propagation or flight-control system.

## External engineering examples (not evidence for the legacy h values)

NASA SEXTANT demonstrated autonomous navigation by comparing measured pulsar arrival times with prediction models, with a GPS comparison for validation. That supports the general concept of measured signal-based navigation; it does not validate a one-number location signature.
https://www.nasa.gov/universe/nasa-team-first-to-demonstrate-x-ray-navigation-in-space/

JPL SPICE explicitly requires target, observer, epoch, frame and light-time/aberration options; identifiers can be numeric strings.
https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/FORTRAN/spicelib/spkpos.html

Gaia DR3 uses source IDs plus an identified catalog release, coordinate frame and reference epoch. A real-data CC layer should retain those behind its names-optional display.
https://www.cosmos.esa.int/web/gaia/dr3

## Test boundaries

Unit tests cover preservation, duplicates, missing/invalid values, no invented units or locks, synthetic formula tests and unchanged geometry. Browser checks use four explicitly synthetic points and mocked Worker transport; these are UI tests, not measurements. Full browser network/real-registry end-to-end operation remains unverified in this environment. CI independently reads and audits the complete unchanged repository registry.
