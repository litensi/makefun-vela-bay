import { angleDelta, clearSight, distance, move, ramps } from './city.js';

export function impact(s,x,y,blood=false){
  for(let i=0;i<(blood?7:13);i++){
    const a=s.rng()*Math.PI*2,speed=20+s.rng()*(blood?44:115);
    const life=.12+s.rng()*.26;
    s.effects.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life,total:life,blood});
  }
}
export function updateEffects(s,dt){
  s.effects=s.effects.filter(p=>(p.life-=dt)>0);
  for(const p of s.effects){p.x+=p.vx*dt;p.y+=p.vy*dt;}
}
export function updateAirUnit(s,dt){
  if(s.wanted<3){s.heli=null;return false;}
  const p=s.player;
  const h=s.heli??={x:p.x-210,y:p.y-108,beamX:p.x-100,beamY:p.y-40,a:0,last:{x:p.x,y:p.y}};
  const sweep=s.time*.77;
  if(s.alert)h.last={x:p.x,y:p.y};
  const target=h.last;
  const dx=target.x+Math.cos(sweep)*135-h.x,dy=target.y+Math.sin(sweep)*100-h.y;
  const speed=Math.min(216,Math.hypot(dx,dy)*2.6);
  h.a=Math.atan2(dy,dx);
  h.x+=Math.cos(h.a)*speed*dt;h.y+=Math.sin(h.a)*speed*dt;
  const tx=target.x+Math.sin(sweep*2)*61,ty=target.y+Math.cos(sweep*2)*43;
  h.beamX+=(tx-h.beamX)*Math.min(1,dt*3.4);
  h.beamY+=(ty-h.beamY)*Math.min(1,dt*3.4);
  h.lock=distance({x:h.beamX,y:h.beamY},p)<36 &&
    distance(h,p)<240 && clearSight(s.city,h,p);
  return h.lock;
}
export function tryJump(s,car){
  if(car.air||car.speed<120||car.rampLock>s.time)return;
  const ramp=ramps.find(r=>distance(r,car)<15&&Math.abs(angleDelta(r.a,car.travel))<.5);
  if(!ramp)return;
  car.air=.76;car.rampLock=s.time+1.2;
}
export function driveAirborne(s,car,dt){
  car.air=Math.max(0,car.air-dt);
  const hit=move(s.city,car,Math.cos(car.travel)*car.speed*dt,Math.sin(car.travel)*car.speed*dt,12);
  if(hit||!car.air){
    car.air=0;
    if(hit)car.speed*=-.28;
    impact(s,car.x,car.y);
    s.notice='Stunt jump · Landed';s.noticeTime=2;
  }
}
