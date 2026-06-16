'use strict';
/* ===================================================================== */
/* ===================== LEVEL 3 — RAMPART WATCH ======================= */
/* Defend a grazing flock from swooping pteranodons with a scoped rifle. */
/* You hold a fixed rampart, plenty of ammo, slow incoming raiders.       */
/* ===================================================================== */

/* ---------- scene / camera / state ---------- */
const scene3=new THREE.Scene();
const camera3=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,1400);
camera3.rotation.order='YXZ';
const L3_HIP_FOV=60,L3_SCOPE_FOV=20;
const L3={built:false,gunVM:null,muzzle:null,muzzleT:0,
  eye:new THREE.Vector3(0,11.0,70),      // gunner position on the rampart (eye ~1.6 above the deck)
  eyeY:11.0,walkSpeed:9,                  // free movement along the rampart deck
  // walkable bounds on the deck (inside the parapet & side walls)
  minX:-10.4,maxX:10.4,minZ:70.2,maxZ:78.4,
  yaw:0,pitch:-0.16,aiming:false,zoom:0,
  camDir:new THREE.Vector3(0,0,-1),aimPt:new THREE.Vector3(),
  mag:8,magSize:8,res:240,reloading:0,fireCd:0,
  kills:0,goal:18,shots:0,hits:0,time:0,spawnT:0,
  sheepStart:14,tutT:0,warnT:0,lostT:0,
  sheep:[],dinos:[],tracers:[]};
const _k1=new THREE.Vector3(),_k2=new THREE.Vector3(),_k3=new THREE.Vector3();

/* ---------- sheep ---------- */
function buildSheep(){
  const g=new THREE.Group();
  const wool=matStd(0xe6e2d4,0.95),dark=matStd(0x2b2620,0.8);
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.62,9,7),wool);
  body.scale.set(1.25,0.95,1.5);body.position.y=0.95;body.castShadow=true;g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.34,8,6),dark);
  head.scale.set(0.85,1,1.05);head.position.set(0,1.12,0.95);head.castShadow=true;g.add(head);
  for(const ex of [-0.13,0.13]){
    const ear=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.22,4),dark);
    ear.position.set(ex,1.28,0.86);ear.rotation.z=ex*2.2;g.add(ear);
  }
  for(const lx of [-0.34,0.34])for(const lz of [-0.55,0.55]){
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.07,0.62,5),dark);
    leg.position.set(lx,0.31,lz);g.add(leg);
  }
  return g;
}
function l3SpawnSheep(){
  for(let i=0;i<L3.sheep.length;i++)scene3.remove(L3.sheep[i].group);
  L3.sheep.length=0;
  for(let i=0;i<L3.sheepStart;i++){
    const g=buildSheep();
    const x=rand(-46,46),z=rand(-120,-28);
    g.position.set(x,l3Ground(x,z),z);
    g.rotation.y=rand(0,TAU);
    scene3.add(g);
    L3.sheep.push({alive:true,pos:new THREE.Vector3(x,0,z),group:g,grazeT:rand(0,TAU),baseY:g.position.y});
  }
}
function l3AliveSheep(){let k=0;for(let i=0;i<L3.sheep.length;i++)if(L3.sheep[i].alive)k++;return k;}
function l3NearestSheep(x,z){
  let best=null,bd=1e9;
  for(let i=0;i<L3.sheep.length;i++){
    const s=L3.sheep[i];if(!s.alive)continue;
    const d=d2(x,z,s.pos.x,s.pos.z);
    if(d<bd){bd=d;best=s;}
  }
  return best;
}

/* ---------- terrain helper ---------- */
function l3Ground(x,z){
  return Math.sin(x*0.018)*Math.cos(z*0.015)*1.1+Math.sin(x*0.006+z*0.009)*1.4;
}

/* ---------- world ---------- */
function buildLevel3(){
  if(L3.built)return;L3.built=true;
  scene3.background=new THREE.Color(0x8fb3c8);
  scene3.fog=new THREE.FogExp2(0x9fc0cf,0.0016);
  scene3.add(new THREE.HemisphereLight(0xdfeaf0,0x40542a,0.85));
  const sun=new THREE.DirectionalLight(0xfff0cf,1.05);
  sun.position.set(80,200,140);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-120;sun.shadow.camera.right=120;
  sun.shadow.camera.top=120;sun.shadow.camera.bottom=-120;
  sun.shadow.camera.near=20;sun.shadow.camera.far=520;sun.shadow.bias=-0.0008;
  scene3.add(sun);scene3.add(sun.target);
  // rolling green field
  const geo=new THREE.PlaneGeometry(1400,1400,80,80);geo.rotateX(-Math.PI/2);
  const p=geo.attributes.position,colors=[],c=new THREE.Color();
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i);
    p.setY(i,l3Ground(x,z));
    c.setHex(0x4f7a2e);
    c.offsetHSL(rand(-0.02,0.02),rand(-0.05,0.06),rand(-0.05,0.05));
    colors.push(c.r,c.g,c.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.computeVertexNormals();
  const gm=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
  gm.receiveShadow=true;scene3.add(gm);
  // ---- the rampart the player stands on (a stone keep wall) ----
  const stone=matStd(0x8a8678,0.95),stoneD=matStd(0x6f6c60,0.95);
  const base=new THREE.Mesh(new THREE.BoxGeometry(26,9,12),stone);
  base.position.set(0,4.5,74);base.castShadow=true;base.receiveShadow=true;scene3.add(base);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(24,0.6,10),stoneD);
  deck.position.set(0,9.1,74);scene3.add(deck);
  // front parapet with crenellations (toward the field, -z)
  const para=new THREE.Mesh(new THREE.BoxGeometry(24,1.5,1.1),stone);
  para.position.set(0,9.9,69.2);para.castShadow=true;scene3.add(para);
  for(let i=-5;i<=5;i++){
    const m=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.3,1.1),stone);
    m.position.set(i*2.1,11.2,69.2);m.castShadow=true;scene3.add(m);
  }
  // side walls
  for(const sx of [-1,1]){
    const w=new THREE.Mesh(new THREE.BoxGeometry(1.1,2.0,11),stone);
    w.position.set(sx*11.5,10.1,74);w.castShadow=true;scene3.add(w);
  }
  // ---- scattered trees / rocks at the field edges ----
  const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5,0.8,8,6),matStd(0x4c3a26,0.95),160);
  const cans=new THREE.InstancedMesh(new THREE.ConeGeometry(4,8,7),matStd(0x335520,0.95),160);
  cans.castShadow=true;
  let n=0;
  while(n<160){
    const x=rand(-560,560),z=rand(-560,300);
    if(z>-10&&Math.abs(x)<70){continue;}        // keep the field & rampart clear
    if(d2(x,z,0,-70)<60*60){continue;}
    const sc=rand(0.8,1.8);
    trunks.setMatrixAt(n,tMat(x,4*sc-1,z,rand(0,TAU),sc));
    cans.setMatrixAt(n,tMat(x,(8.5+rand(0,2))*sc-1,z,rand(0,TAU),sc));
    n++;
  }
  [trunks,cans].forEach(function(m){m.count=n;m.instanceMatrix.needsUpdate=true;m.frustumCulled=false;scene3.add(m);});
  const rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1.4,0),matStd(0x73715a,1),90);
  rocks.castShadow=true;
  for(let i=0;i<90;i++){const x=rand(-500,500),z=rand(-500,250);const sc=rand(0.6,2.2);
    rocks.setMatrixAt(i,tMat(x,sc*0.3,z,rand(0,TAU),sc));}
  rocks.count=90;rocks.instanceMatrix.needsUpdate=true;rocks.frustumCulled=false;scene3.add(rocks);
  // ---- first-person rifle viewmodel parented to the camera ----
  scene3.add(camera3);
  const vm=new THREE.Group();
  const gmv=matStd(0x23271c,0.5,0.5),metal=matStd(0x15140f,0.4,0.7);
  const stock=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.2,0.95),gmv);
  stock.position.set(0.26,-0.42,-0.7);vm.add(stock);
  const receiver=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.18,0.7),metal);
  receiver.position.set(0.26,-0.4,-1.35);vm.add(receiver);
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,1.7,8),metal);
  barrel.rotation.x=Math.PI/2;barrel.position.set(0.26,-0.4,-2.5);vm.add(barrel);
  const scopeM=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.075,0.5,8),metal);
  scopeM.rotation.x=Math.PI/2;scopeM.position.set(0.26,-0.26,-1.4);vm.add(scopeM);
  camera3.add(vm);L3.gunVM=vm;
  // muzzle flash
  L3.muzzle=new THREE.Mesh(new THREE.SphereGeometry(0.4,7,6),
    new THREE.MeshBasicMaterial({color:0xffd070,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  scene3.add(L3.muzzle);
  // tracers
  const tg=new THREE.BoxGeometry(0.08,0.08,1);
  for(let i=0;i<10;i++){
    const m=new THREE.Mesh(tg,new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.visible=false;m.frustumCulled=false;scene3.add(m);L3.tracers.push({mesh:m,life:0});
  }
}

/* ---------- pteranodon raiders ---------- */
function l3Spawn(){
  const e={type:'ptera',state:'ALIVE',deadT:0,deadDir:Math.random()<0.5?1:-1,animT:rand(0,9),
    hp:24,maxHp:24,speed:rand(7,10.5),flash:0,rad:5.2,target:null,carry:false,
    pos:new THREE.Vector3(),wingL:null,wingR:null,head:null,bodyMats:null};
  const g=buildPtera(e);e.sc=2.0;g.scale.setScalar(e.sc);
  e.hitY=0.2;
  // come in from the far field side (toward -z) in a forward arc, up high
  const x=rand(-150,150),z=rand(-400,-300),y=rand(34,58);
  e.pos.set(x,y,z);
  e.group=g;g.position.copy(e.pos);scene3.add(g);
  L3.dinos.push(e);
}
function l3Alive(){let k=0;for(let i=0;i<L3.dinos.length;i++)if(L3.dinos[i].state==='ALIVE')k++;return k;}
function l3KillDino(e){
  if(e.state!=='ALIVE')return;
  e.state='DEAD';e.deadT=0;L3.kills++;
  sfxKill();
}
function l3SheepTaken(s){
  s.alive=false;
  scene3.remove(s.group);
  L3.lostT=1.2;
  roarSfx(0.32,150,0.5);
  if(E.l3warn){E.l3warn.textContent='SHEEP TAKEN';L3.warnT=1.1;}
}
function updateL3Dinos(dt){
  for(let i=L3.dinos.length-1;i>=0;i--){
    const e=L3.dinos[i];
    if(e.bodyMats){
      if(e.flash>0){e.flash-=dt;const f=clamp(e.flash/0.09,0,1);
        for(const m of e.bodyMats)if(m.emissive)m.emissive.setRGB(f*0.65,f*0.12,0);}
      else for(const m of e.bodyMats)if(m.emissive&&(m.emissive.r||m.emissive.g))m.emissive.setRGB(0,0,0);
    }
    if(e.state==='DEAD'){
      e.deadT+=dt;
      e.group.rotation.z=lerp(e.group.rotation.z,e.deadDir*1.6,clamp(dt*3,0,1));
      e.pos.y=Math.max(0,e.pos.y-dt*22);
      e.group.position.set(e.pos.x,Math.max(0,e.pos.y),e.pos.z);
      if(e.deadT>2.2){scene3.remove(e.group);L3.dinos.splice(i,1);}
      continue;
    }
    if(e.carry){
      // grabbed a sheep — climb and flee off the map
      e.animT+=dt*11;
      if(e.wingL){e.wingL.rotation.z=Math.sin(e.animT)*0.7;e.wingR.rotation.z=-Math.sin(e.animT)*0.7;}
      e.pos.y+=dt*9;e.pos.z-=dt*e.speed*1.4;
      e.group.position.copy(e.pos);
      if(e.pos.y>90){scene3.remove(e.group);L3.dinos.splice(i,1);}
      continue;
    }
    // pick / refresh a target sheep
    if(!e.target||!e.target.alive)e.target=l3NearestSheep(e.pos.x,e.pos.z);
    e.animT+=dt*9;
    if(e.wingL){e.wingL.rotation.z=Math.sin(e.animT)*0.6;e.wingR.rotation.z=-Math.sin(e.animT)*0.6;}
    if(e.target){
      const tx=e.target.pos.x,tz=e.target.pos.z;
      const dx=tx-e.pos.x,dz=tz-e.pos.z;
      const distH=Math.hypot(dx,dz)||0.0001;
      const dirx=dx/distH,dirz=dz/distH;
      e.pos.x+=dirx*e.speed*dt;e.pos.z+=dirz*e.speed*dt;
      // glide down toward grabbing altitude as it nears the flock
      const wantY=clamp(2.0+(distH-6)*0.18,2.0,58);
      e.pos.y=lerp(e.pos.y,wantY,clamp(dt*1.3,0,1));
      e.group.rotation.set(clamp((wantY-e.pos.y)*0.04-0.12,-0.5,0.5),Math.atan2(dirx,dirz),0);
      if(distH<6&&e.pos.y<5){
        // snatch the sheep and flee
        e.carry=true;
        l3SheepTaken(e.target);
        e.target=null;
      }
    }else{
      // no sheep left — just drift; the round is already lost
      e.pos.z+=e.speed*dt*0.4;
      e.group.rotation.set(0,Math.PI,0);
    }
    e.group.position.copy(e.pos);
  }
}

/* ---------- aiming / scoped rifle ---------- */
function l3Look(mx,my){
  const sens=0.0021*(L3.aiming?(L3_SCOPE_FOV/L3_HIP_FOV):1);
  L3.yaw-=mx*sens;
  L3.pitch=clamp(L3.pitch-my*sens,-0.85,0.55);
}
function l3Reload(){
  if(L3.reloading>0||L3.mag>=L3.magSize||L3.res<=0)return;
  L3.reloading=1.9;sfxReload(1.9);
}
function addL3Tracer(from,to){
  let t=null;for(let i=0;i<L3.tracers.length;i++)if(L3.tracers[i].life<=0){t=L3.tracers[i];break;}
  if(!t)t=L3.tracers[0];
  const len=from.distanceTo(to);if(len<0.5)return;
  t.mesh.position.copy(from).add(to).multiplyScalar(0.5);
  t.mesh.lookAt(to);t.mesh.scale.set(1,1,len);
  t.mesh.visible=true;t.mesh.material.opacity=0.9;t.life=0.06;
}
function updateL3Tracers(dt){
  for(let i=0;i<L3.tracers.length;i++){const t=L3.tracers[i];if(t.life<=0)continue;
    t.life-=dt;t.mesh.material.opacity=Math.max(0,t.life/0.06)*0.9;
    if(t.life<=0)t.mesh.visible=false;}
}
function l3Fire(){
  if(G.state!=='PLAYING'||L3.fireCd>0||L3.reloading>0)return;
  if(L3.mag<=0){sfxDry();return;}
  L3.mag--;L3.shots++;L3.fireCd=0.32;
  const o=camera3.position;
  const d=_k2.copy(L3.camDir);
  const spread=L3.aiming?0.0010:0.006;
  d.x+=gauss()*spread;d.y+=gauss()*spread;d.z+=gauss()*spread;d.normalize();
  const reach=900;
  const to=_k3.copy(o).addScaledVector(d,reach);
  camera3.updateMatrixWorld();
  const gp=_k1.set(0.26,-0.4,-3.3).applyMatrix4(camera3.matrixWorld);
  addL3Tracer(gp,to);
  L3.muzzle.position.copy(gp);L3.muzzle.material.opacity=0.95;L3.muzzleT=0.05;
  sfxSniper();
  // ray-vs-dino
  let best=null,bestT=1e9;
  for(let i=0;i<L3.dinos.length;i++){
    const e=L3.dinos[i];if(e.state!=='ALIVE')continue;
    const cy=e.pos.y+e.hitY;
    const vx=e.pos.x-o.x,vy=cy-o.y,vz=e.pos.z-o.z;
    const tproj=vx*d.x+vy*d.y+vz*d.z;
    if(tproj<2||tproj>reach)continue;
    const px=vx-d.x*tproj,py=vy-d.y*tproj,pz=vz-d.z*tproj;
    const perp=Math.sqrt(px*px+py*py+pz*pz);
    if(perp<e.rad&&tproj<bestT){bestT=tproj;best=e;}
  }
  if(best){
    L3.hits++;best.hp-=70;best.flash=0.09;
    if(best.hp<=0)l3KillDino(best);else sfxHitmark();
  }
}

/* ---------- HUD ---------- */
function updateL3HUD(){
  const alive=l3AliveSheep();
  E.l3sheep.textContent=alive+' / '+L3.sheepStart;
  E.l3sheep.style.color=alive<=3?'#ff7a5a':'#ffd76a';
  E.l3kills.textContent=L3.kills+' / '+L3.goal;
  E.l3ammo.textContent=L3.mag;
  E.l3res.textContent=L3.reloading>0?'RELOADING':('/ '+L3.res);
  E.l3warn.style.opacity=L3.warnT>0?clamp(L3.warnT,0,1):0;
  E.l3dmg.style.opacity=clamp(L3.lostT*0.6,0,0.6);
  E.l3tut.style.opacity=clamp(L3.tutT,0,1);
  E.l3scope.style.opacity=L3.zoom>0.6?1:0;
  E.l3cross.style.opacity=L3.zoom>0.6?0:1;
}

/* ---------- start / win / lose ---------- */
function startLevel3(){
  initAudio();
  buildLevel3();
  G.level=3;G.state='PLAYING';
  for(let i=0;i<L3.dinos.length;i++)scene3.remove(L3.dinos[i].group);L3.dinos.length=0;
  l3SpawnSheep();
  L3.eye.set(0,L3.eyeY,70);
  L3.yaw=0;L3.pitch=-0.16;L3.aiming=false;L3.zoom=0;
  L3.mag=L3.magSize;L3.res=240;L3.reloading=0;L3.fireCd=0;L3.muzzleT=0;
  L3.kills=0;L3.shots=0;L3.hits=0;L3.time=0;L3.spawnT=2.4;
  L3.tutT=7;L3.warnT=0;L3.lostT=0;
  G.mouseDown=false;
  camera3.fov=L3_HIP_FOV;camera3.updateProjectionMatrix();
  hide(E.o_start);hide(E.o_pause);hide(E.o_dead);hide(E.o_win);hide(E.hud);hide(E.l2hud);
  show(E.l3hud);
  if(E.l3warn)E.l3warn.style.opacity=0;
  if(E.l3tut)E.l3tut.style.opacity=1;
  if(AC&&AC.resume)AC.resume();
  lockPointer();
}
function l3Die(){
  if(G.state!=='PLAYING')return;
  G.state='DEAD';
  if(E.deadTitle)E.deadTitle.textContent='THE FLOCK IS LOST';
  E.deadStats.textContent=L3.kills+' RAIDERS DOWN  —  '+fmtTime(L3.time);
  show(E.o_dead);
  roarSfx(0.4,90,1.3);
  if(document.exitPointerLock&&document.pointerLockElement)document.exitPointerLock();
}
function l3Win(){
  if(G.state!=='PLAYING')return;
  G.state='WON';
  const acc=L3.shots>0?Math.round(L3.hits/L3.shots*100):0;
  if(E.winTitle)E.winTitle.textContent='FLOCK DEFENDED';
  if(E.winSub)E.winSub.textContent='The skies are clear — the shepherds give thanks';
  E.winStats.innerHTML='TIME &nbsp;<b>'+fmtTime(L3.time)+'</b><br>RAIDERS DOWN &nbsp;<b>'+L3.kills+
    '</b><br>SHEEP SAVED &nbsp;<b>'+l3AliveSheep()+' / '+L3.sheepStart+'</b><br>ACCURACY &nbsp;<b>'+acc+'%</b>';
  show(E.o_win);sfxSting();
  markComplete(3);
  if(document.exitPointerLock&&document.pointerLockElement)document.exitPointerLock();
}

/* ---------- per-frame ---------- */
function updateLevel3(dt){
  L3.time+=dt;
  // smooth scope zoom
  L3.zoom=clamp(L3.zoom+(L3.aiming?dt*6:-dt*6),0,1);
  camera3.fov=lerp(L3_HIP_FOV,L3_SCOPE_FOV,L3.zoom);
  camera3.updateProjectionMatrix();
  // free movement along the rampart deck + free-look aim
  let ix=0,iz=0;
  if(keys.KeyW)iz-=1;
  if(keys.KeyS)iz+=1;
  if(keys.KeyA)ix-=1;
  if(keys.KeyD)ix+=1;
  if(ix||iz){
    const sy=Math.sin(L3.yaw),cy=Math.cos(L3.yaw);
    // forward (-z in camera space) and strafe, flattened to the deck plane
    let mx=ix*cy+iz*sy,mz=iz*cy-ix*sy;
    const ml=Math.hypot(mx,mz)||1;mx/=ml;mz/=ml;
    const spd=L3.walkSpeed*((keys.ShiftLeft||keys.ShiftRight)?1.7:1);
    L3.eye.x=clamp(L3.eye.x+mx*spd*dt,L3.minX,L3.maxX);
    L3.eye.z=clamp(L3.eye.z+mz*spd*dt,L3.minZ,L3.maxZ);
  }
  L3.eye.y=L3.eyeY;
  camera3.position.copy(L3.eye);
  camera3.rotation.set(L3.pitch,L3.yaw,0);
  L3.camDir.set(0,0,-1).applyEuler(camera3.rotation).normalize();
  // auto-reload when the mag runs dry
  if(L3.mag<=0&&L3.reloading<=0&&L3.res>0)l3Reload();
  if(L3.reloading>0){
    L3.reloading-=dt;
    if(L3.reloading<=0){
      const need=L3.magSize-L3.mag,take=Math.min(need,L3.res);
      L3.mag+=take;L3.res-=take;
    }
  }
  L3.fireCd=Math.max(0,L3.fireCd-dt);
  if(L3.muzzleT>0){L3.muzzleT-=dt;L3.muzzle.material.opacity=Math.max(0,L3.muzzleT/0.05)*0.95;}
  // gentle sheep grazing animation
  for(let i=0;i<L3.sheep.length;i++){
    const s=L3.sheep[i];if(!s.alive)continue;
    s.grazeT+=dt*1.3;
    s.group.position.y=s.baseY+Math.sin(s.grazeT)*0.04;
    s.group.rotation.x=Math.sin(s.grazeT*0.7)*0.05;
  }
  updateL3Tracers(dt);
  updateL3Dinos(dt);
  // spawn raiders gently until the goal is met
  L3.spawnT-=dt;
  if(L3.spawnT<=0&&L3.kills<L3.goal&&l3Alive()<5&&l3AliveSheep()>0){
    L3.spawnT=rand(2.8,4.4);
    l3Spawn();
  }
  // outcomes
  if(l3AliveSheep()<=0){l3Die();return;}
  if(L3.kills>=L3.goal){l3Win();return;}
  L3.warnT=Math.max(0,L3.warnT-dt);
  L3.lostT=Math.max(0,L3.lostT-dt*0.9);
  L3.tutT=Math.max(0,L3.tutT-dt);
  updateL3HUD();
}
