const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
for(const id of ['scanCamera','scanVideo','scanStartCamera','scanCapture','scanAgain','scanRecent','scanRecentSection','scanStopCamera'])assert.ok(html.includes(`id="${id}"`),`Missing scanner element: ${id}`);
class Element {
  constructor(){this.listeners={};this.hidden=false;this.disabled=false;this.children=[];this.value='';this.files=[];this.open=true;this.videoWidth=800;this.videoHeight=1100;}
  addEventListener(name,fn){this.listeners[name]=fn;}
  async fire(name,event={}){return this.listeners[name]?.(event);}
  click(){if(!this.disabled)return this.fire('click');}
  append(child){this.children.push(child);}
  replaceChildren(){this.children=[];}
  removeAttribute(name){delete this[name];}
  querySelector(){return this.button??=new Element();}
  showModal(){this.open=true;}
  close(){this.open=false;this.fire('close');}
  play(){return Promise.resolve();}
  getContext(){return {drawImage(){},getImageData(){return {data:new Uint8ClampedArray(4)};},putImageData(){}};}
  toDataURL(){return 'data:image/jpeg;base64,test';}
}
(async()=>{
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
const document={querySelector:get,createElement:()=>new Element(),head:new Element(),listeners:{},addEventListener(n,f){this.listeners[n]=f;}};
let stopped=0,request,resolveCamera;
const stream={getTracks:()=>[{stop(){stopped++;}}]};
const navigator={mediaDevices:{getUserMedia:()=>request()}};
const storage=new Map(),window={};
const context=vm.createContext({document,navigator,window,sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},cardById:new Map([['CSM-1-008',{name:'Test',series:'CSM',textZh:'能力'}]]),esc:s=>s,imageTag:()=>'',show(){},detail(){},Image:class{constructor(){this.naturalWidth=800;this.naturalHeight=1100;}decode(){return Promise.resolve();}},URL:{createObjectURL:()=>'',revokeObjectURL(){}},addEventListener(){}});
vm.runInContext(fs.readFileSync('card-scanner.js','utf8'),context);
request=()=>Promise.reject(Object.assign(new Error(),{name:'NotAllowedError'}));
await get('#scanStartCamera').click();assert.match(get('#scanStatus').textContent,/未取得相機權限/);
request=()=>Promise.resolve(stream);await get('#scanStartCamera').click();assert.equal(get('#scanCamera').hidden,false);assert.equal(get('#scanCapture').disabled,false);
await get('#scanStopCamera').click();assert.equal(stopped,1);assert.equal(get('#scanCamera').hidden,true);
request=()=>new Promise(resolve=>resolveCamera=resolve);
const pending=get('#scanStartCamera').click();get('#scanDialog').close();resolveCamera(stream);await pending;assert.equal(stopped,2);assert.equal(get('#scanVideo').srcObject,null);
get('#scanDialog').showModal();request=()=>Promise.resolve(stream);await get('#scanStartCamera').click();document.hidden=true;document.listeners.visibilitychange();assert.equal(stopped,3);
document.hidden=false;get('#scanNumber').value='CSM-1-008';await get('#scanManual').fire('submit',{preventDefault(){}});assert.equal(get('#scanResults').children.length,1);assert.equal(get('#scanRecent').children.length,1);assert.equal(get('#scanAgain').hidden,false);
await get('#scanManual').fire('submit',{preventDefault(){}});assert.equal(get('#scanRecent').children.length,1);
window.Tesseract={createWorker:async()=>({setParameters:async()=>{},recognize:async()=>({data:{text:'CSM-1-008'}}),terminate:async()=>{}})};
await get('#scanAgain').click();await get('#scanCapture').click();
for(let i=0;i<20;i++)await Promise.resolve();
assert.equal(get('#scanResults').children.length,1);assert.equal(get('#scanCamera').hidden,true);assert.equal(get('#scanStartCamera').disabled,false);
console.log('PASS: permission fallback, camera start/stop, pending permission cleanup, background cleanup, manual abilities/history and capture-to-OCR.');
})().catch(error=>{console.error(error);process.exitCode=1;});
