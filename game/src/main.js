import {newGame, loadSave, save, step, pose, objective} from './simulation.js';
import {city, rect} from './city-art.js';
import {actors, waypointRoute} from './actor-art.js';
import {skyline} from './title-art.js';
import {ui,updateHud} from './interface.js';

const params=new URLSearchParams(location.search);
const query=params.get('shot');
const shot=['title','street','chase','mission'].includes(query)?query:null;
const seed=Number(params.get('seed')||1)>>>0;
let storage;
try { storage=localStorage; } catch {}
let state, mode='title';
const g=ui.scene.getContext('2d',{alpha:false});
const input={keys:new Set(),pressed:new Set(),fire:false,aim:null};
const mouse={x:0,y:0,known:false};
let camera, width, height, density, last, accumulator=0, frame=0;

function resize() {
  width=innerWidth;height=innerHeight;density=Math.min(2,devicePixelRatio||1);
  ui.scene.width=Math.round(width*density);ui.scene.height=Math.round(height*density);
  draw();
}
function getCamera() {
  const p=state.player;
  const zoom=Math.min(1.35,Math.max(.67,height/720*(p.car?1.12:1.25)));
  const cx=p.x+(shot==='mission'?78:0);
  const cy=p.y+(shot==='chase'?63:shot==='street'?-26:0);
  const left=cx-width/zoom/2,top=cy-height/zoom/2;
  return {left,top,right:left+width/zoom,bottom:top+height/zoom,zoom};
}
function draw() {
  g.setTransform(density,0,0,density,0,0);
  if(mode==='title') {skyline(g,width,height,seed);return;}
  camera=getCamera();
  const {left,top,zoom}=camera,p=state.player;
  const obj=objective(state);
  const route=waypointRoute(state.world,p,obj?.pos);
  g.save();
  g.scale(zoom,zoom);g.translate(-left,-top);
  city(g,state,camera);actors(g,state,camera,route);
  g.restore();
  const haze=g.createLinearGradient(0,0,width,height);
  haze.addColorStop(0,'#ffc48227');haze.addColorStop(.58,'#ed986914');haze.addColorStop(1,'#4934522e');
  rect(g,haze,0,0,width,height);
  const edge=g.createRadialGradient(width*.52,height*.47,height*.25,width*.52,height*.47,width*.65);
  edge.addColorStop(0,'#3e2b4700');edge.addColorStop(1,'#3e2b4745');
  rect(g,edge,0,0,width,height);
  updateHud(state,route,shot);
  ui.game.classList.toggle('driving',Boolean(p.car));
}
function showTitle() {
  mode='title';
  ui.title.hidden=false;ui.hud.hidden=true;ui.pause.hidden=true;
  ui.game.classList.remove('playing','driving');
  ui.continue.disabled=!shot&&!loadSave(storage);
  draw();
}
function start(saved) {
  state=newGame(seed,storage,saved);
  if(!shot) save(state);
  if(shot) pose(state,shot);
  mode='play';ui.title.hidden=true;ui.hud.hidden=false;ui.pause.hidden=true;
  ui.game.classList.add('playing');
  last=undefined;accumulator=0;
  draw();
  if(!shot&&!frame) frame=requestAnimationFrame(tick);
}
function clearInput() {input.keys.clear();input.pressed.clear();input.fire=false;}
function pause() {
  if(mode!=='play')return;
  mode='pause';clearInput();save(state);
  ui.pause.hidden=false;
  ui['pause-title'].textContent=state.dead?'Wasted':'Paused';
  ui.resume.firstChild.textContent=state.dead?'Retry ':'Resume ';
  ui['key-guide'].hidden=state.dead;
}
function resume() {
  if(mode!=='pause')return;
  if(state.dead) {start(loadSave(storage));return;}
  mode='play';ui.pause.hidden=true;last=undefined;
}
function tick(now) {
  frame=0;
  if(mode==='title') return;
  if(mode==='play') {
    accumulator+=Math.min(.05,(now-(last??now))/1000);
    while(accumulator>=1/60) {
      const cam=getCamera();
      input.aim=mouse.known?{x:cam.left+mouse.x/cam.zoom,y:cam.top+mouse.y/cam.zoom}:null;
      step(state,input,1/60);
      input.pressed.clear();
      accumulator-=1/60;
    }
    draw();
    if(state.dead) pause();
  }
  last=now;
  frame=requestAnimationFrame(tick);
}
if(!shot) {
  ui.start.onclick=()=>start(null);
  ui.continue.onclick=()=>{const saved=loadSave(storage);if(saved)start(saved);};
  ui['pause-button'].onclick=pause;
  ui.resume.onclick=resume;
  ui['to-title'].onclick=showTitle;
  addEventListener('keydown',event=>{
    if(event.code==='Escape') {
      if(!event.repeat) {if(mode==='play')pause();else resume();}
      return;
    }
    if(mode!=='play'||!['KeyW','KeyA','KeyS','KeyD','KeyE','KeyF','Space'].includes(event.code))return;
    event.preventDefault();
    input.keys.add(event.code);
    if(!event.repeat)input.pressed.add(event.code);
  });
  addEventListener('keyup',event=>input.keys.delete(event.code));
  addEventListener('blur',clearInput);
  addEventListener('pointermove',event=>Object.assign(mouse,{x:event.clientX,y:event.clientY,known:true}));
  ui.scene.addEventListener('pointerdown',event=>{
    if(mode==='play'&&event.button===0) {
      Object.assign(mouse,{x:event.clientX,y:event.clientY,known:true});input.fire=true;input.pressed.add('Fire');
    }
  });
  addEventListener('pointerup',()=>{input.fire=false;});
}
addEventListener('resize',resize);
resize();
if(shot&&shot!=='title') start(null);else showTitle();
