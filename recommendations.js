'use strict';
const referenceDecksByCard=new Map();
for(const d of referenceDeckData.decks)for(const id of Object.keys(d.cards)){
  if(!referenceDecksByCard.has(id))referenceDecksByCard.set(id,[]);
  referenceDecksByCard.get(id).push(d);
}
function recommendationsFor(a){
  if(!a||a.pendingOfficial||a.type==='AP 卡'||a.type==='BP 標誌')return {matches:[],items:[]};
  const matches=(referenceDecksByCard.get(a.id)||[]).filter(d=>d.series===a.series),pairs=new Map();
  for(const d of matches)for(const [id,count] of Object.entries(d.cards)){
    const b=cardById.get(id);if(!b||b.id===a.id||b.series!==a.series||b.pendingOfficial||b.type==='AP 卡')continue;
    if(!pairs.has(id))pairs.set(id,{b,count:0,quantities:[],sources:[]});
    const pair=pairs.get(id);pair.count++;pair.quantities.push(count);pair.sources.push(d);
  }
  const items=[...pairs.values()].sort((x,y)=>y.count-x.count||syn(a,y.b).score-syn(a,x.b).score||x.b.id.localeCompare(y.b.id)).slice(0,6);
  if(items.length)return {matches,items,evidence:true};
  return {matches,items:cards.filter(b=>!b.pendingOfficial&&b.type!=='BP 標誌'&&b.type!=='AP 卡'&&b.id!==a.id&&b.series===a.series).map(b=>({b,...syn(a,b)})).sort((x,y)=>y.score-x.score||x.b.id.localeCompare(y.b.id)).slice(0,6),evidence:false};
}
function recommendationsHTML(a,compact=false){
  const result=recommendationsFor(a);if(!result.items.length)return '';
  const date=referenceDeckData.updatedAt.slice(0,10);
  return `<section class="card-recommendations"><h3>${result.evidence?'牌組常見搭配':'搭配參考（尚無牌組紀錄）'}</h3><p class="muted price-note">${result.evidence?`UPTCG 公開完整牌組中，有 ${result.matches.length} 種不同組合收錄這張卡。依共同收錄次數排序，張數供組牌參考。`:'目前匯入的 UPTCG 完整牌組未收錄這張卡，以下依同作品的顏色、特徵與效果相似度提供參考。'}<br>資料快照：${esc(date)} · 社群組牌參考，不代表勝率。</p><div class="recommendation-grid ${compact?'compact':''}">${result.items.map(x=>`<article class="pair-card"><button class="pair-preview" onclick="show('browse');detail('${x.b.id}',true)" aria-label="查看 ${esc(x.b.name)} ${esc(x.b.id)}">${imageTag(x.b)}<b>${esc(x.b.name)}</b><span class="meta">${esc(x.b.id)} · ${esc(x.b.color)} · 能源 ${x.b.cost}</span></button>${result.evidence?`<div class="pair-evidence">共同收錄 ${x.count}/${result.matches.length} 組（${Math.round(x.count/result.matches.length*100)}%）<br>搭配卡收錄 ${Math.min(...x.quantities)}${Math.min(...x.quantities)===Math.max(...x.quantities)?'':'～'+Math.max(...x.quantities)} 張</div>`:`<p class="meta">${esc(x.reasons.join(' · ')||'同作品的其他選擇')}</p>`}<button class="btn" onclick="add('${x.b.id}')">加入卡組</button>${result.evidence?`<details class="pair-sources"><summary>參考牌組</summary>${x.sources.slice(0,3).map(d=>`<p><a href="${esc(d.source)}" target="_blank" rel="noopener noreferrer">${esc(d.name)} ↗</a><br><span class="meta">牌組代碼：${esc(d.code||'未提供')} · 收錄 ${d.cards[x.b.id]} 張</span></p>`).join('')}<span class="meta">至 UPTCG 社群輸入牌組代碼查看。</span></details>`:''}</article>`).join('')}</div><p class="muted price-note"><a href="${esc(referenceDeckData.source)}" target="_blank" rel="noopener noreferrer">UPTCG 公開牌組來源 ↗</a> · 已匯入 ${referenceDeckData.decks.length} 種完整組合，涵蓋 ${new Set(referenceDeckData.decks.map(d=>d.series)).size} 個 IP。</p></section>`;
}
function catalogRecommendationsHTML(a){
  const result=recommendationsFor(a);if(!result.items.length)return '';
  const row=x=>`<div class="catalog-pair"><button class="catalog-pair-preview" onclick="detail('${x.b.id}',true)" aria-label="查看搭配卡 ${esc(x.b.name)} ${esc(x.b.id)}"><span class="pair-thumbnail">${imageTag(x.b)}<span class="pair-zoom" aria-hidden="true">${imageTag(x.b,true)}</span></span><span class="catalog-pair-text"><b>${esc(x.b.name)}</b><span class="meta">${esc(x.b.id)}</span>${result.evidence?`<span class="catalog-pair-evidence">共同收錄 ${x.count}/${result.matches.length} 組<br>參考 ${Math.min(...x.quantities)}${Math.min(...x.quantities)===Math.max(...x.quantities)?'':'～'+Math.max(...x.quantities)} 張</span>`:`<span class="meta">${esc(x.reasons.join(' · ')||'同作品參考')}</span>`}</span></button><button class="btn pair-add" onclick="add('${x.b.id}')" aria-label="加入搭配卡 ${esc(x.b.name)} ${esc(x.b.id)}" title="加入目前牌組">＋</button></div>`;
  return `<button class="btn catalog-pair-toggle" type="button" aria-expanded="false" aria-controls="pairs-${esc(a.id)}" onclick="toggleCatalogPairs(this)">顯示搭配</button><section id="pairs-${esc(a.id)}" class="catalog-recommendations" aria-label="${esc(a.name)} ${esc(a.id)} 的搭配參考"><h3>${result.evidence?'常見搭配':'相似搭配參考'}</h3>${result.evidence?`<p class="meta">UPTCG · ${result.matches.length} 種參考組合</p>`:'<p class="meta">尚無牌組紀錄，依同作品相似度參考</p>'}${result.items.slice(0,3).map(row).join('')}<details class="catalog-more"><summary>展開更多搭配${result.evidence?'與來源':''}</summary>${result.items.slice(3).map(row).join('')}${result.evidence?`<div class="catalog-sources"><h4>搭配卡的參考牌組</h4>${result.items.map(x=>`<p><b>${esc(x.b.name)} · ${esc(x.b.id)}</b><br>${x.sources.slice(0,2).map(d=>`<a href="${esc(d.source)}" target="_blank" rel="noopener noreferrer">${esc(d.name)} ↗</a><br>代碼 ${esc(d.code||'未提供')} · ${d.cards[x.b.id]} 張`).join('<br>')}</p>`).join('')}<p class="meta">至 UPTCG 社群輸入代碼核對。<br>${esc(referenceDeckData.updatedAt.slice(0,10))} 快照 · 社群組牌參考</p></div>`:'<p class="meta">僅依顏色、特徵與效果相似度提供參考。</p>'}</details></section>`;
}

function toggleCatalogPairs(button){const entry=button.closest(".catalog-entry"),open=entry.classList.toggle("pairs-open");button.setAttribute("aria-expanded",String(open));button.textContent=open?"收起搭配":"顯示搭配";}
