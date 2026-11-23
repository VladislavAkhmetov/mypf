/* Authored final third: wave, floating luggage, and relaxed vacationers (Grandma and DJ).
   Gameplay coordinates are mirrored only when rendering. */
class AviasalesHarbor {
  constructor(finale){
    this.finale=finale;this.game=finale.game;this.group=new THREE.Group();this.game.scene.add(this.group);
    this.foam=new THREE.MeshBasicMaterial({color:0xfff6d7,side:THREE.DoubleSide});

    // Floating lost luggage
    this.luggageGroup=new THREE.Group();this.group.add(this.luggageGroup);
    const props=this.game.world?.floatingProps;
    this.luggage=[
      {id:'luggage-0',kind:'suitcase',x:2.2,z:1088},
      {id:'luggage-1',kind:'cooler',x:-2.4,z:1125},
      {id:'luggage-2',kind:'barrel',x:1.8,z:1146},
      {id:'harbor-cross-0',kind:'cooler',x:0,z:1199,crossing:true,direction:1},
      {id:'harbor-cross-1',kind:'suitcase',x:.5,z:1223,crossing:true,direction:-1}
    ];
    this.luggage.forEach(item=>{
      item.mesh=props?props.build(item.kind):new THREE.Mesh(new THREE.BoxGeometry(1.6,.8,1.2),this.foam);
      item.mesh.position.set(-item.x,0,item.z);
      this.luggageGroup.add(item.mesh);
    });

    // Vacation companions: Grandma Lola and Diego with boombox
    this.surfersGroup=new THREE.Group();this.group.add(this.surfersGroup);
    this.surfers=[
      {
        id:'grandma',name:'БАБУШКА ЛОЛА',speech:'БАБУШКА: «ОСТОРОЖНЕЙ, МИЛОК!»',color:0xe6ddff,
        file:'rival-grandma-v2.webp',baseZ:1153,endZ:1185,speed:5,
        xAt:t=>3.3+.9*Math.sin(t*1.8),
        leanAt:t=>0.18*Math.cos(t*1.8),
        width:2.3,height:3.3
      },
      {
        id:'dj',name:'ДИЕГО',speech:'ДИЕГО: «ЛОВИ РИТМ, НЕ ТОЛКАЙСЯ!»',color:0xffe5ce,
        file:'rival-dj-v2.webp',baseZ:1193,endZ:1225,speed:5,
        xAt:t=>-2.9+1.3*Math.sin(t*1.6+0.8),
        leanAt:t=>0.20*Math.cos(t*1.6+0.8),
        width:2.3,height:3.4
      }
    ];
    this.surfers.forEach(s=>{
      s.group=new THREE.Group();this.surfersGroup.add(s.group);
      s.board=new THREE.Mesh(new THREE.PlaneGeometry(1.5,4.4),new THREE.MeshBasicMaterial({color:s.color,side:THREE.DoubleSide,transparent:true,alphaTest:.25,depthWrite:false}));
      if(this.game.surfboardTexture)s.board.material.map=this.game.surfboardTexture;
      s.board.rotation.x=-Math.PI/2;s.board.position.y=.055;s.group.add(s.board);

      s.shadow=new THREE.Mesh(new THREE.CircleGeometry(.85,24),new THREE.MeshBasicMaterial({color:0x062c40,transparent:true,opacity:.28,depthWrite:false}));
      s.shadow.rotation.x=-Math.PI/2;s.shadow.scale.set(1,1.6,1);this.group.add(s.shadow);

      s.mat=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.15,side:THREE.DoubleSide,depthWrite:false});
      s.card=new THREE.Mesh(new THREE.PlaneGeometry(s.width,s.height),s.mat);
      s.card.position.y=s.height*.48;s.group.add(s.card);

      if(typeof THREE.TextureLoader!=='undefined'){
        new THREE.TextureLoader().load('assets/comics/'+s.file,tex=>{tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;s.mat.map=tex;s.mat.needsUpdate=true;});
      }

      s.wakes=[];
      for(let i=0;i<4;i++){
        const w=this.game.sprite(this.game.dropTexture,.35,.35);this.group.add(w);s.wakes.push(w);
      }
      s.x=s.startX=s.xAt(0);s.z=s.baseZ;s.lean=0;
    });

    this.reset();
    this.game.wave.harborField=(x,z,time)=>this.lift(x,z,time);
  }
  reset(){
    this.waveStart=null;this.surfersStart=null;this.lastZ=0;this.boost=0;this.rideTime=0;
    this.rewarded=new Set();this.hit=new Set();this.events=[];
    this.message='';this.game.container.classList.remove('harbor-active');
    this.surfers.forEach(s=>{s.z=s.baseZ;s.x=s.xAt(0);s.lean=0;});
  }
  waveZ(time){return 1090+Math.min(24,Math.max(0,time-(this.waveStart??time))*2);}
  lift(x,z,time){
    if(z<1060||z>1170||this.waveStart===null)return 0;
    const distance=z-this.waveZ(time)-x*.8;
    return 1.65*Math.exp(-distance*distance/42)*Math.max(0,1-(x/17)**4);
  }
  reward(id,label,points,boost){
    if(this.rewarded.has(id))return;
    this.rewarded.add(id);this.events.push(id);this.boost=Math.max(this.boost,boost);
    this.game.awardTrick(label,points);this.game.audio.playAccelerator?.(boost);
  }
  impact(id,label){
    if(this.hit.has(id))return;
    this.hit.add(id);this.game.p.speed*=.82;this.game.spill(.12,label,true);this.game.emit(20,1,true);
  }
  surferState(s,time){
    const t=this.surfersStart===null?0:Math.max(0,time-this.surfersStart);
    const z=Math.min(s.endZ??Infinity,s.baseZ+t*s.speed),x=s.xAt(t),lean=s.leanAt(t);
    return {x,z,lean};
  }
  luggageX(item,time){
    if(!item.crossing)return item.x;
    const age=this.surfersStart===null?0:Math.max(0,time-this.surfersStart);
    return item.x+item.direction*1.8*Math.sin(age*1.3);
  }
  step(dt,previous){
    const g=this.game,p=g.p;this.boost*=Math.exp(-dt/1.8);this.lastZ=p.z;
    if(p.z>=1050&&this.waveStart===null)this.waveStart=g.time;
    if(p.z>=1060&&this.surfersStart===null)this.surfersStart=g.time;

    this.message=p.z>=1060&&p.z<1150?'ВНИМАНИЕ: БАГАЖ В ВОДЕ':
                 p.z>=1150&&p.z<1190?'БАБУЛЯ НА РЕЛАКСЕ':
                 p.z>=1190&&p.z<1230?'БАГАЖ ПЕРЕСЕКАЕТ КУРС':
                 p.z>=1230?'ПО ЦЕНТРУ · ПОЛНЫЙ ХОД':'';

    const cross=z=>previous.z<z&&p.z>=z;
    const atX=z=>previous.x+(p.x-previous.x)*Math.max(0,Math.min(1,(z-previous.z)/Math.max(.001,p.z-previous.z)));

    // 1. Transverse wave (1060-1170)
    if(p.z>1060&&p.z<1170){
      const d=p.z-this.waveZ(g.time)-p.x*.8;
      if(!p.airborne&&d>-10&&d<-2){this.rideTime+=dt;this.boost=Math.max(this.boost,5);if(this.rideTime>.24)this.reward('wave-ride','НА ПЛЕЧЕ ВОЛНЫ',250,7);}
      if(Math.abs(d)<2&&p.airY>1)this.reward('wave-jump','НАД ГРЕБНЕМ',200,4);
    }

    // 2. Floating luggage (1080-1150)
    for(const item of this.luggage){
      const x=this.luggageX(item,g.time);
      if(cross(item.z)&&Math.abs(atX(item.z)-x)<1.4){
        if(p.airY>.8)this.reward('luggage-'+item.id,'НАД БАГАЖОМ',150,3);
        else this.impact(item.id,'ЗАДЕЛ БАГАЖ');
      }
      else if(item.crossing&&cross(item.z))this.reward(item.id,'ПРОСКОЧИЛ!',200,7);
    }
    if(p.z>=1230&&p.z<this.finale.entryZ&&!p.fallen){
      this.boost=Math.max(this.boost,12);
      for(const z of [1232,1243,1254])if(cross(z)&&Math.abs(p.x)<4.15){
        this.reward('runway-'+z,'НА ВЫЛЕТ!',100,12);g.juice?.punch(3);g.emit(8,.6,true);
      }
    }

    // 3. Relaxed surfers: Grandma & DJ (1150-1230)
    for(const s of this.surfers){
      const state=this.surferState(s,g.time);
      s.x=state.x;s.z=state.z;s.lean=state.lean;

      // Direct collision
      if(Math.abs(p.z-s.z)<2.4&&Math.abs(p.x-s.x)<1.7&&p.airY<2.2){
        this.impact(s.id,s.speech);
      }
      // Clean overtake reward
      if(p.z>=s.z+1.0&&!this.hit.has(s.id)){
        this.reward(s.id,s.id==='grandma'?'БАБУЛЯ НА РЕЛАКСЕ':'ОБГОН ПОД МУЗЫКУ',300,5);
      }
    }
  }
  render(){
    const g=this.game,p=g.p;
    const active=p.z>=1060&&p.z<this.finale.entryZ;
    g.container.classList.toggle('harbor-active',active);
    this.group.visible=p.z>940&&p.z<this.finale.entryZ+30;
    if(!this.group.visible)return;

    // Floating luggage
    this.luggage.forEach(item=>{
      if(item.mesh){
        const x=this.luggageX(item,g.time);item.mesh.position.x=-x;
        item.mesh.position.y=g.wave.height(x,item.z)+.15;
        item.mesh.rotation.y=Math.sin(g.time*1.8+item.z)*.2;
      }
    });

    // Surfers
    this.surfers.forEach(s=>{
      const state=this.surferState(s,g.time);
      s.x=state.x;s.z=state.z;s.lean=state.lean;
      const y=g.wave.height(s.x,s.z);
      s.group.position.set(-s.x,y,s.z);
      s.card.rotation.z=s.lean*.4;
      s.board.rotation.z=-s.lean*.5;
      s.shadow.position.set(-s.x,y+.04,s.z-.15);
      s.wakes.forEach((drop,i)=>{
        const wz=s.z-1-i*.65,wx=s.x-s.lean*i*.2;
        drop.position.set(-wx,g.wave.height(wx,wz)+.06,wz);
        drop.scale.set(.35+i*.04,.14+i*.02,1);
      });
    });
  }
}
if(typeof window!=='undefined')window.AviasalesHarbor=AviasalesHarbor;
if(typeof module!=='undefined'&&module.exports)module.exports={AviasalesHarbor};
