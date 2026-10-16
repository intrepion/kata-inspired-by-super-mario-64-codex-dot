import * as T from "three";
import { Game, readSave, type Input } from "./game";
import { platforms, top, seeds, beacons } from "./world";
import "./style.css";
const $ = (id: string) => document.getElementById(id)!;
const key = "cloudpost-orchard-v1";
let raw: string | null = null;
try {
  raw = localStorage.getItem(key);
} catch {
  /* game remains playable without storage */
}
const game = new Game(platforms, readSave(raw));
const scene = new T.Scene();
scene.background = new T.Color(0xafd6d6);
scene.fog = new T.Fog(0xafd6d6, 45, 115);
const renderer = new T.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
$("scene").append(renderer.domElement);
const camera = new T.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 180);
scene.add(new T.HemisphereLight(0xe5f6ee, 0x4b5a41, 2.4));
const sun = new T.DirectionalLight(0xffe3b0, 3);
sun.position.set(-20, 40, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {
  left: -40,
  right: 40,
  top: 40,
  bottom: -40,
  far: 100,
});
scene.add(sun);
function mesh(g: T.BufferGeometry, c: number, parent: T.Object3D = scene) {
  const m = new T.Mesh(
    g,
    new T.MeshStandardMaterial({
      color: c,
      roughness: 0.83,
      flatShading: true,
    }),
  );
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function box(
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  c: number,
  parent: T.Object3D = scene,
) {
  const m = mesh(new T.BoxGeometry(w, h, d), c, parent);
  m.position.set(x, y, z);
  return m;
}
function orb(
  x: number,
  y: number,
  z: number,
  r: number,
  c: number,
  parent: T.Object3D = scene,
) {
  const m = mesh(new T.IcosahedronGeometry(r, 1), c, parent);
  m.position.set(x, y, z);
  return m;
}
for (const p of platforms) {
  if (p.ramp) {
    const g = new T.BoxGeometry(p.w, p.h, p.d);
    const pos = g.attributes.position!;
    for (let n = 0; n < pos.count; n++) {
      const z = pos.getZ(n) + p.z;
      pos.setY(n, pos.getY(n) + top(p, z) - p.y);
    }
    g.computeVertexNormals();
    const m = mesh(g, p.color);
    m.position.set(p.x, p.y - p.h / 2, p.z);
  } else {
    box(p.x, p.y - p.h / 2 - 0.26, p.z, p.w, p.h, p.d, 0x9b8061);
    box(p.x, p.y - 0.13, p.z, p.w, 0.26, p.d, p.color);
  }
}
// Original orchard silhouettes and postal architecture. Decorations do not obscure routes.
for (const [x, z] of [
  [-17, -5],
  [-18, 1],
  [18, 13],
  [8, 14],
  [-6, -8],
  [2, -7],
]) {
  box(x!, 1.2, z!, 0.45, 2.4, 0.45, 0x8a684b);
  orb(x!, 3, z!, 1.9, 0x427d69);
  orb(x! + 0.9, 3.8, z!, 1.25, 0x609279);
  orb(x! - 0.7, 3.4, z! + 0.7, 1.2, 0x7ea86e);
  orb(x! + 0.8, 2.9, z! + 0.9, 0.25, 0xeeb96a);
}
box(0, 0.12, 13, 4, 0.24, 4, 0xdcc9a0);
box(-2, 1.7, 14, 0.2, 3.4, 0.2, 0xbfa47c);
box(-2, 3.1, 14, 2, 0.7, 0.2, 0x1e695f);
for (let n = 0; n < 12; n++) {
  const a = n * 2.4;
  const cloud = orb(
    Math.cos(a) * 55,
    -6 + (n % 3) * 5,
    Math.sin(a) * 55,
    7,
    0xe7eee1,
  );
  cloud.scale.set(2, 0.45, 1);
}
const arch = new T.Group();
scene.add(arch);
box(14, 12, -15, 0.35, 3, 0.35, 0x375d54, arch);
box(18, 12, -15, 0.35, 3, 0.35, 0x375d54, arch);
box(16, 13.5, -15, 4.4, 0.35, 0.45, 0x375d54, arch);
const flag = box(17.1, 13, -15, 1.6, 0.7, 0.1, 0xe9b264, arch);
flag.rotation.z = -0.1;
const bell = mesh(new T.CylinderGeometry(0.35, 0.65, 0.8, 12), 0xe7b75e);
bell.position.set(15, 7.35, 0);
const bellRing = mesh(new T.TorusGeometry(1.3, 0.07, 8, 40), 0xf5ce78);
bellRing.rotation.x = -Math.PI / 2;
bellRing.position.set(15, 6.85, 0);
const seedMeshes = seeds.map((s) => {
  const m = mesh(new T.OctahedronGeometry(0.35), 0xffd47b);
  m.position.set(s[0], s[1] + 0.7, s[2]);
  return m;
});
const beacon = mesh(new T.OctahedronGeometry(0.65), 0xfff0a2);
const halo = mesh(new T.TorusGeometry(0.95, 0.055, 8, 48), 0xfff0b2);
beacon.add(halo);
const enemies = Array.from({ length: 3 }, () => {
  const g = new T.Group();
  scene.add(g);
  orb(0, 0.55, 0, 0.65, 0xb76e5d, g);
  orb(-0.22, 0.8, 0.5, 0.1, 0xfff4c6, g);
  orb(0.22, 0.8, 0.5, 0.1, 0xfff4c6, g);
  box(-0.25, 0.1, 0.1, 0.4, 0.2, 0.6, 0x3d5551, g);
  box(0.25, 0.1, 0.1, 0.4, 0.2, 0.6, 0x3d5551, g);
  return g;
});
const player = new T.Group();
scene.add(player);
const body = mesh(new T.CapsuleGeometry(0.34, 0.48, 4, 8), 0xf1ba62, player);
body.position.y = 0.75;
const head = orb(0, 1.38, 0, 0.36, 0xe8e0bf, player);
const hat = mesh(new T.ConeGeometry(0.48, 0.55, 5), 0x267e79, head);
hat.position.y = 0.35;
hat.rotation.z = -0.2;
box(0, 1.31, 0.31, 0.43, 0.16, 0.12, 0x355a55, player);
box(0, 0.8, -0.32, 0.52, 0.6, 0.22, 0x6b8e78, player);
const feet = [
  box(-0.23, 0.13, 0.12, 0.29, 0.23, 0.55, 0x355a55, player),
  box(0.23, 0.13, 0.12, 0.29, 0.23, 0.55, 0x355a55, player),
];
const arms = [
  box(-0.47, 0.75, 0, 0.2, 0.6, 0.22, 0xe8e0bf, player),
  box(0.47, 0.75, 0, 0.2, 0.6, 0.22, 0xe8e0bf, player),
];
const shadow = mesh(new T.CircleGeometry(0.6, 24), 0x314c47);
shadow.rotation.x = -Math.PI / 2;
(shadow.material as T.MeshStandardMaterial).transparent = true;
(shadow.material as T.MeshStandardMaterial).opacity = 0.2;
const down = new Set<string>();
let jump = false,
  pound = false,
  yaw = 0,
  pitch = 0.48,
  distance = 12,
  paused = false,
  drag = false,
  lastX = 0,
  lastY = 0;
const panels = $("panel");
const descriptions = [
  "Climb the orchard terraces. Deliver a spark to the striped summit arch.",
  "Find eight amber seeds across the island. A spark will appear at the starting meadow.",
  "Wall kick between the two eastern towers. Ground pound the golden bell, then claim its spark.",
];
function hub() {
  game.hub = true;
  paused = false;
  panels.classList.remove("hidden");
  panels.innerHTML = `<div class="card"><div class="eyebrow">A LITTLE SKYWARD ADVENTURE</div><h1>Cloudpost<br>Orchard</h1><p>You are Pip, a sky courier. The orchard’s wind lantern has scattered its sparks. Take the scenic route. Bring the light home.</p><div class="courses">${beacons.map((b, n) => `<button data-course="${n}">${String(n + 1).padStart(2, "0")} &nbsp; ${b.name}<span>${game.earned.includes(n) ? "◆" : "◇"}</span></button>`).join("")}</div><p class="hint">${game.earned.length}/3 sparks saved · Choose a delivery to enter the orchard.<br>Run + Shift + Space: long jump · Still + Shift + Space: backflip<br>Jump again on landing: double / triple · Space against a wall: wall kick</p></div>`;
  panels
    .querySelectorAll<HTMLButtonElement>("[data-course]")
    .forEach((b) => (b.onclick = () => start(Number(b.dataset.course))));
}
function start(n: number) {
  game.enter(n);
  yaw = 0;
  pitch = 0.48;
  paused = false;
  down.clear();
  jump = false;
  pound = false;
  panels.classList.add("hidden");
  renderer.domElement.focus();
}
function pause() {
  if (game.hub || game.finished) return;
  paused = !paused;
  down.clear();
  jump = false;
  pound = false;
  panels.classList.toggle("hidden", !paused);
  if (paused) {
    panels.innerHTML =
      '<div class="card"><div class="eyebrow">TAKE A BREATHER</div><h1>Above the clouds.</h1><p>WASD moves relative to the camera. Q/E orbit; arrow up/down tilt; drag to look; scroll to zoom. C puts the camera behind Pip.<br>Tap Space (or Option/Alt) to jump; hold for height. Shift on the ground crouches; Shift in the air pounds.<br>Jump promptly on landing for double and triple jumps. Run before crouch + jump for distance.</p><div class="row"><button id="resume">Resume</button><button id="leave">Return to post</button></div></div>';
    $("resume").onclick = pause;
    $("leave").onclick = hub;
  }
}
addEventListener("keydown", (e) => {
  if (
    [
      "Space",
      "AltLeft",
      "AltRight",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ].includes(e.code)
  )
    e.preventDefault();
  if (e.code === "Escape" && !e.repeat) {
    pause();
    return;
  }
  if (e.code === "KeyC") yaw = game.face - Math.PI;
  if (!down.has(e.code)) {
    if (["Space", "AltLeft", "AltRight"].includes(e.code)) jump = true;
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") pound = true;
  }
  down.add(e.code);
});
addEventListener("keyup", (e) => down.delete(e.code));
addEventListener("blur", () => {
  down.clear();
  if (!paused && !game.hub && !game.finished) pause();
});
renderer.domElement.tabIndex = 0;
renderer.domElement.addEventListener("pointerdown", (e) => {
  drag = true;
  lastX = e.clientX;
  lastY = e.clientY;
  renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener("pointerup", () => (drag = false));
renderer.domElement.addEventListener("pointermove", (e) => {
  if (drag) {
    yaw -= (e.clientX - lastX) * 0.006;
    pitch = Math.max(0.12, Math.min(1.15, pitch + (e.clientY - lastY) * 0.004));
    lastX = e.clientX;
    lastY = e.clientY;
  }
});
renderer.domElement.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    distance = Math.max(5, Math.min(20, distance + e.deltaY * 0.01));
  },
  { passive: false },
);
function save() {
  try {
    localStorage.setItem(key, JSON.stringify(game.save()));
  } catch {
    game.saveError = true;
  }
}
let last = performance.now(),
  acc = 0;
const ray = new T.Raycaster();
const aim = new T.Vector3();
const desired = new T.Vector3();
const dir = new T.Vector3();
const solids = scene.children.filter(
  (o): o is T.Mesh =>
    o instanceof T.Mesh &&
    !seedMeshes.includes(o) &&
    o !== beacon &&
    o !== shadow,
);
function frame(now: number) {
  requestAnimationFrame(frame);
  const elapsed = Math.min((now - last) / 1000, 0.1);
  last = now;
  if (!paused && !game.hub && !game.finished) {
    yaw +=
      ((down.has("KeyQ") ? 1 : 0) - (down.has("KeyE") ? 1 : 0)) * elapsed * 1.8;
    pitch = Math.max(
      0.12,
      Math.min(
        1.15,
        pitch +
          ((down.has("ArrowDown") ? 1 : 0) - (down.has("ArrowUp") ? 1 : 0)) *
            elapsed,
      ),
    );
    acc += elapsed;
    while (acc >= 1 / 120) {
      const i: Input = {
        x: Number(down.has("KeyD")) - Number(down.has("KeyA")),
        z: Number(down.has("KeyS")) - Number(down.has("KeyW")),
        jump,
        held: down.has("Space") || down.has("AltLeft") || down.has("AltRight"),
        crouch: down.has("ShiftLeft") || down.has("ShiftRight"),
        pound,
        yaw,
      };
      game.step(1 / 120, i);
      jump = false;
      pound = false;
      acc -= 1 / 120;
      if (game.finished) {
        save();
        panels.classList.remove("hidden");
        panels.innerHTML = `<div class="card"><div class="eyebrow">DELIVERY COMPLETE</div><h1>A spark returns.</h1><p>${beacons[game.mission]!.name} complete. ${game.earned.length}/3 sparks recovered.<br>${game.saveError ? "Storage unavailable — progress lasts this session." : "Your progress is saved on this browser."}</p><div class="row"><button id="post">Return to post</button><button id="again">Re-enter course</button></div></div>`;
        $("post").onclick = hub;
        $("again").onclick = () => start(game.mission);
        break;
      }
    }
  } else acc = 0;
  player.position.set(game.x, game.y, game.z);
  renderer.domElement.setAttribute(
    "aria-label",
    `Pip position ${game.x.toFixed(1)}, ${game.y.toFixed(1)}, ${game.z.toFixed(1)}; camera ${((yaw * 180) / Math.PI).toFixed(0)} degrees`,
  );
  player.rotation.y = game.face;
  body.scale.y = game.mode === "Crouch" ? 0.65 : 1;
  player.rotation.x =
    game.mode === "Ground pound"
      ? Math.PI / 6
      : game.mode === "Backflip" && !game.grounded
        ? -game.time * 10
        : game.mode === "Triple jump" && !game.grounded
          ? game.time * 9
          : 0;
  const walk = game.grounded
    ? Math.sin(now * 0.015) * Math.min(1, Math.hypot(game.vx, game.vz) / 9)
    : 0.3;
  feet[0]!.rotation.x = walk;
  feet[1]!.rotation.x = -walk;
  arms[0]!.rotation.x = -walk;
  arms[1]!.rotation.x = walk;
  shadow.position.set(game.x, 0.02, game.z);
  let floor = 0;
  for (const p of platforms) {
    if (
      Math.abs(game.x - p.x) < p.w / 2 &&
      Math.abs(game.z - p.z) < p.d / 2 &&
      top(p, game.z) <= game.y + 0.1
    )
      floor = Math.max(floor, top(p, game.z));
  }
  shadow.position.y = floor + 0.025;
  shadow.scale.setScalar(Math.max(0.25, 1 - (game.y - floor) * 0.04));
  seedMeshes.forEach((m, n) => {
    m.visible = !game.collected.has(n);
    m.rotation.y = now * 0.001;
    m.position.y = seeds[n]![1] + 0.8 + Math.sin(now * 0.003 + n) * 0.12;
  });
  enemies.forEach((m, n) => {
    const e = game.enemy(n);
    m.position.set(e.x, 0, e.z);
    m.visible = !game.defeated.has(n);
    m.rotation.y = now * 0.0008 + n;
  });
  const b = beacons[game.mission]!;
  beacon.position.set(b.x, b.y + Math.sin(now * 0.003) * 0.2, b.z);
  beacon.rotation.y = now * 0.001;
  beacon.visible = !game.hub && game.available();
  bell.rotation.z = game.bell ? Math.sin(now * 0.01) * 0.3 : 0;
  aim.set(game.x, game.y + 1, game.z);
  desired.set(
    game.x + Math.sin(yaw) * distance * Math.cos(pitch),
    game.y + 1 + Math.sin(pitch) * distance,
    game.z + Math.cos(yaw) * distance * Math.cos(pitch),
  );
  dir.copy(desired).sub(aim);
  ray.set(aim, dir.clone().normalize());
  ray.far = dir.length();
  const hit = ray.intersectObjects(solids, false)[0];
  if (hit && hit.distance > 1)
    desired
      .copy(aim)
      .addScaledVector(dir.normalize(), Math.max(1, hit.distance - 0.4));
  camera.position.lerp(desired, 1 - Math.exp(-elapsed * 12));
  camera.lookAt(aim);
  $("stats").textContent =
    `◆ ${game.earned.length}/3 sparks   •   ◇ ${game.collected.size}/8 seeds   •   ${"●".repeat(game.health)}${"○".repeat(4 - game.health)}`;
  $("mission").innerHTML =
    `<small>DELIVERY ${String(game.mission + 1).padStart(2, "0")} / CLOUDPOST ORCHARD</small><strong>${beacons[game.mission]!.name}</strong>${descriptions[game.mission]}<br><small>West: ramp & terraces · East: bell towers</small>`;
  $("move").textContent = game.mode;
  renderer.render(scene, camera);
}
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
renderer.setSize(innerWidth, innerHeight);
camera.position.set(0, 8, 24);
hub();
requestAnimationFrame(frame);
