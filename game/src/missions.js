// Manages mission progression, map markers, and saved game state.
import { jobs, distance, START } from './city.js';
import { playerAt, raiseHeat } from './actors.js';

const SAVE_KEY='vela-bay-v1';
export function readSave() {
  try{
    const data=JSON.parse(localStorage.getItem(SAVE_KEY));
    return data?.version===1 && Array.isArray(data.done) ? data : null;
  }catch{return null;}
}
export function save(s) {
  if(s.pose)return;
  const {x,y,hp,cash}=s.player;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,seed:s.seed,x,y,hp,cash,done:s.done,job:s.job,stage:s.stage,wanted:s.wanted}));}catch{}
}
export function restore(s,data) {
  if(!data)return;
  const {x,y,hp,cash,done,job,stage}=data;
  s.player={...playerAt(x,y),hp,cash};s.done=done;s.job=job;s.stage=stage;
  s.wanted=data.wanted??(stage==='escape'?2:0);
}
export function markers(s) {
  if(s.job!==null){
    const job=jobs[s.job];
    const [x,y]=job.target;
    return [{x,y,label:s.stage==='escape'?'DEBT COLLECTED':job.task.toUpperCase(),id:s.job,active:true}];
  }
  return jobs.flatMap((job,id)=>{
    if(s.done.includes(id))return [];
    const [x,y]=job.contact;
    return [{x,y,label:job.name.toUpperCase(),id,active:false}];
  });
}
export function nearbyJob(s) {
  return markers(s).find(m=>distance(m,s.player)<35 && s.stage!=='escape');
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
  if(!marker.active){
    s.job=marker.id;s.stage='target';s.notice=jobs[s.job].name+' started';s.noticeTime=3;
  }else if(s.job===0)finish(s);
  else{
    s.stage='escape';raiseHeat(s,2);s.notice='Cash secured. Lose the police.';s.noticeTime=4;
  }
  save(s);
  return true;
}
export function updateMission(s){
  if(s.stage==='escape'&&!s.wanted)finish(s);
  if(s.player.hp<=0){
    s.player={...playerAt(START.x,START.y),cash:Math.max(0,s.player.cash-100)};
    s.wanted=0;s.police=[];s.bullets=[];
    if(s.stage==='escape')s.stage='target';
    s.notice='Back at South Quay';s.noticeTime=4;
    save(s);
  }
}
