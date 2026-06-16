'use strict';
/* ============================== HELPERS ============================== */
const TAU=Math.PI*2;
const UP=new THREE.Vector3(0,1,0);
const _v1=new THREE.Vector3(),_v2=new THREE.Vector3(),_v3=new THREE.Vector3(),_v4=new THREE.Vector3();
const _ray=new THREE.Ray(),_m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_col=new THREE.Color();
function rand(a,b){return a+Math.random()*(b-a);}
function randi(a,b){return Math.floor(rand(a,b+1));}
function clamp(v,a,b){return v<a?a:(v>b?b:v);}
function lerp(a,b,t){return a+(b-a)*t;}
function wrapAng(a){while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;}
function d2(ax,az,bx,bz){const dx=ax-bx,dz=az-bz;return dx*dx+dz*dz;}
function gauss(){return (Math.random()+Math.random()+Math.random())/1.5-1;}

const E={};
const keys={};
const G={state:'MENU',time:0,kills:0,shots:0,hits:0,shake:0,fallback:false,
  waveOn:false,waveT:0,waveSpawnT:0,waveDilo:false,beacon:false,beepT:0,
  objIdx:0,nextRoar:11,heartT:0,vigT:0,avigT:0,dmgArcT:0,dmgWorldAng:0,
  hitT:0,hitKill:false,mouseDown:false,noAudio:false,tutT:0,zoneT:0,objShown:''};

const player={pos:new THREE.Vector3(0,2,228),vel:new THREE.Vector3(),kvel:new THREE.Vector3(),
  yaw:0,pitch:0,hp:100,stam:100,stamCd:0,grounded:false,invuln:0,stagger:0,recoil:0,
  bobT:0,stepT:0,curSpeed:0,inWater:false,weapon:'none',has:{rifle:false,shot:false,snip:false},r:0.45};

const WPN={
  rifle:{label:'AR-7 SCAVENGED RIFLE',mag:30,magSize:30,res:90,dmg:13,rate:0.115,reload:1.7,
    spread:0.005,bloomAdd:0.011,pellets:1,auto:true,range:150},
  shot:{label:'PUMP SHOTGUN',mag:6,magSize:6,res:18,dmg:9,rate:0.95,reload:2.2,
    spread:0.05,bloomAdd:0.02,pellets:8,auto:false,range:55},
  snip:{label:'M40 SCOPED SNIPER',mag:5,magSize:5,res:10,dmg:70,rate:1.5,reload:2.8,
    spread:0.016,bloomAdd:0.012,pellets:1,auto:false,range:400}};
const SCOPE_FOV=22,BASE_FOV=72,SCOPE_SPREAD=0.0008;
let fireCd=0,reloadT=0,bloom=0,gunKick=0,switchDip=0,aiming=false,aimT=0;

const enemies=[],acids=[],pickups=[],triggers=[],platforms=[],obsC=[],obsB=[],tracers=[];
let trexRef=null,tutQueue=[];

/* ============================== AUDIO ============================== */
let AC=null,masterGain=null,noiseBuf=null;
function initAudio(){
  if(AC){if(AC.resume)AC.resume();return;}
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C){G.noAudio=true;return;}
  AC=new C();
  masterGain=AC.createGain();masterGain.gain.value=0.5;masterGain.connect(AC.destination);
  const len=AC.sampleRate*2,b=AC.createBuffer(1,len,AC.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  noiseBuf=b;
  startDrone();
}
function playNoise(dur,freq,vol,type,delay){
  if(!AC||vol<=0.005)return;
  const t=AC.currentTime+(delay||0);
  const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;
  const f=AC.createBiquadFilter();f.type=type||'lowpass';f.frequency.value=freq;f.Q.value=0.8;
  const g=AC.createGain();
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.008);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(masterGain);
  s.start(t);s.stop(t+dur+0.05);
}
function playTone(freq,dur,vol,type,slideTo,delay){
  if(!AC||vol<=0.005)return;
  const t=AC.currentTime+(delay||0);
  const o=AC.createOscillator();o.type=type||'sine';
  o.frequency.setValueAtTime(Math.max(1,freq),t);
  if(slideTo)o.frequency.exponentialRampToValueAtTime(Math.max(1,slideTo),t+dur);
  const g=AC.createGain();
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(masterGain);
  o.start(t);o.stop(t+dur+0.06);
}
function startDrone(){
  if(!AC)return;
  const o=AC.createOscillator();o.type='triangle';o.frequency.value=46;
  const g=AC.createGain();g.gain.value=0.04;
  o.connect(g);g.connect(masterGain);o.start();
  const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;
  const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=210;
  const g2=AC.createGain();g2.gain.value=0.045;
  s.connect(f);f.connect(g2);g2.connect(masterGain);s.start();
  const lfo=AC.createOscillator();lfo.frequency.value=0.07;
  const lg=AC.createGain();lg.gain.value=0.02;
  lfo.connect(lg);lg.connect(g2.gain);lfo.start();
}
function distGain(pos,maxD,base){
  const d=Math.sqrt(d2(pos.x,pos.z,player.pos.x,player.pos.z));
  return clamp(base*(1-d/maxD),0,base);
}
function roarSfx(vol,base,dur){
  if(!AC||vol<=0.01)return;
  base=base||70;dur=dur||1.2;
  const t=AC.currentTime;
  [0,7,-9].forEach(function(det){
    const o=AC.createOscillator();o.type='sawtooth';
    o.frequency.setValueAtTime(base+det,t);
    o.frequency.exponentialRampToValueAtTime(base*0.55,t+dur);
    o.detune.value=det*9;
    const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=420;
    const g=AC.createGain();
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol*0.5,t+0.06);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(f);f.connect(g);g.connect(masterGain);
    o.start(t);o.stop(t+dur+0.1);
  });
  playNoise(dur*0.8,300,vol*0.5);
}
function growlSfx(vol){
  if(vol<=0.01)return;
  roarSfx(vol*0.7,rand(50,62),0.55);
}
function screechSfx(vol){playTone(820,0.42,vol,'sawtooth',1500);playNoise(0.3,2400,vol*0.5,'bandpass');}
function sfxShot(){playNoise(0.15,1800,0.62);playNoise(0.32,260,0.5);playTone(140,0.07,0.2,'square',60);}
function sfxShotgun(){playNoise(0.22,1200,0.8);playNoise(0.45,180,0.65);playTone(90,0.12,0.3,'square',45);}
function sfxSniper(){playNoise(0.12,2600,0.75);playNoise(0.6,140,0.6);playTone(95,0.18,0.32,'square',32);playNoise(0.9,900,0.1,'bandpass',0.12);}
function sfxDry(){playNoise(0.04,2600,0.16,'bandpass');}
function sfxReload(dur){
  playNoise(0.035,2400,0.2,'bandpass',0.06);
  playNoise(0.04,1700,0.22,'bandpass',dur*0.55);
  playNoise(0.05,2100,0.25,'bandpass',dur*0.92);
}
function sfxStep(loud){
  playNoise(0.07,rand(330,560),loud?0.2:0.1);
}
function sfxPickup(){playTone(620,0.08,0.18,'square');playTone(930,0.1,0.16,'square',0,0.07);}
function sfxMed(){playTone(520,0.12,0.18,'triangle',780);playTone(780,0.16,0.14,'triangle',1040,0.1);}
function sfxHitmark(){playTone(1250,0.035,0.12,'square');}
function sfxKill(){playTone(330,0.13,0.2,'sawtooth',150);}
function sfxGrunt(){playNoise(0.14,420,0.34);playTone(110,0.12,0.22,'sawtooth',70);}
function sfxHeart(){playTone(54,0.1,0.5,'sine');playTone(47,0.1,0.4,'sine',0,0.14);}
function sfxSting(){
  const n=[392,523,659,784,1046];
  for(let i=0;i<n.length;i++)playTone(n[i],0.5,0.16,'triangle',0,i*0.13);
}
function sfxSpit(){playNoise(0.13,900,0.28,'bandpass');playTone(300,0.1,0.12,'sawtooth',140);}
function sfxSplash(){playNoise(0.22,640,0.22);}
function sfxBoom(vol){if(vol<=0.01)return;playTone(38,0.2,vol,'sine');playNoise(0.16,130,vol*0.8);}
function sfxClick(){playNoise(0.03,2200,0.14,'bandpass');}
function sfxBeacon(){playTone(220,0.9,0.26,'sine',880);playTone(440,1.3,0.18,'triangle',1760,0.15);}
function sfxBeep(){playTone(1180,0.06,0.05,'sine');}
function sfxLand(){playNoise(0.09,260,0.22);}

/* ============================== SCENE / RENDERER ============================== */
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.domElement.id='c';
document.body.appendChild(renderer.domElement);
const cv=renderer.domElement;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xbab277);
scene.fog=new THREE.FogExp2(0xa6ab6c,0.0115);

const camera=new THREE.PerspectiveCamera(72,window.innerWidth/window.innerHeight,0.1,420);
camera.rotation.order='YXZ';
scene.add(camera);

const hemi=new THREE.HemisphereLight(0xd8d29a,0x27401f,0.62);
scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffd9a8,1.05);
sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-48;sun.shadow.camera.right=48;
sun.shadow.camera.top=48;sun.shadow.camera.bottom=-48;
sun.shadow.camera.near=4;sun.shadow.camera.far=220;
sun.shadow.bias=-0.0008;
scene.add(sun);scene.add(sun.target);

window.addEventListener('resize',function(){
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  if(typeof camera2!=='undefined'&&camera2){
    camera2.aspect=window.innerWidth/window.innerHeight;
    camera2.updateProjectionMatrix();
  }
  if(typeof camera3!=='undefined'&&camera3){
    camera3.aspect=window.innerWidth/window.innerHeight;
    camera3.updateProjectionMatrix();
  }
  renderer.setSize(window.innerWidth,window.innerHeight);
});

/* ============================== TERRAIN ============================== */
function groundHeight(x,z){
  let h=Math.sin(x*0.045)*Math.cos(z*0.05)*0.5+Math.sin(x*0.013+z*0.021)*0.7;
  const rd=Math.abs(z);
  if(rd<14)h-=2.5*Math.cos(rd/14*Math.PI*0.5);
  h+=6*Math.exp(-((z+108)*(z+108))/1400);
  return h;
}
function supportHeight(x,z,y){
  let h=groundHeight(x,z);
  for(let i=0;i<platforms.length;i++){const p=platforms[i];
    if(x>p.x0&&x<p.x1&&z>p.z0&&z<p.z1&&p.top>h&&y>p.top-0.7)h=p.top;}
  return h;
}
function addPlatform(x0,x1,z0,z1,top){platforms.push({x0:x0,x1:x1,z0:z0,z1:z1,top:top});}

/* ============================== MATERIALS / BUILD HELPERS ============================== */
function matStd(c,rough,metal,extra){
  const o={color:c,roughness:(rough===undefined?0.9:rough),metalness:metal||0};
  if(extra)for(const k in extra)o[k]=extra[k];
  return new THREE.MeshStandardMaterial(o);
}
function canvasTex(w,h,draw){
  const cnv=document.createElement('canvas');cnv.width=w;cnv.height=h;
  const ctx=cnv.getContext('2d');
  if(ctx)draw(ctx,w,h);
  const tx=new THREE.CanvasTexture(cnv);
  return tx;
}
function mergeGeos(items){
  const pos=[],norm=[],nm=new THREE.Matrix3(),v=new THREE.Vector3();
  for(let i=0;i<items.length;i++){
    const it=items[i];
    const g=it.g.index?it.g.toNonIndexed():it.g;
    const p=g.attributes.position,n=g.attributes.normal;
    nm.getNormalMatrix(it.m);
    for(let j=0;j<p.count;j++){
      v.fromBufferAttribute(p,j).applyMatrix4(it.m);pos.push(v.x,v.y,v.z);
      v.fromBufferAttribute(n,j).applyNormalMatrix(nm);norm.push(v.x,v.y,v.z);
    }
  }
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  out.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));
  return out;
}
function tMat(x,y,z,ry,s){
  _q.setFromEuler(new THREE.Euler(0,ry||0,0));
  return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),_q.clone(),new THREE.Vector3(s||1,s||1,s||1));
}
function addObsC(x,z,r){obsC.push({x:x,z:z,r:r});}
function addObsB(mesh,pad){
  mesh.updateWorldMatrix(true,true);
  const b3=new THREE.Box3().setFromObject(mesh);
  if(pad)b3.expandByScalar(pad);
  obsB.push({x0:b3.min.x,x1:b3.max.x,y0:b3.min.y,y1:b3.max.y,z0:b3.min.z,z1:b3.max.z,box3:b3});
}
const KEEPOUT=[{x:0,z:228,r:7},{x:1.5,z:221,r:4},{x:8,z:0,r:12},{x:-6,z:-108,r:10},
  {x:0,z:-228,r:14},{x:-10,z:224,r:10},{x:0,z:-176,r:9}];
function inKeepout(x,z,extra){
  for(let i=0;i<KEEPOUT.length;i++){const k=KEEPOUT[i];
    if(d2(x,z,k.x,k.z)<(k.r+(extra||0))*(k.r+(extra||0)))return true;}
  return false;
}
function inCanyonWalls(x,z){return z<-146&&z>-216&&Math.abs(x)>15;}

function buildTerrain(){
  const seg=96,size=500;
  const geo=new THREE.PlaneGeometry(size,size,seg,seg);
  geo.rotateX(-Math.PI/2);
  const p=geo.attributes.position,colors=[];
  const c=new THREE.Color();
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i);
    const h=groundHeight(x,z);
    p.setY(i,h);
    if(h<-0.8)c.setHex(0x5b4a33);
    else if(h>4)c.setHex(0x6e6c56);
    else c.setHex(0x47592b);
    c.offsetHSL(rand(-0.015,0.015),rand(-0.04,0.04),rand(-0.03,0.03));
    colors.push(c.r,c.g,c.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));
  m.receiveShadow=true;
  scene.add(m);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(500,27),
    new THREE.MeshStandardMaterial({color:0x33503f,roughness:0.25,metalness:0.15,transparent:true,opacity:0.8}));
  water.rotation.x=-Math.PI/2;water.position.set(0,-1.05,0);
  scene.add(water);
}

/* ============================== PARTICLES ============================== */
const PMAX=240;
let partSys=null,partVel=[],partLife=[],pIdx=0;
function buildParticles(){
  const pos=new Float32Array(PMAX*3),col=new Float32Array(PMAX*3);
  for(let i=0;i<PMAX;i++){pos[i*3+1]=-999;partVel.push(0,0,0);partLife.push(0);}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  partSys=new THREE.Points(g,new THREE.PointsMaterial({size:0.17,vertexColors:true,transparent:true,opacity:0.95,depthWrite:false}));
  partSys.frustumCulled=false;
  scene.add(partSys);
}
function burst(p,n,color,speed,up,life){
  if(!partSys)return;
  const pos=partSys.geometry.attributes.position,col=partSys.geometry.attributes.color;
  _col.setHex(color);
  for(let k=0;k<n;k++){
    const i=pIdx;pIdx=(pIdx+1)%PMAX;
    pos.setXYZ(i,p.x,p.y,p.z);
    col.setXYZ(i,_col.r*rand(0.7,1.1),_col.g*rand(0.7,1.1),_col.b*rand(0.7,1.1));
    const th=rand(0,TAU),ph=rand(-1,1);
    partVel[i*3]=Math.cos(th)*speed*rand(0.3,1);
    partVel[i*3+1]=ph*speed*0.6+up;
    partVel[i*3+2]=Math.sin(th)*speed*rand(0.3,1);
    partLife[i]=life*rand(0.6,1.2);
  }
  pos.needsUpdate=true;col.needsUpdate=true;
}
function updateParticles(dt){
  if(!partSys)return;
  const pos=partSys.geometry.attributes.position;
  let any=false;
  for(let i=0;i<PMAX;i++){
    if(partLife[i]<=0)continue;
    partLife[i]-=dt;any=true;
    partVel[i*3+1]-=6.5*dt;
    if(partLife[i]<=0){pos.setY(i,-999);continue;}
    pos.setXYZ(i,pos.getX(i)+partVel[i*3]*dt,pos.getY(i)+partVel[i*3+1]*dt,pos.getZ(i)+partVel[i*3+2]*dt);
  }
  if(any)pos.needsUpdate=true;
}
/* ============================== TRACERS ============================== */
function buildTracers(){
  const g=new THREE.BoxGeometry(0.035,0.035,1);
  for(let i=0;i<14;i++){
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xffd98a,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.visible=false;m.frustumCulled=false;
    scene.add(m);
    tracers.push({mesh:m,life:0});
  }
}
function addTracer(from,to){
  let t=null;
  for(let i=0;i<tracers.length;i++)if(tracers[i].life<=0){t=tracers[i];break;}
  if(!t)t=tracers[0];
  const len=from.distanceTo(to);
  if(len<0.5)return;
  t.mesh.position.copy(from).add(to).multiplyScalar(0.5);
  t.mesh.lookAt(to);
  t.mesh.scale.set(1,1,len);
  t.mesh.visible=true;
  t.mesh.material.opacity=0.9;
  t.life=0.07;
}
function updateTracers(dt){
  for(let i=0;i<tracers.length;i++){
    const t=tracers[i];
    if(t.life<=0)continue;
    t.life-=dt;
    t.mesh.material.opacity=Math.max(0,t.life/0.07)*0.9;
    if(t.life<=0)t.mesh.visible=false;
  }
}
