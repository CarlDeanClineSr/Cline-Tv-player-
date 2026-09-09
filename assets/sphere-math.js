/* Carl's observer-centered spherical map. Static Euclidean geometry, not flight guidance. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SphereMath = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';
  const FRAME = Object.freeze({
    axes: 'LEGACY_RA_DEC_AXES_ASSUMED',
    origin: 'REGISTRY_ORIGIN_UNSPECIFIED',
    distanceUnit: 'pc', epoch: null, timeModel: 'STATIC',
    provenance: 'UNVERIFIED_LEGACY_REGISTRY', navigationCertified: false
  });
  function finite(value, name) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw Error(`${name} must be a finite number`);
    return value;
  }
  function vector(v, name = 'position') {
    if (!Array.isArray(v) || v.length !== 3) throw Error(`${name} needs three coordinates`);
    return v.map(x => finite(x, name));
  }
  function radius(r) { finite(r, 'radius'); if (r < 0) throw Error('radius cannot be negative'); return r; }
  function distance(a, b) { return Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]); }
  function xyz(ra, dec, pc) {
    finite(ra, 'RA'); finite(dec, 'Dec'); finite(pc, 'distance');
    if (ra < 0 || ra >= 360 || dec < -90 || dec > 90 || pc < 0) throw Error('RA/Dec/distance outside permitted range');
    const a = ra*Math.PI/180, d = dec*Math.PI/180;
    return [pc*Math.cos(d)*Math.cos(a), pc*Math.cos(d)*Math.sin(a), pc*Math.sin(d)];
  }
  function relative(point, observer) {
    vector(point); vector(observer);
    const v = point.map((x,i) => x-observer[i]), r = Math.hypot(...v);
    // At the same point, direction is undefined; never invent zero degrees.
    return {vector: v, rangePc: r, longitudeDeg: r ? ((Math.atan2(v[1],v[0])*180/Math.PI)%360+360)%360 : null,
      latitudeDeg: r ? Math.atan2(v[2], Math.hypot(v[0],v[1]))*180/Math.PI : null};
  }
  function normalize(key, record) {
    if (!/^[1-9]\d*$/.test(key) || !Number.isSafeInteger(Number(key))) throw Error('invalid persistent node key');
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw Error('record is not an object');
    const ra = record.r ?? record.ra, dec = record.e ?? record.dec, pc = record.d ?? record.dist_pc;
    const position = xyz(ra, dec, pc);
    return {key, id: String(record.i ?? record.id ?? `POINT-${key}`), position, originalPc: pc,
      ra, dec, url: typeof (record.u ?? record.visual_url) === 'string' ? (record.u ?? record.visual_url) : null};
  }
  function buildIndex(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('registry must be an object keyed by node number');
    const keys = Object.keys(raw).sort((a,b)=>Number(a)-Number(b));
    if (!keys.length || keys.length > 200000) throw Error('registry requires 1 to 200,000 records');
    const points=[], rejected=[], byKey=new Map(); let reversals=0, previous=-Infinity;
    for (const key of keys) {
      try {
        const p=normalize(key,raw[key]);
        if (p.originalPc < previous) reversals++;
        previous=p.originalPc; points.push(p); byKey.set(key,p);
      } catch (e) { rejected.push({key, reason:e.message}); }
    }
    if (!points.length) throw Error('no valid spatial records; missing distances are not zero');
    return {points, byKey, audit:{inputCount:keys.length, validCount:points.length, rejectedCount:rejected.length,
      rejectedSample:rejected.slice(0,20), originalOrderDistanceReversals:reversals,
      frame:FRAME, note:'Numeric validation is not astronomical authentication; names, epochs, errors and velocities are not inferred.'}};
  }
  function ranked(points, observer) {
    vector(observer);
    return points.map(p=>({point:p, rangePc:distance(p.position,observer)}))
      .sort((a,b)=>a.rangePc-b.rangePc || Number(a.point.key)-Number(b.point.key));
  }
  function sphereRelation(a, ra, b, rb) {
    vector(a); vector(b); radius(ra); radius(rb);
    const separationPc=distance(a,b);
    let kind;
    if (separationPc===0 && ra===rb) kind='COINCIDENT';
    else if (separationPc>ra+rb) kind='DISJOINT';
    else if (separationPc===ra+rb) kind='EXTERNAL_TANGENT';
    else if (separationPc<Math.abs(ra-rb)) kind='CONTAINED';
    else if (separationPc===Math.abs(ra-rb)) kind='INTERNAL_TANGENT';
    else kind='OVERLAPPING';
    return {kind,separationPc,closedBallsIntersect:separationPc<=ra+rb};
  }
  function previewStep(observer, target, fraction) {
    vector(observer); vector(target); finite(fraction,'step fraction');
    if (fraction<0 || fraction>1) throw Error('step fraction must lie between 0 and 1');
    return observer.map((v,i)=>v+(target[i]-v)*fraction);
  }
  function query(index, settings) {
    const observer=vector(settings.observer), r=radius(settings.radiusPc);
    const b=settings.sphereB ? vector(settings.sphereB.center) : null;
    const rb=b ? radius(settings.sphereB.radiusPc) : 0;
    const offset=settings.offset ?? 0, limit=settings.limit ?? 50;
    if (!Number.isInteger(offset)||offset<0||!Number.isInteger(limit)||limit<1||limit>200) throw Error('invalid table page');
    const order=ranked(index.points,observer);
    const rows=[], renderPoints=[]; let insideA=0,insideB=0,common=0,eligible=0,nextRangePc=null,selected=null;
    for(let i=0;i<order.length;i++) {
      const {point:p,rangePc}=order[i];
      const inA=rangePc<=r, inB=b!==null && distance(p.position,b)<=rb;
      if(inA) insideA++; if(inB) insideB++; if(inA&&inB) common++;
      if(nextRangePc===null && rangePc>r) nextRangePc=rangePc;
      if(p.key===String(settings.selectedKey)) selected={...p,...relative(p.position,observer),localRank:i+1,inA,inB};
      if (inA && (!settings.commonOnly || inB)) {
        if (eligible>=offset && rows.length<limit) rows.push({key:p.key,id:p.id,localRank:i+1,rangePc,inB});
        eligible++;
      }
    }
    // A capped display sample, NEVER the population used for counts or distance ranking.
    const stride=Math.max(1,Math.ceil(insideA/1500)); let seen=0;
    for(const {point:p,rangePc} of order) {
      if(rangePc>r) break;
      if(seen++%stride===0) renderPoints.push({key:p.key,position:p.position,shared:b!==null && distance(p.position,b)<=rb});
    }
    return {observer,radiusPc:r,sphereB:b?{center:b,radiusPc:rb}:null,insideA,insideB,common,eligible,
      offset,limit,rows,renderPoints,nextRangePc,selected,
      relation:b?sphereRelation(observer,r,b,rb):null,
      frame:FRAME,provenance:'UNVERIFIED_LEGACY_REGISTRY',epoch:null};
  }
  return Object.freeze({FRAME,finite,vector,radius,distance,xyz,relative,normalize,buildIndex,ranked,sphereRelation,previewStep,query});
});
