// Offline source-selection regressions. Metadata evidence is not a full-media playback certification.
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const report=JSON.parse(fs.readFileSync(path.join(root,'tools/channel24-media-repair.json'),'utf8'));
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const hashFunction=script.match(/function hashText\(t\)\{[^\n]+/)[0];
const idFunction=script.match(/function itemId\(url\)\{[^\n]+/)[0];
const idLine=script.match(/const programIds=[^\n]+/)[0];
const ctx={URL,URLSearchParams};vm.createContext(ctx);
vm.runInContext(script.slice(0,script.indexOf('const player='))+ '\n'+hashFunction+'\n'+idFunction+'\n'+idLine+'\nglobalThis.catalog=categories;globalThis.ids=programIds;',ctx);
const channel=JSON.parse(JSON.stringify(ctx.catalog[23])),rows=channel.content;
const expectedOriginalHash='9459df4cdc885e77275493e92a3e347f4423e3f73e73955cdd5bf8361d4d5d09';
test('Channel 24 remains TV; all 26 channel definitions and radio modes remain',()=>{
 assert.equal(ctx.catalog.length,26);assert.equal(channel.kind,'video');assert.equal(channel.name,'24');
 assert.deepEqual(Array.from(ctx.catalog.filter(c=>c.kind==='audio'),c=>c.name),['11','14','15','16','17','18','25']);
});
test('repair accounts for every source swap, without removing original programs',()=>{
 assert.equal(report.changes.length,831);assert.equal(report.removed_programs,0);assert.equal(report.additions.length,13);
 assert.equal(new Set(report.changes.map(c=>c.original_number)).size,831);
 assert.equal(rows.length,1068);
});
test('all replacement programs preserve their original IDs and names',()=>{
 for(const c of report.changes){const r=rows[c.original_number-1];assert.equal(r.n,c.title);assert.equal(r.u,c.new_url);assert.equal(r.id,c.preserved_id_base);
 assert.equal(r.id,vm.runInContext(`itemId(${JSON.stringify(c.old_url)})`,ctx));assert.equal(ctx.ids[23][c.original_number-1],r.id+'-1');}
});
test('original lineup can be reconstructed exactly: no lost or renamed shows',()=>{
 const reconstructed=rows.slice(0,1055).map(r=>({...r}));
 for(const c of report.changes){const r=reconstructed[c.original_number-1];r.u=c.old_url;delete r.id;}
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(reconstructed)).digest('hex'),expectedOriginalHash);
});
test('each ordinary replacement is a listed H264 derivative of the same original file',()=>{
 for(const c of report.changes){assert.equal(new URL(c.new_url).protocol,'https:');assert.equal(new URL(c.new_url).hostname,'archive.org');assert.ok(c.width>0&&c.height>0&&c.duration_seconds>0);assert.match(c.provider_sha1,/^[0-9a-f]{40}$/);
 if(c.reason==='LISTED_H264_DERIVATIVE'){assert.equal(c.format.toLowerCase(),'h.264 ia');assert.equal(c.original_file,decodeURIComponent(new URL(c.old_url).pathname.split('/').slice(3).join('/')));assert.ok(c.file.endsWith('.ia.mp4'));}
 else {assert.equal(c.reason,'USER_SUPPLIED_SAME_TITLE_VIDEO');assert.equal(c.original_number,103);}
 }
});
test('Big Pacific 10 through 14 keep episode order and use the actual .ia.mp4 files',()=>{
 for(let number=10;number<=14;number++){const r=rows[number-1];assert.ok(r.n.includes(`S1E${number-9}`));assert.match(decodeURIComponent(r.u),/Big Pacific S1E[1-5] - .*\.ia\.mp4$/);}
});
test('Catastrophe is repaired at 103 and Blueprints remains the correct program at 105',()=>{
 assert.equal(rows[102].u,'https://archive.org/download/youtube-j64mtjMTfIE/j64mtjMTfIE.mp4');
 assert.match(rows[104].n,/Blueprints in the Bloodstream/);assert.match(decodeURIComponent(rows[104].u),/Blueprints in the Bloodstream\.ia\.mp4$/);
});
test('13 Cosmos additions are appended in episode order with verified video metadata',()=>{
 for(let i=0;i<13;i++){const a=report.additions[i],r=rows[1055+i];assert.equal(a.episode,i+1);assert.equal(a.number,1056+i);assert.equal(r.n,a.n);assert.equal(r.u,a.u);assert.equal(a.source_item,'CosmosAPersonalVoyage');assert.equal(a.format.toLowerCase(),'h.264 ia');assert.equal(a.verified_codec,'h264 / aac');assert.match(a.prefix_sha256,/^[0-9a-f]{64}$/);}
});
test('source changes do not create duplicate links or duplicate shared program IDs',()=>{
 assert.equal(new Set(rows.map(r=>r.u)).size,rows.length);assert.equal(new Set(ctx.ids[23]).size,rows.length);
});
