"""Offline, checksum-locked Channel 24 repair from the saved source inspections."""
from pathlib import Path
import json,re,hashlib,urllib.parse
ROOT=Path(__file__).resolve().parents[1]
def sha(data):return hashlib.sha256(data).hexdigest()
def blob(data):return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
def base36(n):
 digits='0123456789abcdefghijklmnopqrstuvwxyz';out=''
 while n:out=digits[n%36]+out;n//=36
 return out or '0'
def legacy_id(url):
 def h(text):
  state=2166136261
  for c in text:state=((state^ord(c))*16777619)&0xffffffff
  return state
 if not url.isascii():raise ValueError('Non-ASCII URL requires JS UTF16 handling')
 return base36(h(url))+'-'+base36(h(url[::-1]))
def parse_block(text):
 m=re.search(r'const ch24\s*=\s*(\[[\s\S]*?\]);',text)
 if m is None:raise ValueError('Missing Channel 24')
 return m,json.loads(re.sub(r',\s*]$',']',m.group(1)))
def repair(source,meta_dir,choices,extras):
 if blob(source)!='8cecdf59432f20566aa0240bec558c3cc79ffaf1':raise ValueError('Source changed; re-review required')
 text=source.decode();m,rows=parse_block(text)
 if len(rows)!=1055:raise ValueError('Unexpected original count')
 original=json.loads(json.dumps(rows));changes=[];metas={}
 for c in choices:
  n=c['number'];old=rows[n-1]
  if old['u']!=c['old_url'] or old['n']!=c['n']:raise ValueError('Wrong row')
  item=c['item']
  if item not in metas:metas[item]=json.loads((meta_dir/(item+'.metadata.json')).read_bytes())
  files={f['name']:f for f in metas[item]['files']};oldname=urllib.parse.unquote(urllib.parse.urlsplit(old['u']).path.split('/',3)[3]);f=files[c['file_metadata']['name']];of=files[oldname]
  if f.get('original')!=oldname or f.get('format','').lower()!='h.264 ia' or f.get('private') or of.get('private'):raise ValueError('Unverified derivative')
  if not(int(f.get('width',0))>0 and int(f.get('height',0))>0):raise ValueError('Missing video dimensions')
  if abs(float(f['length'])-float(of['length']))>max(2,float(of['length'])*.002):raise ValueError('Duration mismatch')
  newurl='https://archive.org/download/'+item+'/'+urllib.parse.quote(f['name'],safe='/');reason='LISTED_H264_DERIVATIVE'
  if n==103:
   item='youtube-j64mtjMTfIE';d=json.loads((meta_dir/(item+'.metadata.json')).read_bytes());f=next(f for f in d['files'] if f['name']=='j64mtjMTfIE.mp4')
   if f.get('format','').lower()!='h.264' or f.get('private'):raise ValueError('User video metadata mismatch')
   newurl='https://archive.org/download/youtube-j64mtjMTfIE/j64mtjMTfIE.mp4';reason='USER_SUPPLIED_SAME_TITLE_VIDEO'
  before=dict(old);old['id']=old.get('id') or legacy_id(old['u']);old['u']=newurl
  changes.append({'original_number':n,'title':old['n'],'old_url':before['u'],'new_url':newurl,'preserved_id_base':old['id'],'reason':reason,'source_item':item,'file':f['name'],'format':f['format'],'original_file':f.get('original'),'width':int(f['width']),'height':int(f['height']),'duration_seconds':float(f['length']),'provider_sha1':f.get('sha1'),'verification':'PROVIDER_FILE_METADATA; see separate sampled decode results'})
 if len(changes)!=831:raise ValueError('Unexpected choice count')
 seen={r['u'] for r in rows};additions=[]
 for new in extras:
  if new['u'] in seen:raise ValueError('Duplicate added URL')
  seen.add(new['u']);rows.append({'n':new['n'],'u':new['u']});additions.append({'number':len(rows),**new})
 block=m.group(1)
 for old,new in zip(original,rows):
  if old==new:continue
  a=json.dumps(old,ensure_ascii=False,separators=(',',':'));b=json.dumps(new,ensure_ascii=False,separators=(',',':'))
  if block.count(a)!=1:raise ValueError('Catalog bytes do not match')
  block=block.replace(a,b,1)
 block=block.rstrip()[:-1].rstrip()+'\n'+''.join('    '+json.dumps({'n':e['n'],'u':e['u']},ensure_ascii=False,separators=(',',':'))+',\n' for e in extras)+']'
 output=(text[:m.start(1)]+block+text[m.end(1):]).encode();am,ar=parse_block(output.decode())
 outside=text[:m.start(1)]+text[m.end(1):]
 if outside!=output.decode()[:am.start(1)]+output.decode()[am.end(1):]:raise ValueError('Change outside Channel 24')
 report={'schema':'CLINE_CHANNEL24_SOURCE_REPAIR_V1','source_commit':'7ddc312602beaf3b5c4f9f905ca9dddd1e93499f','source_index_blob':blob(source),'repaired_index_blob':blob(output),'outside_channel24_sha256':sha(outside.encode()),'original_count':len(original),'repaired_count':len(ar),'repaired_links':len(changes),'removed_programs':0,'new_programs':len(additions),'original_lineup_sha256':sha(json.dumps(original,ensure_ascii=False,separators=(',',':')).encode()),'changes':changes,'additions':additions,'limits':['Provider metadata matched for each replacement; byte-sample decoding is separately scoped.','No claim that every entire episode was watched or every browser supports every file.','Original sources are not called audio-only solely because one browser cannot decode their video.','No player thresholds, layouts, radio channels or navigation data were changed.']}
 return output,report
IN=ROOT/'_channel24_audit';EX=ROOT/'_channel24_extra';choices=[]
for r in json.loads((IN/'catalog-metadata.json').read_bytes()):
 fs=[f for f in r['alternatives'] if f.get('format','').lower()=='h.264 ia' and f.get('original')==r['file'] and int(f.get('width',0))>0 and int(f.get('height',0))>0 and not f.get('private')]
 if fs:
  exact=[f for f in fs if f['name']==r['file'][:-4]+'.ia.mp4'];f=exact[0] if len(exact)==1 else min(fs,key=lambda f:int(f['size']))
  choices.append({'number':r['number'],'old_url':r['u'],'n':r['n'],'item':r['item'],'file_metadata':f})
extras=[]
for s in json.loads((EX/'samples.json').read_bytes()):
 f=s.get('metadata')
 if not f or not f['name'].endswith('.ia.mp4'):continue
 if s.get('error') or sha((EX/s['path']).read_bytes())!=s['sha256']:raise ValueError('Missing or altered video prefix')
 if f.get('format','').lower()!='h.264 ia' or f.get('private'):raise ValueError('Unverified extra file')
 m=re.fullmatch(r'1980 Cosmos \(A Personal Voyage\) - Ep (\d+) (.*)\.ia\.mp4',f['name'])
 if not m:raise ValueError('Unexpected episode name')
 extras.append({'n':f'Cosmos — {m[1]} — {m[2]} (Carl Sagan, 1980)','u':s['url'],'episode':int(m[1]),'source_item':'CosmosAPersonalVoyage','file':f['name'],'format':f['format'],'width':int(f['width']),'height':int(f['height']),'duration_seconds':float(f['length']),'provider_sha1':f['sha1'],'prefix_sha256':s['sha256'],'verified_codec':'h264 / aac'})
extras.sort(key=lambda e:e['episode'])
if [e['episode'] for e in extras]!=list(range(1,14)):raise ValueError('Incomplete or duplicated Cosmos series')
output,report=repair((ROOT/'index.html').read_bytes(),IN,choices,extras)
if blob(output)!='b4fbd19b32c2211f5a7feeb502a97668873c2c72':raise ValueError('Result differs from locally tested index')
(ROOT/'index.html').write_bytes(output)
(ROOT/'tools/channel24-media-repair.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k not in ['changes','additions','limits']},indent=2))
