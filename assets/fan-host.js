/* Add a reversible FAN view to the prepared TV page; the catalog is untouched. */
(function(){
'use strict';
function init(){
 const nav=document.querySelector('.site-nav'),button=document.getElementById('fan-mode'),cabinet=document.getElementById('cabinet'),tube=document.querySelector('.glass-tube');
 if(!nav||!button||!cabinet||!tube||typeof window.cancelSession!=='function'||typeof window.choose!=='function')return;
 let frame=null,mode=false,remember=null,oldFocus=null;
 const tv=nav.querySelector('a[href="index.html"]'),originalChoose=window.choose;
 const style=document.createElement('style');style.textContent=`
 #cabinet.fan-active{grid-template-columns:minmax(0,1fr)}
 #cabinet.fan-active>.right-panel{display:none!important}
 #cabinet.fan-active .glass-tube{width:100%!important;max-width:none!important;height:min(82dvh,780px);min-height:570px;aspect-ratio:auto;align-self:stretch}
 #cabinet.fan-active #player,#cabinet.fan-active #audio-player,#cabinet.fan-active #audio-stage,#cabinet.fan-active #crt-overlay,#cabinet.fan-active #static-overlay,#cabinet.fan-active #osd{display:none!important}
 #fan-frame{position:absolute;inset:0;width:100%;height:100%;border:0;z-index:90;background:#080e0d}
 #fan-page-dim{position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:10000}
 #fan-page-dark{position:fixed;inset:0;width:100%;height:100%;background:#000;border:0;border-radius:0;color:#464c47;font:12px system-ui;z-index:10001;cursor:pointer}
 #fan-mode[aria-current="page"]{color:#edc87e;border-color:#bb985d}
 @media(max-width:670px){#cabinet.fan-active .glass-tube{min-height:620px;height:82dvh}}
 @media(max-height:550px) and (min-width:671px){#cabinet.fan-active .glass-tube{min-height:470px;height:90dvh}}
 `;document.head.appendChild(style);
 const dim=document.createElement('div');dim.id='fan-page-dim';dim.hidden=true;
 const dark=document.createElement('button');dark.id='fan-page-dark';dark.type='button';dark.textContent='Tap anywhere to wake · sound continues';dark.setAttribute('aria-label','Wake the display without stopping the fan');dark.hidden=true;
 cabinet.append(dim,dark);
 function wake(){dark.hidden=true;try{frame?.contentWindow.ClineFanPanel?.wakeDisplay();}catch{}button.focus();}
 dark.addEventListener('click',wake);
 function stopFrame(){try{frame?.contentWindow.ClineFanPanel?.dispose();}catch{}if(frame){frame.remove();frame=null;}}
 function leave(resume){if(!mode)return;mode=false;stopFrame();dim.hidden=true;dark.hidden=true;dim.style.opacity='0';cabinet.classList.remove('fan-active');button.removeAttribute('aria-current');tv?.setAttribute('aria-current','page');if(resume&&remember){const r=remember;originalChoose(r.ci,r.vi,{time:r.time,delay:false});}remember=null;oldFocus?.focus?.();}
 function open(event){event?.preventDefault();if(mode)return;oldFocus=document.activeElement;
  remember={ci:currentCategoryIndex,vi:currentVideoIndex,time:active()?(session.ready?validTime(session.media.currentTime):validTime(session.resume)):0};
  savePosition();cancelSession();mode=true;clearTimeout(osdTimeout);
  cabinet.classList.add('fan-active');button.setAttribute('aria-current','page');tv?.removeAttribute('aria-current');
  dim.hidden=false;
  frame=document.createElement('iframe');frame.id='fan-frame';frame.title='Cline fan sound tuner';frame.setAttribute('allow','autoplay; fullscreen; screen-wake-lock');frame.src='fan.html?embedded=1';tube.appendChild(frame);
  frame.addEventListener('load',()=>{try{frame.contentWindow.document.getElementById('play')?.focus();}catch{}});
 }
 button.addEventListener('click',open);
 tv?.addEventListener('click',event=>{if(mode){event.preventDefault();leave(true);}});
 // Shared links and existing tune/guide functions restore TV instead of playing behind the fan.
 window.choose=function(...args){if(mode)leave(false);return originalChoose.apply(this,args);};
 // A delayed native media play event must not resurrect TV/radio while the fan is visible.
 for(const id of ['player','audio-player'])document.getElementById(id)?.addEventListener('play',event=>{if(mode)event.target.pause();});
 window.addEventListener('message',event=>{
  if(!mode||!frame||event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.type!=='cline-fan-v1')return;
  const {action,value}=event.data;
  if(action==='tv')leave(true);
  else if(action==='dim'){const n=Number(value);if(Number.isFinite(n))dim.style.opacity=String(1-Math.max(5,Math.min(100,n))/100);}
  else if(action==='dark'){dark.hidden=false;dark.focus();}
  else if(action==='wake')dark.hidden=true;
 });
 document.addEventListener('keydown',event=>{if(mode&&event.key==='Escape'){if(!dark.hidden)wake();else if(!document.fullscreenElement)leave(true);}});
 window.addEventListener('pagehide',()=>leave(false));
 window.ClineFanHost={open,close:()=>leave(true),isOpen:()=>mode,fullscreen:async()=>{if(document.fullscreenElement)await document.exitFullscreen();else if(cabinet.requestFullscreen)await cabinet.requestFullscreen();else throw Error('Full screen unavailable');}};
}
if(document.readyState==='complete')init();else window.addEventListener('load',init,{once:true});
})();
