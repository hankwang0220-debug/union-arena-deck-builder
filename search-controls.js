'use strict';
function printMatches(p,f){
  const parallel=p.printId.includes('_p')||p.rarity.includes('★');
  return (!f.printSet||p.number.split('/')[0]===f.printSet)&&(!f.rarity||(f.rarity.startsWith('@stars:')?(p.rarity.match(/★+$/)?.[0]||'')===f.rarity.slice(7):p.rarity===f.rarity))&&(!f.illustration||(f.illustration==='parallel'?parallel:f.illustration==='normal'?!parallel:!parallel&&!/ST$/.test(p.number.split('/')[0])));
}
function sourceEffectMatches(c,value){
  const term=value.slice(6).normalize('NFKC'),plain=term.replace(/[【】()＿_]/g,'');
  const exact={'滑步':'ステップ','狙擊':'狙い撃ち','2次攻擊':'2回アタック','2次阻擋':'2回ブロック','突襲':'レイド','衝擊無效':'インパクト無効','登場時':'登場時','攻擊時':'アタック時','退場時':'退場時','阻擋時':'ブロック時','主起動':'起動メイン','自己回合中':'自分のターン中','對手回合中':'相手のターン中','此卡退場':'このカードを退場させる','支付1AP':'APを1支払う','在前線的情況':'フロントLにある場合','將1張手牌放置到場外':'手札を1枚場外に置く'};
  if(term.includes('_')&&plain==='休息')return c.keywords.includes('レストにする');
  if(exact[plain])return c.keywords.includes(exact[plain]);
  const ability=plain.match(/^(衝擊|傷害)([+\d]*)$/);
  if(ability){const prefix=ability[1]==='衝擊'?'インパクト':'ダメージ';return c.keywords.some(k=>{const text=k.normalize('NFKC');return ability[2]?text===`${prefix}(${ability[2]})`:text===prefix||text.startsWith(prefix+'(');});}
  const text=[c.textZh||'',c.text||'',...c.keywords].join(' ').normalize('NFKC').replace(/\s+/g,'');
  const patterns={'BP+':/BP[+＋]/i,'BP-':/BP[-−]/i,'AP消耗-1':/(?:AP消耗|消費AP)[-−]1/,'生產能源+':/(?:生產能源|発生エナジー)[+＋]/,'能源需求減少':/(?:能源需求|需要能源|必要エナジー).*?(?:減少|少なく|[-−])/,'角色卡':/角色|キャラ/,'場域卡':/場域|場地|フィールド/,'事件卡':/事件|イベント/,'AP卡':/AP卡|アクションポイント/,'自己場上':/自己場上|自分の場/,'自己前線':/自己前線|自分のフロントL/,'對手場上':/對手場上|相手の場/,'對手前線':/對手前線|相手のフロントL/,'能源線':/能源線|エナジーL/,'別的戰線':/別的戰線|另一.*戰線|もう一方のライン/,'退場':/退場/,'調換':/調換|入れ替/,'休息':/休息|レスト/,'被激活':/被激活|アクティブに/,'返回手牌':/返回手牌|手札に戻/,'放置到場外':/放置到場外|場外に置/,'放置到移除區':/放置到移除區|リムーブエリアに置/,'激活狀態':/激活狀態|アクティブ状態/,'休息狀態':/休息狀態|レスト状態/,'突襲狀態':/突襲狀態|レイド状態/,'抽X張卡':/抽(?:\d+|X|最多\d+)張卡|(?:\d+|X)枚.*ドロー/,'查看X張卡':/查看(?:\d+|X|最多\d+)張卡|(?:\d+|X)枚見/,'自己場上擁有…':/自己場上.*(?:擁有|有)|自分の場.*ある場合/,'對手場上擁有…':/對手場上.*(?:擁有|有)|相手の場.*ある場合/};
  return (patterns[plain]||new RegExp(plain.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))).test(text);
}
function sortCards(list,sort){
  const numeric={cost:['cost',1],costDesc:['cost',-1],bpAsc:['bp',1],bp:['bp',-1],apAsc:['ap',1],apDesc:['ap',-1],generatedAsc:['generated',1],generatedDesc:['generated',-1]};
  return list.sort((a,b)=>{
    if(numeric[sort]){const [key,direction]=numeric[sort];if(a[key]===null&&b[key]!==null)return 1;if(b[key]===null&&a[key]!==null)return -1;return ((a[key]??0)-(b[key]??0))*direction||a.id.localeCompare(b.id);}
    const field={name:'name',type:'type',rarity:'rarity',product:'number',productDesc:'number'}[sort]||'id';
    return String(a[field]).localeCompare(String(b[field]),'zh-Hant')*(['idDesc','productDesc'].includes(sort)?-1:1)||a.id.localeCompare(b.id);
  });
}
function initSourceSearch(){
  fillSelect('printSet',cards.flatMap(c=>c.prints.map(p=>p.number.split('/')[0])),'全部商品編號');
  fillSelect('bpExact',cards.filter(c=>c.bp!==null).map(c=>c.bp).concat(Array.from({length:12},(_,i)=>(i+1)*500),8000,10000,50000),'全部 BP');
  $('#illustration').innerHTML=option('','全部卡圖')+option('parallel','異畫')+option('normal','普畫（包含 Starter）')+option('normalNoStarter','普畫（不包含 Starter）');
  $('#rarity').options[0].insertAdjacentHTML('afterend',['★★★','★★','★'].map(s=>option('@stars:'+s,s)).join(''));
  $('#generated').innerHTML=option('','全部生產能源')+[1,2,3].flatMap(n=>[option(String(n),'●'.repeat(n)),...(n<3?[option('variable:'+n,'＋'+'●'.repeat(n))]:[])]).join('')+option('0','無');
  const original=$('#keyword').innerHTML;
  $('#keyword').innerHTML=option('','全部效果')+'<optgroup label="路基亞效果分類">'+rugiaEffectOptions.map(s=>option('rugia:'+s,s)).join('')+'</optgroup><optgroup label="其他官方效果標籤">'+original.replace(/<option value="">[^<]*<\/option>/,'')+'</optgroup>';
  $('#sort').innerHTML=[['id','預設／編號（順序）'],['idDesc','編號（倒序）'],['product','產品（順序）'],['productDesc','產品（倒序）'],['type','卡類'],['rarity','稀有度'],['name','名稱'],['apAsc','AP（由小至大）'],['apDesc','AP（由大至小）'],['bpAsc','BP（由小至大）'],['bp','BP（由大至小）'],['cost','能源需求（由小至大）'],['costDesc','能源需求（由大至小）'],['generatedAsc','生產能源（由少至多）'],['generatedDesc','生產能源（由多至少）']].map(([v,t])=>option(v,t)).join('');
}

const rugiaEffectOptions=["【衝擊】","【衝擊１】","【衝擊２】","【衝擊３】","【衝擊４】","【衝擊+1】","【衝擊+3】","【衝擊無效】","【傷害】","【傷害２】","【傷害３】","【傷害７】","【傷害+1】","【滑步】","【狙擊】","【２次攻擊】","【２次阻擋】","【突襲】","＿休息＿","＿此卡退場＿","＿支付１AP＿","＿在前線的情況＿","＿將１張手牌放置到場外＿","（登場時）","（攻擊時）","（退場時）","（阻擋時）","（主起動）","（自己回合中）","（對手回合中）","BP+","BP-","AP消耗-1","生產能源+","能源需求減少","角色卡","場域卡","事件卡","AP卡","自己場上","自己前線","對手場上","對手前線","能源線","別的戰線","退場","調換","休息","被激活","返回手牌","放置到場外","放置到移除區","激活狀態","休息狀態","突襲狀態","抽Ｘ張卡","查看Ｘ張卡","自己場上擁有…","對手場上擁有…"];
