(function(){
'use strict';
const A=window.ClineFanAudio, sound=new A.FanSound(),key='cline-fan-v1',get=id=>document.getElementById(id);
const embedded=new URLSearchParams(location.search).get('embedded')==='1'&&parent!==window;
let settings=A.normalize(),minutes=0,busy=false,wakeLock=null,wakePending=false,disposed=false,lastError='';
try{const stored=JSON.parse(localStorage.getItem(key));if(stored&&typeof stored==='object'){settings=A.normalize(stored);minutes=[0,30,60,120,240].includes(stored.minutes)?stored.minutes:0;}}catch{/* Usable with storage blocked. */}
// Never reopen to a black display or unexpectedly loud saved setting.
settings.light=Math.max(25,settings.light);settings.volume=Math.min(settings.volume,50);
function tell(action,value){if(embedded)parent.postMessage({type:'cline-fan-v1',action,value},location.origin);}
function save(){try{localStorage.setItem(key,JSON.stringify({...settings,minutes}));}catch{/* Sound does not depend on storage. */}}
function setLight(){if(embedded)tell('dim',settings.light);else get('dim').style.opacity=String(1-settings.light/100);}
function refresh(){
 for(const name of Object.keys(A.limits)){
  const input=get(name);if(!input)continue;input.value=String(settings[name]);
  document.querySelector(`output[for="${name}"]`).textContent=settings[name]+(['tone','airTone'].includes(name)?' Hz':'%');
 }
 document.querySelectorAll('[data-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===settings.speed)));
 document.documentElement.style.setProperty('--turn',[0,'2.1s','1.6s','1.1s'][settings.speed]);
 get('timer').value=String(minutes);setLight();
}
function state(){
 const running=sound.playing&&sound.ctx?.state==='running';document.body.classList.toggle('running',running);
 get('play').textContent=busy?'Starting…':running?'Ⅱ Pause fan':sound.playing?'▶ Resume fan':'▶ Start fan';get('play').setAttribute('aria-pressed',String(running));
 if(disposed)return;
 let text='Ready · tap Start fan. Sound starts gently.';
 if(running){const left=sound.remaining();text=left===null?'Playing · continuous':`Playing · ${Math.ceil(left/60)} min remaining · fades out at end`;}
 else if(sound.playing)text='Audio paused by browser · tap Resume fan.';
 else if(sound.ctx)text='Fan paused · your settings are saved.';
 if(lastError)text=lastError;
 if(get('status').textContent!==text)get('status').textContent=text;
}
sound.onstate=state;
async function releaseWake(){const current=wakeLock;wakeLock=null;if(current)await current.release().catch(()=>{});get('wake-state').textContent='';}
async function updateWake(){
 if(!get('keep-awake').checked||!sound.playing||document.hidden||disposed){await releaseWake();return;}
 if(wakeLock||wakePending)return;
 if(!navigator.wakeLock){get('wake-state').textContent='(not supported)';return;}
 wakePending=true;try{const w=await navigator.wakeLock.request('screen');if(disposed||!sound.playing||!get('keep-awake').checked||document.hidden){await w.release();return;}wakeLock=w;get('wake-state').textContent='(active)';w.addEventListener('release',()=>{if(wakeLock===w){wakeLock=null;get('wake-state').textContent='(released)';}});}catch{get('wake-state').textContent='(unavailable)';}finally{wakePending=false;}
}
get('play').addEventListener('click',async()=>{
 if(busy)return;
 if(sound.playing&&sound.ctx?.state==='running'){sound.stop();await releaseWake();return;}
 lastError='';busy=true;state();
 try{await sound.start(settings,minutes);await updateWake();}catch(error){lastError=error.message||'Audio could not start. Tap Start again.';get('status').textContent=lastError;}finally{busy=false;get('play').textContent=sound.playing&&sound.ctx?.state==='running'?'Ⅱ Pause fan':'▶ Start fan';}
});
for(const name of Object.keys(A.limits)){const el=get(name);if(!el)continue;el.addEventListener('input',()=>{settings=A.normalize({...settings,[name]:el.value});sound.update(settings);refresh();save();});}
document.querySelectorAll('[data-speed]').forEach(b=>b.addEventListener('click',()=>{const speed=Number(b.dataset.speed);settings=A.normalize({...settings,...A.presets[speed],speed});sound.update(settings);refresh();save();}));
get('timer').addEventListener('change',()=>{minutes=Number(get('timer').value);sound.setTimer(minutes);save();state();});
get('reset').addEventListener('click',()=>{const {volume,light}=settings;settings=A.normalize({...A.presets[1],speed:1,volume,light});sound.update(settings);refresh();save();});
function wakeDisplay(){document.body.classList.remove('dark');get('dark-screen').hidden=true;if(embedded)tell('wake');get('dark').focus();}
get('dark').addEventListener('click',()=>{document.body.classList.add('dark');if(embedded)tell('dark');else{get('dark-screen').hidden=false;get('dark-screen').focus();}});
get('dark-screen').addEventListener('click',wakeDisplay);
get('keep-awake').addEventListener('change',updateWake);
document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('dark',document.hidden);void updateWake();state();});
get('back').addEventListener('click',event=>{if(embedded){event.preventDefault();tell('tv');}});
get('fullscreen').addEventListener('click',async()=>{try{if(embedded&&parent.ClineFanHost){await parent.ClineFanHost.fullscreen();return;}if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw Error('unsupported');}catch{get('status').textContent='Full screen is unavailable; all fan controls still work.';}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(document.body.classList.contains('dark'))wakeDisplay();else if(embedded)tell('tv');}});
const timer=setInterval(()=>{if(sound.tick())void releaseWake();state();},1000);
function dispose(){if(disposed)return;disposed=true;clearInterval(timer);sound.stop(true);void releaseWake();const close=()=>{if(sound.ctx&&sound.ctx.state!=='closed')void sound.ctx.close().catch(()=>{});};if(sound.ready)sound.ready.then(close,close);else close();}
window.addEventListener('pagehide',dispose);
window.ClineFanPanel={dispose,wakeDisplay,sound,getSettings:()=>({...settings})};
refresh();state();
})();
