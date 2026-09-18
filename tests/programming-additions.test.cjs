'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('tools/programming-additions.json'));
const source=read('index.html'),published=read('_site/index.html');
const begin='// BEGIN OWNER PROGRAMMING ADDITIONS V1\n';
const end='// END OWNER PROGRAMMING ADDITIONS V1\n\n';
function catalog(html){
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
 const hash=script.match(/function hashText\(t\)\{[^\n]+/)[0];
 const itemId=script.match(/function itemId\(url\)\{[^\n]+/)[0];
 const ids=script.match(/const programIds=[^\n]+/)[0];
 const ctx={};vm.createContext(ctx);
 vm.runInContext(script.slice(0,script.indexOf('const player='))+'\n'+hash+'\n'+itemId+'\n'+ids+'\nglobalThis.result={categories,programIds};',ctx,{timeout:5000});
 return JSON.parse(JSON.stringify(ctx.result));
}
const base=catalog(source),live=catalog(published);
function fileKey(url){return decodeURIComponent(new URL(url).pathname).replace(/^\/(?:download\/|\d+\/items\/)/,'');}
const all=live.categories.flatMap(c=>c.content);
test('published supplement appends exactly 107 entries and preserves all 26 channel definitions',()=>{
 assert.equal(manifest.entries.length,107);assert.equal(live.categories.length,26);
 assert.equal(base.categories.reduce((n,c)=>n+c.content.length,0),5534);
 assert.equal(all.length,5641);
 for(let i=0;i<26;i++){
  const b=base.categories[i],c=live.categories[i],extra=manifest.entries.filter(e=>e.channel===i+1).map(({n,u})=>({n,u}));
  assert.deepEqual({...c,content:[]},{...b,content:[]});
  assert.deepEqual(c.content.slice(0,b.content.length),b.content);
  assert.deepEqual(c.content.slice(b.content.length),extra);
 }
});
test('every existing shared program ID remains unchanged and new IDs are unique within each channel',()=>{
 for(let i=0;i<26;i++){
  assert.deepEqual(live.programIds[i].slice(0,base.programIds[i].length),base.programIds[i]);
  assert.equal(new Set(live.programIds[i]).size,live.programIds[i].length);
 }
});
test('new programming is not duplicated under Archive.org host aliases',()=>{
 const existing=new Set(base.categories.flatMap(c=>c.content.map(r=>fileKey(r.u))));
 const added=manifest.entries.map(r=>fileKey(r.u));
 assert.equal(new Set(added).size,107);
 for(const key of added)assert.equal(existing.has(key),false,key);
});
test('all six exact directly supplied URLs occur once in the published player',()=>{
 assert.equal(manifest.exact_supplied_urls.length,6);
 for(const u of manifest.exact_supplied_urls)assert.equal(all.filter(r=>r.u===u).length,1,u);
 assert.match(manifest.exact_supplied_urls[0],/^https:\/\/dn720300\.ca\.archive\.org\/0\/items\//);
 assert.match(manifest.exact_supplied_urls[1],/^https:\/\/ia601801\.us\.archive\.org\/1\/items\//);
 assert.match(manifest.exact_supplied_urls[2],/the%20twilight%20zone-S2E1-colorized-720p-hd\.mp4$/);
 assert.match(manifest.exact_supplied_urls[5],/The%20Longest%20Day\/mp4\/The\.Longest\.Day\.1962\.mp4$/);
});
test('Twilight Zone stays in numerical season/episode order with the listed E27 variant explicit',()=>{
 const rows=live.categories[3].content.slice(base.categories[3].content.length);
 assert.equal(rows.length,104);
 const actual=rows.map(r=>{
  const m=r.n.match(/S(\d+)E(\d+)/);assert.ok(m,r.n);
  assert.match(decodeURIComponent(r.u),new RegExp(`s0?${Number(m[1])}e0?${Number(m[2])}(?:v2)?[ .-]`,'i'));
  return [Number(m[1]),Number(m[2]),/alternate v2/.test(r.n)];
 });
 const expected=[];
 for(let e=0;e<=36;e++)expected.push([1,e,false]);
 for(let e=1;e<=29;e++){expected.push([2,e,false]);if(e===27)expected.push([2,e,true]);}
 for(let e=1;e<=37;e++)expected.push([3,e,false]);
 assert.deepEqual(actual,expected);
 assert.match(rows[0].n,/Original Pilot/);
 assert.ok(rows.slice(37).every(r=>r.n.includes('Colorized')));
 assert.match(rows.find(r=>r.n.includes('alternate v2')).u,/s2e27v2-colorized-720p-hd\.mp4$/);
});
test('the three films use the selected existing video channels without touching Channel 24',()=>{
 const movies=live.categories[2].content.slice(base.categories[2].content.length);
 assert.deepEqual(movies.map(r=>r.n),['The Man Who Saw Tomorrow (1981)','The Longest Day (1962)']);
 const driveIn=live.categories[11].content.slice(base.categories[11].content.length);
 assert.deepEqual(driveIn.map(r=>r.n),['Earth vs. the Flying Saucers (Color)']);
 assert.deepEqual(live.categories[23],base.categories[23]);
});
test('published page changes only by declared data block and pre-existing fan hooks',()=>{
 assert.equal(published.split(begin).length,2);assert.equal(published.split(end).length,2);
 const withoutData=published.split(begin)[0]+published.split(end)[1];
 const withoutFan=withoutData.replace('<a id="fan-mode" href="fan.html" title="Vintage-style fan sound tuner">FAN</a>','').replace('<script defer src="assets/fan-host.js"></script>\n','');
 assert.equal(withoutFan,source);
 assert.ok(published.indexOf(begin)<published.indexOf('const categories = ['));
 for(const row of manifest.entries){assert.equal(new URL(row.u).protocol,'https:');assert.match(new URL(row.u).pathname,/\.mp4$/);}
 assert.deepEqual(manifest.source_lists.map(x=>x.mp4_entries),[37,30,37]);
});
function python(code){const result=spawnSync('python3',['-c',`import importlib.util,json,pathlib,tempfile,copy\ns=importlib.util.spec_from_file_location('prep','tools/prepare_site.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)\nsource=pathlib.Path('index.html').read_text(); manifest=json.loads(pathlib.Path('tools/programming-additions.json').read_text())\n${code}`],{cwd:root,encoding:'utf8'});assert.equal(result.status,0,result.stderr);}
test('programming insertion is idempotent and never rewrites the source',()=>python(`
original=pathlib.Path('index.html').read_bytes()
with tempfile.TemporaryDirectory() as d:
 p=pathlib.Path(d);(p/'index.html').write_text(source)
 m.add_programming(p);first=(p/'index.html').read_bytes();m.add_programming(p)
 assert (p/'index.html').read_bytes()==first
assert pathlib.Path('index.html').read_bytes()==original
`));
test('bad schema, channel, URL and duplicate Archive file aliases fail validation',()=>python(`
def rejects(data):
 try:m.programming_block(data,source)
 except ValueError:return
 raise AssertionError('Invalid data was accepted')
rejects({'schema_version':99,'entries':manifest['entries']})
for key,value in [('channel',27),('channel',True),('n',''),('u','https://example.org/a.mp4'),('u','https://archive.org/download/test/a.mkv')]:
 bad=copy.deepcopy(manifest);bad['entries'][0][key]=value;rejects(bad)
bad=copy.deepcopy(manifest);clone=copy.deepcopy(bad['entries'][0]);clone['u']='https://archive.org/download/the-twilight-zone-1959-s-01-e-00-original-pilot/The%20Twilight%20Zone%201959%20S01E00%20Original%20Pilot.mp4';bad['entries'].append(clone);rejects(bad)
`));
test('HTML delimiters inside data are escaped instead of becoming markup',()=>python(`
data=copy.deepcopy(manifest);data['entries'][0]['n']='</script><script>alert(1)</script>'
block=m.programming_block(data,source)
assert '</script>' not in block and '<script>' not in block
assert r'\\u003c' in block
`));
test('missing catalog anchor and malformed boundaries fail without modifying the page',()=>python(`
for text in ['missing anchor',source+m.PROGRAMMING_END,source+m.PROGRAMMING_BEGIN]:
 with tempfile.TemporaryDirectory() as d:
  p=pathlib.Path(d);page=p/'index.html';page.write_text(text)
  try:m.add_programming(p)
  except ValueError:pass
  else:raise AssertionError('Bad anchor accepted')
  assert page.read_text()==text
`));
