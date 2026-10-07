const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync('data/cards.json','utf8'));
assert.equal(data.cardCount,data.cards.length);assert.equal(data.printCount,data.cards.reduce((n,c)=>n+c.prints.length,0));
assert.equal(data.sources.length,58);
assert.equal(data.cards.filter(c=>c.series==='鏈鋸人').length,92);
assert.equal(data.cards.filter(c=>c.series==='咒術迴戰').length,211);
assert.equal(data.cards.filter(c=>c.series==='犬夜叉').length,92);
assert.equal(data.sources.find(s=>s.title==='犬夜叉').printCount,121);
assert.equal(new Set(data.cards.map(c=>c.id)).size,data.cardCount);
assert.equal(new Set(data.cards.flatMap(c=>c.prints.map(p=>p.printId))).size,data.printCount);
// Complete numbered runs for all boosters, starter-exclusive cards and New Card Selection.
for(const [prefix,start,end] of [['CSM-1',1,80],['JJK-1',1,109],['JJK-2',1,11],['JJK-3',1,73],['IYS-1',1,80]]){
  for(let n=start;n<=end;n++)assert.ok(data.cards.some(c=>c.id===`${prefix}-${String(n).padStart(3,'0')}`),`${prefix}-${n} missing`);
}
for(const c of data.cards){
  assert.ok(c.nameJa&&c.source);
  if(c.pendingOfficial){assert.ok(c.source.startsWith('https://rugiacreation.com/ua/search?'));assert.equal(c.cost,null);assert.equal(c.ap,null);continue;}
  assert.ok(c.source.startsWith('https://www.unionarena-tcg.com/jp/cardlist/'));
  assert.ok(c.text&&c.triggerText);
  if(c.typeJa!=='アクションポイント'){assert.ok(Number.isInteger(c.cost));assert.ok(Number.isInteger(c.ap));}
  if(c.typeJa==='キャラクター')assert.ok(Number.isInteger(c.bp));
  else assert.equal(c.bp,null);
  assert.ok(!c.text.includes('<img'));
}
const byId=id=>data.cards.find(c=>c.id===id);
assert.equal(byId('CSM-1-002').cost,0);
assert.equal(byId('CSM-1-008').generatedEnergy[0].amount,2);
assert.equal(byId('JJK-1-012').bp,5000);
assert.equal(byId('JJK-1-012').ap,2);
assert.equal(byId('JJK-1-094').bp,null);
assert.ok(data.cards.some(c=>c.generatedEnergy.some(e=>e.variable)));
const context=vm.createContext({console,addEventListener:()=>{},document:{querySelector:()=>null,querySelectorAll:()=>[],addEventListener:()=>{}}});
vm.runInContext(fs.readFileSync('data/cards.js','utf8'),context);
vm.runInContext(fs.readFileSync('prices.js','utf8'),context);
vm.runInContext(fs.readFileSync('data/rules.js','utf8'),context);
vm.runInContext(fs.readFileSync('data/images.js','utf8'),context);
vm.runInContext(fs.readFileSync('data/reference-decks.js','utf8'),context);
vm.runInContext(fs.readFileSync('recommendations.js','utf8'),context);
vm.runInContext(fs.readFileSync('search-controls.js','utf8'),context);
// Exercise pure filtering and deck constraints without starting the DOM renderer.
vm.runInContext(fs.readFileSync('app.js','utf8').replace(/init\(\);\s*$/,''),context);
function run(code){return vm.runInContext(code,context);}
assert.equal(run("filterCards(cards,{series:'鏈鋸人'}).length"),92);
assert.equal(run("filterCards(cards,{series:'犬夜叉'}).length"),92);
assert.ok(run("filterCards(cards,{q:'日暮籬',series:'犬夜叉'}).length")>0);
assert.ok(run("priceVersions('IYS-1-042').length")>0);
assert.equal(run("filterCards(cards,{type:'AP 卡'}).length"),data.cards.filter(c=>c.typeJa==='アクションポイント').length);
assert.ok(run("filterCards(cards,{cost:'0'}).every(c=>c.cost===0&&c.type!=='AP 卡')"));
assert.ok(run("filterCards(cards,{bpMin:'4000'}).every(c=>c.bp!==null&&c.bp>=4000)"));
assert.equal(run("filterCards(cards,{bpMin:'5000',bpMax:'1000'}).length"),0);
assert.ok(run("filterCards(cards,{q:'五條悟'}).length")>1);
assert.ok(run("filterCards(cards,{q:'UA02BT/JJK-1-012'}).some(c=>c.id==='JJK-1-012')"));
assert.ok(run("filterCards(cards,{trait:'none'}).every(c=>c.traits.length===0)"));
assert.ok(run("priceVersions('CSM-1-008').every(p=>p.number.endsWith('/CSM-1-008'))"));
assert.ok(run("priceVersions('CSM-1-001').length")>0);
assert.ok(run("priceVersions('CSM-1-008').length")>=4);
run("deckUI=()=>{}; for(let i=0;i<6;i++)add('CSM-1-008')");
assert.equal(run("deck['CSM-1-008']"),4);
run("for(let i=0;i<4;i++)add('CSM-1-AP01')");assert.equal(run('deckCounts().ap'),3);assert.equal(run('deckCounts().main'),4);
run("selectedPrices['CSM-1-008']='csm1/10008';add('CSM-1-001')");
assert.equal(run('deckPriceSummary(Object.entries(deck)).total'),run("selectedPrice('CSM-1-008').amount * 4"));
assert.equal(run('deckPriceSummary(Object.entries(deck)).missing'),4);
run("for(const id of Object.keys(deck))delete deck[id]; for(let i=0;i<6;i++)add('IYS-1-042'); for(let i=0;i<4;i++)add('IYS-1-AP01')");
assert.equal(run("deck['IYS-1-042']"),4);
assert.equal(run('deckCounts().ap'),3);
assert.equal(run('deckCounts().main'),4);
assert.ok(run("filterCards(cards,{restriction:'limited'}).length")>0);
assert.ok(run("filterCards(cards,{restriction:'normal'}).every(c=>!c.pendingOfficial&&c.type!=='AP 卡'&&cardLimit(c)===4)"));
// Exercise limits for newly imported titles.
run("cardById.set('IMS-3-040',{id:'IMS-3-040',type:'事件'});cardById.set('EVA-1-105',{id:'EVA-1-105',type:'角色'});for(let i=0;i<5;i++){add('IMS-3-040');add('EVA-1-105')}");
assert.equal(run("deck['IMS-3-040']"),1);
assert.equal(run("deck['EVA-1-105']"),2);
assert.equal(run("filterCards([{id:'IMS-3-040',type:'事件'},{id:'EVA-1-105',type:'角色'}],{restriction:'1'}).length"),1);
for(const source of data.sources)assert.equal(source.cardCount,data.cards.filter(c=>c.series===source.title).length);
run("const pending=cards.find(c=>c.pendingOfficial);add(pending.id)");assert.equal(run("deck[cards.find(c=>c.pendingOfficial).id]"),undefined);
// Changing IP resets both the core-card list and any previous recommendations.
const recNodes=Object.fromEntries(['#recommendSeries','#seed','#run','#recs'].map(id=>[id,{value:'',innerHTML:'',disabled:false}]));
context.document.querySelector=id=>recNodes[id]||null;
run('updateRecommendSeries()');assert.equal(recNodes['#run'].disabled,true);
for(const series of new Set(data.cards.map(c=>c.series))){
  recNodes['#recommendSeries'].value=series;run('updateRecommendSeries()');
  assert.ok(!recNodes['#recs'].innerHTML.includes('class="rec"'));
  if(!recNodes['#seed'].value){assert.equal(recNodes['#run'].disabled,true);continue;}
  assert.equal(byId(recNodes['#seed'].value).series,series);
  const coreIds=[...recNodes['#seed'].innerHTML.matchAll(/value="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(coreIds.every(id=>byId(id).series===series&&!byId(id).pendingOfficial&&byId(id).typeJa!=='アクションポイント'));
  run('rec()');
  const ids=[...recNodes['#recs'].innerHTML.matchAll(/onclick="add\('([^']+)'\)"/g)].map(m=>m[1]);
  assert.ok(ids.length>0);assert.ok(ids.every(id=>byId(id).series===series&&id!==recNodes['#seed'].value));
}
run("goRec('IYS-1-042')");assert.equal(recNodes['#recommendSeries'].value,'犬夜叉');assert.equal(recNodes['#seed'].value,'IYS-1-042');
console.log(`PASS: ${data.cardCount} cards / ${data.printCount} prints across 58 titles, complete numbered sets, official numeric fixtures, filters, exact card-number prices, reprint limits and separate AP count.`);
