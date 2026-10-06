"""Merge source-only previews where no official title cards are available."""
import importlib.util,json,re,urllib.parse
from pathlib import Path
spec=importlib.util.spec_from_file_location('official',Path(__file__).with_name('import-official.py'));o=importlib.util.module_from_spec(spec);spec.loader.exec_module(o)
def supplement(data):
 data['cards']=[c for c in data['cards'] if not c.get('pendingOfficial')]
 data['sources']=[s for s in data['sources'] if not s.get('pendingOfficial')]
 for code,title in [('STG','命運石之門'),('DGM','D.Gray-man 驅魔少年')]:
  root=o.Tree((o.ROOT/('.cache/rugia-'+code+'.html')).read_text(encoding='utf-8')).root
  grouped={}
  for n in root.all(cls='cardHolder'):
   pid=n.attrs.get('id','')
   if not re.match(r'\w+_'+code+r'-',pid):continue
   number=pid.replace('_','/',1);cid=re.sub(r'_p\d+$','',number.split('/')[-1])
   img=n.all('img')[0];args=re.findall(r'"([^"\n]*)"',img.attrs.get('onclick',''))
   info=n.all(cls='infoBox')[0];names=info.all(cls='fontsize2')
   name=o.clean(names[0].text()) if names else cid
   rarity=re.search(r'\(([^)]+)\)',o.clean(info.text()))
   source='https://rugiacreation.com/ua/search?'+urllib.parse.urlencode({'Name':'HK','Version':code,'Find1':cid})
   product=args[3] if len(args)>3 else title
   typ={'角色卡':'キャラクター','場域卡':'フィールド','事件卡':'イベント','AP卡':'アクションポイント','BP標記':'BP 標誌','限制卡':'限制卡'}.get(args[2],args[2]) if len(args)>2 else '未確認'
   c={'id':cid,'number':number,'printId':pid,'nameJa':name,'nameZh':name,'series':title,'rarity':rarity[1] if rarity else '-','typeJa':typ,'requiredEnergyRaw':'未核對','color':'未核對','cost':None,'ap':None,'bp':None,'bpText':'—','generatedEnergy':[],'traits':[],'text':'官方數值與日文效果尚待核對，請查看來源卡表。','keywords':[],'triggerText':'尚待核對','trigger':[],'products':[product],'source':source,'pendingOfficial':True}
   grouped.setdefault(cid,[]).append(c)
  for cid,prints in grouped.items():
   c=prints[0];c['prints']=[{k:p[k] for k in ['printId','number','rarity','products','source']} for p in prints];c['rarities']=sorted({p['rarity'] for p in prints});data['cards'].append(c)
  data['sources'].append({'title':title,'url':'https://rugiacreation.com/ua/search?Name=HK&Version='+code,'printCount':sum(len(c['prints']) for c in data['cards'] if c['series']==title),'cardCount':len(grouped),'pendingOfficial':True})
 data['cards'].sort(key=lambda c:c['id']);data['cardCount']=len(data['cards']);data['printCount']=sum(len(c['prints']) for c in data['cards'])
 data['catalogSource']={'title':'路基亞 UNION ARENA 中文卡表','url':'https://rugiacreation.com/ua/search?Name=HK','titleCount':58}
 return data
if __name__=='__main__':
 data=supplement(json.loads((o.ROOT/'data/cards.json').read_text(encoding='utf-8')))
 (o.ROOT/'data/cards.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 (o.ROOT/'data/cards.js').write_text('const officialCardData = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
 print(data['cardCount'],data['printCount'])
