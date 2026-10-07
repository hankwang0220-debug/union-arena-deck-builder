const assert=require('node:assert/strict');
const fs=require('node:fs');
const {parse}=require('./import-yuyutei-prices.cjs');
const product=(extra,number,amount)=>`<div class="card-product position-relative ${extra}"><a href="https://yuyu-tei.jp/sell/ua/card/test1/10001"><img alt="${number} SR 名前&amp;名前" class="card img-fluid"/></a><strong class="d-block">${amount} 円</strong></div>`;
assert.deepEqual(parse(product('sold-out','UA01BT/HTR-1-001','1,480')),[['UA01BT/HTR-1-001','SR 名前&名前',1480,'售罄','test1/10001']]);
assert.equal(parse(product('','UA01BT/HTR-1-001','80'))[0][3],'有庫存');
assert.equal(parse(product('','UA01BT/HTR-1-001','80').replace('/sell/','/buy/')).length,0);
assert.equal(parse(product('','UA01BT/HTR-1-001','80').replace('80 円','お問い合わせ')).length,0);
const {snapshot,priceData}=JSON.parse(fs.readFileSync('data/yuyutei-prices.json','utf8'));
const rows=Object.values(priceData).flat();
assert.equal(rows.length,snapshot.productCount);
assert.equal(new Set(rows.map(r=>r[4])).size,rows.length);
for(const [id,versions] of Object.entries(priceData))for(const row of versions){
  assert.equal(row[0].split('/').pop(),id);
  assert.ok(Number.isFinite(row[2])&&row[2]>0);
  assert.ok(['售罄','有庫存'].includes(row[3]));
  assert.match(row[4],/^[a-z0-9]+\/\d+$/);
}
assert.ok(priceData['IYS-1-042']?.length);
console.log(`PASS: selling-only parser and ${rows.length} unique exact-number products.`);
