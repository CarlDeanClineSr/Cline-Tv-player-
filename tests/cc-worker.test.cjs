// Explicitly synthetic worker integration test; no network or physical sensor.
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
test('worker preserves harmonic reference across recentering without a position lock',async()=>{
  const records={'1':{r:0,e:0,d:2,h:5.3735},'2':{r:90,e:0,d:3,h:5.3735}};
  const bytes=new TextEncoder().encode(JSON.stringify(records)),messages=[];let emitted=false;
  const ctx={URL,TextDecoder,Uint8Array,AbortController,setTimeout,clearTimeout,crypto:crypto.webcrypto,
    location:{href:'https://example.test/assets/sphere-worker.js',origin:'https://example.test'},
    postMessage:m=>messages.push(m),fetch:async()=>({ok:true,headers:{get:()=>null},body:{getReader:()=>({
      read:async()=>{if(emitted)return {done:true};emitted=true;return {done:false,value:bytes};},cancel:async()=>{}
    })}})};
  ctx.self=ctx;vm.createContext(ctx);
  ctx.importScripts=f=>vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets',f),'utf8'),ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/sphere-worker.js'),'utf8'),ctx);
  await ctx.onmessage({data:{type:'load'}});assert.equal(messages.at(-1).type,'ready');
  const settings={observer:[0,0,0],radiusPc:10,selectedKey:'1'};
  await ctx.onmessage({data:{type:'query',requestId:1,settings}});
  let r=messages.at(-1).result;assert.equal(r.rows[0].key,'1');assert.equal(r.legacySignature.value,5.3735);
  assert.equal(r.legacySignature.exactValueMatchCount,2);assert.equal(r.legacySignature.navigationLock,false);
  settings.observer=[0,2.5,0];await ctx.onmessage({data:{type:'query',requestId:2,settings}});
  r=messages.at(-1).result;assert.equal(r.rows[0].key,'2');assert.equal(r.legacySignature.value,5.3735);
  assert.equal(r.legacySignature.unit,null);assert.equal(r.legacySignature.navigationLock,false);
});
