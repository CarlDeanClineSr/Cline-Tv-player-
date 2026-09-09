/* A dedicated worker keeps the 100k-point ordering off the interface thread. */
'use strict';
importScripts('sphere-math.js');
let index=null, audit=null, loading=false;
const MAX_BYTES=64*1024*1024;
async function loadRegistry() {
  if(loading || index) throw Error('Registry already loading or loaded. Cancel to reset.');
  loading=true;
  const abort=new AbortController(), timer=setTimeout(()=>abort.abort(),90000);
  try {
    const url=new URL('../nodes.json',self.location.href);
    if(url.origin!==self.location.origin) throw Error('Registry must be same-origin');
    const response=await fetch(url.href,{signal:abort.signal,credentials:'omit',redirect:'error',cache:'no-cache'});
    if(!response.ok) throw Error(`Registry HTTP ${response.status}`);
    const expected=Number(response.headers.get('Content-Length')||0);
    if(expected>MAX_BYTES) throw Error('Registry exceeds 64 MiB cap');
    const chunks=[];let received=0;
    const reader=response.body.getReader();
    while(true) {
      const {value,done}=await reader.read();if(done)break;
      received+=value.length;
      if(received>MAX_BYTES){await reader.cancel();throw Error('Registry exceeds 64 MiB cap');}
      chunks.push(value);postMessage({type:'progress',bytes:received});
    }
    const bytes=new Uint8Array(received);let at=0;
    for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const sha256=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
    index=SphereMath.buildIndex(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
    audit={...index.audit,registryBytes:received,registrySha256:sha256,sourceUrl:url.href,retrievedUtc:new Date().toISOString()};
    postMessage({type:'ready',audit});
  } finally {clearTimeout(timer);loading=false;}
}
self.onmessage=async function({data}) {
  try {
    if(data.type==='load') await loadRegistry();
    else if(data.type==='query') {
      if(!index) throw Error('Load the registry first');
      postMessage({type:'result',requestId:data.requestId,result:SphereMath.query(index,data.settings),audit});
    } else throw Error('Unknown map operation');
  } catch(e) {postMessage({type:'error',requestId:data.requestId,message:e.name==='AbortError'?'Registry download timed out. No data replaced.':e.message});}
};
