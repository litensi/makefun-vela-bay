// Canvas artwork shared by live play and the frozen capture scenes.
export function drawAirLight(g,h){
  const x=h.beamX,y=h.beamY;
  g.save();
  const gradient=g.createLinearGradient(h.x,h.y-39,x,y);
  gradient.addColorStop(0,'#fffbdcb0');
  gradient.addColorStop(1,'#fff2b64a');
  const angle=Math.atan2(y-h.y+39,x-h.x);
  const dx=Math.sin(angle)*33,dy=Math.cos(angle)*23;
  g.fillStyle=gradient;g.beginPath();g.moveTo(h.x,h.y-39);
  g.lineTo(x+dx,y-dy);g.lineTo(x-dx,y+dy);g.fill();
  const pool=g.createRadialGradient(0,0,5,0,0,40);
  pool.addColorStop(0,'#fffbdca9');pool.addColorStop(.8,'#ffe9a35a');pool.addColorStop(1,'#ffedaf00');
  g.translate(x,y);g.scale(1,.68);
  g.fillStyle=pool;g.fillRect(-40,-40,80,80);
  g.strokeStyle='#fff1b598';g.lineWidth=1;
  g.beginPath();g.arc(0,0,35,0,Math.PI*2);g.stroke();
  g.restore();
}
function rotor(g,x,y,a,r,color){
  g.save();g.translate(x,y);g.rotate(a);g.strokeStyle=color;
  g.lineWidth=2.5;g.beginPath();
  g.moveTo(-r,0);g.lineTo(r,0);g.moveTo(0,-r);g.lineTo(0,r);g.stroke();g.restore();
}
export function drawHelicopter(g,h,time){
  const spin=time*32;
  g.save();
  g.translate(h.x+24,h.y+19);g.rotate(h.a);
  g.fillStyle='#141f2a66';g.beginPath();g.ellipse(0,0,21,9,0,0,Math.PI*2);g.fill();
  g.fillRect(-34,-2,26,4);rotor(g,0,0,spin,35,'#1820274e');
  g.restore();
  g.save();g.translate(h.x,h.y-39);g.rotate(h.a);
  g.fillStyle='#202b38';g.fillRect(-38,-3,29,6);
  g.fillRect(-38,-7,5,14);
  g.fillStyle='#e8e9d7';g.fillRect(-12,-12,28,2);g.fillRect(-12,10,28,2);
  g.fillStyle='#28374b';g.beginPath();g.ellipse(0,0,22,10,0,0,Math.PI*2);g.fill();
  g.fillStyle='#e8e9d7';g.fillRect(-12,-8,22,16);
  g.fillStyle='#49768e';g.beginPath();g.ellipse(12,0,9,7,0,0,Math.PI*2);g.fill();
  g.fillStyle='#234b71';g.font='bold 6px Arial';g.textAlign='center';g.fillText('VBPD',-2,2);
  g.fillStyle='#ff8475';g.fillRect(-6,8,4,2);
  g.fillStyle='#97eaff';g.fillRect(-6,-10,4,2);
  rotor(g,0,0,spin-.25,35,'#d9ecf24f');
  rotor(g,0,0,spin,35,'#233340af');
  g.restore();
}
export function drawImpacts(g,particles){
  g.save();
  for(const p of particles){
    const alpha=p.life/p.total;
    g.globalAlpha=alpha;
    g.beginPath();
    if(p.blood){
      g.fillStyle='#ad3d50';g.arc(p.x,p.y,2+(1-alpha)*3,0,Math.PI*2);g.fill();
    }else{
      g.strokeStyle='#ffdb81';g.lineWidth=1.5+alpha;g.shadowColor='#ff8d49';g.shadowBlur=7;
      g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*.08,p.y-p.vy*.08);g.stroke();
      g.shadowBlur=0;
    }
  }
  g.restore();
}
