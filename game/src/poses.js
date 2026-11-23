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
    s.player={...playerAt(1696,1373),a:.28,cash:470};
    s.job=1;s.stage='target';s.done=[0];
    return;
  }
  const car={x:1510,y:1025,a:-.33,travel:.2,speed:207,color:'#d77252'};
  s.player={...playerAt(car.x,car.y),hp:72,cash:470,car,a:car.a};
  s.cars.push(car);
  s.wanted=3;s.alert=true;s.done=[0,1];
  for(const [x,y,a] of [[1430,1050,-.12],[1380,1026,.06],[1353,970,1.4]]){
    s.police.push({x:x+14,y:y-9,a,hp:2,car:{x,y,a,color:'#dbe6db'}});
  }
  for(let i=0;i<18;i++)s.skids.push({x:car.x-i*3.6,y:car.y+i*.67+i*i*.05,a:-.14-i*.015,life:2.1-i*.063});
  s.bullets.push({x:1474,y:1035,a:-.24,police:true});
}
