'use strict';
/* ============================== GUN VIEWMODELS ============================== */
let gunRoot=null,rifleModel=null,shotModel=null,snipModel=null,flashMesh=null,flashLight=null,flashT=0;
function buildGunModels(){
  gunRoot=new THREE.Group();
  camera.add(gunRoot);
  gunRoot.position.set(0.34,-0.3,-0.62);
  const gm=matStd(0x3a3a38,0.55,0.55),wm=matStd(0x5a4426,0.85,0.05);
  rifleModel=new THREE.Group();
  const rec=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.11,0.5),gm);rifleModel.add(rec);
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.024,0.024,0.46,6),gm);
  bar.rotation.x=Math.PI/2;bar.position.set(0,0.01,-0.45);rifleModel.add(bar);
  const mag=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.17,0.1),gm);
  mag.position.set(0,-0.13,-0.05);mag.rotation.x=0.18;rifleModel.add(mag);
  const stock=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.1,0.24),wm);
  stock.position.set(0,-0.02,0.34);rifleModel.add(stock);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.12,0.06),wm);
  grip.position.set(0,-0.11,0.12);grip.rotation.x=0.4;rifleModel.add(grip);
  const sight=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.045,0.1),gm);
  sight.position.set(0,0.08,-0.1);rifleModel.add(sight);
  gunRoot.add(rifleModel);
  shotModel=new THREE.Group();
  const rec2=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.11,0.42),gm);shotModel.add(rec2);
  const bar2=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.5,7),gm);
  bar2.rotation.x=Math.PI/2;bar2.position.set(0,0.02,-0.42);shotModel.add(bar2);
  const pump=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.16,7),wm);
  pump.rotation.x=Math.PI/2;pump.position.set(0,-0.04,-0.34);shotModel.add(pump);
  const stock2=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.11,0.26),wm);
  stock2.position.set(0,-0.03,0.32);shotModel.add(stock2);
  gunRoot.add(shotModel);
  snipModel=new THREE.Group();
  const rec3=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.1,0.55),gm);snipModel.add(rec3);
  const bar3=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.7,6),gm);
  bar3.rotation.x=Math.PI/2;bar3.position.set(0,0.015,-0.6);snipModel.add(bar3);
  const brake=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.08,6),gm);
  brake.rotation.x=Math.PI/2;brake.position.set(0,0.015,-0.93);snipModel.add(brake);
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,0.26,8),gm);
  tube.rotation.x=Math.PI/2;tube.position.set(0,0.1,-0.08);snipModel.add(tube);
  const lens=new THREE.Mesh(new THREE.CylinderGeometry(0.042,0.042,0.03,8),
    new THREE.MeshBasicMaterial({color:0x9ad2e8}));
  lens.rotation.x=Math.PI/2;lens.position.set(0,0.1,-0.22);snipModel.add(lens);
  const stock3=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.11,0.3),wm);
  stock3.position.set(0,-0.025,0.38);snipModel.add(stock3);
  const grip3=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.12,0.06),wm);
  grip3.position.set(0,-0.11,0.14);grip3.rotation.x=0.4;snipModel.add(grip3);
  const bipod=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.1,0.02),gm);
  bipod.position.set(0,-0.08,-0.5);snipModel.add(bipod);
  gunRoot.add(snipModel);
  rifleModel.visible=false;shotModel.visible=false;snipModel.visible=false;
  rifleModel.traverse(function(o){o.castShadow=false;});
  shotModel.traverse(function(o){o.castShadow=false;});
  snipModel.traverse(function(o){o.castShadow=false;});
  const fg=new THREE.Group();
  const fmat=new THREE.MeshBasicMaterial({color:0xffc15e,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const p1=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.42),fmat);
  const p2=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.42),fmat);
  p2.rotation.y=Math.PI/2;
  fg.add(p1);fg.add(p2);
  fg.position.set(0,0.01,-0.78);
  fg.visible=false;
  gunRoot.add(fg);
  flashMesh=fg;
  flashLight=new THREE.PointLight(0xffc878,0,10);
  flashLight.position.set(0,0.05,-0.8);
  gunRoot.add(flashLight);
}
function muzzleWorld(){
  flashMesh.getWorldPosition(_v3);
  return _v3;
}
function doMuzzle(){
  flashT=0.05;
  flashLight.intensity=2.4;
  flashMesh.visible=true;
  flashMesh.rotation.z=rand(0,TAU);
  flashMesh.scale.setScalar(rand(0.8,1.25));
}
/* ============================== PICKUPS ============================== */
const PICKUP_DEFS=[{t:'rifle',x:1.5,z:221},{t:'ammo',x:-3,z:205},{t:'med',x:-14,z:118},
  {t:'ammo',x:12,z:132},{t:'shot',x:7,z:88},{t:'med',x:18,z:76},{t:'ammo',x:-8,z:92},
  {t:'med',x:-16,z:18},{t:'ammo',x:4,z:-66},{t:'snip',x:9,z:-62},{t:'med',x:-10,z:-112},{t:'ammo',x:-2,z:-100},
  {t:'ammo',x:-4,z:-166},{t:'med',x:3,z:-180},{t:'ammo',x:0,z:-212}];
function buildPickupMesh(t){
  const g=new THREE.Group();
  if(t==='ammo'){
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.4,0.42),matStd(0x55613a,0.85));
    b.position.y=0.2;g.add(b);
    const band=new THREE.Mesh(new THREE.BoxGeometry(0.57,0.1,0.44),matStd(0xc7a23c,0.6,0.3));
    band.position.y=0.24;g.add(band);
  }else if(t==='med'){
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.36,0.42),matStd(0xd9d6c8,0.7));
    b.position.y=0.18;g.add(b);
    const c1=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.02,0.09),matStd(0xc23a2c,0.6));
    c1.position.y=0.37;g.add(c1);
    const c2=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.02,0.3),matStd(0xc23a2c,0.6));
    c2.position.y=0.37;g.add(c2);
  }else{
    const gm=matStd(0x33332f,0.5,0.6),wm=matStd(0x5a4426,0.85);
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.12,0.6),gm);
    body.position.y=0.4;g.add(body);
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(t==='shot'?0.045:0.027,t==='shot'?0.045:0.027,t==='snip'?0.7:0.5,6),gm);
    bar.rotation.x=Math.PI/2;bar.position.set(0,0.42,t==='snip'?-0.6:-0.5);g.add(bar);
    const st=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.1,0.22),wm);
    st.position.set(0,0.37,0.38);g.add(st);
    if(t==='snip'){
      const sc=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.24,8),gm);
      sc.rotation.x=Math.PI/2;sc.position.set(0,0.52,-0.05);g.add(sc);
    }
    g.rotation.z=0.25;
  }
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.035,6,22),
    new THREE.MeshBasicMaterial({color:t==='med'?0xff6a5a:0xffd76a,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=0.06;
  g.add(ring);
  return g;
}
function addPickup(t,x,z){
  const m=buildPickupMesh(t);
  const gh=supportHeight(x,z,groundHeight(x,z)+1);
  m.position.set(x,gh+0.15,z);
  scene.add(m);
  pickups.push({t:t,x:x,z:z,y:gh,mesh:m,bob:rand(0,TAU)});
}
function applyPickup(p){
  if(p.t==='rifle'){
    player.has.rifle=true;
    if(player.weapon==='none')player.weapon='rifle';
    sfxPickup();
    showTut('LMB — FIRE     R — RELOAD');
    if(G.objIdx===0)advanceObjective();
  }else if(p.t==='shot'){
    player.has.shot=true;
    player.weapon='shot';switchDip=0.3;reloadT=0;
    sfxPickup();
    showTut('SHOTGUN ACQUIRED — 1 / 2 TO SWITCH');
  }else if(p.t==='snip'){
    player.has.snip=true;
    player.weapon='snip';switchDip=0.3;reloadT=0;
    sfxPickup();
    showTut('SNIPER ACQUIRED — HOLD RMB TO SCOPE     3 TO SELECT');
  }else if(p.t==='ammo'){
    WPN.rifle.res=Math.min(240,WPN.rifle.res+60);
    if(player.has.shot)WPN.shot.res=Math.min(40,WPN.shot.res+8);
    if(player.has.snip)WPN.snip.res=Math.min(25,WPN.snip.res+4);
    sfxPickup();
  }else if(p.t==='med'){
    if(player.hp>=100)return false;
    player.hp=Math.min(100,player.hp+35);
    sfxMed();
  }
  return true;
}
function updatePickups(dt){
  for(let i=pickups.length-1;i>=0;i--){
    const p=pickups[i];
    p.bob+=dt*2.2;
    p.mesh.position.y=p.y+0.15+Math.sin(p.bob)*0.09;
    p.mesh.rotation.y+=dt*1.6;
    if(d2(p.x,p.z,player.pos.x,player.pos.z)<2.3&&Math.abs(player.pos.y-p.y)<2.4){
      if(applyPickup(p)){
        burst(p.mesh.position,8,p.t==='med'?0xff6a5a:0xffd76a,2,1.4,0.5);
        scene.remove(p.mesh);
        pickups.splice(i,1);
      }
    }
  }
}
/* ============================== WEAPONS / FIRING ============================== */
function raySphere(o,d,cx,cy,cz,r,maxT){
  const ox=o.x-cx,oy=o.y-cy,oz=o.z-cz;
  const b=ox*d.x+oy*d.y+oz*d.z;
  const c=ox*ox+oy*oy+oz*oz-r*r;
  const disc=b*b-c;
  if(disc<0)return -1;
  const t=-b-Math.sqrt(disc);
  return (t>0&&t<maxT)?t:-1;
}
const _fwd=new THREE.Vector3(),_rt=new THREE.Vector3(),_up2=new THREE.Vector3(),_dir=new THREE.Vector3();
function fireShot(dir,dmg,range){
  const o=camera.position;
  let bestT=range,hitE=null;
  for(let i=0;i<enemies.length;i++){
    const e=enemies[i];
    if(e.state==='DEAD')continue;
    const t=raySphere(o,dir,e.pos.x,e.pos.y+e.hitY,e.pos.z,e.hitR,bestT);
    if(t>0){bestT=t;hitE=e;}
  }
  _ray.origin.copy(o);_ray.direction.copy(dir);
  for(let i=0;i<obsB.length;i++){
    const b=obsB[i];
    if(!b.box3)continue;
    const hp=_ray.intersectBox(b.box3,_v1);
    if(hp){const t=hp.distanceTo(o);if(t<bestT){bestT=t;hitE=null;}}
  }
  for(let t=2.5;t<bestT;t+=2.5){
    _v1.copy(dir).multiplyScalar(t).add(o);
    if(_v1.y<groundHeight(_v1.x,_v1.z)){bestT=t;hitE=null;break;}
  }
  _v2.copy(dir).multiplyScalar(bestT).add(o);
  addTracer(muzzleWorld(),_v2);
  if(hitE){
    burst(_v2,6,0x8a1f14,2.6,0.8,0.4);
    damageEnemy(hitE,dmg);
    G.hitFlag=true;
  }else if(bestT<range-0.5){
    burst(_v2,5,0x9a8f6a,2,1.2,0.35);
  }
}
function fireWeapon(){
  const w=WPN[player.weapon];
  if(!w||fireCd>0||reloadT>0||G.state!=='PLAYING')return;
  if(w.mag<=0){
    sfxDry();fireCd=0.25;
    if(w.res>0)startReload();
    return;
  }
  w.mag--;G.shots++;G.hitFlag=false;G.killFlag=false;
  fireCd=w.rate;
  camera.updateMatrixWorld(true);
  camera.getWorldDirection(_fwd);
  _rt.crossVectors(_fwd,UP).normalize();
  _up2.crossVectors(_rt,_fwd);
  const moveSpread=player.curSpeed/8.4*0.02;
  let sp=w.spread+bloom+moveSpread;
  if(player.weapon==='snip'&&aimT>0.5)sp=SCOPE_SPREAD+moveSpread*0.5;
  for(let k=0;k<w.pellets;k++){
    _dir.copy(_fwd)
      .addScaledVector(_rt,gauss()*sp)
      .addScaledVector(_up2,gauss()*sp)
      .normalize();
    fireShot(_dir,w.dmg,w.range);
  }
  if(G.hitFlag){
    G.hits++;G.hitT=0.16;
    G.hitKill=G.killFlag;
    if(G.killFlag)sfxKill();else sfxHitmark();
  }
  bloom=Math.min(0.05,bloom+w.bloomAdd);
  player.recoil=Math.min(0.1,player.recoil+(player.weapon==='shot'?0.035:player.weapon==='snip'?0.055:0.013));
  gunKick=player.weapon==='shot'?0.13:player.weapon==='snip'?0.17:0.07;
  doMuzzle();
  if(player.weapon==='shot')sfxShotgun();else if(player.weapon==='snip')sfxSniper();else sfxShot();
  hearGun();
}
function startReload(){
  const w=WPN[player.weapon];
  if(!w||reloadT>0||w.mag>=w.magSize||w.res<=0)return;
  reloadT=w.reload;
  sfxReload(w.reload);
}
function finishReload(){
  const w=WPN[player.weapon];
  if(!w)return;
  const need=w.magSize-w.mag;
  const take=Math.min(need,w.res);
  w.mag+=take;w.res-=take;
}
function switchWeapon(n){
  if(!player.has[n]||player.weapon===n||reloadT>0||G.state!=='PLAYING')return;
  player.weapon=n;
  switchDip=0.3;fireCd=Math.max(fireCd,0.2);bloom=0;
  aiming=false;
  sfxClick();
}
function dropAim(){
  aiming=false;aimT=0;
  camera.fov=BASE_FOV;camera.updateProjectionMatrix();
  if(E.scope)E.scope.style.opacity=0;
  if(E.ch)E.ch.style.opacity=1;
}
function updateWeapon(dt){
  fireCd-=dt;
  bloom=Math.max(0,bloom-dt*0.08);
  gunKick=Math.max(0,gunKick-dt*0.55);
  switchDip=Math.max(0,switchDip-dt);
  if(flashT>0){
    flashT-=dt;
    if(flashT<=0){flashMesh.visible=false;flashLight.intensity=0;}
    else flashLight.intensity*=0.75;
  }
  if(reloadT>0){
    reloadT-=dt;
    if(reloadT<=0){reloadT=0;finishReload();}
  }
  if(G.mouseDown&&player.weapon!=='none'&&WPN[player.weapon].auto)fireWeapon();
  const aimTgt=(aiming&&player.weapon==='snip'&&reloadT<=0&&switchDip<=0)?1:0;
  aimT+=(aimTgt-aimT)*Math.min(1,dt*9);
  if(aimT<0.005)aimT=0;else if(aimT>0.995)aimT=1;
  const fv=BASE_FOV-(BASE_FOV-SCOPE_FOV)*aimT;
  if(Math.abs(camera.fov-fv)>0.01){camera.fov=fv;camera.updateProjectionMatrix();}
  E.scope.style.opacity=aimT>0.4?(aimT-0.4)/0.6:0;
  E.ch.style.opacity=1-aimT;
  rifleModel.visible=(player.weapon==='rifle');
  shotModel.visible=(player.weapon==='shot');
  snipModel.visible=(player.weapon==='snip'&&aimT<0.7);
  const w=WPN[player.weapon];
  let dip=0;
  if(reloadT>0&&w)dip=-0.2*Math.sin(Math.min(1,(1-reloadT/w.reload))*Math.PI);
  if(switchDip>0)dip-=switchDip*0.7;
  const bobX=Math.sin(player.bobT)*0.014*(player.curSpeed>0.5?1:0);
  const bobY=Math.abs(Math.cos(player.bobT))*0.012*(player.curSpeed>0.5?1:0);
  gunRoot.position.set(0.34+bobX,-0.3+bobY+dip,-0.62+gunKick);
  gunRoot.rotation.x=gunKick*0.6;
}

/* ============================== COLLISION ============================== */
function collideXZ(o,r){
  for(let i=0;i<obsC.length;i++){
    const c=obsC[i];
    const dx=o.pos.x-c.x,dz=o.pos.z-c.z,rr=r+c.r;
    const dd=dx*dx+dz*dz;
    if(dd<rr*rr&&dd>0.0001){
      const d=Math.sqrt(dd),push=(rr-d)/d;
      o.pos.x+=dx*push;o.pos.z+=dz*push;
    }
  }
  const top=o.pos.y+1.6;
  for(let i=0;i<obsB.length;i++){
    const b=obsB[i];
    if(top<b.y0||o.pos.y>b.y1)continue;
    const cx=clamp(o.pos.x,b.x0,b.x1),cz=clamp(o.pos.z,b.z0,b.z1);
    const dx=o.pos.x-cx,dz=o.pos.z-cz;
    const dd=dx*dx+dz*dz;
    if(dd<r*r){
      if(dd>0.0001){
        const d=Math.sqrt(dd),push=(r-d)/d;
        o.pos.x+=dx*push;o.pos.z+=dz*push;
      }else{
        const px1=o.pos.x-b.x0,px2=b.x1-o.pos.x,pz1=o.pos.z-b.z0,pz2=b.z1-o.pos.z;
        const m=Math.min(px1,px2,pz1,pz2);
        if(m===px1)o.pos.x=b.x0-r;
        else if(m===px2)o.pos.x=b.x1+r;
        else if(m===pz1)o.pos.z=b.z0-r;
        else o.pos.z=b.z1+r;
      }
    }
  }
  o.pos.x=clamp(o.pos.x,-245,245);
  o.pos.z=clamp(o.pos.z,-245,245);
}
/* ============================== PLAYER ============================== */
function updatePlayer(dt){
  let ix=0,iz=0;
  if(keys.KeyW)iz-=1;
  if(keys.KeyS)iz+=1;
  if(keys.KeyA)ix-=1;
  if(keys.KeyD)ix+=1;
  const moving=(ix!==0||iz!==0);
  const wantSprint=keys.ShiftLeft||keys.ShiftRight;
  let sprinting=false;
  if(moving&&wantSprint&&player.stam>1&&iz<=0){
    sprinting=true;
    player.stam=Math.max(0,player.stam-20*dt);
    player.stamCd=0.8;
  }else{
    player.stamCd-=dt;
    if(player.stamCd<=0)player.stam=Math.min(100,player.stam+14*dt);
  }
  let speed=sprinting?8.4:5.2;
  if(player.stagger>0){player.stagger-=dt;speed*=0.45;}
  player.inWater=Math.abs(player.pos.z)<13&&player.pos.y<-0.4;
  if(player.inWater)speed*=0.55;
  const sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);
  let mx=0,mz=0;
  if(moving){
    const il=1/Math.sqrt(ix*ix+iz*iz);
    const fx=-sy,fz=-cy,rx=cy,rz=-sy;
    mx=(fx*(-iz)+rx*ix)*il*speed;
    mz=(fz*(-iz)+rz*ix)*il*speed;
  }
  player.curSpeed=moving?speed:0;
  player.vel.y-=21*dt;
  const prevVy=player.vel.y;
  player.kvel.multiplyScalar(Math.max(0,1-6*dt));
  player.pos.x+=(mx+player.kvel.x)*dt;
  player.pos.z+=(mz+player.kvel.z)*dt;
  player.pos.y+=player.vel.y*dt;
  collideXZ(player,player.r);
  const gh=supportHeight(player.pos.x,player.pos.z,player.pos.y);
  if(player.pos.y<=gh){
    if(!player.grounded&&prevVy<-9){sfxLand();G.shake=Math.min(1,G.shake+0.12);}
    player.pos.y=gh;player.vel.y=0;player.grounded=true;
  }else if(player.pos.y>gh+0.02)player.grounded=false;
  if(keys.Space&&player.grounded){
    player.vel.y=7.6;player.grounded=false;
  }
  if(moving&&player.grounded){
    player.bobT+=dt*speed*1.65;
    player.stepT+=dt;
    const ivl=sprinting?0.31:0.44;
    if(player.stepT>ivl){player.stepT=0;sfxStep(sprinting);}
  }else player.stepT=0.2;
  player.invuln=Math.max(0,player.invuln-dt);
  player.recoil-=player.recoil*9*dt;
  let swayY=0,swayP=0;
  if(player.stagger>0){swayY=Math.sin(G.time*26)*0.012;swayP=Math.cos(G.time*21)*0.01;}
  const shk=G.shake;
  const shY=shk>0?(Math.random()-0.5)*shk*0.05:0;
  const shP=shk>0?(Math.random()-0.5)*shk*0.05:0;
  camera.position.set(player.pos.x,player.pos.y+1.62+Math.sin(player.bobT*2)*0.035*(moving&&player.grounded?1:0),player.pos.z);
  camera.rotation.x=player.pitch-player.recoil+swayP+shP;
  camera.rotation.y=player.yaw+swayY+shY;
}
function playerDamage(d,fromPos,knock){
  if(player.invuln>0||G.state!=='PLAYING')return;
  player.hp-=d;
  player.invuln=0.7;
  G.vigT=1;
  if(fromPos){
    G.dmgWorldAng=Math.atan2(fromPos.x-player.pos.x,fromPos.z-player.pos.z);
    G.dmgArcT=0.9;
    if(knock){
      _v1.set(player.pos.x-fromPos.x,0,player.pos.z-fromPos.z).normalize().multiplyScalar(knock);
      player.kvel.add(_v1);
    }
  }
  sfxGrunt();
  if(player.hp<=0){player.hp=0;killPlayer();}
}
/* ============================== OBJECTIVES ============================== */
const OBJS=[
  {t:'SCAVENGE A WEAPON FROM THE WRECKAGE',x:1.5,z:221},
  {t:'REACH THE RADIO TOWER — DUE NORTH',x:-6,z:-108},
  {t:'ACTIVATE THE RADIO BEACON  [ E ]',x:-3.4,z:-105.6},
  {t:'SURVIVE — THE SIGNAL DRAWS THEM IN',x:-6,z:-108},
  {t:'PUSH NORTH THROUGH THE CANYON — REACH HAVEN',x:0,z:-228}
];
let objBeam=null;
function buildObjBeam(){
  objBeam=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,50,8,1,true),
    new THREE.MeshBasicMaterial({color:0xffd76a,transparent:true,opacity:0.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  objBeam.frustumCulled=false;
  scene.add(objBeam);
}
function setObjective(i){
  G.objIdx=i;
  const o=OBJS[i];
  if(!o){if(objBeam)objBeam.visible=false;return;}
  if(objBeam){
    objBeam.visible=true;
    objBeam.position.set(o.x,groundHeight(o.x,o.z)+24,o.z);
  }
}
function advanceObjective(){setObjective(G.objIdx+1);}
function showTut(s){if(E.tut)E.tut.textContent=s;G.tutT=4.6;}
function showZone(s){if(E.zoneTitle)E.zoneTitle.textContent=s;G.zoneT=3.2;}
/* ============================== TRIGGERS / ZONES ============================== */
function makeTriggers(){
  triggers.push({done:false,f:function(){return player.pos.z<152;},a:function(){
    showZone('OVERGROWN RUINS');
    spawnRaptorPack(-16,140,3,true);
    showTut('A WEAPON CACHE LIES SOMEWHERE IN THESE RUINS');
  }});
  triggers.push({done:false,f:function(){return player.pos.z<100&&Math.abs(player.pos.x-6)<26;},a:function(){
    spawnRaptorPack(7,79,4,true);
  }});
  triggers.push({done:false,f:function(){return player.pos.z<16;},a:function(){
    showZone('RIVER CROSSING');
    showTut('DILOPHOSAUR TERRITORY — CROSS AT THE BROKEN BRIDGE');
  }});
  triggers.push({done:false,f:function(){return player.pos.z<-72;},a:function(){
    showZone('RADIO TOWER RIDGE');
  }});
  triggers.push({done:false,f:function(){return player.pos.z<-146;},a:function(){
    showZone('THE GAUNTLET');
    if(trexRef)activateTrex(trexRef);
  }});
  triggers.push({done:false,f:function(){return player.pos.z<-227&&Math.abs(player.pos.x)<7;},a:function(){
    winGame();
  }});
}
function updateTriggers(){
  for(let i=0;i<triggers.length;i++){
    const t=triggers[i];
    if(!t.done&&t.f()){t.done=true;t.a();}
  }
  if(G.objIdx===1&&d2(player.pos.x,player.pos.z,-6,-108)<196)advanceObjective();
}
function nearConsole(){return d2(player.pos.x,player.pos.z,-3.4,-105.6)<12.25;}
function tryInteract(){
  if(G.state==='PLAYING'&&G.objIdx===2&&nearConsole())beaconActivate();
}
function beaconActivate(){
  if(G.beacon)return;
  G.beacon=true;
  sfxBeacon();
  if(beaconBeam)beaconBeam.visible=true;
  if(beaconLight)beaconLight.intensity=2;
  advanceObjective();
  G.waveOn=true;G.waveT=0;G.waveSpawnT=1;G.waveDilo=false;
  showTut('SIGNAL ACTIVE — THEY HEARD IT. HOLD YOUR GROUND.');
  roarSfx(0.35,64,1.4);
}
/* ============================== WORLD FX / WAVE ============================== */
function forwardAng(){return Math.atan2(-Math.sin(player.yaw),-Math.cos(player.yaw));}
function updateWorldFx(dt){
  G.shake=Math.max(0,G.shake-dt*1.7);
  sun.position.set(player.pos.x-60,55,player.pos.z-25);
  sun.target.position.set(player.pos.x,0,player.pos.z);
  if(G.beacon){
    if(beaconLight)beaconLight.intensity=1.6+Math.sin(G.time*5)*0.7;
    if(beaconBeam)beaconBeam.material.opacity=0.16+Math.sin(G.time*5)*0.07;
    G.beepT-=dt;
    if(G.beepT<=0){G.beepT=1.4;sfxBeep();}
  }
  if(objBeam&&objBeam.visible)objBeam.material.opacity=0.13+Math.sin(G.time*2.4)*0.05;
  G.nextRoar-=dt;
  if(G.nextRoar<=0){
    G.nextRoar=rand(12,26);
    roarSfx(rand(0.06,0.13),rand(45,75),rand(1,1.7));
  }
  if(player.hp<25&&player.hp>0){
    G.heartT-=dt;
    if(G.heartT<=0){G.heartT=0.8+player.hp/25*0.55;sfxHeart();}
  }
  for(let i=0;i<turrets.length;i++)turrets[i].rotation.y=Math.sin(G.time*0.35+i*2.4)*0.7;
  if(G.waveOn){
    G.waveT+=dt;G.waveSpawnT-=dt;
    if(G.waveSpawnT<=0&&G.waveT<38){
      G.waveSpawnT=6;
      for(let k=0;k<3;k++){
        if(aliveCount()>=12)break;
        const a=rand(0,TAU),r=rand(20,30);
        spawnEnemy('raptor',-6+Math.sin(a)*r,-108+Math.cos(a)*r,{aggro:true});
      }
      if(G.waveT>8&&!G.waveDilo&&aliveCount()<12){
        G.waveDilo=true;
        spawnEnemy('dilo',-6+rand(-26,26),-108+rand(16,26),{aggro:true});
      }
    }
    if(G.waveT>=40){
      G.waveOn=false;
      advanceObjective();
      showTut('THE SIGNAL FADES — HAVEN LIES NORTH, THROUGH THE CANYON');
    }
  }
}
/* ============================== HUD ============================== */
function cacheDom(){
  ['o-start','o-pause','o-dead','o-win','hud','btnLvl1','btnLvl2','btnLvl3','btnResume','btnRestartP','btnRestartD','btnRestartW',
   'btnMenuP','btnMenuD','btnMenuW','startTiny','deadTitle','winTitle','winSub',
   'l2hud','l2obj','l2kills','l2warn','l2tut','l2dmg','l2hullIn','l2heatIn',
   'l3hud','l3obj','l3kills','l3sheep','l3ammo','l3res','l3warn','l3tut','l3dmg','l3scope','l3cross',
   'compass','objText','objDist','boss','bossIn','zoneTitle','tut','interact','ch','chT','chB','chL','chR','hitm','scope',
   'vig','avig','dmgArc','hpIn','stIn','ammoBig','ammoRes','wname','kills','deadStats','winStats','flnote']
  .forEach(function(id){E[id.replace(/-/g,'_')]=document.getElementById(id);});
  E.cctx=E.compass?E.compass.getContext('2d'):null;
  E.hitmI=E.hitm?E.hitm.querySelectorAll('i'):[];
}
function show(el){if(el)el.classList.remove('hidden');}
function hide(el){if(el)el.classList.add('hidden');}
function fmtTime(s){
  const m=Math.floor(s/60),ss=Math.floor(s%60);
  return m+':'+(ss<10?'0':'')+ss;
}
function drawCompass(){
  const ctx=E.cctx;
  if(!ctx)return;
  const W=480,H=46;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(8,12,5,0.45)';
  ctx.fillRect(0,10,W,26);
  const aF=forwardAng();
  ctx.fillStyle='#7d8a62';
  for(let a=-180;a<180;a+=15){
    const rel=wrapAng(a*Math.PI/180-aF);
    if(Math.abs(rel)>1.34)continue;
    const x=W/2+rel*183;
    ctx.fillRect(x-0.5,27,1,6);
  }
  ctx.textAlign='center';
  ctx.font='bold 13px Consolas,monospace';
  const cards=[['N',Math.PI],['E',Math.PI/2],['S',0],['W',-Math.PI/2]];
  for(let i=0;i<cards.length;i++){
    const rel=wrapAng(cards[i][1]-aF);
    if(Math.abs(rel)>1.3)continue;
    ctx.fillStyle=cards[i][0]==='N'?'#e8dca2':'#9aa67a';
    ctx.fillText(cards[i][0],W/2+rel*183,23);
  }
  const o=OBJS[G.objIdx];
  if(o){
    let rel=wrapAng(Math.atan2(o.x-player.pos.x,o.z-player.pos.z)-aF);
    const pinned=Math.abs(rel)>1.3;
    rel=clamp(rel,-1.3,1.3);
    const x=W/2+rel*183;
    ctx.fillStyle=pinned?'rgba(255,215,106,0.5)':'#ffd76a';
    ctx.beginPath();
    ctx.moveTo(x,13);ctx.lineTo(x+5.5,20.5);ctx.lineTo(x,28);ctx.lineTo(x-5.5,20.5);
    ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='#e9e6cb';
  ctx.fillRect(W/2-1,5,2,7);
}
function updateHUD(dt){
  E.hpIn.style.width=clamp(player.hp,0,100)+'%';
  E.hpIn.style.background=player.hp<25?'linear-gradient(90deg,#8a1c12,#e0463a)':'linear-gradient(90deg,#5f8a36,#a6c75f)';
  E.stIn.style.width=clamp(player.stam,0,100)+'%';
  const w=WPN[player.weapon];
  if(!w){
    E.ammoBig.textContent='--';
    E.ammoRes.textContent='SCAVENGE A WEAPON';
    E.wname.textContent='';
  }else{
    E.ammoBig.textContent=w.mag;
    E.ammoRes.textContent=reloadT>0?'RELOADING':('/ '+w.res);
    E.wname.textContent=w.label;
  }
  E.kills.textContent=G.kills;
  const moveSpread=player.curSpeed/8.4*0.02;
  const sp=(w?w.spread+bloom+moveSpread:0.012);
  const px=8+sp*620;
  E.chT.style.transform='translate(-1px,'+(-px-9)+'px)';
  E.chB.style.transform='translate(-1px,'+px+'px)';
  E.chL.style.transform='translate('+(-px-9)+'px,-1px)';
  E.chR.style.transform='translate('+px+'px,-1px)';
  if(G.hitT>0){
    G.hitT-=dt;
    E.hitm.style.opacity=Math.max(0,G.hitT/0.16);
    const c=G.hitKill?'#ff4f3a':'#fff';
    for(let i=0;i<E.hitmI.length;i++)E.hitmI[i].style.background=c;
  }else E.hitm.style.opacity=0;
  G.vigT=Math.max(0,G.vigT-dt*1.5);
  let vbase=0;
  if(player.hp<25&&player.hp>0)vbase=0.2+Math.sin(G.time*5.5)*0.07;
  E.vig.style.opacity=clamp(G.vigT*0.85+vbase,0,0.95);
  G.avigT=Math.max(0,G.avigT-dt*1.6);
  E.avig.style.opacity=clamp(G.avigT*0.7,0,0.7);
  if(G.dmgArcT>0){
    G.dmgArcT-=dt;
    const rel=wrapAng(G.dmgWorldAng-forwardAng());
    E.dmgArc.style.opacity=Math.max(0,G.dmgArcT);
    E.dmgArc.style.transform='translate(-50%,-50%) rotate('+(rel*57.2958)+'deg)';
  }else E.dmgArc.style.opacity=0;
  if(trexRef&&trexRef.activated&&trexRef.state!=='DEAD'){
    show(E.boss);
    E.bossIn.style.width=clamp(trexRef.hp/trexRef.maxHp*100,0,100)+'%';
  }else hide(E.boss);
  E.interact.textContent=(G.objIdx===2&&nearConsole())?'PRESS  E  —  ACTIVATE BEACON':'';
  G.tutT=Math.max(0,G.tutT-dt);
  E.tut.style.opacity=clamp(G.tutT,0,1);
  G.zoneT=Math.max(0,G.zoneT-dt);
  E.zoneTitle.style.opacity=clamp(G.zoneT,0,1);
  const o=OBJS[G.objIdx];
  if(o){
    if(G.objShown!==o.t){G.objShown=o.t;E.objText.textContent=o.t;}
    if(G.objIdx===3&&G.waveOn)E.objDist.textContent='SURVIVE — '+Math.max(0,Math.ceil(40-G.waveT))+'s';
    else E.objDist.textContent=Math.round(Math.sqrt(d2(o.x,o.z,player.pos.x,player.pos.z)))+' m';
  }else{E.objText.textContent='';E.objDist.textContent='';}
  E.flnote.textContent=G.fallback?'POINTER LOCK UNAVAILABLE — WINDOWED MOUSE LOOK':'';
  drawCompass();
}
/* ============================== GAME STATE ============================== */
function lockPointer(){
  if(cv.requestPointerLock){
    try{cv.requestPointerLock();}catch(e){G.fallback=true;}
  }else G.fallback=true;
}
function beginPlay(){
  initAudio();
  hide(E.o_start);hide(E.o_pause);hide(E.o_dead);hide(E.o_win);
  show(E.hud);
  G.state='PLAYING';
  lockPointer();
}
function pauseGame(){
  if(G.state!=='PLAYING')return;
  G.state='PAUSED';
  dropAim();
  show(E.o_pause);
  if(AC&&AC.suspend)AC.suspend();
}
function resumeGame(){
  if(G.state!=='PAUSED')return;
  hide(E.o_pause);
  G.state='PLAYING';
  if(AC&&AC.resume)AC.resume();
  lockPointer();
}
function killPlayer(){
  if(G.state!=='PLAYING')return;
  G.state='DEAD';
  dropAim();
  if(E.deadTitle)E.deadTitle.textContent='THE JUNGLE RECLAIMS YOU';
  E.deadStats.textContent='SURVIVED '+fmtTime(G.time)+'  —  '+G.kills+' KILLS';
  show(E.o_dead);
  roarSfx(0.5,48,1.6);
  if(document.exitPointerLock&&document.pointerLockElement)document.exitPointerLock();
}
function winGame(){
  if(G.state!=='PLAYING')return;
  G.state='WON';
  dropAim();
  const acc=G.shots>0?Math.round(G.hits/G.shots*100):0;
  if(E.winTitle)E.winTitle.textContent='HAVEN';
  if(E.winSub)E.winSub.textContent='Last sanctuary — the gates close behind you';
  E.winStats.innerHTML='TIME &nbsp;<b>'+fmtTime(G.time)+'</b><br>KILLS &nbsp;<b>'+G.kills+
    '</b><br>ACCURACY &nbsp;<b>'+acc+'%</b><br><span style="color:#8fb558">MISSION II — AIR CAVALRY — UNLOCKED</span>';
  show(E.o_win);
  sfxSting();
  markComplete(1);
  if(document.exitPointerLock&&document.pointerLockElement)document.exitPointerLock();
}
function spawnInitial(){
  spawnRaptorPack(-14,186,2,false);
  spawnEnemy('dilo',-14,8);
  spawnEnemy('dilo',20,-5);
  spawnEnemy('dilo',-2,14);
  spawnEnemy('ptera',-6,-10);
  spawnEnemy('ptera',10,-58);
  trexRef=spawnEnemy('trex',0,-176);
}
function initDynamic(){
  for(let i=0;i<PICKUP_DEFS.length;i++)addPickup(PICKUP_DEFS[i].t,PICKUP_DEFS[i].x,PICKUP_DEFS[i].z);
  spawnInitial();
  makeTriggers();
  tutQueue=[{t:0.8,s:'WASD — MOVE      MOUSE — LOOK'},
    {t:5,s:'SHIFT — SPRINT      SPACE — JUMP'},
    {t:9.5,s:'FOLLOW THE COMPASS MARKER NORTH'}];
}
function resetGame(){
  initAudio();
  for(let i=0;i<enemies.length;i++)scene.remove(enemies[i].group);
  enemies.length=0;
  for(let i=0;i<acids.length;i++)scene.remove(acids[i].mesh);
  acids.length=0;
  for(let i=0;i<pickups.length;i++)scene.remove(pickups[i].mesh);
  pickups.length=0;
  triggers.length=0;
  trexRef=null;
  player.pos.set(0,groundHeight(0,228),228);
  player.vel.set(0,0,0);player.kvel.set(0,0,0);
  player.yaw=0;player.pitch=0;
  player.hp=100;player.stam=100;player.stamCd=0;
  player.grounded=true;player.invuln=0;player.stagger=0;player.recoil=0;
  player.bobT=0;player.stepT=0;player.curSpeed=0;
  player.weapon='none';player.has.rifle=false;player.has.shot=false;player.has.snip=false;
  WPN.rifle.mag=30;WPN.rifle.res=90;
  WPN.shot.mag=6;WPN.shot.res=18;
  WPN.snip.mag=5;WPN.snip.res=10;
  fireCd=0;reloadT=0;bloom=0;gunKick=0;switchDip=0;
  dropAim();
  G.time=0;G.kills=0;G.shots=0;G.hits=0;G.shake=0;
  G.waveOn=false;G.waveT=0;G.waveSpawnT=0;G.waveDilo=false;
  G.beacon=false;G.beepT=0;G.nextRoar=11;G.heartT=0;
  G.vigT=0;G.avigT=0;G.dmgArcT=0;G.hitT=0;G.mouseDown=false;
  G.tutT=0;G.zoneT=0;G.objShown='';
  if(beaconBeam)beaconBeam.visible=false;
  if(beaconLight)beaconLight.intensity=0;
  if(E.tut)E.tut.textContent='';
  if(E.zoneTitle)E.zoneTitle.textContent='';
  initDynamic();
  setObjective(0);
  hide(E.o_pause);hide(E.o_dead);hide(E.o_win);
  show(E.hud);
  G.state='PLAYING';
  if(AC&&AC.resume)AC.resume();
  lockPointer();
}
/* ============================== INPUT ============================== */
function applyLook(mx,my){
  const sens=0.0021*(1-aimT*(1-SCOPE_FOV/BASE_FOV));
  player.yaw-=mx*sens;
  player.pitch=clamp(player.pitch-my*sens,-1.45,1.45);
}
function playLevel1(){
  G.level=1;
  hide(E.o_start);hide(E.l2hud);
  resetGame();
}
function restartCurrent(){
  if(G.level===2)startLevel2();
  else if(G.level===3)startLevel3();
  else resetGame();
}
function returnToMenu(){
  G.state='MENU';G.level=1;
  if(document.exitPointerLock&&document.pointerLockElement)document.exitPointerLock();
  hide(E.o_pause);hide(E.o_dead);hide(E.o_win);hide(E.hud);hide(E.l2hud);hide(E.l3hud);
  show(E.o_start);
  refreshMenu();
  camera.position.set(8,5,246);camera.lookAt(0,6,208);
}
function bindEvents(){
  window.addEventListener('keydown',function(e){
    if(e.code==='Space')e.preventDefault();
    keys[e.code]=true;
    if(e.code==='KeyP'){
      if(G.state==='PLAYING')pauseGame();
      else if(G.state==='PAUSED')resumeGame();
      return;
    }
    if(G.level===3){
      if(e.code==='KeyR'&&G.state==='PLAYING')l3Reload();
      return;
    }
    if(G.level===2)return;
    if(e.code==='KeyR'&&G.state==='PLAYING')startReload();
    else if(e.code==='Digit1')switchWeapon('rifle');
    else if(e.code==='Digit2')switchWeapon('shot');
    else if(e.code==='Digit3')switchWeapon('snip');
    else if(e.code==='KeyE')tryInteract();
  });
  window.addEventListener('keyup',function(e){keys[e.code]=false;});
  window.addEventListener('mousedown',function(e){
    if(G.state!=='PLAYING')return;
    if(e.target&&e.target.tagName==='BUTTON')return;
    if(G.level===2){
      if(e.button!==0)return;
      G.mouseDown=true;
      if(!document.pointerLockElement&&!G.fallback)lockPointer();
      return;
    }
    if(G.level===3){
      if(e.button===2){L3.aiming=true;return;}
      if(e.button!==0)return;
      G.mouseDown=true;
      if(!document.pointerLockElement&&!G.fallback){lockPointer();return;}
      l3Fire();
      return;
    }
    if(e.button===2){if(player.weapon==='snip')aiming=true;return;}
    if(e.button!==0)return;
    G.mouseDown=true;
    if(!document.pointerLockElement&&!G.fallback){lockPointer();return;}
    const w=WPN[player.weapon];
    if(w&&!w.auto)fireWeapon();
  });
  window.addEventListener('mouseup',function(e){
    if(G.level===3){if(e.button===2)L3.aiming=false;if(e.button===0)G.mouseDown=false;return;}
    if(e.button===2){aiming=false;return;}
    G.mouseDown=false;
  });
  window.addEventListener('mousemove',function(e){
    if(G.state!=='PLAYING')return;
    if(document.pointerLockElement===cv||G.fallback){
      if(G.level===2)l2Look(e.movementX||0,e.movementY||0);
      else if(G.level===3)l3Look(e.movementX||0,e.movementY||0);
      else applyLook(e.movementX||0,e.movementY||0);
    }
  });
  document.addEventListener('pointerlockchange',function(){
    if(!document.pointerLockElement&&G.state==='PLAYING')pauseGame();
  });
  document.addEventListener('pointerlockerror',function(){G.fallback=true;});
  window.addEventListener('contextmenu',function(e){e.preventDefault();});
  E.btnLvl1.addEventListener('click',playLevel1);
  E.btnLvl2.addEventListener('click',function(){if(levelUnlocked(2))startLevel2();});
  E.btnLvl3.addEventListener('click',function(){if(levelUnlocked(3))startLevel3();});
  E.btnResume.addEventListener('click',resumeGame);
  E.btnRestartP.addEventListener('click',restartCurrent);
  E.btnRestartD.addEventListener('click',restartCurrent);
  E.btnRestartW.addEventListener('click',restartCurrent);
  E.btnMenuP.addEventListener('click',returnToMenu);
  E.btnMenuD.addEventListener('click',returnToMenu);
  E.btnMenuW.addEventListener('click',returnToMenu);
}
/* ============================== MAIN LOOP ============================== */
function update(dt){
  G.time+=dt;
  while(tutQueue.length&&G.time>tutQueue[0].t){
    showTut(tutQueue[0].s);
    tutQueue.shift();
  }
  updatePlayer(dt);
  updateWeapon(dt);
  updateEnemies(dt);
  updateAcids(dt);
  updatePickups(dt);
  updateTriggers();
  updateWorldFx(dt);
  updateTracers(dt);
  updateParticles(dt);
  updateSpores(dt);
  updateHUD(dt);
}
let lastT=0;
function animate(now){
  requestAnimationFrame(animate);
  now=now||0;
  const dt=clamp((now-lastT)/1000,0.001,0.05);
  lastT=now;
  if(G.state==='PLAYING'){
    if(G.level===2)updateLevel2(dt);
    else if(G.level===3)updateLevel3(dt);
    else update(dt);
  }
  else if(G.state==='MENU'){
    const t=now*0.0001;
    camera.position.set(8+Math.sin(t)*3,5,246);
    camera.lookAt(0,6,208);
  }
  if(G.state!=='MENU'&&G.level===2)renderer.render(scene2,camera2);
  else if(G.state!=='MENU'&&G.level===3)renderer.render(scene3,camera3);
  else renderer.render(scene,camera);
}
