export interface Platform {
  x: number;
  z: number;
  w: number;
  d: number;
  y: number;
  h: number;
  ramp?: number;
  color: number;
}
export const platforms: Platform[] = [
  { x: 0, z: 0, w: 44, d: 40, y: 0, h: 5, color: 0x86b866 },
  { x: -11, z: -5, w: 9, d: 12, y: 0, h: 3, ramp: 3, color: 0xa4bd73 },
  { x: -11, z: -14, w: 9, d: 6, y: 3, h: 6, color: 0x93b367 },
  { x: -4, z: -14, w: 5, d: 6, y: 4.5, h: 7, color: 0xa0ba71 },
  { x: 2, z: -14, w: 5, d: 6, y: 6, h: 9, color: 0x93b367 },
  { x: 8, z: -14, w: 6, d: 6, y: 7.5, h: 11, color: 0xb3c480 },
  { x: 13, z: -14, w: 4, d: 6, y: 9, h: 13, color: 0xa4bb76 },
  { x: 16, z: -14, w: 5, d: 8, y: 10.5, h: 15, color: 0xbccf8f },
  { x: 12, z: 4, w: 2, d: 10, y: 5, h: 5, color: 0xc3a985 },
  { x: 18, z: 4, w: 2, d: 10, y: 5, h: 5, color: 0xc3a985 },
  { x: 15, z: 0, w: 4, d: 2, y: 6.8, h: 1, color: 0xe6b26d },
  { x: -12, z: 10, w: 6, d: 5, y: 1.5, h: 2, color: 0xd7b576 },
  { x: -18, z: 14, w: 4, d: 4, y: 3.5, h: 5, color: 0xd7b576 },
  { x: -26, z: 11, w: 5, d: 6, y: 2, h: 6, color: 0xb3c480 },
];
export function top(p: Platform, z: number): number {
  return (
    p.y +
    (p.ramp ? Math.max(0, Math.min(1, (p.z + p.d / 2 - z) / p.d)) * p.ramp : 0)
  );
}
export const seeds = [
  [-4, 0, 5],
  [-8, 0, 1],
  [0, 0, 0],
  [6, 0, 6],
  [-11, 1.5, 10],
  [-18, 3.5, 14],
  [-11, 3, -14],
  [8, 7.5, -14],
] as const;
export const beacons = [
  { x: 16, y: 11.5, z: -14, name: "Summit delivery" },
  { x: 0, y: 1, z: 8, name: "Eight wandering seeds" },
  { x: 15, y: 7.8, z: 0, name: "Ring the high bell" },
];
