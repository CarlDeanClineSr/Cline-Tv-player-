/* UI for static ship-centered map exploration. No observation acquisition or flight control. */
'use strict';
(function(){
  const el=id=>document.getElementById(id), math=SphereMath;
  let worker=null, ready=false, serial=0, result=null, audit=null, offset=0, b=null;
  const number=id=>{const text=el(id).value.trim();if(text==='')throw Error(`${id} needs a number`);return math.finite(Number(text),id);};
  const format=n=>n===null?'undefined':Number(n).toPrecision(9);
  const setStatus=text=>{el('status').textContent=text;};
  function position(){return ['x','y','z'].map(number);}
  function setPosition(v){v.forEach((n,i)=>el(['x','y','z'][i]).value=String(n));}
  function settings(){
    const key=el('target').value.trim();
    if(!/^[1-9]\d*$/.test(key)||!Number.isSafeInteger(Number(key)))throw Error('Choose a positive whole node number');
    return {observer:position(),radiusPc:math.radius(number('radius')),sphereB:b?{center:b.center,radiusPc:math.radius(number('b-radius'))}:null,
      selectedKey:key,commonOnly:el('common-only').checked,offset,limit:50};
  }
  function query(reset=true){
    if(!ready)return;
    try {if(reset)offset=0;const s=settings();result=null;selectedButtons(false);el('export').disabled=true;el('signature-detail').textContent='Pending selected-point lookup; no sensor lock.';draw();
      setStatus('Recomputing ranges and encounter order…');worker.postMessage({type:'query',requestId:++serial,settings:s});}
    catch(e){setStatus(e.message);}
  }
  function selectedButtons(ok){for(const id of ['center-target','pin-b','step'])el(id).disabled=!ok;}
  function reset(){
    if(worker)worker.terminate();worker=null;ready=false;serial++;result=null;audit=null;
    el('controls').disabled=true;el('load').disabled=false;el('cancel').disabled=true;el('rows').replaceChildren();
    for(const id of ['count-a','count-b','count-common'])el(id).textContent='—';
    el('audit').textContent='Not loaded.';el('target-detail').textContent='Load the map to select a point.';
    el('signature-detail').textContent='Not loaded. No sensor lock is available.';
    el('relation').textContent='No loaded geometry.';el('page-note').textContent='';draw();
  }
  el('load').addEventListener('click',()=>{
    reset();el('load').disabled=true;el('cancel').disabled=false;setStatus('Loading only this site’s existing registry…');
    try{
      worker=new Worker('assets/sphere-worker.js');
      worker.onerror=()=>{reset();setStatus('Map worker unavailable. Use HTTPS or a localhost web server. The original lookup is unchanged.');};
      worker.onmessage=({data})=>{
        if(data.type==='progress')setStatus(`Loading registry: ${(data.bytes/1e6).toFixed(2)} MB received. Cancel stops the transfer.`);
        if(data.type==='ready'){
          ready=true;audit=data.audit;el('controls').disabled=false;
          el('audit').textContent=`${audit.validCount.toLocaleString()} valid coordinates / ${audit.inputCount.toLocaleString()} records; ${audit.rejectedCount} excluded.\nOriginal node-order distance reversals: ${audit.originalOrderDistanceReversals}.\nSHA-256: ${audit.registrySha256}\nFrame/epoch: unverified / not supplied.\n${audit.rejectedSample.map(x=>`${x.key}: ${x.reason}`).join('\n')}`;
          el('audit').textContent+=`\nLegacy h: ${audit.legacySignatureSummary.finiteValueCount.toLocaleString()} finite values; ${audit.legacySignatureSummary.distinctStoredValues.toLocaleString()} distinct. Numerical metadata only.`;
          query();
        }
        if(data.type==='result'&&data.requestId===serial){result=data.result;audit=data.audit;render();setStatus('Geometry updated. Registry measurements remain unverified.');}
        if(data.type==='error'&&(data.requestId===undefined||data.requestId===serial)){
          if(!ready)reset();setStatus(`Stopped: ${data.message}`);
        }
      };
      worker.postMessage({type:'load'});
    }catch(e){reset();setStatus(e.message);}
  });
  el('cancel').addEventListener('click',()=>{reset();setStatus('Unloaded. No registry record was changed.');});
  el('position-form').addEventListener('submit',e=>{e.preventDefault();query();});
  el('target-form').addEventListener('submit',e=>{e.preventDefault();query();});
  el('origin').addEventListener('click',()=>{setPosition([0,0,0]);query();});
  for(const id of ['apply-radius','apply-b'])el(id).addEventListener('click',()=>query());
  el('common-only').addEventListener('change',()=>query());
  el('next-shell').addEventListener('click',()=>{if(result&&result.nextRangePc!==null){el('radius').value=String(result.nextRangePc);query();}});
  el('center-target').addEventListener('click',()=>{if(result?.selected){setPosition(result.selected.position);query();}});
  el('pin-b').addEventListener('click',()=>{if(result?.selected){b={center:result.selected.position.slice(),key:result.selected.key};query();}});
  el('clear-b').addEventListener('click',()=>{b=null;el('common-only').checked=false;query();});
  el('step').addEventListener('click',()=>{if(!result?.selected)return;try{setPosition(math.previewStep(position(),result.selected.position,number('fraction')));query();}catch(e){setStatus(e.message);}});
  el('previous').addEventListener('click',()=>{offset=Math.max(0,offset-50);query(false);});
  el('more').addEventListener('click',()=>{if(result&&offset+50<result.eligible){offset+=50;query(false);}});
  function render(){
    const r=result;
    el('count-a').textContent=r.insideA.toLocaleString();el('count-b').textContent=r.insideB.toLocaleString();el('count-common').textContent=r.common.toLocaleString();
    el('b-center').textContent=b?`Point ${b.key||'custom'}\nXYZ: ${b.center.map(format).join(', ')} pc`:'Not pinned.';
    el('relation').textContent=r.relation?`${r.relation.kind} · center separation ${format(r.relation.separationPc)} pc`:'No second sphere selected.';
    el('plot-note').textContent=`Drawing ${r.renderPoints.length.toLocaleString()} sampled points. Counts and ranks use all ${audit.validCount.toLocaleString()} valid coordinates. Visible overlap is not a localization measurement.`;
    const p=r.selected;selectedButtons(Boolean(p));
    el('target-detail').textContent=p?`POINT ${p.key} · ${p.id}\nLocal rank: ${p.localRank.toLocaleString()}\nRange: ${format(p.rangePc)} pc\nMap longitude: ${format(p.longitudeDeg)}°\nMap latitude: ${format(p.latitudeDeg)}°\nXYZ: ${p.position.map(format).join(', ')} pc\nOriginal RA/Dec: ${p.ra}°, ${p.dec}°\nDistance uncertainty: not supplied.`:'This point is absent or has invalid spatial coordinates.';
    const sig=r.legacySignature;
    el('signature-detail').textContent=sig?`Stored harmonic signature: ${sig.value===null?'not supplied':String(sig.value)}\nStatus: ${sig.state}\nQuantity / unit: not established\nInstrument / observation time / uncertainty: not supplied\nRows with this exact stored number: ${sig.exactValueMatchCount.toLocaleString()} (entire registry)\n${sig.otherMatchingPointSample.length?'Other point examples: '+sig.otherMatchingPointSample.join(', ')+'\n':''}Navigation lock: NOT EVALUATED — no sensor model.\nA matching number does not confirm a location.`:'No signature metadata available.';
    el('original-link').href=`navigator.html#node=${encodeURIComponent(el('target').value)}`;
    el('rows').replaceChildren();
    for(const row of r.rows){
      const tr=document.createElement('tr'),rank=document.createElement('td'),id=document.createElement('td'),range=document.createElement('td'),shared=document.createElement('td');
      rank.textContent=row.localRank.toLocaleString();const button=document.createElement('button');button.textContent=`POINT ${row.key}`;button.title=row.id;
      button.addEventListener('click',()=>{el('target').value=row.key;query(false);});id.appendChild(button);
      range.textContent=format(row.rangePc);shared.textContent=row.inB?'yes':'no';tr.append(rank,id,range,shared);el('rows').appendChild(tr);
    }
    if(!r.rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='No registered points match these spheres. This is not evidence of empty physical space.';tr.appendChild(td);el('rows').appendChild(tr);}
    el('page-note').textContent=r.eligible?`${offset+1}–${Math.min(offset+50,r.eligible)} of ${r.eligible.toLocaleString()}`:'0 matching points';
    el('previous').disabled=offset===0;el('more').disabled=offset+50>=r.eligible;el('next-shell').disabled=r.nextRangePc===null;el('export').disabled=false;
    draw();
  }
  function mapLink(){
    const s=settings(),p=new URLSearchParams({node:s.selectedKey,x:String(s.observer[0]),y:String(s.observer[1]),z:String(s.observer[2]),r:String(s.radiusPc)});
    if(b){p.set('bx',String(b.center[0]));p.set('by',String(b.center[1]));p.set('bz',String(b.center[2]));p.set('br',String(s.sphereB.radiusPc));}
    if(s.commonOnly)p.set('common','1');const u=new URL(location.href);u.hash=p.toString();return u.href;
  }
  el('share').addEventListener('click',async()=>{
    try{const input=el('share-url');input.value=mapLink();input.hidden=false;history.replaceState(null,'',input.value);
      try{await navigator.clipboard.writeText(input.value);setStatus('Map-state link copied. Opening it does not auto-download the registry.');}
      catch{input.focus();input.select();setStatus('Select and copy the map-state link.');}}
    catch(e){setStatus(e.message);}
  });
  el('export').addEventListener('click',()=>{
    if(!result)return;
    const snapshot={schema:'CLINE_SPHERICAL_GEOMETRY_V1_1',createdUtc:new Date().toISOString(),purpose:'STATIC_GEOMETRY_DEMONSTRATION_NOT_FLIGHT_GUIDANCE',
      registry:audit,settings:{...result},excludedModels:['proper motion','light time','aberration','gravity','trajectory dynamics','sensor localization','uncertainty propagation']};
    delete snapshot.settings.renderPoints;
    const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)+'\n'],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='cline-sphere-geometry.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  function draw(){
    const canvas=el('map'),ctx=canvas.getContext('2d');if(!ctx)return;
    const width=Math.max(200,canvas.clientWidth),height=canvas.clientHeight||430,dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=width*dpr;canvas.height=height*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);
    ctx.fillStyle='#aec0b5';ctx.font='12px monospace';ctx.fillText('3-D GEOMETRY / NOT A TELESCOPE IMAGE',14,22);
    if(!result)return;
    const r=result,observer=r.observer,yaw=Number(el('yaw').value)*Math.PI/180,pitch=Number(el('pitch').value)*Math.PI/180;
    const bound=Math.max(r.radiusPc,r.sphereB?math.distance(observer,r.sphereB.center)+r.sphereB.radiusPc:0,1e-6);
    const scale=.39*Math.min(width,height)/bound;
    function project(v){const [x,y,z]=v.map((n,i)=>n-observer[i]);const xx=x*Math.cos(yaw)-y*Math.sin(yaw),yy=x*Math.sin(yaw)+y*Math.cos(yaw);return [width/2+xx*scale,height/2-(yy*Math.sin(pitch)+z*Math.cos(pitch))*scale];}
    function sphere(center,rad,color){ctx.strokeStyle=color;ctx.lineWidth=1;
      for(let plane=0;plane<3;plane++){ctx.beginPath();for(let j=0;j<=96;j++){const v=center.slice(),theta=j*Math.PI/48;v[plane]+=rad*Math.cos(theta);v[(plane+1)%3]+=rad*Math.sin(theta);const p=project(v);j?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.stroke();}}
    sphere(observer,r.radiusPc,'#396b4d');if(r.sphereB)sphere(r.sphereB.center,r.sphereB.radiusPc,'#a37946');
    for(const p of r.renderPoints||[]){const xy=project(p.position);ctx.fillStyle=p.shared?'#ffbb66':'#6fe5a0';ctx.fillRect(xy[0]-1,xy[1]-1,2,2);}
    const c=project(observer);ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.moveTo(c[0]-7,c[1]);ctx.lineTo(c[0]+7,c[1]);ctx.moveTo(c[0],c[1]-7);ctx.lineTo(c[0],c[1]+7);ctx.stroke();ctx.fillStyle='#ffffff';ctx.fillText('CRAFT',c[0]+9,c[1]-9);
    if(r.sphereB){const p=project(r.sphereB.center);ctx.fillStyle='#ffbb66';ctx.fillText('B',p[0]+5,p[1]-7);}
    if(r.selected){const p=project(r.selected.position);if(p[0]>=0&&p[0]<width&&p[1]>=0&&p[1]<height){ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.arc(...p,5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffffff';ctx.fillText(r.selected.key,p[0]+8,p[1]+14);}}
    ctx.fillStyle='#aec0b5';ctx.fillText(`A radius ${format(r.radiusPc)} pc`,14,height-14);
  }
  for(const id of ['yaw','pitch'])el(id).addEventListener('input',draw);
  window.addEventListener('resize',draw);
  // URL is a requested map state only, never an authorization to load data.
  try{
    const p=new URLSearchParams(location.hash.slice(1));
    if(/^[1-9]\d*$/.test(p.get('node')||''))el('target').value=p.get('node');
    for(const [name,id] of [['x','x'],['y','y'],['z','z'],['r','radius'],['br','b-radius']]){
      const value=p.get(name);if(value!==null&&value.trim()!==''&&Number.isFinite(Number(value)))el(id).value=value;
    }
    if(['bx','by','bz'].every(k=>p.has(k)&&p.get(k).trim()!==''&&Number.isFinite(Number(p.get(k)))))b={center:['bx','by','bz'].map(k=>Number(p.get(k)))};
    el('common-only').checked=p.get('common')==='1'&&Boolean(b);
  }catch{}
  draw();
})();
