import { jobs, roads, roadRows, visible, distance } from './world.js';
import { objective } from './simulation.js';
import { ellipse, line, poly, rect, round } from './city-art.js';

function vehicle(g,c,time) {
  g.save();g.translate(c.x,c.y);g.rotate(c.a);
  const police=c.role==='police';
  if(police) {
    g.save();g.globalAlpha=.16;
    ellipse(g,'#f75261',-9,-12,26,19);ellipse(g,'#50b9fa',-9,12,25,18);g.restore();
  }
  round(g,'#32283b75',-28,-11,66,33,9);
  for(const x of [-25,16]) for(const y of [-16,10]) round(g,'#30303a',x,y,13,6,2);
  round(g,'#403743',-33,-15,66,30,6);
  round(g,c.color,-31,-14,63,27,6);
  rect(g,'#fff1ba58',-23,-13,44,2);
  rect(g,'#202c3d53',-26,11,51,2);
  if(police) {rect(g,'#dedaca',-11,-14,23,27);rect(g,'#536176',-10,-12,21,23);}
  poly(g,'#2b3749',[[17,-10],[8,-12],[-13,-11],[-22,-8],[-22,8],[-13,11],[8,12],[17,10]]);
  poly(g,'#a5b7b5',[[16,-9],[8,-11],[8,10],[16,9]]);
  poly(g,'#72919b',[[-14,-10],[-21,-7],[-21,7],[-14,10]]);
  round(g,c.color,-13,-9,20,18,3);
  rect(g,'#fff1bc55',-10,-8,16,2);
  rect(g,'#2d3542',30,-8,3,16);
  for(const y of [-11,6]) {rect(g,'#ffedbd',29,y,4,5);rect(g,'#f78066',-33,y,4,5);}
  if(c.damage>.27) {
    poly(g,'#513a43',[[-33,-13],[-24,-11],[-30,-5],[-25,1],[-33,5],[-29,10],[-34,13]]);
    line(g,'#ebe0ba',1.5,-30,-4,-25,5);
    line(g,'#8e655d',2,-35,4,-30,13);
  }
  if(police) {
    round(g,'#28313d',-9,-12,7,23,2);
    const flash=Math.floor(time*9+c.y*.031)%2;
    round(g,flash?'#fff0ce':'#f95470',-8,-11,5,10,2);
    round(g,flash?'#69c6fb':'#e2f8ff',-8,1,5,10,2);
  }
  g.restore();
}
function person(g,p,time,player=false) {
  g.save();g.translate(p.x,p.y);g.rotate(p.a);
  ellipse(g,'#342b3b60',-5,7,15,5,-.3);
  if(p.hp<=0) {
    ellipse(g,'#684b55',0,0,12,5);ellipse(g,'#bf957a',10,0,4);g.restore();return;
  }
  const stride=Math.sin(time*(p.flee>0?18:10)+p.y*.15)*3;
  line(g,'#343747',4,-7,-4,-12-stride,-4);
  line(g,'#373949',4,-7,4,-12+stride,4);
  const armed=player||p.kind!=='civilian';
  ellipse(g,player?'#eec274':p.color,-2,0,7,8);
  line(g,player?'#edcb96':p.color,4,-3,6,armed?10:4,armed?3:7);
  line(g,player?'#edcb96':p.color,4,-3,-6,armed?8:4,armed?1:-7);
  ellipse(g,'#b27f63',4,0,4.6);
  ellipse(g,player?'#463648':'#493f45',2,0,3.4,4.2);
  if(armed) line(g,'#262936',3,9,2,16,2);
  if(player) {
    g.strokeStyle='#ffdfa5';g.lineWidth=1.4;g.beginPath();g.arc(0,0,17,.5,2.6);g.stroke();
  }
  g.restore();
}
function beacon(g,pos,time,active) {
  const lift=Math.sin(time*3)*3;
  ellipse(g,'#ffce6130',pos.x,pos.y,34,23);
  g.strokeStyle='#ffd36cae';g.lineWidth=2;g.beginPath();g.ellipse(pos.x,pos.y,26,16,0,0,7);g.stroke();
  const x=pos.x,y=pos.y-27+lift;
  poly(g,'#382f46',[[x,y-11],[x+11,y],[x,y+11],[x-11,y]]);
  poly(g,active?'#ffdd84':'#efb45d',[[x,y-8],[x+8,y],[x,y+8],[x-8,y]]);
  rect(g,'#493647',x-1,y-4,2,8);
}
export function actors(g,s,bounds,route) {
  const {left,right,top,bottom}=bounds;
  const inside=p=>p.x>left-80&&p.x<right+80&&p.y>top-80&&p.y<bottom+80;
  const obj=objective(s);
  if(obj) {
    if(route) {
      g.save();g.strokeStyle='#fac463a5';g.lineWidth=3;g.setLineDash([4,11]);g.lineJoin='round';g.beginPath();
      route.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();g.restore();
    }
    if(inside(obj.pos))beacon(g,obj.pos,s.time,true);
  } else {
    jobs.forEach((job,id)=>{if(!s.done.includes(id)&&inside(job.start)) beacon(g,job.start,s.time,false);});
  }
  for(const fx of s.fx) if(fx.type==='dust') ellipse(g,'#d8c1a741',fx.x,fx.y,17+(1-fx.life)*12,8,1.15);
  for(const c of s.cars) if(inside(c)) vehicle(g,c,s.time);
  for(const p of s.people) if(inside(p)) person(g,p,s.time);
  if(!s.player.car) person(g,s.player,s.time,true);
  if(s.player.car?.damage>.6) {
    const c=s.player.car, x=c.x-Math.cos(c.a)*30,y=c.y-Math.sin(c.a)*30;
    for(let i=0;i<3;i++) ellipse(g,'#3f384a48',x+i*4,y+i*6,5+i*2,4+i);
  }
  for(const b of s.bullets) {
    line(g,'#f9a65566',5,b.ox,b.oy,b.x,b.y);
    line(g,b.team==='player'?'#fff0ad':'#ffae88',2,b.ox,b.oy,b.x,b.y);
  }
  for(const fx of s.fx) {
    if(fx.type==='flash') {
      g.save();g.translate(fx.x,fx.y);g.rotate(fx.a);
      poly(g,'#fff2b4',[[-3,0],[6,-5],[18,-3],[12,0],[18,3],[6,5]]);g.restore();
    } else if(fx.type==='spark') ellipse(g,'#ffdf98',fx.x,fx.y,3);
  }
}
export function waypointRoute(world,p,end) {
  if(!end)return null;
  const closest=(grid,n)=>grid.reduce((a,b)=>Math.abs(a-n)<Math.abs(b-n)?a:b);
  const px=closest(roads,p.x), py=closest(roadRows,p.y);
  const ex=closest(roads,end.x), ey=closest(roadRows,end.y);
  const candidates=[
    [p,{x:p.x,y:py},{x:ex,y:py},{x:ex,y:end.y},end],
    [p,{x:px,y:p.y},{x:px,y:ey},{x:end.x,y:ey},end],
    [p,{x:px,y:p.y},{x:px,y:ey},{x:ex,y:ey},{x:ex,y:end.y},end],
    [p,{x:p.x,y:py},{x:px,y:py},{x:px,y:ey},{x:end.x,y:ey},end],
  ];
  const score=route=>route.slice(1).reduce((sum,pos,i)=>sum+distance(pos,route[i]),0)+
    (visible(world,p,route[1])?0:1800)+(visible(world,route.at(-2),end)?0:1800);
  return candidates.reduce((best,route)=>score(route)<score(best)?route:best);
}
