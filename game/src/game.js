import { interactActivity, nearbyActivity, updateRace } from './activities.js';
import { createCity, garage, jobs, raceRoute, random } from './city.js';
import { nearestCar, playerAt, populate, toggleCar, updateActors } from './actors.js';
import { interactJob, nearbyJob, nextJob, readSave, restore, save, updateMission } from './missions.js';
import { applyPose } from './poses.js';
import { createView, drawRadar } from './world-view.js';

const params=new URLSearchParams(location.search);
const requested=params.get('shot');
const pose=['title','street','chase','mission'].includes(requested)?requested:null;
const seed=Number(params.get('seed')??1)>>>0;
const $=id=>document.getElementById(id);
const view=createView($('city'));
const input={keys:new Set(),mouse:{x:0,y:0,screenX:0,screenY:0,down:false,active:false}};
let mode='title',s;

function fresh(worldSeed,data){
  const city=createCity(worldSeed);
  s={seed:worldSeed,city,rng:random(worldSeed+51),pose,player:playerAt(),...populate(city,worldSeed),
    bullets:[],police:[],guards:[],skids:[],effects:[],heli:null,race:null,time:0,cooldown:0,wanted:0,unseen:0,alert:false,spawn:0,
    done:[],job:null,stage:null,notice:'',noticeTime:0,autosave:0};
  restore(s,data);
}
function menu(next){
  mode=next;
  $('hud').hidden=next!=='play';
  $('menu').hidden=next==='play';
  $('menu').classList.toggle('pause',next==='pause');
  $('menu-title').innerHTML=next==='pause'?'GAME<span>PAUSED</span>':'VELA<span>BAY</span>';
  $('menu-copy').textContent=next==='pause'?'Take a breath. The bay can wait.':'Follow the money through Vela Bay.';
  $('new').hidden=next!=='title';
  $('continue').hidden=next!=='title'||!readSave()||Boolean(pose);
  $('resume').hidden=$('exit').hidden=next!=='pause';
  input.keys.clear();input.mouse.down=false;
}
function begin(data){
  fresh(data?.seed??seed,data);menu('play');save(s);
}
$('new').onclick=()=>{if(!pose)begin(null);};
$('continue').onclick=()=>{if(!pose)begin(readSave());};
$('resume').onclick=()=>menu('play');
$('exit').onclick=()=>{save(s);menu('title');};
window.addEventListener('pagehide',()=>{if(!pose&&mode!=='title')save(s);});
window.addEventListener('blur',()=>{input.keys.clear();input.mouse.down=false;});
window.addEventListener('keydown',e=>{
  if(pose)return;
  const key=e.key.toLowerCase();
  if(key==='escape' && !e.repeat && mode!=='title'){
    if(mode==='play')save(s);
    menu(mode==='play'?'pause':'play');return;
  }
  if(mode!=='play')return;
  if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))e.preventDefault();
  input.keys.add(key);
  if(key==='e'&&!e.repeat){
    if(interactJob(s)||interactActivity(s)||toggleCar(s))save(s);
  }
});
window.addEventListener('keyup',e=>input.keys.delete(e.key.toLowerCase()));
const aim=e=>Object.assign(input.mouse,{active:true,screenX:e.clientX,screenY:e.clientY});
window.addEventListener('pointermove',e=>{if(!pose&&mode==='play')aim(e);});
$('city').addEventListener('pointerdown',e=>{if(!pose&&mode==='play'&&e.button===0){aim(e);input.mouse.down=true;}});
window.addEventListener('pointerup',()=>{input.mouse.down=false;});
window.addEventListener('pointercancel',()=>{input.mouse.down=false;});

let hudCache={};
function set(id,content){
  if(hudCache[id]===content)return;
  hudCache[id]=content;$(id).textContent=content;
}
function hud(){
  const p=s.player,job=jobs[s.job];
  set('district',p.x>1650?'VESPER WATERFRONT':p.y<880?'MARKET ROW':'SOUTH QUAY');
  const next=jobs[nextJob(s)],race=s.race;
  set('objective-label',race?'STREET RACE':job?'ACTIVE CONTRACT':s.wanted?'WANTED':next?'FREE ROAM':'CONTRACTS COMPLETE');
  set('objective-text',race?'Quay Circuit':job?job.name:s.wanted?'Lose the police':next?'Find a contact':'The bay is yours');
  set('objective-detail',race?race.clock<0?'Starting in '+Math.ceil(-race.clock):
    'Checkpoint '+race.next+'/'+(raceRoute.length-1)+' · Kira '+Math.min(race.rivalNext,raceRoute.length-1)+'/'+(raceRoute.length-1)+' · '+race.clock.toFixed(1)+'s':
    s.stage==='escape'||(s.wanted&&!job)?'Break line of sight or drive to the Pay & Spray.':
    job?job.detail:next?'Meet '+next.by+' at the mint marker.':'Three contracts paid out.');
  if(hudCache.stars!==s.wanted){
    hudCache.stars=s.wanted;$('stars').innerHTML='<b>'+'★'.repeat(s.wanted)+'</b>'+'☆'.repeat(5-s.wanted);
    $('stars').setAttribute('aria-label',s.wanted+' of 5 wanted stars');
  }
  set('heat',s.wanted?s.heli?.lock?'SEARCHLIGHT LOCK':s.alert?'POLICE IN PURSUIT':s.heli?'AIR UNIT SEARCHING':'OUT OF SIGHT':'NO ACTIVE WARRANT');
  const hp=Math.ceil(p.hp);
  set('hp',hp+'%');$('health').style.width=hp+'%';
  set('cash','$'+p.cash.toLocaleString('en-US'));
  set('mode',p.car?.air?'AIRBORNE':p.car?'DRIVING  /  '+Math.round(Math.abs(p.car.speed)*.36)+' KM/H  /  SPACE DRIFT':'ON FOOT  /  SHIFT SPRINT  /  LMB FIRE');
  const near=nearbyJob(s);
  const activity=nearbyActivity(s);
  set('prompt',near&&!p.car?'E   /   '+(near.active?'Complete objective':'Speak to contact'):
    activity==='garage'&&p.car&&s.wanted?'E   /   Respray · $'+garage.fee:
    activity==='race'&&p.car?'E   /   Enter Quay Circuit':
    p.car?'E   /   Exit vehicle':nearestCar(s)?'E   /   Take vehicle':'');
  set('toast',s.noticeTime>0?s.notice:'');
  drawRadar($('minimap'),s);
}
fresh(seed,null);
if(pose)applyPose(s,pose);
menu(pose&&pose!=='title'?'play':'title');
let last=performance.now();
function frame(now){
  const dt=Math.max(0,Math.min((now-last)/1000,.025));
  last=now;
  if(mode==='play'&&!pose){
    s.time+=dt;s.noticeTime-=dt;s.autosave+=dt;
    const world=view.worldPoint(input.mouse.screenX,input.mouse.screenY);
    Object.assign(input.mouse,world);
    updateActors(s,input,dt);updateRace(s,dt);updateMission(s);
    if(s.autosave>3){s.autosave=0;save(s);}
  }
  view.draw(s,mode==='title');
  if(mode==='play')hud();
  if(!pose)requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
if(pose)window.addEventListener('resize',()=>requestAnimationFrame(frame));
