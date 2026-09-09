/* Read-only numerical diagnostics. Inferred formulas are NOT recovered source provenance. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const signatures=require('../assets/cc-signature.js');
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const angleDiff=(a,b)=>Math.abs(((a-b+540)%360+360)%360-180);
function goldenDirection(zeroBasedIndex,count) {
  if(!Number.isInteger(count)||count<2||!Number.isInteger(zeroBasedIndex)||zeroBasedIndex<0||zeroBasedIndex>=count)throw Error('Invalid grid index');
  const y=1-2*zeroBasedIndex/(count-1),rad=Math.sqrt(Math.max(0,1-y*y));
  const theta=Math.PI*(Math.sqrt(5)-1)*zeroBasedIndex;
  const x=rad*Math.cos(theta),z=rad*Math.sin(theta);
  return {ra:((Math.atan2(y,x)*180/Math.PI)%360+360)%360,dec:Math.asin(z)*180/Math.PI};
}
function ratioCompatible(record) {
  const {d,m,h}=record;
  if(!finite(d)||!finite(m)||!finite(h)||d<=0.005)return null;
  // Explicit assumption: nearest rounding to 0.01 for d,m, and 0.0001 for h.
  const values=[];
  for(const distance of [d-.005,d+.005])for(const mag of [m-.005,m+.005])values.push((25-mag)/distance);
  const low=Math.min(...values),high=Math.max(...values);
  return {consistent:h+.00005>=low-1e-12&&h-.00005<=high+1e-12,predicted:(25-m)/d};
}
function diagnostics(raw, bytes=null) {
  const keys=Object.keys(raw),count=keys.length,sig=signatures.buildIndex(raw);
  const contiguous=count>=2&&keys.every(k=>/^[1-9]\d*$/.test(k)&&Number.isSafeInteger(Number(k))&&Number(k)<=count);
  const grid={tested:0,withinStoredCoordinateRounding:0,maxRaDifferenceDeg:0,maxDecDifferenceDeg:0,
    linkedCoordinatePairsTested:0,linkedCoordinatePairsWithin1eMinus8Deg:0,maxLinkedDifferenceDeg:0};
  let ratioTested=0,ratioConsistent=0;const samples={};
  for(const key of keys){
    const p=raw[key];if(!p||typeof p!=='object')continue;
    if(contiguous&&finite(p.r)&&finite(p.e)){
      const expected=goldenDirection(Number(key)-1,count),da=angleDiff(p.r,expected.ra),dd=Math.abs(p.e-expected.dec);
      grid.tested++;if(da<=.000050001&&dd<=.000050001)grid.withinStoredCoordinateRounding++;
      grid.maxRaDifferenceDeg=Math.max(grid.maxRaDifferenceDeg,da);grid.maxDecDifferenceDeg=Math.max(grid.maxDecDifferenceDeg,dd);
      // Parse the existing link only. No HTTP request, no coordinate replacement.
      try{
        const u=new URL(p.u),parts=u.searchParams.get('target').trim().split(/\s+/).map(Number);
        if(parts.length===2&&parts.every(finite)){
          const delta=Math.max(angleDiff(parts[0],expected.ra),Math.abs(parts[1]-expected.dec));
          grid.linkedCoordinatePairsTested++;if(delta<=1e-8)grid.linkedCoordinatePairsWithin1eMinus8Deg++;
          grid.maxLinkedDifferenceDeg=Math.max(grid.maxLinkedDifferenceDeg,delta);
        }
      }catch{}
    }
    const ratio=ratioCompatible(p);if(ratio){ratioTested++;if(ratio.consistent)ratioConsistent++;}
    if(['1','2','3','97006','100000'].includes(key))samples[key]={stored:p,legacySignature:signatures.describe(sig,key),inferredRatio:ratio};
  }
  return {schema:'CC_REGISTRY_NUMERICAL_DIAGNOSTICS_V1',
    registrySha256:bytes?crypto.createHash('sha256').update(bytes).digest('hex'):null,
    rowCount:count,signatureSummary:sig.summary,
    goldenAngleGrid:{...grid,contiguousNumericKeys:contiguous,
      hypothesis:'y=1-2*j/(N-1); theta=pi*(sqrt(5)-1)*j; x=sqrt(1-y*y)*cos(theta); z=sqrt(1-y*y)*sin(theta); RA=atan2(y,x), Dec=asin(z)',
      interpretation:'Agreement would support generated-grid structure; it does not identify the original generator or authenticate physical sources.'},
    inferredHRelation:{hypothesis:'h approximately (25-m)/d',tested:ratioTested,consistentWithinAssumedRounding:ratioConsistent,
      assumedHalfRoundingWidths:{d:0.005,m:0.005,h:0.00005},
      interpretation:'Exploratory numerical consistency check, not a recovered formula or a measured frequency.'},
    samples,navigationLockEnabled:false};
}
if(require.main===module){
  const root=path.resolve(__dirname,'..'),bytes=fs.readFileSync(path.join(root,'nodes.json'));
  const report=diagnostics(JSON.parse(bytes),bytes),out=path.join(root,'_site','cc-signature-diagnostics.json');
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}
module.exports={goldenDirection,ratioCompatible,diagnostics};
