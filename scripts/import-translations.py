"""Import Traditional Chinese reference translations with exact card-number provenance."""
import importlib.util,json,re,urllib.parse,urllib.request,concurrent.futures,time
from pathlib import Path
spec=importlib.util.spec_from_file_location('official',Path(__file__).with_name('import-official.py'));o=importlib.util.module_from_spec(spec);spec.loader.exec_module(o)
ROOT=o.ROOT
icons={'keyword_impact':'衝擊','keyword_damage':'傷害','ico_raid':'突襲','ico_turn1':'每回合１次','ico_trigger':'觸發','ico_trigger_active':'活動','ico_trigger_color':'顏色觸發','ico_trigger_draw':'抽牌觸發','ico_trigger_final':'最終觸發','ico_trigger_get':'加入手牌觸發','ico_trigger_raid':'突襲觸發','ico_trigger_special':'特殊觸發','keyword_step':'移動','keyword_snipe':'狙擊','keyword_impact_nullify':'衝擊無效','keyword_2timesattack':'攻擊２次','keyword_2timesblock':'防禦２次'}
colors={'red':'紅','blue':'藍','green':'綠','yellow':'黃','purple':'紫'}
def icon(img):
 name=Path(img.attrs.get('src','').split('?')[0]).stem
 if name in icons:return icons[name]
 m=re.fullmatch(r'keyword_(impact|damage)([+]?\d+)',name)
 if m:return ('衝擊' if m[1]=='impact' else '傷害')+'（'+m[2]+'）'
 m=re.fullmatch(r'ico_(circle|hexa|square|rhombus)_([a-z]+)(\d*)',name)
 if m:return colors.get(m[2],m[2])+'色能源'+(m[3] or '１')
 raise ValueError('Unknown translation icon: '+name)
def text(node):
 if node.tag=='img':return '【'+icon(node)+'】'
 if node.tag=='br':return '\n'
 return ''.join(text(c) if isinstance(c,o.Node) else c for c in node.children)
def fetch(code):
 url='https://rugiacreation.com/ua/search?'+urllib.parse.urlencode({'Name':'HK','Version':code})
 p=ROOT/('.cache/rugia-'+code+'.html')
 if not p.exists():
  for attempt in range(3):
   try:p.write_bytes(urllib.request.urlopen(url,timeout=45).read());break
   except Exception:
    if attempt==2:raise
    time.sleep(1+attempt)
 root=o.Tree(p.read_text(encoding='utf-8')).root
 results=[]
 for h in root.all(cls='cardHolder'):
  pid=h.attrs.get('id','')
  if not re.match(r'\w+_'+code+r'[-_]',pid):continue
  number=pid.replace('_','/',1);cid=re.sub(r'_p\d+$','',number.split('/')[-1])
  info=h.all(cls='infoBox')
  if not info:continue
  names=[a for a in info[0].all('a') if 'Find2=' in a.attrs.get('href','')]
  if not names:continue
  traits=[]
  for a in info[0].all('a'):
   if 'Feature=' in a.attrs.get('href',''):traits.append(o.clean(a.text()))
  effects=h.all(cls='effect');triggers=h.all(cls='trigger')
  results.append({'id':cid,'number':number,'nameZh':o.clean(names[0].text()),'traitsZh':traits,'textZh':(o.clean(text(effects[0])) or '無效果') if effects else '無效果','triggerTextZh':(o.clean(text(triggers[0])) or '無觸發效果') if triggers else '無觸發效果','translationSource':'https://rugiacreation.com/ua/search?'+urllib.parse.urlencode({'Name':'HK','Version':code,'Find1':cid})})
 print(code,len(results),'translated print entries',flush=True)
 return results
if __name__=='__main__':
 raw=(ROOT/'.cache/rugia-search.html').read_text(encoding='utf-8')
 codes=[c for c,t in re.findall(r"^menu\.push\(\['([^']+)','([^']+)'\]\);",raw,re.M)]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:rows=[r for group in pool.map(fetch,codes) for r in group]
 translations={}
 for row in rows:
  translations.setdefault(row['id'],[]).append(row)
 data=json.loads((ROOT/'data/cards.json').read_text(encoding='utf-8'));matched=0
 for c in data['cards']:
  candidates=translations.get(c['id'],[])
  if not candidates:
   if c['typeJa']=='アクションポイント':
    c['nameZh']=c['series']+' AP 卡';c['traitsZh']=[];c['textZh']='行動點卡（AP 卡）';c['triggerTextZh']='無觸發效果'
   continue
  chosen=next((r for r in candidates if r['number']==c['number']),candidates[0])
  c.update({k:chosen[k] for k in ['nameZh','traitsZh','textZh','triggerTextZh','translationSource']});matched+=1
 snapshot={'source':'路基亞中文卡表（香港繁體用語）','url':'https://rugiacreation.com/ua/search?Name=HK','matchedCards':matched,'totalCards':len(data['cards'])}
 data['translations']=snapshot
 (ROOT/'data/translations.json').write_text(json.dumps({'metadata':snapshot,'cards':{cid:rows[0] for cid,rows in translations.items()}},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 (ROOT/'data/cards.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 (ROOT/'data/cards.js').write_text('const officialCardData = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
 print(json.dumps(snapshot,ensure_ascii=False),flush=True)
