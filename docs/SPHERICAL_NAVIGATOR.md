# Craft-centered overlapping-sphere navigator — prototype 0.2

Owner's design: Carl Dean Cline Sr. A spherical search surface expands from the craft's current position. Points enter the encounter list as their ranges are reached. A second sphere can be pinned elsewhere to identify shared landmarks. Traditional object names are not required in the interface.

## What changed

`sphere-navigator.html` adds an observer-centered spatial view alongside the original `navigator.html` lookup. `nodes.json`, its generated sections, the TV player, source backups and media are not changed. No external astronomy data are acquired. The existing site-preparation script copies the new static assets automatically.

Choose **Load full sphere map** explicitly. This downloads the existing approximately 21 MB registry once into a Web Worker. The normal lookup still downloads only its requested small section. The worker validates spatial numbers, computes Cartesian coordinates, sorts by current observer range, hashes the downloaded registry, and reports excluded records. It retains its index in memory until **Cancel / unload** or page exit. There is a 64 MiB download cap, a 90-second timeout and a 200,000-record cap. Load does not follow links or send credentials.

## Coordinate contract and mathematical derivation

For original right ascension alpha, declination delta and distance d:

```
p = [d cos(delta) cos(alpha),
     d cos(delta) sin(alpha),
     d sin(delta)]
```

Angles are converted from degrees to radians before trigonometry. The stored RA and Dec are used as supplied, not replaced by extra digits parsed from a sky-viewer URL.

At craft position s, the target-relative vector is q = p - s. Its range is |q|. Its direction in the ORIGINAL FIXED AXES is:

```
longitude = atan2(q_y, q_x) mod 2*pi
latitude  = atan2(q_z, hypot(q_x, q_y))
```

At zero range both direction angles are undefined. They are returned as null, never fabricated as zero. Camera rotation changes the drawing, not the numerical direction. Craft attitude and sensor calibration are not available; these are not body-frame pointing commands.

The encounter order is the ascending sort of |p_i - s| across all valid records. Local rank changes with s. The registry's numeric key and supplied ID do not change. Equal computed ranges are broken by numeric key for deterministic output; this is not evidence that uncertain physical distances can be distinguished.

Sphere A selects the closed ball |p-s_A| <= R_A. Sphere B selects |p-s_B| <= R_B. Their shared points satisfy BOTH inequalities in three dimensions. The balls intersect when |s_B-s_A| <= R_A+R_B; containment, tangencies and coincident spheres are separately reported. A two-dimensional screen overlap is not the membership calculation.

Translations preserve physical separations:

```
|(p_i+a) - (s+a)| = |p_i-s|
```

This is why the same map can be recentered without renaming points. Rotations also preserve distances when applied consistently to all points and the observer.

## Operation

1. Open `sphere-navigator.html` and load the map. Original target links such as `#node=97006` select a permanent registry key but do not authorize an automatic download.
2. Enter XYZ for the craft or select a point and use **Center on this point**. Edit XYZ to add a displacement. Centering on a star's point is not an orbital insertion.
3. Set sphere A's radius. **Expand to next point** moves the mathematical boundary to the next stored range, including ties.
4. Select another point and **Pin sphere B here**. Its center stays fixed when the craft moves. Choose B's radius. Inspect the full-registry counts or filter to common points.
5. A **Preview position toward point** applies s_new = s + f(p-s), 0 <= f <= 1. This is a geometric interpolation only: no fuel, time, obstacle clearance or gravity calculation.
6. Share the map state or save a small JSON geometry snapshot containing its registry hash and current table page. A snapshot is not a whole-registry backup.

The screen draws at most 1,500 sampled points. Counts and local ranks use ALL valid entries. Table pages contain 50 rows. Changing the point selection does not change permanent IDs. The drawing does not report star luminosity or apparent brightness.

## What the source does NOT establish

The current registry provenance has not been established by this work. Valid numbers and a working Aladin link do not prove that a row is a measured star, that 100,000 rows are the nearest 100,000 real objects, or that numeric key order is physical distance order. The read-only audit reports numerical distance-order reversals without assuming their absence.

The computation therefore uses explicit labels:

```
axes: LEGACY_RA_DEC_AXES_ASSUMED
origin: REGISTRY_ORIGIN_UNSPECIFIED
provenance: UNVERIFIED_LEGACY_REGISTRY
epoch: null
timeModel: STATIC
navigationCertified: false
```

Point 0 is the computational origin, not an authenticated Earth/Sun ephemeris. Earth center, Sun center and solar-system barycenter cannot be treated as interchangeable for precision navigation. Source IDs, catalog releases, frame/origin, reference epoch, distance uncertainty and velocities belong behind the display even when traditional names are hidden.

`h` / harmonic values and `m` / magnitudes do not enter any navigation calculation. They remain in the untouched source registry. Unknown, negative or nonfinite distances are not converted to zero. A field with no catalog entries is not certified empty physical space.

## Geometry, localization and guidance are different layers

This version answers: **Given a position, what is around it?** It does not answer: **What position is the spacecraft actually at?** Overlapping catalogs alone do not provide a new measurement.

For ideal known landmarks p_i and measured absolute ranges rho_i, localization would solve |s-p_i| = rho_i. Four suitable non-coplanar landmarks can resolve the generic three-dimensional ambiguity in exact range data; noise, clock biases, moving landmarks and bad geometry require a state estimator and more observations. Three spheres alone can leave two intersection points. Angular-only star sightings do not themselves supply those ranges.

An operational successor must use time-tagged, independently identified measurements, uncertainty/covariance, moving objects, observer attitude, aberration/light-time corrections and orbit/trajectory dynamics. At substantial fractions of light speed, a static Euclidean snapshot cannot substitute for relativistic state and observation models.

Reference implementations and data contracts supporting these distinctions:

- NASA/JPL NAIF `spkpos_c`: observer, target, epoch, reference frame and light-time/aberration corrections: https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/cspice/spkpos_c.html
- NASA/JPL `spkapp_c` discussion distinguishing apparent from geometric positions: https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/cspice/spkapp_c.html
- ESA Gaia DR3: source identifiers, J2016.0 reference epoch, ICRS and TCB: https://www.cosmos.esa.int/web/gaia/dr3
- NASA/JPL Deep Space 1 AutoNav: camera observations of asteroids against stars used to estimate position, rather than merely redrawing a catalog: https://www.jpl.nasa.gov/nmp/ds1/tech/autonav.html

These references support engineering requirements, not a claim that this prototype duplicates or improves upon a flown navigation system.

## Tests and scope

`node --test tests/sphere.test.cjs` tests axes, round trips, zero-range directions, recentering/rank reversal, translation invariance, same-radius IDs, true 3-D overlap, sphere boundary cases, malformed inputs, provenance flags, no harmonic dependence, read-only behavior, worker loading/hash/errors, and 100,000 **synthetic** points. Synthetic tests do not authenticate real registry entries.

`node tools/audit_sphere_registry.cjs` reads the actual registry, reports SHA-256 and Git blob SHA-1, count/field coverage, ordering diagnostics and selected original records including 97006. It writes only a generated audit file under `_site`.

`Sphere Navigator CI / geometry` runs the existing TV/navigator tests plus the new geometry tests on a pull request; it does not deploy the site. Existing deployment behavior is retained. A successful source audit is numerical validation, not observational validation.
