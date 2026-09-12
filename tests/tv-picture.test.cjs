// Offline regression tests: browser events are simulated; no remote media fetched.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(process.env.TV_TEST_SOURCE||path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
class Element extends EventTarget{
    constructor(){super();Object.assign(this,{style:{},attributes:{},children:[],value:'',hidden:false,paused:true,ended:false,seeking:false,currentTime:0,duration:600,volume:.7,muted:false,readyState:0,videoWidth:0,videoHeight:0,playbackRate:1,textContent:'',loads:0});const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)};}
    appendChild(e){this.children.push(e);return e;} append(...e){this.children.push(...e);} replaceChildren(...e){this.children=e;}
    setAttribute(k,v){this.attributes[k]=String(v);} removeAttribute(k){delete this.attributes[k];if(k==='src')this.src='';}
    focus(){} select(){} showModal(){this.open=true;} close(){this.open=false;}
    pause(){this.paused=true;} load(){this.loads++;this.currentTime=0;}
    play(){this.paused=false;return this.playError?Promise.reject(this.playError):Promise.resolve();}
    fire(n){this.dispatchEvent(new Event(n));}
}
function env({hash='',saved=null,frames=false}={}){
    const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
    get('volume-knob').value='.7';get('guide-channel').value='all';
    const timers=new Map(),storage=new Map(),frameCallbacks=new Map();let clock=0,seq=0;
    if(saved!==null)storage.set('cline-tv-v171',saved);
    if(frames){get('player').requestVideoFrameCallback=fn=>{frameCallbacks.set(++seq,fn);return seq;};get('player').cancelVideoFrameCallback=id=>frameCallbacks.delete(id);}
    const document=new EventTarget();Object.assign(document,{hidden:false,getElementById:get,createElement:()=>new Element(),createDocumentFragment:()=>new Element()});
    const window=new EventTarget(),location={href:'https://example.org/index.html'+hash,hash};
    const context={console,document,window,location,history:{replaceState(){}},navigator:{},URL,URLSearchParams,AbortController,Event,Map,Set,Math,Date,performance:{now:()=>clock},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},setTimeout(fn,ms){timers.set(++seq,{fn,ms});return seq;},clearTimeout:id=>timers.delete(id),requestAnimationFrame:()=>1,cancelAnimationFrame(){}};
    vm.createContext(context);vm.runInContext(source,context);
    const run=code=>vm.runInContext(code,context);
    function fireTimer(ms){const entry=[...timers.entries()].find(([,t])=>t.ms===ms);assert.ok(entry,`timer ${ms} must exist`);timers.delete(entry[0]);entry[1].fn();}
    function play(ci=23,vi=0){run(`choose(${ci},${vi},{time:0,delay:false})`);const m=run('session.media');m.readyState=4;m.fire('loadedmetadata');m.paused=false;m.fire('playing');return m;}
    function advance(seconds,{move=true}={}){for(let n=0;n<seconds*2;n++){clock+=500;const m=run('session?.media');if(m&&move&&!m.paused&&!m.seeking)m.currentTime+=.5*m.playbackRate;m?.fire('timeupdate');}}
    return{run,get,context,timers,storage,frameCallbacks,play,advance,fireTimer,setClock:x=>clock=x};
}
test('metadata with zero dimensions still restores saved position, volume and favorites',()=>{
    const e=env();e.run('choose(0,15,{delay:false})');const p=e.get('player');p.fire('loadedmetadata');p.currentTime=123;p.fire('playing');
    e.run('toggleFavorite();changeVolume(.3);choose(2,5,{delay:false});choose(0,15,{delay:false})');p.fire('loadedmetadata');assert.equal(p.currentTime,123);
    const next=env({saved:e.storage.get('cline-tv-v171')});next.context.window.onload();next.get('player').fire('loadedmetadata');
    assert.equal(next.get('player').currentTime,123);assert.equal(next.get('player').volume,.3);assert.equal(next.get('favorite').attributes['aria-pressed'],'true');
});
test('shared start time is applied even before video dimensions are known',()=>{
    const e=env(),id=e.run('programIds[2][8]');const shared=env({hash:`#ch=3&program=${id}&t=42`});shared.context.window.onload();shared.get('player').fire('loadedmetadata');
    assert.equal(shared.get('player').currentTime,42);assert.equal(shared.run('currentCategoryIndex'),2);
});
test('ended records completion and advances despite unsettled dimensions in metadata',()=>{
    const e=env();e.run('choose(0,categories[0].content.length-1,{delay:false})');e.get('player').fire('loadedmetadata');e.get('player').ended=true;e.get('player').fire('ended');
    assert.equal(e.run('currentCategoryIndex'),1);assert.equal(JSON.parse(e.storage.get('cline-tv-v171')).channels['1'].time,0);
});
test('radio-channel MP4 uses the existing scope; switching to TV stops radio',()=>{
    const e=env();const vi=e.run('categories[10].content.findIndex(i=>i.u.endsWith(".mp4"))');assert.ok(vi>=0);e.play(10,vi);
    assert.equal(e.run('session.media===audioPlayer'),true);assert.equal(e.get('audio-stage').classList.contains('active'),true);
    e.advance(20);assert.equal(e.run('currentCategoryIndex'),10);
    e.play(23,0);assert.equal(e.get('audio-player').paused,true);assert.equal(e.get('audio-stage').classList.contains('active'),false);
});
test('zero metadata dimensions alone do not reject an entry during loading',()=>{
    const e=env();e.run('choose(23,0,{delay:false})');e.get('player').fire('loadedmetadata');e.advance(30,{move:false});
    assert.equal(e.run('currentCategoryIndex'),23);assert.equal(e.run('session.rejecting'),false);assert.equal(e.run('session.ready'),true);
});
test('five advancing seconds without a picture skip once; playing cannot cancel the skip',()=>{
    const e=env({frames:true}),p=e.play();e.advance(4);assert.equal(e.run('session.rejecting'),false);e.advance(1);
    assert.equal(e.run('session.rejecting'),true);assert.equal(p.paused,true);assert.equal(e.get('audio-stage').classList.contains('active'),false);
    const timer=e.run('session.skipTimer');p.fire('playing');p.fire('error');assert.equal(e.run('session.skipTimer'),timer);assert.ok(e.timers.has(timer));
    e.fireTimer(700);e.fireTimer(350);assert.equal(e.run('currentVideoIndex'),1);assert.equal(e.run('session.media===player'),true);
});
test('late first decoded frame is accepted without discarding the program',()=>{
    const e=env({frames:true});e.play();e.advance(3);const fn=[...e.frameCallbacks.values()][0];fn(3000,{width:640,height:480});
    e.advance(10);assert.equal(e.run('session.pictureSeen'),true);assert.equal(e.run('currentVideoIndex'),0);assert.equal(e.run('session.rejecting'),false);
});
test('frame-capable browser must not accept dimensions alone as decoded video',()=>{
    const e=env({frames:true}),p=e.play();p.videoWidth=640;p.videoHeight=480;e.advance(5);assert.equal(e.run('session.rejecting'),true);
});
test('older browser falls back to dimensions after frame data are available',()=>{
    const e=env(),p=e.play();p.videoWidth=640;p.videoHeight=480;p.fire('loadeddata');e.advance(10);
    assert.equal(e.run('session.pictureSeen'),true);assert.equal(e.run('session.rejecting'),false);
});
test('non-dropped frame count confirms video; all-dropped frames do not',()=>{
    for(const dropped of [0,12]){const e=env(),p=e.play();p.videoWidth=640;p.videoHeight=480;p.getVideoPlaybackQuality=()=>({totalVideoFrames:12,droppedVideoFrames:dropped});e.advance(5);
        assert.equal(e.run('session.pictureSeen'),dropped===0);assert.equal(e.run('session.rejecting'),dropped===12);}
});
test('paused time is not counted as missing-picture playback',()=>{
    const e=env();const p=e.play();e.advance(2);p.pause();p.fire('pause');e.advance(60);assert.equal(e.run('session.pictureElapsed'),2);
    p.paused=false;p.fire('playing');e.advance(2);assert.equal(e.run('session.rejecting'),false);e.advance(1);assert.equal(e.run('session.rejecting'),true);
});
test('buffering does not spend the picture grace period',()=>{
    const e=env(),p=e.play();e.advance(2);p.readyState=1;p.fire('waiting');e.advance(60,{move:false});assert.equal(e.run('session.pictureElapsed'),2);
    p.readyState=4;p.fire('playing');e.advance(2);assert.equal(e.run('session.rejecting'),false);e.advance(1);assert.equal(e.run('session.rejecting'),true);
});
test('background-tab playback cannot cause a no-picture skip',()=>{
    const e=env();e.play();e.advance(2);e.context.document.hidden=true;e.context.document.dispatchEvent(new Event('visibilitychange'));e.advance(60);
    assert.equal(e.run('session.pictureElapsed'),2);e.context.document.hidden=false;e.context.document.dispatchEvent(new Event('visibilitychange'));e.get('player').fire('timeupdate');
    e.advance(2);assert.equal(e.run('session.rejecting'),false);
});
test('seek jump and delayed timer are not treated as five seconds of playback',()=>{
    const e=env(),p=e.play();p.seeking=true;p.fire('seeking');p.currentTime=500;e.advance(30);p.seeking=false;p.fire('timeupdate');assert.equal(e.run('session.pictureElapsed'),0);
    e.setClock(100000);p.currentTime+=60;p.fire('timeupdate');assert.equal(e.run('session.pictureElapsed'),0);
});
test('rapid tuning cancels the pending skip and stale callback cannot change new selection',()=>{
    const e=env();e.play();e.advance(5);const timer=e.run('session.skipTimer'),stale=e.timers.get(timer).fn;
    e.run('choose(2,4,{delay:false})');assert.equal(e.timers.has(timer),false);stale();assert.equal(e.run('currentCategoryIndex'),2);assert.equal(e.run('currentVideoIndex'),4);
});
test('frame callback from a previous source cannot validate the current source',()=>{
    const e=env({frames:true});e.play();const stale=[...e.frameCallbacks.values()][0];e.run('choose(23,1,{delay:false})');stale(0,{width:640,height:480});
    assert.equal(e.run('session.pictureSeen'),false);
});
test('retry cancels old frame and picture timers without disturbing the next source',()=>{
    const e=env({frames:true}),p=e.play();const oldFrame=e.run('session.frameRequest');p.fire('error');e.fireTimer(4000);
    assert.equal(e.frameCallbacks.has(oldFrame),false);assert.equal(e.run('session.retries'),1);assert.equal(e.run('currentVideoIndex'),0);
});
test('audio-only playing does not clear failure history; decoded video does',()=>{
    const e=env({frames:true});e.run('failedSelections.add("prior-failure")');e.run('choose(23,0,{delay:false,automatic:true})');const p=e.get('player');p.readyState=4;p.fire('loadedmetadata');p.fire('playing');
    assert.equal(e.run('failedSelections.has("prior-failure")'),true);const fn=[...e.frameCallbacks.values()][0];fn(0,{width:320,height:240});assert.equal(e.run('failedSelections.size'),0);
});
test('all-failed circuit stops instead of cycling forever',()=>{
    const e=env();e.play();e.run('categories.forEach((c,ci)=>c.content.forEach((_i,vi)=>failedSelections.add(selectionKey(ci,vi))))');e.advance(5);
    assert.equal(e.run('session.rejecting'),true);assert.equal(e.run('session.skipTimer'),null);assert.equal(e.get('retry-play').hidden,false);
});
test('blocked autoplay preserves the tap-to-play prompt and never skips',async()=>{
    const e=env();e.get('player').playError=Object.assign(Error('blocked'),{name:'NotAllowedError'});e.context.window.onload();await Promise.resolve();
    e.advance(30,{move:false});assert.equal(e.run('session.rejecting'),false);assert.equal(e.get('resume-play').hidden,false);assert.match(e.get('playback-status').textContent,/Tap to play/);
});
