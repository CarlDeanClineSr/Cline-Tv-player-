const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const {FanSound,normalize,presets}=require('../assets/fan-audio.js');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const tag='<script defer src="assets/fan-host.js"></script>\n';
const button='<a id="fan-mode" href="fan.html" title="Vintage-style fan sound tuner">FAN</a>';
test('published player preserves every source byte outside declared programming additions and FAN hooks',()=>{
 const page=read('_site/index.html').replace(/\/\/ BEGIN OWNER PROGRAMMING ADDITIONS V1\n[\s\S]*?\/\/ END OWNER PROGRAMMING ADDITIONS V1\n\n/,'');
 assert.equal(page.replace(button,'').replace(tag,''),read('index.html'));
 assert.match(read('_site/index.html'),/>TV<\/a><a id="fan-mode"[^>]*>FAN<\/a><a href="navigator.html"/);
});
test('all fan assets exist in prepared publication and parse',()=>{
 for(const name of ['fan-audio.js','fan-host.js','fan-ui.js','fan-noise-worklet.js']){
  assert.equal(read('_site/assets/'+name),read('assets/'+name));new vm.Script(read('assets/'+name));
 }
 assert.equal(read('_site/fan.html'),read('fan.html'));
});
test('build integration is idempotent and missing navigation stops preparation',()=>{
 const code=`import importlib.util,tempfile,pathlib\ns=importlib.util.spec_from_file_location('prep','tools/prepare_site.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)\np=pathlib.Path('_site');before=(p/'index.html').read_bytes();m.add_fan_mode(p);assert (p/'index.html').read_bytes()==before\nwith tempfile.TemporaryDirectory() as d:\n p=pathlib.Path(d);(p/'assets').mkdir()\n for f in ('fan.html','assets/fan-host.js','assets/fan-audio.js','assets/fan-ui.js','assets/fan-noise-worklet.js'):(p/f).write_text('test')\n (p/'index.html').write_text('<body>missing anchor</body>')\n try:m.add_fan_mode(p)\n except ValueError:pass\n else:raise AssertionError('missing anchor was silently accepted')\n`;
 const result=spawnSync('python3',['-c',code],{cwd:root,encoding:'utf8'});assert.equal(result.status,0,result.stderr);
});
test('sound settings are bounded and malformed storage has safe defaults',()=>{
 assert.equal(normalize(null).volume,25);assert.equal(normalize().tone,44);
 const s=normalize({tone:-100,hum:1000,volume:'bad',light:0,airTone:Infinity,speed:2.7});
 assert.equal(s.tone,30);assert.equal(s.hum,100);assert.equal(s.volume,25);assert.equal(s.light,5);assert.equal(s.airTone,340);assert.equal(s.speed,3);
 for(const p of Object.values(presets))assert.ok(p.tone>=30&&p.tone<=90);
});
test('constructing the synthesizer is silent and does not create an AudioContext',()=>{
 const s=new FanSound();assert.equal(s.ctx,null);assert.equal(s.playing,false);assert.equal(s.deadline,null);
});
function automation(){const events=[];const gain={value:.1,cancelScheduledValues(t){events.push(['cancel',t]);},setValueAtTime(v,t){events.push(['set',v,t]);},linearRampToValueAtTime(v,t){events.push(['ramp',v,t]);}};const s=new FanSound();s.ctx={currentTime:10};s.master={gain};s.playing=true;s.settings=normalize({volume:50});return {s,events};}
test('volume starts smoothly, is bounded, and sleep fade is scheduled on the audio clock',()=>{
 const {s,events}=automation();s.setTimer(30);assert.equal(s.deadline,1810);
 assert.ok(events.some(e=>e[0]==='ramp'&&e[1]===0&&e[2]===1810));
 assert.ok(events.some(e=>e[0]==='set'&&e[2]===1800));
 assert.ok(events.filter(e=>['ramp','set'].includes(e[0])).every(e=>e[1]>=0&&e[1]<=.65));
});
test('adjusting volume preserves sleep deadline; final fade cannot become a late burst',()=>{
 const {s,events}=automation();s.setTimer(1);const end=s.deadline;s.settings.volume=100;s.scheduleVolume();assert.equal(s.deadline,end);
 s.ctx.currentTime=end-5;events.length=0;s.scheduleVolume();assert.deepEqual(events.at(-1),['ramp',0,end]);
 s.ctx.currentTime=end;s.scheduleVolume();assert.equal(s.playing,false);assert.deepEqual(events.at(-1),['set',0,end]);
});
test('continuous mode cancels prior sleep automation and disabled sound ramps to zero',()=>{
 const {s,events}=automation();s.setTimer(30);s.setTimer(0);assert.equal(s.deadline,null);s.playing=false;s.scheduleVolume();assert.deepEqual(events.at(-1),['ramp',0,10.25]);
});
test('noise worklet maintains finite continuous outputs without sample loop reset',()=>{
 let Processor;vm.runInNewContext(read('assets/fan-noise-worklet.js'),{AudioWorkletProcessor:class{},registerProcessor(name,c){assert.equal(name,'cline-fan-noise');Processor=c;}});
 const n=new Processor(),pink=new Float32Array(128),white=new Float32Array(128);let energy=0;
 for(let block=0;block<500;block++){assert.equal(n.process([],[[pink],[white]]),true);for(const v of pink){assert.ok(Number.isFinite(v)&&Math.abs(v)<2);energy+=v*v;}}
 assert.ok(energy>1);assert.notEqual(n.seed,0x51f15e);
});
test('host validates message source and origin and cancels TV session before fan display',()=>{
 const host=read('assets/fan-host.js');assert.match(host,/event.source!==frame.contentWindow/);assert.match(host,/event.origin!==location.origin/);assert.match(host,/savePosition\(\);cancelSession\(\)/);
 assert.match(host,/ClineFanPanel\?\.dispose/);assert.match(host,/originalChoose\(r.ci,r.vi,\{time:r.time,delay:false\}\)/);
});
test('interface explicitly labels synthesis, has no autoplay, and exposes dim and stop controls',()=>{
 const html=read('fan.html');assert.match(html,/Synthesized fan-like sound, not an original Penney’s recording/);
 assert.match(html,/id="dark"/);assert.match(html,/id="play"/);assert.match(html,/id="volume"/);
 assert.doesNotMatch(html,/<(?:audio|video)[^>]*autoplay/);
 const ui=read('assets/fan-ui.js');assert.match(ui,/localStorage.setItem/);assert.match(ui,/sound.stop\(true\)/);assert.match(ui,/volume=Math.min\(settings.volume,50\)/);
});
