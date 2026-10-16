import { test } from "node:test";
import assert from "node:assert/strict";
import { Game, idle, readSave, type Input } from "../src/game";
import { platforms, type Platform } from "../src/world";
const floor: Platform = { x: 0, z: 0, w: 200, d: 200, y: 0, h: 5, color: 0 };
function make(terrain: Platform[] = [floor]) {
  const g = new Game(terrain);
  g.enter(0);
  return g;
}
function tick(g: Game, n: number, patch: Partial<Input> = {}) {
  for (let i = 0; i < n; i++) g.step(1 / 120, { ...idle, ...patch });
}
test("camera-relative acceleration, momentum and stopping", () => {
  const g = make();
  tick(g, 120, { z: -1, yaw: Math.PI / 2 });
  assert.ok(g.x < -7);
  assert.ok(Math.abs(g.z - 13) < 0.01);
  const x = g.x;
  tick(g, 1);
  assert.ok(g.x < x);
  tick(g, 120);
  assert.equal(g.vx, 0);
});
test("jump rises, hits apex and lands on solid ground", () => {
  const g = make();
  tick(g, 1, { jump: true, held: true });
  tick(g, 20, { held: true });
  assert.ok(g.y > 1);
  tick(g, 180);
  assert.equal(g.y, 0);
  assert.equal(g.grounded, true);
});
test("holding jump gains height over a tap", () => {
  const a = make(),
    b = make();
  tick(a, 1, { jump: true, held: true });
  tick(b, 1, { jump: true });
  tick(a, 35, { held: true });
  tick(b, 35);
  assert.ok(a.y > b.y + 0.3);
});
test("running crouch jump launches long jump, stationary launches backflip", () => {
  const g = make();
  tick(g, 80, { z: -1 });
  tick(g, 1, { z: -1, crouch: true, jump: true, pound: true });
  assert.equal(g.mode, "Long jump");
  assert.ok(g.vz < -15);
  const b = make();
  tick(b, 1, { crouch: true, jump: true, pound: true });
  assert.equal(b.mode, "Backflip");
  assert.ok(b.vy > 13);
});
test("air crouch pounds and resets on landing", () => {
  const g = make();
  tick(g, 1, { jump: true });
  tick(g, 15);
  tick(g, 1, { pound: true });
  assert.equal(g.mode, "Ground pound");
  assert.ok(g.vy < -20);
  tick(g, 60);
  assert.equal(g.y, 0);
  assert.equal(g.grounded, true);
});
test("sequential landing jumps rise to double and triple", () => {
  const g = make();
  for (let n = 1; n <= 3; n++) {
    tick(g, 1, { z: -1, jump: true, held: true });
    assert.equal(g.chain, n);
    let limit = 300;
    while (!g.grounded && limit-- > 0) tick(g, 1, { z: -1, held: true });
    assert.ok(limit > 0);
  }
  assert.equal(g.chain, 3);
});
test("solid wall blocks running and permits a timed wall kick", () => {
  const g = make([floor, { x: 0, z: 8, w: 6, d: 1, y: 8, h: 8, color: 0 }]);
  tick(g, 60, { z: -1 });
  assert.ok(g.z >= 8.9);
  tick(g, 1, { jump: true, z: -1 });
  tick(g, 10, { z: -1 });
  assert.ok(g.wallAge < 0.18);
  tick(g, 1, { jump: true });
  assert.equal(g.mode, "Wall kick");
  assert.ok(g.vz > 8);
});
test("ramp climbs continuously", () => {
  const g = make([
    floor,
    { x: 0, z: 5, w: 5, d: 10, y: 0, h: 3, ramp: 3, color: 0 },
  ]);
  tick(g, 130, { z: -1 });
  assert.ok(g.y > 1);
  assert.ok(g.grounded);
});
test("underside blocks upward traversal", () => {
  const g = make([floor, { x: 0, z: 13, w: 6, d: 6, y: 3, h: 1, color: 0 }]);
  tick(g, 1, { jump: true, held: true });
  tick(g, 16, { held: true });
  assert.ok(g.y <= 0.6);
  tick(g, 120);
  assert.equal(g.y, 0);
});
test("fall recovery restores spawn and health", () => {
  const g = make([]);
  tick(g, 300, { x: 1 });
  assert.ok(g.falls > 0);
  assert.equal(g.health, 4);
});
test("collect eight seeds, claim reward, save, re-enter and reload", () => {
  const g = make();
  g.enter(1);
  const locations = [
    [-4, 0, 5],
    [-8, 0, 1],
    [0, 0, 0],
    [6, 0, 6],
    [-11, 1.5, 10],
    [-18, 3.5, 14],
    [-11, 3, -14],
    [8, 7.5, -14],
  ];
  for (const s of locations) {
    [g.x, g.y, g.z] = s as [number, number, number];
    g.vx = g.vy = g.vz = 0;
    tick(g, 1);
  }
  assert.equal(g.collected.size, 8);
  g.x = 0;
  g.y = 0;
  g.z = 8;
  tick(g, 1);
  assert.equal(g.finished, true);
  const saved = JSON.stringify(g.save());
  g.enter(1);
  assert.equal(g.collected.size, 0);
  assert.equal(g.finished, false);
  assert.deepEqual(new Game([], readSave(saved)).earned, [1]);
});
test("bell objective requires a ground pound landing atop eastern platform", () => {
  const g = make([{ x: 15, z: 0, w: 4, d: 2, y: 6.8, h: 1, color: 0 }]);
  g.enter(2);
  g.x = 15;
  g.y = 9;
  g.z = 0;
  g.grounded = false;
  tick(g, 1, { pound: true });
  tick(g, 30);
  assert.equal(g.bell, true);
  assert.equal(g.finished, true);
});
test("invalid or duplicate save values cannot corrupt earned records", () => {
  assert.deepEqual(readSave("{bad").earned, []);
  assert.deepEqual(
    readSave('{"version":1,"earned":[1,1,-1,99,"0"]}').earned,
    [1],
  );
});

test("ground-pound recovery permits walking without an extra jump", () => {
  const g = make();
  tick(g, 1, { jump: true });
  tick(g, 15);
  tick(g, 1, { pound: true });
  tick(g, 60);
  tick(g, 100, { x: 1 });
  assert.ok(g.x > 5);
  assert.equal(g.mode, "Run");
});
test("enemy contact hurts once during invulnerability, a descending stomp defeats", () => {
  const g = make();
  g.time = 0;
  let e = g.enemy(0);
  g.x = e.x;
  g.z = e.z;
  tick(g, 1);
  assert.equal(g.health, 3);
  g.x = e.x;
  g.z = e.z;
  tick(g, 1);
  assert.equal(g.health, 3);
  const b = make();
  e = b.enemy(0);
  b.x = e.x;
  b.z = e.z;
  b.y = 1.2;
  b.vy = -3;
  b.grounded = false;
  tick(b, 1);
  assert.ok(b.defeated.has(0));
  assert.ok(b.vy > 0);
  assert.equal(b.health, 4);
});

test("authored western ramp joins the summit plateau without a collision lip", () => {
  const g = make(platforms);
  g.x = -11;
  g.z = 0;
  tick(g, 200, { z: -1 });
  assert.ok(g.z < -12);
  assert.ok(g.y >= 3);
});
