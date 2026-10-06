"""Import Japanese official title lists. Standard library only; cached and resumable."""
import concurrent.futures
import datetime
import hashlib
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache' / 'official'
BASE = 'https://www.unionarena-tcg.com'
TITLES = {'チェンソーマン': '鏈鋸人', '呪術廻戦': '咒術迴戰', '犬夜叉': '犬夜叉'}
TITLE_PREFIXES = {'鏈鋸人': 'CSM', '咒術迴戰': 'JJK', '犬夜叉': 'IYS'}

class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def all(self, tag=None, cls=None):
        found=[]
        for c in self.children:
            if isinstance(c, Node):
                if (tag is None or c.tag==tag) and (cls is None or cls in c.attrs.get('class','').split()): found.append(c)
                found.extend(c.all(tag,cls))
        return found
    def text(self, icons=False):
        if self.tag=='img': return ('【'+self.attrs.get('alt','')+'】') if icons else self.attrs.get('alt','')
        if self.tag=='br': return '\n'
        return ''.join(c.text(icons) if isinstance(c,Node) else c for c in self.children)

class Tree(HTMLParser):
    def __init__(self,html):
        super().__init__(convert_charrefs=True)
        self.root=Node();self.stack=[self.root];self.feed(html)
    def handle_starttag(self,tag,attrs):
        n=Node(tag,attrs);self.stack[-1].children.append(n)
        if tag not in ['img','br','meta','link','input','hr','source','wbr','area','embed']:self.stack.append(n)
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if self.stack[-1].tag==tag:self.stack.pop()
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:
                del self.stack[i:];break
    def handle_data(self,data):self.stack[-1].children.append(data)

def clean(text):
    return '\n'.join(re.sub(r'[ \t\r\f\v]+',' ',line).strip() for line in text.split('\n') if line.strip())

def fetch(url):
    url=urllib.parse.quote(url,safe=':/?=&%#+')
    CACHE.mkdir(parents=True,exist_ok=True)
    p=CACHE/(hashlib.sha256(url.encode()).hexdigest()+'.html')
    if p.exists() and '--refresh' not in sys.argv:return p.read_text(encoding='utf-8')
    for attempt in range(3):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'UA-Deck-Lab card-data import (public card list)'})
            data=urllib.request.urlopen(req,timeout=35).read().decode('utf-8')
            p.write_text(data,encoding='utf-8');time.sleep(.15);return data
        except Exception:
            if attempt==2:raise
            time.sleep(1+attempt)

def parse_card(item):
    key,series,url=item
    root=Tree(fetch(url)).root
    def cls(name):
        a=root.all(cls=name)
        if not a:raise ValueError(f'{key}: missing {name}')
        return a[0]
    def field(name):
        a=root.all(cls=name)
        return a[0].all('dd')[0] if a and a[0].all('dd') else Node()
    number=clean(cls('cardNumData').text())
    name_node=cls('cardNameCol')
    name=clean(''.join(c if isinstance(c,str) else '' for c in name_node.children))
    need_node=field('needEnergyData')
    need=clean(need_node.text());bp=clean(field('bpData').text())
    need_icon=next(iter(need_node.all('img')),Node())
    need_number=re.search(r'energy_[a-z]+(\d+)',need_icon.attrs.get('src',''))
    ap=clean(field('apData').text());generated=field('generatedEnergyData')
    energy=[]
    for img in generated.all('img'):
        m=re.search(r'energy_([a-z]+)(\d+)',img.attrs.get('src',''))
        if not m:raise ValueError(f'{key}: unknown energy icon')
        alt=img.attrs.get('alt','')
        symbols=[c for c in alt if c in '赤青黄緑紫']
        if not symbols or len(set(symbols))!=1:raise ValueError(f'{key}: unknown energy label {alt}')
        # Resource icon suffixes are asset IDs, not amounts: purple3 means 紫紫 (2).
        energy.append({'color':symbols[0],'amount':len(symbols),'variable':'+' in alt})
    effect=field('effectData');trigger=field('triggerData');traits=clean(field('attributeData').text())
    products=[clean(n.text()) for n in root.all(cls='cardDataProductsTxt')]
    data={
        'printId':key,'number':number,'id':number.split('/')[-1], 'nameJa':name,'series':series,
        'rarity':clean(root.all(cls='rareData')[0].text()) if root.all(cls='rareData') else '-', 'typeJa':clean(field('categoryData').text()),
        'requiredEnergyRaw':need,'color':next((x for x in need if x in '赤青黄緑紫'),'無'),
        'cost':int(need_number[1]) if need_number else None,
        'ap':int(ap) if ap.isdigit() else None,
        'bp':int(re.search(r'\d+',bp)[0]) if re.search(r'\d+',bp) else None,'bpText':bp or '-',
        'generatedEnergy':energy,'traits':[] if traits in ['', '-'] else re.split(r'[／/]',traits),
        'text':clean(effect.text(True)) or '-',
        'keywords':list(dict.fromkeys(n.attrs.get('alt','') for n in effect.all('img'))),
        'triggerText':clean(trigger.text(True)) or '-',
        'trigger':list(dict.fromkeys(n.attrs.get('alt','') for n in trigger.all('img'))),
        'products':products,'source':url.replace('detail_iframe.php','detail.php')
    }
    if not name or not data['typeJa']:raise ValueError(f'{key}: missing name/type')
    if data['typeJa']!='アクションポイント' and (data['cost'] is None or data['ap'] is None):raise ValueError(f'{key}: missing energy/AP')
    return data

def main():
    if (ROOT/'data/titles.json').exists():
        for t in json.loads((ROOT/'data/titles.json').read_text(encoding='utf-8')):
            TITLES[t['titleJa']]=t['title'];TITLE_PREFIXES[t['title']]=t['prefix']
    items=[];manifest=[]
    for ja,zh in TITLES.items():
        url=BASE+'/jp/cardlist/?'+urllib.parse.urlencode({'search':'true','selectTitle':ja})
        root=Tree(fetch(url)).root
        links=root.all('a',cls='modalCardDataOpen')
        unique={urllib.parse.parse_qs(urllib.parse.urlparse(a.attrs['href']).query)['card_no'][0]:urllib.parse.urljoin(url,a.attrs['href']) for a in links}
        if not unique:raise ValueError('No card links for '+ja)
        assert all(re.search('/'+re.escape(TITLE_PREFIXES[zh])+r'[-_]',k) for k in unique)
        manifest.append({'title':zh,'url':url,'printCount':len(unique)})
        items.extend((key,zh,link) for key,link in unique.items())
        print(zh,len(unique),'official print entries',flush=True)
    results=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for i,data in enumerate(pool.map(parse_card,items)):
            results.append(data)
            if (i+1)%30==0:print('Fetched',i+1,'/',len(items),flush=True)
    grouped={}
    for data in results:
        grouped.setdefault(data['id'],[]).append(data)
    cards=[]
    for key,prints in sorted(grouped.items()):
        # A normal booster/starter printing is the primary source where available.
        prints.sort(key=lambda p:('_p' in p['printId'],p['number'].startswith('UAPR'),p['printId']))
        c=prints[0].copy()
        c['prints']=[{k:p[k] for k in ['printId','number','rarity','products','source']} for p in prints]
        c['products']=sorted({x for p in prints for x in p['products']})
        c['rarities']=sorted({p['rarity'] for p in prints})
        # Preserve official discrepancies rather than silently replacing a printing's fields.
        differences=[]
        for p in prints[1:]:
            for field in ['nameJa','typeJa','color','cost','ap','bpText','generatedEnergy','traits']:
                if p[field]!=c[field]:
                    differences.append({'number':p['number'],'field':field,'primary':c[field],'value':p[field],'source':p['source']})
        if differences:c['printDifferences']=differences
        cards.append(c)
    for entry in manifest:entry['cardCount']=sum(c['series']==entry['title'] for c in cards)
    data={'updatedAt':datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat(timespec='seconds'),'language':'ja','sources':manifest,'cardCount':len(cards),'printCount':len(results),'cards':cards}
    if len(manifest)>3 and (ROOT/'.cache/rugia-STG.html').exists() and (ROOT/'.cache/rugia-DGM.html').exists():
        import importlib.util
        spec=importlib.util.spec_from_file_location('pending',ROOT/'scripts/import-rugia-pending.py')
        pending=importlib.util.module_from_spec(spec);spec.loader.exec_module(pending)
        data=pending.supplement(data)
    if (ROOT/'data/translations.json').exists():
        translated=json.loads((ROOT/'data/translations.json').read_text(encoding='utf-8'))
        for c in data['cards']:
            row=translated['cards'].get(c['id'])
            if row:
                for k in ['nameZh','traitsZh','textZh','triggerTextZh','translationSource']:c[k]=row[k]
                c['textZh']=c['textZh'] or '無效果';c['triggerTextZh']=c['triggerTextZh'] or '無觸發效果'
            elif c['typeJa']=='アクションポイント':
                c.update(nameZh=c['series']+' AP 卡',traitsZh=[],textZh='行動點卡（AP 卡）',triggerTextZh='無觸發效果')
        data['translations']={**translated['metadata'],'matchedCards':sum(bool(c.get('translationSource')) for c in data['cards']),'totalCards':len(data['cards'])}
    (ROOT/'data').mkdir(exist_ok=True)
    (ROOT/'data/cards.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (ROOT/'data/cards.js').write_text('const officialCardData = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    print(json.dumps(manifest,ensure_ascii=False),flush=True)

if __name__=='__main__':main()
