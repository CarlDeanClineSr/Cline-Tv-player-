'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const cc=require('../assets/cc-signature.js'),diag=require('../tools/cc_registry_diagnostics.cjs');
const fixture={'3':{h:5.3735},'4':{h:5.3735},'5':{h:0.1},'6':{h:0},'7':{},'8':{h:'5.3735'}};
test('original harmonic number is retained exactly, with no invented unit',()=>{
  const r=cc.describe(cc.buildIndex(fixture),'3');assert.equal(r.value,5.3735);assert.equal(r.unit,null);assert.equal(r.quantity,null);
});
test('an exact legacy signature match never authorizes a navigation lock',()=>{
  const r=cc.describe(cc.buildIndex(fixture),'3');assert.equal(r.exactValueMatchCount,2);assert.equal(r.navigationLock,false);assert.equal(r.navigationState,'NOT_EVALUATED_NO_SENSOR_MODEL');
});
test('even a unique legacy value is not a verified location',()=>{
  const r=cc.describe(cc.buildIndex(fixture),'5');assert.equal(r.exactValueMatchCount,1);assert.equal(r.navigationLock,false);
});
test('zero remains a number; missing and invalid values are explicit',()=>{
  const index=cc.buildIndex(fixture);assert.equal(cc.describe(index,'6').value,0);assert.equal(cc.describe(index,'7').state,'MISSING');
  assert.equal(cc.describe(index,'8').state,'INVALID');assert.equal(cc.describe(index,'8').value,'5.3735');assert.equal(cc.describe(index,'99').state,'POINT_NOT_IN_REGISTRY');
});
test('invalid legacy numbers never become physically measured zeroes',()=>{
  for(const h of [NaN,Infinity,{},[],false])assert.equal(cc.describe(cc.buildIndex({'1':{h}}),'1').state,'INVALID');
});
test('legacy long field name is supported',()=>{
  assert.equal(cc.describe(cc.buildIndex({'1':{harmonic:5.3735}}),'1').value,5.3735);
});
test('caller-supplied claims cannot turn legacy reference into a measurement',()=>{
  const r=cc.describe(cc.buildIndex({'1':{h:5.3735,unit:'Hz',navigationLock:true,instrument:'Claim'}}),'1');
  assert.equal(r.unit,null);assert.equal(r.navigationLock,false);assert.equal(r.instrument,null);
});
test('duplicate summary counts all registry rows; example list is bounded',()=>{
  const raw={};for(let n=1;n<=100;n++)raw[n]={h:1};const index=cc.buildIndex(raw),r=cc.describe(index,'1');
  assert.equal(index.summary.recordsWithRepeatedValue,100);assert.equal(index.summary.duplicateGroupCount,1);assert.equal(r.exactValueMatchCount,100);assert.equal(r.otherMatchingPointSample.length,12);
});
test('signature indexing does not modify input records',()=>{
  const before=JSON.stringify(fixture);cc.describe(cc.buildIndex(fixture),'3');assert.equal(JSON.stringify(fixture),before);
});
test('diagnostic Fibonacci formula reproduces its poles and stated sample only as geometry',()=>{
  const a=diag.goldenDirection(0,100000),b=diag.goldenDirection(99999,100000),c=diag.goldenDirection(97005,100000);
  assert.equal(a.ra,90);assert.equal(b.ra,270);assert.ok(Math.abs(c.ra-254.6202891811856)<1e-10);assert.ok(Math.abs(c.dec-12.829270360767483)<1e-10);
});
test('invalid diagnostic indices are rejected',()=>{
  for(const pair of [[0,1],[-1,10],[10,10],[0,2.5]])assert.throws(()=>diag.goldenDirection(...pair));
});
test('grid diagnostic distinguishes invented synthetic grid and a displaced coordinate',()=>{
  const raw={};for(let n=1;n<=10;n++){const p=diag.goldenDirection(n-1,10);raw[n]={r:p.ra,e:p.dec,d:1,m:20,h:5};}
  const report=diag.diagnostics(raw);assert.equal(report.goldenAngleGrid.withinStoredCoordinateRounding,10);
  raw['4'].r+=1;assert.equal(diag.diagnostics(raw).goldenAngleGrid.withinStoredCoordinateRounding,9);
});
test('ratio diagnostic labels rounding assumptions and does not infer units',()=>{
  assert.equal(diag.ratioCompatible({d:1,m:19.63,h:5.3735}).consistent,true);
  assert.equal(diag.ratioCompatible({d:1,m:19.63,h:99}).consistent,false);
  assert.equal(diag.ratioCompatible({d:0,m:19.63,h:5.3735}),null);
  const r=diag.diagnostics({'1':{d:1,m:20,h:5}});assert.equal(r.navigationLockEnabled,false);assert.equal(r.inferredHRelation.hypothesis,'h approximately (25-m)/d');
});
test('signature snapshots explicitly preserve null measurement fields',()=>{
  const r=JSON.parse(JSON.stringify(cc.describe(cc.buildIndex(fixture),'3')));
  for(const key of ['measurementEpoch','sourceRecord','uncertainty','instrument','unit'])assert.equal(r[key],null);
});
