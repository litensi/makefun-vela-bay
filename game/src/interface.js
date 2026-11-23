import {clamp, COAST, SIZE, roads, roadRows, park, stadium, jobs, distance} from './world.js';
import {objective, nearbyCar} from './simulation.js';
import {ellipse, line, poly, rect} from './city-art.js';

const $=id=>document.getElementById(id);
export const ui=Object.fromEntries(['game','scene','title','start','continue','hud','district','objective','job-type','goal','range','cash','wanted','health','hp','evade','toast','prompt','hint','map-side','radar','pause-button','pause','pause-title','key-guide','resume','to-title'].map(id=>[id,$(id)]));
const money=new Intl.NumberFormat('en-US');
const onFoot='<kbd>WASD</kbd> Move　 <kbd>SPACE</kbd> Sprint　 <kbd>CLICK</kbd> Fire';
const driving='<kbd>WASD</kbd> Drive　 <kbd>E / F</kbd> Exit';
let cachedHint;
const radar=ui.radar.getContext('2d');
function drawRadar(s,route,obj) {
  const p=s.player,g=radar,w=g.canvas.width,h=g.canvas.height,scale=.119;
  g.save();g.translate(w/2,h/2);g.scale(scale,scale);g.translate(-p.x,-p.y);
  const left=p.x-w/2/scale,top=p.y-h/2/scale;
  rect(g,'#413d50',left,top,w/scale,h/scale);
  rect(g,'#54777a',COAST,top,w/scale,h/scale);
  for(const side of [park,stadium]) rect(g,side===park?'#67765e':'#8d6469',side.x,side.y,side.w,side.h);
  for(const b of s.world.buildings) rect(g,'#695366',b.x,b.y,b.w,b.h);
  for(const x of roads) line(g,'#85818a',28,x,0,x,SIZE);
  for(const y of roadRows) line(g,'#85818a',28,0,y,COAST,y);
  if(route) for(let i=1;i<route.length;i++) line(g,'#ffcb75',13,route[i-1].x,route[i-1].y,route[i].x,route[i].y);
  for(const c of s.cars) if(c.role==='police') ellipse(g,'#ff828c',c.x,c.y,26);
  if(!obj) jobs.forEach((job,id)=>{if(!s.done.includes(id))ellipse(g,'#ffcc73',job.start.x,job.start.y,23);});
  g.restore();
  if(obj) {
    const x=clamp(w/2+(obj.pos.x-p.x)*scale,6,w-6),y=clamp(h/2+(obj.pos.y-p.y)*scale,6,h-6);
    poly(g,'#ffd37b',[[x,y-5],[x+5,y],[x,y+5],[x-5,y]]);
  }
  g.save();g.translate(w/2,h/2);g.rotate(p.a);
  poly(g,'#2a2638',[[11,0],[-7,7],[-4,0],[-7,-7]]);
  poly(g,'#fff2ca',[[8,0],[-5,5],[-2,0],[-5,-5]]);g.restore();
  rect(g,'#292638e8',w-24,3,20,27);
  g.font='bold 10px monospace';g.textAlign='center';g.fillStyle='#ffe4aa';g.fillText('N',w-14,14);
  poly(g,'#ffe4aa',[[w-14,17],[w-18,25],[w-14,23],[w-10,25]]);
}
export function updateHud(s,route,shot) {
  const p=s.player,obj=objective(s);
  ui.district.textContent=p.x>3880?'MARINA PROMENADE':p.x>3020&&p.y>1800&&p.y<2450?'STADIUM QUARTER':p.x>2380&&p.x<3000&&p.y>1250&&p.y<1900?'SUNSET PARK':p.x>1500?'CORAL ROW':'SUNSET DISTRICT';
  ui.cash.textContent='$'+money.format(s.cash);
  const stars='★'.repeat(s.stars)+'☆'.repeat(5-s.stars);
  if(ui.wanted.dataset.stars!==stars) {
    ui.wanted.dataset.stars=stars;
    ui.wanted.innerHTML='<b>'+stars.slice(0,s.stars)+'</b>'+stars.slice(s.stars);
    ui.wanted.setAttribute('aria-label',s.stars+' of 5 wanted stars');
  }
  ui.health.style.width=clamp(p.hp,0,100)+'%';
  ui.hp.textContent=Math.ceil(p.hp);
  ui.evade.hidden=!s.stars||s.unseen<1;
  ui.evade.textContent='OUT OF SIGHT   '+Math.ceil(20-s.unseen)+'s';
  ui.objective.hidden=!obj;
  if(obj) {
    ui['job-type'].textContent=obj.tag;
    ui.goal.textContent=obj.text;
    ui.range.textContent=Math.round(distance(obj.pos,p)/4)+' m';
  }
  ui.toast.hidden=s.toastTime<=0;
  ui.toast.textContent=s.toast;
  const c=p.car?null:nearbyCar(s);
  ui.prompt.hidden=!c||Boolean(shot);
  if(c) ui.prompt.textContent=c.role==='traffic'?'Hold E · Carjack'+(s.jack?'  '+Math.floor(s.jack/.72*100)+'%':''):'F · Enter vehicle';
  const hint=p.car?driving:onFoot;
  if(hint!==cachedHint) {cachedHint=hint;ui.hint.innerHTML=hint;}
  ui['map-side'].textContent=s.stars?'PURSUIT':'LOCAL';
  drawRadar(s,route,obj);
}
