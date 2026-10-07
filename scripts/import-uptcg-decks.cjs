'use strict';
// Read the same anonymous public-deck feed used by UPTCG's community page.
const fs=require('node:fs');
const SOURCE='https://uptcg.app/unionarena/community';
function normalizeId(value){return String(value||'').match(/(?:^|[_/])([A-Z0-9]+-(?:\d+|P)-(?:\d+|AP\d+))(?:_\d+)?$/)?.[1]||'';}
function buildSnapshot(rows,official,updatedAt=new Date().toISOString()){
  const byId=new Map(official.cards.map(c=>[c.id,c])),seen=new Set(),decks=[];
  const excluded={invalid:0,duplicate:0};
  for(const row of rows){
    const counts={};let invalid=!Array.isArray(row.cards);
    for(const raw of row.cards||[]){const id=normalizeId(raw.id),card=byId.get(id);if(!card||card.pendingOfficial){invalid=true;break;}if(card.typeJa==='アクションポイント')continue;counts[id]=(counts[id]||0)+1;}
    const ids=Object.keys(counts),series=new Set(ids.map(id=>byId.get(id).series));
    if(invalid||series.size!==1||Object.values(counts).reduce((a,b)=>a+b,0)!==50||Object.values(counts).some(n=>n>4)){excluded.invalid++;continue;}
    const fingerprint=JSON.stringify(Object.entries(counts).sort(([a],[b])=>a.localeCompare(b)));
    if(seen.has(fingerprint)){excluded.duplicate++;continue;}seen.add(fingerprint);
    decks.push({id:row.id,name:String(row.name||'未命名牌組'),code:String(row.deck_code||''),series:[...series][0],publishedAt:row.created_at,source:SOURCE,cards:counts});
  }
  return {source:SOURCE,updatedAt,fetchedCount:rows.length,excluded,decks};
}
async function refresh(){
  const read=async url=>{const r=await fetch(url);if(!r.ok)throw Error(`HTTP ${r.status}: ${url}`);return r.text();};
  const html=await read(SOURCE),paths=[...html.matchAll(/src="([^" ]+\.js[^" ]*)"/g)].map(m=>m[1]);
  let endpoint,key;
  for(const path of paths){const js=await read(new URL(path,SOURCE));const match=js.match(/\("(https:\/\/[^" ]+\.supabase\.co)","(eyJ[^" ]+)"/);if(match){[,endpoint,key]=match;break;}}
  if(!key)throw Error('Public feed configuration not found; existing snapshot left unchanged.');
  const rows=[];
  for(let offset=0;offset<10000;offset+=200){
    const url=`${endpoint}/rest/v1/decks?select=id,name,series_code,cards,deck_code,created_at&is_public=eq.true&order=created_at.desc,id.asc&limit=200&offset=${offset}`;
    const r=await fetch(url,{headers:{apikey:key,Authorization:`Bearer ${key}`}});if(!r.ok)throw Error(`Public feed HTTP ${r.status}`);
    const batch=await r.json();rows.push(...batch);if(batch.length<200)break;if(offset===9800)throw Error('Feed exceeds import limit; snapshot not overwritten.');
  }
  const snapshot=buildSnapshot(rows,JSON.parse(fs.readFileSync('data/cards.json','utf8')));
  if(!snapshot.decks.length)throw Error('No complete matched decks; snapshot not overwritten.');
  fs.writeFileSync('data/reference-decks.json',JSON.stringify(snapshot,null,2)+'\n');
  fs.writeFileSync('data/reference-decks.js','const referenceDeckData='+JSON.stringify(snapshot)+';\n');
  console.log(`Imported ${snapshot.decks.length} unique complete decks from ${rows.length} public decks; excluded ${JSON.stringify(snapshot.excluded)}.`);
}
module.exports={normalizeId,buildSnapshot};
if(require.main===module)refresh().catch(e=>{console.error(e.message);process.exitCode=1;});
