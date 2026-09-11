'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const math=require('../assets/sphere-math.js');
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const fixture={
  '10':{i:'POINT-A',r:0,e:0,d:2,h:999},
  '20':{i:'POINT-B',r:90,e:0,d:3,h:-999},
  '30':{i:'POINT-C',r:0,e:90,d:4},
  '40':{i:'POINT-D',r:180,e:0,d:5}
};
const settings=(extra={})=>({observer:[0,0,0],radiusPc:10,selectedKey:'10',limit:50,offset:0,...extra});
test('spherical conversion aligns all three axes',()=>{
  near(math.xyz(0,0,2)[0],2);near(math.xyz(90,0,3)[1],3);near(math.xyz(0,90,4)[2],4);
  near(math.xyz(180,0,5)[0],-5);
});
test('all octants and poles round-trip in range and latitude',()=>{
  for(const ra of [0,12,90,179,270,359.999])for(const dec of [-90,-51,0,36,90]){
    const p=math.relative(math.xyz(ra,dec,7.25),[0,0,0]);near(p.rangePc,7.25);near(p.latitudeDeg,dec);
    if(Math.abs(dec)<90)near(p.longitudeDeg,ra);
  }
});
test('missing or nonnumeric fields are not converted to zero',()=>{
  for(const bad of [null,undefined,'2',NaN,Infinity])assert.throws(()=>math.xyz(0,0,bad));
  assert.throws(()=>math.normalize('1',{r:1,e:2}));
  assert.throws(()=>math.normalize('1',{r:1,e:2,d:null}));
});
test('out of range coordinates and invalid node keys are rejected',()=>{
  for(const a of [[360,0,1],[-1,0,1],[0,91,1],[0,-91,1],[0,0,-1]])assert.throws(()=>math.xyz(...a));
  for(const key of ['0','01','-1','1.1','__proto__','9007199254740993'])assert.throws(()=>math.normalize(key,fixture['10']));
});
test('compact and long schema produce the same coordinate',()=>{
  const a=math.normalize('1',{r:0,e:0,d:0}),b=math.normalize('1',{ra:0,dec:0,dist_pc:0});assert.deepEqual(a,b);
});
test('co-located observer has range zero and undefined direction',()=>{
  assert.deepEqual(math.relative([1,2,3],[1,2,3]),{vector:[0,0,0],rangePc:0,longitudeDeg:null,latitudeDeg:null});
});
test('reference origin can be viewed from another position without being renamed',()=>{
  const r=math.relative([0,0,0],[2,0,0]);near(r.rangePc,2);near(r.longitudeDeg,180);
});
test('recentering reverses rank while preserving permanent identities',()=>{
  const idx=math.buildIndex(fixture),before=math.query(idx,settings()),after=math.query(idx,settings({observer:[0,2.5,0]}));
  assert.equal(before.rows[0].key,'10');assert.equal(after.rows[0].key,'20');
  assert.equal(after.selected.id,'POINT-A');assert.equal(after.selected.key,'10');near(after.selected.rangePc,Math.sqrt(10.25));
});
test('translation of every point and observer leaves all ranges invariant',()=>{
  const pts=math.buildIndex(fixture).points,observer=[-2,3,7],translation=[21,17,-9];
  for(const p of pts)near(math.distance(p.position,observer),math.distance(p.position.map((v,i)=>v+translation[i]),observer.map((v,i)=>v+translation[i])));
});
test('radial neighbors need not be angular neighbors',()=>{
  const idx=math.buildIndex({'1':{r:0,e:0,d:2},'2':{r:180,e:0,d:2.01}});
  near(math.distance(idx.points[0].position,idx.points[1].position),4.01);
});
test('equal ranges use permanent numeric key as a reproducible tie break',()=>{
  const idx=math.buildIndex({'12':{r:0,e:0,d:2},'2':{r:0,e:0,d:2},'3':{r:0,e:0,d:2}});
  assert.deepEqual(math.ranked(idx.points,[0,0,0]).map(r=>r.point.key),['2','3','12']);
});
test('sphere includes every point on its boundary and expands to next stored range',()=>{
  const idx=math.buildIndex(fixture),r=math.query(idx,settings({radiusPc:3}));
  assert.equal(r.insideA,2);near(r.nextRangePc,4);assert.equal(math.query(idx,settings({radiusPc:10})).nextRangePc,null);
});
test('a zero-radius sphere includes co-located points only',()=>{
  const idx=math.buildIndex(fixture),r=math.query(idx,settings({observer:idx.byKey.get('10').position,radiusPc:0}));
  assert.equal(r.insideA,1);assert.equal(r.selected.longitudeDeg,null);
});
test('overlap membership checks the third dimension, not projected coincidence',()=>{
  const idx=math.buildIndex({'1':{r:0,e:90,d:2},'2':{r:0,e:-90,d:2}});
  const r=math.query(idx,settings({radiusPc:3,sphereB:{center:[0,0,2],radiusPc:0.1}}));
  assert.equal(r.insideA,2);assert.equal(r.insideB,1);assert.equal(r.common,1);
});
test('shared-only filtering leaves full-registry ranks intact',()=>{
  const idx=math.buildIndex(fixture),r=math.query(idx,settings({sphereB:{center:[0,3,0],radiusPc:0.1},commonOnly:true}));
  assert.equal(r.rows.length,1);assert.equal(r.rows[0].key,'20');assert.equal(r.rows[0].localRank,2);
});
test('sphere relation handles disjoint, tangent, contained and coincident cases',()=>{
  const kind=(x,a,b)=>math.sphereRelation([0,0,0],a,[x,0,0],b).kind;
  assert.equal(kind(5,2,2),'DISJOINT');assert.equal(kind(4,2,2),'EXTERNAL_TANGENT');
  assert.equal(kind(3,2,2),'OVERLAPPING');assert.equal(kind(1,4,2),'CONTAINED');
  assert.equal(kind(2,4,2),'INTERNAL_TANGENT');assert.equal(kind(0,2,2),'COINCIDENT');
  assert.equal(kind(0,0,0),'COINCIDENT');assert.equal(kind(0,3,0),'CONTAINED');
});
test('common sphere membership is symmetric under swapping A and B',()=>{
  const idx=math.buildIndex(fixture),a=[0,0,0],b=[0,3,0];
  assert.equal(math.query(idx,settings({observer:a,radiusPc:4,sphereB:{center:b,radiusPc:3}})).common,
    math.query(idx,settings({observer:b,radiusPc:3,sphereB:{center:a,radiusPc:4}})).common);
});
test('harmonic and magnitude values never affect positions or ordering',()=>{
  const clone=JSON.parse(JSON.stringify(fixture));for(const x of Object.values(clone)){x.h=Infinity;x.m=-100;}
  assert.deepEqual(math.query(math.buildIndex(fixture),settings()),math.query(math.buildIndex(clone),settings()));
});
test('normalization and queries never mutate the registry',()=>{
  const before=JSON.stringify(fixture);const idx=math.buildIndex(fixture);math.query(idx,settings());assert.equal(JSON.stringify(fixture),before);
});
test('validation counts rejected records and identifies original distance-order reversals',()=>{
  const idx=math.buildIndex({'1':{r:0,e:0,d:3},'2':{r:0,e:0,d:2},'3':{r:0,e:0}});
  assert.equal(idx.audit.inputCount,3);assert.equal(idx.audit.validCount,2);assert.equal(idx.audit.rejectedCount,1);assert.equal(idx.audit.originalOrderDistanceReversals,1);
});
test('static frame never invents measurement epoch or certified navigation',()=>{
  assert.equal(math.FRAME.epoch,null);assert.equal(math.FRAME.navigationCertified,false);assert.equal(math.FRAME.provenance,'UNVERIFIED_LEGACY_REGISTRY');
});
test('straight-line preview fraction is bounded and not an orbit propagator',()=>{
  assert.deepEqual(math.previewStep([1,2,3],[5,10,15],0.5),[3,6,9]);
  assert.deepEqual(math.previewStep([1,2,3],[5,10,15],0),[1,2,3]);
  assert.deepEqual(math.previewStep([1,2,3],[5,10,15],1),[5,10,15]);
  for(const n of [-0.01,1.01,NaN])assert.throws(()=>math.previewStep([0,0,0],[1,2,3],n));
});
test('invalid observer, radius and table limits fail visibly',()=>{
  const idx=math.buildIndex(fixture);
  for(const s of [{observer:[0,0]},{observer:[0,0,NaN]},{radiusPc:-1},{radiusPc:Infinity},{offset:-1},{limit:0},{limit:201}])assert.throws(()=>math.query(idx,settings(s)));
});
test('100,000 SYNTHETIC test points: complete ranking with bounded render and table results',()=>{
  const raw={};for(let i=1;i<=100000;i++)raw[i]={r:i%360,e:(i%160)-80,d:i/1000};
  const idx=math.buildIndex(raw),r=math.query(idx,settings({radiusPc:101,selectedKey:'97006'}));
  assert.equal(idx.points.length,100000);assert.equal(r.insideA,100000);assert.equal(r.rows.length,50);assert.ok(r.renderPoints.length<=1500);
  assert.equal(r.selected.key,'97006');assert.equal(r.selected.localRank,97006);
  const second=math.query(idx,settings({radiusPc:101,offset:50}));assert.equal(second.rows[0].localRank,51);
});
test('unknown selected point is explicit rather than a guessed sky match',()=>{
  assert.equal(math.query(math.buildIndex(fixture),settings({selectedKey:'97006'})).selected,null);
});
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function workerEnvironment({status=200,body=JSON.stringify(fixture),headerLength=0,transportError=false}={}){
  const messages=[],calls=[];let emitted=false;
  const bytes=typeof body==='string'?new TextEncoder().encode(body):body;
  const context={console,URL,TextDecoder,Uint8Array,AbortController,setTimeout,clearTimeout,crypto:crypto.webcrypto,
    location:{href:'https://example.test/assets/sphere-worker.js',origin:'https://example.test'},
    postMessage:m=>messages.push(m),fetch:async(url,options)=>{
      calls.push({url,options});if(transportError)throw Error('network unavailable');
      return {ok:status>=200&&status<300,status,headers:{get:()=>headerLength?String(headerLength):null},
        body:{getReader:()=>({read:async()=>{if(emitted)return {done:true};emitted=true;return {done:false,value:bytes};},cancel:async()=>{}})}};
    }};
  context.self=context;vm.createContext(context);
  context.importScripts=file=>vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets',file),'utf8'),context);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/sphere-worker.js'),'utf8'),context);
  return {messages,calls,send:async data=>context.onmessage({data})};
}
test('worker makes no request until load; hashes exact bytes; queries locally afterward',async()=>{
  const w=workerEnvironment();assert.equal(w.calls.length,0);await w.send({type:'load'});
  assert.equal(w.calls.length,1);assert.equal(w.calls[0].url,'https://example.test/nodes.json');
  assert.equal(w.calls[0].options.credentials,'omit');assert.equal(w.calls[0].options.redirect,'error');
  const ready=w.messages.find(x=>x.type==='ready');assert.ok(ready);
  assert.equal(ready.audit.registrySha256,crypto.createHash('sha256').update(JSON.stringify(fixture)).digest('hex'));
  await w.send({type:'query',requestId:7,settings:settings()});
  assert.equal(w.messages.at(-1).type,'result');assert.equal(w.messages.at(-1).requestId,7);assert.equal(w.calls.length,1);
});
test('worker refuses queries before a complete valid load',async()=>{
  const w=workerEnvironment();await w.send({type:'query',requestId:3,settings:settings()});assert.equal(w.messages.at(-1).type,'error');assert.equal(w.messages.at(-1).requestId,3);
});
test('worker records unavailable source without ready state',async()=>{
  for(const options of [{status:403},{status:503},{transportError:true}]){
    const w=workerEnvironment(options);await w.send({type:'load'});assert.equal(w.messages.at(-1).type,'error');assert.equal(w.messages.some(x=>x.type==='ready'),false);
  }
});
test('worker rejects oversized responses before accepting data',async()=>{
  const w=workerEnvironment({headerLength:65*1024*1024});await w.send({type:'load'});assert.match(w.messages.at(-1).message,/64 MiB/);
});
test('worker does not treat HTML or malformed UTF-8 as a registry',async()=>{
  for(const body of ['<html>sign in</html>',new Uint8Array([0xff,0xff])]){
    const w=workerEnvironment({body});await w.send({type:'load'});assert.equal(w.messages.at(-1).type,'error');assert.equal(w.messages.some(x=>x.type==='ready'),false);
  }
});
test('worker does not reload or silently replace an existing registry',async()=>{
  const w=workerEnvironment();await w.send({type:'load'});await w.send({type:'load'});
  assert.equal(w.messages.at(-1).type,'error');assert.equal(w.calls.length,1);
});
