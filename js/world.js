'use strict';
/* ============================== VEGETATION (INSTANCED) ============================== */
function fillInstanced(mesh,count,place){
  let i=0,guard=0;
  while(i<count&&guard<count*30){
    guard++;
    const t=place();
    if(!t)continue;
    mesh.setMatrixAt(i,t);
    i++;
  }
  mesh.count=i;
  mesh.instanceMatrix.needsUpdate=true;
  mesh.frustumCulled=false;
  scene.add(mesh);
}
function randLandSpot(margin){
  const x=rand(-240,240),z=rand(-240,240);
  if(Math.abs(z)<15)return null;
  if(inCanyonWalls(x,z))return null;
  if(z<-216&&z>-244)return null;
  if(inKeepout(x,z,margin||0))return null;
  return {x:x,z:z};
}
function buildVegetation(){
  // colossal trees
  const trunkGeo=jitterGeo(new THREE.CylinderGeometry(0.75,1.15,34,7),0.16);
  const trunkMat=matStd(0x4c3a26,0.95,0,{map:texTile(TEX.bark,3,7)});
  const trunks=new THREE.InstancedMesh(trunkGeo,trunkMat,140);
  trunks.castShadow=true;
  const canGeoA=jitterGeo(new THREE.ConeGeometry(7.5,11,7),0.55);
  const canMatA=matStd(0x2f4a1f,0.95,0,{map:texTile(TEX.leaf,5,3)});
  const canA=new THREE.InstancedMesh(canGeoA,canMatA,140);
  const canGeoB=jitterGeo(new THREE.ConeGeometry(5,8,7),0.45);
  const canMatB=matStd(0x3c5c26,0.95,0,{map:texTile(TEX.leaf,4,3)});
  const canB=new THREE.InstancedMesh(canGeoB,canMatB,140);
  const blobGeo=jitterGeo(new THREE.SphereGeometry(4,7,6),0.55);
  const blobMat=matStd(0x55702c,0.95,0,{map:texTile(TEX.leaf,3,2)});
  const blob=new THREE.InstancedMesh(blobGeo,blobMat,140);
  const treeSpots=[];
  let n=0,guard=0;
  while(n<140&&guard<4000){
    guard++;
    const s=randLandSpot(2);if(!s)continue;
    if(s.z>64&&s.z<152&&Math.abs(s.x)<46&&Math.random()<0.72)continue;
    const sc=rand(0.8,1.65),gh=groundHeight(s.x,s.z);
    trunks.setMatrixAt(n,tMat(s.x,gh+17*sc,s.z,rand(0,TAU),sc));
    canA.setMatrixAt(n,tMat(s.x+rand(-1,1),gh+(30+rand(0,4))*sc,s.z+rand(-1,1),rand(0,TAU),sc));
    canB.setMatrixAt(n,tMat(s.x+rand(-2,2),gh+(38+rand(0,3))*sc,s.z+rand(-2,2),rand(0,TAU),sc));
    blob.setMatrixAt(n,tMat(s.x+rand(-3,3),gh+33*sc,s.z+rand(-3,3),0,sc*rand(0.8,1.2)));
    addObsC(s.x,s.z,1.15*sc);
    treeSpots.push({x:s.x,z:s.z,y:gh+28*sc});
    n++;
  }
  [trunks,canA,canB,blob].forEach(function(m){m.count=n;m.instanceMatrix.needsUpdate=true;m.frustumCulled=false;scene.add(m);});
  // ferns: merged blade cluster
  const blade=new THREE.ConeGeometry(0.1,1.35,4);
  const fernItems=[];
  for(let i=0;i<6;i++){
    const a=i/6*TAU;
    const m=new THREE.Matrix4().makeRotationY(a)
      .multiply(new THREE.Matrix4().makeRotationX(0.85))
      .multiply(new THREE.Matrix4().makeTranslation(0,0.65,0));
    fernItems.push({g:blade,m:m});
  }
  const fernGeo=mergeGeos(fernItems);
  const ferns=new THREE.InstancedMesh(fernGeo,matStd(0x3f6b22,1),750);
  fillInstanced(ferns,750,function(){
    const s=randLandSpot(0);if(!s)return null;
    return tMat(s.x,groundHeight(s.x,s.z),s.z,rand(0,TAU),rand(0.7,1.5));
  });
  // cycads
  const cyItems=[{g:new THREE.CylinderGeometry(0.22,0.3,1.1,6),m:new THREE.Matrix4().makeTranslation(0,0.55,0)}];
  for(let i=0;i<5;i++){
    const a=i/5*TAU;
    cyItems.push({g:new THREE.ConeGeometry(0.14,1.5,4),
      m:new THREE.Matrix4().makeRotationY(a).multiply(new THREE.Matrix4().makeRotationX(1.1)).multiply(new THREE.Matrix4().makeTranslation(0,1.55,0))});
  }
  const cycads=new THREE.InstancedMesh(mergeGeos(cyItems),matStd(0x4f7028,1),220);
  cycads.castShadow=true;
  fillInstanced(cycads,220,function(){
    const s=randLandSpot(0);if(!s)return null;
    return tMat(s.x,groundHeight(s.x,s.z),s.z,rand(0,TAU),rand(0.8,1.6));
  });
  // hanging vines from canopies
  const vineGeo=new THREE.CylinderGeometry(0.05,0.03,9,4);
  const vines=new THREE.InstancedMesh(vineGeo,matStd(0x44561f,1),160);
  fillInstanced(vines,160,function(){
    if(!treeSpots.length)return null;
    const t=treeSpots[randi(0,treeSpots.length-1)];
    return tMat(t.x+rand(-4,4),t.y-4.5+rand(-2,2),t.z+rand(-4,4),0,rand(0.7,1.3));
  });
  // mossy rocks
  const rocks=new THREE.InstancedMesh(jitterGeo(new THREE.DodecahedronGeometry(1,0),0.28),
    matStd(0x66684f,1,0,{map:texTile(TEX.rock,2,2)}),90);
  rocks.castShadow=true;
  fillInstanced(rocks,90,function(){
    const s=randLandSpot(0);if(!s)return null;
    const sc=rand(0.5,2);
    const m=tMat(s.x,groundHeight(s.x,s.z)+sc*0.3,s.z,rand(0,TAU),sc);
    return m;
  });
}

/* ============================== RUINS OF THE OLD WORLD ============================== */
const CONC=matStd(0x8d8a7e,0.95,0,{map:texTile(TEX.conc,1.6,1.2)}),
  CONC2=matStd(0x77746a,0.95,0,{map:texTile(TEX.conc,1.2,1)}),
  REBAR=matStd(0x4a3326,0.7,0.5);
function makeRuin(x,z,w,h,d,collapsed){
  const gh=groundHeight(x,z);
  const g=new THREE.Group();
  const box=new THREE.Mesh(jitterGeo(new THREE.BoxGeometry(w,h,d),Math.min(w,d)*0.09),CONC);
  box.position.y=h/2-0.4;box.castShadow=true;box.receiveShadow=true;
  g.add(box);
  const top=new THREE.Mesh(jitterGeo(new THREE.BoxGeometry(w*0.7,h*0.35,d*0.8),Math.min(w,d)*0.09),CONC2);
  top.position.set(rand(-w*0.15,w*0.15),h+h*0.1,rand(-d*0.1,d*0.1));
  top.rotation.z=rand(-0.12,0.12);top.castShadow=true;
  g.add(top);
  if(collapsed){box.scale.y=0.45;box.position.y=h*0.225-0.4;top.position.y=h*0.5;top.rotation.z=rand(0.3,0.6);}
  for(let i=0;i<3;i++){
    const rb=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,rand(1.5,3),4),REBAR);
    rb.position.set(rand(-w*0.4,w*0.4),(collapsed?h*0.5:h+h*0.28),rand(-d*0.4,d*0.4));
    rb.rotation.set(rand(-0.5,0.5),0,rand(-0.5,0.5));
    g.add(rb);
  }
  const moss=new THREE.Mesh(new THREE.BoxGeometry(w*1.02,collapsed?h*0.2:h*0.45,d*1.02),matStd(0x42561f,1,0,{map:texTile(TEX.leaf,2,1)}));
  moss.position.y=(collapsed?h*0.1:h*0.22)-0.35;
  g.add(moss);
  g.position.set(x,gh,z);
  scene.add(g);
  box.updateWorldMatrix(true,true);
  const b3=new THREE.Box3().setFromObject(box);
  obsB.push({x0:b3.min.x,x1:b3.max.x,y0:b3.min.y,y1:b3.max.y,z0:b3.min.z,z1:b3.max.z,box3:b3});
  return g;
}
const RUST=[0x8a4a2a,0x6b3b22,0x55514c,0x7a6a33,0x5e4838];
function makeCar(x,z,ry){
  const gh=groundHeight(x,z);
  const g=new THREE.Group();
  const bm=matStd(RUST[randi(0,RUST.length-1)],0.85,0.25);
  const body=new THREE.Mesh(new THREE.BoxGeometry(1.9,0.55,4.2),bm);
  body.position.y=0.55;body.castShadow=true;g.add(body);
  const cab=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.5,2),bm);
  cab.position.set(0,1.05,-0.2);cab.castShadow=true;g.add(cab);
  const wg=new THREE.CylinderGeometry(0.36,0.36,0.25,8),wm=matStd(0x26241f,1);
  [[0.85,1.3],[-0.85,1.3],[0.85,-1.3],[-0.85,-1.3]].forEach(function(o){
    const w=new THREE.Mesh(wg,wm);w.rotation.z=Math.PI/2;
    w.position.set(o[0],0.3,o[1]);g.add(w);
  });
  g.position.set(x,gh-0.12,z);
  g.rotation.set(rand(-0.05,0.05),ry,rand(-0.06,0.06));
  scene.add(g);
  addObsB(g);
}
function makeBillboard(x,z,ry,line1,line2){
  const gh=groundHeight(x,z);
  const g=new THREE.Group();
  const pm=matStd(0x4a4438,0.8,0.4);
  for(const ox of [-3,3]){
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,8,6),pm);
    p.position.set(ox,4,0);g.add(p);
  }
  const tex=canvasTex(512,192,function(ctx,w,h){
    ctx.fillStyle='#b9ab85';ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#5e4838';
    ctx.font='700 64px Arial';ctx.textAlign='center';
    ctx.fillText(line1,w/2,82);
    ctx.font='700 40px Arial';ctx.fillText(line2,w/2,142);
    ctx.fillStyle='#3a4422';
    for(let i=0;i<26;i++)ctx.fillRect(rand(0,w),rand(0,h),rand(8,60),rand(4,22));
    ctx.clearRect(w*0.72,0,w*0.28,h*rand(0.3,0.6));
  });
  const board=new THREE.Mesh(new THREE.PlaneGeometry(8,3),
    new THREE.MeshStandardMaterial({map:tex,roughness:0.95,side:THREE.DoubleSide}));
  board.position.y=7;board.rotation.x=rand(-0.06,0.06);board.castShadow=true;
  g.add(board);
  g.position.set(x,gh,z);g.rotation.y=ry;
  scene.add(g);
}
function buildCrashSite(){
  const g=new THREE.Group();
  const fm=matStd(0xbfbcb2,0.7,0.35,{map:texTile(TEX.conc,2,1)});
  const fus=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.3,16,12),fm);
  fus.rotation.z=Math.PI/2;fus.rotation.y=0.5;fus.position.set(-11,1.5,225);
  fus.castShadow=true;g.add(fus);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(2.3,4,12),fm);
  nose.rotation.z=-Math.PI/2;nose.rotation.y=0.5;
  nose.position.set(-11+Math.cos(0.5)*10,1.4,225-Math.sin(0.5)*10);
  nose.rotation.x=0.5;g.add(nose);
  const strip=new THREE.Mesh(new THREE.BoxGeometry(15.5,0.35,0.1),matStd(0x2a2e30,0.6));
  strip.rotation.y=0.5;strip.position.set(-11,2.1,225+2.25);g.add(strip);
  const tail=new THREE.Mesh(new THREE.CylinderGeometry(1.4,2,6,10),fm);
  tail.rotation.z=Math.PI/2;tail.position.set(2,1,213);tail.rotation.y=-0.4;
  tail.castShadow=true;g.add(tail);
  const fin=new THREE.Mesh(new THREE.BoxGeometry(0.25,3.5,2.6),matStd(0x9a3b28,0.8));
  fin.position.set(2,3,211.5);fin.rotation.z=0.3;g.add(fin);
  const wing=new THREE.Mesh(new THREE.BoxGeometry(11,0.3,2.6),fm);
  wing.position.set(-20,0.6,217);wing.rotation.set(0.1,0.7,0.18);wing.castShadow=true;
  g.add(wing);
  scene.add(g);
  addObsB(fus);addObsB(tail);addObsB(wing);
  // smoldering fire glow
  const fire=new THREE.PointLight(0xff7a30,1.1,16);
  fire.position.set(-6,2,222);scene.add(fire);
}
function buildHighway(){
  const slabGeo=jitterGeo(new THREE.BoxGeometry(8,0.45,12),0.16);
  const slabMat=matStd(0x707064,0.95,0,{map:texTile(TEX.conc,2,1.5)});
  for(let z=200;z>-64;z-=17){
    if(Math.abs(z)<15)continue;
    if(Math.random()<0.22)continue;
    const x=6+Math.sin(z*0.03)*4+rand(-1.5,1.5);
    const gh=groundHeight(x,z);
    const s=new THREE.Mesh(slabGeo,slabMat);
    s.position.set(x,gh+0.1,z);
    s.rotation.set(rand(-0.03,0.03),rand(-0.08,0.08),rand(-0.04,0.04));
    s.receiveShadow=true;s.castShadow=true;
    scene.add(s);
    addPlatform(x-4,x+4,z-6,z+6,gh+0.33);
  }
}
function buildCity(){
  const defs=[[-26,140,10,12,9],[20,134,12,16,10],[-34,112,14,7,12,true],[30,104,11,18,9],
    [-18,92,9,14,8],[16,74,10,9,9],[34,84,12,7,10,true],[-32,72,10,15,9],[-4,126,8,5,7,true],[40,120,9,13,8]];
  defs.forEach(function(d){makeRuin(d[0],d[1],d[2],d[3],d[4],d[5]);});
  const cars=[[5,168,0.2],[9,150,-0.3],[2,142,1.4],[-12,128,0.7],[10,118,-0.1],[24,116,2.2],
    [-6,104,0.4],[14,96,-0.8],[3,82,0.1],[-22,80,1.9],[8,60,-0.4]];
  cars.forEach(function(c){makeCar(c[0],c[1],c[2]);});
  makeBillboard(-22,156,0.4,'EDEN VALLEY','RESORT - 12 MI');
  makeBillboard(28,66,-2.6,'LAST EXIT','FUEL  FOOD');
}
function buildBridge(){
  const dm=matStd(0x6d6d62,0.95,0,{map:texTile(TEX.conc,1.5,1)}),rm=matStd(0x55584e,0.85,0.3);
  function deck(zc,len){
    const d=new THREE.Mesh(new THREE.BoxGeometry(5,0.5,len),dm);
    d.position.set(8,1.15,zc);d.castShadow=true;d.receiveShadow=true;
    scene.add(d);
    addPlatform(5.5,10.5,zc-len/2,zc+len/2,1.4);
    for(const sx of [5.7,10.3]){
      const r=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.85,len),rm);
      r.position.set(sx,1.85,zc);scene.add(r);addObsB(r);
    }
    const pil=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.7,4.5,7),dm);
    pil.position.set(8,-1,zc);scene.add(pil);
  }
  deck(7.9,11.3);
  deck(-7.9,11.3);
  // steps up
  const stepDefs=[[14.2,0.5],[13.7,0.95],[-13.7,0.95],[-14.2,0.5]];
  stepDefs.forEach(function(s){
    const b=new THREE.Mesh(new THREE.BoxGeometry(5,0.5,1.1),dm);
    b.position.set(8,s[1]-0.25,s[0]);b.castShadow=true;scene.add(b);
    addPlatform(5.5,10.5,s[0]-0.55,s[0]+0.55,s[1]);
  });
  // fallen slab in the gap
  const fall=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.5,5),dm);
  fall.position.set(8.3,-0.85,0);fall.rotation.set(0.22,0.15,0.08);
  scene.add(fall);
  addPlatform(6,10.6,-2.2,2.2,-0.55);
}
function buildTower(){
  const tm=matStd(0x7a4a30,0.7,0.5);
  const baseY=groundHeight(-6,-108);
  const g=new THREE.Group();
  for(const o of [[-1.7,-1.7],[1.7,-1.7],[-1.7,1.7],[1.7,1.7]]){
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.2,23,6),tm);
    leg.position.set(o[0]*0.75,11.5,o[1]*0.75);
    leg.rotation.set(o[1]*-0.045,0,o[0]*0.045);
    leg.castShadow=true;g.add(leg);
    addObsC(-6+o[0],-108+o[1],0.3);
  }
  for(let i=0;i<4;i++){
    const br=new THREE.Mesh(new THREE.BoxGeometry(2.6-i*0.4,0.12,0.12),tm);
    br.position.set(0,4+i*5,0);br.rotation.y=i*0.7;g.add(br);
    const br2=br.clone();br2.rotation.y+=Math.PI/2;g.add(br2);
  }
  const top=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.3,1.6),tm);
  top.position.y=23;g.add(top);
  const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.06,6,5),tm);
  ant.position.y=26;g.add(ant);
  g.position.set(-6,baseY,-108);
  scene.add(g);
  // console
  const con=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.15,0.6),matStd(0x3a4034,0.6,0.4));
  con.position.set(-3.4,groundHeight(-3.4,-105.6)+0.6,-105.6);
  con.rotation.y=0.6;con.castShadow=true;scene.add(con);addObsB(con);
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.45),
    new THREE.MeshStandardMaterial({color:0x16331a,emissive:0x2c7a36,emissiveIntensity:0.8,roughness:0.4}));
  scr.position.set(-3.4+Math.sin(0.6)*0.31,groundHeight(-3.4,-105.6)+0.85,-105.6+Math.cos(0.6)*0.31);
  scr.rotation.y=0.6;scene.add(scr);
  // sandbag ring
  for(let i=0;i<7;i++){
    const a=i/7*TAU;
    const sb=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.6,0.7),matStd(0x8a7d5a,1));
    const sx=-6+Math.sin(a)*6.5,sz=-108+Math.cos(a)*6.5;
    sb.position.set(sx,groundHeight(sx,sz)+0.3,sz);
    sb.rotation.y=a;sb.castShadow=true;scene.add(sb);
  }
}
let beaconLight=null,beaconBeam=null;
function buildBeaconFx(){
  beaconLight=new THREE.PointLight(0xff3522,0,60);
  beaconLight.position.set(-6,groundHeight(-6,-108)+26,-108);
  scene.add(beaconLight);
  beaconBeam=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,70,8,1,true),
    new THREE.MeshBasicMaterial({color:0xff4530,transparent:true,opacity:0.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  beaconBeam.position.set(-6,groundHeight(-6,-108)+55,-108);
  beaconBeam.visible=false;
  scene.add(beaconBeam);
}
function buildCanyon(){
  const rockM=matStd(0x6e6a58,1,0,{map:texTile(TEX.rock,2.5,2)}),
    mossM=matStd(0x4c5a30,1,0,{map:texTile(TEX.leaf,2,1)});
  for(let side=-1;side<=1;side+=2){
    for(let z=-150;z>-214;z-=8.5){
      const w=rand(6,10),h=rand(9,16),x=side*(19+rand(0,5));
      const b=new THREE.Mesh(jitterGeo(new THREE.BoxGeometry(w,h,10),Math.min(w,h)*0.11),rockM);
      b.position.set(x,groundHeight(x,z)+h/2-1.5,z);
      b.rotation.y=rand(-0.12,0.12);b.castShadow=true;b.receiveShadow=true;
      scene.add(b);addObsB(b);
      const m=new THREE.Mesh(new THREE.BoxGeometry(w*0.8,2,8),mossM);
      m.position.set(x+rand(-1,1),groundHeight(x,z)+h-1.4,z);
      scene.add(m);
    }
  }
  // entrance pillars
  for(const sx of [-15,15]){
    const p=new THREE.Mesh(jitterGeo(new THREE.CylinderGeometry(2,2.8,12,7),0.4),rockM);
    p.position.set(sx,groundHeight(sx,-148)+5,-148);
    p.castShadow=true;scene.add(p);addObsB(p);
  }
  // bone field
  const boneM=matStd(0xd9d4c2,0.85);
  for(let i=0;i<9;i++){
    const x=rand(-11,11),z=rand(-156,-206);
    const b=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.13,rand(1.4,3),5),boneM);
    b.position.set(x,groundHeight(x,z)+0.15,z);
    b.rotation.set(Math.PI/2+rand(-0.3,0.3),rand(0,TAU),0);
    scene.add(b);
  }
  const skull=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6),boneM);
  skull.position.set(4,groundHeight(4,-170)+0.5,-170);skull.scale.set(0.9,0.8,1.3);
  scene.add(skull);
}
const turrets=[];
function buildHaven(){
  const wallM=matStd(0x9b988c,0.95,0,{map:texTile(TEX.conc,3,1)});
  for(const def of [[-23,34],[23,34]]){
    const w=new THREE.Mesh(new THREE.BoxGeometry(def[1],10,3),wallM);
    w.position.set(def[0],groundHeight(def[0],-228)+4.6,-228);
    w.castShadow=true;w.receiveShadow=true;
    scene.add(w);addObsB(w);
  }
  for(const px of [-6.9,6.9]){
    const p=new THREE.Mesh(new THREE.BoxGeometry(1.8,11,3.2),wallM);
    p.position.set(px,groundHeight(px,-228)+5,-228);
    p.castShadow=true;scene.add(p);addObsB(p);
  }
  const arch=new THREE.Mesh(new THREE.BoxGeometry(15.6,2.6,3.2),wallM);
  arch.position.set(0,groundHeight(0,-228)+9.2,-228);arch.castShadow=true;
  scene.add(arch);
  const signTex=canvasTex(512,160,function(ctx,w,h){
    ctx.fillStyle='#23291a';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#ffd76a';ctx.lineWidth=6;ctx.strokeRect(8,8,w-16,h-16);
    ctx.fillStyle='#ffd76a';ctx.textAlign='center';
    ctx.font='800 84px Arial';ctx.fillText('HAVEN',w/2,86);
    ctx.font='700 30px Arial';ctx.fillStyle='#cfe3a0';
    ctx.fillText('LAST  SANCTUARY',w/2,134);
  });
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(10,3.1),
    new THREE.MeshStandardMaterial({map:signTex,roughness:0.8,emissive:0x4a3d12,emissiveIntensity:0.5}));
  sign.position.set(0,groundHeight(0,-228)+9.2,-226.3);
  scene.add(sign);
  // turrets on the wall
  for(const tx of [-14,14]){
    const tg=new THREE.Group();
    const base=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.7,1,8),matStd(0x4c5046,0.6,0.5));
    base.position.y=0.5;tg.add(base);
    const gun=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.25,2.2),matStd(0x33362e,0.5,0.6));
    gun.position.set(0,1.1,0.7);tg.add(gun);
    tg.position.set(tx,groundHeight(tx,-228)+9.6,-228);
    scene.add(tg);turrets.push(tg);
  }
  // floodlights
  for(const fx of [-9.5,9.5]){
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.16,11,6),matStd(0x44483e,0.6,0.5));
    pole.position.set(fx,groundHeight(fx,-224.5)+5.5,-224.5);
    scene.add(pole);
    const sp=new THREE.SpotLight(0xfff2cc,1.5,70,0.46,0.45,1.2);
    sp.position.set(fx,groundHeight(fx,-224.5)+11,-224.5);
    sp.target.position.set(fx*0.6,0,-200);
    scene.add(sp);scene.add(sp.target);
    const beamDir=_v1.set(fx*0.6-fx,0-(groundHeight(fx,-224.5)+11),-200+224.5).normalize();
    const cone=new THREE.Mesh(new THREE.ConeGeometry(4.5,20,8,1,true),
      new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:0.06,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),beamDir.clone());
    cone.position.set(fx,groundHeight(fx,-224.5)+11,-224.5).add(beamDir.clone().multiplyScalar(10));
    scene.add(cone);
  }
  // glow of the city beyond
  for(let i=0;i<4;i++){
    const b=new THREE.Mesh(new THREE.BoxGeometry(rand(4,8),rand(7,15),rand(4,8)),
      new THREE.MeshStandardMaterial({color:0x5a5e54,roughness:0.9,emissive:0x3a2c10,emissiveIntensity:0.25}));
    b.position.set(rand(-20,20),groundHeight(0,-238)+4,rand(-238,-244));
    scene.add(b);
  }
  const glow=new THREE.PointLight(0xffe9b0,1.2,55);
  glow.position.set(0,8,-236);scene.add(glow);
}
/* spores */
let sporePts=null,sporeVel=[];
function buildSpores(){
  const N=320,arr=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    arr[i*3]=player.pos.x+rand(-45,45);
    arr[i*3+1]=rand(0,18);
    arr[i*3+2]=player.pos.z+rand(-45,45);
    sporeVel.push(rand(-0.25,0.25),rand(-0.12,0.05),rand(-0.25,0.25));
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
  sporePts=new THREE.Points(g,new THREE.PointsMaterial({color:0xd8d2a0,size:0.08,transparent:true,opacity:0.55,depthWrite:false}));
  sporePts.frustumCulled=false;
  scene.add(sporePts);
}
function updateSpores(dt){
  if(!sporePts)return;
  const p=sporePts.geometry.attributes.position,t=G.time;
  for(let i=0;i<p.count;i++){
    let x=p.getX(i)+ (sporeVel[i*3]+Math.sin(t*0.6+i)*0.12)*dt;
    let y=p.getY(i)+sporeVel[i*3+1]*dt;
    let z=p.getZ(i)+(sporeVel[i*3+2]+Math.cos(t*0.5+i)*0.12)*dt;
    if(x-player.pos.x>45)x-=90;if(x-player.pos.x<-45)x+=90;
    if(z-player.pos.z>45)z-=90;if(z-player.pos.z<-45)z+=90;
    if(y<0)y=18;if(y>18)y=0;
    p.setXYZ(i,x,y,z);
  }
  p.needsUpdate=true;
}

