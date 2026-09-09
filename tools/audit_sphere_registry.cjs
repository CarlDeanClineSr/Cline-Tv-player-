/* Read-only inventory of the real registry. Never authenticates astronomical data. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const math=require('../assets/sphere-math.js');
const root=path.resolve(__dirname,'..'),bytes=fs.readFileSync(path.join(root,'nodes.json'));
const raw=JSON.parse(bytes),index=math.buildIndex(raw);
const report={...index.audit,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
  gitBlobSha1:crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),
  suppliedFields:[...new Set(Object.values(raw).flatMap(x=>Object.keys(x)))].sort(),
  sampledRecords:Object.fromEntries(['1','2','3','97004','97005','97006','97007','97008','100000'].filter(k=>raw[k]).map(k=>[k,raw[k]]))};
const output=path.join(root,'_site','sphere-registry-audit.json');fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
