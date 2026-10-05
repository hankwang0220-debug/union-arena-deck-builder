'use strict';
// Original fixtures for testing only: these are not official UNION ARENA cards.
for(let i=1;i<=15;i++)cards.push({id:'DEMO-'+String(i).padStart(3,'0'),name:['先鋒','支援','戰術','據點','突擊'][i%5]+' '+i,series:'原創測試組',color:'紅',cost:i<=5?i%3:i<=10?3:4+i%2,bp:1500+i%5*500,type:i%5===3?'事件':i%5===4?'場域':'角色',traits:['測試隊'],fx:i%2?['快攻','展開']:['抽牌','控制'],text:'原創測試卡，用於驗證搜尋與卡組推薦，不代表正式卡片能力。'});
cards.forEach(c=>{c.type=c.type||'角色';});
const storageKey='ua-deck-lab-v1';
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');for(const [id,n] of Object.entries(saved)){if(cards.some(c=>c.id===id)&&Number.isInteger(n)&&n>0&&n<=4&&DeckCore.total(deck)+n<=50)deck[id]=n;}}catch{}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(deck));}catch{notify('瀏覽器無法儲存，重新整理後可能遺失牌組');}}
const status=document.createElement('div');status.id='status';status.setAttribute('role','status');document.querySelector('.hero').after(status);
function notify(message){status.textContent=message;}
const toolbar=document.querySelector('.toolbar');
function filterSelect(id,label,values){const el=document.createElement('select');el.id=id;el.setAttribute('aria-label',label);el.innerHTML='<option value="">全部'+label+'</option>'+values.map(v=>'<option>'+v+'</option>').join('');toolbar.append(el);el.oninput=render;}
$('#q').setAttribute('aria-label','搜尋卡名、編號、特徵或效果');$('#color').setAttribute('aria-label','顏色');$('#series').setAttribute('aria-label','作品');
$('#series').innerHTML='<option value="">全部作品</option>'+[...new Set(cards.map(c=>c.series))].map(s=>'<option>'+s+'</option>').join('');
filterSelect('energy','能源',[...new Set(cards.map(c=>c.cost))].sort((a,b)=>a-b));filterSelect('bp','BP',[...new Set(cards.map(c=>c.bp))].sort((a,b)=>a-b));filterSelect('type','卡種',['角色','事件','場域']);filterSelect('trait','特徵',[...new Set(cards.flatMap(c=>c.traits))]);
filterSelect('sort','排序',['能源低到高','能源高到低','BP 高到低']);
const reset=document.createElement('button');reset.className='btn';reset.textContent='清除篩選';reset.onclick=()=>{toolbar.querySelectorAll('input,select').forEach(el=>el.value='');render();};toolbar.append(reset);
const resultCount=document.createElement('p');resultCount.className='muted';resultCount.setAttribute('aria-live','polite');toolbar.after(resultCount);
render=function(){const q=$('#q').value.trim().toLowerCase();let list=cards.filter(c=>(!$('#color').value||c.color===$('#color').value)&&(!$('#series').value||c.series===$('#series').value)&&(!$('#energy').value||c.cost===Number($('#energy').value))&&(!$('#bp').value||c.bp===Number($('#bp').value))&&(!$('#type').value||c.type===$('#type').value)&&(!$('#trait').value||c.traits.includes($('#trait').value))&&(!q||[c.id,c.name,c.series,c.text,...c.traits,...c.fx].join(' ').toLowerCase().includes(q)));const sort=$('#sort').value;if(sort)list.sort((a,b)=>sort==='能源低到高'?a.cost-b.cost:sort==='能源高到低'?b.cost-a.cost:b.bp-a.bp);resultCount.textContent=list.length+' 張結果 · 全部為示範資料';$('#cards').innerHTML=list.map(c=>`<button class="card" onclick="detail('${c.id}')"><div class="art ${c.color==='藍'?'blue':c.color==='綠'?'green':''}">${c.name}</div><div class="meta">${c.id} · ${c.series}</div><b>${c.name}</b><div>${c.color} · ${c.type} · 能源 ${c.cost} · BP ${c.bp}</div><div>${c.traits.map(t=>'<span class="tag">'+t+'</span>').join('')}</div></button>`).join('')||'<div class="empty">沒有符合條件的卡片，請調整篩選</div>';};
add=function(id){const result=DeckCore.addCard(deck,id,cards);deck=result.deck;persist();deckUI();notify(result.message);};
sub=function(id){if(!deck[id])return;deck[id]--;if(!deck[id])delete deck[id];persist();deckUI();};
const oldDeckUI=deckUI;
deckUI=function(){oldDeckUI();const errors=DeckCore.validate(deck,cards);const bins=Array(7).fill(0);for(const [id,n] of Object.entries(deck)){const c=cards.find(c=>c.id===id);if(c)bins[Math.min(c.cost,6)]+=n;}$('#health').insertAdjacentHTML('beforeend','<h3>能源曲線</h3>'+bins.map((n,i)=>`<div class="curve"><span>${i===6?'6+':i}</span><meter min="0" max="50" value="${n}">${n}</meter><span>${n} 張</span></div>`).join('')+'<h3>基本構築檢查</h3><p>'+(errors.length?errors.join('<br>'):'✓ 50 張、單卡上限與作品檢查通過')+'</p><p class="muted">僅檢查基本規則，未涵蓋禁限卡及賽事規則。</p>');};
const buildButton=document.createElement('button');buildButton.className='btn';buildButton.textContent='產生 50 張卡組草稿';$('#run').after(buildButton);
const draft=document.createElement('div');draft.id='draft';$('#recs').after(draft);let suggested=null;
buildButton.onclick=()=>{const seed=cards.find(c=>c.id===$('#seed').value);suggested=DeckCore.build(seed,cards,syn);draft.innerHTML='<h3>卡組草稿 · '+DeckCore.total(suggested.deck)+'/50</h3><p>'+(suggested.missing?'同作品、同色資料不足，還缺 '+suggested.missing+' 張。可選「原創測試組」體驗完整流程。':'已按低／中／高能源目標配置，仍需人工調整。')+'</p>'+Object.entries(suggested.deck).map(([id,n])=>'<div class="deckrow"><span>'+cards.find(c=>c.id===id).name+'</span><b>×'+n+'</b></div>').join('')+'<button class="btn primary" id="applyDraft">套用草稿</button>';$('#applyDraft').onclick=()=>{if(DeckCore.total(deck)&&!window.confirm('套用草稿會取代目前卡組，是否繼續？'))return;deck={...suggested.deck};persist();deckUI();show('deck');notify('已套用卡組草稿');};};
rec=function(){const seed=cards.find(c=>c.id===$('#seed').value);const list=DeckCore.recommend(seed,cards,deck,syn).slice(0,5);$('#recs').innerHTML='<h3>與「'+seed.name+'」搭配</h3>'+list.map(r=>`<div class="rec"><b>${r.card.name}</b> <span class="tag">${r.score} 分</span><div class="muted">${r.reasons.join(' · ')}</div><p>能源 ${r.card.cost} · 卡组已有 ${deck[r.card.id]||0} 張</p><button class="btn" onclick="add('${r.card.id}')">加入卡組</button></div>`).join('')+(list.length?'':'<p>沒有可加入的同作品、同色卡片。</p>');};
$('#seed').innerHTML=cards.map(c=>`<option value="${c.id}">${c.series}｜${c.name}</option>`).join('');$('#seed').setAttribute('aria-label','核心卡');$('#seed').onchange=()=>{draft.innerHTML='';rec();};$('#run').onclick=rec;
document.querySelector('#recommend .panel:last-child').innerHTML='<h2>可解釋的卡組推薦</h2><p>優先同作品、同色；依共同特徵、效果方向與低能源缺口評分，排除已滿 4 張的卡片。</p><p class="muted">分數是規則評分，不是勝率或 AI 預測。草稿以低能源 18、中能源 12、高能源 20 張為起點，資料不足時顯示缺口。</p>';
toolbar.querySelectorAll('input,select').forEach(el=>el.oninput=render);
render();deckUI();rec();

