'use strict';
// 將 guides/*.md 轉成 data/guides.json 與 data/guides.js，並核對卡號、作品與組牌張數。
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),dir=path.join(root,'guides');
const ctx=vm.createContext({});
for(const file of ['data/cards.js','data/rules.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const {officialCardData,officialRules}=vm.runInContext('({officialCardData,officialRules})',ctx);
const cardById=new Map(officialCardData.cards.map(c=>[c.id,c]));
const listFields=new Set(['tags','keyCards']);
function parseGuide(file,text){
  const errors=[],m=text.replace(/^﻿/,'').replace(/\r\n/g,'\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if(!m)return {errors:[`${file}：開頭缺少 --- 包住的攻略資料`]};
  const meta={deck:{}};let inDeck=false;
  for(const [i,line] of m[1].split('\n').entries()){
    if(!line.trim()||line.trim().startsWith('#'))continue;
    const entry=line.match(/^\s+-\s*([A-Z0-9]+-\d+-\d+)\s*[x×*]\s*(\d+)\s*$/i);
    if(inDeck&&entry){const id=entry[1].toUpperCase();if(meta.deck[id])errors.push(`${file}：牌組列表重複卡號 ${id}`);meta.deck[id]=Number(entry[2]);continue;}
    const kv=line.match(/^([A-Za-z]+):\s*(.*)$/);
    if(!kv){errors.push(`${file}：第 ${i+2} 行無法讀取「${line.trim()}」`);continue;}
    inDeck=kv[1]==='deck';if(inDeck)continue;
    meta[kv[1]]=listFields.has(kv[1])?kv[2].split(/[,，、]/).map(s=>s.trim()).filter(Boolean):kv[2].trim();
  }
  meta.body=m[2].trim();
  return {meta,errors};
}
function validate(file,g){
  const errors=[];
  for(const k of ['id','title','series','summary','updated'])if(!g[k])errors.push(`${file}：缺少 ${k}`);
  if(g.id&&!/^[a-z0-9-]+$/.test(g.id))errors.push(`${file}：id 只能使用小寫英數字與 -`);
  if(g.updated&&!/^\d{4}-\d{2}-\d{2}$/.test(g.updated))errors.push(`${file}：updated 須為 YYYY-MM-DD`);
  if(g.series&&!officialCardData.sources.some(s=>s.title===g.series))errors.push(`${file}：找不到作品「${g.series}」，請使用卡表的作品名稱`);
  let main=0,ap=0;
  for(const [id,n] of Object.entries(g.deck)){
    const c=cardById.get(id);
    if(!c){errors.push(`${file}：卡表沒有 ${id}`);continue;}
    if(c.pendingOfficial)errors.push(`${file}：${id} 是待核對的預覽卡，不能列入牌組`);
    if(c.series!==g.series)errors.push(`${file}：${id} 屬於「${c.series}」，不是「${g.series}」`);
    const isAP=c.typeJa==='アクションポイント',limit=isAP?3:(officialRules.limits[id]??4);
    if(n<1||n>limit)errors.push(`${file}：${id} 放了 ${n} 張，上限 ${limit} 張`);
    if(isAP)ap+=n;else main+=n;
  }
  if(main!==50)errors.push(`${file}：主牌組是 ${main} 張，須剛好 50 張`);
  if(ap>3)errors.push(`${file}：AP 卡 ${ap} 張，最多 3 張`);
  for(const id of g.keyCards||[])if(!g.deck[id])errors.push(`${file}：關鍵卡 ${id} 不在牌組列表`);
  for(const [,id] of g.body.matchAll(/\[\[([^\]]+)\]\]/g))if(!cardById.has(id.trim().toUpperCase()))errors.push(`${file}：內文引用的 ${id} 不在卡表`);
  return errors;
}
function build(){
  const files=fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.md')&&!f.startsWith('_')).sort():[];
  const guides=[],errors=[],ids=new Set();
  for(const file of files){
    const {meta,errors:parseErrors}=parseGuide(file,fs.readFileSync(path.join(dir,file),'utf8'));
    errors.push(...parseErrors);if(!meta)continue;
    errors.push(...validate(file,meta));
    if(ids.has(meta.id))errors.push(`${file}：id「${meta.id}」重複`);ids.add(meta.id);
    guides.push({id:meta.id,title:meta.title,series:meta.series,author:meta.author||'',updated:meta.updated,tags:meta.tags||[],summary:meta.summary,keyCards:meta.keyCards||[],source:meta.source||'',sourceUrl:meta.sourceUrl||'',deck:meta.deck,body:meta.body});
  }
  guides.sort((a,b)=>b.updated.localeCompare(a.updated)||a.title.localeCompare(b.title,'zh-Hant'));
  return {guides,errors};
}
if(require.main===module){
  const {guides,errors}=build();
  if(errors.length){console.error(errors.join('\n'));process.exit(1);}
  const data={cardDataUpdatedAt:officialCardData.updatedAt,count:guides.length,guides};
  fs.writeFileSync(path.join(root,'data/guides.json'),JSON.stringify(data,null,2)+'\n');
  fs.writeFileSync(path.join(root,'data/guides.js'),`const deckGuides = ${JSON.stringify(data)};\n`);
  console.log(`已建置 ${guides.length} 篇攻略 → data/guides.json、data/guides.js`);
}
module.exports={parseGuide,validate,build};
