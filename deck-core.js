(function(root){
'use strict';
function total(deck){return Object.values(deck).reduce((s,n)=>s+n,0);}
function addCard(deck,id,cards){if(!cards.some(c=>c.id===id))return {deck,message:'找不到卡片'};if((deck[id]||0)>=4)return {deck,message:'單卡最多 4 張'};if(total(deck)>=50)return {deck,message:'牌組已達 50 張'};return {deck:{...deck,[id]:(deck[id]||0)+1},message:'已加入卡組'};}
function validate(deck,cards){const errors=[];if(total(deck)!==50)errors.push('牌組須為 50 張，目前 '+total(deck)+' 張');const series=new Set();for(const [id,n] of Object.entries(deck)){const c=cards.find(c=>c.id===id);if(!c){errors.push('未知卡片 '+id);continue;}series.add(c.series);if(!Number.isInteger(n)||n<1||n>4)errors.push(id+' 張數須為 1–4');}if(series.size>1)errors.push('包含不同作品，請確認作品構築限制');return errors;}
function recommend(seed,cards,deck,synergy){if(!seed)return [];const curve=Array(7).fill(0);for(const [id,n] of Object.entries(deck)){const c=cards.find(c=>c.id===id);if(c)curve[Math.min(c.cost,6)]+=n;}
return cards.filter(c=>c.id!==seed.id&&c.series===seed.series&&c.color===seed.color&&(deck[c.id]||0)<4).map(card=>{const base=synergy(seed,card);const bonus=card.cost<=2&&curve.slice(0,3).reduce((a,b)=>a+b,0)<16?12:0;return {card,score:base.score+bonus,reasons:[...base.reasons,...(bonus?['補充低能源起手']:[])]};}).sort((a,b)=>b.score-a.score||a.card.cost-b.card.cost||a.card.id.localeCompare(b.card.id));}
function build(seed,cards,synergy){if(!seed)return {deck:{},missing:50};let deck={};const candidates=[seed,...recommend(seed,cards,{},synergy).map(r=>r.card)];const targets=[{match:c=>c.cost<=2,count:18},{match:c=>c.cost===3,count:12},{match:c=>c.cost>=4,count:20}];for(const tier of targets){let remaining=tier.count;for(const c of candidates.filter(tier.match)){const n=Math.min(4,remaining);if(n>0){deck[c.id]=n;remaining-=n;}}}
for(const c of candidates){const n=Math.min(4-(deck[c.id]||0),50-total(deck));if(n>0)deck[c.id]=(deck[c.id]||0)+n;}return {deck,missing:50-total(deck)};}
const api={total,addCard,validate,recommend,build};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DeckCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
