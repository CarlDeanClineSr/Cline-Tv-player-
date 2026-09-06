// Dependency-free development preview; never needed by GitHub Pages visitors.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),args=process.argv.slice(2);
const value=(flag,fallback)=>args.includes(flag)?args[args.indexOf(flag)+1]:fallback;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css; charset=utf-8'};
http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://preview').pathname);}catch{res.writeHead(400).end();return;}
 if(pathname==='/')pathname='/index.html';
 if(pathname==='/_preview'){
  const q=new URL(req.url,'http://preview').searchParams;
  const w=Math.min(2560,Math.max(320,Number(q.get('w'))||390)),h=Math.min(1440,Math.max(320,Number(q.get('h'))||844));
  let html=fs.readFileSync(path.join(__dirname,'responsive-preview.html'),'utf8').replace('width="390" height="844"',`width="${w}" height="${h}"`).replace('390 × 844 CSS pixels',`${w} × ${h} CSS pixels`);
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(html);return;
 }
 const file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)||pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(403).end();return;}
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(file).pipe(res);
 });
}).listen(Number(value('--port',4173)),value('--host','0.0.0.0'),()=>console.log('Classic TV preview ready'));
