const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({console,addEventListener(){},document:{querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}}});
for(const file of ['data/cards.js','prices.js','data/rules.js','data/images.js','search-controls.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8').replace(/init\(\);\s*$/,''),ctx);
const run=s=>vm.runInContext(s,ctx);
assert.ok(run("filterCards(cards,{nameOnly:'蕾潔'}).length")>0);
assert.ok(run("filterCards(cards,{nameOnly:'蕾潔'}).every(c=>(c.name+' '+c.nameJa).includes('蕾潔'))"));
assert.equal(run("filterCards(cards,{nameOnly:'CSM-1-003'}).length"),0);
assert.ok(run("filterCards(cards,{printSet:'UA53BT',illustration:'parallel',rarity:'SR★'}).some(c=>c.id==='CSM-1-008')"));
assert.equal(run("filterCards(cards,{q:'CSM-1-008',printSet:'UAPR',rarity:'SR★'}).length"),0);
assert.ok(run("filterCards(cards,{illustration:'normalNoStarter'}).every(c=>c.prints.some(p=>!p.printId.includes('_p')&&!p.rarity.includes('★')&&!/ST$/.test(p.number.split('/')[0])))"));
assert.ok(run("filterCards(cards,{bpExact:'4000'}).every(c=>c.bp===4000)"));
assert.ok(run("filterCards(cards,{generated:'variable:1'}).length")>0);
assert.ok(run("filterCards(cards,{generated:'variable:1'}).every(c=>c.generated===1&&c.generatedEnergy.some(e=>e.variable))"));
assert.ok(run("filterCards(cards,{rarity:'@stars:★★★'}).every(c=>c.prints.some(p=>p.rarity.endsWith('★★★')))"));
assert.equal(run("sourceEffectMatches({keywords:['インパクト無効']},'rugia:【衝擊】')"),false);
assert.equal(run("sourceEffectMatches({keywords:['インパクト（+1）']},'rugia:【衝擊１】')"),false);
assert.equal(run("sourceEffectMatches({keywords:['インパクト（1）']},'rugia:【衝擊１】')"),true);
assert.equal(run("sourceEffectMatches({keywords:['レストにする']},'rugia:＿休息＿')"),true);
assert.equal(run("sourceEffectMatches({keywords:[],textZh:'抽３張卡。',text:''},'rugia:抽Ｘ張卡')"),true);
assert.equal(run("sourceEffectMatches({keywords:[],textZh:'此角色的BP+1000。',text:''},'rugia:BP+')"),true);
assert.ok(run("filterCards(cards,{series:'鏈鋸人',keyword:'rugia:【突襲】',effect:'蕾潔'}).length")>0);
for(const [order,key,direction] of [['apAsc','ap',1],['costDesc','cost',-1],['bpAsc','bp',1],['generatedDesc','generated',-1]]){
  assert.ok(run(`sortCards(cards.filter(c=>c.${key}!==null).slice(), '${order}').every((c,i,a)=>!i||(${direction})*(c.${key}-a[i-1].${key})>=0)`));
}
console.log('PASS: name-only search, same-print filters, artwork variants, exact BP, variable energy, star levels, source effect matching and sorting.');
