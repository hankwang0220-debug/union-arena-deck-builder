const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const official=JSON.parse(fs.readFileSync('data/cards.json')),reference=JSON.parse(fs.readFileSync('data/reference-decks.json'));
const nodes=new Map(),storage=new Map();
const node=s=>{if(!nodes.has(s))nodes.set(s,{value:'',textContent:'',hidden:true,innerHTML:'',dataset:{}});return nodes.get(s);};
const location={href:'https://example.com/union-arena-deck-builder/',hash:'',hostname:'example.com',protocol:'https:'};
const ctx=vm.createContext({console,TextEncoder,TextDecoder,URL,btoa,atob,addEventListener(){},document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},window:{location}});
for(const file of ['data/cards.js','prices.js','data/rules.js','data/images.js','data/reference-decks.js','recommendations.js','deck-sharing.js','search-controls.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8').replace(/init\(\);\s*$/,''),ctx);
const run=s=>vm.runInContext(s,ctx),base=reference.decks.find(d=>d.series==='鏈鋸人');
const ap=official.cards.find(c=>c.series===base.series&&c.typeJa==='アクションポイント'&&!c.pendingOfficial);
const fixture={name:'蕾潔＆炸彈 🃏「分享測試」',series:base.series,cards:{...base.cards,[ap.id]:3}};
ctx.fixture=fixture;
const token=run('encodeSharedDeck(fixture)'),restored=run(`decodeSharedDeck('${token}')`);
assert.deepEqual(JSON.parse(JSON.stringify(restored)),fixture);
const url=run('sharedDeckURL(fixture)');assert.equal(new URL(url).pathname,'/union-arena-deck-builder/');assert.ok(url.length<4000);
assert.deepEqual(JSON.parse(JSON.stringify(run("decodeSharedDeck(encodeSharedDeck({name:'空牌組',series:'',cards:{}}))"))),{name:'空牌組',series:'',cards:{}});
run("show=()=>{};deckUI=()=>saveDecks();deck['CSM-1-001']=2");
location.hash=new URL(url).hash;run('loadSharedDeckFromURL()');
assert.equal(run('decks.length'),2);assert.equal(run("decks[0].cards['CSM-1-001']"),2);
assert.deepEqual(JSON.parse(run('JSON.stringify(decks.find(d=>d.id===activeDeckId).cards)')),fixture.cards);
assert.equal(run('deckCounts().main'),50);assert.equal(run('deckCounts().ap'),3);
assert.equal(JSON.parse(storage.get('ua-deck-lab-decks-v1')).decks.length,2);
run('loadSharedDeckFromURL()');assert.equal(run('decks.length'),2);
run("deckUI=()=>{};$('#deckShareURL').value='';generateDeckShare()");
assert.equal(node('#deckShareURL').value,url);assert.equal(node('#deckShareOutput').hidden,false);
const before=run('JSON.stringify(decks)');
for(const bad of ['', '%%%',token.slice(0,10)])assert.throws(()=>run(`decodeSharedDeck(${JSON.stringify(bad)})`));
for(const bad of [
  {v:2,name:'a',series:'',cards:[]},
  {v:1,name:'a',series:'',cards:[['UNKNOWN-1-001',1]]},
  {v:1,name:'a',series:'',cards:[['CSM-1-001',1],['CSM-1-001',1]]},
  {v:1,name:'a',series:'',cards:[['CSM-1-001',0]]},
  {v:1,name:'a',series:'',cards:[[ap.id,4]]},
  {v:1,name:'a',series:'',cards:[...Object.entries(fixture.cards).filter(([id])=>id!==ap.id),['CSM-1-AP01',3],['CSM-1-AP02',1]]}
]){const invalid=Buffer.from(JSON.stringify(bad)).toString('base64url');assert.throws(()=>run(`decodeSharedDeck('${invalid}')`));location.hash='#deck='+invalid;run('loadSharedDeckFromURL()');assert.equal(run('JSON.stringify(decks)'),before);assert.ok(node('#deckImportStatus').textContent.includes('無法載入'));}
fs.writeFileSync('.cache/share-test.json',JSON.stringify({fixture,url:url.replace('https://example.com/union-arena-deck-builder/','http://localhost:8080/')}));
console.log(`PASS: exact Unicode name/IP and 50 main + 3 AP restoration, persistence, existing-deck preservation, deduplication, empty decks, corrupted and invalid payloads. URL ${url.length} characters.`);
