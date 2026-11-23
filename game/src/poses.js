import { impact, updateEffects } from './effects.js';
import { dockGuards } from './missions.js';
import { playerAt } from './actors.js';

export function applyPose(s,pose){
  s.time=4.08;
  if(pose==='title'){
    s.cars.push({x:1619,y:1050,a:0,color:'#e37f60'},{x:1669,y:952,a:Math.PI/2,color:'#f4c279'});
    return;
  }
  if(pose==='street'){
    s.player={...playerAt(1130,1048),a:.25,cash:120};
    return;
  }
  if(pose==='mission'){
    s.player={...playerAt(1593,1355),a:.13,hp:74,cash:1000};
    s.job=2;s.stage='target';s.done=[0,1];s.wanted=1;s.alert=true;
    s.guards=dockGuards();
    s.guards[0].y=1343;s.guards[1].y=1374;
    impact(s,1634,1363);
    impact(s,1634,1363);
    impact(s,1679,1346,true);
    impact(s,1703,1373);
    updateEffects(s,.085);
    s.bullets.push({x:1638,y:1359,a:.13},{x:1659,y:1353,a:3.22,police:true},{x:1671,y:1378,a:-2.84,police:true});
    return;
  }
  const car={x:1615,y:1347,a:-.24,travel:.2,speed:207,air:.50,color:'#d77252'};
  s.player={...playerAt(car.x,car.y),hp:72,cash:470,car,a:car.a};
  s.cars.push(car);
  s.wanted=3;s.alert=true;s.done=[0,1];
  s.heli={x:1555,y:1310,beamX:1619,beamY:1347,a:.62,lock:true};
  for(const [x,y,a] of [[1540,1376,-.12],[1490,1349,.06]]){
    s.police.push({x:x+14,y:y-9,a,hp:2,car:{x,y,a,color:'#dbe6db'}});
  }
  for(let i=0;i<18;i++)s.skids.push({x:car.x-i*3.6,y:car.y+i*.67+i*i*.05,a:-.14-i*.015,life:2.1-i*.063});
  s.bullets.push({x:1580,y:1357,a:-.24,police:true});
}
// revision 2
