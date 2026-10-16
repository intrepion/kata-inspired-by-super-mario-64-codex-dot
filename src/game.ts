import { platforms, top, seeds, beacons, type Platform } from "./world";
export interface Input {
  x: number;
  z: number;
  jump: boolean;
  held: boolean;
  crouch: boolean;
  pound: boolean;
  yaw: number;
}
export const idle: Input = {
  x: 0,
  z: 0,
  jump: false,
  held: false,
  crouch: false,
  pound: false,
  yaw: 0,
};
export interface Save {
  version: 1;
  earned: number[];
}
export function readSave(raw: string | null): Save {
  try {
    const v: unknown = JSON.parse(raw ?? "null");
    if (
      v &&
      typeof v === "object" &&
      "version" in v &&
      v.version === 1 &&
      "earned" in v &&
      Array.isArray(v.earned)
    )
      return {
        version: 1,
        earned: [
          ...new Set(
            v.earned.filter(
              (n: unknown): n is number =>
                Number.isInteger(n) && Number(n) >= 0 && Number(n) < 3,
            ),
          ),
        ],
      };
  } catch {}
  return { version: 1, earned: [] };
}
export class Game {
  x = 0;
  y = 0;
  z = 13;
  vx = 0;
  vy = 0;
  vz = 0;
  face = Math.PI;
  grounded = true;
  mode = "Ready";
  chain = 0;
  landAge = 9;
  coyote = 0;
  wallAge = 9;
  nx = 0;
  nz = 0;
  time = 0;
  health = 4;
  hurt = 0;
  falls = 0;
  collected = new Set<number>();
  defeated = new Set<number>();
  bell = false;
  finished = false;
  earned: number[];
  mission = 0;
  hub = true;
  saveError = false;
  constructor(
    public terrain: Platform[] = platforms,
    save: Save = { version: 1, earned: [] },
  ) {
    this.earned = [...save.earned];
  }
  enter(mission: number) {
    this.mission = mission;
    this.hub = false;
    this.finished = false;
    this.collected.clear();
    this.defeated.clear();
    this.bell = false;
    this.health = 4;
    this.reset();
  }
  reset() {
    this.x = 0;
    this.y = 0;
    this.z = 13;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.grounded = true;
    this.chain = 0;
    this.landAge = 9;
    this.wallAge = 9;
    this.coyote = 0;
    this.mode = "Ready";
  }
  save(): Save {
    return { version: 1, earned: [...this.earned] };
  }
  step(dt: number, i: Input) {
    if (this.hub || this.finished) return;
    dt = Math.min(dt, 1 / 30);
    this.time += dt;
    this.landAge += dt;
    this.wallAge += dt;
    this.hurt = Math.max(0, this.hurt - dt);
    this.coyote = this.grounded ? 0.1 : Math.max(0, this.coyote - dt);
    const wasGrounded = this.grounded;
    const len = Math.hypot(i.x, i.z) || 1;
    const ax = (i.x * Math.cos(i.yaw) + i.z * Math.sin(i.yaw)) / len;
    const az = (i.z * Math.cos(i.yaw) - i.x * Math.sin(i.yaw)) / len;
    const moving = Math.hypot(i.x, i.z) > 0.1;
    const speed = Math.hypot(this.vx, this.vz);
    if (i.jump) {
      if (this.grounded || this.coyote > 0) {
        this.chain = this.landAge < 0.22 && moving ? (this.chain % 3) + 1 : 1;
        if (this.chain === 3 && speed < 4) this.chain = 1;
        this.vy = [0, 10, 12, 15][this.chain] ?? 10;
        this.mode =
          ["", "Jump", "Double jump", "Triple jump"][this.chain] ?? "Jump";
        if (i.crouch) {
          if (speed > 5) {
            this.mode = "Long jump";
            this.vy = 7.8;
            this.vx = Math.sin(this.face) * 16;
            this.vz = Math.cos(this.face) * 16;
          } else {
            this.mode = "Backflip";
            this.vy = 14;
            this.vx = -Math.sin(this.face) * 4;
            this.vz = -Math.cos(this.face) * 4;
          }
          this.chain = 0;
        }
        this.grounded = false;
        this.coyote = 0;
      } else if (this.wallAge < 0.18) {
        this.vy = 12;
        this.vx = this.nx * 10;
        this.vz = this.nz * 10;
        this.wallAge = 9;
        this.mode = "Wall kick";
        this.face = Math.atan2(this.vx, this.vz);
      }
    }
    if (
      i.pound &&
      !wasGrounded &&
      !i.jump &&
      !this.grounded &&
      this.mode !== "Ground pound"
    ) {
      this.mode = "Ground pound";
      this.vy = -22;
      this.vx = 0;
      this.vz = 0;
    }
    if (this.mode !== "Ground pound") {
      const target = i.crouch && this.grounded ? 2 : 9;
      const accel = this.grounded ? 32 : 9;
      const preserve =
        !this.grounded &&
        (this.mode === "Long jump" ||
          this.mode === "Wall kick" ||
          this.mode === "Backflip");
      if (!preserve) {
        this.vx = approach(this.vx, moving ? ax * target : 0, accel * dt);
        this.vz = approach(this.vz, moving ? az * target : 0, accel * dt);
      } else if (moving) {
        this.vx += ax * 3 * dt;
        this.vz += az * 3 * dt;
      }
      if (moving && this.grounded) this.face = Math.atan2(ax, az);
      if (this.grounded)
        this.mode = i.crouch ? "Crouch" : moving ? "Run" : "Idle";
    }
    const beforeY = this.y;
    const oldX = this.x;
    const oldZ = this.z;
    this.x += this.vx * dt;
    this.z += this.vz * dt;
    this.vy -= (i.held && this.vy > 0 ? 25 : 36) * dt;
    this.y += this.vy * dt;
    // Cylinder versus solid prisms, with a small climb allowance for continuous ramps.
    for (const p of this.terrain) {
      const t = top(p, this.z);
      if (this.y + 1.35 < p.y - p.h || beforeY >= t - 0.08 || this.y >= t)
        continue;
      if (this.grounded && Math.abs(t - beforeY) < 0.35) continue;
      if (
        this.x > p.x - p.w / 2 - 0.42 &&
        this.x < p.x + p.w / 2 + 0.42 &&
        this.z > p.z - p.d / 2 - 0.42 &&
        this.z < p.z + p.d / 2 + 0.42
      ) {
        const left = p.x - p.w / 2 - 0.42,
          right = p.x + p.w / 2 + 0.42,
          front = p.z - p.d / 2 - 0.42,
          back = p.z + p.d / 2 + 0.42;
        const dis = [
          Math.abs(this.x - left),
          Math.abs(this.x - right),
          Math.abs(this.z - front),
          Math.abs(this.z - back),
        ];
        const side = dis.indexOf(Math.min(...dis));
        this.nx = side === 0 ? -1 : side === 1 ? 1 : 0;
        this.nz = side === 2 ? -1 : side === 3 ? 1 : 0;
        if (side < 2) {
          this.x = side === 0 ? left : right;
          this.vx = 0;
        } else {
          this.z = side === 2 ? front : back;
          this.vz = 0;
        }
        this.wallAge = 0;
      }
    }
    // Ceilings must arrest ascent rather than allowing a pass through a platform underside.
    for (const p of this.terrain) {
      const bottom = p.y - p.h;
      if (
        this.vy > 0 &&
        oldX > p.x - p.w / 2 &&
        oldX < p.x + p.w / 2 &&
        oldZ > p.z - p.d / 2 &&
        oldZ < p.z + p.d / 2 &&
        beforeY + 1.4 <= bottom &&
        this.y + 1.4 > bottom
      ) {
        this.y = bottom - 1.4;
        this.vy = 0;
      }
    }
    let floor = -Infinity;
    for (const p of this.terrain) {
      if (
        this.x >= p.x - p.w / 2 &&
        this.x <= p.x + p.w / 2 &&
        this.z >= p.z - p.d / 2 &&
        this.z <= p.z + p.d / 2
      ) {
        const t = top(p, this.z);
        if (
          (beforeY >= t - 0.1 ||
            (this.grounded && Math.abs(beforeY - t) < 0.35)) &&
          this.y <= t &&
          this.vy <= 0
        )
          floor = Math.max(floor, t);
      }
    }
    if (floor > -Infinity) {
      if (!this.grounded) {
        this.landAge = 0;
        if (
          this.mode === "Ground pound" &&
          Math.hypot(this.x - 15, this.z) < 2 &&
          floor > 6
        )
          this.bell = true;
      }
      this.y = floor;
      this.vy = 0;
      this.grounded = true;
      if (this.mode === "Ground pound") this.mode = "Land";
    } else this.grounded = false;
    seeds.forEach((s, n) => {
      if (Math.hypot(this.x - s[0], this.y - s[1], this.z - s[2]) < 1.15)
        this.collected.add(n);
    });
    for (let n = 0; n < 3; n++) {
      if (this.defeated.has(n)) continue;
      const e = this.enemy(n);
      if (Math.hypot(this.x - e.x, this.z - e.z) < 0.95 && this.y < 1.6) {
        if (this.vy < 0 && beforeY > 0.8) {
          this.defeated.add(n);
          this.vy = 9;
          this.grounded = false;
          this.mode = "Stomp";
        } else if (this.hurt === 0) {
          this.health--;
          this.hurt = 2;
          this.vx = (this.x - e.x) * 10;
          this.vz = (this.z - e.z) * 10;
          this.vy = 7;
          this.grounded = false;
        }
      }
    }
    if (this.y < -18 || this.health <= 0) {
      this.falls++;
      this.health = 4;
      this.reset();
    }
    const b = beacons[this.mission];
    if (
      b &&
      this.available() &&
      Math.hypot(this.x - b.x, this.y + 0.8 - b.y, this.z - b.z) < 1.6
    ) {
      this.finished = true;
      if (!this.earned.includes(this.mission)) this.earned.push(this.mission);
    }
  }
  available() {
    return (
      this.mission === 0 ||
      (this.mission === 1 && this.collected.size === 8) ||
      (this.mission === 2 && this.bell)
    );
  }
  enemy(n: number) {
    return {
      x: [-5, 6, -16][n]! + Math.sin(this.time * 0.8 + n) * 2,
      z: [-5, 2, 5][n]! + Math.cos(this.time * 0.8 + n) * 2,
    };
  }
}
function approach(a: number, b: number, d: number) {
  return a < b ? Math.min(a + d, b) : Math.max(a - d, b);
}
