// ASTRAVERSE — main 3D scene, navigation, planets, and mini-game
import * as THREE from 'three';
import { initSoundtrack } from './soundtrack.js';
import { initVisualEffects, initKeyboardNavigation } from './effects.js';



const mount=document.getElementById('scene');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x090817);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,300);camera.position.set(0,5.8,18.5);camera.lookAt(0,0,0);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;renderer.setClearColor(0x050311,1);mount.appendChild(renderer.domElement);
scene.add(new THREE.AmbientLight(0x9b8acb,1.15));const key=new THREE.PointLight(0xffc5e8,95,45);key.position.set(-2,4,3);scene.add(key);const fill=new THREE.PointLight(0x82cfff,45,45);fill.position.set(5,-2,-4);scene.add(fill);
const system=new THREE.Group();scene.add(system);system.rotation.x=-.18;
function glowTex(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),g=x.createRadialGradient(128,128,2,128,128,128);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.15,'rgba(255,190,235,.5)');g.addColorStop(.4,'rgba(173,125,255,.15)');g.addColorStop(1,'rgba(120,90,255,0)');x.fillStyle=g;x.fillRect(0,0,256,256);return new THREE.CanvasTexture(c)}

function makePlanetMap(base,accent,style=0){
  const c=document.createElement('canvas');c.width=1024;c.height=512;
  const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,1024,512);g.addColorStop(0,base);g.addColorStop(.48,accent);g.addColorStop(1,base);
  x.fillStyle=g;x.fillRect(0,0,1024,512);
  for(let i=0;i<90;i++){
    const y=Math.random()*512, h=3+Math.random()*(style===1?28:12);
    x.globalAlpha=.025+Math.random()*.09;x.fillStyle=i%2?base:accent;
    x.fillRect(0,y,1024,h);
  }
  for(let i=0;i<42;i++){
    const px=Math.random()*1024,py=Math.random()*512,rx=25+Math.random()*180,ry=8+Math.random()*40;
    const rg=x.createRadialGradient(px,py,1,px,py,rx);
    rg.addColorStop(0,accent);rg.addColorStop(1,'rgba(0,0,0,0)');
    x.globalAlpha=.12+Math.random()*.15;x.fillStyle=rg;x.save();x.translate(px,py);x.scale(1,ry/rx);x.beginPath();x.arc(0,0,rx,0,Math.PI*2);x.fill();x.restore();
  }
  x.globalAlpha=1;
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=THREE.RepeatWrapping;tex.anisotropy=8;return tex;
}

const glow=glowTex();function addGlow(parent,size,color,opacity=.8){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.set(size,size,1);parent.add(s);return s}
const sun=new THREE.Mesh(new THREE.SphereGeometry(1.05,64,64),new THREE.MeshPhysicalMaterial({color:0xffc5e8,emissive:0xff86cf,emissiveIntensity:.48,roughness:.28}));system.add(sun);addGlow(system,6,0xc18cff,.62);
for(let i=0;i<2;i++){const h=new THREE.Mesh(new THREE.TorusGeometry(1.32+i*.18,.009,8,120),new THREE.MeshBasicMaterial({color:i?0xbca5ff:0xffb9e5,transparent:true,opacity:.22}));h.rotation.x=Math.PI/2.25+i*.12;system.add(h)}
const palettes=[{sun:0xffc5e8,p:[0x91eaff,0xff91ce,0xb69aff,0xffd68c]},{sun:0xc6b3ff,p:[0x9bffc8,0x8deaff,0xffa9d6,0xffe2a3]},{sun:0xffc09e,p:[0xff9fbd,0xc1a5ff,0x8deaff,0xffd18a]}];let palette=0;
const planets=[];
function planet(d,s,c,speed,ring=false){const pivot=new THREE.Group();system.add(pivot);const hex='#'+c.toString(16).padStart(6,'0');const accent=['#f8d9ff','#b9efff','#ffe0ee','#e4d8ff'][planets.length%4];const map=makePlanetMap(hex,accent,planets.length%2);const mesh=new THREE.Mesh(new THREE.SphereGeometry(s,72,72),new THREE.MeshPhysicalMaterial({map,color:0xffffff,roughness:.62,metalness:.06,clearcoat:.28,clearcoatRoughness:.4}));mesh.position.x=d;pivot.add(mesh);const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(s*1.09,48,48),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.095,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false}));mesh.add(atmosphere);addGlow(mesh,s*5.8,c,.27);if(ring){const r=new THREE.Mesh(new THREE.TorusGeometry(s*1.55,.035,10,100),new THREE.MeshBasicMaterial({color:0xffc3e6,transparent:true,opacity:.7}));r.rotation.x=Math.PI/2.35;r.position.copy(mesh.position);pivot.add(r)}const o=new THREE.Mesh(new THREE.TorusGeometry(d,.006,6,180),new THREE.MeshBasicMaterial({color:0xc8baff,transparent:true,opacity:.19}));o.rotation.x=Math.PI/2;system.add(o);planets.push({pivot,mesh,speed})}
planet(2.25,.23,0x91eaff,.012);planet(3.55,.36,0xff91ce,.008);planet(5.05,.53,0xb69aff,.005,true);planet(6.65,.19,0xffd68c,.003);
const n=2500,pos=new Float32Array(n*3),col=new Float32Array(n*3),sc=[new THREE.Color(0xffffff),new THREE.Color(0xcab8ff),new THREE.Color(0xffbce5),new THREE.Color(0x9deaff)];
for(let i=0;i<n;i++){const r=12+Math.random()*95,t=Math.random()*Math.PI*2,p=Math.acos(2*Math.random()-1);pos[i*3]=r*Math.sin(p)*Math.cos(t);pos[i*3+1]=r*Math.sin(p)*Math.sin(t);pos[i*3+2]=r*Math.cos(p);const c=sc[Math.floor(Math.random()*4)];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));const stars=new THREE.Points(geo,new THREE.PointsMaterial({size:.105,vertexColors:true,transparent:true,opacity:.9}));scene.add(stars);
const dust=new THREE.Group();scene.add(dust);for(let i=0;i<35;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.025+Math.random()*.055,10,10),new THREE.MeshBasicMaterial({color:sc[i%4],transparent:true,opacity:.7}));b.position.set((Math.random()-.5)*20,(Math.random()-.5)*11,(Math.random()-.5)*9);dust.add(b)}
// V5.1 — a moving star corridor for the Explore the Universe journey.
const journeyGroup=new THREE.Group();scene.add(journeyGroup);
const journeyCount=1900, journeyPositions=new Float32Array(journeyCount*3), journeyColors=new Float32Array(journeyCount*3), journeySpeeds=new Float32Array(journeyCount);
const journeyPalette=[new THREE.Color(0xffffff),new THREE.Color(0xd9c7ff),new THREE.Color(0xffc9e9),new THREE.Color(0xa9edff),new THREE.Color(0xffe7b8)];
for(let i=0;i<journeyCount;i++){
  const a=Math.random()*Math.PI*2, r=3+Math.sqrt(Math.random())*17, z=-125+Math.random()*145;
  journeyPositions[i*3]=Math.cos(a)*r; journeyPositions[i*3+1]=Math.sin(a)*r*.68; journeyPositions[i*3+2]=z;
  const c=journeyPalette[Math.floor(Math.random()*journeyPalette.length)];
  journeyColors[i*3]=c.r; journeyColors[i*3+1]=c.g; journeyColors[i*3+2]=c.b;
  journeySpeeds[i]=.10+Math.random()*.28;
}
const journeyGeo=new THREE.BufferGeometry();
journeyGeo.setAttribute('position',new THREE.BufferAttribute(journeyPositions,3));
journeyGeo.setAttribute('color',new THREE.BufferAttribute(journeyColors,3));
const journeyStars=new THREE.Points(journeyGeo,new THREE.PointsMaterial({size:.12,vertexColors:true,transparent:true,opacity:.95,sizeAttenuation:true}));
journeyGroup.add(journeyStars);

// Long-exposure streaks make the camera feel as if it is gliding through space.
const streakCount=260, streakPositions=new Float32Array(streakCount*6), streakSpeeds=new Float32Array(streakCount);
for(let i=0;i<streakCount;i++){
  const a=Math.random()*Math.PI*2,r=3+Math.random()*15,z=-120+Math.random()*140,len=.7+Math.random()*3.8;
  const x=Math.cos(a)*r,y=Math.sin(a)*r*.68,k=i*6;
  streakPositions[k]=x;streakPositions[k+1]=y;streakPositions[k+2]=z;
  streakPositions[k+3]=x;streakPositions[k+4]=y;streakPositions[k+5]=z-len;
  streakSpeeds[i]=.22+Math.random()*.55;
}
const streakGeo=new THREE.BufferGeometry();streakGeo.setAttribute('position',new THREE.BufferAttribute(streakPositions,3));
const streaks=new THREE.LineSegments(streakGeo,new THREE.LineBasicMaterial({color:0xcbbcff,transparent:true,opacity:.28,blending:THREE.AdditiveBlending}));
journeyGroup.add(streaks);
// A distant spiral galaxy landmark, built from thousands of luminous particles.
const galaxyGroup=new THREE.Group();galaxyGroup.position.set(-5,2,-88);galaxyGroup.rotation.set(.55,.15,-.25);journeyGroup.add(galaxyGroup);
const galaxyN=2600,galaxyPos=new Float32Array(galaxyN*3),galaxyCol=new Float32Array(galaxyN*3);
const galaxyPalette=[new THREE.Color(0xffc4eb),new THREE.Color(0xbba7ff),new THREE.Color(0x8ce8ff),new THREE.Color(0xffe6bd)];
for(let i=0;i<galaxyN;i++){
  const arm=i%4,rad=Math.pow(Math.random(),.58)*12,ang=arm*Math.PI/2+rad*.42+(Math.random()-.5)*.55;
  galaxyPos[i*3]=Math.cos(ang)*rad;galaxyPos[i*3+1]=Math.sin(ang)*rad*.42;galaxyPos[i*3+2]=(Math.random()-.5)*.7;
  const cc=galaxyPalette[Math.floor(Math.random()*galaxyPalette.length)];galaxyCol[i*3]=cc.r;galaxyCol[i*3+1]=cc.g;galaxyCol[i*3+2]=cc.b;
}
const galaxyGeo=new THREE.BufferGeometry();galaxyGeo.setAttribute('position',new THREE.BufferAttribute(galaxyPos,3));galaxyGeo.setAttribute('color',new THREE.BufferAttribute(galaxyCol,3));
galaxyGroup.add(new THREE.Points(galaxyGeo,new THREE.PointsMaterial({size:.17,vertexColors:true,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false})));
const galaxyCore=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xffbce9,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));
galaxyCore.scale.set(7,7,1);galaxyGroup.add(galaxyCore);

const nebulae=[];
for(let i=0;i<9;i++){
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:[0x9c7cff,0xff8fcf,0x6bdcff,0xffc2a4][i%4],transparent:true,opacity:.19+Math.random()*.18,blending:THREE.AdditiveBlending,depthWrite:false}));
  const a=Math.random()*Math.PI*2,r=7+Math.random()*8;
  sprite.position.set(Math.cos(a)*r,Math.sin(a)*r*.6,-18-i*14);
  const size=8+Math.random()*13;sprite.scale.set(size,size*.7,1);
  journeyGroup.add(sprite);nebulae.push(sprite);
}

const crystals=new THREE.Group();scene.add(crystals);const crystalColors=[0xffa8df,0x9deaff,0xc3a5ff,0xffe2a3,0xa9ffd9],items=[];
function spawn(){crystals.clear();items.length=0;for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.18,r=4.2+(i%3)*1.05,g=new THREE.Group();g.position.set(Math.cos(a)*r,Math.sin(i*2.2)*1.4+.25,Math.sin(a)*r*.58);const c=crystalColors[i%5],gem=new THREE.Mesh(new THREE.OctahedronGeometry(.24),new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.75,metalness:.15,roughness:.2}));g.add(gem);addGlow(g,.95,c,.75);const halo=new THREE.Mesh(new THREE.TorusGeometry(.36,.012,6,48),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.55}));halo.rotation.x=Math.PI/2;g.add(halo);crystals.add(g);items.push({group:g,gem,phase:Math.random()*6,collected:false})}}
spawn();
const particles=new THREE.Group();scene.add(particles);const bursts=[],ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
function burst(p,index){for(let i=0;i<15;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.03+Math.random()*.03,8,8),new THREE.MeshBasicMaterial({color:crystalColors[index%5],transparent:true}));m.position.copy(p);particles.add(m);bursts.push({m,v:new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(.05+Math.random()*.08),life:1})}}
const screens=['home','menu','explore','game'];function show(id){screens.forEach(s=>document.getElementById(s).classList.toggle('active',s===id));if(id!=='game')stopGame();$('planetInfo')?.classList.remove('show');if(id!=='game')$('overlay')?.classList.remove('show');system.visible=id!=='explore';journeyGroup.visible=id==='explore';if(id==='explore'){camera.position.set(0,0,18);camera.fov=48;camera.updateProjectionMatrix();camera.lookAt(0,0,-35);journeyGroup.rotation.set(0,0,0);}else{camera.position.set(0,5.8,18.5);camera.fov=48;camera.updateProjectionMatrix();camera.lookAt(0,0,0);}}
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1900)}
document.getElementById('enterBtn').addEventListener('click',()=>show('menu'));document.getElementById('howBtn').addEventListener('click',()=>show('explore'));document.getElementById('homeBtn').onclick=()=>show('home');document.getElementById('exploreMenuBtn').onclick=()=>show('menu');document.getElementById('exploreHomeBtn').onclick=()=>show('home');document.getElementById('menuBtn').onclick=()=>{document.getElementById('overlay').classList.remove('show');show('menu')};
document.getElementById('playCard').onclick=()=>{show('game');startGame()};document.getElementById('planetCard').onclick=()=>show('explore');document.getElementById('galleryCard').onclick=()=>toast('Your Star Gallery is coming soon 🌟');
let score=0,best=Number(localStorage.getItem('astridDreamBest')||0),time=60,playing=false,paused=false,interval=null,auto=true;
const $=id=>document.getElementById(id);$('best').textContent=best;
function hud(){$('score').textContent=score+' / 10';$('time').textContent=time;$('best').textContent=best;$('bar').style.width=score*10+'%'}
function stopGame(){playing=false;clearInterval(interval);interval=null}
function finish(won){stopGame();$('resultEmoji').textContent=won?'🏆':'🌙';$('resultTitle').textContent=won?'You found your stars!':'Time is up!';$('resultText').textContent=won?`Amazing! You collected all 10 crystals with ${time} seconds left.`:`You collected ${score} of 10 crystals. Every explorer can try again!`;$('overlay').classList.add('show')}
function startGame(){stopGame();score=0;time=60;playing=true;paused=false;spawn();$('overlay').classList.remove('show');$('message').textContent='Find the glowing crystals around the galaxy!';$('startBtn').textContent='↻ Restart mission';$('pauseBtn').textContent='Ⅱ Pause universe';hud();interval=setInterval(()=>{if(!playing||paused)return;time--;hud();if(time<=0)finish(false)},1000)}
$('startBtn').onclick=startGame;$('againBtn').onclick=startGame;$('resultMenuBtn').onclick=()=>{$('overlay').classList.remove('show');show('menu')};
$('pauseBtn').onclick=()=>{paused=!paused;$('pauseBtn').textContent=paused?'▶ Resume universe':'Ⅱ Pause universe'};
$('colorBtn').onclick=()=>{palette=(palette+1)%3;const p=palettes[palette];sun.material.color.setHex(p.sun);sun.material.emissive.setHex(p.sun);key.color.setHex(p.sun);planets.forEach((v,i)=>v.mesh.material.color.setHex(p.p[i]));toast('A new cosmic palette ✨')};
let dragging=false,px=0,py=0,rotY=0,rotX=-.18,dragMoved=false,suppressSceneClick=false;renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;dragMoved=false;px=e.clientX;py=e.clientY;renderer.domElement.classList.add('dragging');try{renderer.domElement.setPointerCapture(e.pointerId)}catch(_){}});renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-px,dy=e.clientY-py;if(Math.abs(dx)+Math.abs(dy)>1)dragMoved=true;if($('explore').classList.contains('active')){journeyGroup.rotation.y=THREE.MathUtils.clamp(journeyGroup.rotation.y+dx*.002,-.55,.55);journeyGroup.rotation.x=THREE.MathUtils.clamp(journeyGroup.rotation.x+dy*.0015,-.28,.28);}else{rotY+=dx*.008;rotX=THREE.MathUtils.clamp(rotX+dy*.006,-.8,.55);}px=e.clientX;py=e.clientY});function endDrag(){if(dragging&&dragMoved){suppressSceneClick=true;setTimeout(()=>suppressSceneClick=false,180)}dragging=false;renderer.domElement.classList.remove('dragging')}renderer.domElement.addEventListener('pointerup',endDrag);renderer.domElement.addEventListener('pointercancel',endDrag);renderer.domElement.addEventListener('lostpointercapture',endDrag);renderer.domElement.addEventListener('wheel',e=>{if($('explore').classList.contains('active')){camera.fov=THREE.MathUtils.clamp(camera.fov+e.deltaY*.025,35,68);camera.updateProjectionMatrix();}else{camera.position.z=THREE.MathUtils.clamp(camera.position.z+e.deltaY*.009,10,29);}},{passive:true});document.getElementById('orbitBtn').textContent='✦ Starlight journey';document.getElementById('orbitBtn').onclick=()=>toast('Keep wandering — the stars never stop ✨');
$('resetBtn').onclick=()=>{rotY=0;rotX=-.18;journeyGroup.rotation.set(0,0,0);camera.fov=48;camera.updateProjectionMatrix();if($('explore').classList.contains('active')){camera.position.set(0,0,18);camera.lookAt(0,0,-35);}else{camera.position.set(0,5.8,18.5);camera.lookAt(0,0,0);}toast('Galaxy view centered ✦')};
renderer.domElement.addEventListener('click',e=>{if(suppressSceneClick)return;pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(pointer,camera);if($('explore').classList.contains('active')){const hits=ray.intersectObjects(planets.map(p=>p.mesh),false);if(hits.length){const idx=planets.findIndex(p=>p.mesh===hits[0].object);const names=['Aqua · The Ocean Moon','Rosé · The Dream Garden','Violet · The Crystal Giant','Sol · The Golden Ember'];const desc=['A peaceful blue world where forgotten wishes drift like tides.','A soft pink planet said to bloom with stardust flowers.','A mysterious violet world filled with glowing crystal caves.','A tiny golden planet that carries the warmth of a thousand suns.'];$('planetName').textContent=names[idx];$('planetDesc').textContent=desc[idx];$('planetInfo').classList.add('show');const wp=new THREE.Vector3();hits[0].object.getWorldPosition(wp);burst(wp,idx);return;}else{$('planetInfo').classList.remove('show');return;}}if(!playing||paused||!$('game').classList.contains('active'))return;const targets=items.filter(x=>!x.collected).flatMap(x=>x.group.children.filter(o=>o.isMesh));const hits=ray.intersectObjects(targets,false);if(!hits.length)return;let par=hits[0].object.parent;while(par&&!items.some(x=>x.group===par))par=par.parent;const item=items.find(x=>x.group===par);if(!item||item.collected)return;item.collected=true;const wp=new THREE.Vector3();item.group.getWorldPosition(wp);burst(wp,items.indexOf(item));crystals.remove(item.group);score++;if(score>best){best=score;localStorage.setItem('astridDreamBest',best)}hud();$('message').textContent=['Beautiful catch! ✨','More stardust for your universe!','You are doing great, explorer!'][score%3];if(score===10)finish(true)});
const musicFile=$('musicFile'),audio=$('ambientAudio'),soundBtn=$('soundBtn'),volume=$('musicVolume'),volumeValue=$('volumeValue');let musicURL=null;audio.volume=.35;soundBtn.onclick=()=>{if(audio.src&&!audio.paused){audio.pause();soundBtn.textContent='♫ Music: Off';}else if(audio.src){audio.play().then(()=>soundBtn.textContent='♫ Music: On').catch(()=>musicFile.click());}else{musicFile.click();}};musicFile.addEventListener('change',()=>{const file=musicFile.files&&musicFile.files[0];if(!file)return;if(musicURL)URL.revokeObjectURL(musicURL);musicURL=URL.createObjectURL(file);audio.src=musicURL;audio.volume=Number(volume.value)/100;audio.play().then(()=>{soundBtn.textContent='♫ Music: On';toast('Now playing: '+file.name+' ✨');}).catch(()=>toast('Tap the music button to start playback.'));});volume.addEventListener('input',()=>{audio.volume=Number(volume.value)/100;volumeValue.textContent=volume.value+'%'});



initSoundtrack({ $, toast });
initVisualEffects();
initKeyboardNavigation($);

const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();rotY+=.0007;const isHome=$('home').classList.contains('active');const isJourney=$('explore').classList.contains('active');system.visible=!isJourney;journeyGroup.visible=isJourney;system.position.y=isHome?-2.8:0;crystals.position.y=isHome?-2.8:0;system.rotation.y=rotY;system.rotation.x=rotX;
if(isJourney){for(let i=0;i<journeyCount;i++){const k=i*3;journeyPositions[k+2]+=journeySpeeds[i];if(journeyPositions[k+2]>20){const a=Math.random()*Math.PI*2,r=3+Math.sqrt(Math.random())*17;journeyPositions[k]=Math.cos(a)*r;journeyPositions[k+1]=Math.sin(a)*r*.68;journeyPositions[k+2]=-125;}}journeyGeo.attributes.position.needsUpdate=true;
for(let i=0;i<streakCount;i++){const k=i*6;streakPositions[k+2]+=streakSpeeds[i];streakPositions[k+5]+=streakSpeeds[i]*1.12;if(streakPositions[k+2]>20){const a=Math.random()*Math.PI*2,r=3+Math.random()*15,z=-125;streakPositions[k]=Math.cos(a)*r;streakPositions[k+1]=Math.sin(a)*r*.68;streakPositions[k+2]=z;streakPositions[k+3]=streakPositions[k];streakPositions[k+4]=streakPositions[k+1];streakPositions[k+5]=z-1-Math.random()*4;}}
streakGeo.attributes.position.needsUpdate=true;galaxyGroup.rotation.z=t*.018;journeyGroup.rotation.z=Math.sin(t*.08)*.025;camera.position.x=Math.sin(t*.16)*.22;camera.position.y=Math.cos(t*.13)*.12;camera.lookAt(0,0,-35);}sun.rotation.y=t*.12;sun.scale.setScalar(1+Math.sin(t*1.4)*.018);planets.forEach((p,i)=>{p.pivot.rotation.y+=p.speed;p.mesh.rotation.y+=.008;p.mesh.position.y=Math.sin(t*.8+i)*.035});stars.rotation.y=t*.003;dust.children.forEach((b,i)=>{b.position.y+=Math.sin(t*.7+i)*.0008});items.forEach(c=>{if(!c.collected){c.group.rotation.y+=.018;c.group.position.y+=Math.sin(t*1.8+c.phase)*.0015;c.gem.rotation.x+=.012}});for(let i=bursts.length-1;i>=0;i--){const p=bursts[i];p.m.position.add(p.v);p.v.multiplyScalar(.97);p.life-=.025;p.m.material.opacity=Math.max(0,p.life);if(p.life<=0){particles.remove(p.m);p.m.geometry.dispose();p.m.material.dispose();bursts.splice(i,1)}}renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2))});
