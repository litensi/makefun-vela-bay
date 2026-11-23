import assert from 'node:assert/strict';
import {jobs, solid, TILES} from '../game/src/world.js';
import {newGame, step, objective, loadSave, pose} from '../game/src/simulation.js';

const memory=new Map();
const storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
const state=newGame(1,storage);
const input={keys:new Set(),pressed:new Set(),aim:null,fire:false};
function run(s,frames,keys=[],pressed=[]) {
  input.keys=new Set(keys);
  input.pressed=new Set(pressed);
  for(let i=0;i<frames;i++) {
    step(s,input,1/60);
    input.pressed.clear();
  }
}
assert.equal(TILES,100);
assert.equal(state.world.blocks.length,56);
const spawnY=state.player.y;
run(state,20,['KeyW','Space']);
assert.ok(state.player.y<spawnY-80);
const parked=state.cars.find(c=>c.role==='parked'&&c.x===758);
Object.assign(state.player,{x:parked.x+32,y:parked.y});
run(state,1,[],['KeyF']);
assert.equal(state.player.car,parked);
const parkedY=parked.y;
run(state,45,['KeyW']);
assert.ok(parked.y>parkedY+60);
run(state,1,[],['KeyE']);
assert.equal(state.player.car,null);

const traffic=state.cars.find(c=>c.role==='traffic');
Object.assign(state.player,{x:traffic.x,y:traffic.y+29});
run(state,50,['KeyE']);
assert.equal(state.player.car,traffic);
assert.ok(state.stars>=1);
assert.ok(state.cars.some(c=>c.role==='police'));
run(state,1,[],['KeyF']);
assert.equal(state.player.car,null);

const escaped=newGame(2);
escaped.stars=1;escaped.heat=1;escaped.spawnDelay=30;
run(escaped,1199);
assert.equal(escaped.stars,1);
run(escaped,2);
assert.equal(escaped.stars,0);

const mission=newGame(1,storage);
for(const [id,job] of jobs.entries()) {
  assert.ok(!solid(mission.world,job.start.x,job.start.y));
  assert.ok(!solid(mission.world,job.pickup.x,job.pickup.y));
  assert.ok(!solid(mission.world,job.end.x,job.end.y));
  Object.assign(mission.player,job.start);
  run(mission,1);
  assert.equal(objective(mission).pos,job.pickup);
  const crew=mission.people.filter(p=>p.kind==='crew'&&p.hp>0);
  for(const enemy of crew) {
    assert.ok(!solid(mission.world,enemy.x,enemy.y));
    Object.assign(mission.player,{x:enemy.x,y:enemy.y-29});
    input.aim=enemy;input.fire=true;
    run(mission,36);
    input.fire=false;
    assert.ok(enemy.hp<=0,'pistol should clear the crew');
  }
  Object.assign(mission.player,job.pickup);
  run(mission,1);
  assert.equal(objective(mission).pos,job.end);
  assert.deepEqual(newGame(1,null,loadSave(storage)).mission,{id,stage:'deliver'});
  Object.assign(mission.player,job.end);
  run(mission,1);
  assert.ok(mission.done.includes(id));
}
assert.equal(loadSave(storage).cash,2300);
assert.deepEqual(loadSave(storage).done,[0,1]);
for(const shot of ['street','chase','mission']) {
  const a=newGame(1),b=newGame(1);
  pose(a,shot);pose(b,shot);
  assert.deepEqual(a.player,b.player);
}
console.log('Simulation smoke passed: sprint, drive, exit, carjack, police, evasion, both jobs, save, and shot poses.');
