import { ellipse, line, poly, rect, round } from './city-art.js';
import { random } from './world.js';

export function skyline(g,w,h,seed) {
  g.save();g.scale(w/1280,h/720);
  const rng=random(seed+92);
  const sky=g.createLinearGradient(0,0,0,720);
  [[0,'#262137'],[.42,'#6e4357'],[.66,'#db806e'],[.78,'#f6b77e'],[1,'#454354']].forEach(([n,c])=>sky.addColorStop(n,c));
  rect(g,sky,0,0,1280,720);
  const glow=g.createRadialGradient(950,360,25,950,360,460);
  glow.addColorStop(0,'#ffc48788');glow.addColorStop(.55,'#d57a7755');glow.addColorStop(1,'#d57a7700');
  rect(g,glow,0,0,1280,720);
  ellipse(g,'#ffcf8c',966,372,148);
  g.save();g.beginPath();g.arc(966,372,148,0,7);g.clip();
  for(let y=374;y<524;y+=11) rect(g,'#d1817558',810,y,320,2+(y-374)/29);
  g.restore();
  for(let i=0;i<30;i++) {
    const x=rng()*1280,y=130+rng()*405;
    const length=20+rng()*185;
    line(g,'#ffdba626',rng()*2+.4,x,y,x+length,y);
  }
  const water=g.createLinearGradient(0,505,0,720);
  water.addColorStop(0,'#9f666f');water.addColorStop(1,'#353448');
  rect(g,water,0,522,1280,198);
  for(let i=0;i<245;i++) {
    const y=533+rng()*185,x=rng()*1280,l=seed%9+5+rng()*55;
    line(g,x>800&&x<1110?'#ffc18743':'#f1ae9260',.5+rng()*1.5,x,y,x+l,y);
  }
  poly(g,'#9b6571',[[0,471],[127,440],[234,459],[374,441],[534,475],[698,454],[840,495],[1030,483],[1280,462],[1280,548],[0,553]]);
  for(let layer=0;layer<3;layer++) {
    let x=-10;
    const base=528+layer*18;
    while(x<1300) {
      const bw=22+rng()*58,bh=18+rng()*(layer===1?159:72);
      if(layer===2&&x>795&&x<1115) {x+=65;continue;}
      const y=base-bh,c=['#855969','#593e54','#3c2e46'][layer];
      rect(g,c,x,y,bw,bh);
      rect(g,c,x+bw*.17,y-6,bw*.54,7);
      if(rng()>.64) {line(g,c,1.4,x+bw*.41,y-15,x+bw*.41,y);ellipse(g,'#f39d80',x+bw*.41,y-15,1.5);}
      for(let wy=y+12;wy<base-5;wy+=10) for(let wx=x+7;wx<x+bw-6;wx+=9) if(rng()>.5) rect(g,layer===0?'#bd8883':'#f0b17b9c',wx,wy,3,3);
      x+=bw+3+rng()*13;
    }
  }
  poly(g,'#403347',[[0,581],[254,574],[382,619],[527,635],[640,655],[850,684],[1057,720],[0,720]]);
  line(g,'#f4bd8566',3,0,604,380,632);
  for(let i=0;i<20;i++) ellipse(g,'#faad71',i*21,605+i*1.57,2);
  function silhouette(x,y,scale,lean) {
    g.save();g.translate(x,y);g.scale(scale,scale);
    const c='#272338';
    g.beginPath();g.moveTo(-8,0);g.quadraticCurveTo(lean*.36,-109,lean,-175);g.quadraticCurveTo(lean*.74,-100,7,0);g.fillStyle=c;g.fill();
    g.translate(lean,-171);
    for(let i=0;i<9;i++) {
      g.save();g.rotate(-2.9+i*.63);
      g.beginPath();g.moveTo(-5,1);g.quadraticCurveTo(29,-35,93,-5);g.quadraticCurveTo(55,-9,26,5);g.lineTo(13,4);g.closePath();g.fill();g.restore();
    }
    ellipse(g,c,0,1,11);g.restore();
  }
  silhouette(70,734,1.35,30);silhouette(1255,742,1.63,-34);silhouette(1169,698,.86,23);
  const vignette=g.createLinearGradient(0,0,840,0);
  vignette.addColorStop(0,'#211c3594');vignette.addColorStop(1,'#211c3500');
  rect(g,vignette,0,0,1280,720);
  for(let i=0;i<5400;i++) {
    const x=rng()*1280,y=rng()*720;
    rect(g,i%2?'#ffe4a310':'#130f231b',x,y,1+rng()*1.2,1);
  }
  g.restore();
}
