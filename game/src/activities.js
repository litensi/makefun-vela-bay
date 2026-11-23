import { distance, garage, raceRoute } from './city.js';
import { clearHeat } from './actors.js';

const [start]=raceRoute;
export function activityMarkers(s){
  const race=s.race;
  return [
    {...garage,label:s.wanted?'RESPRAY · $'+garage.fee:'',color:'#79eaff'},
    ...(race?[{...raceRoute[race.next],label:race.next===raceRoute.length-1?'FINISH':'CHECKPOINT '+race.next,
      gate:Math.atan2(raceRoute[race.next].y-raceRoute[race.next-1].y,raceRoute[race.next].x-raceRoute[race.next-1].x),color:'#fa9fef',active:true}]:
      [{...start,label:'QUAY CIRCUIT',color:'#fa9fef'}]),
  ];
}
export function nearbyActivity(s){
  if(distance(s.player,garage)<36 && s.player.car && s.wanted)return 'garage';
  if(s.player.car&&!s.race&&distance(s.player,start)<44)return 'race';
  return null;
}
export function interactActivity(s){
  const activity=nearbyActivity(s);
  if(!activity)return false;
  const p=s.player;
  if(p.car.air||Math.abs(p.car.speed)>35){s.notice='Pull up and stop first';}
  else if(activity==='garage'){
    if(p.cash<garage.fee)s.notice='A respray costs $'+garage.fee;
    else{
      p.cash-=garage.fee;
      p.car.color=p.car.color==='#72c5bc'?'#e49a69':'#72c5bc';
      clearHeat(s);
      s.notice='Fresh paint. Warrant cleared.';
    }
  }else{
    s.race={next:1,rivalNext:1,clock:-3,car:p.car,rival:{x:start.x,y:start.y+20,a:0,color:'#ce69bb'}};
    s.notice='Quay Circuit · Race Kira Sol';
  }
  s.noticeTime=4;
  return true;
}
export function updateRace(s,dt){
  const race=s.race;
  if(!race)return;
  if(s.player.car!==race.car||s.player.hp<=0){
    s.race=null;s.notice='Race abandoned';s.noticeTime=3;return;
  }
  race.clock+=dt;
  if(race.clock<0)return;
  const rival=race.rival,target=raceRoute[race.rivalNext];
  const range=distance(rival,target),step=154*dt;
  rival.a=Math.atan2(target.y-rival.y,target.x-rival.x);
  if(range<=step){rival.x=target.x;rival.y=target.y;race.rivalNext++;}
  else{rival.x+=Math.cos(rival.a)*step;rival.y+=Math.sin(rival.a)*step;}
  if(distance(s.player,raceRoute[race.next])<34)race.next++;
  const won=race.next===raceRoute.length;
  if(won||race.rivalNext===raceRoute.length){
    if(won)s.player.cash+=400;
    s.race=null;s.notice=won?'Quay Circuit won · +$400':'Kira Sol won the Quay Circuit';s.noticeTime=4;
  }
}
// revision 2
