import * as THREE from 'three';
import { activityMarkers } from './activities.js';
import { BLOCK, ROAD, SHORE, SIZE, garage, piers, ramps, random } from './city.js';
import { markers } from './missions.js';

const boxGeometry = new THREE.BoxGeometry();
const palmTrunk = new THREE.CylinderGeometry(.65, 1, 1, 6);
const palmLeaf = new THREE.OctahedronGeometry(.5);
const ringGeometry = new THREE.RingGeometry(.8, 1, 32).rotateX(-Math.PI / 2);
const up = new THREE.Vector3(0, 1, 0);
const ground = new THREE.Plane(up, 0);
const matrices = new THREE.Object3D();
const paint = new THREE.Color();
const batchKinds = {
  solid: [boxGeometry, new THREE.MeshLambertMaterial(), true],
  surface: [boxGeometry, new THREE.MeshLambertMaterial(), false],
  glow: [boxGeometry, new THREE.MeshLambertMaterial({ emissive: '#ffe0a5', emissiveIntensity: .25 }), false],
  lamp: [boxGeometry, new THREE.MeshBasicMaterial(), false],
  trunk: [palmTrunk, new THREE.MeshLambertMaterial(), true],
  leaf: [palmLeaf, new THREE.MeshLambertMaterial(), true],
  ring: [ringGeometry, new THREE.MeshBasicMaterial(), false],
};

function writeInstance(mesh, i, x, y, z, w, h, d, color, angle, tilt) {
  matrices.position.set(x, y, z);
  matrices.scale.set(w, h, d);
  matrices.rotation.set(0, -angle, tilt, 'YXZ');
  matrices.updateMatrix();
  mesh.setMatrixAt(i, matrices.matrix);
  mesh.setColorAt(i, paint.set(color));
}

function batchMesh(kind, capacity) {
  const [geometry, material, casts] = batchKinds[kind];
  const mesh = new THREE.InstancedMesh(geometry, material, capacity);
  mesh.castShadow = casts;
  mesh.receiveShadow = kind !== 'lamp' && kind !== 'ring';
  return mesh;
}

function buildCity(city, seed) {
  const group = new THREE.Group();
  const batches = new Map();
  const footprints = [];
  const rng = random(seed + 604);
  function part(x, y, z, w, h, d, color, angle = 0, kind = 'solid', tilt = 0) {
    if (!batches.has(kind)) batches.set(kind, []);
    batches.get(kind).push([x, y, z, w, h, d, color, angle, tilt]);
  }
  const slab = (x, z, w, d, color, height = 0) => part(x+w/2, height-.6, z+d/2, w, 1.2, d, color, 0, 'surface');
  slab(-15000, -15000, 30000, 30000, '#2f9fae', -6);
  for (let i=0; i<150; i++) {
    const x = SHORE+14+rng()*400, z = rng()*SIZE;
    slab(x, z, 2+rng()*4, 5+rng()*21, '#50aab5', -5.97);
  }
  slab(0, 0, SHORE, SIZE, '#a7a18c', -1);
  part(SHORE-2, -3, SIZE/2, 5, 6, SIZE, '#76877a');
  for (let x = 0; x < SHORE; x += BLOCK) {
    slab(x, 0, ROAD, SIZE, '#555e65');
    for (let z = ROAD; z < SIZE; z += BLOCK) {
      slab(x+ROAD, z, 8, Math.min(BLOCK-ROAD, SIZE-z), '#ded1b6', 1.3);
    }
    for (let z = 0; z < SIZE; z += 21) {
      if (z%BLOCK > ROAD+8 && z%BLOCK < BLOCK-17) slab(x+ROAD/2-1, z, 2, 10, '#f4c374', .05);
    }
  }
  for (let z = 0; z < SIZE; z += BLOCK) {
    slab(0, z, SHORE, ROAD, '#555e65', .03);
    if (z+ROAD < SIZE) for (let x = ROAD; x < SHORE; x += BLOCK) {
      slab(x, z+ROAD, Math.min(BLOCK-ROAD, SHORE-x), 8, '#ded1b6', 1.3);
    }
    for (let x = 0; x < SHORE; x += 21) {
      if (x%BLOCK > ROAD+8 && x%BLOCK < BLOCK-17) slab(x, z+ROAD/2-1, 10, 2, '#f4c374', .08);
    }
    for (let x = 0; x < SHORE; x += BLOCK) {
      for (let stripe = 7; stripe < ROAD-5; stripe += 8) {
        slab(x+stripe, z+ROAD-12, 4, 8, '#e5e1c8', .08);
        slab(x+ROAD-12, z+stripe, 8, 4, '#e5e1c8', .08);
      }
    }
  }
  for (const c of city.courts) {
    slab(c.x-7, c.y-7, 248, 248, '#c9bca4', 1);
    if (c.park) {
      slab(c.x+8, c.y+8, 204, 196, '#85a56b', 1.25);
      slab(c.x+99, c.y+8, 8, 196, '#e5cea3', 1.35);
      slab(c.x+8, c.y+98, 204, 8, '#e5cea3', 1.35);
    }
  }
  for (const b of city.buildings) {
    const x = b.x+b.w/2, z = b.y+b.h/2;
    const height = 29 + Math.floor(b.r * 10) * 9 + (b.x < 1200 ? b.style*20 : 0);
    footprints.push(new THREE.Box3(new THREE.Vector3(b.x, 0, b.y), new THREE.Vector3(b.x+b.w, height+3, b.y+b.h)));
    part(x, height/2, z, b.w, height, b.h, b.color);
    part(x, height-2, z, b.w+.9, 3, b.h+.9, '#f3d9b7');
    part(x, height+1, z, b.w, 2, b.h, '#b68976');
    part(x+b.w*.18, height+5, z-13, 19, 8, 16, '#c6d1c8');
    part(x+b.w*.18, height+9.2, z-13, 14, .6, 10, '#667b7f');
    if (b.style === 2) {
      part(x-17, height+8, z+15, 9, 15, 9, '#d4b092');
      part(x-17, height+16, z+15, 11, 2, 11, '#748989');
    }
    for (let level=12; level<height-6; level+=12) {
      for (let offset=8; offset<b.w-5; offset+=12) {
        for (const face of [b.y-.25, b.y+b.h+.25]) {
          const lit = rng() < .24;
          part(b.x+offset, level, face, 6.5, 6, .55, lit?'#d4aa6a':'#365867', 0, lit?'glow':'surface');
        }
      }
      for (let offset=8; offset<b.h-5; offset+=12) {
        for (const face of [b.x-.25, b.x+b.w+.25]) {
          const lit = rng() < .24;
          part(face, level, b.y+offset, .55, 6, 6.5, lit?'#d4aa6a':'#466a77', 0, lit?'glow':'surface');
        }
      }
    }
    part(x, 4.2, b.y-.2, 13, 8, .7, '#3f6067', 0, 'surface');
  }
  for (const p of city.palms) {
    const height = 18+p.r*16;
    part(p.x, height/2, p.y, 1.25, height, 1.25, '#8b6854', 0, 'trunk', -.10);
    for (let i=0; i<7; i++) {
      const a = i*Math.PI*2/7 + p.r*4;
      part(p.x+height*.05+Math.cos(a)*6, height, p.y+Math.sin(a)*6, 17, 3.5, 4.6,
        ['#417556','#578951','#78a355'][i%3], a, 'leaf', -.22);
    }
    part(p.x+height*.05, height+2, p.y, 9, 5, 6, '#79a354', p.r*6, 'leaf', .22);
  }
  for (const p of city.props) {
    part(p.x, 8, p.y, 1, 16, 1, '#53656b');
    part(p.x, 16, p.y-1.5, 2, .8, 4, '#fce0a4', 0, 'glow');
  }
  slab(1705, 0, 53, SIZE, '#c4a27f', .32);
  for (let z=3; z<SIZE; z+=7) slab(1706, z, 51, .5, '#a4866d', .34);
  for (const [z, length] of piers) {
    slab(SHORE-4, z-8, length, 24, '#b79d80', .36);
    for (let x=SHORE+5; x<SHORE+length-4; x+=18) {
      slab(x, z-8, .9, 24, '#937d6e', .39);
      part(x, -1, z-8, 2, 10, 2, '#655b54');
    }
  }
  for (const boat of city.boats) {
    part(boat.x, -4, boat.y, 29, 3, 11, boat.color<.45?'#e57860':'#f4e6cf', boat.a);
    part(boat.x-2, -1, boat.y, 13, 4, 8, '#efdfc2', boat.a);
    part(boat.x+3, .2, boat.y, 5, 2, 8, '#477b89', boat.a);
  }
  for (const u of city.umbrellas) {
    part(u.x, 3.3, u.y, .6, 6, .6, '#eee0bb');
    part(u.x, 6.6, u.y, 12, 3, 12, ['#df7766','#eee1b3','#63a39b'][u.color], .78, 'leaf');
  }
  for (const r of ramps) {
    part(r.x, 2.2, r.y, 22, 1, 16, '#575660', r.a, 'solid', .20);
    for (const offset of [-6, 0, 6]) {
      part(r.x-Math.sin(r.a)*offset, 2.8, r.y+Math.cos(r.a)*offset, 20, .15, 1.5, '#f6b765', r.a, 'surface', .20);
    }
  }
  slab(garage.x-18, garage.y-12, 36, 24, '#5a9c9a', .10);
  for (const [kind, parts] of batches) {
    const mesh = batchMesh(kind, parts.length);
    parts.forEach((args, i) => writeInstance(mesh, i, ...args));
    group.add(mesh);
  }
  return { group, footprints };
}

function model(part, actor, lift = 0) {
  const cos = Math.cos(actor.a), sin = Math.sin(actor.a);
  return (x, y, z, w, h, d, color, kind = 'solid', angle = 0, tilt = 0) =>
    part(actor.x+x*cos-z*sin, y+lift, actor.y+x*sin+z*cos, w, h, d, color, actor.a+angle, kind, tilt);
}

function drawCar(part, car, siren) {
  const lift = car.air ? Math.sin(Math.PI*car.air/.76)*26 : 0;
  const put = model(part, car, lift);
  put(0, 3.8, 0, 31, 3, 13, '#39454e');
  put(0, 6.2, 0, 31, 3.3, 13.4, car.color);
  put(-1.5, 9, 0, 17, 4, 11, '#294957');
  put(-2, 11.1, 0, 12, .9, 10.8, car.color);
  put(13, 7.9, 0, 4, .3, 9, car.color);
  for (const side of [-1, 1]) {
    for (const x of [-9, 9]) {
      put(x, 3, side*6.2, 5, 5.5, 2.6, '#222c33');
      put(x, 3, side*7.55, 2.6, 2.6, .2, '#899a9b', 'surface');
    }
    put(15.6, 6.6, side*4.5, .5, 1.65, 3, '#ffedbf', 'lamp');
    put(-15.6, 6.5, side*4.5, .5, 1.5, 3.1, '#ff5351', 'lamp');
  }
  if (siren !== undefined) {
    put(-3, 12.1, 0, 3, 1.5, 9, '#233d52');
    put(-3, 13, -2.35, 2.9, .8, 4, siren?'#ff5449':'#9b4848', 'lamp');
    put(-3, 13, 2.35, 2.9, .8, 4, siren?'#456baa':'#8adfff', 'lamp');
  }
}

function drawPerson(part, actor, shirt, time, armed = false) {
  const put = model(part, actor, 1);
  if (actor.down) {
    put(0, 1.6, 0, 11, 3, 5, shirt);
    put(6.5, 1.6, 0, 3, 3, 3, '#dca57e');
    return;
  }
  const stride = actor.walk || actor.phase ? Math.sin(actor.phase || time*16)*1.6 : 0;
  for (const side of [-1, 1]) {
    put(stride*side, 2.4, side*1.15, 1.7, 4.7, 1.65, '#384553', 'solid', 0, stride*side*.18);
    put(stride*side+.35, .6, side*1.2, 2.8, 1, 1.7, '#263444');
  }
  put(0, 6.5, 0, 3, 4.8, 5.5, shirt);
  put(0, 10.4, 0, 3.1, 3.4, 3.2, '#dca57e');
  put(-.2, 12, 0, 3.1, .9, 3.3, '#403b3a');
  put(armed?2.2:0, 6.5, 3, armed?4:1.5, 1.7, 1.2, '#dca57e');
  put(0, 6.5, -3, 1.5, 3.5, 1.2, shirt);
  if (armed) put(4.8, 7, 3, 2.8, .9, .95, '#283040');
}

function drawHelicopter(part, heli, time) {
  const put = model(part, heli, 78);
  put(1, 0, 0, 24, 9, 11, '#324b63');
  put(9, 2, 0, 12, 5, 11.2, '#709ca9');
  put(-5, -2.3, 0, 15, 3, 11.3, '#ede3c8');
  put(-19, 2, 0, 23, 3.3, 3.7, '#364d62');
  put(-29, 4, 0, 4, 8, 2.1, '#466582');
  put(-28.7, 5, 1.4, 9, .7, .55, '#303b48', 'surface', 0, time*24);
  put(0, 7, 0, 2, 5, 2, '#303943');
  for (const offset of [0, Math.PI/2]) {
    put(0, 9, 0, 45, .45, 1.25, '#354654', 'surface', time*20+offset);
  }
  for (const side of [-1, 1]) {
    put(0, -7, side*6.2, 24, .95, 1.15, '#263747');
    put(1, -5.5, side*5.6, 1, 4, 1, '#263747');
    put(-8, .3, side*5.65, 2, 1.4, .4, side>0?'#9bf5dc':'#ff7464', 'lamp');
  }
  put(8, -5.7, 0, 3, 2, 3, '#fff0bb', 'lamp');
}

function markerLabel(text, color) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = 'bold 22px Arial';
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width)+24;
  canvas.height = 36;
  ctx.fillStyle = '#102123';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 4, canvas.height);
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 13, 19);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true }));
  sprite.scale.set(canvas.width*.128, 4.6, 1);
  return sprite;
}

function makeSky() {
  const sky = new THREE.Mesh(new THREE.SphereGeometry(4200, 24, 14), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      horizon: { value: new THREE.Color('#f8dfb5') },
      middle: { value: new THREE.Color('#94d3df') },
      zenith: { value: new THREE.Color('#4b9fc6') },
      sun: { value: new THREE.Vector3(400, 620, -510).normalize() },
    },
    vertexShader: `
      varying vec3 direction;
      void main() {
        direction = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 direction;
      uniform vec3 horizon, middle, zenith, sun;
      void main() {
        vec3 ray = normalize(direction);
        vec3 shade = mix(horizon, middle, smoothstep(-0.04, 0.25, ray.y));
        shade = mix(shade, zenith, smoothstep(0.17, 0.83, ray.y));
        float sunlight = dot(ray, sun);
        shade += vec3(1.0, 0.68, 0.31) * (0.16 * pow(max(sunlight, 0.0), 30.0)
          + smoothstep(0.9991, 0.9996, sunlight));
        gl_FragColor = vec4(shade, 1.0);
        #include <colorspace_fragment>
      }
    `,
  }));
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  return sky;
}

export function createView3D(canvas) {
  const context = canvas.getContext('webgl2', { antialias: true, alpha: false });
  if (!context) return null;
  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: false });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#bcd5cc', .00085);
  scene.add(new THREE.HemisphereLight('#dbecf4', '#bd9a84', 1.85));
  const sun = new THREE.DirectionalLight('#fff0ce', 2.15);
  sun.castShadow = true;
  const shadowSize = new URLSearchParams(location.search).has('shot') ? 2048 : 1024;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  Object.assign(sun.shadow.camera, { left: -350, right: 350, top: 350, bottom: -350, near: 50, far: 1500 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -.0003;
  sun.shadow.normalBias = .38;
  scene.add(sun, sun.target);
  const sky = makeSky();
  scene.add(sky);
  const camera = new THREE.PerspectiveCamera(53, 1, 2, 4800);
  const labels = new Map();
  const dynamic = {};
  for (const [kind, capacity] of Object.entries({ solid: 3200, surface: 1600, lamp: 2500, ring: 12 })) {
    const mesh = batchMesh(kind, capacity);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.count = 0;
    mesh.frustumCulled = false;
    scene.add(mesh);
    dynamic[kind] = mesh;
  }
  function part(x, y, z, w, h, d, color, angle = 0, kind = 'solid', tilt = 0) {
    const mesh = dynamic[kind];
    if (mesh.count < mesh.instanceMatrix.count) writeInstance(mesh, mesh.count++, x, y, z, w, h, d, color, angle, tilt);
  }
  const beam = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 32, 1, true),
    new THREE.MeshBasicMaterial({ color: '#fff2ad', transparent: true, opacity: .12, depthWrite: false,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI/2),
    new THREE.MeshBasicMaterial({ color: '#ffe9ac', transparent: true, opacity: .25, depthWrite: false,
      blending: THREE.AdditiveBlending }));
  scene.add(beam, pool);
  const beamStart = new THREE.Vector3(), beamEnd = new THREE.Vector3(), beamAxis = new THREE.Vector3();
  const desired = new THREE.Vector3(), focus = new THREE.Vector3(), follow = new THREE.Vector3();
  const target = new THREE.Vector3(), clearance = new THREE.Vector3(), hit = new THREE.Vector3();
  const obstruction = new THREE.Ray();
  const cast = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const aim = new THREE.Vector3();
  let source, city, previousTitle, previousTime, previousPlayer, width, height;
  function resize() {
    width = innerWidth;
    height = innerHeight;
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
    renderer.setSize(width, height, false);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
  }
  resize();
  function positionCamera(s, title, reset) {
    const p = s.player;
    if (title) {
      desired.set(2055, 215, 1210);
      focus.set(1415, 57, 947);
    } else if (s.pose === 'street') {
      desired.set(p.x-99, 76, p.y+34);
      focus.set(p.x+52, 9, p.y+6);
    } else if (s.pose === 'chase') {
      desired.set(1435, 150, 1460);
      focus.set(1557, 20, 1350);
    } else if (s.pose === 'mission') {
      desired.set(1548, 58, 1391);
      focus.set(1657, 5, 1362);
    } else if (p.car) {
      const dx = Math.cos(p.car.a), dz = Math.sin(p.car.a);
      const lift = p.car.air ? Math.sin(Math.PI*p.car.air/.76)*26 : 0;
      desired.set(p.x-dx*86, 34+lift*.55, p.y-dz*86);
      focus.set(p.x+dx*34, 10+lift*.55, p.y+dz*34);
    } else {
      desired.set(p.x, 47, p.y+68);
      focus.set(p.x, 7, p.y-28);
    }
    const blend = reset || s.pose ? 1 : 1-Math.exp(-12*Math.max(0, s.time-previousTime));
    follow.lerp(desired, blend);
    target.lerp(focus, blend);
    camera.position.copy(follow);

    if (!title && !s.pose) {
      // Pull the camera forward if its line to the player crosses a building.
      clearance.set(p.x, p.car?12:9, p.y);
      obstruction.origin.copy(clearance);
      obstruction.direction.copy(follow).sub(clearance).normalize();
      let distance = follow.distanceTo(clearance);
      for (const bounds of city.footprints) {
        if (obstruction.intersectBox(bounds, hit)) distance = Math.min(distance, hit.distanceTo(clearance)-3);
      }
      obstruction.at(Math.max(3, distance), camera.position);
    }
    camera.lookAt(target);
    camera.updateMatrixWorld();
    sky.position.copy(camera.position);
    sun.target.position.set(focus.x, 0, focus.z);
    sun.position.copy(sun.target.position).addScaledVector(sky.material.uniforms.sun.value, 700);
  }

  function draw(s, title) {
    const resized = width !== innerWidth || height !== innerHeight;
    if (resized) resize();
    const reset = source !== s.city;
    if (reset) {
      if (city) {
        scene.remove(city.group);
        for (const mesh of city.group.children) mesh.dispose();
      }
      source = s.city;
      city = buildCity(source, s.seed);
      scene.add(city.group);
    }
    if (!reset && !resized && previousTitle === title && previousTime === s.time && previousPlayer === s.player) return;
    positionCamera(s, title, reset || title !== previousTitle);
    previousPlayer = s.player;
    previousTitle = title;
    previousTime = s.time;
    for (const mesh of Object.values(dynamic)) mesh.count = 0;
    const nearby = actor => Math.hypot(actor.x-camera.position.x, actor.y-camera.position.z) < 1050;
    for (const car of s.cars) if (nearby(car)) drawCar(part, car);
    if (s.race) drawCar(part, s.race.rival);
    for (const p of s.people) if (nearby(p)) drawPerson(part, p, p.shirt, s.time);
    for (const p of s.police) {
      if (!nearby(p)) continue;
      const cruiser = p.car ?? (p.cruiser ? { ...p, color: '#dbe6db' } : null);
      if (cruiser) drawCar(part, cruiser, Math.sin(s.time*12+p.x)>0);
      if (!p.cruiser) drawPerson(part, p, '#315774', s.time, true);
    }
    for (const p of s.guards) drawPerson(part, p, '#a34b58', s.time, true);
    if (!title && !s.player.car) drawPerson(part, s.player, '#ed8462', s.time, true);
    for (const t of s.skids) {
      const put = model(part, t);
      for (const side of [-1, 1]) put(0, .14, side*5.4, 8, .05, 1.25, '#383f44', 'surface');
    }
    for (const b of s.bullets) {
      const put = model(part, b);
      put(-4, 6.8, 0, 10, .64, .64, '#fff3a5', 'lamp');
    }
    for (const e of s.effects) {
      const speed = Math.hypot(e.vx, e.vy);
      const y = (e.blood?5:2)+Math.max(0, (e.total-e.life)*speed*.24);
      part(e.x, y, e.y, 1.2+speed*.028, e.blood?.9:.55, .65,
        e.blood?'#a53d48':'#ffc04c', Math.atan2(e.vy,e.vx), 'lamp', .28);
    }
    beam.visible = pool.visible = Boolean(s.heli);
    if (s.heli) {
      const h = s.heli;
      drawHelicopter(part, h, s.time);
      beamStart.set(h.x+8*Math.cos(h.a), 72, h.y+8*Math.sin(h.a));
      beamEnd.set(h.beamX, .42, h.beamY);
      beamAxis.subVectors(beamStart, beamEnd);
      beam.position.copy(beamStart).lerp(beamEnd, .5);
      const radius = h.lock?32:24;
      beam.scale.set(radius, beamAxis.length(), radius);
      beam.quaternion.setFromUnitVectors(up, beamAxis.normalize());
      pool.position.copy(beamEnd);
      pool.scale.set(radius, 1, radius);
    }
    for (const label of labels.values()) label.visible = false;
    if (!title) for (const m of [...activityMarkers(s), ...markers(s)]) {
      const color = m.color ?? (m.active?'#ffcb77':'#a7ffce');
      const radius = 13+Math.sin(s.time*4)*1.7;
      part(m.x, 1.48, m.y, radius, 1, radius, color, 0, 'ring');
      if (m.gate !== undefined) {
        const put = model(part, { ...m, a: m.gate });
        for (const side of [-1, 1]) put(0, 8, side*27, 1.3, 16, 1.3, color, 'lamp');
        put(0, .3, 0, 1.6, .2, 55, color, 'lamp');
      }
      if (m.label) {
        const key = color + m.label;
        if (!labels.has(key)) {
          const label = markerLabel(m.label, color);
          labels.set(key, label);
          scene.add(label);
        }
        const label = labels.get(key);
        label.visible = true;
        label.position.set(m.x, 22, m.y);
        part(m.x, 10, m.y, .55, 18, .55, color, 0, 'lamp');
      }
    }
    for (const mesh of Object.values(dynamic)) {
      mesh.instanceMatrix.clearUpdateRanges();
      mesh.instanceMatrix.addUpdateRange(0, mesh.count*16);
      mesh.instanceMatrix.needsUpdate = mesh.count > 0;
      if (mesh.instanceColor && mesh.count) {
        mesh.instanceColor.clearUpdateRanges();
        mesh.instanceColor.addUpdateRange(0, mesh.count*3);
        mesh.instanceColor.needsUpdate = true;
      }
    }
    renderer.render(scene, camera);
  }
  function worldPoint(x, y) {
    pointer.set(x/width*2-1, 1-y/height*2);
    cast.setFromCamera(pointer, camera);
    // A ray above the horizon still gives the player a direction to fire.
    if (!cast.ray.intersectPlane(ground, aim)) cast.ray.at(1600, aim);
    return { x: aim.x, y: aim.z };
  }
  return { draw, worldPoint };
}
// revision 2
