"""Inspect publicly discovered Cosmos records and two listed Big Pacific copies."""
import concurrent.futures as cf
import json,hashlib,urllib.parse,urllib.request
from pathlib import Path
OUT=Path('_channel24_extra');OUT.mkdir(exist_ok=True)
def safe(url):
 p=urllib.parse.urlsplit(url)
 if p.scheme!='https' or not(p.hostname=='archive.org' or p.hostname.endswith('.archive.org')):raise ValueError('Unexpected host')
 return url
class Redirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  safe(newurl);return super().redirect_request(req,fp,code,msg,headers,newurl)
def get(url,cap,partial=False):
 req=urllib.request.Request(safe(url),headers={'User-Agent':'Cline-TV-catalog-audit/1.0',**({'Range':f'bytes=0-{cap-1}'} if partial else {})})
 with urllib.request.build_opener(Redirect).open(req,timeout=30) as r:
  if partial and (r.status!=206 or not r.headers.get('Content-Range','').startswith('bytes 0-')):raise ValueError('Expected range response')
  body=r.read(cap+1)
  if len(body)>cap:raise ValueError('Response exceeds cap')
  return body,{'status':r.status,'final_url':r.geturl(),'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'content_range':r.headers.get('Content-Range')}
for item in ['CosmosAPersonalVoyage','Cosmos_Personal_Voyage']:
 try:
  body,info=get('https://archive.org/metadata/'+item,8*1024*1024);(OUT/(item+'.metadata.json')).write_bytes(body)
  data=json.loads(body);videos=[f for f in data.get('files',[]) if f.get('name','').lower().endswith('.mp4') and not f.get('private')]
  print('FILES',item,json.dumps(videos),flush=True)
 except Exception as e:print('METADATA_ERROR',item,str(e),flush=True)
# Prefer the first discovered complete episode collection for preview samples.
p=OUT/'CosmosAPersonalVoyage.metadata.json';tasks=[]
if p.exists():
 d=json.loads(p.read_bytes()); fs=[f for f in d.get('files',[]) if f.get('name','').lower().endswith('.mp4') and not f.get('private') and float(f.get('length') or 0)>1800]
 for n,f in enumerate(fs[:30]):tasks.append((f'cosmos-{n}','https://archive.org/download/CosmosAPersonalVoyage/'+urllib.parse.quote(f['name'],safe='/'),f))
for n,name in enumerate(['Big Pacific S1E5 - Behind The Scenes.ia.mp4','PBS Big Pacific S1E5 - Behind The Scenes.ia.mp4']):
 tasks.append((f'big-pacific-14-{n}','https://archive.org/download/pbsnovadocs/'+urllib.parse.quote(name),None))
def sample(task):
 key,url,meta=task;r={'key':key,'url':url,'metadata':meta}
 try:
  body,info=get(url,8*1024*1024,True);file=key+'.bin';(OUT/file).write_bytes(body);r.update(info,path=file)
 except Exception as e:r['error']=str(e)
 print('SAMPLE',json.dumps({k:v for k,v in r.items() if k!='metadata'}),flush=True);return r
res=list(cf.ThreadPoolExecutor(max_workers=4).map(sample,tasks));(OUT/'samples.json').write_text(json.dumps(res,indent=2))
