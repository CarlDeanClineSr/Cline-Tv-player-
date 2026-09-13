"""One-time, read-only public media inspection. Never modifies the catalog."""
import concurrent.futures as cf
import hashlib, json, re, shutil, subprocess, urllib.request, urllib.parse, urllib.error
from datetime import datetime, timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'_channel24_audit'; OUT.mkdir(exist_ok=True)
source=(ROOT/'index.html').read_bytes()
blob=hashlib.sha1(b'blob '+str(len(source)).encode()+b'\0'+source).hexdigest()
if blob!='8cecdf59432f20566aa0240bec558c3cc79ffaf1': raise RuntimeError('Unexpected index revision; stop before inspecting')
match=re.search(r'const ch24\s*=\s*(\[[\s\S]*?\]);',source.decode())
rows=json.loads(re.sub(r',\s*]$',']',match.group(1)))
(OUT/'index.original.html').write_bytes(source)
for folder in ['tests','assets','tools']:
 for path in (ROOT/folder).iterdir():
  if path.is_file() and path.suffix in ['.js','.cjs','.py'] and 'once' not in path.name:
   dest=OUT/'checkout'/folder/path.name; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(path,dest)
for name in ['navigator.html','sphere-navigator.html','package.json','nodes.json']:
 shutil.copy2(ROOT/name,OUT/'checkout'/name)
shutil.copy2(ROOT/'index.html',OUT/'checkout/index.html')
def safe(url):
 p=urllib.parse.urlsplit(url)
 if p.scheme!='https' or not (p.hostname=='archive.org' or p.hostname.endswith('.archive.org')): raise ValueError('Non-Archive destination')
 return url
class Redirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  safe(newurl);return super().redirect_request(req,fp,code,msg,headers,newurl)
opener=urllib.request.build_opener(Redirect)
def get(url,cap,headers=None):
 req=urllib.request.Request(safe(url),headers={'User-Agent':'Cline-TV-catalog-audit/1.0',**(headers or {})})
 with opener.open(req,timeout=20) as r:
  data=r.read(cap+1)
  if len(data)>cap and not headers: raise ValueError('Response over metadata cap')
  return data[:cap],r.status,r.geturl(),dict(r.headers)
def ref(row):
 parts=urllib.parse.urlsplit(row['u']).path.split('/',3)
 return parts[2],urllib.parse.unquote(parts[3])
items=sorted({ref(x)[0] for x in rows}|{'youtube-j64mtjMTfIE'})
def metadata(item):
 try:
  body,status,url,headers=get('https://archive.org/metadata/'+urllib.parse.quote(item),12*1024*1024)
  data=json.loads(body);(OUT/(item+'.metadata.json')).write_bytes(body)
  return item,{'http':status,'sha256':hashlib.sha256(body).hexdigest(),'data':data}
 except Exception as e:return item,{'error':str(e)}
meta=dict(cf.ThreadPoolExecutor(max_workers=3).map(metadata,items))
fields=['name','source','format','size','length','width','height','vcodec','acodec','original','private','md5','sha1']
summary=[]
for n,row in enumerate(rows,1):
 item,name=ref(row);entry=meta[item]; files=entry.get('data',{}).get('files',[])
 exact=next((f for f in files if f.get('name')==name),None)
 siblings=[f for f in files if f.get('original')==name or (Path(f.get('name','')).stem==Path(name).stem and f.get('name')!=name)]
 summary.append({'number':n,**row,'item':item,'file':name,'exact':{k:exact[k] for k in fields if k in exact} if exact else None,'alternatives':[{k:f[k] for k in fields if k in f} for f in siblings],'metadata_error':entry.get('error')})
(OUT/'catalog-metadata.json').write_text(json.dumps(summary,indent=2))
print('INDEX',blob,'CHANNEL24',len(rows),'ffprobe',shutil.which('ffprobe'),flush=True)
for item,entry in meta.items():
 d=entry.get('data',{});print('ITEM',item,'files',len(d.get('files',[])),'mediatype',d.get('metadata',{}).get('mediatype'),'error',entry.get('error'),flush=True)
for s in summary:
 if s['number'] in [1,2,4,10,11,12,13,14,53,103,104,105,106,990,1000,1055]:print('SELECTED',json.dumps(s),flush=True)
selected=[rows[n-1]['u'] for n in [1,2,4,10,11,12,13,14,53,103,104,105,106]]
selected.append('https://archive.org/download/youtube-j64mtjMTfIE/j64mtjMTfIE.mp4')
def probe(pair):
 n,url=pair;result={'url':url}
 try:
  body,status,final,headers=get(url,1024*1024,{'Range':'bytes=0-1048575'})
  p=OUT/f'prefix-{n}.bin';p.write_bytes(body)
  result.update(http=status,final_url=final,bytes=len(body),content_type=headers.get('Content-Type'),content_range=headers.get('Content-Range'),sha256=hashlib.sha256(body).hexdigest())
  if shutil.which('ffprobe'):
   cmd=['ffprobe','-v','error','-probesize','1000000','-analyzeduration','1000000','-show_entries','stream=index,codec_name,codec_type,width,height,pix_fmt:format=duration,format_name','-of','json',str(p)]
   r=subprocess.run(cmd,capture_output=True,text=True,timeout=20);result.update(probe_returncode=r.returncode,probe=json.loads(r.stdout or '{}'),probe_error=r.stderr[-1000:])
 except Exception as e:result['error']=str(e)
 print('PROBE',json.dumps(result),flush=True);return result
probes=list(cf.ThreadPoolExecutor(max_workers=3).map(probe,enumerate(selected)))
(OUT/'probes.json').write_text(json.dumps(probes,indent=2))
(OUT/'manifest.json').write_text(json.dumps({'checked_utc':datetime.now(timezone.utc).isoformat(),'source_blob':blob,'channel24_count':len(rows),'metadata_requests':len(items),'media_prefix_cap_each':1048576,'scope':'Metadata and capped public header inspection; no full program downloads; no catalog writes'},indent=2))
