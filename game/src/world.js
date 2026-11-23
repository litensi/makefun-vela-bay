export const TILE = 48, TILES = 100, SIZE = TILE * TILES, GRID = TILE * 12;
export const FIRST = 128, ROAD = 73, COAST = 4320;
export const roads = Array.from({length: 8}, (_, i) => FIRST + i * GRID);
export const roadRows = [...roads, FIRST + 8 * GRID];
export const terrain = {land:0, road:1, promenade:2, water:3};
export function tileAt(world,x,y) {
  return world.tiles[clamp(Math.floor(y/TILE),0,TILES-1)*TILES+clamp(Math.floor(x/TILE),0,TILES-1)];
}
export const palette = ['#bd5144','#edbf65','#498d87','#e7dbc5','#6389aa','#353f52','#d17b5d'];
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export function random(seed) {
  return () => {
    seed = (Math.imul(seed,1664525)+1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export const park = {x: 2525,y: 1370,w: 397,h:400};
export const stadium = {x: 3100,y: 1950,w: 395,h:390};
export const jobs = [
  {name:'The Marina Run', type:'COURIER', start:{x:806,y:798}, pickup:{x:1965,y:1373}, end:{x:4233,y:1918}, pay:850},
  {name:'Last Call', type:'SHAKEDOWN', start:{x:1949,y:824}, pickup:{x:3120,y:1372}, end:{x:2550,y:1938}, pay:1200},
];
export const shops = ['SOL MOTEL','CASA VELA','NIGHT SWIM','PALMA RECORDS','LUNA MARKET','CORAL CLUB','SUNDOWN','CAFÉ MAREA','LA SIRENA','VESPER AUTO','GOLD COAST','ORO HOTEL'];
export function makeWorld(seed) {
  const rng = random(seed);
  const blocks = [], buildings = [], palms = [], routes = [];
  for (let i=0;i<7;i++) for(let j=0;j<8;j++) {
    const x = roads[i]+ROAD, y=roadRows[j]+ROAD, w=GRID-ROAD*2;
    const special = i===4 && j===2 ? 'park' : i===5 && j===3 ? 'stadium' : '';
    blocks.push({x,y,w,h:w,special});
    routes.push([{x:x+17,y:y+17},{x:x+w-17,y:y+17},{x:x+w-17,y:y+w-17},{x:x+17,y:y+w-17}]);
    if (!special) for(let a=0;a<2;a++) for(let b=0;b<2;b++) {
      const bx=x+43+a*218+rng()*17, by=y+44+b*216+rng()*18;
      const bw=145+rng()*34, bh=133+rng()*40, h=22+rng()*28;
      buildings.push({x:bx,y:by,w:bw,h:bh,lift:h, color: Math.floor(rng()*6), shop:shops[(i*5+j*3+a+b*2)%shops.length], id:buildings.length});
    }
    for(let k=0;k<6;k++) {
      const edge=k%2===0;
      palms.push({x:edge?x+25:x+w-25,y:y+64+Math.floor(k/2)*145+rng()*23,size:17+rng()*10});
    }
  }
  for(let y=190;y<4650;y+=105) palms.push({x:4288,y,size:23+rng()*7});
  const tiles=new Uint8Array(TILES*TILES);
  for(let row=0;row<TILES;row++) for(let col=0;col<TILES;col++) {
    const x=(col+.5)*TILE,y=(row+.5)*TILE;
    tiles[row*TILES+col]=x>=COAST?terrain.water:x>=COAST-120?terrain.promenade:
      roads.some(n=>Math.abs(x-n)<ROAD)||roadRows.some(n=>Math.abs(y-n)<ROAD)?terrain.road:terrain.land;
  }
  return {blocks,buildings,palms,routes,tiles};
}
export function solid(world,x,y,r=9) {
  return x<r || y<r || x>COAST-r || y>SIZE-r || world.buildings.some(b=>x+r>b.x && x-r<b.x+b.w && y+r>b.y && y-r<b.y+b.h) ||
    (x>stadium.x+35-r && x<stadium.x+stadium.w-35+r && y>stadium.y+63-r && y<stadium.y+stadium.h-63+r);
}
export function visible(world,a,b) {
  const steps=Math.ceil(distance(a,b)/22);
  for(let i=1;i<steps;i++) {
    const t=i/steps;
    if(solid(world,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,2)) return false;
  }
  return true;
}
