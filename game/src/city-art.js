import { BLOCK, ROAD, SHORE, SIZE, garage, jobs, piers, ramps, random } from './city.js';

const rect=(g,color,x,y,w,h)=>{g.fillStyle=color;g.fillRect(x,y,w,h);};
function shape(g,color,points){
  g.fillStyle=color;g.beginPath();g.moveTo(...points[0]);
  for(const point of points.slice(1))g.lineTo(...point);
  g.closePath();g.fill();
}
function line(g,color,w,x,y,a,b){
  g.strokeStyle=color;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(a,b);g.stroke();
}
function oval(g,color,x,y,rx,ry){
  g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();
}

export function paintGround(city,seed){
  const image=document.createElement('canvas');
  image.width=2600;image.height=SIZE;
  const g=image.getContext('2d'),rng=random(seed+224);
  const water=g.createLinearGradient(SHORE,0,2240,0);
  water.addColorStop(0,'#59baa7');water.addColorStop(.36,'#268c89');water.addColorStop(1,'#1b626d');
  rect(g,water,0,0,image.width,SIZE);
  for(let i=0;i<3500;i++){
    const x=SHORE+rng()*840,y=rng()*SIZE;
    line(g,i%3?'#caffdf25':'#124f612b',1,x,y,x+3+rng()*28,y-1);
  }
  rect(g,'#588c81',1749,0,18,SIZE);
  rect(g,'#ede1ac',1748,0,7,SIZE);
  rect(g,'#435e59',1744,0,3,SIZE);
  rect(g,'#c9b18a',1732,0,12,SIZE);
  for(let y=0;y<SIZE;y+=8)rect(g,'#6a59443c',1732,y,12,1);

  rect(g,'#52605d',0,0,1732,SIZE);
  rect(g,'#cfb181',1714,0,18,SIZE);
  for(let i=0;i<1600;i++)rect(g,i%2?'#f3dc9f70':'#956d5660',1714+rng()*18,rng()*SIZE,1+rng()*2,1);
  for(let x=0;x<1732;x+=BLOCK){
    rect(g,'#626d65',x+4,0,ROAD-8,SIZE);
    line(g,'#ded0a15e',1,x+8,0,x+8,SIZE);
    line(g,'#ded0a15e',1,x+74,0,x+74,SIZE);
  }
  for(let y=0;y<SIZE;y+=BLOCK){
    rect(g,'#626d65',0,y+4,1732,ROAD-8);
    line(g,'#ded0a15e',1,0,y+8,1732,y+8);
    line(g,'#ded0a15e',1,0,y+74,1732,y+74);
  }
  for(let y=0;y<SIZE;y+=BLOCK)for(let x=0;x<1732;x+=BLOCK){
    rect(g,'#656f66',x+8,y+8,66,66);
    for(let j=92;j<BLOCK-11;j+=23){
      if(x+j<1732)rect(g,'#e8c685c9',x+j,y+40,11,2);
      rect(g,'#e8c685c9',x+40,y+j,2,11);
    }
    for(let i=14;i<72;i+=9){
      rect(g,'#d9dab49c',x+i,y+83,4,11);
      rect(g,'#d9dab49c',x+i,y-13,4,10);
      if(x+91<1732)rect(g,'#d9dab49c',x+84,y+i,10,4);
      rect(g,'#d9dab49c',x-13,y+i,10,4);
    }
  }
  for(const {x,y,park} of city.courts){
    rect(g,'#9e9279',x-15,y-15,248,248);
    rect(g,'#e1c9a1',x-13,y-13,244,244);
    rect(g,park?'#89a585':'#c4ab8a',x+5,y+5,207,207);
    for(let i=0;i<231;i+=12){
      rect(g,'#7a77652b',x-12+i,y-12,1,15);rect(g,'#7a77652b',x-12,y-12+i,15,1);
      rect(g,'#7a77652b',x-12+i,y+214,1,14);rect(g,'#7a77652b',x+214,y-12+i,14,1);
    }
    if(park){
      rect(g,'#d8c29a',x+101,y+5,14,207);rect(g,'#d8c29a',x+5,y+101,207,14);
      oval(g,'#d8c29a',x+108,y+108,32,32);oval(g,'#5a8380',x+108,y+108,24,24);
      oval(g,'#82c8b9',x+108,y+108,20,20);oval(g,'#c9e6d5',x+108,y+108,6,6);
      for(let i=0;i<50;i++)rect(g,'#c5d69464',x+8+rng()*200,y+8+rng()*200,2,2);
    }else{
      for(let i=0;i<6;i++)line(g,'#e9dabc90',1,x+125+i*13,y+194,x+125+i*13,y+211);
    }
  }
  for(let i=0;i<23000;i++){
    const x=rng()*1732,y=rng()*SIZE;
    rect(g,i%2?'#172e2417':'#fff2c11c',x,y,1+rng()*4,1);
  }
  for(const [y,length] of piers){
    rect(g,'#164a5260',1755,y+9,length+8,42);
    rect(g,'#655849',1752,y,length,42);
    rect(g,'#bc9870',1752,y+2,length,35);
    for(let x=1754;x<1752+length;x+=6)line(g,'#6e59485e',1,x,y+3,x,y+36);
    line(g,'#ead3a0',2,1754,y+3,1750+length,y+3);
    for(let x=1772;x<1752+length;x+=41){rect(g,'#544a3d',x,y-3,4,5);rect(g,'#544a3d',x,y+35,4,7);}
  }
  for(const {x,y,a,mooring,color} of city.boats){
    line(g,'#f2d5a9',.8,x-18,y,x-28,mooring);
    line(g,'#f2d5a9',.8,x+20,y,x+26,mooring);
    g.save();g.translate(x,y);g.rotate(a);
    shape(g,'#163d4966',[[-25,4],[20,4],[29,13],[17,21],[-22,20]]);
    shape(g,'#283f4e',[[-27,-8],[13,-9],[30,0],[13,9],[-27,8]]);
    shape(g,color>.5?'#f4d6a0':'#e78172',[[-24,-6],[13,-7],[26,0],[13,7],[-24,6]]);
    rect(g,'#365d62',-7,-5,14,10);rect(g,'#faf0cc',-5,-4,8,8);
    line(g,'#fff2ba',1,5,0,20,0);
    g.restore();
  }
  for(const [x,y,label] of [[1123,1131,'QUAY MOTOR INN'],[1426,845,'VESPER MARKET'],[1515,1206,'SOUTH QUAY'],[775,934,'MARKET ROW']]){
    g.font='bold 10px Arial';g.textAlign='left';
    const w=g.measureText(label).width+12;
    rect(g,'#2b453b45',x+3,y+3,w,14);
    rect(g,'#416c62',x,y,w,14);
    rect(g,'#e6ac78',x,y,3,14);
    g.fillStyle='#f8deb2';g.fillText(label,x+7,y+10);
  }
  for(const umbrella of city.umbrellas)drawUmbrella(g,umbrella);
  for(const b of city.buildings) drawBuilding(g,b);
  for(const ramp of ramps)drawRamp(g,ramp);
  const {x,y}=garage;
  rect(g,'#303a43',x-36,y-20,72,40);
  g.strokeStyle='#79eaff';g.lineWidth=1.6;g.strokeRect(x-34,y-18,68,36);
  for(let i=-29;i<29;i+=9)line(g,'#79eaff75',1,x+i,y+18,x+i+7,y+12);
  neon(g,'PAY & SPRAY',x,y-19,'#8effec');
  for(const p of city.props){
    oval(g,'#29473844',p.x+4,p.y+5,7,3);
    rect(g,p.r>.5?'#89694f':'#5e897c',p.x-4,p.y-3,8,5);
    rect(g,'#efe0ac',p.x-4,p.y-3,8,1);
  }
  for(const p of city.palms)drawPalm(g,p);
  for(const [x,y] of [jobs[0].target,jobs[1].target]){
    rect(g,'#3b5a5d65',x-9,y-14,29,18);
    rect(g,'#397d80',x-11,y-21,24,14);rect(g,'#8fdbcf',x-11,y-21,24,4);
  }
  return image;
}

function drawUmbrella(g,{x,y,color}){
  const palette=[['#ec8b79','#f8e0ad'],['#54b3b2','#d6f2cb'],['#eba956','#fff0bd']];
  oval(g,'#50453255',x+7,y+7,13,9);
  g.save();g.translate(x,y);
  for(let i=0;i<8;i++){
    g.fillStyle=palette[color][i%2];g.beginPath();g.moveTo(0,0);
    g.arc(0,0,11,i*Math.PI/4,(i+1)*Math.PI/4);g.fill();
  }
  oval(g,'#fff0bd',0,0,1.8,1.8);
  g.restore();
}
function drawRamp(g,{x,y,a}){
  g.save();g.translate(x,y);g.rotate(a);
  rect(g,'#242f35',-15,-15,33,34);
  const deck=g.createLinearGradient(-16,0,15,0);
  deck.addColorStop(0,'#746452');deck.addColorStop(1,'#c29565');
  rect(g,deck,-16,-14,31,28);
  for(let i=-11;i<=10;i+=6)line(g,'#4b4239',1,i,-13,i,13);
  for(const side of [-1,1])line(g,'#faca75',2,-15,side*14,15,side*14);
  for(const offset of [-7,3]){
    line(g,'#fff4ba',1.5,offset-3,-5,offset+3,0);
    line(g,'#fff4ba',1.5,offset+3,0,offset-3,5);
  }
  g.restore();
}
function neon(g,label,x,y,color){
  g.save();g.font='bold 9px Arial';g.textAlign='center';
  const width=g.measureText(label).width+10;
  rect(g,'#262c40',x-width/2,y-10,width,14);
  g.shadowColor=color;g.shadowBlur=8;g.fillStyle=color;g.fillText(label,x,y);
  g.restore();
}

function drawBuilding(g,b){
  const {x,y,w,h,color,style,r}=b, t=7+Math.floor(r*6);
  shape(g,'#263f385c',[[x+8,y+10],[x+w+16,y+10],[x+w+24,y+h+18],[x+24,y+h+18],[x+5,y+h+7]]);
  rect(g,'#806756',x,y,w,h);
  rect(g,'#98755f',x,y+h-t,w,t);
  for(let i=7;i<w-5;i+=13){
    rect(g,'#534e44',x+i,y+h-t+3,7,t-4);
    rect(g,'#b5c1a2',x+i+1,y+h-t+4,5,2);
  }
  rect(g,'#5e6050',x+w-4,y+2,4,h-t);
  rect(g,color,x,y,w-4,h-t);
  rect(g,'#fff2c978',x,y,w-4,2);rect(g,'#fff2c94d',x,y,2,h-t);
  rect(g,'#66584b70',x+4,y+h-t-3,w-8,3);
  g.strokeStyle='#775e4f50';g.lineWidth=1;g.strokeRect(x+5,y+5,w-14,h-t-10);
  if(style===0){
    for(let j=9;j<h-t-6;j+=5)line(g,'#6c483f24',1,x+7,y+j,x+w-10,y+j);
    rect(g,'#fff1bc50',x+7,y+(h-t)/2,w-16,3);
  }
  if(style===1 || style===3){
    for(let j=0;j<3;j++){
      rect(g,'#655e5363',x+17+j*15,y+19,11,13);
      rect(g,'#eddfb7',x+15+j*15,y+16,10,11);
      for(let k=0;k<3;k++)rect(g,'#7b8375',x+17+j*15,y+18+k*2,6,1);
    }
  }
  if(style===2){
    rect(g,'#496479',x+16,y+16,34,23);
    for(let j=0;j<3;j++)line(g,'#a1b8a9',.7,x+16+j*11,y+16,x+16+j*11,y+39);
    line(g,'#a1b8a9',.7,x+16,y+27,x+50,y+27);
  }
  if(r>.25){
    const ax=x+w-19,ay=y+11;
    line(g,'#4f514975',1.3,ax,ay,ax+8,ay+10);
    line(g,'#ebdfbb',1,ax,ay+7,ax,ay-4);
    line(g,'#544d48',1,ax-5,ay-1,ax+5,ay-1);
    oval(g,'#655e5366',x+17,y+h-t-11,7,5);
    oval(g,'#d4cbb2',x+15,y+h-t-13,6,5);
    line(g,'#59595c',1,x+13,y+h-t-13,x+20,y+h-t-15);
  }
  if(r>.81)neon(g,['MARINA','BLUE HOUR','VELVET','MOTEL'][style],x+w/2,y+h-t-3,['#ffd09b','#8efbfa','#ffade9','#ff9d99'][style]);
  if(style!==3){
    for(let i=0;i<w-12;i+=6)rect(g,i%12?'#f4e3b7':style===0?'#a35d58':'#598b83',x+6+i,y+h-3,6,6);
  }
}
function drawPalm(g,{x,y,r}){
  line(g,'#334a3f50',3,x,y,x+16,y+10);
  oval(g,'#34453844',x+16,y+10,9,5);
  line(g,'#765b46',2,x,y,x-2,y-8);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4+r*3, length=9+Math.sin(i*2+r)*4+3;
    const dx=Math.cos(a)*length,dy=Math.sin(a)*length*.78;
    shape(g,i%2?'#3d7054':'#568860',[[x-2,y-8],[x+dx*.58-4,y-11+dy*.42],[x+dx-2,y-8+dy],[x+dx*.56,y-5+dy*.55]]);
    line(g,'#9ab6768e',.65,x-2,y-8,x+dx-2,y-8+dy);
  }
  oval(g,'#c0ba78',x-2,y-8,2,2);
}
