'use strict';
function sharedDeckPayload(d){return {v:1,name:d.name,series:d.series||'',cards:Object.entries(d.cards).sort(([a],[b])=>a.localeCompare(b))};}
function encodeSharedDeck(d){const bytes=new TextEncoder().encode(JSON.stringify(sharedDeckPayload(d)));return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
function decodeSharedDeck(token){
  if(!token||token.length>16000||!/^[A-Za-z0-9_-]+$/.test(token))throw Error('分享網址格式不正確或不完整。');
  let data;
  try{const raw=atob(token.replaceAll('-','+').replaceAll('_','/'));data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0))));}catch{throw Error('分享網址無法讀取，請確認已複製完整網址。');}
  if(data?.v!==1)throw Error('此分享網址版本尚不支援。');
  if(typeof data.name!=='string'||!data.name.trim()||data.name.length>80||typeof data.series!=='string'||(data.series&&!cards.some(c=>c.series===data.series))||!Array.isArray(data.cards)||data.cards.length>53)throw Error('分享網址的牌組資料格式不正確。');
  const entries=[],seen=new Set();let main=0,ap=0;
  for(const entry of data.cards){
    if(!Array.isArray(entry)||entry.length!==2)throw Error('分享網址的卡片資料格式不正確。');
    const [id,n]=entry,c=cardById.get(id);
    if(!c||c.pendingOfficial||c.type==='BP 標誌')throw Error(`分享牌組含有無法還原的卡號：${String(id).slice(0,60)}。請確認卡表版本。`);
    if(seen.has(id)||!Number.isInteger(n)||n<1||n>4)throw Error('分享網址含有重複卡號或不正確的張數。');
    seen.add(id);entries.push([id,n]);if(c.type==='AP 卡')ap+=n;else main+=n;
  }
  if(main>50||ap>3)throw Error('分享牌組超過主牌組 50 張或 AP 卡 3 張上限。');
  return {name:data.name,series:data.series,cards:Object.fromEntries(entries)};
}
function sharedDeckURL(d,base=window.location.href){const url=new URL(base);url.hash='deck='+encodeSharedDeck(d);return url.href;}
function generateDeckShare(){
  const current=decks.find(d=>d.id===activeDeckId),status=$('#deckShareStatus');
  try{const url=sharedDeckURL(current);decodeSharedDeck(new URL(url).hash.slice(6));$('#deckShareURL').value=url;$('#deckShareOutput').hidden=false;
    status.textContent='分享網址已產生，包含目前的牌組名稱、IP 與全部卡片張數。'+(/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)||window.location.protocol==='file:'?'目前是本機預覽網址；請在正式網站產生可供他人開啟的連結。':'修改牌組後，請重新產生分享網址。');
  }catch(e){status.textContent=e.message;}
}
async function copyDeckShare(){
  const input=$('#deckShareURL');
  try{await navigator.clipboard.writeText(input.value);$('#deckShareStatus').textContent='分享網址已複製。';}catch{input.focus();input.select();$('#deckShareStatus').textContent='請手動複製已選取的分享網址。';}
}
function loadSharedDeckFromURL(){
  if(!window.location.hash.startsWith('#deck='))return;
  const notice=$('#deckImportStatus');
  try{
    const restored=decodeSharedDeck(window.location.hash.slice(6)),signature=JSON.stringify(sharedDeckPayload(restored));
    let existing=decks.find(d=>JSON.stringify(sharedDeckPayload(d))===signature);
    if(!existing){existing={...restored,id:globalThis.crypto?.randomUUID?.()||`share-${Date.now()}-${Math.random()}`};decks.push(existing);}
    switchDeck(existing.id);show('deck');notice.textContent='已從分享網址完整還原牌組，並保留原有牌組。修改後請產生新的分享網址。';
  }catch(e){show('deck');notice.textContent='無法載入分享牌組：'+e.message+' 原有牌組未變更。';}
}
