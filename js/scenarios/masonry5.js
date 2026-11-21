window.SIM = window.SIM || {};
SIM.SCENARIOS = SIM.SCENARIOS || {};
SIM.SCENARIOS.masonry5 = {
  id: 'masonry5',
  name: '5-storey brick block',
  hx: 10, hz: 6,
  view: { target: [0, 2, 1], r: 50 },
  slabT: 0.22, plinthTop: 0.4,
  storeyH: 2.7, storeys: 5,
  palette: { rubble: 0x94705f, pile: [0.52, 0.40, 0.34], chunks: [0xa5604a, 0x8f5442, 0xb87a62, 0x7c4a3a, 0xa89f94, 0x8a8479, 0xc9b9a8, 0x6e4a3e] },

  levels: [
    { gap: 0,   pieces: [{ x: [-10.1, 10.1], z: [-6.1, 6.1] }] },
    { gap: 1.0, pieces: [{ x: [-10, -0.2] }, { x: [0, 10], tz: -2 }] },
    { gap: 0.55, pieces: [{ x: [-10, -4.2], tz: 3 }, { x: [-4, 10] }] }
  ],
  walls: [
    { gap: 1, x: -6, z: [-6, 6], t: 0.38 }, { gap: 1, z: 0, x: [-10, 10], t: 0.38 },
    { gap: 2, x: 3, z: [-6, 1], t: 0.38 }
  ],

  rubble: [
    { top: true, x: [-10.2, 10.2], z: [-6.2, 6.2], t: 2.0 },
    { gap: 1, x: [2, 10], z: [-6, -2], fill: 0.7 },
    { gap: 2, x: [-4, 2], z: [-6, 6], fill: 0.6 }
  ],

  panels: [
    { c: [-6.5, 3.75, 0.5], s: [3.6, 0.2, 3.4], r: [0, 0, 14] },
    { c: [2, 4.75, -2], s: [3.5, 0.2, 1.2], r: [5, 20, -8] },
    { c: [6.5, 4.3, 1.5], s: [4, 0.2, 1.2], r: [-6, -30, -12] },
    { c: [-4, 4.6, 3], s: [3, 0.2, 1.2], r: [8, 50, 6] },
    { c: [6.5, 3.2, -7.3], s: [3.2, 2.6, 0.38], r: [35, 0, 4] }
  ],
  piles: {
    front: { h: 3.5, low: { from: -6, to: -2, h: 2.2 }, w: 5 },
    back:  { h: 3.8, w: 5 },
    left:  { h: 3.0, low: { from: 1, to: 5, h: 1.2 }, w: 4.5 },
    right: { h: 3.2, h2: 2.4, grad: [-3, 3], w: 4.5 }
  },
  pockets: [
    { x: [-10.6, -5], y: [2.62, 3.45], z: [-1, 2] },
    { x: [10.8, 12.2], y: [1.1, 1.5], z: [-1, 0.6] },
    { x: [-5, -3], y: [0.42, 0.85], z: [7, 8] }
  ],
  openings: [
    { id: 'O1', side: 'left', z: 3, gap: 2 },
    { id: 'O2', inner: [-9.6, 3.0, 0.5], outer: [-11.0, 3.0, 0.5] },
    { id: 'O3', side: 'front', x: -4, gap: 2 },
    { id: 'O4', side: 'left', z: -4, gap: 1 }
  ],
  victims: [
    { id: 'M1', x: -6.8, y: 2.76, z: 0.5, yaw: 0, tWeak: 20, tUnc: 40, phone: { works: true, bat: 50, drain: 1 }, cloth: 0x4b6a8a },
    { id: 'M2', gap: 1, x: -3, z: 3, yaw: 30, tWeak: 0, tUnc: 0, phone: { works: false }, cloth: 0x7a4b4b },
    { id: 'M3', x: 11.5, y: 1.24, z: -0.2, yaw: 90, tWeak: 10, tUnc: 30, phone: null, cloth: 0x3d6b4a },
    { id: 'M4', gap: 2, x: 6, z: -4.5, yaw: 10, tWeak: 30, tUnc: 60, phone: { works: true, bat: 60, drain: 0.8 }, cloth: 0x6b5a3a },
    { id: 'M5', x: -4, y: 0.6, z: 7.5, yaw: 0, tWeak: 0, tUnc: 0, phone: { works: true, bat: 25, drain: 1.5 }, cloth: 0x5a4b7a }
  ],
  devices: [
    { id: 'R1', role: 'rescuer', pos: [14, 1.2, 12], extraLossDb: 0, moving: true },
    { id: 'R2', role: 'rescuer', pos: [-14, 1.2, 10], extraLossDb: 0, moving: true },
    { id: 'N1', role: 'neighbour', pos: [26, 5.0, 2], extraLossDb: 12, moving: false }
  ],
  props: [
    { id: 'nbR', kind: 'neighbour', c: [27, 6.9, 0], s: [20, 13.8, 12], mat: 'building', style: 'brick', storeys: 5 },
    { id: 'exc', kind: 'excavator', c: [-9, 1.3, 14], s: [3, 2.2, 4.2], mat: 'engine' },
    { id: 'gen', kind: 'generator', c: [-16, 0.8, 9], s: [2.2, 1.6, 1.2], mat: 'engine' },
    { id: 'truck', kind: 'truck', c: [10, 1.6, 17], s: [8, 3.2, 2.5], mat: 'metal' },
    { id: 'h1', kind: 'rescuer', c: [14, 0.9, 12], s: [0.5, 1.8, 0.4], mat: 'human' },
    { id: 'h2', kind: 'rescuer', c: [-14, 0.9, 10], s: [0.5, 1.8, 0.4], mat: 'human' },
    { id: 'h3', kind: 'rescuer', c: [-6.6, 0.9, 13.6], s: [0.5, 1.8, 0.4], mat: 'human' }
  ],
  fire: { pos: [3, 4.6, 1] }
};
