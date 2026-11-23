/* Deterministic finale: world X is mirrored by the surf renderer. */
class FinaleArc {
  constructor(){this.rampDuration=.6;this.flightDuration=2.4;this.reset();}
  reset(){this.phase='racing';this.age=0;this.entryX=0;this.offset=0;this.velocity=0;this.outcome=null;this.wind=0;}
  enter(x=0){if(this.phase!=='racing')return false;this.phase='ramp';this.age=0;this.entryX=x;this.wind=0;return true;}
  step(dt,input=0){
    if(this.phase==='racing'||this.outcome||!Number.isFinite(dt)||dt<=0)return;
    const maxStep=1/120;
    if(dt>maxStep+1e-9){
      let remaining=dt;
      while(remaining>1e-9&&!this.outcome){
        const slice=Math.min(maxStep,remaining);
        this.step(slice,input);
        remaining-=slice;
      }
      return;
    }
    const previous=this.age;
    this.age=Math.min(this.duration,this.age+dt);
    if(this.age<this.rampDuration){this.phase='ramp';return;}
    this.phase='airborne';
    const airDt=this.age-Math.max(previous,this.rampDuration);
    const control=Math.max(-1,Math.min(1,input));
    // Crosswind alternates sides (two waves over 2.4s flight) to challenge player balance
    this.wind=Math.sin(this.airAge*(Math.PI*2/1.2))*2.5;
    // Analytic damping keeps the shorter aiming window consistent at every FPS.
    const target=control*5.2+this.wind,decay=Math.exp(-4.5*airDt);
    this.offset=Math.max(-15,Math.min(15,this.offset+target*airDt+(this.velocity-target)*(1-decay)/4.5));
    this.velocity=target+(this.velocity-target)*decay;
    if(this.age>=this.duration-1e-9){
      this.age=this.duration;
      const error=this.landingError;
      this.outcome=Math.abs(error)<=1.25?'landed_clean':Math.abs(error)<=1.95?'landed_edge':'missed_boat';
      this.phase='contact';
    }
  }
  get duration(){return this.rampDuration+this.flightDuration;}
  get airAge(){return Math.max(0,this.age-this.rampDuration);}
  get timeScale(){return this.airAge>=.6&&this.airAge<1.2?.65:1;}
  get cameraPhase(){return this.outcome?'contact':this.airAge<.6?'launch':this.airAge<1.8?'apex':'dive';}
  get progress(){
    // Six tenths of real-time slow motion are included in the 2.4 s flight.
    const t=Math.min(this.flightDuration,this.airAge);
    return (t-.35*Math.max(0,Math.min(.6,t-.6)))/(this.flightDuration-.35*.6);
  }
  get landingError(){return this.entryX*.22+this.offset+2.25;}
  get height(){const t=this.progress;return 8*(1-t)+2.1*t+24*Math.sin(Math.PI*t);}
}

class AviasalesFinale {
  constructor(game){
    this.game=game;this.entryZ=1260;this.arc=new FinaleArc();this.look=new THREE.Vector3();
    this.group=new THREE.Group();game.scene.add(this.group);this.materials=new Map();
    this.makeRamp();this.makeBoat();this.makeApproach();this.harbor=new AviasalesHarbor(this);this.mount();this.reset();
  }
  get active(){return this.arc.phase!=='racing';}
  ink(color){if(!this.materials.has(color))this.materials.set(color,this.game.paperToon.material(color));return this.materials.get(color);}
  box(parent,x,y,z,w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),this.ink(color));m.position.set(x,y,z);parent.add(m);return m;}
  makeRamp(){
    this.ramp=new THREE.Group();this.ramp.position.z=this.entryZ;this.group.add(this.ramp);
    const vertices=[],indices=[],n=32;
    for(let i=0;i<=n;i++){const u=i/n;for(const x of [-4.3,4.3])vertices.push(x,8*u*u,30*u);}
    for(let i=0;i<n;i++){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
    this.ramp.add(new THREE.Mesh(geo,this.ink(0xf1cd77)));
    for(const x of [-4.15,4.15])for(let i=0;i<12;i++){const u=(i+.5)/12;this.box(this.ramp,x,8*u*u+.08,30*u,.2,.3,2.35,0x0c73fe);}
    for(let i=0;i<7;i++){
      const u=(i+.5)/8,z=30*u,y=8*u*u+.1;
      for(const side of [-1,1]){const stripe=this.box(this.ramp,side*.65,y,z,1.9,.08,.36,0x0c73fe);stripe.rotation.y=side*.58;stripe.rotation.x=-Math.atan(16*u/30);}
    }
    for(const x of [-3,3])for(const z of [10,21,29])this.box(this.ramp,x,8*(z/30)**2/2-1,z,.45,8*(z/30)**2+2,.45,0x805f40);
    this.game.courseShow.sign(this.ramp,'ПОСЛЕДНИЙ ВЫЛЕТ',0,10,31,8,'#0c73fe');
  }
  makeBoat(){
    this.boat=new THREE.Group();this.group.add(this.boat);
    this.box(this.boat,0,.65,0,8.8,2.1,16,0xfff1d3);
    this.box(this.boat,0,.35,0,9,.55,16.1,0x0c73fe);
    this.box(this.boat,0,1.78,-3.8,8,.25,7.4,0xc98b45);
    for(let i=0;i<9;i++)this.box(this.boat,0,1.92,-7.05+i*.8,8,.025,.055,0x725537);
    for(const x of [-4.2,4.2]){
      this.box(this.boat,x,2,-.2,.22,.8,14.8,0xfff6df);
      this.box(this.boat,x,2.45,3.1,.32,1.7,7.3,0x0c73fe);
      for(const z of [.3,6.6])this.box(this.boat,x,4,z,.18,3,.18,0xf4dfaf);
    }
    this.box(this.boat,0,5.5,3.4,9.2,.42,8,0xffeac1);
    for(const x of [-2.2,2.2]){this.box(this.boat,x,2.3,3,2.8,.5,4.5,0x0c73fe);this.box(this.boat,x,3,4.8,2.8,1.2,.4,0x174b8b);}
    this.box(this.boat,0,2.6,6.7,7,1.2,.4,0xf4dfaf);
    this.boatReady=BoatModel.attach(this.boat,{fallback:[...this.boat.children],onLoad:root=>{this.boatVisual=root;}});
    // Wayan: small inked silhouette, beige shirt and white captain's cap.
    this.captain=new THREE.Group();this.captain.position.set(2.5,2.7,.2);this.boat.add(this.captain);
    this.box(this.captain,0,.2,0,.95,1.2,.65,0xd5b984);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.36,8,6),this.ink(0xb77746));head.position.y=1.12;this.captain.add(head);
    this.box(this.captain,0,1.44,0,.85,.23,.6,0xfff1d3);this.box(this.captain,0,1.33,-.3,.75,.08,.45,0x173f54);
    this.arm=this.box(this.captain,-.7,.5,-.2,.85,.24,.25,0xb77746);
    this.game.courseShow.sign(this.boat,'АЭРОПОРТ',0,5.95,3.4,5,'#0c73fe');
    const markerMat=new THREE.MeshBasicMaterial({color:0xffdd55,transparent:true,opacity:.75,depthWrite:false,side:THREE.DoubleSide});
    this.target=new THREE.Mesh(new THREE.RingGeometry(2.1,2.25,48),markerMat);this.target.rotation.x=-Math.PI/2;this.target.position.set(0,1.99,-4);this.boat.add(this.target);
    this.predict=new THREE.Mesh(new THREE.RingGeometry(.38,.52,28),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95,depthTest:false}));
    this.predict.rotation.x=-Math.PI/2;this.predict.renderOrder=12;this.boat.add(this.predict);
    this.landingShadow=new THREE.Mesh(new THREE.CircleGeometry(1,32),new THREE.MeshBasicMaterial({color:0x123a45,transparent:true,opacity:.25,depthWrite:false}));
    this.landingShadow.rotation.x=-Math.PI/2;this.group.add(this.landingShadow);
    this.wake=[];for(let i=0;i<16;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xf6f2d5,transparent:true,opacity:.45,depthWrite:false}));m.rotation.x=-Math.PI/2;this.group.add(m);this.wake.push(m);}
    this.impactRing=new THREE.Mesh(new THREE.RingGeometry(.85,1,48),new THREE.MeshBasicMaterial({color:0xfff6d7,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));
    this.impactRing.rotation.x=-Math.PI/2;this.boat.add(this.impactRing);
    this.skids=[];
    for(const x of [-.3,.3]){
      const mark=new THREE.Mesh(new THREE.PlaneGeometry(.12,1),new THREE.MeshBasicMaterial({color:0x314d52,transparent:true,opacity:0,depthWrite:false}));
      mark.rotation.x=-Math.PI/2;this.boat.add(mark);this.skids.push({mark,x});
    }
  }
  makeApproach(){
    this.buoys=[];
    const start=this.entryZ-30;
    for(let i=0;i<3;i++)for(const side of [-1,1]){
      const z=start+i*10,x=side*(6.5-(i/2)*2.3);
      const m=new THREE.Mesh(new THREE.SphereGeometry(.48,8,6),this.ink(0xff5500));m.position.set(-x,0,z);this.group.add(m);this.buoys.push({m,x,z});
      this.box(m,0,.25,0,.25,.55,.25,0x0c73fe);
    }
    this.game.courseShow.sign(this.group,'К ТРАМПЛИНУ ↑',0,7,start,7,'#0c73fe');
    const dock=new THREE.Group();dock.position.set(-15,0,this.entryZ+60);this.group.add(dock);
    this.box(dock,0,.4,0,10,1.2,25,0xa97851);
    for(let i=0;i<13;i++)this.box(dock,0,1.03,-12+i*2,10,.05,.1,0xe9cd91);
    for(const x of [-4.3,4.3])for(const z of [-11,0,11])this.box(dock,x,-.4,z,.55,5,.55,0x6b5136);
    this.game.courseShow.sign(dock,'ШАТТЛ В АЭРОПОРТ',0,4,5,8,'#0c73fe');
  }
  mount(){
    this.cue=document.createElement('div');this.cue.className='finale-cue';this.cue.setAttribute('role','status');this.game.container.append(this.cue);
    this.lens=document.createElement('div');this.lens.className='finale-lens';this.lens.setAttribute('aria-hidden','true');
    this.wipe=document.createElement('div');this.wipe.className='finale-wipe';this.wipe.setAttribute('aria-hidden','true');this.game.container.append(this.lens,this.wipe);
  }
  reset(){
    this.harbor?.reset();this.arc.reset();this.apexCue=false;this.contactAge=0;this.hitStop=0;this.resolved=false;this.launched=this.contactSound=false;this.baseY=null;this.departureAge=0;this.boat.position.set(-5,.3,this.entryZ+42);this.boat.rotation.set(0,0,0);this.arm.rotation.z=0;
    this.cameraShake=0;this.cameraTargetWeight=0;this.contactCameraCut=false;this.slideSpray=0;this.impactOrigin=null;
    if(this.impactRing){this.impactRing.visible=false;this.skids.forEach(({mark})=>mark.visible=false);}
    if(this.wipe){this.wipe.style.setProperty('--wipe','-120%');this.lens.style.opacity=0;}
    this.cue.textContent='';this.game.container.classList.remove('finale-active');
    document.getElementById('jump-button').disabled=false;
    this.captain.position.set(2.5,2.7,.2);
    this.game.scene.fog.near=100;this.game.scene.fog.far=225;
    this.target.visible=this.predict.visible=false;
  }
  tryEnter(previous,dt){
    const g=this.game,p=g.p;
    if(this.active||p.fallen||previous.z>=this.entryZ||p.z<this.entryZ)return false;
    const fraction=(this.entryZ-previous.z)/(p.z-previous.z),at=g.elapsed-dt+fraction*dt;
    const x=previous.x+(p.x-previous.x)*fraction;
    if(Math.abs(x)>4.15||p.airY>1.1||!g.flight.run.lock(at,g.mug.level))return false;
    this.arc.enter(x);this.baseY=g.wave.height(0,this.entryZ,g.time);this.ramp.position.y=this.baseY;
    this.fromCamera=g.camera.position.clone();g.input.reset();g.jump.cancel();g.jump.clearSpin();g.balance.roll=0;g.chase.end('finale');
    g.p.fallen=false;g.p.recovering=0;g.p.heading=0;g.trailPoints=[];g.container.classList.add('finale-active');
    document.getElementById('jump-button').disabled=true;document.getElementById('moment').classList.remove('visible');document.getElementById('ride-coach').classList.add('hidden');
    g.scene.fog.near=160;g.scene.fog.far=460;g.audio.playFinaleCue?.('horn');g.flight.render();return true;
  }
  approach(dt,previous){
    this.harbor.step(dt,previous);
    const g=this.game,p=g.p,start=this.entryZ-30;if(p.z<start||p.z>this.entryZ)return;
    const width=6.5-2.3*Math.max(0,Math.min(1,(p.z-start)/20));
    if(Math.abs(p.x)>width){p.x=Math.sign(p.x)*width;p.sideVelocity*=-.25;if(g.impactCooldown===0){g.spill(.025,'ЗАДЕЛ БУЙКИ',true);g.impactCooldown=1;}}
  }
  step(dt){
    const g=this.game,p=g.p;
    // Local freeze works even inside a long frame's fixed-step catch-up loop.
    if(this.hitStop>0){const held=Math.min(dt,this.hitStop);this.hitStop-=held;dt-=held;if(dt<1e-9)return;}
    g.input.update(dt);g.time+=dt;g.wave.time=g.time;
    this.arc.step(dt,g.input.lean);this.departureAge+=dt;
    g.updateParticles(dt);
    if(!this.apexCue&&this.arc.progress>.42){this.apexCue=true;g.audio.duckMusic?.(.22);}
    const age=this.arc.age,t=this.arc.progress;
    this.moveBoat(this.departureAge);
    if(this.arc.phase==='ramp'){
      const u=Math.min(1,age/this.arc.rampDuration);p.x=this.arc.entryX*(1-.78*u);p.z=this.entryZ+30*u;p.y=this.baseY+8*u*u;p.airY=.02;p.airborne=true;
      p.crouch=.65;g.jump.boardPitch=-Math.atan(16*u/30);this.cue.textContent='ПОСЛЕДНИЙ ВЫЛЕТ';
    }else{
      if(!this.launched){this.launched=true;g.audio.beginRampFlight();g.audio.playJump(1);g.audio.playFinaleCue?.('lift');}
      const targetZ=this.entryZ+42+this.arc.duration*7-4;
      p.x=this.arc.entryX*.22+this.arc.offset;p.z=this.entryZ+30+(targetZ-this.entryZ-30)*t;
      p.y=this.baseY+this.arc.height;p.airY=Math.max(.01,p.y-g.wave.height(p.x,p.z));p.airborne=true;
      p.lean=g.input.lean*.25+this.arc.wind*.04;p.heading=g.input.lean*.08+this.arc.wind*.012;p.crouch=t>.82?.65:.12;
      g.jump.boardPitch=t<.25?.3:t>.75?-.12:0;g.jump.airTime=this.arc.airAge;g.jump.lastHeight=p.airY;
      const windNotice=Math.abs(this.arc.wind)>1.1?(this.arc.wind>0?'← ВЕТЕР СПРАВА! ДЕРЖИ БАЛАНС':'ВЕТЕР СЛЕВА! ДЕРЖИ БАЛАНС →'):(g.input.mode==='gyro'?'НАКЛОНОМ ПОПАДИ НА КОРМУ':'← → ПОПАДИ НА КОРМУ');
      this.cue.textContent=t<.88?windNotice:'ПОСАДКА!';
      if(Math.abs(this.arc.wind)>.9&&Math.random()<.35){
        const d=g.particles?.find(item=>item.life<=0);
        if(d){
          d.mesh.material.map=g.sprayTexture;
          d.x=-p.x+(Math.random()-.5)*3.5;d.y=p.y+(Math.random()-.5)*1.8;d.z=p.z+Math.random()*4;
          d.vx=this.arc.wind*3.5;d.vy=-.4;d.vz=-16;
          d.life=.3;d.size=1.1;d.mesh.visible=true;
        }
      }
    }
    if(this.arc.outcome){
      const miss=this.arc.outcome==='missed_boat';
      this.target.visible=this.predict.visible=false;
      const firstContact=!this.contactSound;
      if(firstContact){this.contactSound=true;this.hitStop=.08;g.audio.endRampFlight();g.audio.playFinaleCue?.(miss?'splash':'deck');g.audio.playLanding(!miss,1);g.juice.buzz([30,20,45]);}
      else this.contactAge+=dt;
      if(miss){p.y=this.baseY+2.45-this.contactAge*9;this.cue.textContent='МИМО!';}
      else{
        const edge=this.arc.outcome==='landed_edge',side=Math.sign(this.arc.landingError)||1,u=Math.min(1,this.contactAge/.5),brake=1-(1-u)**3;
        p.x=-this.boat.position.x+this.arc.landingError*(1-(edge?.25:1)*brake)+(edge?0:side*1.15*Math.sin(Math.PI*brake));
        // Stop on the open aft deck before the model's rear bench.
        p.z=this.boat.position.z-4+.65*brake;
        p.y=this.boat.position.y+1.8-(edge?.45*Math.sin(Math.PI*u):0);p.airY=1;
        p.heading=side*(Math.PI/180)*(18+44*Math.sin(Math.PI*Math.min(1,u*1.08)));p.lean=-p.heading*.6;
        p.crouch=.2+.8*Math.exp(-this.contactAge*8);g.jump.boardPitch=.055*Math.exp(-this.contactAge*9)*Math.sin(this.contactAge*28);
        this.boat.rotation.z=g.juice.calm?0:-side*Math.sin(this.contactAge*14)*.055*Math.exp(-this.contactAge*5);
        this.cue.textContent=edge?'ДЕРЖИСЬ!':'НА БОРТУ!';
        if(edge){this.captain.position.set(-side*3,2.5,-3);this.arm.rotation.z=-side*.6;}
      }
      if(firstContact){
        this.impactOrigin=new THREE.Vector3(-p.x,p.y+.12,p.z);
        this.emitLandingSpray(miss?40:64,1);g.updateParticles(0);
      }else if(!miss&&this.contactAge<.38){
        this.slideSpray+=dt*100;const count=Math.floor(this.slideSpray);
        if(count){this.emitLandingSpray(count,.6);this.slideSpray-=count;}
      }
      const transition=miss?.55:.62;
      this.wipe.style.setProperty('--wipe',(-120*(1-Math.max(0,Math.min(1,(this.contactAge-(transition-.16))/.16))))+'%');
      if(this.contactAge>transition&&!this.resolved){this.resolved=true;g.flight.landingQuality=this.arc.outcome;if(miss)g.mug.level=0;g.finish(g.flight.run.entryTime,miss?'missed_boat':null);}
    }
  }
  emitLandingSpray(count,strength){
    const g=this.game,p=g.p,side=Math.sign(this.arc.landingError)||1;
    for(let i=0;i<count;i++){
      const d=g.particles.find(item=>item.life<=0);if(!d)break;
      const angle=(i/count)*Math.PI*1.5+.2,speed=(7+(i%7)*1.7)*strength;
      d.mesh.material.map=i%3?g.dropTexture:g.sprayTexture;
      d.x=-p.x+Math.cos(angle)*.4;d.y=p.y+.15+(i%4)*.06;d.z=p.z-.4+Math.sin(angle)*.3;
      d.vx=Math.cos(angle)*speed-side*3;d.vy=3+(i%9)*.65*strength;d.vz=-5-Math.abs(Math.sin(angle))*speed;
      d.life=.5+(i%5)*.045;d.size=i%3?.65:1.5;d.mesh.visible=true;
      // A readable spray silhouette is already present on the frozen contact frame.
      d.x+=d.vx*.035;d.y+=d.vy*.035;d.z+=d.vz*.035;
    }
  }
  moveBoat(age){
    const u=Math.min(1,age/this.arc.duration);this.boat.position.set(-5+7.25*u,this.baseY+.3+Math.sin(age*2)*.07,this.entryZ+42+7*age);
  }
  camera(dt){
    const g=this.game,p=g.p,phase=this.arc.cameraPhase,calm=g.juice.calm;
    if(g.state!=='playing')return;
    const cut=phase==='contact'&&!this.contactCameraCut&&!calm;
    if(this.hitStop>0&&!cut)return;
    const contact=phase==='contact',launch=phase==='launch',apex=phase==='apex';
    const slide=Math.min(1,this.contactAge/.5),side=Math.sign(this.arc.landingError)||1;
    const distance=calm?27:contact?9-slide*2:launch?12:apex?30:15;
    const height=calm?11:contact?3.2+slide*2.3:launch?2.5:apex?12:4;
    const eye=new THREE.Vector3(-p.x-(calm?0:apex?8:contact?side*(7+slide*3):phase==='dive'?3:0),p.y+height,p.z-distance);
    const blend=cut?1:1-Math.exp(-dt*(calm?4:contact?16:launch?11:apex?5:9));
    g.camera.position.y-=this.cameraShake;this.cameraShake=0;
    g.camera.position.lerp(eye,blend);g.camera.up.set(0,1,0);
    const targetWeight=this.cameraTargetWeight+=((calm?.45:apex?.55:phase==='dive'?.35:0)-this.cameraTargetWeight)*blend;
    this.look.set(-p.x+(this.boat.position.x+p.x)*targetWeight,
      p.y+(this.boat.position.y+1.8-p.y)*targetWeight+(contact?1.35:1),p.z+(contact?0:apex?8:5));g.camera.lookAt(this.look);
    if(!calm){
      const shake=contact?.8*Math.exp(-8*this.contactAge)*Math.sin(42*this.contactAge):0;
      this.cameraShake=shake;g.camera.position.y+=shake;g.camera.rotateZ((contact?-side*.055*(1-slide):apex?2.5*Math.PI/180:0)+shake*.07);
    }
    if(cut)this.contactCameraCut=true;
    const fov=calm?58:launch?68:apex?62:contact?50+7*slide:65;
    g.camera.fov+=(fov-g.camera.fov)*blend;g.camera.updateProjectionMatrix();g.camera.updateMatrixWorld();
  }
  render(){
    const g=this.game,p=g.p;this.harbor.render();this.group.visible=p.z>1000;this.ramp.position.y=this.baseY??g.wave.height(0,this.entryZ,g.time);
    this.lens.style.opacity=this.arc.outcome&&!g.juice.calm?Math.max(0,.65-this.contactAge*3):0;
    const landed=this.arc.outcome&&this.arc.outcome!=='missed_boat';
    this.impactRing.visible=!!landed&&this.contactAge<.3&&!g.juice.calm;
    if(this.impactRing.visible){this.impactRing.position.set(this.impactOrigin.x-this.boat.position.x,1.83,-4);this.impactRing.scale.setScalar(.7+this.contactAge*13);this.impactRing.material.opacity=.7*(1-this.contactAge/.3);}
    this.skids.forEach(({mark,x})=>{mark.visible=!!landed;if(landed){mark.position.set(-p.x-this.boat.position.x+x,1.825,p.z-this.boat.position.z-.4);mark.scale.y=.2+Math.min(1,this.contactAge/.3)*1.2;mark.rotation.z=-p.heading;mark.material.opacity=.28;}});
    g.courseShow.bar.visible=false;g.courseShow.finishBanner.visible=false;g.finishSign.visible=false;g.finishPosts.forEach(({pole})=>pole.visible=false);
    for(const b of this.buoys)b.m.position.y=g.wave.height(b.x,b.z)+.22;
    this.target.visible=this.predict.visible=this.active&&!this.arc.outcome&&this.arc.phase==='airborne';
    if(this.target.visible){
      const error=this.arc.landingError;this.predict.position.set(-error,2.03,-4);this.predict.material.color.setHex(Math.abs(error)<=1.25?0x84ffb1:Math.abs(error)<=1.95?0xffdc58:0xff7153);
      this.target.material.opacity=.55+.2*Math.sin(this.arc.age*5);
    }
    this.landingShadow.visible=this.active&&!this.arc.outcome;
    if(this.landingShadow.visible){
      const overDeck=Math.abs(-p.x-this.boat.position.x)<4&&Math.abs(p.z-this.boat.position.z+4)<3.5;
      const ground=overDeck?this.boat.position.y+1.82:g.wave.height(p.x,p.z)+.1;
      this.landingShadow.position.set(-p.x,ground,p.z);this.landingShadow.scale.set(1.1,2.4,1);
      this.landingShadow.material.opacity=.12+.22*Math.max(0,1-(p.y-ground)/24);
    }
    this.wake.forEach((m,i)=>{m.visible=this.active;const f=i/16;m.position.set(this.boat.position.x+(i%2?1:-1)*f*4,this.baseY+.02,this.boat.position.z-9-f*35);m.scale.set(.8+f*2.5,2+f*2,1);});
    if(!this.active&&g.state==='playing')this.cue.textContent=this.harbor.message;
    else if(!this.active)this.cue.textContent='';
    if(!this.active){this.boat.position.y=this.ramp.position.y+.3;this.launched=this.contactSound=false;}
    g.container.dataset.finale=this.arc.phase;
  }
}
if(typeof window!=='undefined'){window.FinaleArc=FinaleArc;window.AviasalesFinale=AviasalesFinale;}
if(typeof module!=='undefined'&&module.exports)module.exports={FinaleArc};
