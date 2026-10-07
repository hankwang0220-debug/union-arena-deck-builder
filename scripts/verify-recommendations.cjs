const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {normalizeId,buildSnapshot}=require('./import-uptcg-decks.cjs');
assert.equal(normalizeId('UA53BT_CSM-1-003_2'),'CSM-1-003');
assert.equal(normalizeId('UA53BT/CSM-1-003'),'CSM-1-003');
assert.equal(normalizeId('UAPR_CSM-P-001'),'CSM-P-001');
assert.equal(normalizeId('UA53BT_CSM-1-AP01'),'CSM-1-AP01');
assert.equal(normalizeId('invalid'),'');
const snapshot=JSON.parse(fs.readFileSync('data/reference-decks.json')),official=JSON.parse(fs.readFileSync('data/cards.json'));
const officialById=new Map(official.cards.map(c=>[c.id,c])),fingerprints=new Set();
for(const d of snapshot.decks){
  assert.equal(Object.values(d.cards).reduce((a,b)=>a+b,0),50);
  for(const [id,n] of Object.entries(d.cards)){const c=officialById.get(id);assert.ok(c&&!c.pendingOfficial);assert.equal(c.series,d.series);assert.notEqual(c.typeJa,'アクションポイント');assert.ok(n>0&&n<=4);}
  const signature=JSON.stringify(Object.entries(d.cards).sort(([a],[b])=>a.localeCompare(b)));assert.ok(!fingerprints.has(signature));fingerprints.add(signature);
}
const first=snapshot.decks[0],raw=Object.entries(first.cards).flatMap(([id,n])=>Array.from({length:n},()=>({id:'UA00BT_'+id})));
const fixture=buildSnapshot([{id:'a',cards:raw},{id:'b',cards:raw},{cards:raw.slice(1)},{cards:[...raw.slice(1),{id:'UNKNOWN-1-001'}]}],official,'2026-10-07');
assert.equal(fixture.decks.length,1);assert.equal(fixture.excluded.duplicate,1);assert.equal(fixture.excluded.invalid,2);
const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{dataset:{},value:'',innerHTML:'',scrollIntoView(){}});return nodes.get(id);};
const ctx=vm.createContext({console,addEventListener(){},document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){}},window:{matchMedia:()=>({matches:false})}});
for(const file of ['data/cards.js','prices.js','data/rules.js','data/images.js','data/reference-decks.js','recommendations.js','search-controls.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8').replace(/init\(\);\s*$/,''),ctx);
const run=s=>vm.runInContext(s,ctx);
for(const id of new Set(snapshot.decks.flatMap(d=>Object.keys(d.cards)))){
  const actual=run(`recommendationsFor(cardById.get('${id}'))`),matches=snapshot.decks.filter(d=>d.cards[id]);
  assert.equal(actual.evidence,true);assert.equal(actual.matches.length,matches.length);
  for(const x of actual.items){assert.equal(x.count,matches.filter(d=>d.cards[x.b.id]).length);assert.equal(x.b.series,officialById.get(id).series);assert.notEqual(x.b.id,id);assert.equal(x.quantities.length,x.count);}
  assert.ok(actual.items.every((x,i,all)=>!i||all[i-1].count>=x.count));
}
const covered=Object.keys(first.cards)[0];run(`detail('${covered}',true)`);
assert.ok(node('#detail').innerHTML.includes('牌組常見搭配'));assert.ok(node('#detail').innerHTML.indexOf('牌組常見搭配')<node('#detail').innerHTML.indexOf('card-art'));
assert.ok(node('#detail').innerHTML.includes('牌組代碼'));assert.ok(node('#detail').innerHTML.includes('加入卡組'));
const uncovered=run("cards.find(c=>!c.pendingOfficial&&c.type!=='AP 卡'&&!referenceDecksByCard.has(c.id)).id");
assert.equal(run(`recommendationsFor(cardById.get('${uncovered}')).evidence`),false);
assert.ok(run(`recommendationsHTML(cardById.get('${uncovered}'))`).includes('尚無牌組紀錄'));
assert.equal(run("recommendationsHTML(cards.find(c=>c.type==='AP 卡'))"),'');
assert.equal(run("recommendationsHTML(cards.find(c=>c.pendingOfficial))"),'');
const inline=run(`catalogRecommendationsHTML(cardById.get('${covered}'))`);
const collapsed=inline.split('<details class="catalog-more">')[0];
assert.equal((collapsed.match(/class="catalog-pair"/g)||[]).length,3);
assert.equal((inline.match(/class="catalog-pair"/g)||[]).length,6);
assert.ok(inline.includes('pair-zoom'));assert.ok(inline.includes('共同收錄'));assert.ok(inline.includes('參考牌組'));
assert.ok(inline.includes('aria-label="加入搭配卡'));assert.ok(inline.includes('onclick="add('));
assert.ok(run(`catalogRecommendationsHTML(cardById.get('${uncovered}'))`).includes('尚無牌組紀錄'));
assert.equal(run("catalogRecommendationsHTML(cards.find(c=>c.type==='AP 卡'))"),'');
assert.equal(run("catalogRecommendationsHTML(cards.find(c=>c.pendingOfficial))"),'');
console.log(`PASS: ${snapshot.decks.length} unique complete decks; exact pair counts, source quantities, ranking, IP isolation, detail placement and explicit fallback.`);
