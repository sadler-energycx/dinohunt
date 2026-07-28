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
/* critically-damped-ish spring: f in Hz, z damping ratio. kick() adds velocity. */
function Spring(f,z){this.f=f;this.z=z;this.x=0;this.v=0;}
Spring.prototype.kick=function(dv){this.v+=dv;};
Spring.prototype.step=function(dt,target){
  target=target||0;
  const w=TAU*this.f;
  const denom=1+2*this.z*w*dt+w*w*dt*dt;
  this.v=(this.v+w*w*dt*(target-this.x))/denom;
  this.x+=this.v*dt;
  return this.x;
};

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
let AC=null,masterGain=null,noiseBuf=null,pinkBuf=null,verbSend=null;
const shaperCurves={};
function makeIR(dur){
  const len=Math.floor(AC.sampleRate*dur),b=AC.createBuffer(2,len,AC.sampleRate);
  for(let ch=0;ch<2;ch++){
    const d=b.getChannelData(ch);
    let lp=0;
    for(let i=0;i<len;i++){
      const t=i/len;
      const k=0.45*(1-t*0.85)+0.03;
      lp+=((Math.random()*2-1)-lp)*k;
      d[i]=lp*Math.pow(1-t,1.7)*(t<0.008?t/0.008:1);
    }
  }
  return b;
}
function initAudio(){
  if(AC){if(AC.resume)AC.resume();return;}
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C){G.noAudio=true;return;}
  AC=new C();
  const comp=AC.createDynamicsCompressor();
  comp.threshold.value=-16;comp.knee.value=22;comp.ratio.value=5;
  comp.attack.value=0.003;comp.release.value=0.24;
  comp.connect(AC.destination);
  masterGain=AC.createGain();masterGain.gain.value=0.5;masterGain.connect(comp);
  const len=AC.sampleRate*2,b=AC.createBuffer(1,len,AC.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  noiseBuf=b;
  const pb=AC.createBuffer(1,len,AC.sampleRate),pd=pb.getChannelData(0);
  let p0=0,p1=0,p2=0;
  for(let i=0;i<len;i++){
    const w=Math.random()*2-1;
    p0=0.997*p0+0.0298*w;p1=0.985*p1+0.0322*w;p2=0.95*p2+0.0501*w;
    pd[i]=(p0+p1+p2+w*0.11)*1.6;
  }
  pinkBuf=pb;
  try{
    const verb=AC.createConvolver();
    verb.buffer=makeIR(1.7);
    verbSend=AC.createGain();verbSend.gain.value=0.5;
    verbSend.connect(verb);verb.connect(masterGain);
  }catch(e){verbSend=null;}
  startDrone();
}
function nsrc(buf,rate){
  const s=AC.createBufferSource();
  s.buffer=buf;s.loop=true;
  s.playbackRate.value=rate||1;
  return s;
}
function satCurve(drive){
  const key=drive.toFixed(1);
  if(shaperCurves[key])return shaperCurves[key];
  const n=1024,c=new Float32Array(n),norm=Math.tanh(drive);
  for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*drive)/norm;}
  shaperCurves[key]=c;
  return c;
}
function adEnv(g,t,peak,a,d){
  g.setValueAtTime(0.0001,t);
  g.linearRampToValueAtTime(Math.max(0.0002,peak),t+a);
  g.exponentialRampToValueAtTime(0.0001,t+a+d);
}
/* A gunshot is not one sound: transient click, body thump, crack, mid glue,
   reverb-fed tail, and a delayed mechanical bolt layer. Per-shot pitch/level
   jitter keeps consecutive rounds from ever being the same waveform. */
const GUNPROF={
  rifle:{lvl:1,body:148,body2:56,bodyDec:0.085,sub:62,subDec:0.12,crack:2450,crackQ:0.95,crackDec:0.055,drive:6,
    mid:780,midDec:0.05,tail:0.3,tailF:5200,tailEnd:700,mech:0.028,mechLvl:0.42,mechF:[1880,3260],send:0.5},
  shot:{lvl:1.18,body:108,body2:40,bodyDec:0.13,sub:44,subDec:0.19,crack:1450,crackQ:0.7,crackDec:0.09,drive:9,
    mid:520,midDec:0.08,tail:0.5,tailF:3600,tailEnd:460,mech:0.16,mechLvl:0.7,mechF:[980,1760],send:0.6,pellets:6},
  snip:{lvl:1.3,body:96,body2:34,bodyDec:0.16,sub:38,subDec:0.24,crack:1320,crackQ:0.8,crackDec:0.11,drive:10,
    mid:470,midDec:0.1,tail:0.85,tailF:3300,tailEnd:380,mech:0.19,mechLvl:0.65,mechF:[1150,2050],send:0.72}};
function gunshot(p){
  if(!AC)return;
  const t=AC.currentTime;
  const jB=Math.pow(2,rand(-0.8,0.8)/12),jC=Math.pow(2,rand(-1.2,1.2)/12),jL=rand(0.92,1.08);
  const out=AC.createGain();out.gain.value=0.4*p.lvl*jL;
  out.connect(masterGain);
  if(verbSend){
    const sg=AC.createGain();sg.gain.value=p.send;
    out.connect(sg);sg.connect(verbSend);
  }
  // 1. transient — the pressure step
  const tr=nsrc(noiseBuf,rand(0.9,1.3));
  const trHp=AC.createBiquadFilter();trHp.type='highpass';trHp.frequency.value=2600;
  const trG=AC.createGain();
  tr.connect(trHp);trHp.connect(trG);trG.connect(out);
  adEnv(trG.gain,t,0.9,0.001,0.008);
  tr.start(t,rand(0,1.5));tr.stop(t+0.06);
  const clk=AC.createOscillator();clk.type='triangle';clk.frequency.value=1750*jC;
  const clkG=AC.createGain();
  clk.connect(clkG);clkG.connect(out);
  adEnv(clkG.gain,t,0.35,0.0008,0.005);
  clk.start(t);clk.stop(t+0.02);
  // 2. body + sub — the chest thump
  const b1=AC.createOscillator();b1.type='sine';
  b1.frequency.setValueAtTime(p.body*jB,t);
  b1.frequency.exponentialRampToValueAtTime(p.body2*jB,t+p.bodyDec*1.4);
  const drv=AC.createWaveShaper();drv.curve=satCurve(p.drive*0.5);drv.oversample='2x';
  const bLp=AC.createBiquadFilter();bLp.type='lowpass';bLp.frequency.value=2200;
  const bG=AC.createGain();
  b1.connect(bG);bG.connect(drv);drv.connect(bLp);bLp.connect(out);
  adEnv(bG.gain,t,0.85,0.0012,p.bodyDec*rand(0.9,1.15));
  b1.start(t);b1.stop(t+p.bodyDec*1.8+0.05);
  const sub=AC.createOscillator();sub.type='sine';
  sub.frequency.setValueAtTime(p.sub*jB*1.5,t);
  sub.frequency.exponentialRampToValueAtTime(p.sub*jB*0.8,t+p.subDec);
  const subG=AC.createGain();
  sub.connect(subG);subG.connect(out);
  adEnv(subG.gain,t,0.55,0.004,p.subDec*1.3);
  sub.start(t);sub.stop(t+p.subDec*2+0.05);
  // 3. crack — calibre character, saturated bandpassed noise
  const cr=nsrc(noiseBuf,rand(0.85,1.25));
  const crBp=AC.createBiquadFilter();crBp.type='bandpass';
  crBp.frequency.setValueAtTime(p.crack*jC*1.35,t);
  crBp.frequency.exponentialRampToValueAtTime(p.crack*jC*0.8,t+p.crackDec*2);
  crBp.Q.value=p.crackQ;
  const crDrv=AC.createWaveShaper();crDrv.curve=satCurve(p.drive);crDrv.oversample='2x';
  const crG=AC.createGain();
  cr.connect(crBp);crBp.connect(crDrv);crDrv.connect(crG);crG.connect(out);
  adEnv(crG.gain,t,1.0,0.0015,p.crackDec*rand(0.85,1.2));
  cr.start(t,rand(0,1.5));cr.stop(t+p.crackDec*3+0.05);
  // 4. mid glue
  const md=nsrc(pinkBuf,rand(0.8,1.25));
  const mdBp=AC.createBiquadFilter();mdBp.type='bandpass';mdBp.frequency.value=p.mid;mdBp.Q.value=1.1;
  const mdG=AC.createGain();
  md.connect(mdBp);mdBp.connect(mdG);mdG.connect(out);
  adEnv(mdG.gain,t,0.5,0.002,p.midDec*1.4);
  md.start(t,rand(0,1.5));md.stop(t+p.midDec*4+0.05);
  // 5. tail — what the jungle hears; feeds the reverb hardest
  const tl=nsrc(pinkBuf,rand(0.7,1.15));
  const tlLp=AC.createBiquadFilter();tlLp.type='lowpass';
  tlLp.frequency.setValueAtTime(p.tailF,t);
  tlLp.frequency.exponentialRampToValueAtTime(p.tailEnd,t+p.tail);
  const tlG=AC.createGain();
  tl.connect(tlLp);tlLp.connect(tlG);tlG.connect(out);
  adEnv(tlG.gain,t,0.45,0.006,p.tail);
  tl.start(t,rand(0,1.5));tl.stop(t+p.tail*1.3+0.05);
  // 6. mech/bolt — the delayed dry clack that makes it feel mechanical
  const mt=t+p.mech*rand(0.85,1.2);
  for(let i=0;i<p.mechF.length;i++){
    const mn=nsrc(noiseBuf,rand(1,1.3));
    const mb=AC.createBiquadFilter();mb.type='bandpass';
    mb.frequency.value=p.mechF[i]*rand(0.96,1.05);mb.Q.value=22-i*6;
    const mg=AC.createGain();
    mn.connect(mb);mb.connect(mg);mg.connect(out);
    adEnv(mg.gain,mt,p.mechLvl*(0.5-i*0.16),0.001,0.05-i*0.015);
    mn.start(mt,rand(0,1.5));mn.stop(mt+0.12);
  }
  // pellet spatter
  if(p.pellets){
    for(let i=0;i<p.pellets;i++){
      const pt=t+rand(0.0005,0.006);
      const ps=nsrc(noiseBuf,rand(0.9,1.4));
      const pb2=AC.createBiquadFilter();pb2.type='bandpass';
      pb2.frequency.value=rand(2600,6200);pb2.Q.value=1.8;
      const pg=AC.createGain();
      ps.connect(pb2);pb2.connect(pg);pg.connect(out);
      adEnv(pg.gain,pt,0.1,0.001,rand(0.005,0.015));
      ps.start(pt,rand(0,1.5));ps.stop(pt+0.05);
    }
  }
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
function sfxShot(){gunshot(GUNPROF.rifle);}
function sfxShotgun(){gunshot(GUNPROF.shot);}
function sfxSniper(){gunshot(GUNPROF.snip);}
function sfxShellTink(){
  if(!AC)return;
  const t=AC.currentTime;
  const s=nsrc(noiseBuf,rand(1,1.4));
  const b=AC.createBiquadFilter();b.type='bandpass';
  b.frequency.value=rand(5200,7800);b.Q.value=14;
  const g=AC.createGain();
  s.connect(b);b.connect(g);g.connect(masterGain);
  adEnv(g.gain,t,rand(0.05,0.1),0.001,rand(0.04,0.08));
  s.start(t,rand(0,1.5));s.stop(t+0.15);
}
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
/* jungle ambience: distant birds + wind gusts, panned for width */
let ambBirdT=4,ambWindT=7;
function birdChirp(){
  if(!AC)return;
  let dest=masterGain,pan=null;
  if(AC.createStereoPanner){
    pan=AC.createStereoPanner();pan.pan.value=rand(-0.9,0.9);
    pan.connect(masterGain);dest=pan;
  }
  const base=rand(1300,3200),n=randi(2,5);
  let dl=rand(0,0.1);
  for(let i=0;i<n;i++){
    const t=AC.currentTime+dl;
    const o=AC.createOscillator();o.type='sine';
    const f=base*rand(0.85,1.35),dur=rand(0.05,0.13);
    o.frequency.setValueAtTime(f,t);
    o.frequency.exponentialRampToValueAtTime(f*(Math.random()<0.5?rand(1.15,1.6):rand(0.6,0.85)),t+dur);
    const g=AC.createGain();
    o.connect(g);g.connect(dest);
    adEnv(g.gain,t,rand(0.025,0.06),0.012,dur);
    o.start(t);o.stop(t+dur+0.05);
    dl+=dur+rand(0.05,0.16);
  }
}
function windGust(){
  if(!AC)return;
  const t=AC.currentTime,dur=rand(2.2,4.5);
  const s=nsrc(pinkBuf,rand(0.5,0.8));
  const f=AC.createBiquadFilter();f.type='lowpass';
  f.frequency.setValueAtTime(rand(320,520),t);
  f.frequency.exponentialRampToValueAtTime(rand(140,240),t+dur);
  const g=AC.createGain();
  s.connect(f);f.connect(g);g.connect(masterGain);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.linearRampToValueAtTime(rand(0.05,0.1),t+dur*0.4);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.start(t,rand(0,1.5));s.stop(t+dur+0.1);
}
function updateAmbience(dt){
  if(!AC)return;
  ambBirdT-=dt;
  if(ambBirdT<=0){ambBirdT=rand(2.5,9);birdChirp();}
  ambWindT-=dt;
  if(ambWindT<=0){ambWindT=rand(7,16);windGust();}
}

/* ============================== SCENE / RENDERER ============================== */
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
renderer.domElement.id='c';
document.body.appendChild(renderer.domElement);
const cv=renderer.domElement;

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0xa6ab6c,0.0115);

const camera=new THREE.PerspectiveCamera(72,window.innerWidth/window.innerHeight,0.1,420);
camera.rotation.order='YXZ';
scene.add(camera);

const hemi=new THREE.HemisphereLight(0xd8d29a,0x27401f,0.72);
scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffd9a8,1.2);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
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

/* ============================== SKY ============================== */
let skyDome=null;
function buildSky(){
  const mat=new THREE.ShaderMaterial({
    side:THREE.BackSide,depthWrite:false,
    uniforms:{
      sunDir:{value:new THREE.Vector3(-60,55,-25).normalize()},
      zen:{value:new THREE.Color(0x74909c)},
      hor:{value:new THREE.Color(0xbab277)},
      grd:{value:new THREE.Color(0x84805a)},
      sunCol:{value:new THREE.Color(0xffe8b8)}},
    vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:[
      'varying vec3 vDir;',
      'uniform vec3 sunDir,zen,hor,grd,sunCol;',
      'void main(){',
      '  vec3 d=normalize(vDir);',
      '  float h=clamp(d.y,-1.0,1.0);',
      '  vec3 c=mix(hor,zen,pow(clamp(h,0.0,1.0),0.5));',
      '  if(h<0.0)c=mix(hor,grd,clamp(-h*3.0,0.0,1.0));',
      '  float s=clamp(dot(d,sunDir),0.0,1.0);',
      '  c+=sunCol*(pow(s,900.0)*8.0+pow(s,40.0)*0.5+pow(s,4.0)*0.14);',
      '  gl_FragColor=vec4(c,1.0);',
      '}'].join('\n')});
  skyDome=new THREE.Mesh(new THREE.SphereGeometry(380,24,12),mat);
  skyDome.frustumCulled=false;
  skyDome.renderOrder=-10;
  scene.add(skyDome);
}

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
/* deterministic per-vertex jitter: hash by position so duplicated verts
   (box corners, cylinder seams) displace identically and never crack */
function hash3(x,y,z,s){
  const v=Math.sin(x*127.1+y*311.7+z*74.7+s*269.5)*43758.5453;
  return v-Math.floor(v);
}
function jitterGeo(geo,amt){
  const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    p.setXYZ(i,
      x+(hash3(x,y,z,1)-0.5)*amt,
      y+(hash3(x,y,z,2)-0.5)*amt,
      z+(hash3(x,y,z,3)-0.5)*amt);
  }
  p.needsUpdate=true;
  return geo;
}
/* ---- procedural detail textures: multiply against material colors, so they
   stay bright (mean ~0.88) and only carry variation, never their own hue ---- */
const TEX={};
function speckle(ctx,w,h,n,colors,smin,smax,alpha){
  for(let i=0;i<n;i++){
    ctx.fillStyle=colors[randi(0,colors.length-1)];
    ctx.globalAlpha=alpha*rand(0.5,1);
    const s=rand(smin,smax);
    ctx.fillRect(rand(0,w),rand(0,h),s,s);
  }
  ctx.globalAlpha=1;
}
function texTile(t,rx,ry){
  const c=t.clone();
  c.wrapS=c.wrapT=THREE.RepeatWrapping;
  c.repeat.set(rx,ry);
  c.needsUpdate=true;
  return c;
}
function buildDetailTextures(){
  TEX.grass=canvasTex(512,512,function(ctx,w,h){
    ctx.fillStyle='#dcd8c8';ctx.fillRect(0,0,w,h);
    for(let i=0;i<26;i++){
      const x=rand(0,w),y=rand(0,h),r=rand(40,130);
      const g=ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,Math.random()<0.5?'rgba(140,140,110,0.16)':'rgba(255,252,230,0.13)');
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,w,h);
    }
    speckle(ctx,w,h,5200,['#b4b498','#c8c8ac','#a8ac88','#eceadb','#c0bc9c'],1,3,0.5);
    speckle(ctx,w,h,1600,['#96a078','#7e8a64','#a89a70'],2,5,0.5);
    ctx.strokeStyle='rgba(105,118,78,0.55)';
    for(let i=0;i<1400;i++){
      const x=rand(0,w),y=rand(0,h);
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand(-2,2),y-rand(3,8));ctx.stroke();
    }
  });
  TEX.bark=canvasTex(256,256,function(ctx,w,h){
    ctx.fillStyle='#d8cfc0';ctx.fillRect(0,0,w,h);
    for(let i=0;i<130;i++){
      const x0=rand(0,w);
      ctx.strokeStyle='rgba('+randi(60,90)+','+randi(45,70)+','+randi(30,50)+','+rand(0.15,0.4).toFixed(2)+')';
      ctx.lineWidth=rand(1,4);
      ctx.beginPath();
      let y=0,cx=x0;
      ctx.moveTo(cx,0);
      while(y<h-30){y+=rand(12,30);cx+=rand(-4,4);ctx.lineTo(cx,y);}
      ctx.lineTo(x0,h);  // return to start x so the fissure tiles vertically
      ctx.stroke();
    }
    speckle(ctx,w,h,600,['#efe6d8','#b09a80','#8a7458'],1,3,0.4);
  });
  TEX.leaf=canvasTex(256,256,function(ctx,w,h){
    ctx.fillStyle='#dde2ca';ctx.fillRect(0,0,w,h);
    speckle(ctx,w,h,2600,['#a8b284','#8a9868','#c6d0a4','#f0f4dc','#77855c'],2,5,0.6);
  });
  TEX.conc=canvasTex(512,512,function(ctx,w,h){
    ctx.fillStyle='#e0ded4';ctx.fillRect(0,0,w,h);
    speckle(ctx,w,h,3000,['#c8c6ba','#d4d2c6','#b8b6aa','#f0eee4'],1,4,0.5);
    for(let i=0;i<14;i++){
      const x=rand(0,w),y=rand(0,h),r=rand(30,90);
      const g=ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,'rgba(90,88,70,0.13)');g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    }
    for(let i=0;i<40;i++){
      const x=rand(0,w),y0=rand(0,h*0.5),len=rand(30,140),ww=rand(2,9);
      const g=ctx.createLinearGradient(0,y0,0,y0+len);
      g.addColorStop(0,'rgba(70,68,52,'+rand(0.12,0.3).toFixed(2)+')');
      g.addColorStop(1,'rgba(70,68,52,0)');
      ctx.fillStyle=g;ctx.fillRect(x,y0,ww,len);
    }
    ctx.strokeStyle='rgba(55,52,40,0.4)';ctx.lineWidth=1;
    for(let i=0;i<10;i++){
      let x=rand(0,w),y=rand(0,h);
      ctx.beginPath();ctx.moveTo(x,y);
      for(let k=0;k<randi(4,9);k++){x+=rand(-28,28);y+=rand(-6,30);ctx.lineTo(x,y);}
      ctx.stroke();
    }
  });
  TEX.rock=canvasTex(256,256,function(ctx,w,h){
    ctx.fillStyle='#d6d4c8';ctx.fillRect(0,0,w,h);
    for(let y=0;y<h;){
      const bh=rand(8,26);
      ctx.fillStyle='rgba('+randi(120,180)+','+randi(118,172)+','+randi(100,150)+',0.18)';
      ctx.fillRect(0,y,w,bh);
      y+=bh;
    }
    speckle(ctx,w,h,1800,['#b8b4a4','#e8e6da','#a09c8c'],1,4,0.45);
  });
}
buildDetailTextures();
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
  const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0,map:texTile(TEX.grass,64,64)}));
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
/* ============================== SHELL CASINGS ============================== */
const shells=[],shellQueue=[];
let shellsBuilt=false;
function buildShellPool(){
  shellsBuilt=true;
  const g=new THREE.BoxGeometry(0.018,0.018,0.05);
  const m=new THREE.MeshStandardMaterial({color:0xc8a23c,roughness:0.35,metalness:0.85});
  for(let i=0;i<16;i++){
    const mesh=new THREE.Mesh(g,m);
    mesh.visible=false;mesh.frustumCulled=false;
    scene.add(mesh);
    shells.push({mesh:mesh,life:0,vel:new THREE.Vector3(),rot:new THREE.Vector3(),bounced:false});
  }
}
function spawnShell(){
  if(!shellsBuilt)buildShellPool();
  let s=null;
  for(let i=0;i<shells.length;i++)if(shells[i].life<=0){s=shells[i];break;}
  if(!s)s=shells[0];
  camera.updateMatrixWorld(true);
  _v1.setFromMatrixColumn(camera.matrixWorld,0);       // camera right
  camera.getWorldDirection(_v2);
  s.mesh.position.copy(camera.position)
    .addScaledVector(_v2,0.5).addScaledVector(_v1,0.32);
  s.mesh.position.y-=0.22;
  s.vel.copy(_v1).multiplyScalar(rand(1.6,2.6));
  s.vel.y=rand(1.6,2.4);
  s.vel.addScaledVector(_v2,rand(-0.4,0.2));
  s.rot.set(rand(-14,14),rand(-14,14),rand(-14,14));
  s.mesh.rotation.set(rand(0,TAU),rand(0,TAU),0);
  s.mesh.visible=true;
  s.life=2;
  s.bounced=false;
}
function ejectShell(delay){
  if(delay)shellQueue.push({t:delay});
  else spawnShell();
}
function updateShells(dt){
  for(let i=shellQueue.length-1;i>=0;i--){
    shellQueue[i].t-=dt;
    if(shellQueue[i].t<=0){shellQueue.splice(i,1);spawnShell();}
  }
  for(let i=0;i<shells.length;i++){
    const s=shells[i];
    if(s.life<=0)continue;
    s.life-=dt;
    if(s.life<=0){s.mesh.visible=false;continue;}
    s.vel.y-=13*dt;
    s.mesh.position.addScaledVector(s.vel,dt);
    s.mesh.rotation.x+=s.rot.x*dt;
    s.mesh.rotation.y+=s.rot.y*dt;
    s.mesh.rotation.z+=s.rot.z*dt;
    const gh=supportHeight(s.mesh.position.x,s.mesh.position.z,s.mesh.position.y);
    if(s.mesh.position.y<gh+0.02&&s.vel.y<0){
      s.mesh.position.y=gh+0.02;
      s.vel.y*=-0.3;
      s.vel.x*=0.5;s.vel.z*=0.5;
      s.rot.multiplyScalar(0.4);
      if(!s.bounced){s.bounced=true;sfxShellTink();}
    }
  }
}
