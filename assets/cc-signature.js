/* Cline Coordinates: preserve legacy signature references, never fabricate a sensor lock. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CCSignature = api;
})(typeof self !== 'undefined' ? self : globalThis, function() {
  'use strict';
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  function buildIndex(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('Signature registry must be an object');
    const byKey = new Map(), groups = new Map();
    let missingCount = 0, invalidCount = 0;
    for (const [key, record] of Object.entries(raw)) {
      const value = record && typeof record === 'object' ? (record.h ?? record.harmonic ?? null) : null;
      const state = value === null ? 'MISSING' : finite(value) ? 'UNVERIFIED_LEGACY_VALUE' : 'INVALID';
      byKey.set(key, {value, state});
      if (state === 'MISSING') missingCount++;
      else if (state === 'INVALID') invalidCount++;
      else {
        if (!groups.has(value)) groups.set(value, []);
        groups.get(value).push(key);
      }
    }
    let duplicateGroupCount = 0, recordsWithRepeatedValue = 0;
    for (const keys of groups.values()) if (keys.length > 1) { duplicateGroupCount++; recordsWithRepeatedValue += keys.length; }
    return {byKey, groups, summary: {
      recordCount: byKey.size, finiteValueCount: byKey.size - missingCount - invalidCount,
      missingCount, invalidCount, distinctStoredValues: groups.size,
      duplicateGroupCount, recordsWithRepeatedValue,
      comparisonScope: 'ALL_REGISTRY_ROWS_WITH_FINITE_H',
      comparisonMeaning: 'EXACT_STORED_NUMBER_ONLY_NOT_PHYSICAL_IDENTIFICATION',
      navigationLockEnabled: false
    }};
  }
  function describe(index, key) {
    const r = index.byKey.get(String(key));
    const matches = r && finite(r.value) ? index.groups.get(r.value) : [];
    return {
      pointKey: String(key), value: r ? r.value : null,
      state: r ? r.state : 'POINT_NOT_IN_REGISTRY',
      quantity: null, unit: null, sourceRecord: null, measurementEpoch: null,
      instrument: null, uncertainty: null,
      exactValueMatchCount: matches ? matches.length : 0,
      otherMatchingPointSample: (matches || []).filter(k => k !== String(key)).slice(0, 12),
      matchScope: 'ALL_REGISTRY_ROWS_WITH_FINITE_H',
      interpretation: 'Stored reference only; neither equality nor uniqueness verifies a location.',
      navigationLock: false, navigationState: 'NOT_EVALUATED_NO_SENSOR_MODEL'
    };
  }
  return Object.freeze({buildIndex, describe});
});
