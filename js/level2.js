'use strict';
/* ===================================================================== */
/* ===================== LEVEL 2 — AIR CAVALRY ========================= */
/* Helicopter gunship vs. ground dinosaurs. Overheating chain gun.       */
/* ===================================================================== */

/* ---------- progress / localStorage ---------- */
const PROG_KEY='jurassicExodus.progress.v1';
function loadProg(){try{return JSON.parse(localStorage.getItem(PROG_KEY))||{};}catch(e){return {};}}
const PROGRESS=loadProg();
function saveProg(){try{localStorage.setItem(PROG_KEY,JSON.stringify(PROGRESS));}catch(e){}}
function levelUnlocked(lvl){return lvl===1||PROGRESS.l1===true;}
function markComplete(lvl){if(!PROGRESS['l'+lvl]){PROGRESS['l'+lvl]=true;saveProg();}refreshMenu();}
function refreshMenu(){
  const unlocked=levelUnlocked(2);
  if(E.btnLvl2){
    E.btnLvl2.disabled=!unlocked;
    E.btnLvl2.innerHTML=unlocked
      ? '<span class="lvlNo">II</span>AIR CAVALRY<span class="lvlDesc">Clear the valley from a gunship — overheating chain gun</span>'
      : '<span class="lvlNo">II</span>AIR CAVALRY 🔒<span class="lvlDesc">Clear the valley from a gunship — finish Mission I to unlock</span>';
  }
  if(E.btnLvl3){
    E.btnLvl3.disabled=!unlocked;
    E.btnLvl3.innerHTML=unlocked
      ? '<span class="lvlNo">III</span>RAMPART WATCH<span class="lvlDesc">Snipe swooping raiders off the flock — scoped rifle, plenty of ammo</span>'
      : '<span class="lvlNo">III</span>RAMPART WATCH 🔒<span class="lvlDesc">Snipe swooping raiders off the flock — finish Mission I to unlock</span>';
  }
  if(E.btnLvl1)E.btnLvl1.classList.toggle('done',PROGRESS.l1===true);
  if(E.btnLvl2)E.btnLvl2.classList.toggle('done',PROGRESS.l2===true);
  if(E.btnLvl3)E.btnLvl3.classList.toggle('done',PROGRESS.l3===true);
  if(E.startTiny)E.startTiny.textContent=unlocked
    ?'THREE MISSIONS UNLOCKED — CHOOSE YOUR HUNT.'
    :'FIVE ZONES NORTH. YOU ARE BEING HUNTED.';
}

/* ---------- scene / camera / state ---------- */
const scene2=new THREE.Scene();
const camera2=new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.1,1600);
camera2.rotation.order='YXZ';
const L2_BOUND=540;
const L2={built:false,heli:null,rotor:null,tailRotor:null,reticle:null,muzzle:null,muzzleT:0,gunVM:null,
  pos:new THREE.Vector3(0,40,150),yaw:0,pitch:-0.55,flightT:0,
  hull:100,heat:0,overheat:false,fireCd:0,
  kills:0,goal:24,shots:0,hits:0,time:0,spawnT:0,
  aimPt:new THREE.Vector3(),camDir:new THREE.Vector3(0,0,-1),dmgT:0,tutT:0,
  dinos:[],spits:[],tracers:[]};
const _l1=new THREE.Vector3(),_l2=new THREE.Vector3(),_l3=new THREE.Vector3();

/* ---------- helicopter model ---------- */
function buildHeli(){
  const g=new THREE.Group();
  const bm=matStd(0x39432c,0.55,0.45),dm=matStd(0x21271a,0.5,0.55);
  const body=new THREE.Mesh(new THREE.SphereGeometry(1.3,12,9),bm);
  body.scale.set(1,0.95,1.9);body.castShadow=true;g.add(body);
  const glass=new THREE.Mesh(new THREE.SphereGeometry(1.0,12,9),
    new THREE.MeshStandardMaterial({color:0x16242a,roughness:0.2,metalness:0.3,transparent:true,opacity:0.55}));
  glass.scale.set(0.92,0.8,1.05);glass.position.set(0,0.15,1.25);g.add(glass);
  const boom=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.12,4.2,8),bm);
  boom.rotation.x=Math.PI/2;boom.position.set(0,0.35,-3.0);boom.castShadow=true;g.add(boom);
  const fin=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.0,0.7),bm);
  fin.position.set(0,0.85,-4.8);g.add(fin);
  for(const sx of [-1,1]){
    const skid=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,3.4,6),dm);
    skid.rotation.x=Math.PI/2;skid.position.set(sx*0.95,-1.35,0.2);g.add(skid);
    for(const sz of [1,-1]){
      const strut=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,1.1,5),dm);
      strut.position.set(sx*0.8,-0.85,sz*1.1);strut.rotation.z=sx*0.35;g.add(strut);
    }
  }
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.6,6),dm);mast.position.y=1.55;g.add(mast);
  L2.rotor=new THREE.Group();L2.rotor.position.y=1.9;
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.18,8),dm);L2.rotor.add(hub);
  for(let i=0;i<3;i++){
    const blade=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.05,11),matStd(0x1c1c18,0.6));
    blade.rotation.y=i/3*TAU;L2.rotor.add(blade);
  }
  g.add(L2.rotor);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(5.6,28),
    new THREE.MeshBasicMaterial({color:0x9aa07a,transparent:true,opacity:0.1,side:THREE.DoubleSide,depthWrite:false}));
  disc.rotation.x=-Math.PI/2;disc.position.y=1.93;g.add(disc);
  L2.tailRotor=new THREE.Group();L2.tailRotor.position.set(0.2,0.6,-4.95);
  for(let i=0;i<2;i++){
    const tb=new THREE.Mesh(new THREE.BoxGeometry(0.08,1.6,0.14),dm);tb.rotation.z=i*Math.PI/2;L2.tailRotor.add(tb);
  }
  g.add(L2.tailRotor);
  const gun=new THREE.Group();
  gun.add(new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.7),dm));
  for(const bx of [-0.12,0,0.12]){
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.4,6),dm);
    bar.rotation.x=Math.PI/2;bar.position.set(bx,0,0.9);gun.add(bar);
  }
  gun.position.set(0,-1.0,1.5);g.add(gun);
  return g;
}

/* ---------- world ---------- */
function buildLevel2(){
  if(L2.built)return;L2.built=true;
  scene2.background=new THREE.Color(0x9fb06a);
  scene2.fog=new THREE.FogExp2(0x9fb06a,0.0015);
  scene2.add(new THREE.HemisphereLight(0xdfe0a8,0x3a4a22,0.75));
  const sun=new THREE.DirectionalLight(0xffe6b0,1.0);
  sun.position.set(-120,210,90);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-90;sun.shadow.camera.right=90;
  sun.shadow.camera.top=90;sun.shadow.camera.bottom=-90;
  sun.shadow.camera.near=20;sun.shadow.camera.far=520;sun.shadow.bias=-0.0008;
  L2.sun=sun;scene2.add(sun);scene2.add(sun.target);
  // ground
  const geo=new THREE.PlaneGeometry(1500,1500,60,60);geo.rotateX(-Math.PI/2);
  const p=geo.attributes.position,colors=[],c=new THREE.Color();
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i);
    const h=Math.sin(x*0.009)*Math.cos(z*0.011)*2.4+Math.sin(x*0.004+z*0.006)*3;
    p.setY(i,h);
    c.setHex(h<-1.5?0x6a5a36:0x466a28);
    c.offsetHSL(rand(-0.02,0.02),rand(-0.05,0.05),rand(-0.04,0.05));
    colors.push(c.r,c.g,c.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.computeVertexNormals();
  const gm=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
  gm.receiveShadow=true;scene2.add(gm);
  // river for visual reference
  const river=new THREE.Mesh(new THREE.PlaneGeometry(1500,42),
    new THREE.MeshStandardMaterial({color:0x33503f,roughness:0.25,metalness:0.15,transparent:true,opacity:0.85}));
  river.rotation.x=-Math.PI/2;river.position.set(0,0.2,-120);scene2.add(river);
  // trees
  const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5,0.8,9,6),matStd(0x4c3a26,0.95),300);
  const cans=new THREE.InstancedMesh(new THREE.ConeGeometry(4,8,7),matStd(0x2f4a1f,0.95),300);
  cans.castShadow=true;
  let n=0;
  while(n<300){
    const x=rand(-700,700),z=rand(-700,700);
    if(d2(x,z,0,0)<900||Math.abs(z+120)<28){continue;}
    const sc=rand(0.8,1.9);
    trunks.setMatrixAt(n,tMat(x,4.5*sc-1,z,rand(0,TAU),sc));
    cans.setMatrixAt(n,tMat(x,(9+rand(0,2))*sc-1,z,rand(0,TAU),sc));
    n++;
  }
  [trunks,cans].forEach(function(m){m.count=n;m.instanceMatrix.needsUpdate=true;m.frustumCulled=false;scene2.add(m);});
  // rocks
  const rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1.5,0),matStd(0x6a6c52,1),140);
  rocks.castShadow=true;
  for(let i=0;i<140;i++){const x=rand(-700,700),z=rand(-700,700);const sc=rand(0.6,2.6);
    rocks.setMatrixAt(i,tMat(x,sc*0.4,z,rand(0,TAU),sc));}
  rocks.count=140;rocks.instanceMatrix.needsUpdate=true;rocks.frustumCulled=false;scene2.add(rocks);
  // helicopter (hidden in first-person; we sit in the gunner seat)
  L2.heli=buildHeli();L2.heli.visible=false;scene2.add(L2.heli);
  // first-person gun viewmodel, parented to the camera so it tracks the aim
  scene2.add(camera2);
  const vm=new THREE.Group();const gmv=matStd(0x21271a,0.5,0.55);
  const breech=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.5,0.8),gmv);
  breech.position.set(0.32,-0.66,-0.95);vm.add(breech);
  for(const bx of [-0.08,0.08]){
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.9,7),gmv);
    bar.rotation.x=Math.PI/2;bar.position.set(0.32+bx,-0.66,-1.9);vm.add(bar);
  }
  const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.7,6),gmv);
  arm.position.set(0.32,-0.95,-0.55);vm.add(arm);
  camera2.add(vm);L2.gunVM=vm;
  // reticle
  L2.reticle=new THREE.Mesh(new THREE.RingGeometry(2.1,2.8,24),
    new THREE.MeshBasicMaterial({color:0xff5a3a,transparent:true,opacity:0.85,side:THREE.DoubleSide,depthWrite:false}));
  L2.reticle.rotation.x=-Math.PI/2;scene2.add(L2.reticle);
  // muzzle flash
  L2.muzzle=new THREE.Mesh(new THREE.SphereGeometry(0.55,7,6),
    new THREE.MeshBasicMaterial({color:0xffd070,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  scene2.add(L2.muzzle);
  // tracers
  const tg=new THREE.BoxGeometry(0.14,0.14,1);
  for(let i=0;i<12;i++){
    const m=new THREE.Mesh(tg,new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.visible=false;m.frustumCulled=false;scene2.add(m);L2.tracers.push({mesh:m,life:0});
  }
}

/* ---------- dinosaurs ---------- */
function l2Spawn(type){
  const e={type:type,state:'ALIVE',deadT:0,deadDir:Math.random()<0.5?1:-1,animT:rand(0,9),
    yaw:rand(0,TAU),hp:0,maxHp:0,speed:0,rad:3.4,flash:0,spitCd:rand(2.5,6),diveCd:rand(3,8),
    diving:false,alt:0,turnT:rand(1,3),
    pos:new THREE.Vector3(),wingL:null,wingR:null,legL:null,legR:null,tail:null,bodyMats:null};
  let g;
  if(type==='raptor'){g=buildRaptor(e);e.hp=e.maxHp=30;e.speed=rand(6,9);e.sc=2.5;e.rad=5.2;}
  else if(type==='dilo'){g=buildDilo(e);e.hp=e.maxHp=52;e.speed=rand(4.5,6.5);e.sc=3.0;e.rad=6.0;}
  else{g=buildPtera(e);e.hp=e.maxHp=28;e.speed=rand(12,16);e.alt=rand(11,20);e.sc=1.7;e.rad=4.6;}
  g.scale.setScalar(e.sc);
  e.hitY=type==='ptera'?0.2:e.sc*0.95;
  const a=rand(0,TAU),r=rand(140,320);
  const x=clamp(L2.pos.x+Math.sin(a)*r,-L2_BOUND,L2_BOUND);
  const z=clamp(L2.pos.z+Math.cos(a)*r,-L2_BOUND,L2_BOUND);
  e.pos.set(x,type==='ptera'?e.alt:0,z);
  e.group=g;g.position.copy(e.pos);scene2.add(g);
  L2.dinos.push(e);
}
function l2Alive(){let k=0;for(let i=0;i<L2.dinos.length;i++)if(L2.dinos[i].state==='ALIVE')k++;return k;}
function l2KillDino(e){
  if(e.state!=='ALIVE')return;
  e.state='DEAD';e.deadT=0;L2.kills++;
  sfxKill();
}
function l2RepositionFar(e){
  const a=rand(0,TAU),r=rand(180,300);
  e.pos.x=clamp(L2.pos.x+Math.sin(a)*r,-L2_BOUND,L2_BOUND);
  e.pos.z=clamp(L2.pos.z+Math.cos(a)*r,-L2_BOUND,L2_BOUND);
}
function updateL2Dinos(dt){
  for(let i=L2.dinos.length-1;i>=0;i--){
    const e=L2.dinos[i];
    if(e.bodyMats){
      if(e.flash>0){e.flash-=dt;const f=clamp(e.flash/0.09,0,1);
        for(const m of e.bodyMats)if(m.emissive)m.emissive.setRGB(f*0.65,f*0.12,0);}
      else for(const m of e.bodyMats)if(m.emissive&&(m.emissive.r||m.emissive.g))m.emissive.setRGB(0,0,0);
    }
    if(e.state==='DEAD'){
      e.deadT+=dt;
      e.group.rotation.z=lerp(e.group.rotation.z,e.deadDir*1.45,clamp(dt*3,0,1));
      if(e.type==='ptera')e.pos.y=Math.max(0,e.pos.y-dt*16);
      e.group.position.set(e.pos.x,Math.max(0,e.pos.y)-Math.min(0.7,e.deadT*0.3),e.pos.z);
      if(e.deadT>2.7){scene2.remove(e.group);L2.dinos.splice(i,1);}
      continue;
    }
    const dx=L2.pos.x-e.pos.x,dz=L2.pos.z-e.pos.z;
    const distH=Math.hypot(dx,dz)||0.0001;
    if(e.type==='ptera'){
      e.animT+=dt*9;
      if(e.wingL){e.wingL.rotation.z=Math.sin(e.animT)*0.6;e.wingR.rotation.z=-Math.sin(e.animT)*0.6;}
      const dirx=dx/distH,dirz=dz/distH;
      e.diveCd-=dt;
      if(e.diveCd<=0&&distH<140&&!e.diving)e.diving=true;
      e.pos.x+=dirx*e.speed*dt;e.pos.z+=dirz*e.speed*dt;
      e.pos.y=lerp(e.pos.y,e.diving?L2.pos.y-1.5:e.alt,clamp(dt*1.4,0,1));
      if(e.diving&&distH<9){L2.hull-=9;L2.dmgT=1;sfxGrunt();e.diving=false;e.diveCd=rand(5,9);}
      e.group.rotation.set(0,Math.atan2(dirx,dirz),0);
      e.group.position.copy(e.pos);
    }else{
      e.turnT-=dt;
      if(e.turnT<=0){e.turnT=rand(1.6,3.6);e.yaw+=rand(-1.1,1.1);}
      if(distH>420)e.yaw=Math.atan2(dx,dz);
      e.pos.x+=Math.sin(e.yaw)*e.speed*dt;
      e.pos.z+=Math.cos(e.yaw)*e.speed*dt;
      e.animT+=dt*8;const s=Math.sin(e.animT);
      if(e.legL){e.legL.rotation.x=s*0.7;e.legR.rotation.x=-s*0.7;}
      if(e.tail)e.tail.rotation.y=Math.sin(e.animT*0.5)*0.2;
      if(e.type==='dilo'){
        e.spitCd-=dt;
        if(e.spitCd<=0&&distH<280){e.spitCd=rand(3,6);l2Spit(e);}
      }
      if(distH>660)l2RepositionFar(e);
      e.pos.x=clamp(e.pos.x,-L2_BOUND-60,L2_BOUND+60);
      e.pos.z=clamp(e.pos.z,-L2_BOUND-60,L2_BOUND+60);
      e.group.rotation.set(0,e.yaw,0);
      e.group.position.copy(e.pos);
    }
  }
}

/* ---------- dilophosaur acid spit ---------- */
function l2Spit(e){
  const m=new THREE.Mesh(new THREE.SphereGeometry(0.38,7,6),
    new THREE.MeshBasicMaterial({color:0xc4e24a}));
  const from=new THREE.Vector3(e.pos.x,1.5,e.pos.z);
  m.position.copy(from);scene2.add(m);
  const tt=clamp(Math.hypot(L2.pos.x-from.x,L2.pos.z-from.z)/52,0.7,3.2);
  const vx=(L2.pos.x-from.x)/tt,vz=(L2.pos.z-from.z)/tt;
  const vy=(L2.pos.y-from.y)/tt+0.5*42*tt;
  L2.spits.push({mesh:m,vel:new THREE.Vector3(vx,vy,vz),pos:from,life:tt+0.5});
  sfxSpit();
}
function updateL2Spits(dt){
  for(let i=L2.spits.length-1;i>=0;i--){
    const s=L2.spits[i];s.life-=dt;s.vel.y-=42*dt;
    s.pos.addScaledVector(s.vel,dt);s.mesh.position.copy(s.pos);
    const hit=d2(s.pos.x,s.pos.z,L2.pos.x,L2.pos.z)<28&&Math.abs(s.pos.y-L2.pos.y)<6;
    if(hit){L2.hull-=7;L2.dmgT=1;sfxSplash();}
    if(hit||s.life<=0||s.pos.y<-2){scene2.remove(s.mesh);L2.spits.splice(i,1);}
  }
}

/* ---------- chain gun ---------- */
function l2Look(mx,my){
  const sens=0.0022;
  L2.yaw-=mx*sens;
  L2.pitch=clamp(L2.pitch-my*sens,-1.45,0.25);
}
function computeAim(){
  L2.camDir.set(0,0,-1).applyEuler(camera2.rotation).normalize();
  const o=camera2.position,d=L2.camDir;
  let t=240;
  if(d.y<-0.001)t=clamp((0.6-o.y)/d.y,10,400);
  L2.aimPt.set(o.x+d.x*t,0.6,o.z+d.z*t);
  L2.reticle.position.set(L2.aimPt.x,0.6,L2.aimPt.z);
  const sc=clamp(t/120,0.7,2.2);L2.reticle.scale.set(sc,sc,sc);
  L2.reticle.material.color.setHex(L2.overheat?0x7a8a55:0xff5a3a);
  L2.reticle.material.opacity=L2.overheat?0.4:0.85;
}
function addL2Tracer(from,to){
  let t=null;for(let i=0;i<L2.tracers.length;i++)if(L2.tracers[i].life<=0){t=L2.tracers[i];break;}
  if(!t)t=L2.tracers[0];
  const len=from.distanceTo(to);if(len<0.5)return;
  t.mesh.position.copy(from).add(to).multiplyScalar(0.5);
  t.mesh.lookAt(to);t.mesh.scale.set(1,1,len);
  t.mesh.visible=true;t.mesh.material.opacity=0.9;t.life=0.05;
}
function updateL2Tracers(dt){
  for(let i=0;i<L2.tracers.length;i++){const t=L2.tracers[i];if(t.life<=0)continue;
    t.life-=dt;t.mesh.material.opacity=Math.max(0,t.life/0.05)*0.9;
    if(t.life<=0)t.mesh.visible=false;}
}
function l2Fire(){
  L2.shots++;L2.heat+=2.9;
  // hitscan from the CAMERA along the aim direction, so bullets hit what the
  // reticle is on. The tracer is drawn from the gun muzzle purely for looks.
  const o=camera2.position;
  const d=_l2.copy(L2.camDir);
  d.x+=gauss()*0.012;d.y+=gauss()*0.012;d.z+=gauss()*0.012;d.normalize();
  let reach=260;if(d.y<-0.001)reach=clamp((0.6-o.y)/d.y,14,420);
  const to=_l3.copy(o).addScaledVector(d,reach);
  // tracer starts at the viewmodel barrel tip (purely cosmetic)
  camera2.updateMatrixWorld();
  const gp=_l1.set(0.32,-0.66,-2.7).applyMatrix4(camera2.matrixWorld);
  addL2Tracer(gp,to);
  L2.muzzle.position.copy(gp);L2.muzzle.material.opacity=0.95;L2.muzzleT=0.05;
  sfxShot();
  // ray-vs-dino hit (works for ground + airborne targets)
  let best=null,bestPerp=1e9;
  for(let i=0;i<L2.dinos.length;i++){
    const e=L2.dinos[i];if(e.state!=='ALIVE')continue;
    const cy=e.type==='ptera'?e.pos.y+e.hitY:e.hitY;
    const vx=e.pos.x-o.x,vy=cy-o.y,vz=e.pos.z-o.z;
    const tproj=vx*d.x+vy*d.y+vz*d.z;
    if(tproj<2||tproj>reach+40)continue;
    const px=vx-d.x*tproj,py=vy-d.y*tproj,pz=vz-d.z*tproj;
    const perp=Math.sqrt(px*px+py*py+pz*pz);
    if(perp<e.rad&&perp<bestPerp){bestPerp=perp;best=e;}
  }
  if(best){
    L2.hits++;best.hp-=13;best.flash=0.09;
    if(best.hp<=0)l2KillDino(best);else sfxHitmark();
  }
}

/* ---------- HUD ---------- */
function updateL2HUD(){
  E.l2heatIn.style.width=clamp(L2.heat,0,100)+'%';
  E.l2heatIn.style.background=L2.overheat?'linear-gradient(90deg,#e0463a,#ff8a3a)':(L2.heat>70?'linear-gradient(90deg,#e07a2a,#f0b048)':'linear-gradient(90deg,#caa33b,#e8c45c)');
  E.l2kills.textContent=L2.kills+' / '+L2.goal;
  E.l2warn.style.opacity=L2.overheat?(0.6+Math.sin(L2.time*18)*0.4):0;
  E.l2dmg.style.opacity=clamp(L2.dmgT*0.7,0,0.75);
  E.l2tut.style.opacity=clamp(L2.tutT,0,1);
}

/* ---------- start / win / lose ---------- */
function startLevel2(){
  initAudio();
  buildLevel2();
  G.level=2;G.state='PLAYING';
  for(let i=0;i<L2.dinos.length;i++)scene2.remove(L2.dinos[i].group);L2.dinos.length=0;
  for(let i=0;i<L2.spits.length;i++)scene2.remove(L2.spits[i].mesh);L2.spits.length=0;
  L2.flightT=0;L2.yaw=0;L2.pitch=-0.55;
  L2.hull=100;L2.heat=0;L2.overheat=false;L2.fireCd=0;L2.muzzleT=0;
  L2.kills=0;L2.shots=0;L2.hits=0;L2.time=0;L2.spawnT=0.6;L2.dmgT=0;L2.tutT=6;
  G.mouseDown=false;
  for(let i=0;i<8;i++)l2Spawn(i%4===0?'dilo':'raptor');
  hide(E.o_start);hide(E.o_pause);hide(E.o_dead);hide(E.o_win);hide(E.hud);
  show(E.l2hud);
  if(E.l2warn)E.l2warn.style.opacity=0;
  if(E.l2tut)E.l2tut.style.opacity=1;
  if(AC&&AC.resume)AC.resume();
  lockPointer();
}
function l2Die(){
  if(G.state!=='PLAYING')return;
  G.state='DEAD';
  if(E.deadTitle)E.deadTitle.textContent='GUNSHIP DOWN';
  E.deadStats.textContent=L2.kills+' / '+L2.goal+' ELIMINATED  —  '+fmtTime(L2.time);
  show(E.o_dead);
  sfxBoom(0.6);roarSfx(0.4,46,1.4);
  if(document.exitPointerLock&&document.pointerLockElement)document.exitPointerLock();
}
function l2Win(){
  if(G.state!=='PLAYING')return;
  G.state='WON';
  const acc=L2.shots>0?Math.round(L2.hits/L2.shots*100):0;
  if(E.winTitle)E.winTitle.textContent='VALLEY CLEARED';
  if(E.winSub)E.winSub.textContent='The colony is safe — return to base';
  E.winStats.innerHTML='TIME &nbsp;<b>'+fmtTime(L2.time)+'</b><br>ELIMINATED &nbsp;<b>'+L2.kills+
    '</b><br>ACCURACY &nbsp;<b>'+acc+'%</b>';
  show(E.o_win);sfxSting();
  markComplete(2);
  if(document.exitPointerLock&&document.pointerLockElement)document.exitPointerLock();
}

/* ---------- per-frame ---------- */
function updateLevel2(dt){
  L2.time+=dt;
  // --- autopilot: the gunship flies its own slow patrol circuit ---
  L2.flightT+=dt;
  const R=210,w=0.085;                       // patrol radius / angular speed
  const ang=L2.flightT*w;
  L2.pos.set(Math.cos(ang)*R,40+Math.sin(L2.flightT*0.45)*3,Math.sin(ang)*R);
  if(L2.heli){
    L2.heli.position.copy(L2.pos);
    L2.heli.rotation.set(0,-ang+Math.PI/2,0);   // face the tangent (model is hidden anyway)
    L2.rotor.rotation.y+=dt*44;L2.tailRotor.rotation.x+=dt*60;
  }
  // --- first-person gunner camera: sit at the heli, free-look to aim ---
  camera2.position.copy(L2.pos);
  camera2.rotation.set(L2.pitch,L2.yaw,0);
  // aim + fire + heat
  computeAim();
  L2.fireCd-=dt;
  const firing=G.mouseDown&&!L2.overheat;
  if(firing&&L2.fireCd<=0){l2Fire();L2.fireCd=0.06;}
  if(L2.overheat){
    L2.heat-=dt*26;
    if(L2.heat<=30){L2.overheat=false;L2.heat=Math.max(0,L2.heat);}
  }else if(!firing){
    L2.heat=Math.max(0,L2.heat-dt*30);
  }
  if(L2.heat>=100&&!L2.overheat){L2.overheat=true;L2.heat=100;sfxBoom(0.3);}
  if(L2.muzzleT>0){L2.muzzleT-=dt;L2.muzzle.material.opacity=Math.max(0,L2.muzzleT/0.05)*0.95;}
  updateL2Tracers(dt);
  updateL2Dinos(dt);
  updateL2Spits(dt);
  // spawn waves up to the goal
  L2.spawnT-=dt;
  if(L2.spawnT<=0&&L2.kills<L2.goal&&l2Alive()<14){
    L2.spawnT=rand(1.5,2.8);
    const r=Math.random();
    l2Spawn(r<0.5?'raptor':(r<0.8?'dilo':'ptera'));
  }
  // the gunship is invincible — the only outcome is clearing the valley
  if(L2.kills>=L2.goal){l2Win();return;}
  L2.dmgT=Math.max(0,L2.dmgT-dt*1.6);
  L2.tutT=Math.max(0,L2.tutT-dt);
  updateL2HUD();
}
