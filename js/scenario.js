window.SIM = window.SIM || {};
SIM.SCENARIOS = SIM.SCENARIOS || {};

SIM.buildScenario = function (sc) {
  const T = sc.slabT, D2R = Math.PI / 180, hx = sc.hx, hz = sc.hz;
  const solids = [];
  sc.levelInfo = [];
  let prevTop = 0;
  sc.levels.forEach((L, k) => {
    const yb = L.yb !== undefined ? L.yb : k === 0 ? (sc.plinthTop || 0) : prevTop + L.gap;
    const pieces = L.pieces.map((p) => {
      const z = p.z || [-hz, hz], dx = L.dx || 0, dz = L.dz || 0;
      const x0 = p.x[0] + dx, x1 = p.x[1] + dx, z0 = z[0] + dz, z1 = z[1] + dz;
      const pc = { x0, x1, z0, z1, cx: (x0 + x1) / 2, cy: yb + T / 2, cz: (z0 + z1) / 2, tx: p.tx || 0, tz: p.tz || 0 };
      solids.push({ type: 'concrete', role: 'slab', level: k, c: [pc.cx, pc.cy, pc.cz], s: [x1 - x0, T, z1 - z0], r: [pc.tx, 0, pc.tz] });
      return pc;
    });
    sc.levelInfo.push({ yb, top: yb + T, pieces });
    prevTop = yb + T;
  });
  if (sc.plinthTop > 0) solids.push({ type: 'concrete', role: 'plinth', c: [0, sc.plinthTop / 2, 0], s: [2 * hx + 0.2, sc.plinthTop, 2 * hz + 0.2], r: [0, 0, 0] });
  sc.roofTop = prevTop;
  const top = sc.levels.length - 1;

  const pieceAt = (k, x, z) => sc.levelInfo[k].pieces.find((p) => x >= p.x0 - 0.05 && x <= p.x1 + 0.05 && z >= p.z0 - 0.05 && z <= p.z1 + 0.05);
  const slabY = (p, x, z, side) => p.cy + side * T / 2 + (x - p.cx) * Math.sin(p.tz * D2R) - (z - p.cz) * Math.sin(p.tx * D2R);
  sc.floorY = (k, x, z) => { const p = pieceAt(k, x, z); return p ? slabY(p, x, z, 1) : sc.levelInfo[k].top; };
  sc.ceilY = (k, x, z) => { const p = pieceAt(k, x, z); return p ? slabY(p, x, z, -1) : sc.levelInfo[k].yb; };
  sc.gapMid = (k, x, z) => (sc.floorY(k - 1, x, z) + sc.ceilY(k, x, z)) / 2;

  (sc.walls || []).forEach((w) => {
    const t = w.t || 0.16;
    const xr = typeof w.x === 'number' ? [w.x - t / 2, w.x + t / 2] : w.x;
    const zr = typeof w.z === 'number' ? [w.z - t / 2, w.z + t / 2] : w.z;
    const cx = (xr[0] + xr[1]) / 2, cz = (zr[0] + zr[1]) / 2;
    const bot = sc.floorY(w.gap - 1, cx, cz), tp = sc.ceilY(w.gap, cx, cz), h = tp - bot - 0.02;
    solids.push({ type: 'concrete', role: 'wall', c: [cx, bot + 0.01 + h / 2, cz], s: [xr[1] - xr[0], h, zr[1] - zr[0]], r: [0, 0, 0] });
  });

  (sc.rubble || []).forEach((r) => {
    if (r.c) { solids.push({ type: 'rubble', role: 'topRubble', c: r.c, s: r.s, r: r.r || [0, 0, 0] }); return; }
    const cx = (r.x[0] + r.x[1]) / 2, cz = (r.z[0] + r.z[1]) / 2;
    let bot, h;
    if (r.top) { bot = sc.floorY(top, cx, cz); h = r.t; }
    else { bot = sc.floorY(r.gap - 1, cx, cz) + 0.005; h = (sc.ceilY(r.gap, cx, cz) - bot) * r.fill - 0.01; }
    solids.push({ type: 'rubble', role: r.top ? 'topRubble' : 'voidRubble', c: [cx, bot + h / 2, cz], s: [r.x[1] - r.x[0], h, r.z[1] - r.z[0]], r: [0, 0, 0] });
  });

  (sc.panels || []).forEach((p) => solids.push({ type: 'concrete', role: 'panel', c: p.c, s: p.s, r: p.r }));
  (sc.extraSolids || []).forEach((p) => solids.push(Object.assign({ type: 'concrete', role: 'wall', r: [0, 0, 0] }, p)));
  sc.solids = solids;
  sc.pockets = sc.pockets || [];

  sc.victims.forEach((v) => {
    if (v.gap !== undefined) v.y = sc.floorY(v.gap - 1, v.x, v.z) + 0.14;
    v.pos = [v.x, v.y, v.z];
  });

  sc.openings.forEach((o) => {
    if (o.inner) {
      if (!o.dir) { const d = o.inner.map((v, i) => v - o.outer[i]), l = Math.hypot(...d); o.dir = d.map((v) => v / l); }
      return;
    }
    if (o.side === 'top') {
      const yIn = sc.gapMid(top, o.x + 0.3, o.z);
      o.inner = [o.x, yIn, o.z]; o.outer = [o.x, sc.floorY(top, o.x + 0.3, o.z) + 0.3, o.z]; o.dir = [0, -1, 0];
    } else if (o.side === 'front' || o.side === 'back') {
      const s = o.side === 'front' ? 1 : -1, y = sc.gapMid(o.gap, o.x, s * (hz - 0.4));
      o.inner = [o.x, y, s * (hz - 0.4)]; o.outer = [o.x, y, s * (hz + 0.7)]; o.dir = [0, 0, -s];
    } else {
      const s = o.side === 'right' ? 1 : -1, y = sc.gapMid(o.gap, s * (hx - 0.4), o.z);
      o.inner = [s * (hx - 0.4), y, o.z]; o.outer = [s * (hx + 0.7), y, o.z]; o.dir = [-s, 0, 0];
    }
  });
  return sc;
};

SIM.applyVariant = function (sc, seed) {
  const r = SIM.rng('variant' + seed + sc.id), N = sc.victims.length;
  const pick = (a, b) => a + (b - a) * r();
  let out = sc.victims.map((v0) => {
    const v = JSON.parse(JSON.stringify(v0));
    if (v.tUnc === 0) { if (r() < 0.4) { v.tWeak = Math.round(pick(0, 6)); v.tUnc = Math.round(pick(8, 30)); } }
    else { const k = pick(0.4, 1.6); v.tWeak = Math.round(v.tWeak * k); v.tUnc = Math.max(v.tWeak + 4, Math.round(v.tUnc * pick(0.5, 1.5))); if (r() < 0.15) { v.tWeak = 0; v.tUnc = 0; } }
    if (!v.phone) { if (r() < 0.3) v.phone = { works: true, bat: Math.round(pick(20, 80)), drain: +pick(0.6, 1.5).toFixed(2) }; }
    else if (r() < 0.25) v.phone = { works: false };
    else if (v.phone.works) { v.phone.bat = Math.round(SIM.clamp(v.phone.bat + pick(-25, 25), 10, 95)); v.phone.drain = +(v.phone.drain * pick(0.6, 1.5)).toFixed(2); }
    return v;
  });
  const absent = Math.min(2, Math.floor(pick(0, 2.99)));
  for (let i = 0; i < absent; i++) out.splice(Math.floor(r() * out.length), 1);
  sc.victims = out;
  return { seed, min: Math.max(1, N - 2), max: N };
};
