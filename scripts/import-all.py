"""Import every title listed by the user-provided Rugia catalog, with official numeric data."""
import importlib.util,json,re,urllib.parse,concurrent.futures
from pathlib import Path
spec=importlib.util.spec_from_file_location('official',Path(__file__).with_name('import-official.py'));o=importlib.util.module_from_spec(spec);spec.loader.exec_module(o)
raw=(o.ROOT/'.cache/rugia-search.html').read_text(encoding='utf-8')
titles=dict(re.findall(r"^menu\.push\(\['([^']+)','([^']+)'\]\);",raw,re.M))
titles.update({'CSM':'鏈鋸人','JJK':'咒術迴戰'})
root=o.Tree((o.ROOT/'.cache/official-all-titles.html').read_text(encoding='utf-8')).root
ja=[v.attrs.get('value') for n in root.all('select') if n.attrs.get('name')=='selectTitle' for v in n.all('option') if v.attrs.get('value') and v.attrs.get('value')!='UNION ARENA']
ja.extend(t for t in ['STEINS;GATE','D.Gray-man'] if t not in ja)
def discover(title):
 url=o.BASE+'/jp/cardlist/?'+urllib.parse.urlencode({'search':'true','selectTitle':title})
 links=o.Tree(o.fetch(url)).root.all('a',cls='modalCardDataOpen')
 keys=[urllib.parse.parse_qs(urllib.parse.urlparse(a.attrs['href']).query)['card_no'][0] for a in links]
 codes={k.split('/')[-1].split('-')[0] for k in keys}
 matches=codes.intersection(titles)
 if len(matches)!=1:return None
 code=next(iter(matches));print(code,len(keys),flush=True);return title,titles[code],code
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:found=[x for x in pool.map(discover,ja) if x]
missing=set(titles)-{x[2] for x in found}
if missing-{'DGM','STG'}:raise ValueError('Official titles missing: '+str(missing))
print('Awaiting official data:',sorted(missing),flush=True)
manifest=[{'titleJa':a,'title':b,'prefix':c} for a,b,c in found]
(o.ROOT/'data/titles.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
o.TITLES={a:b for a,b,c in found};o.TITLE_PREFIXES={b:c for a,b,c in found}
o.main()
print('Full-title import complete.',flush=True)
