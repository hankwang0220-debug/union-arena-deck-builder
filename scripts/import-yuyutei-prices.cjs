// Public selling-price snapshots; never use buying prices or name-based matching.
const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const path = require('node:path');
const cache = '.cache/yuyutei';
fs.mkdirSync(cache, {recursive:true});
const decode = s => s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
function parse(html) {
  return html.split(/<div\s+class="card-product\b/).slice(1).flatMap(block => {
    const link = block.match(/href="https:\/\/yuyu-tei\.jp\/sell\/ua\/card\/([a-z0-9]+\/\d+)"/);
    const alt = block.match(/alt="([^" ]+\/[^" ]+) ([^"]+)" class="card img-fluid"/);
    const price = block.match(/<strong\b[^>]*>\s*([\d,]+)\s*円\s*<\/strong>/);
    if (!link || !alt || !price) return [];
    return [[decode(alt[1]),decode(alt[2]),Number(price[1].replace(/,/g,'')),/^\s*[^>]*\bsold-out\b/.test(block)?'售罄':'有庫存',link[1]]];
  });
}
function fetchPage(set) {
  const file = path.join(cache,`${set}.html`);
  execFileSync('curl.exe',['--fail','--retry','2','--max-time','45','-L','-sS',`https://yuyu-tei.jp/sell/ua/s/${set}`,'-o',file]);
  const html=fs.readFileSync(file,'utf8');
  if (!html.includes('card-product')) throw new Error(`No products: ${set}`);
  return html;
}
if (require.main === module) {
  const first=fetchPage('csm1');
  const sets=[...new Set([...first.matchAll(/name="vers\[\]" value="([a-z0-9]+)"/g)].map(m=>m[1]))];
  if(sets.length<50)throw new Error('Incomplete set inventory');
  const products=new Map();
  for(const [i,set] of sets.entries()) {
    const rows=parse(set==='csm1'?first:fetchPage(set));
    for(const row of rows)products.set(row[4],row);
    console.log(`${i+1}/${sets.length} ${set}: ${rows.length}`);
  }
  const rows=[...products.values()].sort((a,b)=>a[4].localeCompare(b[4]));
  const priceData={};
  for(const row of rows)(priceData[row[0].split('/').pop()]??=[]).push(row);
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei'}).format(new Date());
  const snapshot={date,currency:'JPY',source:'遊々亭',url:'https://yuyu-tei.jp/top/ua',productCount:rows.length,setCount:sets.length};
  fs.writeFileSync('data/yuyutei-prices.json',JSON.stringify({snapshot,priceData},null,2)+'\n');
  const original=fs.readFileSync('prices.js','utf8');
  const tail=original.slice(original.indexOf('const selectedPrices'));
  if(!tail.startsWith('const selectedPrices'))throw new Error('Missing price UI');
  fs.writeFileSync('prices.js',`// 遊々亭公開販売價格快照；依完整卡號配對，各商品版本分開保存。\nconst priceSnapshot = ${JSON.stringify(snapshot)};\nconst priceData = ${JSON.stringify(priceData)};\n${tail}`);
  console.log(`Saved ${rows.length} products from ${sets.length} sets (${date})`);
}
module.exports={parse};
