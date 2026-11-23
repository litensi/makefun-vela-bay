import { drawAirLight, drawHelicopter, drawImpacts } from './action-art.js';
import { activityMarkers } from './activities.js';
import { clamp, BLOCK, ROAD, SHORE, SIZE } from './city.js';
import { paintGround } from './city-art.js';
import { markers } from './missions.js';

const oval=(g,c,x,y,rx,ry)=>{
  g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();
};
const box=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
const stroke=(g,c,w,x,y,tx,ty)=>{
  g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(tx,ty);g.stroke();
};
export function createView(canvas){
  const g=canvas.getContext('2d',{alpha:false});
  let width,height,ratio;
  const resize=()=>{
    width=innerWidth;height=innerHeight;ratio=Math.min(2,devicePixelRatio||1);
    canvas.width=width*ratio;canvas.height=height*ratio;
  };
  resize();window.addEventListener('resize',resize);
  let ground, source;
  const camera={x:0,y:0,z:1};
  function draw(s,title){
    if(source!==s.city){source=s.city;ground=paintGround(s.city,s.seed);}
    const z=clamp(width/970,.87,1.75)*(title?.88:s.pose==='mission'?1.34:s.pose==='chase'?1.14:1);
    const center=title?{x:1580,y:1050}:s.pose==='mission'?{x:1650,y:1372}:s.player;
    camera.x=clamp(center.x-width/(2*z),0,Math.max(0,ground.width-width/z));
    camera.y=clamp(center.y-height/(2*z),0,Math.max(0,SIZE-height/z));
    camera.z=z;
    g.setTransform(ratio,0,0,ratio,0,0);
    box(g,'#315f62',0,0,width,height);
    g.scale(z,z);g.translate(-camera.x,-camera.y);
    g.drawImage(ground,0,0);
    if(s.heli)drawAirLight(g,s.heli);
    for(const t of s.skids){
      const dx=Math.cos(t.a),dy=Math.sin(t.a),alpha=t.life/2.2;
      for(const side of [-1,1])stroke(g,'rgba(30,35,34,'+alpha*.44+')',1.5,t.x-dy*side*6,t.y+dx*side*6,t.x+dx*7-dy*side*6,t.y+dy*7+dx*side*6);
    }
    for(const c of s.cars)drawCar(g,c,c===s.player.car);
    if(s.race)drawCar(g,s.race.rival,false);
    for(const p of s.people)drawPerson(g,p,p.shirt);
    for(const p of s.police){
      const cruiser=p.car??(p.cruiser?{...p,color:'#dbe6db'}:null);
      if(cruiser){
        const lit=Math.sin(s.time*12+p.x)>0;
        oval(g,lit?'#ff79613d':'#71aaff46',cruiser.x,cruiser.y,29,24);
        drawCar(g,cruiser,false,true,lit);
      }
      if(!p.cruiser)drawPerson(g,p,'#285676',true,true);
    }
    for(const p of s.guards)drawPerson(g,p,'#a34b58',true);
    if(!s.player.car&&!title){
      g.lineWidth=1.2;g.strokeStyle='#ffefd6';g.beginPath();
      g.arc(s.player.x,s.player.y,9,0,Math.PI*2);g.stroke();
      drawPerson(g,s.player,'#ec8b66',true);
    }
    for(const b of s.bullets)stroke(g,b.police?'#ffd3a0':'#fff2ad',1.8,b.x,b.y,b.x-Math.cos(b.a)*12,b.y-Math.sin(b.a)*12);
    drawImpacts(g,s.effects);
    if(s.heli)drawHelicopter(g,s.heli,s.time);
    if(!title)for(const m of [...activityMarkers(s),...markers(s)])drawMarker(g,m,s.time);
    g.setTransform(ratio,0,0,ratio,0,0);
    if(!title){
      const v=g.createRadialGradient(width*.52,height*.48,height*.1,width*.52,height*.48,Math.max(width,height)*.69);
      v.addColorStop(0,'#14232400');v.addColorStop(1,'#14232460');
      box(g,v,0,0,width,height);
    }
  }
  return {draw,worldPoint:(x,y)=>({x:camera.x+x/camera.z,y:camera.y+y/camera.z})};
}

function drawCar(g,c,player,police=false,lit=false){
  const lift=c.air?Math.sin(Math.PI*c.air/.76)*26:0;
  g.save();g.translate(c.x,c.y);g.rotate(c.a);
  box(g,'#19323275',-13,-4,33,15);
  g.restore();
  g.save();g.translate(c.x,c.y-lift);g.rotate(c.a);
  g.scale(1+lift*.005,1+lift*.005);
  if(player){
    g.strokeStyle='#b5ffe3';g.lineWidth=1;g.strokeRect(-18,-10,36,20);
  }
  for(const x of [-9,8])for(const y of [-8,5])box(g,'#233135',x,y,6,3);
  box(g,'#303d3b',-16,-7,32,14);
  box(g,c.color,-15,-6,30,12);
  box(g,'#fff2c967',-14,-6,29,1);
  box(g,'#294b55',-8,-5,17,10);
  box(g,c.color,-4,-5,8,10);
  box(g,'#a4c7bd',5,-4,2,8);
  box(g,'#f5e9bf',13,-5,2,3);box(g,'#f5e9bf',13,2,2,3);
  box(g,'#ad473d',-15,-5,2,3);box(g,'#ad473d',-15,2,2,3);
  if(police){
    box(g,'#293f55',-2,-5,4,10);
    box(g,lit?'#ff5545':'#b05f55',-2,-5,4,4);
    box(g,lit?'#507ab4':'#80cfff',-2,1,4,4);
  }
  g.restore();
}
function drawPerson(g,p,color,armed=false,police=false){
  g.save();g.translate(p.x,p.y);g.rotate(p.a);
  oval(g,'#1d32285e',2,3,7,4);
  if(p.down){oval(g,color,0,0,7,3);g.restore();return;}
  const stride=p.walk||p.phase?Math.sin(p.phase||p.x*.15)*2.6:0;
  stroke(g,'#36413a',2.5,-2,-2,-4+stride,-3);
  stroke(g,'#36413a',2.5,-2,2,-4-stride,3);
  oval(g,'#253939',0,0,5,5);
  oval(g,color,0,0,4.3,4.5);
  oval(g,police?'#b8c9c5':'#f3c18d',2,0,2.6,2.6);
  if(armed)stroke(g,'#222b2b',2,4,3,10,3);
  g.restore();
}
function drawMarker(g,m,time){
  const color=m.color??(m.active?'#ffcb77':'#a7ffce'), pulse=1+Math.sin(time*4)*.14;
  oval(g,color+'42',m.x,m.y,21*pulse,15*pulse);
  if(m.gate!==undefined){
    const dx=Math.sin(m.gate)*27,dy=Math.cos(m.gate)*27;
    stroke(g,color+'85',4,m.x-dx,m.y+dy,m.x+dx,m.y-dy);
    for(const side of [-1,1]){
      const x=m.x+dx*side,y=m.y-dy*side;
      stroke(g,color,2,x,y,x,y-16);
      oval(g,color,x,y-16,3,3);
    }
  }
  g.strokeStyle=color;g.lineWidth=1.5;g.beginPath();g.ellipse(m.x,m.y,16,11,0,0,Math.PI*2);g.stroke();
  if(!m.label)return;
  stroke(g,color,1,m.x,m.y-10,m.x,m.y-25);
  g.font='800 10px Arial';g.textAlign='center';
  const w=g.measureText(m.label).width+18;
  box(g,'#102123ed',m.x-w/2,m.y-43,w,17);
  box(g,color,m.x-w/2,m.y-43,2,17);
  g.fillStyle=color;g.fillText(m.label,m.x,m.y-31);
}

export function drawRadar(canvas,s){
  const g=canvas.getContext('2d'), w=canvas.width,h=canvas.height;
  const scale=.061, oy=(h-SIZE*scale)/2, ox=23;
  box(g,'#215b62',0,0,w,h);
  box(g,'#526b58',ox,oy,SHORE*scale,SIZE*scale);
  for(let i=0;i<=SIZE;i+=BLOCK){
    box(g,'#8f9d80',ox+i*scale,oy,ROAD*scale,SIZE*scale);
    box(g,'#8f9d80',ox,i*scale+oy,SHORE*scale,ROAD*scale);
  }
  for(const b of s.city.buildings)box(g,'#324842',ox+b.x*scale,oy+b.y*scale,b.w*scale,b.h*scale);
  const pos=p=>[ox+p.x*scale,clamp(oy+p.y*scale,3,h-3)];
  for(let y=438;y<SIZE;y+=341)box(g,'#b3ac81',ox+SHORE*scale,oy+y*scale,11,2);
  for(const m of [...activityMarkers(s),...markers(s)])oval(g,m.color??(m.active?'#ffd17e':'#9af3c2'),...pos(m),3,3);
  if(s.race)oval(g,'#fa9fef',...pos(s.race.rival),2,2);
  if(s.heli)oval(g,'#9ad7ff',...pos(s.heli),3,3);
  for(const p of s.police)oval(g,'#ff897a',...pos(p),2.5,2.5);
  const [x,y]=pos(s.player);
  g.save();g.translate(x,y);g.rotate(s.player.a);
  g.fillStyle='#fff4d2';g.beginPath();g.moveTo(5,0);g.lineTo(-3,-3);g.lineTo(-2,0);g.lineTo(-3,3);g.closePath();g.fill();g.restore();
}
// revision 2
