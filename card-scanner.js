// OCR only proposes existing card numbers; users confirm the card before opening it.
function scanCardNumbers(text, catalog) {
  const normalized=String(text).normalize('NFKC').toUpperCase().replace(/[‐‑–—−_]/g,'-');
  const found=new Set();
  const pattern=/\b([A-Z0-9]{2,5})\s*[-]\s*([0-9OIL])\s*[-]\s*(AP\s*)?([0-9OIL]{2,3})\b/g;
  const digits=s=>s.replace(/O/g,'0').replace(/[IL]/g,'1');
  for(const match of normalized.matchAll(pattern)) {
    const id=`${match[1]}-${digits(match[2])}-${match[3]?'AP':''}${digits(match[4])}`;
    if(catalog.has(id))found.add(id);
  }
  // Only offer close readings of a complete number token; always require visual confirmation.
  if(!found.size){
    const tokens=normalized.match(/\b[A-Z]{2,5}[\s-]*[0-9OIL][\s-]*(?:AP[\s-]*)?[0-9OIL]{2,3}\b/g)||[];
    const oneEdit=(a,b)=>{
      if(a.length!==b.length)return false;
      let errors=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])errors++;
      return errors===1;
    };
    for(const token of tokens){
      const compact=token.replace(/[\s-]/g,'');
      for(const id of catalog.keys())if(oneEdit(compact,id.replace(/-/g,'')))found.add(id);
    }
  }
  return [...found];
}
function initCardScanner() {
  const dialog=document.querySelector('#scanDialog');
  if(!dialog)return;
  const photo=document.querySelector('#scanPhoto'),preview=document.querySelector('#scanPreview');
  const status=document.querySelector('#scanStatus'),results=document.querySelector('#scanResults');
  const recognize=document.querySelector('#scanRecognize');
  let image=null,busy=false,worker=null,library=null,generation=0;
  function display(ids) {
    results.replaceChildren();
    for(const id of ids) {
      const card=cardById.get(id),article=document.createElement('article');
      article.className='scan-result';
      article.innerHTML=`${imageTag(card)}<div><h3>${esc(card.name)}</h3><p class="meta">${esc(id)} · ${esc(card.series)}</p><h4>卡片能力</h4><div class="rules-text">${esc(card.textZh||card.text||'無卡片效果')}</div><h4>觸發效果</h4><div class="rules-text">${esc(card.triggerTextZh||card.triggerText||'無觸發效果')}</div><button type="button" class="btn primary">確認卡牌，查看完整資料</button></div>`;
      article.querySelector('button').addEventListener('click',()=>{dialog.close();show('browse');detail(id,true);});
      results.append(article);
    }
    status.textContent=ids.length?`找到 ${ids.length} 張可能的卡牌（可能包含誤字修正），請核對卡圖與完整卡號。`:'未找到對應卡號。請拍清楚卡號，或在下方手動輸入完整卡號。';
  }
  function loadOCR() {
    if(window.Tesseract)return Promise.resolve(window.Tesseract);
    if(!library)library=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
      script.onload=()=>resolve(window.Tesseract);
      script.onerror=()=>{script.remove();library=null;reject(new Error('OCR 下載失敗'));};
      document.head.append(script);
    });
    return library;
  }
  function canvasFor(bottom, numberStrip=false) {
    const canvas=document.createElement('canvas');
    const start=Math.floor(image.naturalHeight*bottom);
    const scale=Math.min(5,2400/image.naturalWidth);
    const width=numberStrip?image.naturalWidth*.60:image.naturalWidth;
    canvas.width=Math.round(width*scale);
    canvas.height=Math.round((image.naturalHeight-start)*scale);
    canvas.getContext('2d').drawImage(image,0,start,width,image.naturalHeight-start,0,0,canvas.width,canvas.height);
    return canvas;
  }
  document.querySelector('#openScanner').addEventListener('click',()=>dialog.showModal());
  document.querySelector('#closeScanner').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{generation++;if(!busy){image=null;preview.removeAttribute('src');preview.hidden=true;photo.value='';recognize.disabled=true;}});
  photo.addEventListener('change',async()=>{
    const file=photo.files[0];if(!file||busy)return;
    const token=++generation;results.replaceChildren();recognize.disabled=true;
    image=null;preview.hidden=true;preview.removeAttribute('src');
    document.querySelector('#scanRaw').textContent='';document.querySelector('#scanRawDetails').hidden=true;
    if(!file.type.startsWith('image/')){status.textContent='請選擇照片檔案。';return;}
    const url=URL.createObjectURL(file),next=new Image();
    try {
      next.src=url;await next.decode();
      if(token!==generation)return;
      image=next;preview.src=url;preview.hidden=false;recognize.disabled=false;
      status.textContent='照片已載入。請確認卡號清楚，再按辨識卡號。';
    }catch{image=null;status.textContent='無法讀取照片，請改用 JPG 或 PNG 格式。';}
    finally{URL.revokeObjectURL(url);}
  });
  recognize.addEventListener('click',async()=>{
    if(!image||busy)return;
    busy=true;recognize.disabled=true;photo.disabled=true;results.replaceChildren();
    const token=generation;
    status.textContent='正在準備辨識工具，首次使用需要下載，請稍候…';
    try {
      const ocr=await loadOCR();
      if(!worker)worker=await ocr.createWorker('eng',1,{logger:message=>{
        if(dialog.open&&busy&&message.status==='recognizing text')status.textContent=`辨識卡號中… ${Math.round(message.progress*100)}%`;
      }});
      await worker.setParameters({tessedit_pageseg_mode:'7',tessedit_char_whitelist:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/- '});
      let data=await worker.recognize(canvasFor(.965,true));
      let ids=scanCardNumbers(data.data.text,cardById);
      let raw=data.data.text;
      await worker.setParameters({tessedit_pageseg_mode:'11',tessedit_char_whitelist:''});
      for(const bottom of [.65,0]){
        if(ids.length)break;
        status.textContent=bottom?'正在檢查卡片下方…':'正在檢查整張照片…';
        data=await worker.recognize(canvasFor(bottom));raw+='\n'+data.data.text;ids=scanCardNumbers(raw,cardById);
      }
      if(token===generation){document.querySelector('#scanRaw').textContent=raw;document.querySelector('#scanRawDetails').hidden=false;}
      if(token===generation){if(ids.length===1)document.querySelector('#scanNumber').value=ids[0];display(ids);}
    }catch(error){
      if(worker){await worker.terminate().catch(()=>{});worker=null;}
      if(token===generation)status.textContent='辨識未完成。請確認網路連線後重試，或手動輸入卡號查找。';
    }finally{busy=false;photo.disabled=false;recognize.disabled=!image;if(!dialog.open){image=null;preview.hidden=true;preview.removeAttribute('src');photo.value='';recognize.disabled=true;}}
  });
  document.querySelector('#scanManual').addEventListener('submit',event=>{event.preventDefault();display(scanCardNumbers(document.querySelector('#scanNumber').value,cardById));});
  addEventListener('pagehide',()=>{if(worker)worker.terminate();});
}
if(typeof document!=='undefined')initCardScanner();
