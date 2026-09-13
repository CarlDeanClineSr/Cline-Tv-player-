/* Cline Fan v1: artistic fan-like synthesis, not an acoustic reconstruction of an OEM fan. */
(function(root){
'use strict';
const limits={tone:[30,90,44],hum:[0,100,42],air:[0,100,62],airTone:[100,1600,340],box:[0,100,35],hiss:[0,100,10],volume:[0,100,25],light:[5,100,100],speed:[1,3,1]};
const presets={1:{tone:44,hum:42,air:62,airTone:340,box:35,hiss:10},2:{tone:57,hum:48,air:70,airTone:560,box:40,hiss:15},3:{tone:72,hum:55,air:78,airTone:860,box:45,hiss:22}};
function normalize(input={}){if(!input||typeof input!=='object')input={};const out={};for(const[k,[lo,hi,d]]of Object.entries(limits)){const n=Number(input[k]);out[k]=input[k]!==null&&input[k]!==''&&Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):d;}out.speed=Math.round(out.speed);return out;}
const here=typeof document!=='undefined'?new URL('.',document.currentScript.src):null;
class FanSound {
 constructor(){this.ctx=null;this.master=null;this.playing=false;this.settings=normalize();this.deadline=null;this.stopTask=null;this.sequence=0;this.ready=null;this.onstate=()=>{};this.sources=[];this.mode='';}
 async prepare(){
  if(this.ready)return this.ready;
  const AC=root.AudioContext||root.webkitAudioContext;if(!AC)throw Error('Web Audio is not available in this browser.');
  this.ctx=new AC();
  // Resume is called during the user's tap, before any module download.
  const resume=this.ctx.resume();
  this.ready=(async()=>{
   const c=this.ctx;
   this.master=c.createGain();this.master.gain.value=0;
   this.bus=c.createGain();
   this.cut=c.createBiquadFilter();this.cut.type='highpass';this.cut.frequency.value=20;this.cut.Q.value=.6;
   this.boxFilter=c.createBiquadFilter();this.boxFilter.type='peaking';this.boxFilter.frequency.value=110;this.boxFilter.Q.value=.65;
   const top=c.createBiquadFilter();top.type='lowpass';top.frequency.value=7500;top.Q.value=.5;
   const ceiling=c.createWaveShaper(),curve=new Float32Array(4097);
   for(let i=0;i<curve.length;i++)curve[i]=.85*Math.tanh(2*(i/(curve.length-1)*2-1));
   ceiling.curve=curve;ceiling.oversample='2x';
   this.bus.connect(this.cut);this.cut.connect(this.boxFilter);this.boxFilter.connect(top);top.connect(ceiling);ceiling.connect(this.master);this.master.connect(c.destination);
   this.motorGain=c.createGain();this.motorGain.gain.value=0;this.motorGain.connect(this.bus);
   this.motor=c.createOscillator();this.motor.type='sine';this.motor.connect(this.motorGain);this.motor.start();this.sources.push(this.motor);
   this.rumbleGain=c.createGain();this.rumbleGain.gain.value=0;this.rumbleGain.connect(this.bus);
   this.rumble=c.createOscillator();this.rumble.type='sine';this.rumble.connect(this.rumbleGain);this.rumble.start();this.sources.push(this.rumble);
   this.harmonicGain=c.createGain();this.harmonicGain.gain.value=0;this.harmonicGain.connect(this.bus);
   this.harmonic=c.createOscillator();this.harmonic.type='sine';this.harmonic.connect(this.harmonicGain);this.harmonic.start();this.sources.push(this.harmonic);
   this.airFilter=c.createBiquadFilter();this.airFilter.type='lowpass';this.airFilter.Q.value=.5;
   this.airGain=c.createGain();this.airGain.gain.value=0;this.airFilter.connect(this.airGain);this.airGain.connect(this.bus);
   this.hissFilter=c.createBiquadFilter();this.hissFilter.type='highpass';this.hissFilter.frequency.value=2200;this.hissFilter.Q.value=.5;
   this.hissGain=c.createGain();this.hissGain.gain.value=0;this.hissFilter.connect(this.hissGain);this.hissGain.connect(this.bus);
   try{
    if(!c.audioWorklet||!root.AudioWorkletNode)throw Error('Worklet unavailable');
    await c.audioWorklet.addModule(new URL('fan-noise-worklet.js',here).href);
    this.noise=new AudioWorkletNode(c,'cline-fan-noise',{numberOfInputs:0,numberOfOutputs:2,outputChannelCount:[1,1]});
    this.noise.connect(this.airFilter,0);this.noise.connect(this.hissFilter,1);this.mode='continuous noise';
   }catch{
    // Compatibility fallback: long independent loops, colored by native filters.
    const rnd=()=>Math.random()*2-1;
    for(const[seconds,target]of [[19,this.airFilter],[23,this.hissFilter]]){
     const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*seconds),c.sampleRate),data=buffer.getChannelData(0);
     for(let i=0;i<data.length;i++)data[i]=rnd();
     const source=c.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(target);source.start();this.sources.push(source);
    }
    this.mode='compatibility noise loops';
   }
   c.onstatechange=()=>this.onstate();
   await resume;
  })().catch(async error=>{await this.ctx.close().catch(()=>{});this.ctx=null;this.ready=null;this.master=null;this.sources=[];throw error;});
  return this.ready;
 }
 target(param,value){param.setTargetAtTime(value,this.ctx.currentTime,.12);}
 update(input){this.settings=normalize(input);if(!this.master)return;const s=this.settings;
  this.target(this.motor.frequency,s.tone);this.target(this.rumble.frequency,Math.max(24,s.tone/2));this.target(this.harmonic.frequency,s.tone*2);
  this.target(this.motorGain.gain,.075*s.hum/100);this.target(this.rumbleGain.gain,.05*s.hum/100);this.target(this.harmonicGain.gain,.023*s.hum/100);
  this.target(this.airFilter.frequency,s.airTone);this.target(this.airGain.gain,.72*s.air/100);this.target(this.hissGain.gain,.06*s.hiss/100);
  this.target(this.boxFilter.gain,6*s.box/100);this.scheduleVolume();
 }
 scheduleVolume(){
  if(!this.master)return;const now=this.ctx.currentTime,p=this.master.gain;
  p.cancelScheduledValues(now);p.setValueAtTime(p.value,now);
  const level=this.playing?.65*Math.pow(this.settings.volume/100,1.35):0;
  if(!this.playing){p.linearRampToValueAtTime(0,now+.25);return;}
  if(this.deadline!==null&&this.deadline<=now){p.setValueAtTime(0,now);this.playing=false;this.onstate();return;}
  const remaining=this.deadline===null?Infinity:this.deadline-now;
  if(remaining<=10){p.linearRampToValueAtTime(0,this.deadline);return;}
  p.linearRampToValueAtTime(level,now+.4);
  if(this.deadline!==null){p.setValueAtTime(level,this.deadline-10);p.linearRampToValueAtTime(0,this.deadline);}
 }
 async start(input,minutes=0){const ticket=++this.sequence;clearTimeout(this.stopTask);await this.prepare();if(ticket!==this.sequence)return false;await this.ctx.resume();if(ticket!==this.sequence)return false;if(this.ctx.state!=='running')throw Error('Audio is paused by the browser. Tap Start again.');this.playing=true;this.deadline=null;this.update(input);this.setTimer(minutes);this.onstate();return true;}
 stop(immediate=false){++this.sequence;this.playing=false;this.deadline=null;clearTimeout(this.stopTask);if(this.master){this.scheduleVolume();if(immediate){this.master.gain.cancelScheduledValues(this.ctx.currentTime);this.master.gain.setValueAtTime(0,this.ctx.currentTime);void this.ctx.suspend().catch(()=>{});}else{const ticket=this.sequence;this.stopTask=setTimeout(()=>{if(ticket===this.sequence&&!this.playing&&this.ctx)void this.ctx.suspend().catch(()=>{});},300);}}this.onstate();}
 setTimer(minutes){const m=Number(minutes);this.deadline=this.playing&&Number.isFinite(m)&&m>0?this.ctx.currentTime+Math.min(m,480)*60:null;this.scheduleVolume();}
 remaining(){return this.deadline===null?null:Math.max(0,this.deadline-this.ctx.currentTime);}
 tick(){if(this.playing&&this.deadline!==null&&this.ctx.currentTime>=this.deadline){this.stop();return true;}return false;}
}
root.ClineFanAudio={FanSound,normalize,presets,limits};
if(typeof module!=='undefined')module.exports=root.ClineFanAudio;
})(typeof window!=='undefined'?window:globalThis);
