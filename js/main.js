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
// Dedicated, home-only cinematic depth layer. It shares the existing renderer and is hidden during other screens.
const homeBackdrop=new THREE.Group();scene.add(homeBackdrop);
function homeWorld(x,y,z,r,color,accent,mode=0){
 const map=makePlanetMap('#'+color.toString(16).padStart(6,'0'),accent,mode);
 const body=new THREE.Mesh(new THREE.SphereGeometry(r,80,80),new THREE.MeshPhysicalMaterial({map,roughness:.72,metalness:.03,clearcoat:.24}));
 body.position.set(x,y,z);homeBackdrop.add(body);
 const air=new THREE.Mesh(new THREE.SphereGeometry(r*1.075,48,48),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.14,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false}));
 air.position.copy(body.position);homeBackdrop.add(air);return body;
}
const homePlanet=homeWorld(12.8,5.3,-7.5,5.1,0x6754aa,'#d6baff',1);
const ringedWorld=homeWorld(-9.2,-4.2,-31,1.9,0x526eaf,'#bdeaff',0);
const homeRing=new THREE.Mesh(new THREE.RingGeometry(2.55,4.05,128),new THREE.MeshBasicMaterial({color:0xd8b6ff,side:THREE.DoubleSide,transparent:true,opacity:.58,depthWrite:false}));
homeRing.position.copy(ringedWorld.position);homeRing.rotation.set(1.05,.15,-.22);homeBackdrop.add(homeRing);const compactHome=innerWidth<700;if(compactHome){homePlanet.position.set(8.5,-5,-10);homePlanet.scale.setScalar(.72);ringedWorld.position.set(-9.5,-5,-31);homeRing.position.copy(ringedWorld.position);}
const homeNebulae=[];
for(let i=0;i<7;i++){
 const material=new THREE.SpriteMaterial({map:glow,color:[0x7646b5,0xb04caa,0x514ba0,0x4c829c,0x9855c4,0x663e8e,0x5372a8][i],transparent:true,opacity:.19+i%3*.035,blending:THREE.AdditiveBlending,depthWrite:false});
 const cloud=new THREE.Sprite(material);cloud.position.set((i-3)*7,Math.sin(i*2.1)*5,-38-i*7);cloud.scale.set(19+i%3*7,9+i%2*5,1);cloud.userData.phase=i*1.7;homeBackdrop.add(cloud);homeNebulae.push(cloud);
}
const homeStarCount=3800,homeStarPositions=new Float32Array(homeStarCount*3),homeStarColors=new Float32Array(homeStarCount*3),homeStarPalette=[new THREE.Color(0xffffff),new THREE.Color(0xcab8ff),new THREE.Color(0xffbce5),new THREE.Color(0x9deaff)];
for(let i=0;i<homeStarCount;i++){const j=i*3;homeStarPositions[j]=(Math.random()-.5)*150;homeStarPositions[j+1]=(Math.random()-.5)*90;homeStarPositions[j+2]=-8-Math.random()*100;const c=homeStarPalette[Math.floor(Math.random()*4)];homeStarColors[j]=c.r;homeStarColors[j+1]=c.g;homeStarColors[j+2]=c.b}
const homeStarGeo=new THREE.BufferGeometry();homeStarGeo.setAttribute('position',new THREE.BufferAttribute(homeStarPositions,3));homeStarGeo.setAttribute('color',new THREE.BufferAttribute(homeStarColors,3));
homeBackdrop.add(new THREE.Points(homeStarGeo,new THREE.PointsMaterial({size:.12,vertexColors:true,transparent:true,opacity:.92,sizeAttenuation:true,depthWrite:false})));
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
const farGalaxy=galaxyGroup.clone();farGalaxy.position.set(8,-4,-126);farGalaxy.scale.setScalar(.42);farGalaxy.rotation.set(-.3,.4,.35);journeyGroup.add(farGalaxy);

const nebulae=[];
for(let i=0;i<9;i++){
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:[0x9c7cff,0xff8fcf,0x6bdcff,0xffc2a4][i%4],transparent:true,opacity:.19+Math.random()*.18,blending:THREE.AdditiveBlending,depthWrite:false}));
  const a=Math.random()*Math.PI*2,r=7+Math.random()*8;
  sprite.position.set(Math.cos(a)*r,Math.sin(a)*r*.6,-18-i*14);
  const size=8+Math.random()*13;sprite.scale.set(size,size*.7,1);
  journeyGroup.add(sprite);nebulae.push(sprite);
}

// Close planetary fly-bys add scale and depth to the star-corridor flight.
const flybyGroup=new THREE.Group();journeyGroup.add(flybyGroup);
const flybyPlanets=[],flybyColors=[0x76b8d9,0xd98bb9,0x9d8adc,0xd9b16e,0x71c7a2,0xc77f73,0x8aabd8,0xd4c887];
for(let i=0;i<14;i++){
 const size=.5+Math.random()*.9,color=flybyColors[i%flybyColors.length],angle=Math.random()*Math.PI*2,radius=7+Math.random()*12;
 const body=new THREE.Mesh(new THREE.SphereGeometry(size,40,40),new THREE.MeshPhysicalMaterial({color,roughness:.72,metalness:.04,clearcoat:.32,clearcoatRoughness:.55,emissive:color,emissiveIntensity:.055}));
 const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(size*1.08,28,28),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.11,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false}));body.add(atmosphere);
 addGlow(body,size*3.4,color,.15);
 const group=new THREE.Group();group.position.set(Math.cos(angle)*radius,Math.sin(angle)*radius*.62,-130+Math.random()*150);group.add(body);
 const ringed=i%3===0;
 if(ringed){const ring=new THREE.Mesh(new THREE.TorusGeometry(size*1.48,.035,8,72),new THREE.MeshBasicMaterial({color:flybyColors[(i+2)%flybyColors.length],transparent:true,opacity:.62,blending:THREE.AdditiveBlending}));ring.rotation.set(Math.PI/2.25,.12,0);group.add(ring);}
 flybyGroup.add(group);flybyPlanets.push({group,body,size,baseY:Math.sin(angle)*radius*.62,speed:.18+Math.random()*.3,phase:Math.random()*Math.PI*2});
}

const crystals=new THREE.Group();scene.add(crystals);const crystalColors=[0xffa8df,0x9deaff,0xc3a5ff,0xffe2a3,0xa9ffd9],items=[];
function spawn(){crystals.clear();items.length=0;for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.18,r=4.2+(i%3)*1.05,g=new THREE.Group();g.position.set(Math.cos(a)*r,Math.sin(i*2.2)*1.4+.25,Math.sin(a)*r*.58);const c=crystalColors[i%5],gem=new THREE.Mesh(new THREE.OctahedronGeometry(.24),new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.75,metalness:.15,roughness:.2}));g.add(gem);addGlow(g,.95,c,.75);const halo=new THREE.Mesh(new THREE.TorusGeometry(.36,.012,6,48),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.55}));halo.rotation.x=Math.PI/2;g.add(halo);crystals.add(g);items.push({group:g,gem,phase:Math.random()*6,collected:false})}}
spawn();
const particles=new THREE.Group();scene.add(particles);const bursts=[],ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
function burst(p,index){for(let i=0;i<15;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.03+Math.random()*.03,8,8),new THREE.MeshBasicMaterial({color:crystalColors[index%5],transparent:true}));m.position.copy(p);particles.add(m);bursts.push({m,v:new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(.05+Math.random()*.08),life:1})}}
const screens=['home','menu','flight','explore','game'];let flightTransition=null;function show(id){document.documentElement.dataset.activeScreen=id;screens.forEach(s=>document.getElementById(s).classList.toggle('active',s===id));if(id!=='game')stopGame();$('planetInfo')?.classList.remove('show');$('destinationDetail')?.classList.remove('open');$('destinationDetail')?.setAttribute('aria-hidden','true');if(id!=='game')$('overlay')?.classList.remove('show');const journeyActive=id==='explore'||id==='flight';system.visible=!journeyActive;journeyGroup.visible=journeyActive;if(id==='explore'){flightTransition=null;focusedDestination=null;if(mapStatus)mapStatus.textContent='READY TO EXPLORE';camera.position.set(0,0,18);camera.fov=48;camera.updateProjectionMatrix();camera.lookAt(0,0,-35);journeyGroup.rotation.set(0,0,0);}else if(id==='home'){flightTransition=null;camera.position.set(0,4.2,15.5);camera.fov=48;camera.updateProjectionMatrix();camera.lookAt(0,-1.1,0);}else{flightTransition=null;camera.position.set(0,5.8,18.5);camera.fov=48;camera.updateProjectionMatrix();camera.lookAt(0,0,0);}}
function beginExplore(){
 const fromHome=$('home').classList.contains('active'),fromPosition=camera.position.clone();
 const fromTarget=fromHome?new THREE.Vector3(0,-1.1,0):new THREE.Vector3(0,0,0);
 screens.forEach(screen=>document.getElementById(screen).classList.toggle('active',screen==='flight'));document.documentElement.dataset.activeScreen='flight';
 stopGame();$('planetInfo').classList.remove('show');$('destinationDetail').classList.remove('open');$('destinationDetail').setAttribute('aria-hidden','true');$('overlay').classList.remove('show');
 focusedDestination=null;system.visible=true;journeyGroup.visible=true;journeyGroup.rotation.set(0,0,0);document.getElementById('flight').classList.add('entering');
 flightTransition={started:performance.now(),duration:2600,fromPosition:fromPosition,toPosition:new THREE.Vector3(0,0,18),fromTarget,toTarget:new THREE.Vector3(0,0,-35),fromFov:camera.fov};
 if(mapStatus)mapStatus.textContent='ENTERING THE STAR CORRIDOR';
}
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1900)}
// Searchable map locations share a simple local coordinate system inside the star corridor.
const destinationCatalog=[
 {name:'Sun',type:'Star',detail:'The star at the heart of our solar system.',inside:'A vast sphere of hot plasma. Deep inside, its core fuses hydrogen into helium; energy then travels through the radiative and convective zones before shining from the surface.',facts:['Core · 15 million °C','Photosphere','Solar atmosphere'],position:new THREE.Vector3(0,0,-38),color:0xffd88a},
 {name:'Andromeda Galaxy',type:'Galaxy',detail:'Our neighboring spiral galaxy, about 2.5 million light-years away.',inside:'A giant spiral containing roughly a trillion stars, glowing gas clouds, star-forming regions, and a supermassive black hole at its center. Its broad arms hold countless star systems.',facts:['~1 trillion stars','Spiral arms','Central black hole'],position:galaxyGroup.position,color:0xc9aaff},
 {name:'Milky Way',type:'Galaxy',detail:'Our home galaxy, seen from within.',inside:'A barred spiral with a bright central bulge, a supermassive black hole called Sagittarius A*, and long arms filled with stars, nebulae, and planetary systems. Our Sun sits in the Orion Arm.',facts:['Sagittarius A*','Orion Arm','Our home'],position:new THREE.Vector3(3,-1,-69),color:0x9deaff},
 {name:'Orion Nebula',type:'Nebula',detail:'A stellar nursery glowing in the Orion constellation.',inside:'A luminous cloud of gas and dust where young stars are forming. Newborn stars sculpt glowing cavities and dark pillars in the surrounding nebula.',facts:['Star nursery','Gas & dust','Young star cluster'],position:new THREE.Vector3(5,2,-60),color:0xff9fd7},
 {name:'Sirius',type:'Star',detail:'The brightest star in Earth’s night sky.',inside:'Sirius is a binary star system: brilliant Sirius A and its small, dense white-dwarf companion Sirius B orbit one another.',facts:['Binary system','Sirius A','White dwarf B'],position:new THREE.Vector3(-4,2,-52),color:0xa8ddff},
 {name:'Earth',type:'Planet',detail:'Our pale blue home, orbiting the Sun.',inside:'A rocky world with a protective atmosphere, liquid-water oceans, shifting continents, and a single natural moon.',facts:['Oceans & continents','One Moon','Habitable world'],position:new THREE.Vector3(1,-2,-43),color:0x80cfff}
];
destinationCatalog.filter(d=>d.name!=='Andromeda Galaxy').forEach(d=>{const marker=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:d.color,transparent:true,opacity:.76,blending:THREE.AdditiveBlending,depthWrite:false}));marker.position.copy(d.position);marker.scale.set(1.7,1.7,1);journeyGroup.add(marker);});
const destinationSearch=document.getElementById('destinationSearch'),destinationResults=document.getElementById('destinationResults'),mapStatus=document.getElementById('mapStatus');let focusedDestination=null,focusedViewTarget=null;
function renderDestinations(query=''){
 if(!destinationResults)return;
 const matches=destinationCatalog.filter(d=>(d.name+' '+d.type+' '+d.detail).toLowerCase().includes(query.trim().toLowerCase()));
 destinationResults.replaceChildren();
 if(!matches.length){const empty=document.createElement('p');empty.className='destination-empty';empty.textContent='No destinations found. Try “Sun” or “Andromeda”.';destinationResults.append(empty);return;}
 matches.forEach((d,index)=>{const button=document.createElement('button');button.type='button';button.className='destination-option';button.setAttribute('role','option');button.innerHTML=`<span class="destination-dot" style="--destination-color:#${d.color.toString(16).padStart(6,'0')}"></span><span class="destination-copy"><strong></strong><small></small></span><span class="destination-kind"></span>`;button.querySelector('strong').textContent=d.name;button.querySelector('small').textContent=d.detail;button.querySelector('.destination-kind').textContent=d.type;button.addEventListener('click',()=>focusDestination(d));destinationResults.append(button);});
}
let selectedSun=null,sunTransition=null;
function createSunDestination(){
 if(selectedSun)return selectedSun;
 const group=new THREE.Group();group.position.set(0,0,-35);scene.add(group);
 const surface=new THREE.Mesh(new THREE.SphereGeometry(3,128,128),new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:'varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){vUv=uv;vN=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform float uTime;varying vec2 vUv;varying vec3 vN;varying vec3 vV;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}void main(){vec2 p=vUv*vec2(90.,45.);float gran=n(p+uTime*.025)*.58+n(p*2.7-uTime*.04)*.27+n(p*6.1+uTime*.06)*.15;float bands=sin(vUv.y*95.+sin(vUv.x*18.+uTime*.12)*2.)*.06;float temp=clamp(gran+bands,0.,1.);vec3 plasma=mix(vec3(.72,.12,.015),vec3(1.,.43,.035),temp);plasma=mix(plasma,vec3(1.,.82,.28),smoothstep(.67,.96,temp));float light=.42+.58*max(dot(normalize(vN),normalize(vec3(-.4,.5,1.))),0.);gl_FragColor=vec4(plasma*light,1.);}',toneMapped:false}));group.add(surface);
 const corona=new THREE.Mesh(new THREE.SphereGeometry(3.34,64,64),new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform float uTime;varying vec3 vN;varying vec3 vV;void main(){float rim=pow(1.-max(dot(normalize(vN),normalize(vV)),0.),4.0);float rays=.82+.18*sin(atan(vN.y,vN.x)*42.+uTime*.3);float haze=exp(-abs(dot(normalize(vN),normalize(vV)))*5.);float a=(rim*.24+haze*.035)*rays;gl_FragColor=vec4(1.,.62,.2,a);}',transparent:true,blending:THREE.AdditiveBlending,side:THREE.BackSide,depthWrite:false,toneMapped:false}));group.add(corona);
 const flareGroup=new THREE.Group();group.add(flareGroup);
 const prominenceSeeds=[[-.92,.58,.36,.42],[-.18,.82,-.22,.58],[.67,.38,.48,.34],[1.42,.67,-.35,.46]];
 prominenceSeeds.forEach(([longitude,latitude,drift,height],i)=>{
  const point=(lon,lat)=>new THREE.Vector3(3*Math.cos(lat)*Math.cos(lon),3*Math.sin(lat),3*Math.cos(lat)*Math.sin(lon));
  const start=point(longitude,latitude),end=point(longitude+drift,latitude+(i%2?.12:-.09)),normal=start.clone().add(end).normalize(),lift=height*(.72+Math.random()*.5);
  const points=[start,start.clone().lerp(end,.22).addScaledVector(normal,lift*.58),start.clone().lerp(end,.5).addScaledVector(normal,lift),start.clone().lerp(end,.79).addScaledVector(normal,lift*.48),end];
  const arc=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),28,.014,6,false),new THREE.MeshBasicMaterial({color:i%2?0xffd58a:0xffa34e,transparent:true,opacity:.34,blending:THREE.AdditiveBlending,depthWrite:false}));
  arc.userData={phase:i*1.91,baseOpacity:.28+Math.random()*.1};flareGroup.add(arc);
 });
 const glowSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xffa84a,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}));glowSprite.scale.set(11,11,1);group.add(glowSprite);
 const light=new THREE.PointLight(0xffa13c,180,95,1.7);group.add(light);
 selectedSun={group,surface,corona,flareGroup,glowSprite,light,phase:Math.random()*6.28};return selectedSun;
}
let selectedEarth=null;
function createEarthDestination(){
 if(selectedEarth)return selectedEarth;
 const group=new THREE.Group();group.position.set(0,0,-35);scene.add(group);
 const width=1536,height=768,night=document.createElement('canvas');night.width=width;night.height=height;const nc=night.getContext('2d');nc.fillStyle='#000';nc.fillRect(0,0,width,height);
 const nightMap=new THREE.CanvasTexture(night);nightMap.colorSpace=THREE.SRGBColorSpace;
 const fallback=document.createElement('canvas');fallback.width=width;fallback.height=height;const fc=fallback.getContext('2d');fc.fillStyle='#12518b';fc.fillRect(0,0,width,height);const dayMap=new THREE.CanvasTexture(fallback);dayMap.colorSpace=THREE.SRGBColorSpace;
 const earthMat=new THREE.ShaderMaterial({uniforms:{uDay:{value:dayMap},uNight:{value:nightMap},uLight:{value:new THREE.Vector3(0,.08,1).normalize()}},vertexShader:'varying vec2 vUv;varying vec3 vNormal;void main(){vUv=uv;vNormal=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;}',fragmentShader:'uniform sampler2D uDay;uniform sampler2D uNight;uniform vec3 uLight;varying vec2 vUv;varying vec3 vNormal;void main(){float d=dot(normalize(vNormal),normalize(uLight));float day=smoothstep(-.62,.08,d);vec3 land=texture2D(uDay,vUv).rgb;vec3 lights=texture2D(uNight,vUv).rgb;vec3 dayColor=pow(max(land,vec3(.001)),vec3(.72))*vec3(1.42,1.38,1.32)+vec3(.045,.06,.08);vec3 nightColor=land*vec3(.24,.28,.34)+lights*vec3(1.9,1.25,.62)+vec3(.008,.016,.03);vec3 color=mix(nightColor,dayColor,day);gl_FragColor=vec4(color,1.);}',toneMapped:false});
 const earthTextureLoader=new THREE.TextureLoader();earthTextureLoader.load('assets/textures/earth-blue-marble.jpg',texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;texture.wrapS=THREE.RepeatWrapping;texture.flipY=true;earthMat.uniforms.uDay.value=texture;const pixelsCanvas=document.createElement('canvas');pixelsCanvas.width=width;pixelsCanvas.height=height;const pc=pixelsCanvas.getContext('2d');pc.drawImage(texture.image,0,0,width,height);const pixels=pc.getImageData(0,0,width,height).data;for(let i=0;i<24000;i++){const x=Math.random()*width|0,y=Math.random()*height|0,k=(y*width+x)*4,r=pixels[k],g=pixels[k+1],b=pixels[k+2];if(g>r*1.04&&g>b*.72){nc.fillStyle=`rgba(255,190,105,${.12+Math.random()*.42})`;nc.fillRect(x,y,1+Math.random()*1.5,1+Math.random()*1.5);}}nightMap.needsUpdate=true;console.info('[ASTRAVERSE] Blue Marble Earth texture loaded',texture.image.width,texture.image.height);},undefined,error=>console.error('[ASTRAVERSE] Blue Marble Earth texture failed to load',error));
 const surface=new THREE.Mesh(new THREE.SphereGeometry(3,96,96),earthMat);group.add(surface);
 const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(3.17,64,64),new THREE.ShaderMaterial({vertexShader:'varying vec3 n;varying vec3 v;void main(){n=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 v;void main(){float rim=pow(1.-max(dot(normalize(n),normalize(v)),0.),3.);gl_FragColor=vec4(.12,.55,1.,rim*.32);}',transparent:true,blending:THREE.AdditiveBlending,side:THREE.BackSide,depthWrite:false,toneMapped:false}));group.add(atmosphere);
 selectedEarth={group,surface,atmosphere,dayMap,nightMap};return selectedEarth;
}
let selectedAndromeda=null;
function createAndromedaDestination(){
 if(selectedAndromeda)return selectedAndromeda;
 const group=new THREE.Group();group.position.set(0,0,-35);group.scale.setScalar(.9);group.rotation.set(.52,.08,-.12);scene.add(group);
 const armCount=5,starsPerArm=4200,starPositions=new Float32Array(armCount*starsPerArm*3),starColors=new Float32Array(armCount*starsPerArm*3),starSizes=new Float32Array(armCount*starsPerArm),coreColor=new THREE.Color(0xf5efff),midColor=new THREE.Color(0x9b8cff),outerColor=new THREE.Color(0x79c9ff);
 let cursor=0;
 for(let arm=0;arm<armCount;arm++)for(let i=0;i<starsPerArm;i++){
  const r=.18+Math.pow(Math.random(),.78)*8.7,theta=arm*Math.PI*2/armCount+r*.57+(Math.random()-.5)*(.1+r*.027),spread=(Math.random()-.5)*(.16+r*.018),angle=theta+spread;
  const x=Math.cos(angle)*r+(Math.random()-.5)*.16,y=(Math.random()-.5)*(.16+r*.024),z=Math.sin(angle)*r+(Math.random()-.5)*.16;
  starPositions[cursor*3]=x;starPositions[cursor*3+1]=y;starPositions[cursor*3+2]=z;
  const tint=new THREE.Color().lerpColors(coreColor,midColor,THREE.MathUtils.clamp(r/5,0,1));if(r>4)tint.lerp(outerColor,THREE.MathUtils.clamp((r-4)/5,0,.55));
  tint.multiplyScalar(.72+Math.random()*.42);starColors[cursor*3]=tint.r;starColors[cursor*3+1]=tint.g;starColors[cursor*3+2]=tint.b;starSizes[cursor]=.48+Math.random()*1.08;cursor++;
 }
 const armsGeometry=new THREE.BufferGeometry();armsGeometry.setAttribute('position',new THREE.BufferAttribute(starPositions,3));armsGeometry.setAttribute('color',new THREE.BufferAttribute(starColors,3));armsGeometry.setAttribute('aSize',new THREE.BufferAttribute(starSizes,1));
 const armsMaterial=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:'attribute float aSize;uniform float uTime;varying vec3 vColor;varying float vTwinkle;void main(){vColor=color;vTwinkle=.94+.06*sin(uTime*.8+aSize*37.+position.x*9.);vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*(170.0/max(1.0,-mv.z)),1.0,5.5);}',fragmentShader:'varying vec3 vColor;varying float vTwinkle;void main(){float d=length(gl_PointCoord-vec2(.5));float a=1.-smoothstep(.16,.5,d);gl_FragColor=vec4(vColor*vTwinkle,a);}',vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
 const arms=new THREE.Points(armsGeometry,armsMaterial);group.add(arms);
 // Wispy inter-arm dust: low-opacity filaments follow the same broad spiral flow.
 const dustCount=7200,dustPositions=new Float32Array(dustCount*3),dustColors=new Float32Array(dustCount*3),dustTint=new THREE.Color(0x6f66a9);
 for(let i=0;i<dustCount;i++){
  const arm=i%armCount,r=.65+Math.random()*8.15,theta=arm*Math.PI*2/armCount+r*.57-.12+(Math.random()-.5)*.055;
  dustPositions[i*3]=Math.cos(theta)*r;dustPositions[i*3+1]=(Math.random()-.5)*.13;dustPositions[i*3+2]=Math.sin(theta)*r;
  const brightness=.22+Math.random()*.32;dustColors[i*3]=dustTint.r*brightness;dustColors[i*3+1]=dustTint.g*brightness;dustColors[i*3+2]=dustTint.b*brightness;
 }
 const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));dustGeometry.setAttribute('color',new THREE.BufferAttribute(dustColors,3));
 const dustMaterial=new THREE.PointsMaterial({size:.12,vertexColors:true,transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true,toneMapped:false});group.add(new THREE.Points(dustGeometry,dustMaterial));
 const nebulae=[];for(let i=0;i<7;i++){
  const arm=i%armCount,r=2.7+(i%3)*1.45,angle=arm*Math.PI*2/armCount+r*.57+.25;
  const cloud=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:[0x8d70ff,0x668dff,0xd58dff,0x91cfff][i%4],transparent:true,opacity:.13+Math.random()*.08,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
  cloud.position.set(Math.cos(angle)*r,(i%2?1:-1)*(.28+Math.random()*.22),Math.sin(angle)*r);const size=2.2+Math.random()*2.1;cloud.scale.set(size*1.55,size,1);cloud.userData={phase:i*1.37,baseOpacity:cloud.material.opacity};group.add(cloud);nebulae.push(cloud);
 }
 const coreGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0x9885ff,transparent:true,opacity:.48,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));coreGlow.scale.set(10.5,10.5,1);group.add(coreGlow);
 const innerGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xe5dbff,transparent:true,opacity:.74,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));innerGlow.scale.set(4.3,4.3,1);group.add(innerGlow);
 const nucleus=new THREE.Mesh(new THREE.SphereGeometry(.48,32,32),new THREE.MeshBasicMaterial({color:0xf9f3ff,transparent:true,opacity:.88,toneMapped:false}));group.add(nucleus);
 selectedAndromeda={group,arms,armsMaterial,dustMaterial,nebulae,coreGlow,innerGlow,nucleus,phase:Math.random()*Math.PI*2};return selectedAndromeda;
}
function focusDestination(destination){
 if(focusedDestination?.name===destination.name)return;
 const from=camera.position.clone();focusedDestination=destination;
 if(destination.name==='Sun'){if(selectedEarth)selectedEarth.group.visible=false;if(selectedAndromeda)selectedAndromeda.group.visible=false;createSunDestination();focusedViewTarget=new THREE.Vector3(0,0,-35);sunTransition={start:performance.now(),duration:1400,from,to:new THREE.Vector3(0,1,-10),target:focusedViewTarget,fov:camera.fov};}
 else if(destination.name==='Earth'){if(selectedSun)selectedSun.group.visible=false;if(selectedAndromeda)selectedAndromeda.group.visible=false;createEarthDestination();focusedViewTarget=new THREE.Vector3(innerWidth<700?0:-.45,innerHeight<650?.25:.75,-35);sunTransition={start:performance.now(),duration:1400,from,to:new THREE.Vector3(focusedViewTarget.x,focusedViewTarget.y+1,-10),target:focusedViewTarget,fov:camera.fov};}
 else if(destination.name==='Andromeda Galaxy'){if(selectedSun)selectedSun.group.visible=false;if(selectedEarth)selectedEarth.group.visible=false;createAndromedaDestination();focusedViewTarget=new THREE.Vector3(0,.15,-35);sunTransition={start:performance.now(),duration:1800,from,to:new THREE.Vector3(0,2.4,8),target:focusedViewTarget,fov:camera.fov};}
 else{if(selectedSun)selectedSun.group.visible=false;if(selectedEarth)selectedEarth.group.visible=false;if(selectedAndromeda)selectedAndromeda.group.visible=false;focusedViewTarget=destination.position;sunTransition=null;camera.fov=42;camera.updateProjectionMatrix();camera.position.set(destination.position.x,destination.position.y+1.5,destination.position.z+15);}
 mapStatus.textContent=`VIEWING · ${destination.name.toUpperCase()}`;
 $('planetInfo').classList.remove('show');$('detailType').textContent=destination.type.toUpperCase();$('detailTitle').textContent=destination.name;$('detailDescription').textContent=destination.detail;$('detailInside').textContent=destination.inside;$('detailArt').dataset.kind=destination.type;$('detailFacts').replaceChildren(...destination.facts.map(fact=>{const chip=document.createElement('span');chip.textContent=fact;return chip;}));$('destinationDetail').classList.add('open');$('destinationDetail').setAttribute('aria-hidden','false');
 destinationResults.querySelectorAll('.destination-option').forEach(button=>button.setAttribute('aria-selected',String(button.querySelector('strong').textContent===destination.name)));
}
renderDestinations();document.getElementById('detailClose').addEventListener('click',()=>{const detail=document.getElementById('destinationDetail');detail.classList.remove('open');detail.setAttribute('aria-hidden','true');});destinationSearch?.addEventListener('input',()=>renderDestinations(destinationSearch.value));
destinationSearch?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();destinationResults.querySelector('.destination-option')?.click();}if(event.key==='Escape'){destinationSearch.value='';renderDestinations();destinationSearch.blur();}});
addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)&&$('explore').classList.contains('active')){event.preventDefault();destinationSearch?.focus();}});
const flightMark=document.querySelector('.flight-mark'),brandLogo=document.querySelector('.brand-logo');if(flightMark&&brandLogo)flightMark.replaceWith(brandLogo.cloneNode(true));
document.getElementById('enterBtn').addEventListener('click',()=>show('menu'));document.getElementById('howBtn').addEventListener('click',beginExplore);document.getElementById('flightMenuBtn').addEventListener('click',()=>show('menu'));document.getElementById('homeBtn').onclick=()=>show('home');document.getElementById('exploreMenuBtn').onclick=()=>show('menu');document.getElementById('exploreHomeBtn').onclick=()=>show('home');document.getElementById('menuBtn').onclick=()=>{document.getElementById('overlay').classList.remove('show');show('menu')};document.getElementById('gameHomeBtn').onclick=()=>{document.getElementById('overlay').classList.remove('show');show('home')};
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

// Keep the lightweight home orbit tilted in sync with the draggable 3D system.
const homeSystemVisual=document.querySelector('.home-system');
function syncHomeSystemTilt(){if(!homeSystemVisual)return;homeSystemVisual.style.setProperty('--home-drag-x',`${rotX*180/Math.PI}deg`);homeSystemVisual.style.setProperty('--home-drag-y',`${rotY*180/Math.PI}deg`);}
document.addEventListener('pointermove',()=>{if(dragging&&$('home').classList.contains('active'))syncHomeSystemTilt();});
// Explicitly restore the opening solar-system scene on every fresh load.
show('home');
syncHomeSystemTilt();

const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);
 const t=clock.getElapsedTime();rotY+=.0007;
 const isHome=$('home').classList.contains('active'),isFlight=$('flight').classList.contains('active'),isJourney=isFlight||$('explore').classList.contains('active');
 homeBackdrop.visible=isHome||Boolean(flightTransition);homeBackdrop.rotation.y=t*.001;homeBackdrop.position.x=Math.sin(t*.12)*.12;homePlanet.rotation.y=t*.018;ringedWorld.rotation.y=-t*.012;homeRing.rotation.z=t*.002;homeNebulae.forEach(cloud=>{cloud.position.x+=Math.sin(t*.08+cloud.userData.phase)*.0012;cloud.material.opacity=.16+Math.sin(t*.22+cloud.userData.phase)*.035});
 system.visible=!isJourney||Boolean(flightTransition);journeyGroup.visible=isJourney;
 system.position.y=isHome?-3.1:0;system.scale.setScalar(isHome?1.18:1);crystals.position.y=isHome?-1.1:0;system.rotation.y=rotY;system.rotation.x=rotX;
 const flightProgress=flightTransition?THREE.MathUtils.clamp((performance.now()-flightTransition.started)/flightTransition.duration,0,1):0;
 const flightBoost=flightTransition?1+3.2*Math.sin(flightProgress*Math.PI):(isJourney?1.75:1);
 if(isJourney){
  for(let i=0;i<journeyCount;i++){const k=i*3;journeyPositions[k+2]+=journeySpeeds[i]*flightBoost;if(journeyPositions[k+2]>20){const a=Math.random()*Math.PI*2,r=3+Math.sqrt(Math.random())*17;journeyPositions[k]=Math.cos(a)*r;journeyPositions[k+1]=Math.sin(a)*r*.68;journeyPositions[k+2]=-125;}}
  journeyGeo.attributes.position.needsUpdate=true;
  for(let i=0;i<streakCount;i++){const k=i*6;streakPositions[k+2]+=streakSpeeds[i]*flightBoost;streakPositions[k+5]+=streakSpeeds[i]*1.12*flightBoost;if(streakPositions[k+2]>20){const a=Math.random()*Math.PI*2,r=3+Math.random()*15,z=-125;streakPositions[k]=Math.cos(a)*r;streakPositions[k+1]=Math.sin(a)*r*.68;streakPositions[k+2]=z;streakPositions[k+3]=streakPositions[k];streakPositions[k+4]=streakPositions[k+1];streakPositions[k+5]=z-1-Math.random()*4;}}
  streakGeo.attributes.position.needsUpdate=true;
  flybyPlanets.forEach(p=>{p.group.position.z+=p.speed*flightBoost;p.group.position.y=p.baseY+Math.sin(t*.8+p.phase)*.08;p.body.rotation.y+=.004;p.body.rotation.x+=.0015;p.group.rotation.y+=.0018;if(p.group.position.z>camera.position.z+p.size*2.5){const a=Math.random()*Math.PI*2,r=7+Math.random()*12;p.baseY=Math.sin(a)*r*.62;p.group.position.set(Math.cos(a)*r,p.baseY,-130-Math.random()*45);}});
  galaxyGroup.rotation.z=t*.035;galaxyGroup.position.x=-5+Math.sin(t*.11)*1.1;galaxyGroup.position.y=2+Math.cos(t*.13)*.7;
  farGalaxy.rotation.z=-t*.04;farGalaxy.position.x=8+Math.sin(t*.17)*1.3;farGalaxy.position.y=-4+Math.cos(t*.15)*.8;farGalaxy.position.z=-126+Math.sin(t*.1)*3;
  journeyGroup.rotation.z=Math.sin(t*.08)*.025;
  if(flightTransition){
   const raw=flightProgress,ease=raw*raw*(3-2*raw),aim=new THREE.Vector3();
   camera.position.copy(flightTransition.fromPosition).lerp(flightTransition.toPosition,ease);aim.copy(flightTransition.fromTarget).lerp(flightTransition.toTarget,ease);camera.lookAt(aim);
   camera.fov=flightTransition.fromFov+Math.sin(raw*Math.PI)*9;camera.updateProjectionMatrix();
   if(raw>=1){flightTransition=null;homeBackdrop.visible=false;system.visible=false;document.getElementById('flight').classList.remove('entering');if(mapStatus)mapStatus.textContent='LOCAL GROUP · IN FLIGHT';}
  }else if(sunTransition){const q=THREE.MathUtils.clamp((performance.now()-sunTransition.start)/sunTransition.duration,0,1),e=q*q*(3-2*q),aim=new THREE.Vector3();camera.position.copy(sunTransition.from).lerp(sunTransition.to,e);aim.copy(sunTransition.target);camera.lookAt(aim);camera.fov=THREE.MathUtils.lerp(sunTransition.fov,38,e);camera.updateProjectionMatrix();if(q>=1)sunTransition=null;}
  else if(!focusedDestination){camera.position.x=Math.sin(t*.16)*.22;camera.position.y=Math.cos(t*.13)*.12;camera.lookAt(0,0,-35);}
  else camera.lookAt(focusedViewTarget||focusedDestination.position);
 }
 if(selectedSun){selectedSun.group.visible=$('explore').classList.contains('active')&&focusedDestination?.name==='Sun';selectedSun.surface.rotation.y=t*.06;selectedSun.surface.rotation.x=Math.sin(t*.11)*.025;selectedSun.surface.material.uniforms.uTime.value=t;selectedSun.corona.material.uniforms.uTime.value=t;selectedSun.flareGroup.rotation.z=Math.sin(t*.32+selectedSun.phase)*.012;selectedSun.flareGroup.children.forEach(arc=>{arc.material.opacity=arc.userData.baseOpacity*(.88+.12*Math.sin(t*.48+arc.userData.phase));arc.scale.y=1+.025*Math.sin(t*.38+arc.userData.phase);});selectedSun.glowSprite.material.opacity=.28+.05*Math.sin(t*1.4);}
 if(selectedEarth){selectedEarth.group.visible=$('explore').classList.contains('active')&&focusedDestination?.name==='Earth';selectedEarth.surface.rotation.y=t*.025;}
 if(selectedAndromeda){selectedAndromeda.group.visible=$('explore').classList.contains('active')&&focusedDestination?.name==='Andromeda Galaxy';selectedAndromeda.group.rotation.z=-.12+t*.0025;selectedAndromeda.group.rotation.y=.08+Math.sin(t*.11+selectedAndromeda.phase)*.018;selectedAndromeda.armsMaterial.uniforms.uTime.value=t;selectedAndromeda.coreGlow.material.opacity=.43+.06*Math.sin(t*.52);selectedAndromeda.innerGlow.material.opacity=.68+.07*Math.sin(t*.78+selectedAndromeda.phase);selectedAndromeda.nebulae.forEach(cloud=>{cloud.material.opacity=cloud.userData.baseOpacity*(.86+.14*Math.sin(t*.32+cloud.userData.phase));cloud.position.y=Math.sin(t*.22+cloud.userData.phase)*.035;});}
 sun.rotation.y=t*.12;sun.scale.setScalar(1+Math.sin(t*1.4)*.018);
 planets.forEach((p,i)=>{p.pivot.rotation.y+=p.speed;p.mesh.rotation.y+=.008;p.mesh.position.y=Math.sin(t*.8+i)*.035});
 stars.rotation.y=t*.003;dust.children.forEach((b,i)=>{b.position.y+=Math.sin(t*.7+i)*.0008});
 items.forEach(c=>{if(!c.collected){c.group.rotation.y+=.018;c.group.position.y+=Math.sin(t*1.8+c.phase)*.0015;c.gem.rotation.x+=.012}});
 for(let i=bursts.length-1;i>=0;i--){const p=bursts[i];p.m.position.add(p.v);p.v.multiplyScalar(.97);p.life-=.025;p.m.material.opacity=Math.max(0,p.life);if(p.life<=0){particles.remove(p.m);p.m.geometry.dispose();p.m.material.dispose();bursts.splice(i,1)}}
 renderer.render(scene,camera);
 if(!document.documentElement.classList.contains('webgl-ready'))document.documentElement.classList.add('webgl-ready');
}
animate();
addEventListener('resize',()=>{const compact=innerWidth<700;homePlanet.position.set(compact?8.5:12.8,compact?-5:5.3,compact?-10:-7.5);homePlanet.scale.setScalar(compact?.72:1);ringedWorld.position.set(compact?-9.5:-9.2,compact?-5:-4.2,-31);homeRing.position.copy(ringedWorld.position);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2))});
