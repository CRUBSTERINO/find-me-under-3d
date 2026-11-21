window.SIM = window.SIM || {};
SIM.SCENARIOS = SIM.SCENARIOS || {};
SIM.SCENARIOS.panel9 = {
  id: 'panel9',
  name: '9-storey RC panel block',
  hx: 9, hz: 6,
  view: { target: [0, 3, 1], r: 62 },
  slabT: 0.22,
  plinthTop: 0.5,
  storeyH: 2.8, storeys: 9,

  levels: [
    { gap: 0,    pieces: [{ x: [-9.1, 9.1], z: [-6.1, 6.1] }] },
    { gap: 1.1,  pieces: [{ x: [-9, 9], tz: -0.8 }] },
    { gap: 0.45, pieces: [{ x: [-9, 0.2], tz: -1.2 }, { x: [0.3, 9] }] },
    { gap: 0.25, dx: 0.3, pieces: [{ x: [-9, 8.7] }] },
    { gap: 0.8,  pieces: [{ x: [-9, 3] }, { x: [3.1, 9] }] },
    { gap: 0.3,  pieces: [{ x: [-9, 9] }] },
    { gap: 0.55, dz: 0.5, pieces: [{ x: [-9, 9] }] },
    { gap: 0.2,  pieces: [{ x: [-9, 9] }] },
    { gap: 0.6,  dz: 0.6, pieces: [{ x: [-9, 9], tz: -1.2 }] },
    { gap: 0.5,  pieces: [{ x: [-9, -0.5] }, { x: [-0.1, 9] }] }
  ],

  walls: [
    { gap: 1, x: -6, z: [-6, 3] }, { gap: 1, x: 5.5, z: [-2, 4.5] }, { gap: 1, z: -2.5, x: [-6, 0] },
    { gap: 4, x: -2, z: [-6, -3] }, { gap: 4, x: 5, z: [0, 6] },
    { gap: 6, x: 2.2, z: [1, 4] },
    { gap: 8, z: 0.3, x: [-9, -4] },
    { gap: 9, x: 6, z: [-3, 3] }
  ],

  rubble: [
    { gap: 1, x: [-9, 9], z: [4.6, 6], fill: 1 },
    { gap: 6, x: [3.5, 9], z: [2.5, 5.6], fill: 1 },
    { gap: 4, x: [3.2, 8.5], z: [-6, -1], fill: 0.6 },
    { gap: 8, x: [3, 9], z: [-1, 4], fill: 0.5 },
    { top: true, x: [-9, -1.3], z: [-6, 6], t: 0.55 },
    { top: true, x: [1.9, 9], z: [-6, 1.2], t: 0.4 },
    { top: true, x: [3, 9], z: [1.2, 6.2], t: 0.9 }
  ],

  panels: [
    { c: [-6, 3.3, 7.2], s: [3.2, 2.8, 0.18], r: [-32, 0, 0] },
    { c: [3.2, 3.0, 7.4], s: [2.6, 2.8, 0.18], r: [-28, 0, -5] },
    { c: [5, 2.9, -7.6], s: [3.2, 2.8, 0.18], r: [38, 0, 0] },
    { c: [-5.5, 3.6, -7.2], s: [3.0, 2.8, 0.18], r: [30, 0, -6] },
    { c: [-5, 8.25, -2.5], s: [3.0, 0.18, 2.6], r: [0, 15, 10] },
    { c: [5.5, 8.6, 3.5], s: [2.8, 0.18, 2.4], r: [-8, -20, 0] }
  ],

  piles: {
    front: { h: 3.2, low: { from: -3.2, to: 3.2, h: 2.0 }, w: 5 },
    back:  { h: 2.5, h2: 4.2, grad: [-3, 2], w: 5.5 }
  },

  pockets: [
    { x: [4, 6.2], y: [1.35, 2.0], z: [-8.1, -6.9] },
    { x: [6.2, 7.8], y: [1.5, 1.92], z: [7.1, 7.9] }
  ],

  openings: [
    { id: 'O1', side: 'front', x: -1.5, gap: 6 },
    { id: 'O2', side: 'front', x: 5.5, gap: 6 },
    { id: 'O3', side: 'front', x: -5, gap: 8 },
    { id: 'O4', side: 'top', x: -0.3, z: -0.5 },
    { id: 'O5', side: 'back', x: -4, gap: 4 },
    { id: 'O6', side: 'back', x: 4, gap: 9 },
    { id: 'O7', side: 'front', x: 2.5, gap: 9 }
  ],

  victims: [
    { id: 'P1', gap: 1, x: -3, z: 1, yaw: 20, tWeak: 30, tUnc: 60, phone: { works: true, bat: 70, drain: 0.9 }, cloth: 0x4b6a8a },
    { id: 'P2', gap: 4, x: 1, z: -1.5, yaw: -40, tWeak: 0, tUnc: 0, phone: { works: true, bat: 30, drain: 1.4 }, cloth: 0x7a4b4b },
    { id: 'P3', gap: 9, x: 1.2, z: -0.5, yaw: 80, tWeak: 48, tUnc: 80, phone: null, cloth: 0x3d6b4a },
    { id: 'P4', gap: 6, x: -1.5, z: 4.6, yaw: 5, tWeak: 0, tUnc: 0, phone: { works: false }, cloth: 0x6b5a3a },
    { id: 'P5', x: 5, y: 1.62, z: -7.5, yaw: 0, tWeak: 4, tUnc: 12, phone: { works: true, bat: 15, drain: 2 }, cloth: 0x5a4b7a },
    { id: 'P6', x: 7, y: 1.66, z: 7.5, yaw: 0, tWeak: 60, tUnc: 96, phone: { works: true, bat: 80, drain: 0.9 }, cloth: 0x8a6a3a },
    { id: 'P7', gap: 2, x: -7, z: 5, yaw: 90, tWeak: 36, tUnc: 72, phone: null, cloth: 0x4a5a6a }
  ],

  devices: [
    { id: 'R1', role: 'rescuer', pos: [13, 1.2, 12], extraLossDb: 0, moving: true },
    { id: 'R2', role: 'rescuer', pos: [15, 1.2, 13], extraLossDb: 0, moving: true },
    { id: 'R3', role: 'operator', pos: [-4, 2.2, 14], extraLossDb: 3, moving: false },
    { id: 'N1', role: 'neighbour', pos: [-19, 9.6, -2], extraLossDb: 14, moving: false },
    { id: 'N2', role: 'neighbour', pos: [20, 18.0, 1], extraLossDb: 14, moving: false }
  ],

  props: [
    { id: 'nbL', kind: 'neighbour', c: [-18.05, 12.9, 0], s: [17.9, 25.8, 12], mat: 'building', exposed: 'px', style: 'panel' },
    { id: 'nbR', kind: 'neighbour', c: [18.05, 12.9, 0], s: [17.9, 25.8, 12], mat: 'building', exposed: 'nx', style: 'panel' },
    { id: 'exc', kind: 'excavator', c: [-4, 1.3, 14.5], s: [3, 2.2, 4.2], mat: 'engine' },
    { id: 'gen', kind: 'generator', c: [-11.5, 0.8, 12.5], s: [2.2, 1.6, 1.2], mat: 'engine' },
    { id: 'truck', kind: 'truck', c: [16, 1.6, 17.5], s: [8, 3.2, 2.5], mat: 'metal' },
    { id: 'h1', kind: 'rescuer', c: [13, 0.9, 12], s: [0.5, 1.8, 0.4], mat: 'human' },
    { id: 'h2', kind: 'rescuer', c: [15, 0.9, 13], s: [0.5, 1.8, 0.4], mat: 'human' },
    { id: 'h3', kind: 'rescuer', c: [-1.6, 0.9, 13.6], s: [0.5, 1.8, 0.4], mat: 'human' }
  ],

  fire: { pos: [-6, 8.05, 3] }
};
