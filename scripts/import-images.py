"""Download observed source card images, retaining exact source versions and resumable files."""
import importlib.util,json,re,urllib.parse,urllib.request,concurrent.futures,time,datetime
from pathlib import Path
spec=importlib.util.spec_from_file_location('official',Path(__file__).with_name('import-official.py'));o=importlib.util.module_from_spec(spec);spec.loader.exec_module(o)
ROOT=o.ROOT;OUT=ROOT/'assets/cards';OUT.mkdir(parents=True,exist_ok=True)
BASE='https://rugiacreation.com/ua/'
def entries():
 rows={}
 for p in (ROOT/'.cache').glob('rugia-*.html'):
  root=o.Tree(p.read_text(encoding='utf-8')).root
  for h in root.all(cls='cardHolder'):
   pid=h.attrs.get('id','')
   if not re.fullmatch(r'[A-Za-z0-9_-]+',pid) or not re.match(r'\w+_[A-Z]{3}[-_]',pid):continue
   img=next((n for n in h.all('img') if 'cardlist/small/' in n.attrs.get('data-src','')),None)
   if not img:continue
   small=img.attrs['data-src'];full=small.replace('cardlist/small/','cardlist/').replace('.jpg','.png')
   number=pid.replace('_','/',1);number=re.sub(r'_\d+$','',number);cid=number.split('/')[-1]
   info=h.all(cls='infoBox');rare=re.search(r'\(([^)]+)\)',o.clean(info[0].text())) if info else None
   rows[pid]={'sourcePrintId':pid,'id':cid,'number':number,'rarity':rare[1] if rare else '-','remote':urllib.parse.urljoin(BASE,full),'thumbnailRemote':urllib.parse.urljoin(BASE,small),'source':BASE+'search?'+urllib.parse.urlencode({'Name':'HK','Find1':cid})}
 return list(rows.values())
def valid(data):return data.startswith(b'\x89PNG\r\n\x1a\n') or (data.startswith(b'\xff\xd8\xff') and data.endswith(b'\xff\xd9'))
def download(row):
 for ext in ['png','jpg']:
  p=OUT/(row['sourcePrintId']+'.'+ext)
  if p.exists() and valid(p.read_bytes()):return {**row,'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size}
 for ext,url in [('jpg',row['thumbnailRemote']),('png',row['remote'])]:
  p=OUT/(row['sourcePrintId']+'.'+ext)
  if p.exists() and valid(p.read_bytes()):return {**row,'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size}
  for attempt in range(3):
   try:
    req=urllib.request.Request(url,headers={'User-Agent':'UA Deck Lab local card image import','Referer':row['source']})
    data=urllib.request.urlopen(req,timeout=45).read()
    if not valid(data):raise ValueError('Response was not a PNG/JPEG image')
    tmp=p.with_suffix(p.suffix+'.part');tmp.write_bytes(data);tmp.replace(p)
    return {**row,'path':p.relative_to(ROOT).as_posix(),'bytes':len(data)}
   except Exception as e:
    if attempt==2:break
    time.sleep(1+attempt)
 return {**row,'error':str(e) if 'e' in locals() else 'Image unavailable'}
def save(results,total):
 images={};failures=[]
 for row in results:
  if row.get('error'):failures.append(row);continue
  images.setdefault(row['id'],[]).append(row)
 for group in images.values():group.sort(key=lambda r:(r['sourcePrintId'].split('_',1)[1].count('_'),r['sourcePrintId']))
 data={'source':'路基亞中文卡表；卡圖版權 BANDAI','url':BASE+'search?Name=HK','updatedAt':datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat(timespec='seconds'),'total':total,'downloaded':sum(len(g) for g in images.values()),'processed':len(results),'images':images,'failures':failures}
 for filename,content in [('data/images.json',json.dumps(data,ensure_ascii=False,indent=2)+'\n'),('data/images.js','const localCardImages = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')]:
  p=ROOT/filename;tmp=p.with_suffix(p.suffix+'.part');tmp.write_text(content,encoding='utf-8')
  for attempt in range(8):
   try:tmp.replace(p);break
   except PermissionError:
    if attempt==7:raise
    time.sleep(.5)
if __name__=='__main__':
 rows=entries();results=[];save(results,len(rows));print('Source images:',len(rows),flush=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
  for result in pool.map(download,rows):
   results.append(result)
   if len(results)%100==0:save(results,len(rows));print('Processed',len(results),'/',len(rows),'failures',sum(bool(r.get('error')) for r in results),flush=True)
 save(results,len(rows));print('Completed',len(results),'images; failures',sum(bool(r.get('error')) for r in results),flush=True)
