const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function script(file){return fs.readFileSync(path.join(root,file),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];}
class Element extends EventTarget{
    constructor(){super();this.style={};this.attributes={};this.children=[];this.value='';this.hidden=false;this.open=false;this.paused=true;this.ended=false;this.currentTime=0;this.duration=600;this.volume=.7;this.muted=false;this.loads=0;this.plays=0;this.textContent='';this.classList={add(){},remove(){},contains(){return false},toggle(){}};}
    appendChild(e){this.children.push(e);return e;}
    append(...es){this.children.push(...es);}
    replaceChildren(...es){this.children=es;}
    setAttribute(k,v){this.attributes[k]=String(v);}
    removeAttribute(k){delete this.attributes[k];if(k==='src')this.src='';}
    focus(){} select(){} showModal(){this.open=true;} close(){this.open=false;}
    pause(){this.paused=true;}
    load(){this.loads++;this.currentTime=0;}
    play(){this.plays++;this.paused=false;return this.playError?Promise.reject(this.playError):Promise.resolve();}
    fire(name){this.dispatchEvent(new Event(name));}
}
function environment(file,{saved=null,hash='',blocked=false,fetcher}={}){
    const elements=new Map();const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
    get('volume-knob').value='0.7';get('guide-channel').value='all';
    let next=0;const timers=new Map(),storage=new Map();if(saved!==null)storage.set('cline-tv-v171',saved);
    const document=new EventTarget();Object.assign(document,{getElementById:get,createElement:()=>new Element(),createDocumentFragment:()=>new Element(),hidden:false});
    const window=new EventTarget();
    const location={href:'https://example.org/Cline-Tv-player-/'+file+hash,hash};
    const context={console,document,window,location,history:{replaceState(_a,_b,url){location.href=url;location.hash=new URL(url).hash;}},navigator:{},URL,URLSearchParams,AbortController,Event,Map,Set,Math,Date,performance:{now:()=>0},localStorage:{getItem(k){if(blocked)throw Error('denied');return storage.get(k)??null;},setItem(k,v){if(blocked)throw Error('denied');storage.set(k,v);}},setTimeout(fn,ms){timers.set(++next,{fn,ms});return next;},clearTimeout(id){timers.delete(id);},requestAnimationFrame(){return 1;},cancelAnimationFrame(){},fetch:fetcher||(()=>Promise.reject(Error('unexpected request')))};
    vm.createContext(context);vm.runInContext(script(file),context,{filename:file});
    return{context,get,timers,storage,run:code=>vm.runInContext(code,context),fireTimer(ms){const entry=[...timers.entries()].find(([,t])=>t.ms===ms);assert.ok(entry,`timer ${ms} exists`);timers.delete(entry[0]);entry[1].fn();}};
}
test('catalog parses, has usable URLs and unique selection IDs within channels',()=>{
    const e=environment('index.html');
    assert.ok(e.run('categories.length')>0);
    assert.ok(e.run('categories.every(c=>c.content.length && c.content.every(i=>typeof i.n==="string" && new URL(i.u).protocol==="https:"))'));
    assert.ok(e.run('programIds.every(ids=>ids.length===new Set(ids).size)'));
    assert.ok(e.run('categories.every((c,ci)=>c.content.every((item,vi)=>parseSelection("#"+new URLSearchParams({ch:c.name,program:programIds[ci][vi]})).vi===vi))'));
});
test('guide searches the real catalog and selecting a result plays it',()=>{
    const e=environment('index.html');e.context.window.onload();e.get('guide-search').value='menagerie';e.run('renderGuide()');
    const buttons=e.get('guide-results').children[0].children;assert.equal(buttons.length,4);
    buttons[1].fire('click');assert.match(e.get('now-title').textContent,/Menagerie Pt II/);
    e.get('guide-search').value='no-such-show-938284';e.run('renderGuide()');assert.equal(e.get('guide-count').textContent,'No matching programs.');
});
test('channel return and reload preserve program, time, favorites and volume',()=>{
    const e=environment('index.html');e.context.window.onload();e.run('choose(0,15,{delay:false})');
    e.get('player').fire('loadedmetadata');e.get('player').currentTime=123;e.get('player').fire('playing');
    e.run('toggleFavorite(); changeVolume(0.3); choose(2,5,{delay:false})');
    e.run('choose(0,15,{delay:false})');e.get('player').fire('loadedmetadata');assert.equal(e.get('player').currentTime,123);
    e.get('player').fire('playing');
    const reloaded=environment('index.html',{saved:e.storage.get('cline-tv-v171')});reloaded.context.window.onload();reloaded.get('player').fire('loadedmetadata');
    assert.equal(reloaded.run('currentVideoIndex'),15);assert.equal(reloaded.get('player').currentTime,123);assert.equal(reloaded.get('player').volume,.3);assert.equal(reloaded.get('favorite').attributes['aria-pressed'],'true');
});
test('shared selection/time overrides saved state, and invalid links are rejected',()=>{
    const e=environment('index.html');const id=e.run('programIds[2][8]');
    const shared=environment('index.html',{hash:`#ch=3&program=${id}&t=42`,saved:JSON.stringify({lastChannel:'1'})});shared.context.window.onload();shared.get('player').fire('loadedmetadata');
    assert.equal(shared.run('currentCategoryIndex'),2);assert.equal(shared.run('currentVideoIndex'),8);assert.equal(shared.get('player').currentTime,42);
    assert.equal(shared.run('parseSelection("#ch=99&program=missing")'),false);
    shared.run('shareSelection()');assert.match(shared.get('share-url').value,/#ch=3&program=.*&t=42$/);
});
test('old retries and rapid tuning cannot reload or skip the new selection',()=>{
    const e=environment('index.html');e.context.window.onload();e.get('player').fire('error');
    const stale=[...e.timers.values()].find(t=>t.ms===4000).fn;
    e.run('choose(2,4,{delay:false})');const loads=e.get('player').loads;stale();assert.equal(e.get('player').loads,loads);assert.equal(e.run('currentVideoIndex'),4);
    e.run('tune(1)');const staleTransition=[...e.timers.values()].find(t=>t.ms===350).fn;e.run('tune(1)');staleTransition();e.fireTimer(350);
    assert.equal(e.run('currentVideoIndex'),6);assert.equal(e.get('player').src,e.run('categories[2].content[6].u'));
});
test('blocked autoplay keeps a visible play instruction; buffering and retries stay visible',async()=>{
    const e=environment('index.html');e.get('player').playError=Object.assign(Error('blocked'),{name:'NotAllowedError'});e.context.window.onload();await Promise.resolve();
    assert.equal(e.get('resume-play').hidden,false);assert.match(e.get('playback-status').textContent,/Tap to play/);assert.match(e.get('osd').textContent,/Tap to play/);
    e.get('player').playError=null;e.run('resumeCurrent()');e.get('player').fire('waiting');assert.match(e.get('osd').textContent,/Buffering/);
    e.get('player').fire('error');assert.equal([...e.timers.values()].filter(t=>t.ms===4000).length,1);e.get('player').fire('error');assert.equal([...e.timers.values()].filter(t=>t.ms===4000).length,1);
});
test('ended advances across channel boundaries and records completion',()=>{
    const e=environment('index.html');e.run('choose(0,categories[0].content.length-1,{delay:false})');e.get('player').fire('loadedmetadata');e.get('player').ended=true;e.get('player').fire('ended');
    assert.equal(e.run('currentCategoryIndex'),1);assert.equal(e.run('currentVideoIndex'),0);assert.equal(JSON.parse(e.storage.get('cline-tv-v171')).channels['1'].time,0);
});
test('radio uses the audio player, remembers its position, and stops when tuning to TV',()=>{
    const e=environment('index.html');e.context.window.onload();
    const ci=e.run('categories.findIndex(c=>c.kind==="audio")');assert.ok(ci>=0);
    e.run(`choose(${ci},0,{delay:false})`);
    const audio=e.get('audio-player'),video=e.get('player');
    assert.equal(video.paused,true);assert.equal(video.style.display,'none');
    assert.equal(audio.src,e.run(`categories[${ci}].content[0].u`));assert.equal(audio.paused,false);
    audio.fire('loadedmetadata');audio.currentTime=97;audio.fire('playing');
    e.run('changeVolume(0.4); choose(0,0,{delay:false})');
    assert.equal(audio.paused,true);assert.equal(video.style.display,'block');
    e.run(`choose(${ci},0,{delay:false})`);audio.fire('loadedmetadata');
    assert.equal(audio.currentTime,97);assert.equal(audio.volume,.4);
    audio.ended=true;audio.fire('ended');e.fireTimer(350);
    assert.equal(e.run('currentVideoIndex'),1);
    assert.equal(audio.src,e.run(`categories[${ci}].content[1].u`));
});
test('blocked or malformed browser storage does not prevent playback',()=>{
    for(const opts of [{blocked:true},{saved:'{bad'},{saved:'{"channels":null,"favorites":3,"volume":99}'},{saved:'{"channels":{"1":null},"lastChannel":"1"}'}]){const e=environment('index.html',opts);e.context.window.onload();assert.ok(e.get('player').src);}
});
test('navigator normalizes the real compact schema without changing values or URL',()=>{
    const e=environment('navigator.html');const data=JSON.parse(fs.readFileSync(path.join(root,'nodes.json')));e.context.record=data['1'];
    assert.equal(e.run('normaliseNode(record).id'),data['1'].i);assert.equal(e.run('normaliseNode(record).visual_url'),data['1'].u);assert.equal(e.run('normaliseNode(record).dec'),0);
});
test('prepared registry sections reconstruct every original node exactly',()=>{
    const source=JSON.parse(fs.readFileSync(path.join(root,'nodes.json'))),dir=path.join(root,'_site/nodes');
    const m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'))),all={};
    for(const bucket of m.chunks){const chunk=JSON.parse(fs.readFileSync(path.join(dir,`${bucket}.json`)));assert.ok(Object.keys(chunk).length<=m.chunkSize);for(const id of Object.keys(chunk))assert.equal(Math.floor((Number(id)-1)/m.chunkSize),bucket);Object.assign(all,chunk);}
    assert.deepEqual(all,source);assert.equal(m.count,Object.keys(source).length);assert.ok(fs.statSync(path.join(dir,'0.json')).size<250000);
});
test('navigator fetches just manifest and requested section, and shows actual values',async()=>{
    const calls=[];const e=environment('navigator.html',{fetcher:async url=>{calls.push(url);return{ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'_site',url)))};}});
    e.get('nodeInput').value='1001';await e.run('lookupNode()');assert.deepEqual(calls,['nodes/manifest.json','nodes/1.json']);
    assert.equal(e.get('telemetryScreen').children[0].children[1].textContent,'NODE-00001001-T1');
    e.get('nodeInput').value='1002';await e.run('lookupNode()');assert.equal(calls.length,2);
    e.get('nodeInput').value='-1';await e.run('lookupNode()');assert.match(e.get('telemetryScreen').children[0].textContent,/whole node/);
});
test('navigator ignores an older lookup response',async()=>{
    let resolveFirst;const e=environment('navigator.html',{fetcher:async url=>({ok:true,json:()=>url==='nodes/0.json'?new Promise(resolve=>{resolveFirst=resolve;}):Promise.resolve(url.includes('manifest')?{chunkSize:1000,maxId:2000,chunks:[0,1]}:{'1001':{i:'NEW',u:'https://example.org'}})})});
    e.run('manifest={chunkSize:1000,maxId:2000,chunks:[0,1]}');e.get('nodeInput').value='1';const old=e.run('lookupNode()');await Promise.resolve();await Promise.resolve();
    e.get('nodeInput').value='1001';await e.run('lookupNode()');resolveFirst({'1':{i:'OLD'}});await old;assert.equal(e.get('telemetryScreen').children[0].children[1].textContent,'NEW');
});
test('four failed retries advance once and Start over explicitly resets time',()=>{
    const e=environment('index.html');e.context.window.onload();
    for(let i=0;i<4;i++){e.get('player').fire('error');e.fireTimer(4000);}
    e.get('player').fire('error');assert.match(e.get('playback-status').textContent,/moving to the next/);e.fireTimer(2000);e.fireTimer(350);assert.equal(e.run('currentVideoIndex'),1);
    e.get('player').fire('loadedmetadata');e.get('player').currentTime=100;e.run('restartProgram()');e.get('player').fire('loadedmetadata');assert.equal(e.get('player').currentTime,0);
});
