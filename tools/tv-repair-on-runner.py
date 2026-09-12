from pathlib import Path
import hashlib
p=Path('index.html')
b=p.read_bytes()
def blob(data):return hashlib.sha1(f'blob {len(data)}\0'.encode()+data).hexdigest()
assert blob(b)=='2a050e9ef423248ff0886a7ce8f006095762d4ba', 'Unexpected index; do not overwrite'
before=b.decode()
start=before.index('function loadAndPlay(');end=before.index('function armWatchdog(',start)
after=before[:start]+Path('tools/tv-playback-replacement.js').read_text()+before[end:]
for old,new in [
 ('if(session){session.controller.abort();clearTimeout(session.retryTimer);clearTimeout(session.watchdog);}',
  'if(session){session.controller.abort();clearTimeout(session.retryTimer);clearTimeout(session.watchdog);clearTimeout(session.skipTimer);stopPictureCheck(session);}'),
 ('    if(!active(s))return;\n    armWatchdog(s);','    if(!active(s)||s.rejecting)return;\n    armWatchdog(s);'),
 ('    if(!active(s)||s.retryTimer!==null)return;','    if(!active(s)||s.rejecting||s.retryTimer!==null)return;'),
 ('            s.controller.abort();clearTimeout(s.watchdog);s.media.pause();loadAndPlay(resume,retries);',
  '            s.controller.abort();clearTimeout(s.watchdog);clearTimeout(s.skipTimer);stopPictureCheck(s);s.media.pause();loadAndPlay(resume,retries);')]:
 assert after.count(old)==1, 'Expected exactly one replacement target'
 after=after.replace(old,new)
assert after[:after.index('// V171 TV ENGINE LOGIC')]==before[:before.index('// V171 TV ENGINE LOGIC')], 'Catalog/design changed'
assert blob(after.encode())=='8cecdf59432f20566aa0240bec558c3cc79ffaf1', 'Output differs from tested repair'
p.write_bytes(after.encode())
print('Verified input and repaired output Git blobs; catalog and design unchanged.')
