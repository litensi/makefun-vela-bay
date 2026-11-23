// Manages the story arc, map markers, and saved game state.
import { jobs, distance, START } from './city.js';
import { clearHeat, playerAt, raiseHeat } from './actors.js';

const SAVE_KEY='vela-bay-v1';
export const nextJob=s=>jobs.findIndex((_,id)=>!s.done.includes(id));

export function readSave() {
  try{
    const data=JSON.parse(localStorage.getItem(SAVE_KEY));
    return data?.version===1 && Array.isArray(data.done) ? data : null;
  }catch{return null;}
}
export function save(s) {
  if(s.pose)return;
  const {x,y,hp,cash,car}=s.player;
  const vehicle=car?{x,y,a:car.a,color:car.color}:null;
  try{
    localStorage.setItem(SAVE_KEY,JSON.stringify({
      version:1,seed:s.seed,x,y,hp,cash,done:s.done,job:s.job,stage:s.stage,wanted:s.wanted,
      guards:s.guards,vehicle,
    }));
  }catch{}
}
export function dockGuards(){
  return [[1681,1376],[1694,1420],[1734,1439]].map(([x,y],i)=>({x,y,a:-2.4,hp:2,shot:.85+i*.55}));
}
export function restore(s,data) {
  if(!data)return;
  const {x,y,hp,cash,done,job,stage,vehicle}=data;
  s.player={...playerAt(x,y),hp,cash};s.done=done;s.job=job;s.stage=stage;
  s.wanted=data.wanted??(stage==='escape'?2:0);
  if(job===2&&stage==='target')s.guards=data.guards??dockGuards();
  if(vehicle){
    const car={...vehicle,speed:0,travel:vehicle.a};
    const parked=s.cars.findIndex(c=>!c.ai&&distance(c,car)<12);
    if(parked>=0)s.cars.splice(parked,1);
    s.cars.push(car);s.player.car=car;s.player.a=car.a;
  }
}
export function markers(s) {
  const active=s.job!==null,id=active?s.job:nextJob(s);
  if(id<0||s.stage==='escape')return [];
  const job=jobs[id];
  const [x,y]=active?job.target:job.contact;
  const label=active?(id===2&&s.guards.length?'CLEAR THE DOCK':job.task.toUpperCase()):job.by.toUpperCase();
  return [{x,y,label,id,active}];
}
export function nearbyJob(s) {
  return markers(s).find(m=>distance(m,s.player)<35);
}
function finish(s) {
  const id=s.job,job=jobs[id];
  s.player.cash+=job.payout;s.done.push(id);s.job=null;s.stage=null;
  s.notice=job.name+' complete  /  +$'+job.payout;s.noticeTime=4;
  save(s);
}
export function interactJob(s) {
  const marker=nearbyJob(s);
  if(!marker)return false;
  if(s.player.car)return false;
  if(!marker.active){
    s.job=marker.id;s.stage='target';
    if(s.job===2)s.guards=dockGuards();
    s.notice=jobs[s.job].by+' · '+jobs[s.job].briefing;s.noticeTime=7;
  }else if(s.job===0)finish(s);
  else if(s.guards.length){
    s.notice='Clear the dock guards first';s.noticeTime=3;
  }else{
    const final=s.job===2;
    s.stage='escape';raiseHeat(s,Math.max(0,(final?3:2)-s.wanted));
    s.notice=(final?'Manifest secured.':'Cash secured.')+' Lose the police to get paid.';s.noticeTime=4;
  }
  save(s);
  return true;
}
export function updateMission(s){
  if(s.player.hp<=0){
    s.player={...playerAt(START.x,START.y),cash:Math.max(0,s.player.cash-100)};
    clearHeat(s);s.bullets=[];s.race=null;
    if(s.stage==='escape')s.stage='target';
    if(s.job===2)s.guards=dockGuards();
    s.notice='Back at South Quay';s.noticeTime=4;
    save(s);
    return;
  }
  if(s.stage==='escape'&&!s.wanted)finish(s);
}
