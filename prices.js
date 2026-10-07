// 遊々亭販売頁面的人工核對快照，2026-10-05（UTC+8）。
// 原始快照依角色分組保存；顯示時以正式卡號後段（如 CSM-1-008）配對。
const priceSnapshot = {date:'2026-10-05',currency:'JPY',source:'遊々亭',url:'https://yuyu-tei.jp/top/ua'};
// [正式卡號, 稀有度與商品名稱, 日圓售價, 查價時庫存, 商品路徑]
const priceData = {
'CSM-001':[
['UAPR/CSM-1-008','UR デンジ',3980,'售罄','csm1/10123'],
['UAPR/CSM-1-008','UR デンジ(WINNERver.)',7980,'售罄','csm1/10124'],
['UA53BT/CSM-1-008','SR★ デンジ(パラレル)',7980,'售罄','csm1/10009'],
['UA53BT/CSM-1-008','SR デンジ',1480,'有庫存','csm1/10008'],
['UA53BT/CSM-1-051','R★★ デンジ(パラレル)',29800,'售罄','csm1/10068'],
['UA53BT/CSM-1-006','R デンジ',80,'有庫存','csm1/10006'],
['UA53BT/CSM-1-007','R デンジ',120,'有庫存','csm1/10007'],
['UA53BT/CSM-1-051','R デンジ',80,'有庫存','csm1/10067'],
['UA53BT/CSM-1-050','U★ デンジ(パラレル)',980,'有庫存','csm1/10066'],
['UA53BT/CSM-1-005','U デンジ',50,'有庫存','csm1/10005'],
['UA53BT/CSM-1-050','U デンジ',50,'有庫存','csm1/10065'],
['UA53BT/CSM-1-003','C デンジ',30,'有庫存','csm1/10003'],
['UA53BT/CSM-1-004','C デンジ',30,'有庫存','csm1/10004'],
['UA53BT/CSM-1-049','C デンジ',30,'有庫存','csm1/10064']],
'CSM-002':[
['UA53BT/CSM-1-048','SR★★ チェンソーマン(パラレル)',29800,'售罄','csm1/10063'],
['UA53BT/CSM-1-048','SR チェンソーマン',980,'有庫存','csm1/10062'],
['UA53BT/CSM-1-047','R★ チェンソーマン(パラレル)',3980,'有庫存','csm1/10061'],
['UA53BT/CSM-1-047','R チェンソーマン',120,'有庫存','csm1/10060']],
'CSM-003':[
['UA53BT/CSM-1-061','SR★★ パワー(パラレル)',59800,'有庫存','csm1/10084'],
['UA53BT/CSM-1-061','SR パワー',980,'有庫存','csm1/10083'],
['UA53BT/CSM-1-060','R★ パワー(パラレル)',3980,'售罄','csm1/10082'],
['UA53BT/CSM-1-060','R パワー',80,'有庫存','csm1/10081'],
['UA53BT/CSM-1-013','U パワー',50,'有庫存','csm1/10015'],
['UA53BT/CSM-1-059','U パワー',50,'有庫存','csm1/10080'],
['UA53BT/CSM-1-057','C★ パワー(パラレル)',4980,'有庫存','csm1/10078'],
['UA53BT/CSM-1-012','C パワー',30,'有庫存','csm1/10014'],
['UA53BT/CSM-1-057','C パワー',30,'有庫存','csm1/10077'],
['UA53BT/CSM-1-058','C パワー',30,'有庫存','csm1/10079']],
'CSM-004':[
['UA53BT/CSM-1-056','SR★★ 早川 アキ(パラレル)',14800,'售罄','csm1/10076'],
['UA53BT/CSM-1-055','SR★ 早川 アキ(パラレル)',980,'有庫存','csm1/10074'],
['UA53BT/CSM-1-055','SR 早川 アキ',220,'有庫存','csm1/10073'],
['UA53BT/CSM-1-056','SR 早川 アキ',320,'有庫存','csm1/10075'],
['UA53BT/CSM-1-053','U★ 早川 アキ(パラレル)',980,'有庫存','csm1/10071'],
['UA53BT/CSM-1-011','U 早川 アキ',50,'有庫存','csm1/10013'],
['UA53BT/CSM-1-053','U 早川 アキ',50,'有庫存','csm1/10070'],
['UA53BT/CSM-1-054','U 早川 アキ',50,'有庫存','csm1/10072'],
['UA53BT/CSM-1-052','C 早川 アキ',30,'有庫存','csm1/10069']],
'CSM-005':[
['UA53BT/CSM-1-066','SR★★ 姫野(パラレル)',19800,'售罄','csm1/10091'],
['UA53BT/CSM-1-066','SR 姫野',320,'有庫存','csm1/10090'],
['UA53BT/CSM-1-065','U★ 姫野(パラレル)',980,'有庫存','csm1/10089'],
['UA53BT/CSM-1-064','U 姫野',50,'有庫存','csm1/10087'],
['UA53BT/CSM-1-065','U 姫野',50,'有庫存','csm1/10088'],
['UA53BT/CSM-1-063','C 姫野',30,'有庫存','csm1/10086']],
'JJK-001':[
['UAPR/JJK-1-040','UR 虎杖 悠仁',6980,'售罄','jjk1/10168'],
['UAPR/JJK-1-040','UR 虎杖 悠仁(WINNERver.)',19800,'售罄','jjk1/10169'],
['UA02BT/JJK-1-040','SR★★★ 虎杖 悠仁(パラレル/特別仕様)',29800,'售罄','jjk1/10055'],
['UA02BT/JJK-1-040','SR★★ 虎杖 悠仁(パラレル)',5980,'售罄','jjk1/10054'],
['EX04BT/JJK-3-043','SR★★ 虎杖 悠仁(パラレル)',7980,'售罄','jjk3/10056'],
['EX04BT/JJK-1-040','SR★ 虎杖 悠仁(パラレル)',3980,'售罄','jjk3/10001'],
['UA02BT/JJK-1-040','SR 虎杖 悠仁',2480,'有庫存','jjk1/10053'],
['EX04BT/JJK-3-043','SR 虎杖 悠仁',320,'售罄','jjk3/10055'],
['EX04BT/JJK-3-042','R★ 虎杖 悠仁(パラレル)',980,'售罄','jjk3/10054'],
['UA02BT/JJK-1-039','R 虎杖 悠仁',120,'有庫存','jjk1/10052'],
['EX04BT/JJK-3-013','R 虎杖 悠仁',220,'售罄','jjk3/10017'],
['EX04BT/JJK-3-042','R 虎杖 悠仁',120,'有庫存','jjk3/10053'],
['UA02BT/JJK-1-038','U★ 虎杖 悠仁(パラレル)',1780,'售罄','jjk1/10051'],
['UA02BT/JJK-1-002','U 虎杖 悠仁',50,'有庫存','jjk1/10002'],
['UA02BT/JJK-1-038','U 虎杖 悠仁',120,'售罄','jjk1/10050'],
['UA02ST/JJK-1-101','U 虎杖 悠仁',220,'有庫存','jjk1/10138'],
['EX04BT/JJK-3-041','U 虎杖 悠仁',50,'有庫存','jjk3/10052'],
['UA02BT/JJK-1-001','C 虎杖 悠仁',30,'有庫存','jjk1/10001'],
['UA02BT/JJK-1-037','C 虎杖 悠仁',30,'有庫存','jjk1/10048'],
['UA02ST/JJK-1-037','C 虎杖 悠仁',30,'有庫存','jjk1/10049'],
['EX04BT/JJK-3-040','C 虎杖 悠仁',30,'有庫存','jjk3/10051'],
['UA02NC/JJK-2-006','SP 虎杖 悠仁',2480,'有庫存','jjk2/10006'],
['UA02PB/JJK-1-039','PR-R 虎杖 悠仁',500,'售罄','jjk1/10157'],
['UAPR/JJK-1-038','PR-U 虎杖 悠仁(新仕様)',500,'有庫存','jjk1/10164'],
['UAPR/JJK-1-038','PR-U 虎杖 悠仁(旧仕様)',500,'有庫存','jjk1/10163']],
'JJK-002':[
['UA02BT/JJK-1-012','SR★★ 五条 悟(パラレル)',5980,'售罄','jjk1/10016'],
['EX04BT/JJK-3-052','SR★★ 五条 悟(パラレル)',14800,'售罄','jjk3/10069'],
['UA02BT/JJK-1-012','SR 五条 悟',680,'有庫存','jjk1/10015'],
['EX04BT/JJK-3-052','SR 五条 悟',220,'有庫存','jjk3/10068'],
['UA02BT/JJK-1-011','R★ 五条 悟(パラレル)',980,'售罄','jjk1/10014'],
['EX04BT/JJK-3-006','R★ 五条 悟(パラレル)',3980,'售罄','jjk3/10009'],
['UA02BT/JJK-1-011','R 五条 悟',120,'有庫存','jjk1/10013'],
['UA02BT/JJK-1-046','R 五条 悟',80,'有庫存','jjk1/10063'],
['UA02ST/JJK-1-103','R 五条 悟(キラなし)',80,'有庫存','jjk1/10140'],
['EX04BT/JJK-3-006','R 五条 悟',120,'有庫存','jjk3/10008'],
['EX04BT/JJK-3-051','U★ 五条 悟(パラレル)',1280,'售罄','jjk3/10067'],
['UA02BT/JJK-1-010','U 五条 悟',80,'有庫存','jjk1/10012'],
['UA02BT/JJK-1-045','U 五条 悟',50,'有庫存','jjk1/10061'],
['UA02ST/JJK-1-045','U 五条 悟',50,'有庫存','jjk1/10062'],
['EX04BT/JJK-3-051','U 五条 悟',50,'有庫存','jjk3/10066'],
['UA02BT/JJK-1-009','C 五条 悟',30,'有庫存','jjk1/10011'],
['UA02NC/JJK-2-004','SP 五条 悟',680,'售罄','jjk2/10004'],
['UAPR/JJK-1-045','PR-U 五条 悟',180,'有庫存','jjk1/10165'],
['UAPR/JJK-1-009','PR-C 五条 悟',120,'有庫存','jjk1/10161']],
'JJK-003':[
['UA02BT/JJK-1-022','SR★★ 伏黒 恵(パラレル)',4980,'售罄','jjk1/10028'],
['EX04BT/JJK-3-007','SR★ 伏黒 恵(パラレル)',680,'有庫存','jjk3/10011'],
['UA02BT/JJK-1-022','SR 伏黒 恵',320,'售罄','jjk1/10027'],
['UA02ST/JJK-1-107','SR 伏黒 恵(キラなし)',80,'有庫存','jjk1/10145'],
['UA02ST/JJK-1-107','SR 伏黒 恵',120,'有庫存','jjk1/10146'],
['EX04BT/JJK-3-007','SR 伏黒 恵',220,'有庫存','jjk3/10010'],
['EX04BT/JJK-3-056','R★ 伏黒 恵(パラレル)',500,'有庫存','jjk3/10074'],
['UA02BT/JJK-1-021','R 伏黒 恵',80,'有庫存','jjk1/10026'],
['EX04BT/JJK-3-056','R 伏黒 恵',80,'有庫存','jjk3/10073'],
['UA02BT/JJK-1-020','U 伏黒 恵',80,'有庫存','jjk1/10025'],
['UA02BT/JJK-1-057','U 伏黒 恵',50,'有庫存','jjk1/10079'],
['UA02BT/JJK-1-019','C 伏黒 恵',30,'有庫存','jjk1/10024'],
['UA02BT/JJK-1-056','C 伏黒 恵',30,'有庫存','jjk1/10077'],
['UA02ST/JJK-1-056','C 伏黒 恵',30,'有庫存','jjk1/10078'],
['UA02ST/JJK-1-106','C 伏黒 恵',30,'有庫存','jjk1/10144'],
['EX04BT/JJK-3-023','C 伏黒 恵',30,'有庫存','jjk3/10031'],
['EX04BT/JJK-3-055','C 伏黒 恵',30,'有庫存','jjk3/10072'],
['UA02NC/JJK-2-005','SP 伏黒 恵',220,'售罄','jjk2/10005'],
['UAPR/JJK-1-020','PR-U 伏黒 恵',120,'有庫存','jjk1/10162']],
'JJK-004':[
['UA02BT/JJK-1-008','SR★★ 釘崎 野薔薇(パラレル)',3980,'售罄','jjk1/10010'],
['EX04BT/JJK-3-049','SR★★ 釘崎 野薔薇(パラレル)',6980,'售罄','jjk3/10064'],
['UA02BT/JJK-1-008','SR 釘崎 野薔薇',320,'有庫存','jjk1/10009'],
['EX04BT/JJK-3-049','SR 釘崎 野薔薇',220,'有庫存','jjk3/10063'],
['UA02BT/JJK-1-007','R 釘崎 野薔薇',120,'有庫存','jjk1/10008'],
['EX04BT/JJK-3-048','U★ 釘崎 野薔薇(パラレル)',780,'售罄','jjk3/10062'],
['UA02BT/JJK-1-044','U 釘崎 野薔薇',50,'有庫存','jjk1/10059'],
['UA02ST/JJK-1-044','U 釘崎 野薔薇',50,'有庫存','jjk1/10060'],
['EX04BT/JJK-3-048','U 釘崎 野薔薇',50,'有庫存','jjk3/10061'],
['UA02BT/JJK-1-006','C 釘崎 野薔薇',30,'有庫存','jjk1/10007'],
['UA02BT/JJK-1-043','C 釘崎 野薔薇',80,'售罄','jjk1/10058'],
['UA02ST/JJK-1-102','C 釘崎 野薔薇',30,'有庫存','jjk1/10139'],
['EX04BT/JJK-3-047','C 釘崎 野薔薇',30,'有庫存','jjk3/10060'],
['UA02NC/JJK-2-002','SP 釘崎 野薔薇',220,'售罄','jjk2/10002'],
['UAPR/JJK-1-043','PR-C 釘崎 野薔薇',180,'售罄','jjk1/10167']]
};
const selectedPrices = {};
const exchangeRateSnapshot = {date:'2026-10-06',jpyToTwd:0.2010,source:'Investing.com',url:'https://jp.investing.com/currencies/jpy-twd-historical-data'};
const toTwd = amount => Math.round(amount * exchangeRateSnapshot.jpyToTwd);
const yen = amount => '¥' + amount.toLocaleString('zh-TW') + ' JPY（約 NT$' + toTwd(amount).toLocaleString('zh-TW') + '）';
function exchangeRateNote(){return `換算匯率：1 JPY = ${exchangeRateSnapshot.jpyToTwd.toFixed(4)} TWD · ${exchangeRateSnapshot.date} 快照，未自動更新。新台幣四捨五入至整元。<a href="${exchangeRateSnapshot.url}" target="_blank" rel="noopener noreferrer">匯率來源 ↗</a>`;}
const priceCatalog=Object.values(priceData).flat().map(([number,label,amount,stock,path])=>({number,label,amount,stock,path}));
const priceVersions = id => priceCatalog.filter(p=>p.number.split('/').pop()===id).sort((a,b)=>a.amount-b.amount);
const selectedPrice = id => priceVersions(id).find(p=>p.path===selectedPrices[id]);
function priceSummary(id){
  const chosen=selectedPrice(id), versions=priceVersions(id);
  if(chosen) return `${yen(chosen.amount)}／張 · ${chosen.stock}`;
  return versions.length ? `參考價 ${yen(versions[0].amount)} 起 · ${versions.length} 個價格版本` : '無價格資料';
}
function priceListHTML(id){
  const versions=priceVersions(id);
  if(!versions.length)return '';
  return `<span class="price-list">${versions.map(p=>{const parts=p.label.split(' ');const par=/パラレル/.test(p.label)?' 平行':'';return `<span class="price-row"><span>${esc(p.number.split('/')[0])} · ${esc(parts[0])}${par}</span><span class="price">${yen(p.amount)}</span><span class="muted">${p.stock}</span></span>`}).join('')}</span>`;
}
function priceVersionLabel(p){const c=cardById.get(p.number.split('/').pop());return c?p.label.replace(c.nameJa,c.name):p.label;}
function priceSelect(id){
  const versions=priceVersions(id);
  if(!versions.length)return '<div class="muted price-caption">此卡號無價格資料</div>';
  return `<select class="price-select" aria-label="選擇 ${esc(id)} 的價格版本" onchange="choosePrice('${id}',this.value)"><option value="">請選擇價格版本</option>${versions.map(p=>`<option value="${p.path}" ${selectedPrices[id]===p.path?'selected':''}>${esc(p.number)} · ${esc(priceVersionLabel(p))} · ${yen(p.amount)} · ${p.stock}</option>`).join('')}</select>`;
}
function priceDetail(id){
  const p=selectedPrice(id), versions=priceVersions(id), low=versions[0];
  return `<section class="price-box"><h3>遊々亭參考售價</h3><p class="muted">僅列出相同卡號的商品；普通版、平行版及再版分開選價。</p>${priceSelect(id)}${versions.length?`<div class="price-list detail">${versions.map(v=>`<div class="price-row"><span>${esc(v.number)} · ${esc(priceVersionLabel(v))}</span><span class="price">${yen(v.amount)}</span><span class="muted">${v.stock}</span></div>`).join('')}</div>`:''}<p>${p?`<b class="price">${yen(p.amount)}／張</b> · 查價時${p.stock}<br><a href="https://yuyu-tei.jp/sell/ua/card/${p.path}" target="_blank" rel="noopener noreferrer">查看這個版本的商品頁 ↗</a>`:low?`<b class="price">${yen(low.amount)} 起</b> · 同卡號最低價，共 ${versions.length} 個價格版本<br><span class="muted">選擇版本後才會計入牌組價格小計。</span>`:'無價格資料，不計入價格小計。'}</p><small class="muted">查價：${priceSnapshot.date} · 日圓販売售價，非買取價。價格與庫存可能變動，以商品頁為準。<br>${exchangeRateNote()}</small></section>`;
}
function choosePrice(id,path){
  if(path && !priceVersions(id).some(p=>p.path===path)) return;
  if(path) selectedPrices[id]=path; else delete selectedPrices[id];
  render(); deckUI();
  if(document.querySelector('#detail').dataset.cardId===id) detail(id);
  if(!document.querySelector('#recommend').classList.contains('hidden')) rec();
}
function deckPriceSummary(entries){
  let total=0,priced=0,missing=0,soldOut=0;
  for(const [id,quantity] of entries){const p=selectedPrice(id);if(p){total+=p.amount*quantity;priced+=quantity;if(p.stock==='售罄')soldOut+=quantity;}else missing+=quantity;}
  return {total,priced,missing,soldOut};
}
function deckPriceHTML(entries){
  const p=deckPriceSummary(entries);
  return `<section class="price-box"><h3>${p.missing?'已選版價格小計':'牌組參考總價'}</h3><b class="price">${yen(p.total)}</b><p class="muted">已估價 ${p.priced} 張${p.missing?` · 尚有 ${p.missing} 張未查價或未選版，未計入小計`:''}${p.soldOut?` · ${p.soldOut} 張查價時售罄`:''}</p><small class="muted">遊々亭 · ${priceSnapshot.date} 查價紀錄，非即時報價。包含所選 AP 卡，僅商品金額，未含運費及其他費用。<br>${exchangeRateNote()}</small></section>`;
}
