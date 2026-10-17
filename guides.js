'use strict';
// 牌組攻略：資料由 scripts/build-guides.cjs 從 guides/*.md 產生到 data/guides.js。
const guideById=new Map(deckGuides.guides.map(g=>[g.id,g]));
let activeGuideId=null,guidePreviewId=null;
function guideRef(id){const c=cardById.get(id);return c?`<button type="button" class="guide-ref" onclick="previewGuideCard('${esc(id)}')">${esc(c.name)}<span class="meta">${esc(id)}</span></button>`:esc(id);}
function guideInline(text){
  return esc(text)
    .replace(/\[\[([A-Za-z0-9-]+)\]\]/g,(_,id)=>guideRef(id.toUpperCase()))
    .replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
    .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>');
}
function guideMarkdown(md){
  const out=[];let list=null,para=[];
  const flushPara=()=>{if(para.length)out.push(`<p>${guideInline(para.join(' '))}</p>`);para=[];};
  const flushList=()=>{if(list)out.push(`<${list.tag}>${list.items.map(i=>`<li>${guideInline(i)}</li>`).join('')}</${list.tag}>`);list=null;};
  for(const raw of String(md).split('\n')){
    const line=raw.trim();let m;
    if(!line){flushPara();flushList();continue;}
    if((m=line.match(/^(#{2,3})\s+(.*)$/))){flushPara();flushList();out.push(m[1].length===2?`<h3>${guideInline(m[2])}</h3>`:`<h4>${guideInline(m[2])}</h4>`);continue;}
    if((m=line.match(/^>\s?(.*)$/))){flushPara();flushList();out.push(`<p class="notice">${guideInline(m[1])}</p>`);continue;}
    if((m=line.match(/^([-*]|\d+\.)\s+(.*)$/))){flushPara();const tag=/\d/.test(m[1])?'ol':'ul';if(list?.tag!==tag){flushList();list={tag,items:[]};}list.items.push(m[2]);continue;}
    flushList();para.push(line);
  }
  flushPara();flushList();
  return out.join('');
}
function guideColors(g){return [...new Set(Object.keys(g.deck).map(id=>cardById.get(id)).filter(c=>c&&c.type!=='AP 卡').map(c=>c.color))];}
function guideCover(g){const c=cardById.get(g.keyCards[0]||Object.keys(g.deck)[0]);return c?imageTag(c):'';}
function guideFilters(){return {series:$('#guideSeries').value,tag:$('#guideTag').value,q:normalize($('#guideQuery').value||'')};}
function filterGuides(list,f){
  return list.filter(g=>{
    if(f.series&&g.series!==f.series)return false;
    if(f.tag&&!g.tags.includes(f.tag))return false;
    if(!f.q)return true;
    const deckText=Object.keys(g.deck).map(id=>{const c=cardById.get(id);return c?`${id} ${c.name} ${c.nameJa}`:id;}).join(' ');
    return normalize([g.title,g.series,g.author,g.summary,...g.tags,g.body,deckText].join(' ')).includes(f.q);
  });
}
function renderGuideList(){
  const list=filterGuides(deckGuides.guides,guideFilters());
  $('#guideCount').textContent=`找到 ${list.length}／${deckGuides.guides.length} 篇攻略`;
  $('#guideList').innerHTML=list.map(g=>`<article class="guide-entry"><button type="button" class="card guide-card" style="--card-color:${colorHex[guideColors(g)[0]]||'var(--border)'}" onclick="openGuide('${esc(g.id)}')">${guideCover(g)}<span class="meta">${esc(g.series)} · ${esc(guideColors(g).join('／'))}</span><span class="name">${esc(g.title)}</span><span class="guide-summary">${esc(g.summary)}</span><span>${g.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</span><span class="meta">${esc(g.updated)}${g.author?` · ${esc(g.author)}`:''}</span></button></article>`).join('')||'<p class="muted">沒有符合條件的攻略。</p>';
}
function guideDeckHTML(g){
  const entries=Object.entries(g.deck).map(([id,n])=>[cardById.get(id),n]).filter(([c])=>c);
  const order={'角色':0,'事件':1,'場地':2,'AP 卡':3};
  entries.sort(([a],[b])=>(order[a.type]??9)-(order[b.type]??9)||(a.cost??0)-(b.cost??0)||a.id.localeCompare(b.id));
  const groups=[...new Set(entries.map(([c])=>c.type))];
  const main=entries.filter(([c])=>c.type!=='AP 卡'),curve={};
  for(const [c,n] of main){const k=c.cost>=6?'6+':String(c.cost);curve[k]=(curve[k]||0)+n;}
  const curveKeys=['0','1','2','3','4','5','6+'],max=Math.max(1,...Object.values(curve));
  return `<div class="guide-curve" aria-label="需要能源分布">${curveKeys.map(k=>`<div><span class="guide-bar" style="height:${Math.round((curve[k]||0)/max*60)}px"></span><b>${curve[k]||0}</b><span class="meta">能源 ${k}</span></div>`).join('')}</div>`+
    groups.map(type=>{const rows=entries.filter(([c])=>c.type===type);return `<h4>${esc(type)}（${rows.reduce((s,[,n])=>s+n,0)}）</h4><div class="guide-deck">${rows.map(([c,n])=>`<button type="button" class="guide-deck-card ${g.keyCards.includes(c.id)?'key':''}" onclick="previewGuideCard('${esc(c.id)}')">${imageTag(c)}<span class="guide-qty">×${n}</span><span class="meta">${esc(c.id)}</span><span>${esc(c.name)}</span></button>`).join('')}</div>`;}).join('');
}
function openGuide(id,updateHash=true){
  const g=guideById.get(id);if(!g)return;
  activeGuideId=id;show('guides');
  $('#guideBrowse').hidden=true;$('#guideArticle').hidden=false;
  const main=Object.entries(g.deck).filter(([c])=>cardById.get(c)?.type!=='AP 卡').reduce((s,[,n])=>s+n,0);
  $('#guideArticle').innerHTML=`<button type="button" class="btn" onclick="closeGuide()">← 返回攻略列表</button><div class="meta guide-meta">${esc(g.series)} · 更新 ${esc(g.updated)}${g.author?` · ${esc(g.author)}`:''}</div><h2>${esc(g.title)}</h2><p>${esc(g.summary)}</p><p>${g.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</p>${g.source?`<p class="muted price-note">來源：${g.sourceUrl?`<a href="${esc(g.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(g.source)} ↗</a>`:esc(g.source)}</p>`:''}<div class="actions guide-actions"><button type="button" class="btn primary" onclick="copyGuideDeck('${esc(g.id)}')">複製到我的牌組</button><button type="button" class="btn" onclick="copyGuideLink('${esc(g.id)}')">複製攻略連結</button></div><p id="guideStatus" class="muted price-note" role="status"></p><section class="guide-body">${guideMarkdown(g.body)}</section><h3>牌組列表 · 主牌組 ${main} 張</h3>${guideDeckHTML(g)}`;
  previewGuideCard(g.keyCards[0]||Object.keys(g.deck)[0]);
  if(updateHash&&location.hash!=='#guide='+id)history.replaceState(null,'','#guide='+id);
  window.scrollTo({top:$('#guides').offsetTop-10});
}
function closeGuide(){activeGuideId=null;$('#guideArticle').hidden=true;$('#guideBrowse').hidden=false;if(location.hash.startsWith('#guide='))history.replaceState(null,'',location.pathname+location.search);renderGuideList();}
function previewGuideCard(id){
  const c=cardById.get(id);if(!c)return;guidePreviewId=id;
  $('#guidePreview').innerHTML=`<div class="meta">${esc(c.id)} · ${esc(c.type)} · ${esc(c.color)}</div><h3>${esc(c.name)}</h3>${imageTag(c,true)}<dl class="stats"><div class="stat"><dt>需要能源</dt><dd>${esc(c.cost??'—')}</dd></div><div class="stat"><dt>消費 AP</dt><dd>${esc(c.ap??'—')}</dd></div><div class="stat"><dt>BP</dt><dd>${esc(c.bpText)}</dd></div></dl><p class="rules-text">${esc(c.textZh||c.text)}</p>${c.triggerTextZh&&c.triggerTextZh!=='無觸發效果'?`<p class="muted">觸發：${esc(c.triggerTextZh)}</p>`:''}<button type="button" class="btn" onclick="show('browse');detail('${esc(c.id)}',true)">在卡片資料庫查看</button>`;
  if(window.matchMedia('(max-width:800px)').matches&&activeGuideId&&document.activeElement?.closest?.('.guide-deck-card,.guide-ref'))$('#guidePreview').scrollIntoView({behavior:'smooth',block:'start'});
}
function copyGuideDeck(id){
  const g=guideById.get(id);if(!g)return;
  const copy={name:g.title,series:g.series,cards:{...g.deck}},signature=JSON.stringify(sharedDeckPayload(copy));
  let existing=decks.find(d=>JSON.stringify(sharedDeckPayload(d))===signature);
  if(!existing){existing={...copy,id:globalThis.crypto?.randomUUID?.()||`guide-${Date.now()}-${Math.random()}`};decks.push(existing);}
  switchDeck(existing.id);
  $('#guideStatus').textContent=`已加入「我的卡組」：${g.title}。原有牌組不會變更。`;
}
async function copyGuideLink(id){
  const url=new URL(location.href);url.hash='guide='+id;
  try{await navigator.clipboard.writeText(url.href);$('#guideStatus').textContent='攻略連結已複製。';}catch{$('#guideStatus').textContent='請手動複製網址：'+url.href;}
}
function loadGuideFromURL(){if(location.hash.startsWith('#guide='))openGuide(decodeURIComponent(location.hash.slice(7)),false);}
function initGuides(){
  fillSelect('guideSeries',deckGuides.guides.map(g=>g.series),'全部作品');
  fillSelect('guideTag',deckGuides.guides.flatMap(g=>g.tags),'全部標籤');
  for(const id of ['guideSeries','guideTag','guideQuery'])$('#'+id).addEventListener('input',renderGuideList);
  $('#guidePreview').innerHTML='<div class="empty">點選攻略中的卡片，在這裡查看卡圖與效果。</div>';
  renderGuideList();
  addEventListener('hashchange',loadGuideFromURL);loadGuideFromURL();
}
initGuides();
