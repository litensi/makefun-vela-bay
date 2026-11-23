import {COAST, SIZE, ROAD, roads, roadRows, park, stadium} from './world.js';
import {lightGreen} from './simulation.js';

export function rect(g,color,x,y,w,h) {g.fillStyle=color;g.fillRect(x,y,w,h);}
export function poly(g,color,points) {
  g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=color;g.fill();
}
export function ellipse(g,color,x,y,rx,ry=rx,a=0) {
  g.beginPath();g.ellipse(x,y,rx,ry,a,0,Math.PI*2);g.fillStyle=color;g.fill();
}
export function line(g,color,width,x,y,x2,y2) {
  g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();
}
export function round(g,color,x,y,w,h,r=4) {g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
const roofs=['#e2a786','#ead0a4','#c68779','#a6b3a0','#dcc5a4','#c99d88'];
const faces=['#a16e61','#aa8a65','#9a6260','#6c877e','#9d866e','#946450'];
export function palm(g,x,y,size) {
  g.save();g.translate(x,y);g.scale(size/24,size/24);
  ellipse(g,'#39333842',16,12,30,8,.55);
  line(g,'#65514a',4,0,2,-4,-21);line(g,'#ba8b63',1,-1,0,-5,-20);
  for(let i=0;i<7;i++) {
    const a=i*.9;
    g.save();g.translate(-4,-21);g.rotate(a);
    g.beginPath();g.moveTo(-2,0);g.quadraticCurveTo(9,-14,24,-2);g.quadraticCurveTo(12,-5,8,4);g.closePath();
    g.fillStyle=['#486b55','#668762','#7b9362'][i%3];g.fill();g.restore();
  }
  ellipse(g,'#ba9a60',-4,-21,3);g.restore();
}
function building(g,b) {
  const {x,y,w,h,lift:t,color,id}=b, left=x-t*.38,top=y-t*.47;
  poly(g,'#3b2c384b',[[x,y],[x+w,y],[x+w+t*1.4,y+t*.96],[x+w+t*1.4,y+h+t*.96],[x+t*1.4,y+h+t*.96],[x,y+h]]);
  poly(g,faces[color],[[left,top+h],[left+w,top+h],[x+w,y+h],[x,y+h]]);
  poly(g,'#695358',[[left+w,top],[x+w,y],[x+w,y+h],[left+w,top+h]]);
  rect(g,'#605258',left-2,top-2,w+4,h+3);
  rect(g,roofs[color],left,top,w,h);
  rect(g,'#fff0bc65',left+3,top+3,w-6,4);
  rect(g,'#684d4a4f',left+6,top+h-9,w-12,5);
  rect(g,'#fff0bd48',left+4,top+8,4,h-15);
  rect(g,'#695a5543',left+12,top+17,w-24,h-33);
  rect(g,roofs[color],left+14,top+19,w-28,h-37);
  if(id%5===0) {
    round(g,'#614d59',left+19,top+47,w-34,h-68,7);
    round(g,'#efd3a3',left+15,top+42,w-34,h-68,7);
    round(g,'#599394',left+21,top+48,w-46,h-80,5);
    for(let stripe=0;stripe<5;stripe++) rect(g,'#9cbf9d89',left+25+stripe*19,top+62,13,1);
    for(let deck=0;deck<4;deck++) rect(g,'#996a61',left+23+deck*19,top+30,12,5);
  } else if(id%5===1) {
    for(let j=0;j<8;j++) {
      const awningX=left+13+j*16;
      rect(g,j%2?'#efe0ab':'#af685b',awningX,top+55,16,23);
      rect(g,'#7d536251',awningX,top+74,16,5);
    }
    rect(g,'#88685d',left+16,top+h-37,w-32,4);
  } else if(id%5===2) {
    for(let j=0;j<3;j++) {
      const ax=left+24+j*36,ay=top+h-69;
      rect(g,'#67546558',ax+5,ay+4,28,19);
      rect(g,'#4f6270',ax,ay,28,19);
      for(let k=1;k<4;k++) line(g,'#92a1a1',.8,ax+k*7,ay,ax+k*7,ay+19);
      line(g,'#92a1a1',.8,ax,ay+9,ax+28,ay+9);
    }
  } else if(id%5===3) {
    ellipse(g,'#75596161',left+w*.68+8,top+h*.53+7,23,16);
    ellipse(g,'#8f6d6a',left+w*.68,top+h*.53,21,17);
    ellipse(g,'#d0a990',left+w*.68,top+h*.53-4,19,14);
    ellipse(g,'#b68877',left+w*.68,top+h*.53-4,13,10);
  } else {
    for(let j=0;j<5;j++) {
      const ax=left+20+j*24,ay=top+65+(j%2)*20;
      round(g,'#806257',ax,ay,17,16,3);
      ellipse(g,'#668068',ax+8,ay+6,7,5);
      ellipse(g,'#9a9b69',ax+6,ay+3,4,3);
    }
  }
  for(let k=0;k<3;k++) {
    const ax=left+w*.27+k*25,ay=top+30+(id%4)*8;
    rect(g,'#49404b38',ax+5,ay+5,20,12);rect(g,'#a58d7e',ax,ay,18,11);
    rect(g,'#e1c2a0',ax+1,ay,16,3);
    for(let j=0;j<4;j++) rect(g,'#79676a',ax+3+j*3,ay+4,1,5);
  }
  for(let i=12;i<w-14;i+=23) {
    const wy=top+h+4;
    rect(g,'#4e4448',left+i,wy,13,Math.min(11,t*.27));
    rect(g,(id+i)%3?'#f4cd82':'#7c9b96',left+i+2,wy+2,9,5);
    line(g,'#67555a',1,left+i+6,wy+1,left+i+6,wy+7);
  }
  for(let i=13;i<h-18;i+=25) poly(g,'#dfb985',[[left+w+3,top+i],[x+w-2,y+i],[x+w-2,y+i+8],[left+w+3,top+i+8]]);
  const signWidth=105;
  const signX=left+(w-signWidth)/2, signY=top+h-22;
  rect(g,'#503e4e',signX-2,signY-2,signWidth+4,18);
  rect(g,['#a94e54','#337471','#755267','#456e66','#b07049','#73565e'][color],signX,signY,signWidth,14);
  g.font='bold 9px monospace';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#ffe1a6';g.fillText(b.shop,signX+signWidth/2,signY+7.5);
}
function parkArt(g) {
  const {x,y,w,h}=park;
  round(g,'#697858',x,y,w,h,19);round(g,'#87946a',x+9,y+9,w-18,h-18,16);
  g.strokeStyle='#ded0a4';g.lineWidth=12;g.beginPath();g.roundRect(x+28,y+28,w-56,h-56,56);g.stroke();
  rect(g,'#dbcea3',x+w/2-8,y+25,16,h-50);rect(g,'#dbcea3',x+25,y+h/2-8,w-50,16);
  ellipse(g,'#dfd4b5',x+w/2,y+h/2,56);ellipse(g,'#4b898a',x+w/2,y+h/2,45);ellipse(g,'#91bcac',x+w/2,y+h/2,27);
  for(let i=0;i<12;i++) {
    const a=i*Math.PI/6;palm(g,x+w/2+142*Math.cos(a),y+h/2+140*Math.sin(a),26);
  }
}
function stadiumArt(g) {
  const {x,y,w,h}=stadium;
  ellipse(g,'#55424b60',x+w/2+21,y+h/2+22,w/2,h/2-41);
  ellipse(g,'#75656b',x+w/2,y+h/2,w/2-3,h/2-43);
  ellipse(g,'#e6c7a4',x+w/2,y+h/2-17,w/2-5,h/2-48);
  ellipse(g,'#a26969',x+w/2,y+h/2-17,w/2-24,h/2-66);
  for(let i=0;i<4;i++) {
    g.strokeStyle='#ead0ae';g.lineWidth=2;g.beginPath();g.ellipse(x+w/2,y+h/2-17,w/2-29-i*8,h/2-71-i*8,0,0,7);g.stroke();
  }
  rect(g,'#698c6b',x+98,y+105,w-196,h-239);
  g.strokeStyle='#bdca90';g.strokeRect(x+103,y+109,w-206,h-247);line(g,'#bdca90',2,x+w/2,y+109,x+w/2,y+h-138);
  g.font='bold 14px monospace';g.fillStyle='#e1c09e';g.textAlign='center';g.fillText('VELA BAY STADIUM',x+w/2,y+55);
}
export function city(g,s,bounds) {
  const {left,right,top,bottom}=bounds;
  const inView=(x,y,w=0,h=0)=>x+w+100>left&&x-80<right&&y+h+80>top&&y-80<bottom;
  rect(g,'#566068',left,top,right-left,bottom-top);
  if(right>COAST-120) {
    rect(g,'#cfb792',COAST-114,top,114,bottom-top);
    rect(g,'#a58271',COAST-8,top,8,bottom-top);
    rect(g,'#4e8589',COAST,top,900,bottom-top);
    rect(g,'#88a99a',COAST,top,18,bottom-top);
    for(let y=Math.floor(top/44)*44;y<bottom;y+=44) for(let x=COAST+28;x<right;x+=63) {
      const wobble=(y*11+x*3)%31;line(g,'#bcd1aa59',1,x+wobble,y,x+wobble+22,y);
    }
    for(let y=260;y<SIZE;y+=555) if(inView(COAST,y,250,60)) {
      rect(g,'#375c6970',COAST,y+8,240,55);rect(g,'#c3a081',COAST-7,y,237,45);
      for(let j=0;j<231;j+=9)line(g,'#8b7163',1,COAST+j,y,COAST+j,y+45);
      for(let j=34;j<205;j+=67) {
        round(g,'#395565',COAST+j,y+51,17,46,8);round(g,'#e7d4ac',COAST+j-3,y+47,17,45,8);
        rect(g,'#657b82',COAST+j,y+60,11,13);
      }
    }
  }
  for(let iy=Math.floor(top/31);iy*31<bottom;iy++) for(let ix=Math.floor(left/33);ix*33<Math.min(right,COAST-115);ix++) {
    const n=((ix*173+iy*439)^((ix-iy)*53))>>>0;
    rect(g,n%2?'#c0a58c16':'#29293824',ix*33+n%30,iy*31+n%27,n%4+1,1);
  }
  for(const b of s.world.blocks) if(inView(b.x,b.y,b.w,b.h)) {
    rect(g,'#a88c7a',b.x-2,b.y-2,b.w+4,b.h+4);
    rect(g,'#d8bf9d',b.x,b.y,b.w,b.h);
    rect(g,'#bc9e85',b.x+36,b.y+36,b.w-72,b.h-72);
    line(g,'#f0d2a4',2,b.x,b.y,b.x+b.w,b.y);
    line(g,'#f0d2a4',2,b.x,b.y,b.x,b.y+b.h);
    for(let i=12;i<b.w;i+=22) {
      for(const dy of [0,b.h-35]) line(g,'#a48b784d',1,b.x+i,b.y+dy,b.x+i,b.y+dy+35);
      for(const dx of [0,b.w-35]) line(g,'#a48b784d',1,b.x+dx,b.y+i,b.x+dx+35,b.y+i);
    }
    for(const [dx,dy] of [[28,34],[b.w-30,b.h-21]]) {
      const x=b.x+dx,y=b.y+dy;
      line(g,'#5d435561',3,x,y,x+25,y+17);
      line(g,'#56515b',2,x,y,x-3,y-16);
      round(g,'#f2d2a1',x-7,y-18,9,3,1);
      round(g,'#986c62',x+7,y+2,13,6,2);
    }
    if(b.special==='park') parkArt(g);
    if(b.special==='stadium') stadiumArt(g);
    for(let i=1;i<10;i++) {
      const px=b.x+102+i*22;
      line(g,'#efe0c19d',1,px,b.y-21,px,b.y);
      line(g,'#efe0c19d',1,px,b.y+b.h,px,b.y+b.h+21);
    }
  }
  for(const x of roads) {
    if(x>left-100&&x<right+100) {
      for(let y=Math.floor(top/32)*32;y<bottom;y+=32) if(!roadRows.some(n=>Math.abs(n-y)<86)) rect(g,'#e0bc73b0',x-1,y,2,15);
      for(const side of [-1,1]) line(g,'#d7c3a056',1,x+side*44,top,x+side*44,bottom);
    }
  }
  for(const y of roadRows) {
    if(y<top-100||y>bottom+100) continue;
    for(let x=Math.floor(left/32)*32;x<Math.min(right,COAST-112);x+=32) if(!roads.some(n=>Math.abs(n-x)<86)) rect(g,'#e0bc73b0',x,y-1,15,2);
    for(const side of [-1,1]) line(g,'#d7c3a056',1,left,y+side*44,Math.min(right,COAST-112),y+side*44);
    for(const x of roads) if(inView(x-95,y-95,190,190)) {
      rect(g,'#566068',x-69,y-69,138,138);
      for(let i=-43;i<45;i+=11) for(const side of [-1,1]) {
        rect(g,'#e9dbc39c',x+i,y+side*65-8,5,16);
        rect(g,'#e9dbc39c',x+side*65-8,y+i,16,5);
      }
      for(const [dx,dy,a] of [[28,112,-Math.PI/2],[-28,-112,Math.PI/2],[-112,27,0],[112,-27,Math.PI]]) {
        g.save();g.translate(x+dx,y+dy);g.rotate(a);
        poly(g,'#f0d6aa73',[[12,0],[3,-6],[3,-2],[-12,-2],[-12,2],[3,2],[3,6]]);
        g.restore();
      }
      for(const side of [-1,1]) {
        const tx=x+side*80,ty=y+side*82;
        line(g,'#4d3d4866',3,tx,ty,tx+17,ty+11);
        line(g,'#55515a',3,tx,ty,tx,ty-13);
        round(g,'#383a42',tx-4,ty-23,8,13,2);
        ellipse(g,lightGreen(s.time,side===1)?'#8be0a2':'#ff7c65',tx,ty-17,2.4);
      }
    }
  }
  for(const b of s.world.buildings) if(inView(b.x,b.y,b.w,b.h)) building(g,b);
  for(const p of s.world.palms) if(inView(p.x,p.y)) palm(g,p.x,p.y,p.size);
}
