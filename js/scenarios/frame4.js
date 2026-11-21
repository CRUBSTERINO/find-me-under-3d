window.SIM = window.SIM || {};
SIM.SCENARIOS = SIM.SCENARIOS || {};
SIM.SCENARIOS.frame4 = {
  id: 'frame4',
  name: 'RC frame building with basement shelter',
  hx: 8, hz: 8,
  view: { target: [0, 1, 1], r: 46 },
  slabT: 0.3, plinthTop: 0,
  basementY: -3.6,
  storeyH: 3.3, storeys: 4,
  palette: { rubble: 0x8a8a84, pile: [0.55, 0.55, 0.53], chunks: [0x9a9a94, 0x7f8a92, 0xb6bcc0, 0x6a6e70, 0x8d8a80, 0x5b6f80, 0xd0d4d6, 0x6e6a63] },

  levels: [
    { yb: -3.5,  pieces: [{ x: [-8.1, 8.1], z: [-8.1, 8.1] }] },
    { gap: 2.95, pieces: [{ x: [-8.1, 8.1], z: [-8.1, 8.1] }] },
    { gap: 1.5,  pieces: [{ x: [-8, 0.5], tz: -9 }, { x: [0.7, 8], tz: 2 }] },
    { gap: 0.4,  pieces: [{ x: [-8, 0.5], tz: -9 }, { x: [0.7, 8], tz: 2 }] },
    { gap: 0.45, pieces: [{ x: [-8, 0.5], tz: -9 }, { x: [0.7, 8], tz: 2 }] },
    { gap: 0.35, pieces: [{ x: [-8, 0.5], tz: -9 }, { x: [0.7, 8], tz: 2 }] }
  ],
  walls: [

    { gap: 1, z: -7.8, x: [-8, 8], t: 0.4 }, { gap: 1, x: -7.8, z: [-8, 8], t: 0.4 }, { gap: 1, x: 7.8, z: [-8, 8], t: 0.4 },
    { gap: 1, z: 7.8, x: [-8, -5.7], t: 0.4 }, { gap: 1, z: 7.8, x: [-4.3, 8], t: 0.4 },
    { gap: 1, x: 0, z: [-8, 3], t: 0.25 },

    { gap: 2, x: [-7.9, -7.4], z: [-7.9, -7.4] }, { gap: 2, x: [-7.9, -7.4], z: [-0.25, 0.25] }, { gap: 2, x: [-7.9, -7.4], z: [7.4, 7.9] },
    { gap: 2, x: [3.8, 4.3], z: [-0.25, 0.25] }
  ],

  extraSolids: [
    { c: [-5.8, -1.6, 8.75], s: [0.2, 3.8, 1.5] }, { c: [-4.2, -1.6, 8.75], s: [0.2, 3.8, 1.5] },
    { c: [-5, -1.6, 9.55], s: [1.8, 3.8, 0.2] }, { c: [-5, -3.35, 8.7], s: [1.8, 0.3, 1.7] }
  ],
  rubble: [
    { c: [5, 4.3, -3], s: [4, 0.7, 4], r: [0, 0, 2] },
    { c: [-4, 4.6, 3], s: [3, 0.5, 3], r: [0, 0, -9] },
    { gap: 2, x: [1.5, 7.5], z: [2, 7.6], fill: 0.5 }
  ],
  panels: [
    { c: [9.4, 1.3, 2], s: [0.25, 2.6, 4], r: [0, 0, -25] },
    { c: [2, 1.2, -9.3], s: [4, 2.4, 0.25], r: [30, 0, 0] }
  ],
  piles: {
    front: { h: 1.8, low: { from: -6.8, to: -3.2, h: 0 }, w: 4 },
    back:  { h: 2.2, w: 4 },
    left:  { h: 0.5, w: 3 },
    right: { h: 2.0, w: 4 }
  },
  pockets: [
    { x: [-5.7, -4.3], y: [-3.2, 0.3], z: [7.6, 9.45] },
    { x: [4.3, 5.9], y: [3.97, 4.5], z: [-3.6, -2.4] }
  ],
  openings: [
    { id: 'O1', side: 'left', z: -2, gap: 2 },
    { id: 'O2', inner: [-5, -2.9, 8.7], outer: [-5, 0.4, 8.7], dir: [0, -1, 0], throughGround: true, hatch: true },
    { id: 'O3', side: 'front', x: 4, gap: 2 },
    { id: 'O4', side: 'back', x: -3, gap: 2 }
  ],
  victims: [
    { id: 'F1', gap: 2, x: -6, z: -2, yaw: 80, tWeak: 0, tUnc: 0, phone: { works: true, bat: 40, drain: 1.2 }, cloth: 0x4b6a8a },
    { id: 'F2', gap: 2, x: 5, z: -1.5, yaw: 20, tWeak: 40, tUnc: 70, phone: { works: true, bat: 70, drain: 0.8 }, cloth: 0x7a4b4b },
    { id: 'F3', x: 5.1, y: 4.12, z: -3, yaw: 0, tWeak: 24, tUnc: 60, phone: null, cloth: 0x3d6b4a },
    { id: 'B1', gap: 1, x: -4.5, z: 6.2, yaw: 90, tWeak: 60, tUnc: 100, phone: { works: true, bat: 60, drain: 1.0 }, cloth: 0x6b5a3a },
    { id: 'B2', gap: 1, x: -2, z: 4.5, yaw: 0, tWeak: 48, tUnc: 90, phone: { works: true, bat: 35, drain: 1.0 }, cloth: 0x5a4b7a },
    { id: 'B3', gap: 1, x: 4, z: 5, yaw: 40, tWeak: 0, tUnc: 0, phone: { works: true, bat: 90, drain: 0.7 }, cloth: 0x8a6a3a }
  ],
  devices: [
    { id: 'R1', role: 'rescuer', pos: [12, 1.2, 13], extraLossDb: 0, moving: true },
    { id: 'R2', role: 'rescuer', pos: [-12, 1.2, 12], extraLossDb: 0, moving: true },
    { id: 'R3', role: 'operator', pos: [7, 2.2, 14], extraLossDb: 3, moving: false }
  ],
  props: [
    { id: 'exc', kind: 'excavator', c: [7, 1.3, 14.5], s: [3, 2.2, 4.2], mat: 'engine' },
    { id: 'gen', kind: 'generator', c: [-12, 0.8, 8], s: [2.2, 1.6, 1.2], mat: 'engine' },
    { id: 'truck', kind: 'truck', c: [16, 1.6, 4], s: [8, 3.2, 2.5], mat: 'metal' },
    { id: 'h1', kind: 'rescuer', c: [12, 0.9, 13], s: [0.5, 1.8, 0.4], mat: 'human' },
    { id: 'h2', kind: 'rescuer', c: [-12, 0.9, 12], s: [0.5, 1.8, 0.4], mat: 'human' },
    { id: 'h3', kind: 'rescuer', c: [-2, 0.9, 13], s: [0.5, 1.8, 0.4], mat: 'human' }
  ]
};
