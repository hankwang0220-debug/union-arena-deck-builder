'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors={'赤':'紅','青':'藍','黄':'黃','緑':'綠','紫':'紫','無':'無色'};
const colorHex={'紅':'#ed6969','藍':'#6299ed','黃':'#edd463','綠':'#65c08d','紫':'#b58bea','無色':'#91a1b7'};
const types={'キャラクター':'角色','フィールド':'場地','イベント':'事件','アクションポイント':'AP 卡'};
const names={'デンジ':'電次','チェンソーマン':'鏈鋸人','パワー':'帕瓦','早川 アキ':'早川秋','姫野':'姬野','マキマ':'瑪奇瑪','コベニ':'小紅','レゼ':'蕾潔','ボム':'炸彈','ポチタ':'波奇塔','岸辺':'岸邊','サムライソード':'武士刀','天使の悪魔':'天使惡魔','ビーム':'畢姆','暴力の魔人':'暴力魔人','蜘蛛の悪魔':'蜘蛛惡魔','虎杖 悠仁':'虎杖悠仁','五条 悟':'五條悟','伏黒 恵':'伏黑惠','釘崎 野薔薇':'釘崎野薔薇','宿儺':'宿儺','夏油 傑':'夏油傑','七海 建人':'七海建人','狗巻 棘':'狗卷棘','禪院 真希':'禪院真希','禪院 真依':'禪院真依','パンダ':'熊貓','東堂 葵':'東堂葵','三輪 霞':'三輪霞','家入 硝子':'家入硝子','天内 理子':'天內理子','伏黒 甚爾':'伏黑甚爾','真人':'真人','漏瑚':'漏瑚','花御':'花御','陀艮':'陀艮','脹相':'脹相','壊相':'壞相','血塗':'血塗','西宮 桃':'西宮桃','加茂 憲紀':'加茂憲紀','庵 歌姫':'庵歌姬','冥冥':'冥冥','憂憂':'憂憂','灰原 雄':'灰原雄'};
const labels={'レイド':'Raid／突襲','登場時':'登場時','アタック時':'攻擊時','ブロック時':'防禦時','退場時':'退場時','起動メイン':'起動主階段','起動バトル':'起動戰鬥','自分のターン中':'自己的回合','相手のターン中':'對手的回合','ターン1':'每回合 1 次','フロントLにある場合':'位於前線時','エナジーLにある場合':'位於能源線時','インパクト無効':'Impact 無效','ステップ':'Step／移動','狙い撃ち':'狙擊','2回アタック':'攻擊 2 次','2回ブロック':'防禦 2 次','ドロー':'抽牌','ゲット':'加入手牌','アクティブ':'重置','カラー':'顏色','スペシャル':'特殊','ファイナル':'最終','改造人間':'改造人類','呪霊':'咒靈'};
Object.assign(labels,{'レストにする':'置為休息狀態','このカードを退場させる':'使此卡退場','APを1支払う':'支付 1 AP','手札を1枚場外に置く':'將 1 張手牌放置到場外','手札を2枚場外に置く':'將 2 張手牌放置到場外','手札を3枚場外に置く':'將 3 張手牌放置到場外','場外にある場合':'位於場外時','リムーブエリアにある場合':'位於移除區時','トリガー':'觸發','スペシャルトリガー':'特殊觸發','カラートリガー':'顏色觸發','ドロートリガー':'抽牌觸發','ファイナルトリガー':'最終觸發','レイドトリガー':'突襲觸發'});
Object.assign(labels,{'呪術師':'咒術師','呪具':'咒具','呪胎九相図':'咒胎九相圖'});
Object.assign(names,{'日暮 かごめ':'日暮籬','殺生丸':'殺生丸','弥勒':'彌勒','珊瑚':'珊瑚','七宝':'七寶','雲母':'雲母','桔梗':'桔梗','鋼牙':'鋼牙','奈落':'奈落','神楽':'神樂','神無':'神無','りん':'玲','邪見':'邪見','琥珀':'琥珀','殺生丸の母':'殺生丸的母親','アクションポイントカード(犬夜叉)':'犬夜叉 AP 卡'});
Object.assign(names,{'アクションポイントカード(チェンソーマン)':'鏈鋸人 AP 卡','アクションポイントカード(呪術廻戦)':'咒術迴戰 AP 卡'});
for(const c of officialCardData.cards){if(c.traitsZh?.length===c.traits.length)c.traits.forEach((t,i)=>{labels[t]=c.traitsZh[i];});}
function label(value){if(/^[赤青黄緑紫](×\d+)?$/.test(value))return (colors[value[0]]||value[0])+value.slice(1);return labels[value]||value.replace('インパクト','Impact').replace('ダメージ','傷害');}
function productLabel(value){
  for(const source of officialCardData.sources){const match=source.url.match(/[?&]selectTitle=([^&]+)/);if(match)value=value.replaceAll(decodeURIComponent(match[1].replace(/\+/g,' ')),source.title);}
  return value.replaceAll('ブースターパック','補充包').replaceAll('スタートデッキ','起始牌組').replaceAll('アドバンスデッキ','進階牌組').replaceAll('プレミアムカードセット','豪華卡片套組').replaceAll('ユニオンアリーナ','UNION ARENA').replaceAll('プロモーションカード','宣傳卡').replaceAll('プロモーション','宣傳').replaceAll('参加記念品','參加紀念品').replaceAll('優勝記念品','優勝紀念品');
}
const cards=officialCardData.cards.map(c=>({...c,name:c.nameZh||names[c.nameJa]||(c.typeJa==='アクションポイント'?`${c.series} AP 卡`:c.nameJa),color:colors[c.color]||c.color,type:types[c.typeJa]||c.typeJa,fx:c.keywords,products:[...new Set(c.prints.flatMap(p=>p.products.length?p.products:[`${p.number.split('/')[0]}（官方未標示商品名稱）`]))],generated:c.generatedEnergy.reduce((n,e)=>n+e.amount,0)}));
const cardById=new Map(cards.map(c=>[c.id,c]));
const selectedImages={};
const deck={};let page=1,selectedCardId=null;const PAGE_SIZE=30;
const filterIds=['q','effect','series','color','type','product','rarity','trait','keyword','trigger','cost','ap','generated','bpMin','bpMax','restriction'];
function option(value,text=value){return `<option value="${esc(value)}">${esc(text)}</option>`;}
function fillSelect(id,values,title,format=x=>x){$('#'+id).innerHTML=option('',title)+[...new Set(values)].sort((a,b)=>typeof a==='number'?a-b:String(a).localeCompare(String(b),'zh-Hant')).map(x=>option(x,format(x))).join('');}
function cardLimit(c){return c.type==='AP 卡'?3:(officialRules.limits[c.id]??4);}
function restrictionLabel(c){if(c.pendingOfficial)return '官方資料待核對';if(c.type==='BP 標誌')return '不計入牌組';return c.type==='AP 卡'?'AP 卡合計最多 3 張':cardLimit(c)<4?`限制卡：最多 ${cardLimit(c)} 張`:'一般卡：同卡號最多 4 張';}
function renderMarkers(){
  const markers=[{type:'bp',name:'BP 標誌／計數器',text:'記錄角色卡因效果增加或減少的 BP。將標記放在卡片下方，露出數值方便確認。'},{type:'effect',name:'效果標記',text:'記錄角色卡目前獲得或已發動的效果。將標記放在卡片下方，露出圖示方便確認。'}];
  $('#markerList').innerHTML=markers.filter(m=>!$('#markerType').value||m.type===$('#markerType').value).map(m=>`<article class="card"><span class="meta">對戰輔助用品</span><span class="name">${m.name}</span><p>${m.text}</p><span class="tag">不計入牌組張數</span></article>`).join('');
}
function init(){
  $('#exchangeRate').innerHTML=exchangeRateNote();
  $('#restriction').innerHTML=option('','全部使用限制')+option('normal','一般卡（最多 4 張）')+option('limited','限制卡（1 或 2 張）')+option('1','限制 1 張')+option('2','限制 2 張');
  $('#markerType').addEventListener('change',renderMarkers);renderMarkers();
  fillSelect('series',cards.map(c=>c.series),'全部作品');fillSelect('color',cards.map(c=>c.color),'全部顏色');fillSelect('type',cards.map(c=>c.type).concat('BP 標誌','限制卡'),'全部類型');
  fillSelect('product',cards.flatMap(c=>c.products),'全部商品',productLabel);fillSelect('rarity',cards.flatMap(c=>c.rarities),'全部稀有度',x=>x==='-'?'未標示':x);
  fillSelect('trait',cards.flatMap(c=>c.traits).concat('none'),'全部特徵',x=>x==='none'?'無特徵':label(x));
  fillSelect('keyword',cards.flatMap(c=>c.keywords),'全部效果標籤',label);fillSelect('trigger',cards.flatMap(c=>c.trigger).concat('none'),'全部觸發',x=>x==='none'?'無觸發':label(x));
  for(const id of ['cost','ap','generated'])fillSelect(id,cards.filter(c=>!c.pendingOfficial&&c.type!=='AP 卡'&&c[id]!==null).map(c=>c[id]),'不限');
  fillSelect('recommendSeries',cards.map(c=>c.series),'請選擇作品 IP');
  $('#recommendSeries').addEventListener('change',()=>updateRecommendSeries());updateRecommendSeries();
  $('#coverage').textContent=`${officialCardData.sources.length} 個作品 · ${cards.length.toLocaleString('zh-TW')} 種卡片 · ${officialCardData.printCount.toLocaleString('zh-TW')} 個印刷版本`;
  $('#coverageDetails').textContent=officialCardData.sources.map(s=>`${s.title} ${s.cardCount} 種卡片／${s.printCount} 個印刷版本${s.pendingOfficial?'（預覽）':''}`).join(' · ');
  $('#footer').textContent=`資料產生：${officialCardData.updatedAt.slice(0,10)} · 共 ${cards.length} 種卡片、${officialCardData.printCount} 個印刷版本。繁體中文參考翻譯來自路基亞中文卡表，官方日文可展開核對；預覽卡的官方數值尚待核對。`;
  filterIds.forEach(id=>$('#'+id).addEventListener('input',()=>{page=1;render();}));$('#sort').addEventListener('change',()=>{page=1;render();});
  $('#reset').onclick=()=>{filterIds.forEach(id=>$('#'+id).value='');$('#sort').value='id';page=1;render();};
  $$('.tabs button').forEach(b=>b.onclick=()=>show(b.dataset.view));$('#run').onclick=rec;render();deckUI();
}
const normalize=s=>String(s).normalize('NFKC').toLowerCase().replace(/\s+/g,'');
function filterCards(list,f){
  const q=normalize(f.q||''),effect=normalize(f.effect||'');
  return list.filter(c=>{
    if(effect&&!normalize([c.textZh||'',c.triggerTextZh||'',c.text,c.triggerText,...c.keywords,...c.keywords.map(label),...c.trigger,...c.trigger.map(label)].join(' ')).includes(effect))return false;
    if(f.restriction){const limit=cardLimit(c);if(c.pendingOfficial||c.type==='BP 標誌'||c.type==='AP 卡'||(f.restriction==='normal'?limit!==4:f.restriction==='limited'?limit>=4:limit!==Number(f.restriction)))return false;}
    for(const k of ['series','color'])if(f[k]&&c[k]!==f[k])return false;
    if(f.type==='限制卡'){
      if(c.type!=='限制卡'&&(c.type==='AP 卡'||!officialRules.limits[c.id]))return false;
    }else if(f.type&&c.type!==f.type)return false;
    for(const [key,field] of [['product','products'],['rarity','rarities'],['trait','traits'],['keyword','keywords'],['trigger','trigger']]){
      if(f[key]==='none'){if(c[field].length)return false;}else if(f[key]&&!c[field].includes(f[key]))return false;
    }
    for(const k of ['cost','ap','generated'])if(f[k]!==undefined&&f[k]!==''&&(c.pendingOfficial||c.type==='AP 卡'||c[k]!==Number(f[k])))return false;
    if(f.bpMin!==undefined&&f.bpMin!==''&&(c.bp===null||c.bp<Number(f.bpMin)))return false;
    if(f.bpMax!==undefined&&f.bpMax!==''&&(c.bp===null||c.bp>Number(f.bpMax)))return false;
    return !q||normalize([c.id,c.name,c.nameJa,c.textZh||'',c.triggerTextZh||'',c.text,c.triggerText,...c.traits,...c.traits.map(label),...c.keywords.map(label),...c.trigger.map(label),...c.prints.map(p=>p.number)].join(' ')).includes(q);
  });
}
function cardImages(c){return localCardImages.images[c.id]||[];}
function chosenImage(c){const versions=cardImages(c);return versions.find(v=>v.sourcePrintId===selectedImages[c.id])||versions.find(v=>v.number===c.number&&v.rarity===c.rarity)||versions[0];}
function imageTag(c,detail=false){const v=chosenImage(c);return v?`<img class="${detail?'detail-card-image':'catalog-card-image'}" src="${esc(v.path)}" alt="${esc(c.name)} · ${esc(v.number)} · ${esc(v.rarity)}" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="image-missing" hidden>本機卡圖讀取失敗</span>`:'<span class="image-missing">來源尚無對應卡圖</span>';}
function cardArt(c){const versions=cardImages(c),v=chosenImage(c);return `<section class="card-art">${imageTag(c,true)}${versions.length?`<label>卡圖版本<select class="image-version" aria-label="卡圖版本" onchange="chooseImage('${c.id}',this.value)">${versions.map((p,i)=>option(p.sourcePrintId,`${p.number} · ${p.rarity} · 版本 ${i+1}`)).join('')}</select></label><p class="meta">版權 BANDAI<br><a href="${esc(v.path)}" download>下載目前本機卡圖</a></p>`:''}</section>`;}
function chooseImage(id,version){const c=cardById.get(id);if(!c||!cardImages(c).some(p=>p.sourcePrintId===version))return;selectedImages[id]=version;detail(id);}
function tags(values){return values.map(t=>`<span class="tag">${esc(label(t))}</span>`).join('');}
function render(){
  const f=Object.fromEntries(filterIds.map(id=>[id,$('#'+id).value]));let list=filterCards(cards,f);
  const sort=$('#sort').value;
  list.sort((a,b)=>sort==='cost'?(a.cost??Infinity)-(b.cost??Infinity)||a.id.localeCompare(b.id):sort==='bp'?(b.bp??-1)-(a.bp??-1)||a.id.localeCompare(b.id):sort==='name'?a.name.localeCompare(b.name,'zh-Hant'):a.id.localeCompare(b.id));
  const pages=Math.max(1,Math.ceil(list.length/PAGE_SIZE));page=Math.min(page,pages);
  $('#resultCount').textContent=`找到 ${list.length}／${cards.length} 種卡片`;
  $('#cards').innerHTML=list.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(c=>`<button class="card ${selectedCardId===c.id?'selected':''}" style="--card-color:${colorHex[c.color]}" onclick="detail('${c.id}',true)">${imageTag(c)}<span class="meta">${esc(c.id)} · ${esc(c.type)} · ${esc(c.color)}</span>${!c.pendingOfficial&&cardLimit(c)<4&&c.type!=='AP 卡'?tags([restrictionLabel(c)]):''}<span class="name">${esc(c.name)}</span>${c.pendingOfficial?tags(['預覽卡・官方資料待核對']):''}${c.name!==c.nameJa?`<span class="meta">${esc(c.nameJa)}</span>`:''}<span class="metrics">${c.type==='AP 卡'?'行動點卡':`<span>能源 ${c.cost??'—'}</span><span>AP ${c.ap??'—'}</span><span>BP ${esc(c.bpText)}</span>`}</span><span>${tags(c.traits.length?c.traits:['無特徵'])}</span><span class="meta">${esc(c.rarities.join(' / '))} · ${c.prints.length} 個印刷版本</span><span class="price-caption price">${esc(priceSummary(c.id))}</span>${priceListHTML(c.id)}</button>`).join('')||`<div class="empty">${['limited','1','2'].includes(f.restriction)?'目前收錄的作品沒有符合條件的限制卡。限制名單依日本日版官方公告，核對日期 '+officialRules.checkedAt+'。':'沒有符合條件的卡片，請調整或清除篩選。'}</div>`;
  $('#pagination').innerHTML=list.length?`<button class="btn" onclick="changePage(-1)" ${page===1?'disabled':''}>上一頁</button><span>${page}／${pages} 頁</span><button class="btn" onclick="changePage(1)" ${page===pages?'disabled':''}>下一頁</button>`:'';
}
function changePage(delta){page+=delta;render();$('#resultCount').scrollIntoView({block:'nearest'});}
function printDifferenceHTML(c){
  if(!c.printDifferences?.length)return '';
  const fields={nameJa:'卡名',typeJa:'類型',color:'顏色',cost:'需要能源',ap:'消費 AP',bpText:'BP',generatedEnergy:'產生能源',traits:'特徵'};
  const format=v=>Array.isArray(v)?v.map(x=>typeof x==='object'?JSON.stringify(x):x).join('／'):String(v);
  return `<details class="notice"><summary>官方印刷版本欄位差異（${c.printDifferences.length}）</summary><p>此頁以 ${esc(c.number)} 為主要版本，其他官方版本原值如下；請依實際卡片及官方勘誤核對。</p><ul>${c.printDifferences.map(d=>`<li><a href="${esc(d.source)}" target="_blank" rel="noopener noreferrer">${esc(d.number)}</a> · ${fields[d.field]||d.field}：${esc(format(d.value))}（主要版本：${esc(format(d.primary))}）</li>`).join('')}</ul></details>`;
}
function detail(id,scroll=false){
  const c=cardById.get(id);if(!c)return;selectedCardId=id;$('#detail').dataset.cardId=id;
  const energy=c.generatedEnergy.map(e=>`${colors[e.color]||e.color} × ${e.amount}${e.variable?'+':''}`).join('、')||'無';
  const stats=[['顏色',c.color],['需要能源',c.cost??'—'],['消費 AP',c.ap??'—'],['BP',c.bpText],['產生能源',c.type==='AP 卡'?'—':energy],['類型',c.type],['使用限制',restrictionLabel(c)]];
  $('#detail').innerHTML=`<div class="meta">${esc(c.number)} · ${esc(c.series)}</div>${c.pendingOfficial?'<p class="notice">來源預覽卡，官方數值尚待核對，暫不加入牌組。</p>':''}<h2>${esc(c.name)}</h2>${c.name!==c.nameJa?`<div class="muted">${esc(c.nameJa)}</div>`:''}${cardArt(c)}<dl class="stats">${stats.map(([k,v])=>`<div class="stat"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${printDifferenceHTML(c)}<h3>官方特徵</h3><div>${tags(c.traits.length?c.traits:['無特徵'])}</div><h3>效果標籤</h3><div>${tags(c.keywords.length?c.keywords:['無關鍵字效果'])}</div><h3>卡片效果（繁體中文）</h3><div class="rules-text">${esc(c.textZh||'此卡尚未有繁體中文參考翻譯，請展開日文原文核對。')}</div><h3>觸發效果${c.trigger.length?' · '+c.trigger.map(x=>esc(label(x))).join(' / '):''}</h3><div class="rules-text">${esc(c.triggerTextZh||'此卡尚未有繁體中文觸發翻譯，請展開日文原文核對。')}</div>${c.translationSource?`<p class="muted price-note">繁體中文參考翻譯：<a href="${esc(c.translationSource)}" target="_blank" rel="noopener noreferrer">路基亞中文卡表 ↗</a>（香港用語）</p>`:''}<details><summary>日文原文（官方核對）</summary><h3>卡片效果</h3><div class="rules-text">${esc(c.text)}</div><h3>觸發效果</h3><div class="rules-text">${esc(c.triggerText)}</div></details><p><a href="${esc(c.source)}" target="_blank" rel="noopener noreferrer">${c.pendingOfficial?'查看路基亞來源卡表 ↗':'核對官方卡片與 Q&A ↗'}</a></p><details><summary>收錄商品與印刷版本（${c.prints.length}）</summary><ul class="version-list">${c.prints.map(p=>`<li><a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">${esc(p.number)} · ${esc(p.rarity)}${p.printId.includes('_p')?' · 平行／異圖版':''} ↗</a><br>${esc(p.products.map(productLabel).join('、'))}</li>`).join('')}</ul></details>${priceDetail(id)}<div class="actions"><button class="btn primary" onclick="add('${id}')" ${c.pendingOfficial||c.type==='BP 標誌'?'disabled':''}>加入${c.type==='AP 卡'?' AP 卡':'卡組'}</button>${c.pendingOfficial||c.type==='BP 標誌'||c.type==='AP 卡'?'':`<button class="btn" onclick="goRec('${id}')">推薦搭配</button>`}</div>`;
  if($('#detail .image-version'))$('#detail .image-version').value=chosenImage(c).sourcePrintId;
  $$('.card').forEach(el=>el.classList.toggle('selected',el.getAttribute('onclick')===`detail('${id}',true)`));
  if(scroll)$('#detail').scrollTop=0;
  if(scroll&&window.matchMedia('(max-width:800px)').matches)$('#detail').scrollIntoView({behavior:'smooth',block:'start'});
}
function deckCounts(){let main=0,ap=0;for(const [id,n] of Object.entries(deck)){if(cardById.get(id).type==='AP 卡')ap+=n;else main+=n;}return{main,ap};}
function add(id){const c=cardById.get(id);if(!c||c.pendingOfficial||c.type==='BP 標誌')return;const count=deckCounts();if(c.type==='AP 卡'){if(count.ap>=3)return;}else if((deck[id]||0)>=cardLimit(c)||count.main>=50)return;deck[id]=(deck[id]||0)+1;deckUI();}
function sub(id){if(!deck[id])return;if(--deck[id]===0)delete deck[id];deckUI();}
function deckUI(){
  const entries=Object.entries(deck),counts=deckCounts();$('#count').textContent=counts.main+(counts.ap?` + ${counts.ap} AP`:'');
  $('#deckList').innerHTML=entries.map(([id,n])=>{const c=cardById.get(id),p=selectedPrice(id);const capped=c.type==='AP 卡'?counts.ap>=3:n>=cardLimit(c)||counts.main>=50;return `<div class="deckrow"><div><b>${esc(c.name)}</b><div class="meta">${esc(c.id)} · ${c.type==='AP 卡'?'AP 卡':`${esc(c.color)} · 能源 ${c.cost}`}</div>${priceSelect(id)}<div class="price-caption">${p?`${yen(p.amount)} × ${n} = ${yen(p.amount*n)} · ${p.stock}`:'尚未估價，未計入小計'}</div></div><b>×${n}</b><div class="actions"><button class="btn" aria-label="增加 ${esc(c.id)}" onclick="add('${id}')" ${capped?'disabled':''}>+</button><button class="btn" aria-label="減少 ${esc(c.id)}" onclick="sub('${id}')">−</button><button class="btn" onclick="show('browse');detail('${id}',true)">查看</button></div></div>`;}).join('')||'<div class="empty">尚未加入卡片</div>';
  const mainEntries=entries.filter(([id])=>cardById.get(id).type!=='AP 卡');
  const avg=counts.main?mainEntries.reduce((s,[id,n])=>s+cardById.get(id).cost*n,0)/counts.main:0;
  const series=new Set(entries.map(([id])=>cardById.get(id).series));
  $('#health').innerHTML=`<div class="score">${counts.main}/50</div><p>AP 卡：<b>${counts.ap}/3</b></p><p>${counts.main===50?'✓ 主牌組張數完成':`主牌組還需要 ${50-counts.main} 張`}</p><p>平均需要能源：<b>${avg.toFixed(1)}</b></p>${series.size>1?'<p class="notice">目前混用了不同作品，請調整為同一作品。</p>':''}<p class="muted">使用限制依日本日版官方公告（${officialRules.checkedAt} 核對）。${cards.some(c=>officialRules.limits[c.id])?'':'目前收錄的作品沒有公告中的限制卡。'}<a href="${officialRules.source}" target="_blank" rel="noopener noreferrer">核對官方限制 ↗</a>；其他特殊規則請以賽事公告為準。</p>${deckPriceHTML(entries)}`;
}
function syn(a,b){let score=0,reasons=[];if(a.color===b.color){score+=25;reasons.push('同色');}const t=a.traits.filter(x=>b.traits.includes(x));score+=t.length*15;if(t.length)reasons.push('共同特徵 '+t.map(label).join('/'));const fx=a.keywords.filter(x=>b.keywords.includes(x));score+=fx.length*10;if(fx.length)reasons.push('共同效果 '+fx.map(label).join('/'));return{score,reasons};}
function updateRecommendSeries(seedId=''){const series=$('#recommendSeries').value,list=cards.filter(c=>c.series===series&&!c.pendingOfficial&&c.type!=='AP 卡'&&c.type!=='BP 標誌');$('#seed').innerHTML=list.map(c=>option(c.id,`${c.id} ${c.name}`)).join('')||option('',series?'此 IP 尚無已核對的核心卡':'請先選擇作品 IP');$('#seed').value=list.some(c=>c.id===seedId)?seedId:(list[0]?.id||'');$('#seed').disabled=!list.length;$('#run').disabled=!list.length;$('#recs').innerHTML=`<div class="empty">${!series?'請先選擇作品 IP，再選擇核心卡產生推薦。':!list.length?'此 IP 目前只有待核對的預覽卡，暫不提供推薦。':'請選擇核心卡並產生推薦。'}</div>`;}
function rec(){const a=cardById.get($('#seed').value);if(!a||a.pendingOfficial||a.type==='AP 卡'||a.type==='BP 標誌'||a.series!==$('#recommendSeries').value)return;const list=cards.filter(b=>!b.pendingOfficial&&b.type!=='BP 標誌'&&b.id!==a.id&&b.series===a.series&&b.type!=='AP 卡').map(b=>({b,...syn(a,b)})).sort((a,b)=>b.score-a.score||a.b.id.localeCompare(b.b.id)).slice(0,6);$('#recs').innerHTML=`<h3>${esc(a.series)} · 與「${esc(a.name)} · ${esc(a.id)}」搭配</h3>`+list.map(x=>`<div class="rec"><b>${esc(x.b.name)}</b> <span class="tag">${x.score} 分</span><div class="meta">${esc(x.b.id)} · ${esc(x.b.color)} · ${x.b.type} · 能源 ${x.b.cost}</div><div class="price-caption price">${esc(priceSummary(x.b.id))}</div><div class="muted">${esc(x.reasons.join(' · ')||'同作品的其他選擇')}</div><div class="actions"><button class="btn" onclick="add('${x.b.id}')">加入卡組</button><button class="btn" onclick="show('browse');detail('${x.b.id}',true)">查看卡片</button></div></div>`).join('');}
function goRec(id){const c=cardById.get(id);if(!c||c.pendingOfficial||c.type==='AP 卡'||c.type==='BP 標誌')return;show('recommend');$('#recommendSeries').value=c.series;updateRecommendSeries(id);rec();}
function show(id){$$('.view').forEach(v=>v.classList.toggle('hidden',v.id!==id));$$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));if(id==='deck')deckUI();}
function backToSearch(){
  const q=$('#q'),reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});
  setTimeout(()=>q.focus({preventScroll:true}),reduce?0:350);
}
function updateToTop(){$('#toTop').classList.toggle('hidden',$('#browse').classList.contains('hidden')||window.scrollY<600);}
addEventListener('scroll',updateToTop,{passive:true});
document.addEventListener('click',e=>{if(e.target.closest('.tabs button'))setTimeout(updateToTop)});
init();
