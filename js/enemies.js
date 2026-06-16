'use strict';
/* ============================== ENEMY BUILDS ============================== */
function buildRaptor(e){
  const g=new THREE.Group();
  const bm=matStd(0x6f6b35,0.95),belly=matStd(0x97905c,0.95);
  e.bodyMats=[bm,belly];
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.5,9,7),bm);
  body.scale.set(0.8,0.8,1.6);body.position.y=0.95;body.castShadow=true;g.add(body);
  const chest=new THREE.Mesh(new THREE.SphereGeometry(0.34,8,6),belly);
  chest.position.set(0,0.85,0.45);g.add(chest);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.18,0.5,7),bm);
  neck.position.set(0,1.25,0.75);neck.rotation.x=0.7;g.add(neck);
  e.head=new THREE.Group();e.head.position.set(0,1.45,0.95);
  const skull=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.22,0.5),bm);
  skull.position.z=0.15;skull.castShadow=true;e.head.add(skull);
  e.jaw=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.08,0.4),belly);
  e.jaw.position.set(0,-0.13,0.18);e.head.add(e.jaw);
  const em=new THREE.MeshStandardMaterial({color:0x221,emissive:0xc8a630,emissiveIntensity:1,roughness:0.4});
  for(const sx of [-0.12,0.12]){
    const eye=new THREE.Mesh(new THREE.SphereGeometry(0.035,5,4),em);
    eye.position.set(sx,0.04,0.18);e.head.add(eye);
  }
  g.add(e.head);
  e.tail=new THREE.Mesh(new THREE.ConeGeometry(0.21,1.6,7),bm);
  e.tail.rotation.x=-Math.PI/2;
  e.tail.position.set(0,0.95,-1.15);
  g.add(e.tail);
  e.legL=new THREE.Group();e.legL.position.set(0.23,0.85,-0.1);
  e.legR=new THREE.Group();e.legR.position.set(-0.23,0.85,-0.1);
  [e.legL,e.legR].forEach(function(leg){
    const thigh=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.08,0.55,6),bm);
    thigh.position.y=-0.27;leg.add(thigh);
    const shin=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.05,0.5,5),bm);
    shin.position.set(0,-0.62,0.06);shin.rotation.x=0.25;leg.add(shin);
    const foot=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.06,0.3),belly);
    foot.position.set(0,-0.9,0.12);leg.add(foot);
    g.add(leg);
  });
  for(const sx of [0.14,-0.14]){
    const arm=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.28,0.06),bm);
    arm.position.set(sx,0.78,0.5);arm.rotation.x=0.6;g.add(arm);
  }
  return g;
}
function buildDilo(e){
  const g=buildRaptor(e);
  g.scale.setScalar(1.18);
  e.bodyMats[0].color.setHex(0x3f7a5e);
  e.bodyMats[1].color.setHex(0x86a06a);
  const fm=new THREE.MeshStandardMaterial({color:0xc96a2a,roughness:0.85,side:THREE.DoubleSide});
  e.frillL=new THREE.Mesh(new THREE.CircleGeometry(0.32,8),fm);
  e.frillL.position.set(0.1,0,0.05);e.frillL.rotation.y=1.25;
  e.head.add(e.frillL);
  e.frillR=new THREE.Mesh(new THREE.CircleGeometry(0.32,8),fm);
  e.frillR.position.set(-0.1,0,0.05);e.frillR.rotation.y=-1.25;
  e.head.add(e.frillR);
  for(const sz of [0.02,-0.1]){
    const crest=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.16,4),fm);
    crest.position.set(0,0.15,sz);e.head.add(crest);
  }
  return g;
}
function buildPtera(e){
  const g=new THREE.Group();
  const bm=matStd(0xb59a6a,0.9),wm=matStd(0x7a5a3a,0.9,0,{side:THREE.DoubleSide});
  e.bodyMats=[bm,wm];
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.45,8,6),bm);
  body.scale.set(0.55,0.45,1.1);body.castShadow=true;g.add(body);
  e.head=new THREE.Group();e.head.position.set(0,0.12,0.5);
  const beak=new THREE.Mesh(new THREE.ConeGeometry(0.09,0.7,5),bm);
  beak.rotation.x=Math.PI/2;beak.position.z=0.4;e.head.add(beak);
  const crest=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.45,4),bm);
  crest.rotation.x=-Math.PI/2-0.5;crest.position.set(0,0.1,-0.05);e.head.add(crest);
  g.add(e.head);
  e.wingL=new THREE.Group();e.wingL.position.set(0.2,0.06,0);
  e.wingR=new THREE.Group();e.wingR.position.set(-0.2,0.06,0);
  const wgeo=new THREE.BoxGeometry(2.2,0.04,0.85);
  const wl=new THREE.Mesh(wgeo,wm);wl.position.x=1.1;e.wingL.add(wl);
  const wr=new THREE.Mesh(wgeo,wm);wr.position.x=-1.1;e.wingR.add(wr);
  g.add(e.wingL);g.add(e.wingR);
  for(const sx of [0.1,-0.1]){
    const lg=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.025,0.4,4),bm);
    lg.position.set(sx,-0.18,-0.3);lg.rotation.x=0.5;g.add(lg);
  }
  return g;
}
function buildTrex(e){
  const g=new THREE.Group();
  const bm=matStd(0x4c5a38,0.95),belly=matStd(0x8a8a66,0.95);
  e.bodyMats=[bm,belly];
  const hips=new THREE.Mesh(new THREE.SphereGeometry(1.5,10,8),bm);
  hips.scale.set(1,1.15,1.4);hips.position.y=3.1;hips.castShadow=true;g.add(hips);
  const chest=new THREE.Mesh(new THREE.SphereGeometry(1.25,10,8),bm);
  chest.position.set(0,3.55,1.35);chest.castShadow=true;g.add(chest);
  const bel=new THREE.Mesh(new THREE.SphereGeometry(1.05,8,7),belly);
  bel.scale.set(0.85,0.9,1.3);bel.position.set(0,2.75,0.7);g.add(bel);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.75,1.4,8),bm);
  neck.position.set(0,4.35,2.35);neck.rotation.x=0.8;g.add(neck);
  e.head=new THREE.Group();e.head.position.set(0,4.85,3.1);
  const skull=new THREE.Mesh(new THREE.BoxGeometry(1.05,0.95,1.8),bm);
  skull.position.z=0.5;skull.castShadow=true;e.head.add(skull);
  const brow=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.3,0.5),bm);
  brow.position.set(0,0.5,0.25);e.head.add(brow);
  e.jawG=new THREE.Group();e.jawG.position.set(0,-0.42,0.1);
  e.jaw=new THREE.Mesh(new THREE.BoxGeometry(0.85,0.38,1.6),belly);
  e.jaw.position.z=0.7;e.jawG.add(e.jaw);
  e.head.add(e.jawG);
  const tm=matStd(0xe6e2d2,0.6);
  for(let i=0;i<5;i++){
    const tooth=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.2,4),tm);
    tooth.rotation.x=Math.PI;
    tooth.position.set(-0.32+i*0.16,-0.42,1.25);
    e.head.add(tooth);
  }
  const em=new THREE.MeshStandardMaterial({color:0x111,emissive:0xd8a020,emissiveIntensity:1.2,roughness:0.3});
  for(const sx of [-0.45,0.45]){
    const eye=new THREE.Mesh(new THREE.SphereGeometry(0.09,6,5),em);
    eye.position.set(sx,0.18,0.75);e.head.add(eye);
  }
  g.add(e.head);
  const t1=new THREE.Mesh(new THREE.ConeGeometry(0.95,2.6,8),bm);
  t1.rotation.x=-Math.PI/2;t1.position.set(0,3.1,-2.3);g.add(t1);
  const t2=new THREE.Mesh(new THREE.ConeGeometry(0.62,2.4,7),bm);
  t2.rotation.x=-Math.PI/2+0.12;t2.position.set(0,2.95,-4.35);g.add(t2);
  const t3=new THREE.Mesh(new THREE.ConeGeometry(0.34,2.1,6),bm);
  t3.rotation.x=-Math.PI/2+0.22;t3.position.set(0,2.7,-6.15);g.add(t3);
  e.legL=new THREE.Group();e.legL.position.set(1,3,-0.35);
  e.legR=new THREE.Group();e.legR.position.set(-1,3,-0.35);
  [e.legL,e.legR].forEach(function(leg){
    const thigh=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.42,2,8),bm);
    thigh.position.y=-0.95;thigh.castShadow=true;leg.add(thigh);
    const shin=new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.3,1.7,7),bm);
    shin.position.set(0,-2.05,0.28);shin.rotation.x=0.3;leg.add(shin);
    const foot=new THREE.Mesh(new THREE.BoxGeometry(0.85,0.4,1.45),belly);
    foot.position.set(0,-2.95,0.35);foot.castShadow=true;leg.add(foot);
    for(let i=0;i<3;i++){
      const toe=new THREE.Mesh(new THREE.ConeGeometry(0.09,0.3,4),tm);
      toe.rotation.x=Math.PI/2;
      toe.position.set(-0.26+i*0.26,-3.05,1.1);
      leg.add(toe);
    }
    g.add(leg);
  });
  for(const sx of [0.7,-0.7]){
    const arm=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.7,0.18),bm);
    arm.position.set(sx,3.4,2.1);arm.rotation.x=0.7;g.add(arm);
  }
  return g;
}
/* ============================== ENEMY CORE ============================== */
function aliveCount(){
  let n=0;
  for(let i=0;i<enemies.length;i++)if(enemies[i].state!=='DEAD')n++;
  return n;
}
function spawnEnemy(type,x,z,opts){
  opts=opts||{};
  const e={type:type,pos:new THREE.Vector3(x,0,z),yaw:rand(0,TAU),t:0,animT:rand(0,9),
    moving:0,senseT:rand(0,0.25),seen:false,atkCd:0,flash:0,deadT:0,deadDir:Math.random()<0.5?1:-1,
    home:{x:x,z:z},wanderX:x,wanderZ:z,alertX:x,alertZ:z,alertT:0};
  if(type==='raptor'){
    e.hp=40;e.r=0.5;e.hitY=1;e.hitR=0.95;e.sightR=34;e.sightC=0.8;e.hearR=55;
    e.state=opts.aggro?'CHASE':'PATROL';
    e.group=buildRaptor(e);
  }else if(type==='dilo'){
    e.hp=60;e.r=0.6;e.hitY=1.2;e.hitR=1.05;e.sightR=38;e.sightC=0.85;e.hearR=50;
    e.spitCd=rand(1,2.5);
    e.state=opts.aggro?'CHASE':'PATROL';
    e.group=buildDilo(e);
  }else if(type==='ptera'){
    e.hp=30;e.r=0.5;e.hitY=0;e.hitR=1;e.hearR=60;
    e.flying=true;e.state='CIRCLE';
    e.cAng=rand(0,TAU);e.cDir=Math.random()<0.5?1:-1;e.cR=rand(13,19);
    e.anchor=new THREE.Vector3(x,0,z);
    e.diveCd=rand(3,6);
    e.pos.y=groundHeight(x,z)+16;
    e.group=buildPtera(e);
  }else{
    e.hp=500;e.maxHp=500;e.r=2.2;e.hitY=3.4;e.hitR=3.3;e.hearR=70;
    e.state='DORMANT';e.activated=false;
    e.roarCd=6;e.chargeCd=4;e.biteCd=0;e.stepPrev=0;
    e.group=buildTrex(e);
  }
  if(!e.flying)e.pos.y=groundHeight(x,z);
  e.group.position.copy(e.pos);
  e.group.rotation.y=e.yaw;
  scene.add(e.group);
  enemies.push(e);
  return e;
}
function spawnRaptorPack(x,z,n,aggro){
  for(let i=0;i<n;i++){
    if(aliveCount()>=12)break;
    const a=rand(0,TAU),r=rand(2,6);
    spawnEnemy('raptor',x+Math.sin(a)*r,z+Math.cos(a)*r,{aggro:aggro});
  }
}
function canSee(e){
  const dx=player.pos.x-e.pos.x,dz=player.pos.z-e.pos.z;
  const dd=dx*dx+dz*dz;
  if(dd>e.sightR*e.sightR)return false;
  const ang=Math.atan2(dx,dz);
  if(Math.abs(wrapAng(ang-e.yaw))>e.sightC)return false;
  _v1.set(e.pos.x,e.pos.y+e.hitY,e.pos.z);
  _v2.set(player.pos.x,player.pos.y+1.3,player.pos.z);
  _v3.subVectors(_v2,_v1);
  const dist=_v3.length();
  _v3.normalize();
  _ray.origin.copy(_v1);_ray.direction.copy(_v3);
  for(let i=0;i<obsB.length;i++){
    const b=obsB[i];
    if(!b.box3)continue;
    const hp=_ray.intersectBox(b.box3,_v4);
    if(hp&&hp.distanceTo(_v1)<dist-0.5)return false;
  }
  return true;
}
function hearGun(){
  for(let i=0;i<enemies.length;i++){
    const e=enemies[i];
    if(e.state==='DEAD')continue;
    const dd=d2(e.pos.x,e.pos.z,player.pos.x,player.pos.z);
    if(dd>e.hearR*e.hearR)continue;
    if(e.type==='trex'){
      if(!e.activated&&dd<45*45)activateTrex(e);
      continue;
    }
    if(e.state==='PATROL'||e.state==='CIRCLE'){
      if(e.type==='ptera'){e.diveCd=Math.min(e.diveCd,1.5);continue;}
      e.state='ALERT';
      e.alertX=player.pos.x;e.alertZ=player.pos.z;e.alertT=0;
    }else if(e.state==='ALERT'){
      e.alertX=player.pos.x;e.alertZ=player.pos.z;
    }
  }
}
function damageEnemy(e,d){
  if(e.state==='DEAD')return;
  e.hp-=d;
  e.flash=0.12;
  for(let i=0;i<e.bodyMats.length;i++)e.bodyMats[i].emissive.setHex(0x7a1410);
  if(e.type==='trex'){
    if(!e.activated)activateTrex(e);
  }else if(e.state==='PATROL'||e.state==='ALERT'){
    e.state='CHASE';
    growlSfx(distGain(e.pos,60,0.5));
  }
  if(e.hp<=0)dieEnemy(e);
}
function dieEnemy(e){
  e.state='DEAD';e.deadT=0;
  G.kills++;G.killFlag=true;
  if(e.type==='trex'){
    roarSfx(distGain(e.pos,120,0.9),52,2);
  }else{
    growlSfx(distGain(e.pos,60,0.45));
  }
  burst(_v1.set(e.pos.x,e.pos.y+e.hitY,e.pos.z),10,0x8a1f14,3,1.2,0.5);
}
function moveEnemy(e,tx,tz,speed,dt){
  const ang=Math.atan2(tx-e.pos.x,tz-e.pos.z);
  e.yaw+=wrapAng(ang-e.yaw)*Math.min(1,dt*6);
  e.pos.x+=Math.sin(e.yaw)*speed*dt;
  e.pos.z+=Math.cos(e.yaw)*speed*dt;
  collideXZ(e,e.r);
  e.pos.y=groundHeight(e.pos.x,e.pos.z);
  e.moving=speed;
}
function faceTarget(e,tx,tz,dt){
  const ang=Math.atan2(tx-e.pos.x,tz-e.pos.z);
  e.yaw+=wrapAng(ang-e.yaw)*Math.min(1,dt*5);
}
/* ============================== ENEMY AI ============================== */
function pDist(e){return Math.sqrt(d2(e.pos.x,e.pos.z,player.pos.x,player.pos.z));}
function updRaptor(e,dt){
  e.atkCd-=dt;
  const d=pDist(e);
  switch(e.state){
    case 'PATROL':{
      if(d2(e.pos.x,e.pos.z,e.wanderX,e.wanderZ)<2||e.t<=0){
        const a=rand(0,TAU),r=rand(4,16);
        e.wanderX=e.home.x+Math.sin(a)*r;
        e.wanderZ=e.home.z+Math.cos(a)*r;
        e.t=rand(3,7);
      }
      e.t-=dt;
      moveEnemy(e,e.wanderX,e.wanderZ,2.2,dt);
      if(e.seen){e.state='CHASE';growlSfx(distGain(e.pos,55,0.5));}
      break;}
    case 'ALERT':{
      moveEnemy(e,e.alertX,e.alertZ,4.5,dt);
      if(d2(e.pos.x,e.pos.z,e.alertX,e.alertZ)<3){
        e.alertT+=dt;e.moving=0;
        if(e.alertT>2.4)e.state='PATROL';
      }
      if(e.seen){e.state='CHASE';growlSfx(distGain(e.pos,55,0.5));}
      break;}
    case 'CHASE':{
      if(d>55){e.state='ALERT';e.alertX=player.pos.x;e.alertZ=player.pos.z;e.alertT=0;break;}
      moveEnemy(e,player.pos.x,player.pos.z,7.6,dt);
      if(d<3.6&&e.atkCd<=0){e.state='ATTACK';e.t=0;e.didHit=false;}
      break;}
    case 'ATTACK':{
      e.t+=dt;e.moving=0;
      if(e.t<0.32){
        faceTarget(e,player.pos.x,player.pos.z,dt*2);
        e.group.scale.y=1-e.t*0.45;
        if(e.t+dt>=0.32){
          _v1.set(player.pos.x-e.pos.x,0,player.pos.z-e.pos.z).normalize();
          e.lockX=_v1.x;e.lockZ=_v1.z;
        }
      }else if(e.t<0.7){
        e.group.scale.y=Math.min(1,e.group.scale.y+dt*3);
        e.pos.x+=e.lockX*11*dt;
        e.pos.z+=e.lockZ*11*dt;
        collideXZ(e,e.r);
        e.pos.y=groundHeight(e.pos.x,e.pos.z);
        if(!e.didHit&&pDist(e)<2&&Math.abs(player.pos.y-e.pos.y)<2.2){
          e.didHit=true;
          playerDamage(12,e.pos,4);
        }
      }else if(e.t>1.05){
        e.group.scale.y=1;
        e.state='CHASE';e.atkCd=1.1;
      }
      break;}
  }
}
function updDilo(e,dt){
  e.spitCd-=dt;
  const d=pDist(e);
  switch(e.state){
    case 'PATROL':{
      if(d2(e.pos.x,e.pos.z,e.wanderX,e.wanderZ)<2||e.t<=0){
        const a=rand(0,TAU),r=rand(4,14);
        e.wanderX=e.home.x+Math.sin(a)*r;
        e.wanderZ=e.home.z+Math.cos(a)*r;
        e.t=rand(3,7);
      }
      e.t-=dt;
      moveEnemy(e,e.wanderX,e.wanderZ,1.8,dt);
      if(e.seen){e.state='CHASE';growlSfx(distGain(e.pos,55,0.5));}
      break;}
    case 'ALERT':{
      moveEnemy(e,e.alertX,e.alertZ,3.6,dt);
      if(d2(e.pos.x,e.pos.z,e.alertX,e.alertZ)<3){
        e.alertT+=dt;e.moving=0;
        if(e.alertT>2.4)e.state='PATROL';
      }
      if(e.seen)e.state='CHASE';
      break;}
    case 'CHASE':{
      if(d>60){e.state='ALERT';e.alertX=player.pos.x;e.alertZ=player.pos.z;e.alertT=0;break;}
      if(d>26)moveEnemy(e,player.pos.x,player.pos.z,4.2,dt);
      else if(d<13){
        moveEnemy(e,e.pos.x*2-player.pos.x,e.pos.z*2-player.pos.z,3.6,dt);
        faceTarget(e,player.pos.x,player.pos.z,dt);
      }else{
        faceTarget(e,player.pos.x,player.pos.z,dt);
        e.moving=0;
      }
      if(d<32&&d>8&&e.spitCd<=0&&e.seen){e.state='SPIT';e.t=0;e.didSpit=false;}
      break;}
    case 'SPIT':{
      e.t+=dt;e.moving=0;
      faceTarget(e,player.pos.x,player.pos.z,dt*2);
      e.head.rotation.x=-Math.sin(Math.min(1,e.t/0.45)*Math.PI)*0.55;
      e.frillL.rotation.y=1.25-Math.min(1,e.t/0.3)*0.9;
      e.frillR.rotation.y=-1.25+Math.min(1,e.t/0.3)*0.9;
      if(!e.didSpit&&e.t>0.45){
        e.didSpit=true;
        spitAcid(e);
      }
      if(e.t>0.85){
        e.state='CHASE';
        e.spitCd=rand(2.2,3.6);
        e.frillL.rotation.y=1.25;e.frillR.rotation.y=-1.25;
        e.head.rotation.x=0;
      }
      break;}
  }
}
function updPtera(e,dt){
  e.diveCd-=dt;
  const d=pDist(e);
  if(e.state==='CIRCLE'){
    if(d<50){
      e.anchor.x=lerp(e.anchor.x,player.pos.x,dt*0.4);
      e.anchor.z=lerp(e.anchor.z,player.pos.z,dt*0.4);
    }
    e.cAng+=dt*0.6*e.cDir;
    const tx=e.anchor.x+Math.sin(e.cAng)*e.cR;
    const tz=e.anchor.z+Math.cos(e.cAng)*e.cR;
    const ty=groundHeight(e.anchor.x,e.anchor.z)+15+Math.sin(G.time*0.7+e.cAng)*1.5;
    const ox=tx-e.pos.x,oy=ty-e.pos.y,oz=tz-e.pos.z;
    e.pos.x+=ox*dt*2.2;e.pos.y+=oy*dt*1.6;e.pos.z+=oz*dt*2.2;
    e.yaw+=wrapAng(Math.atan2(ox,oz)-e.yaw)*Math.min(1,dt*4);
    e.group.rotation.x=0;
    e.wingL.rotation.z=Math.sin(e.animT*6.5)*0.55;
    e.wingR.rotation.z=-Math.sin(e.animT*6.5)*0.55;
    if(e.diveCd<=0&&d<42){
      e.state='DIVE';e.didHit=false;
      screechSfx(distGain(e.pos,70,0.5));
    }
  }else if(e.state==='DIVE'){
    _v1.set(player.pos.x,player.pos.y+1.2,player.pos.z).sub(e.pos);
    const dist=_v1.length();
    _v1.normalize();
    e.pos.addScaledVector(_v1,17*dt);
    e.yaw+=wrapAng(Math.atan2(_v1.x,_v1.z)-e.yaw)*Math.min(1,dt*6);
    e.group.rotation.x=clamp(-_v1.y*1.1,-1.1,1.1);
    e.wingL.rotation.z=0.95;e.wingR.rotation.z=-0.95;
    if(!e.didHit&&dist<1.7){
      e.didHit=true;
      playerDamage(8,e.pos,3);
      e.state='CLIMB';
    }
    if(e.pos.y<groundHeight(e.pos.x,e.pos.z)+1.2)e.state='CLIMB';
  }else{
    const ty=groundHeight(e.pos.x,e.pos.z)+16;
    e.pos.y+=Math.min(11*dt,Math.max(0,ty-e.pos.y));
    e.pos.x+=Math.sin(e.yaw)*8*dt;
    e.pos.z+=Math.cos(e.yaw)*8*dt;
    e.group.rotation.x=lerp(e.group.rotation.x,-0.4,dt*3);
    e.wingL.rotation.z=Math.sin(e.animT*8)*0.6;
    e.wingR.rotation.z=-Math.sin(e.animT*8)*0.6;
    if(e.pos.y>ty-1.5){
      e.state='CIRCLE';
      e.group.rotation.x=0;
      e.diveCd=rand(5,8);
      e.anchor.set(e.pos.x,0,e.pos.z);
    }
  }
  e.pos.x=clamp(e.pos.x,-245,245);
  e.pos.z=clamp(e.pos.z,-245,245);
}
function activateTrex(e){
  if(e.activated||e.state==='DEAD')return;
  e.activated=true;
  e.state='ROARIN';e.t=0;
  roarSfx(distGain(e.pos,160,1),58,1.8);
  G.shake=Math.min(1.2,G.shake+0.8);
}
function trexStep(e,dt,rate){
  e.animT+=dt*rate;
  const s=Math.sin(e.animT);
  e.legL.rotation.x=s*0.55;
  e.legR.rotation.x=-s*0.55;
  e.bobY=Math.abs(Math.cos(e.animT))*0.18;
  if((e.stepPrev<0&&s>=0)||(e.stepPrev>0&&s<=0)){
    const d=pDist(e);
    sfxBoom(distGain(e.pos,95,0.55));
    if(d<80)G.shake=Math.min(1,G.shake+0.32*(1-d/80));
  }
  e.stepPrev=s;
}
function updTrex(e,dt){
  const d=pDist(e);
  e.roarCd-=dt;e.chargeCd-=dt;e.biteCd-=dt;
  switch(e.state){
    case 'DORMANT':{
      e.moving=0;
      e.bobY=Math.sin(G.time*0.8)*0.06;
      e.head.rotation.x=0.25;
      if(d<26)activateTrex(e);
      break;}
    case 'ROARIN':{
      e.t+=dt;e.moving=0;
      e.head.rotation.x=-0.5;
      e.jawG.rotation.x=Math.sin(Math.min(1,e.t/1.6)*Math.PI)*0.7;
      if(e.t>1.6){e.state='HUNT';e.head.rotation.x=0;e.jawG.rotation.x=0;}
      break;}
    case 'HUNT':{
      const tz=Math.max(player.pos.z,-214);
      moveEnemy(e,player.pos.x,tz,4.9,dt);
      trexStep(e,dt,4.4);
      e.jawG.rotation.x=0.12;
      if(e.roarCd<=0&&d<38){e.state='SROAR';e.t=0;e.didRoar=false;}
      else if(e.chargeCd<=0&&d>13&&d<55&&player.pos.z>-214){
        e.state='CHARGE';e.t=0;e.chargeHit=false;
        _v1.set(player.pos.x-e.pos.x,0,player.pos.z-e.pos.z).normalize();
        e.lockX=_v1.x;e.lockZ=_v1.z;
        growlSfx(distGain(e.pos,90,0.7));
      }
      else if(d<6.8&&e.biteCd<=0){e.state='BITE';e.t=0;e.didBite=false;}
      break;}
    case 'CHARGE':{
      e.t+=dt;
      if(e.t<0.55){
        e.moving=0;
        e.group.rotation.x=lerp(e.group.rotation.x,-0.12,dt*5);
        faceTarget(e,e.pos.x+e.lockX,e.pos.z+e.lockZ,dt*3);
      }else{
        e.group.rotation.x=lerp(e.group.rotation.x,0.1,dt*5);
        e.pos.x+=e.lockX*18*dt;
        e.pos.z+=e.lockZ*18*dt;
        if(e.pos.z<-148)e.pos.x=clamp(e.pos.x,-13.5,13.5);
        collideXZ(e,e.r);
        e.pos.y=groundHeight(e.pos.x,e.pos.z);
        trexStep(e,dt,9);
        if(!e.chargeHit&&d<3.4){
          e.chargeHit=true;
          playerDamage(35,e.pos,9);
        }
        if(e.t>2.6||e.pos.z<-215){
          e.state='TIRED';e.t=0;
          e.group.rotation.x=0;
          e.chargeCd=rand(7,10);
        }
      }
      break;}
    case 'TIRED':{
      e.t+=dt;e.moving=0;
      e.bobY=Math.sin(e.t*7)*0.05;
      e.jawG.rotation.x=0.35;
      if(e.t>1.6){e.state='HUNT';e.jawG.rotation.x=0;}
      break;}
    case 'BITE':{
      e.t+=dt;e.moving=0;
      faceTarget(e,player.pos.x,player.pos.z,dt*2.5);
      e.jawG.rotation.x=e.t<0.42?e.t*1.6:Math.max(0,0.67-(e.t-0.42)*2);
      if(!e.didBite&&e.t>0.42){
        e.didBite=true;
        if(pDist(e)<6.8)playerDamage(25,e.pos,5);
      }
      if(e.t>0.9){e.state='HUNT';e.biteCd=1.5;e.jawG.rotation.x=0;}
      break;}
    case 'SROAR':{
      e.t+=dt;e.moving=0;
      e.head.rotation.x=-0.55;
      e.jawG.rotation.x=Math.sin(Math.min(1,e.t/1.5)*Math.PI)*0.8;
      if(!e.didRoar&&e.t>0.3){
        e.didRoar=true;
        roarSfx(distGain(e.pos,140,0.95),54,1.6);
        if(d<38){player.stagger=1.3;G.shake=Math.min(1.2,G.shake+0.7);}
      }
      if(e.t>1.5){
        e.state='HUNT';e.roarCd=rand(11,15);
        e.head.rotation.x=0;e.jawG.rotation.x=0;
      }
      break;}
  }
}
function legAnim(e,dt,rate){
  e.animT+=dt*(0.6+e.moving*rate);
  const s=Math.sin(e.animT*2)*Math.min(1,e.moving);
  if(e.legL){e.legL.rotation.x=s*0.85;e.legR.rotation.x=-s*0.85;}
  if(e.tail)e.tail.rotation.y=Math.sin(e.animT)*0.18;
  if(e.head&&e.state!=='SPIT')e.head.position.y=(e.type==='raptor'?1.45:1.45)+Math.sin(e.animT*4)*0.018;
}
function updateEnemies(dt){
  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i];
    if(e.state==='DEAD'){
      e.deadT+=dt;
      const tgt=e.deadDir*1.4;
      e.group.rotation.z=lerp(e.group.rotation.z,tgt,Math.min(1,dt*(e.type==='trex'?2.6:7)));
      if(e.flying&&e.pos.y>groundHeight(e.pos.x,e.pos.z)+0.4){
        e.pos.y-=14*dt;
        e.group.position.copy(e.pos);
      }
      if(e.type==='trex'&&!e.thud&&e.deadT>0.7){
        e.thud=true;
        sfxBoom(distGain(e.pos,100,0.8));
        G.shake=Math.min(1.2,G.shake+0.7);
        burst(e.pos,22,0x7a6a4a,4.5,2,0.9);
      }
      if(e.deadT>4)e.group.position.y-=dt*0.45;
      if(e.deadT>(e.type==='trex'?10:6)){
        scene.remove(e.group);
        enemies.splice(i,1);
      }
      continue;
    }
    if(e.flash>0){
      e.flash-=dt;
      if(e.flash<=0)for(let k=0;k<e.bodyMats.length;k++)e.bodyMats[k].emissive.setHex(0x000000);
    }
    const dd=d2(e.pos.x,e.pos.z,player.pos.x,player.pos.z);
    if(dd>19600&&(e.state==='PATROL'||e.state==='DORMANT'||e.state==='CIRCLE'))continue;
    if(e.type!=='trex'&&e.type!=='ptera'){
      e.senseT-=dt;
      if(e.senseT<=0){e.senseT=0.25;e.seen=canSee(e);}
    }
    if(e.type==='raptor'){updRaptor(e,dt);legAnim(e,dt,1.5);}
    else if(e.type==='dilo'){updDilo(e,dt);legAnim(e,dt,1.6);}
    else if(e.type==='ptera'){e.animT+=dt;updPtera(e,dt);}
    else updTrex(e,dt);
    e.group.position.set(e.pos.x,e.pos.y+(e.bobY||0),e.pos.z);
    e.group.rotation.y=e.yaw;
  }
}
/* ============================== ACID ============================== */
const acidGeo=new THREE.SphereGeometry(0.17,7,5);
const acidMat=new THREE.MeshBasicMaterial({color:0x49d83a});
function spitAcid(e){
  sfxSpit();
  const sx=e.pos.x+Math.sin(e.yaw)*1.3;
  const sz=e.pos.z+Math.cos(e.yaw)*1.3;
  const sy=e.pos.y+1.55;
  const tx=player.pos.x,ty=player.pos.y+1,tz=player.pos.z;
  const dx=tx-sx,dy=ty-sy,dz=tz-sz;
  const dist=Math.sqrt(dx*dx+dz*dz);
  const t=clamp(dist/16,0.4,1.6);
  const g=12;
  const m=new THREE.Mesh(acidGeo,acidMat);
  m.position.set(sx,sy,sz);
  scene.add(m);
  acids.push({x:sx,y:sy,z:sz,vx:dx/t,vy:dy/t+0.5*g*t,vz:dz/t,life:3,mesh:m});
}
function updateAcids(dt){
  for(let i=acids.length-1;i>=0;i--){
    const a=acids[i];
    a.vy-=12*dt;
    a.x+=a.vx*dt;a.y+=a.vy*dt;a.z+=a.vz*dt;
    a.life-=dt;
    a.mesh.position.set(a.x,a.y,a.z);
    let kill=false;
    const pdx=a.x-player.pos.x,pdy=a.y-(player.pos.y+1.1),pdz=a.z-player.pos.z;
    if(pdx*pdx+pdy*pdy+pdz*pdz<1.2){
      playerDamage(10,a.mesh.position,2);
      G.avigT=1;
      kill=true;
    }else if(a.y<groundHeight(a.x,a.z)+0.12){
      sfxSplash();
      burst(a.mesh.position,7,0x49d83a,2,1.6,0.5);
      kill=true;
    }else if(a.life<=0)kill=true;
    if(kill){
      burst(a.mesh.position,4,0x49d83a,1.5,1,0.3);
      scene.remove(a.mesh);
      acids.splice(i,1);
    }
  }
}

