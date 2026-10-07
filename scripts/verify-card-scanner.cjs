const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync('card-scanner.js','utf8'),context);
const catalog=new Map(['CSM-1-008','CSM-1-049','CSM-1-AP01','HTR-1-001','JJK-2-012'].map(id=>[id,{}]));
const lookup=text=>Array.from(context.scanCardNumbers(text,catalog));
assert.deepEqual(lookup('UA53BT/CSM-1-008 SR'),['CSM-1-008']);
assert.deepEqual(lookup('ＣＳＭ－１－００８'),['CSM-1-008']);
assert.deepEqual(lookup('UAS3BT/CSM 2008 DD'),['CSM-1-008']);
assert.deepEqual(lookup('CSM - I - OO8\nHTR–1–001'),['CSM-1-008','HTR-1-001']);
assert.deepEqual(lookup('CSM-1-AP01'),['CSM-1-AP01']);
assert.deepEqual(lookup('JJK-2-012 JJK-2-012'),['JJK-2-012']);
assert.deepEqual(lookup('CSM-1-999 BP 4000'),[]);
assert.deepEqual(lookup('<script>alert(1)</script>'),[]);
assert.deepEqual(lookup('WAS3BIT/CSM-1-049 8'),['CSM-1-049']);
assert.deepEqual(lookup('WAS3BI/CSM1-049'),['CSM-1-049']);
assert.deepEqual(lookup('WAS3BI/CSM-1-0498'),[]);
// A card surrounded by neutral table/background: crop relative to its frame.
const pixels=new Uint8ClampedArray(480*640*4);
for(let y=120;y<=491;y++)for(let x=97;x<=372;x++){
  const i=(y*480+x)*4;pixels[i]=230;pixels[i+1]=65;pixels[i+2]=70;pixels[i+3]=255;
}
const bounds=context.scanCardBounds(pixels,480,640);
assert.ok(bounds);
const region=context.scanNumberRegions(bounds)[0];
assert.equal(Math.round(region.left*1108),269);
assert.equal(Math.round(region.top*1477),1106);
assert.equal(Math.round(region.width*1108),137);
assert.equal(Math.round(region.height*1477),20);
assert.equal(context.scanCardBounds(new Uint8ClampedArray(480*640*4),480,640),null);
assert.equal(context.scanNumberRegions(null).length,0);
const grayscale=context.scanGrayscale(new Uint8ClampedArray([10,10,10,255,200,200,200,255]));
assert.deepEqual(Array.from(grayscale),[0,0,0,255,255,255,255,255]);
console.log('PASS: exact card number lookup, OCR digit corrections, Unicode, AP cards, multiple candidates, deduplication and unknown-card rejection.');
console.log('PASS: background-independent card bounds, number-strip coordinates and grayscale contrast normalization.');
