import { BLOCK, ROAD, SHORE, SIZE, START, random, clamp, distance, angleDelta, move, blocked, clearSight } from './city.js';

const carColors=['#e6ece2','#d96554','#edba62','#49a69e','#687593','#d9d6b4'];
const shirts=['#f0a34f','#6fcac1','#f3ebcd','#b65d75','#667ab3'];
export const playerAt=(x=START.x,y=START.y)=>({x,y,a:0,hp:100,cash:0,car:null});
export function populate(city,seed) {
  const rng=random(seed+17), cars=[], people=[];
  for(let i=0;i<67;i++){
    const vertical=i%2===0, direction=i%4<2?1:-1;
    const axis=Math.floor(rng()*6)*BLOCK+(direction>0?58:24), along=rng()*(vertical?SIZE:SHORE);
    const a=vertical?direction*Math.PI/2:direction>0?0:Math.PI;
    cars.push({x:vertical?axis:along,y:vertical?along:axis,a,speed:57+rng()*41,color:carColors[i%carColors.length],ai:true});
  }
  for(let i=0;i<24;i++){
    const x=(i%5)*BLOCK+128+Math.floor(i/5)*30,y=(Math.floor(i/5))*BLOCK+89;
    cars.push({x,y,a:0,speed:0,color:carColors[(i+2)%carColors.length]});
  }
  cars.push({x:1134,y:1079,a:0,speed:0,color:'#e6a34f'});
  for(let i=0;i<84;i++){
    const vertical=i%2===0, axis=Math.floor(rng()*6)*BLOCK+ROAD+6, along=rng()*(vertical?SIZE:SHORE);
    const x=vertical?axis:along,y=vertical?along:axis;
    if(!blocked(city,x,y,6)) people.push({x,y,a:(vertical?Math.PI/2:0)+(i%4<2?0:Math.PI),shirt:shirts[i%5],pace:19+rng()*16,phase:rng()*9});
  }
  return {cars,people};
}

export function fire(s,x,y,a,police=false) {
  s.bullets.push({x:x+Math.cos(a)*11,y:y+Math.sin(a)*11,a,life:.57,police});
}
export function raiseHeat(s,amount) {
  s.wanted=clamp(s.wanted+amount,0,5);
  s.unseen=0;
  s.alert=true;
}

export function nearestCar(s) {
  let best=null, range=38;
  for(const car of s.cars){
    const d=distance(s.player,car);
    if(d<range){best=car;range=d;}
  }
  return best;
}
export function toggleCar(s) {
  const p=s.player;
  if(p.car){
    const c=p.car;
    for(const angle of [c.a+Math.PI/2,c.a-Math.PI/2,c.a+Math.PI,c.a]){
      const x=c.x+Math.cos(angle)*27,y=c.y+Math.sin(angle)*27;
      if(blocked(s.city,x,y,8)) continue;
      p.x=x;p.y=y;p.car=null;
      return true;
    }
  }else{
    const car=nearestCar(s);
    if(car){
      if(car.ai) raiseHeat(s,1);
      car.ai=false;car.travel=car.a;p.car=car;p.x=car.x;p.y=car.y;
      return true;
    }
  }
  return false;
}

function drive(s,k,dt) {
  const p=s.player,c=p.car,drift=k.has(' ');
  const gas=Number(k.has('w')||k.has('arrowup'))-Number(k.has('s')||k.has('arrowdown'));
  const turn=Number(k.has('d')||k.has('arrowright'))-Number(k.has('a')||k.has('arrowleft'));
  c.speed=clamp((c.speed+gas*235*dt)*Math.exp(-(drift?1.5:gas?.55:1.9)*dt),-90,330);
  if(Math.abs(c.speed)>7)c.a+=turn*(drift?3.35:2.35)*Math.min(1,Math.abs(c.speed)/68)*Math.sign(c.speed)*dt;
  c.travel+=angleDelta(c.a,c.travel)*Math.min(1,dt*(drift?2:12));
  const vx=Math.cos(c.travel)*c.speed,vy=Math.sin(c.travel)*c.speed;
  if(drift && turn && Math.abs(c.speed)>55) s.skids.push({x:c.x-vx*.041,y:c.y-vy*.041,a:c.travel,life:2.2});
  if(move(s.city,c,vx*dt,vy*dt,12)) c.speed*=-.28;
  p.x=c.x;p.y=c.y;p.a=c.a;
}
export function updateActors(s,input,dt) {
  const {keys,mouse}=input,p=s.player;
  if(p.car) drive(s,keys,dt);
  else{
    const x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
    const y=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
    const length=Math.hypot(x,y)||1,speed=keys.has('shift')?214:151;
    move(s.city,p,x/length*speed*dt,y/length*speed*dt,7);
    p.a=mouse.active?Math.atan2(mouse.y-p.y,mouse.x-p.x):x||y?Math.atan2(y,x):p.a;
    p.walk=Boolean(x||y);
    if(mouse.down && s.cooldown<=0){
      fire(s,p.x,p.y,p.a);
      s.cooldown=.25;
      if(!s.wanted)raiseHeat(s,1);
      else if(s.wanted===1 && s.unseen>1) s.unseen=1;
    }
  }
  s.cooldown-=dt;
  for(const c of s.cars){
    if(c===p.car) continue;
    if(c.ai){
      c.x=(c.x+Math.cos(c.a)*c.speed*dt+SHORE)%SHORE;
      c.y=(c.y+Math.sin(c.a)*c.speed*dt+SIZE)%SIZE;
      if(distance(c,p)<17){
        if(!p.car)p.hp=Math.max(0,p.hp-dt*22);
        else p.car.speed*=Math.exp(-3*dt);
      }
    }else if(Math.abs(c.speed)>1){
      c.speed*=Math.exp(-3*dt);
      if(move(s.city,c,Math.cos(c.a)*c.speed*dt,Math.sin(c.a)*c.speed*dt,12))c.speed=0;
    }
  }
  for(const person of s.people){
    if(person.down)continue;
    const scared=s.wanted>0&&distance(person,p)<103;
    const a=scared?Math.atan2(person.y-p.y,person.x-p.x):person.a;
    const speed=person.pace*(scared?3:1);
    if(move(s.city,person,Math.cos(a)*speed*dt,Math.sin(a)*speed*dt,5))person.a+=Math.PI;
    person.phase+=dt*(scared?17:8);
  }
  updatePolice(s,dt);
  for(const b of s.bullets){
    b.life-=dt;
    b.x+=Math.cos(b.a)*480*dt;b.y+=Math.sin(b.a)*480*dt;
    if(blocked(s.city,b.x,b.y)){b.life=0;continue;}
    if(b.police){
      if(distance(b,p)<(p.car?16:9)){p.hp=Math.max(0,p.hp-(p.car?7:13));b.life=0;}
    }else{
      const officer=s.police.find(o=>distance(o,b)<(o.cruiser?15:10));
      const person=s.people.find(o=>!o.down&&distance(o,b)<9);
      if(officer){officer.hp--;raiseHeat(s,1);b.life=0;}
      else if(person){person.down=true;raiseHeat(s,1);b.life=0;}
    }
  }
  s.police=s.police.filter(o=>o.hp>0);
  s.bullets=s.bullets.filter(b=>b.life>0);
  s.skids=s.skids.filter(t=>(t.life-=dt)>0);
}

function updatePolice(s,dt) {
  const p=s.player;
  if(!s.wanted){s.police=[];return;}
  s.spawn-=dt;
  if(s.police.length<Math.min(9,s.wanted*2) && s.spawn<=0){
    const options=[];
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4+s.time*.22;
      const x=clamp(p.x+Math.cos(a)*285,12,SHORE-12),y=clamp(p.y+Math.sin(a)*285,12,SIZE-12);
      if(!blocked(s.city,x,y,12)&&distance({x,y},p)>170)options.push({x,y});
    }
    if(options.length){
      const spawn=options[Math.floor(s.rng()*options.length)];
      const vx=spawn.x%BLOCK,vy=spawn.y%BLOCK;
      const cruiser=(p.car||s.wanted>=3)&&(vx<ROAD-12||vy<ROAD-12);
      s.police.push({...spawn,a:0,hp:cruiser?4:2,shot:.8,cruiser});
    }
    s.spawn=1.2;
  }
  let seen=false;
  for(const officer of s.police){
    const range=distance(officer,p);
    const visible=range<235 && clearSight(s.city,officer,p);
    if(visible){officer.last={x:p.x,y:p.y};seen=true;}
    const target=visible?p:officer.last??p;
    const a=Math.atan2(target.y-officer.y,target.x-officer.x);
    officer.a=a;
    const pace=officer.cruiser?155+s.wanted*23:92+s.wanted*13;
    const radius=officer.cruiser?12:7;
    if(range>57 || !visible){
      const directions=officer.detour>0?[officer.turn,a]:[a,a+.75,a-.75,a+1.5,a-1.5];
      officer.detour=Math.max(0,(officer.detour||0)-dt);
      for(const dir of directions){
        if(blocked(s.city,officer.x+Math.cos(dir)*11,officer.y+Math.sin(dir)*11,radius))continue;
        move(s.city,officer,Math.cos(dir)*pace*dt,Math.sin(dir)*pace*dt,radius);
        if(officer.cruiser)officer.a=dir;
        if(dir!==a && !officer.detour){officer.turn=dir;officer.detour=.56;}
        break;
      }
    }
    officer.shot-=dt;
    if(visible && range<167 && officer.shot<=0){
      fire(s,officer.x,officer.y,a+(s.rng()-.5)*.17,true);
      officer.shot=1.15+s.rng()*.7;
    }
  }
  s.alert=seen;
  s.unseen=seen?0:s.unseen+dt;
  if(s.unseen>9+s.wanted){
    s.wanted=0;s.police=[];s.notice='Heat cleared';s.noticeTime=3;
  }
}
