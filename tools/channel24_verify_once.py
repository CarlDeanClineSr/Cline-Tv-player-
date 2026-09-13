"""Read-only verified-file selection, capped stream samples and public item discovery."""
import concurrent.futures as cf
import hashlib,json,struct,urllib.request,urllib.parse
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];IN=ROOT/'_channel24_audit';OUT=ROOT/'_channel24_verify';OUT.mkdir(exist_ok=True)
rows=json.loads((IN/'catalog-metadata.json').read_text());changes=[]
for r in rows:
 choices=[f for f in r['alternatives'] if f.get('format','').lower()=='h.264 ia' and f.get('original')==r['file'] and int(f.get('width',0))>0 and int(f.get('height',0))>0 and not f.get('private')]
 if choices:
  exact=[f for f in choices if f['name']==r['file'][:-4]+'.ia.mp4']
  choice=exact[0] if len(exact)==1 else min(choices,key=lambda f:int(f['size']))
  if abs(float(choice['length'])-float(r['exact']['length']))>max(2,float(r['exact']['length'])*.002):raise ValueError('Duration mismatch')
  changes.append({'number':r['number'],'n':r['n'],'old_url':r['u'],'new_url':'https://archive.org/download/'+r['item']+'/'+urllib.parse.quote(choice['name'],safe='/'),'file_metadata':choice,'item':r['item']})
(OUT/'proposed-replacements.json').write_text(json.dumps(changes,indent=2))
def safe(url):
 p=urllib.parse.urlsplit(url)
 if p.scheme!='https' or not(p.hostname=='archive.org' or p.hostname.endswith('.archive.org')):raise ValueError('Non-Archive destination')
 return url
class Redirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  safe(newurl);return super().redirect_request(req,fp,code,msg,headers,newurl)
def get(url,start,size):
 request=urllib.request.Request(safe(url),headers={'User-Agent':'Cline-TV-catalog-audit/1.0','Range':f'bytes={start}-{start+size-1}'})
 with urllib.request.build_opener(Redirect).open(request,timeout=25) as r:
  if r.status!=206 or not r.headers.get('Content-Range','').startswith(f'bytes {start}-'):raise ValueError('Range response required')
  body=r.read(size+1)
  if len(body)>size:raise ValueError('Range cap exceeded')
  return body,{'status':r.status,'final_url':r.geturl(),'content_range':r.headers.get('Content-Range'),'sha256':hashlib.sha256(body).hexdigest(),'bytes':len(body)}
def sample(task):
 key,url,start,size=task;res={'key':key,'url':url,'offset':start}
 try:
  body,info=get(url,start,size);filename=key+'.bin';(OUT/filename).write_bytes(body);res.update(info,path=filename)
 except Exception as e:res['error']=str(e)
 print('SAMPLE',json.dumps(res),flush=True);return res
tasks=[]
# Inspect complete front metadata and some packets, not entire movies.
for i in [1,10,11,12,13,14]:tasks.append((f'original-{i}',rows[i-1]['u'],0,8*1024*1024))
for i in [53,103,104,105,106]:
 raw=(IN/f'prefix-{[53,103,104,105,106].index(i)+8}.bin').read_bytes();pos=0
 while pos+16<=len(raw):
  size=int.from_bytes(raw[pos:pos+4],'big');tag=raw[pos+4:pos+8]
  if size==1:size=int.from_bytes(raw[pos+8:pos+16],'big')
  if tag==b'mdat':break
  if size<8:raise ValueError('Invalid atom')
  pos+=size
 offset=pos+size;length=int(rows[i-1]['exact']['size'])-offset
 if not 0<length<=8*1024*1024:raise ValueError('Tail metadata exceeds cap')
 tasks.append((f'original-tail-{i}',rows[i-1]['u'],offset,length))
for i in [10,11,12,13,14,53,103,104,105,106,250,500,750,980,994,995,996]:
 ch=next((c for c in changes if c['number']==i),None)
 if ch:tasks.append((f'replacement-{i}',ch['new_url'],0,8*1024*1024))
tasks.append(('user-catastrophe','https://archive.org/download/youtube-j64mtjMTfIE/j64mtjMTfIE.mp4',0,8*1024*1024))
results=list(cf.ThreadPoolExecutor(max_workers=4).map(sample,tasks));(OUT/'samples.json').write_text(json.dumps(results,indent=2))
searches={}
for label,q in [('cosmos','mediatype:movies AND title:("Cosmos" AND "Personal Voyage")'),('connections','mediatype:movies AND title:("Connections") AND (creator:("James Burke") OR description:("James Burke"))')]:
 url='https://archive.org/advancedsearch.php?'+urllib.parse.urlencode([('q',q),('fl[]','identifier'),('fl[]','title'),('rows','8'),('output','json')])
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Cline-TV-catalog-audit/1.0'})
  with urllib.request.urlopen(req,timeout=25) as response: body=response.read(2*1024*1024+1)
  if len(body)>2*1024*1024:raise ValueError('Search response cap')
  data=json.loads(body);searches[label]=data;print('DISCOVERY',label,json.dumps(data),flush=True)
 except Exception as e:searches[label]={'error':str(e)}
(OUT/'discovery.json').write_text(json.dumps(searches,indent=2))
print('Metadata-qualified replacements',len(changes),'Samples',len(results),flush=True)
