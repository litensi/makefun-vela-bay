import {SIZE, roads, roadRows, tileAt, terrain, ROAD, COAST, GRID, FIRST, palette, clamp, distance, random, makeWorld, solid, visible, jobs} from './world.js';

const directions=[[1,0],[0,1],[-1,0],[0,-1]];
export const lightGreen = (time,horizontal) => (Math.floor(time/7)%2===0) === horizontal;
function car(x,y,a,color,role='parked') {
  return {x,y,a,color,role,vx:0,vy:0,speed:0,damage:0,cool:0};
}
function civilian(x,y,a,color) {
  return {x,y,a,color,kind:'civilian',hp:45,flee:0,way:0,cool:0};
}
export function loadSave(storage) {
  try {
    const data=JSON.parse(storage?.getItem('vela-bay-v1'));
    if (!data || !Number.isFinite(data.cash) || !Array.isArray(data.done)) return null;
    return {cash:data.cash,done:data.done.filter(i=>i===0||i===1),mission:data.mission};
  } catch { return null; }
}
export function save(s) {
  try { s.storage?.setItem('vela-bay-v1',JSON.stringify({cash:s.cash,done:s.done,mission:s.mission && {id:s.mission.id,stage:s.mission.stage}})); } catch {}
}
export function newGame(seed=1,storage=null,saved=null) {
  const rng=random(seed+37), world=makeWorld(seed);
  const s={world,rng,storage,time:2,player:{x:794,y:920,a:-1,hp:100,cool:0},cars:[],people:[],bullets:[],fx:[],cash:saved?.cash??250,done:saved?.done??[],stars:0,heat:0,unseen:0,jack:0,toast:'',toastTime:0,mission:null,spawnDelay:0,dead:false};
  for(const [i,route] of world.routes.entries()) {
    for(let k=0;k<5;k++) {
      const a=route[k%4], b=route[(k+1)%4], t=rng();
      const p=civilian(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,rng()*6.28,palette[(i+k)%palette.length]);
      p.route=route; p.way=(k+1)%4; s.people.push(p);
    }
  }
  for(let i=0;i<8;i++) {
    const line=roads[i];
    for(let j=0;j<7;j++) {
      const offset=roads[j]+160;
      s.cars.push(car(line+54,offset+110,Math.PI/2,palette[(i+j)%7]));
      s.cars.push(car(offset+100,line+54,Math.PI,palette[(i+j+2)%7]));
      const d=(i+j)%4, horizontal=d%2===0;
      const c=car(horizontal?offset+rng()*145:Math.min(line+24,COAST-50),horizontal?line-24:offset+rng()*145,d*Math.PI/2,palette[(i+j+4)%7],'traffic');
      c.d=d; c.speed=80+rng()*45;
      if(horizontal) c.y=line+(d===0?24:-24);
      else c.x=line+(d===1?-24:24);
      s.cars.push(c);
    }
  }
  const m=saved?.mission;
  if(m && jobs[m.id] && !s.done.includes(m.id) && ['pickup','deliver'].includes(m.stage)) {
    startMission(s,m.id);
    if(m.stage==='deliver') {s.mission.stage='deliver'; s.people=s.people.filter(p=>p.kind!=='crew');}
  }
  return s;
}
export function notify(s,message) {s.toast=message; s.toastTime=3.4;}
function startMission(s,id) {
  s.mission={id,stage:'pickup'};
  const job=jobs[id];
  for(let i=0;i<3;i++) {
    const pos={x:job.pickup.x+26+i*38,y:job.pickup.y-35-(i%2)*34};
    const p=civilian(pos.x,pos.y,Math.PI/2,'#9f4d56');
    p.kind='crew'; p.hp=55; p.cool=1+i*.35; s.people.push(p);
  }
  notify(s,job.name.toUpperCase());
}
export function objective(s) {
  if(!s.mission) return null;
  const {id,stage}=s.mission, j=jobs[id];
  if(stage==='deliver') return {pos:j.end,text:id===0?'Deliver the case to the Marina':'Bring the take to Sunset Park',tag:j.type};
  const contested=s.people.some(p=>p.kind==='crew'&&p.hp>0&&distance(p,s.player)<410);
  return {pos:j.pickup,text:id===0?(contested?'Clear the handoff and collect the case':'Collect the case at Coral Row'):(contested?'Clear the crew and collect the take':'Collect the take at Vesper Yard'),tag:j.type};
}
function crime(s,amount) {
  s.heat=clamp(s.heat+amount,1,5);
  s.stars=Math.ceil(s.heat);
  s.unseen=0;
}
function shoot(s,a,angle,team) {
  const dx=Math.cos(angle),dy=Math.sin(angle);
  s.bullets.push({x:a.x+dx*17,y:a.y+dy*17,ox:a.x+dx*17,oy:a.y+dy*17,vx:dx*910,vy:dy*910,team,life:.54});
  s.fx.push({x:a.x+dx*19,y:a.y+dy*19,a:angle,life:.09,type:'flash'});
  if(team==='player') crime(s,.26);
  for(const p of s.people) if(p.kind==='civilian'&&distance(a,p)<255&&p.hp>0) {p.flee=4;p.a=Math.atan2(p.y-a.y,p.x-a.x);}
}
function move(s,obj,dx,dy,r=9) {
  let hit=false;
  if(!solid(s.world,obj.x+dx,obj.y,r)) obj.x+=dx; else hit=true;
  if(!solid(s.world,obj.x,obj.y+dy,r)) obj.y+=dy; else hit=true;
  return hit;
}
function drive(s,c,input,dt) {
  const keys=input.keys;
  const gas=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0);
  const steering=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
  const forward=c.vx*Math.cos(c.a)+c.vy*Math.sin(c.a);
  c.a+=steering*dt*2.65*clamp(forward/150,-.65,1);
  c.vx+=Math.cos(c.a)*gas*dt*(gas>0?485:350);
  c.vy+=Math.sin(c.a)*gas*dt*(gas>0?485:350);
  const lateral=-Math.sin(c.a)*c.vx+Math.cos(c.a)*c.vy;
  c.vx+=Math.sin(c.a)*lateral*Math.min(1,dt*5.4);
  c.vy-=Math.cos(c.a)*lateral*Math.min(1,dt*5.4);
  const drag=Math.exp(-dt*(gas?1.19:2.1));
  c.vx*=drag; c.vy*=drag;
  const speed=Math.hypot(c.vx,c.vy);
  if(move(s,c,c.vx*dt,c.vy*dt,22)) {
    c.damage=clamp(c.damage+speed*.0014,0,1); c.vx*=-.28; c.vy*=-.28;
    if(speed>180) s.player.hp-=6;
  }
  c.cool-=dt;
  for(const other of s.cars) if(other!==c && distance(c,other)<39 && speed>45 && c.cool<=0) {
    c.damage=clamp(c.damage+.09,0,1); c.vx*=-.22; c.vy*=-.22; c.cool=.35;
    if(speed>205) s.player.hp-=3;
  }
  for(const p of s.people) if(p.hp>0 && distance(c,p)<28 && speed>105) {
    p.hp=0; crime(s,1.12);
  }
  if(speed>150 && Math.abs(lateral)>45 && s.rng()<dt*48) s.fx.push({x:c.x-22*Math.cos(c.a),y:c.y-22*Math.sin(c.a),life:.7,type:'dust'});
}
function exit(s,c) {
  for(const side of [1,-1,0]) {
    const a=c.a+(side===0?Math.PI:side*Math.PI/2);
    const x=c.x+Math.cos(a)*39,y=c.y+Math.sin(a)*39;
    if(!solid(s.world,x,y) && !s.cars.some(other=>other!==c&&distance(other,{x,y})<26)) {
      Object.assign(s.player,{x,y,a,car:null}); c.role='parked'; c.vx=0;c.vy=0; return;
    }
  }
  notify(s,'No room to get out');
}
export function nearbyCar(s) {
  const p=s.player;
  return s.cars.reduce((best,c)=>c.role!=='police'&&distance(p,c)<52&&(!best||distance(p,c)<distance(p,best))?c:best,null);
}
function updatePlayer(s,input,dt) {
  const p=s.player, keys=input.keys;
  if(p.car) {
    drive(s,p.car,input,dt); p.x=p.car.x;p.y=p.car.y;p.a=p.car.a;
    if(input.pressed.has('KeyF')||input.pressed.has('KeyE')) exit(s,p.car);
    return;
  }
  let dx=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),dy=(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0);
  const length=Math.hypot(dx,dy), speed=keys.has('Space')?280:174;
  if(length) move(s,p,dx/length*speed*dt,dy/length*speed*dt);
  if(input.aim) p.a=Math.atan2(input.aim.y-p.y,input.aim.x-p.x);
  else if(length) p.a=Math.atan2(dy,dx);
  p.cool-=dt;
  if((input.fire||input.pressed.has('Fire'))&&p.cool<=0) {shoot(s,p,p.a,'player'); p.cool=.27;}
  const c=nearbyCar(s);
  if(c?.role==='traffic'&&keys.has('KeyE')) {
    if(s.jackTarget!==c) {s.jack=0;s.jackTarget=c;}
    s.jack+=dt;
    if(s.jack>=.72) {
      const driver=civilian(c.x+Math.sin(c.a)*30,c.y-Math.cos(c.a)*30,c.a-Math.PI/2,'#d6bf93');
      driver.flee=6; s.people.push(driver);
      crime(s,1.4); p.car=c; c.role='player'; s.jack=0; notify(s,'Vehicle reported stolen');
    }
  } else {
    s.jack=0;s.jackTarget=null;
    if(c?.role==='parked'&&input.pressed.has('KeyF')) {p.car=c;c.role='player';}
  }
}
function traffic(s,c,dt) {
  const [dx,dy]=directions[c.d], axis=dx?c.x:c.y, sign=dx||dy;
  const along=(axis-FIRST)*sign;
  const toLine=(((-along%GRID)+GRID)%GRID);
  const stopped=!lightGreen(s.time,Boolean(dx)) && toLine>ROAD && toLine<ROAD+27;
  const held=s.jackTarget===c || s.cars.some(other=>other!==c && (other.role==='traffic'||other.role==='player') &&
    Math.abs((other.x-c.x)*dy-(other.y-c.y)*dx)<24 && (other.x-c.x)*dx+(other.y-c.y)*dy>0 && (other.x-c.x)*dx+(other.y-c.y)*dy<63);
  if(stopped||held) return;
  c.x+=dx*c.speed*dt;c.y+=dy*c.speed*dt;
  if(c.x>COAST-8) c.x=8;
  if(c.x<8) c.x=COAST-8;
  if(c.y>SIZE-8) c.y=8;
  if(c.y<8) c.y=SIZE-8;
}
function people(s,dt) {
  const player=s.player;
  for(const p of s.people) {
    if(p.hp<=0) continue;
    if(p.kind==='civilian') {
      if(p.flee>0) {
        p.flee-=dt;
        if(move(s,p,Math.cos(p.a)*145*dt,Math.sin(p.a)*145*dt)) p.a+=.8+dt*.9;
      } else if(p.route) {
        const target=p.route[p.way];
        p.a=Math.atan2(target.y-p.y,target.x-p.x);
        if(distance(target,p)<5) p.way=(p.way+1)%4;
        move(s,p,Math.cos(p.a)*47*dt,Math.sin(p.a)*47*dt);
      }
      continue;
    }
    const range=distance(p,player);
    if(range>470) continue;
    p.a=Math.atan2(player.y-p.y,player.x-p.x);
    p.cool-=dt;
    const sight=visible(s.world,p,player);
    if(p.kind==='officer' && p.cover && distance(p,p.cover)>8 && range>90) {
      const a=Math.atan2(p.cover.y-p.y,p.cover.x-p.x);
      move(s,p,Math.cos(a)*94*dt,Math.sin(a)*94*dt);
    } else if((range>235||!sight)&&p.kind==='officer') {
      move(s,p,Math.cos(p.a)*102*dt,Math.sin(p.a)*102*dt);
    }
    if(sight&&p.cool<=0&&range<380) {
      shoot(s,p,p.a+(s.rng()-.5)*.31,'enemy'); p.cool=1.08+s.rng()*.7;
    }
  }
}
function pursuit(s,dt) {
  if(!s.stars) return;
  const p=s.player, police=s.cars.filter(c=>c.role==='police');
  const seen=[...police,...s.people.filter(a=>a.kind==='officer'&&a.hp>0)].some(a=>distance(a,p)<485&&visible(s.world,a,p));
  if(seen) s.unseen=0;
  else s.unseen+=dt;
  if(s.unseen>=20) {
    s.stars=0;s.heat=0;s.unseen=0;s.spawnDelay=2;
    s.cars=s.cars.filter(c=>c.role!=='police'); s.people=s.people.filter(a=>a.kind!=='officer');
    notify(s,'You lost the police'); return;
  }
  s.spawnDelay-=dt;
  if(police.length<Math.min(5,s.stars+1)&&s.spawnDelay<=0) {
    const rows=roadRows.slice().sort((a,b)=>Math.abs(a-p.y)-Math.abs(b-p.y));
    const cols=roads.slice().sort((a,b)=>Math.abs(a-p.x)-Math.abs(b-p.x));
    const candidates=[[p.x-610,rows[0]+22],[p.x+610,rows[0]-22],[cols[0]+22,p.y-615],[cols[0]-22,p.y+615]];
    const candidate=candidates.find(([x,y])=>x>45&&x<COAST-45&&y>45&&y<SIZE-45&&!police.some(c=>distance(c,{x,y})<125));
    if(candidate) {
      const [x,y]=candidate;
      s.cars.push(car(x,y,Math.atan2(p.y-y,p.x-x),'#34394f','police'));
    }
    s.spawnDelay=3.1;
  }
  for(const c of police) {
    const range=distance(c,p);
    if(range<202&&!p.car&&visible(s.world,c,p)) {
      if(!c.officer || (c.officer.hp<=0 || distance(c,c.officer)>390)&&s.time-c.deployed>9) {
        const officer=civilian(c.x+Math.sin(c.a)*33,c.y-Math.cos(c.a)*33,c.a,'#535c87');
        officer.kind='officer';officer.hp=65;officer.cool=.7;
        const side=Math.atan2(c.y-p.y,c.x-p.x);
        officer.cover={x:c.x+Math.cos(side)*18+Math.cos(side+1.57)*35,y:c.y+Math.sin(side)*18+Math.sin(side+1.57)*35};
        c.officer=officer;c.deployed=s.time;s.people.push(officer);
      }
      continue;
    }
    const playerOnRoad=tileAt(s.world,p.x,p.y)===terrain.road;
    const pathX=roads.reduce((a,b)=>Math.abs(a-c.x)<Math.abs(b-c.x)?a:b);
    const pathY=roadRows.reduce((a,b)=>Math.abs(a-c.y)<Math.abs(b-c.y)?a:b);
    const goal=playerOnRoad?p:Math.abs(p.x-pathX)<Math.abs(p.y-pathY)?{x:pathX,y:p.y}:{x:p.x,y:pathY};
    const direct=Math.atan2(goal.y-c.y,goal.x-c.x);
    const angles=[direct,direct+.52,direct-.52,direct+1.04,direct-1.04,direct+1.57,direct-1.57];
    const route=angles.find(a=>!solid(s.world,c.x+Math.cos(a)*62,c.y+Math.sin(a)*62,24));
    if(route!==undefined) {
      c.a=route;
      const speed=range<45?45: p.car?280:205;
      move(s,c,Math.cos(route)*speed*dt,Math.sin(route)*speed*dt,22);
      if(p.car&&range<42&&c.cool<=0) {p.hp-=4;p.car.damage=clamp(p.car.damage+.07,0,1);c.cool=.8;}
    }
    c.cool-=dt;
  }
}
function updateBullets(s,dt) {
  for(const b of s.bullets) {
    b.ox=b.x;b.oy=b.y;b.life-=dt;
    const steps=Math.ceil(910*dt/7);
    for(let i=0;i<steps&&b.life>0;i++) {
      b.x+=b.vx*dt/steps;b.y+=b.vy*dt/steps;
      const subject=b.team==='player'?s.people.find(p=>p.hp>0&&distance(p,b)<13):distance(s.player,b)<(s.player.car?26:13)?s.player:null;
      if(subject) {
        subject.hp-=b.team==='player'?28:s.player.car?4:9;
        if(subject!==s.player && subject.kind!=='crew') crime(s,subject.kind==='officer'?1:.83);
      }
      if(subject||solid(s.world,b.x,b.y,1)) {b.life=0;s.fx.push({x:b.x,y:b.y,life:.14,type:'spark'});}
    }
  }
  s.bullets=s.bullets.filter(b=>b.life>0);
}
export function step(s,input,dt) {
  if(s.dead)return;
  s.time+=dt;s.toastTime-=dt;
  updatePlayer(s,input,dt);
  for(const c of s.cars) if(c.role==='traffic') traffic(s,c,dt);
  people(s,dt);pursuit(s,dt);updateBullets(s,dt);
  for(const fx of s.fx) fx.life-=dt;
  s.fx=s.fx.filter(fx=>fx.life>0);
  if(!s.mission) {
    const id=jobs.findIndex((j,i)=>!s.done.includes(i) && distance(s.player,j.start)<40);
    if(id>=0) {startMission(s,id);save(s);}
  } else {
    const m=s.mission,j=jobs[m.id];
    if(m.stage==='pickup'&&distance(s.player,j.pickup)<55&&!s.people.some(p=>p.kind==='crew'&&p.hp>0)) {
      m.stage='deliver';notify(s,'Package secured');save(s);
    } else if(m.stage==='deliver'&&distance(s.player,j.end)<65) {
      s.cash+=j.pay;s.done.push(m.id);s.mission=null;
      notify(s,'JOB COMPLETE   +$'+j.pay.toLocaleString('en-US'));save(s);
    }
  }
  if(s.player.hp<=0) {s.player.hp=0;s.dead=true;save(s);}
}
export function pose(s,shot) {
  const p=s.player;
  if(shot==='street') {
    Object.assign(p,{x:804,y:914,a:-.85});
    s.cars.push(car(758,892,-Math.PI/2,'#bd5144'),car(758,1005,-Math.PI/2,'#e7bd73'),car(681,823,Math.PI/2,'#4c9294'));
    for(let i=0;i<7;i++) {
      const x=792+(i*17)%28,y=822+i*38;
      if(distance(p,{x,y})>26) s.people.push(civilian(x,y,i%2?Math.PI/2:-Math.PI/2,palette[(i+2)%7]));
    }
    s.cash=250;
  }
  if(shot==='chase') {
    Object.assign(p,{x:1863,y:992,a:-1.44,hp:73});
    const c=car(p.x,p.y,p.a,'#d9874c','player');
    c.damage=.84;p.car=c;
    s.cars=s.cars.filter(vehicle=>distance(vehicle,c)>87);
    s.cars.push(c,car(1840,1126,-1.7,'#3e485e','police'),car(1898,1220,-1.39,'#3e485e','police'));
    s.cars.push(car(1798,943,Math.PI/2,'#5a9b92'),car(1911,819,-Math.PI/2,'#c6b69c'));
    s.stars=3;s.cash=1100;
    for(let i=0;i<11;i++) s.fx.push({x:1870+i*2,y:1025+i*5,type:'dust',life:.66-i*.038});
  }
  if(shot==='mission') {
    Object.assign(p,{x:1982,y:1374,a:-.61,hp:86});
    s.mission={id:0,stage:'deliver'};s.cash=650;s.stars=2;
    s.cars=s.cars.filter(c=>distance(c,{x:2100,y:1320})>135);
    s.cars.push(car(1911,1345,-.12,'#569390'),car(2175,1296,.06,'#b05b51'));
    for(let i=0;i<3;i++) {
      const enemy=civilian(2128+i*37,1322-i*21,2.68,'#a54e59');enemy.kind='crew';s.people.push(enemy);
    }
    for(const [x,y,a] of [[2003,1359,-.61],[2050,1325,-.61],[2110,1332,2.86],[2070,1344,2.86]]) {
      s.bullets.push({x,y,ox:x-Math.cos(a)*24,oy:y-Math.sin(a)*24,team:a<0?'player':'enemy',life:1});
    }
    s.fx.push({x:2001,y:1361,a:-.61,life:.09,type:'flash'},{x:2110,y:1332,a:2.86,life:.09,type:'flash'});
  }
}
