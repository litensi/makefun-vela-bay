// Defines the city layout and generates its geometry from a seed.
export const SIZE = 2000;
export const BLOCK = 330;
export const ROAD = 82;
export const SHORE = 1760;
export const START = { x: 1080, y: 1009 };
export const jobs = [
  { name:'Cold Parcel', by:'Mara Voss', briefing:'The parcel holds the quay’s payment ledger. Get it to the Market Row kiosk.', contact:[1102,1068], target:[752,695], task:'Deliver the parcel', detail:'Take the package to the blue kiosk in Market Row.', payout:350 },
  { name:'Pier Pressure', by:'Inez Vale', briefing:'Mara’s ledger points to the pier. Collect the missing payment for Inez.', contact:[1407,1055], target:[1727,1385], task:'Collect the pier debt', detail:'Meet the debtor at the South Quay boardwalk.', payout:650 },
  { name:'Last Light', by:'Rafi Cruz', contact:[1560,1358], target:[1714,1395], task:'Secure the dock manifest', detail:'Clear the three dock guards, take the manifest, then lose the police.', briefing:'The pier cash bought a name. Rafi needs the shipping manifest before the freighter leaves.', payout:1200 },
];
export const garage={x:1150,y:1024,fee:150};
export const raceRoute=[
  {x:1145,y:1358},{x:1691,y:1358},{x:1691,y:1024},
  {x:1355,y:1024},{x:1355,y:1358},{x:1145,y:1358},
];
export const ramps=[{x:1500,y:1048,a:0},{x:1028,y:1210,a:Math.PI/2}];
export const piers=[[437,126],[811,226],[1034,260],[1378,208],[1695,120]];
export function random(seed) {
  return () => {
    seed = (Math.imul(1664525,seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
export const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export const angleDelta = (a,b) => Math.atan2(Math.sin(a-b),Math.cos(a-b));

export function createCity(seed) {
  const rng = random(seed), buildings = [], palms = [], courts = [], props = [];
  const colors = ['#d98d70','#ecc698','#87b2a4','#ddab81','#d6ab9b','#d2cb9c','#9bafbe'];
  for(let row=0;row<6;row++) for(let col=0;col<5;col++){
    const x=col*BLOCK+ROAD+15,y=row*BLOCK+ROAD+15;
    const park = (col+row*2)%8===3;
    courts.push({x,y,park});
    for(let i=0;i<4;i++){
      if(park || (i===3 && (row+col)%3===0)) continue;
      const bx=x+12+(i%2)*106,by=y+12+Math.floor(i/2)*108;
      buildings.push({x:bx,y:by,w:72+rng()*22,h:68+rng()*25,color:colors[Math.floor(rng()*colors.length)],style:Math.floor(rng()*4),r:rng()});
    }
    for(let i=0;i<4;i++) palms.push({x:x+2+(i%2)*211,y:y+7+Math.floor(i/2)*201,r:rng()});
    if(park) for(let i=0;i<7;i++) palms.push({x:x+22+rng()*175,y:y+24+rng()*173,r:rng()});
    for(let i=0;i<3;i++) props.push({x:x+30+i*76,y:y-5,r:rng()});
  }
  for(let y=50;y<SIZE;y+=75) palms.push({x:1737+(y%3)*6,y,r:rng()});
  const umbrellas=Array.from({length:21},(_,i)=>({x:1717+rng()*11,y:75+i*91+rng()*18,color:i%3}));
  const boats=piers.flatMap(([y,length])=>[.32,.72].map((part,i)=>({
    x:1752+length*part,y:y+(i?58:-17),a:(rng()-.5)*.26,mooring:y+(i?38:0),color:rng(),
  })));
  return { buildings,palms,courts,props,umbrellas,boats };
}

export function blocked(city,x,y,r=0) {
  return x<r || y<r || x>SHORE-r || y>SIZE-r ||
    city.buildings.some(b=>x+r>b.x && x-r<b.x+b.w && y+r>b.y && y-r<b.y+b.h);
}
export function clearSight(city,a,b) {
  const steps=Math.ceil(distance(a,b)/12);
  for(let i=1;i<steps;i++) if(blocked(city,a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps)) return false;
  return true;
}
export function move(city,actor,dx,dy,r) {
  let hit=false;
  if(!blocked(city,actor.x+dx,actor.y,r)) actor.x+=dx; else hit=true;
  if(!blocked(city,actor.x,actor.y+dy,r)) actor.y+=dy; else hit=true;
  return hit;
}
