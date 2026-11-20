// ASTRAVERSE — visual feedback and keyboard navigation
export function initVisualEffects() {
// Magical feedback for every visible click + a gentle cursor star trail.
const sparkleChars=['✦','✧','⋆','✴'];let lastTrail=0;
document.addEventListener('click',e=>{const ring=document.createElement('span');ring.className='click-ripple';ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px';document.body.appendChild(ring);setTimeout(()=>ring.remove(),850);for(let i=0;i<13;i++){const sp=document.createElement('span');sp.className='click-spark'+(i%4===0?' big':'');sp.textContent=sparkleChars[Math.floor(Math.random()*sparkleChars.length)];sp.style.left=e.clientX+'px';sp.style.top=e.clientY+'px';const a=Math.PI*2*i/13+(Math.random()-.5)*.5,r=28+Math.random()*65;sp.style.setProperty('--dx',(Math.cos(a)*r)+'px');sp.style.setProperty('--dy',(Math.sin(a)*r)+'px');sp.style.color=['#ffd0f0','#c8a8ff','#a6edff','#fff0ba'][i%4];document.body.appendChild(sp);setTimeout(()=>sp.remove(),900)}});
document.addEventListener('pointermove',e=>{const now=performance.now();if(now-lastTrail<85)return;lastTrail=now;const sp=document.createElement('span');sp.className='click-spark';sp.textContent='✧';sp.style.left=e.clientX+'px';sp.style.top=e.clientY+'px';sp.style.fontSize='9px';sp.style.setProperty('--dx',(Math.random()*20-10)+'px');sp.style.setProperty('--dy',(Math.random()*-24-8)+'px');document.body.appendChild(sp);setTimeout(()=>sp.remove(),700)});

}

export function initKeyboardNavigation($) {
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('game').classList.contains('active'))$('menuBtn').click();else if($('explore').classList.contains('active'))$('exploreMenuBtn').click();else if($('menu').classList.contains('active'))$('homeBtn').click();}});

}
