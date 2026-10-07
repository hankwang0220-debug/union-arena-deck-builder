'use strict';
function setTheme(value){
  const theme=value==='dark'?'dark':'light';
  document.documentElement.dataset.theme=theme;
  try{localStorage.setItem('ua-deck-lab-theme',theme);}catch{}
}
let savedTheme='light';
try{savedTheme=localStorage.getItem('ua-deck-lab-theme')||'light';}catch{}
setTheme(savedTheme);
function initTheme(){const select=document.querySelector('#themeSelect');select.value=document.documentElement.dataset.theme;select.addEventListener('change',()=>setTheme(select.value));}
