window.SIM = window.SIM || {};
(function (S) {
  const P = (S.phys = {});
  let sc, concrete = [], rubble = [], pockets = [], props = [];
  const memo = new Map(), exitCache = {};

  function makeBox(def, id) {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(def.r[0] * S.D2R, def.r[1] * S.D2R, def.r[2] * S.D2R, 'XYZ'));
    m.compose(new THREE.Vector3(def.c[0], def.c[1], def.c[2]), q, new THREE.Vector3(1, 1, 1));
    const inv = m.clone().invert();
    const half = [def.s[0] / 2, def.s[1] / 2, def.s[2] / 2];
    const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9], v = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      v.set(i & 1 ? half[0] : -half[0], i & 2 ? half[1] : -half[1], i & 4 ? half[2] : -half[2]).applyMatrix4(m);
      for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], v.getComponent(a)); mx[a] = Math.max(mx[a], v.getComponent(a)); }
    }
    return Object.assign({}, def, { id, m, me: m.elements, ie: inv.elements, half, aabb: mn.concat(mx), quat: q });
  }

  function inBox(b, x, y, z) {
    const a = b.aabb;
    if (x < a[0] || x > a[3] || y < a[1] || y > a[4] || z < a[2] || z > a[5]) return false;
    const e = b.ie;
    if (Math.abs(e[0] * x + e[4] * y + e[8] * z + e[12]) > b.half[0]) return false;
    if (Math.abs(e[1] * x + e[5] * y + e[9] * z + e[13]) > b.half[1]) return false;
    return Math.abs(e[2] * x + e[6] * y + e[10] * z + e[14]) <= b.half[2];
  }

  P.init = function (scenario) {
    sc = scenario; concrete = []; rubble = []; memo.clear(); for (const k in exitCache) delete exitCache[k];
    sc.solids.forEach((d, i) => {
      const b = makeBox(d, 's' + i);
      d.box = b;
      (d.type === 'concrete' ? concrete : rubble).push(b);
    });
    pockets = sc.pockets;
    props = sc.props.map((p) => { const b = makeBox(Object.assign({ r: p.r || [0, 0, 0], type: 'prop' }, p), p.id); return b; });
    P.concrete = concrete; P.rubble = rubble; P.props = props;
  };

  const inFoot = (x, z) => Math.abs(x) < sc.hx && Math.abs(z) < sc.hz;
  P.inFoot = inFoot;
  function side(cf, along, d) {
    if (!cf) return 0;
    const W = cf.w || 5; if (d >= W) return 0;
    let H = cf.h2 !== undefined ? S.lerp(cf.h, cf.h2, S.smooth(cf.grad[0], cf.grad[1], along)) : cf.h;
    if (cf.low) H = S.lerp(H, cf.low.h, S.smooth(cf.low.from, cf.low.from + 1.4, along) * (1 - S.smooth(cf.low.to - 1.4, cf.low.to, along)));
    return H * Math.pow(1 - d / W, 1.2);
  }
  P.pileH = function (x, z) {
    if (inFoot(x, z)) return 0;
    const pf = sc.piles || {}, ax = Math.abs(x), az = Math.abs(z);
    let h = 0;
    if (az >= sc.hz) h = Math.max(h, side(z > 0 ? pf.front : pf.back, x, Math.hypot(Math.max(0, ax - sc.hx), az - sc.hz)));
    if (ax >= sc.hx) h = Math.max(h, side(x > 0 ? pf.right : pf.left, z, Math.hypot(Math.max(0, az - sc.hz), ax - sc.hx)));
    if (h > 0.08) h += 0.12 * Math.sin(x * 1.7 + z * 0.9) * Math.cos(z * 2.3 - x * 0.6) + 0.06 * Math.sin(x * 4.1) * Math.sin(z * 3.7);
    return Math.max(0, h);
  };

  P.classify = function (x, y, z) {
    for (let i = 0; i < concrete.length; i++) if (inBox(concrete[i], x, y, z)) return 'concrete';
    for (let i = 0; i < pockets.length; i++) {
      const p = pockets[i];
      if (x > p.x[0] && x < p.x[1] && y > p.y[0] && y < p.y[1] && z > p.z[0] && z < p.z[1]) return 'air';
    }
    if (y < 0 && !(sc.basementY !== undefined && y > sc.basementY && inFoot(x, z))) return 'ground';
    for (let i = 0; i < rubble.length; i++) if (inBox(rubble[i], x, y, z)) return 'rubble';
    if (!inFoot(x, z) && y < P.pileH(x, z)) return 'rubble';
    return 'air';
  };

  P.path = function (a, b) {
    const key = a.map((v) => v.toFixed(2)).join(',') + '|' + b.map((v) => v.toFixed(2)).join(',');
    if (memo.has(key)) return memo.get(key);
    const len = S.dist(a, b), step = 0.04, n = Math.max(2, Math.ceil(len / step)), ds = len / n;
    let conc = 0, rub = 0, soil = 0, air = 0, crossings = 0, prev = 'air';
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const c = P.classify(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
      if (c === 'concrete') { conc += ds; if (prev !== 'concrete') crossings++; }
      else if (c === 'rubble') rub += ds;
      else if (c === 'ground') soil += ds;
      else air += ds;
      prev = c;
    }
    const T = S.CONFIG.slabThickness;

    const slabs = crossings + 0.25 * Math.max(0, conc - 1.5 * T * crossings) / T;
    const r = { dist: len, concrete: conc, rubble: rub, soil, air, crossings, slabs };
    memo.set(key, r);
    return r;
  };

  function rayDownBox(b, x, z, y0) {
    const e = b.ie;
    const o = [e[0] * x + e[4] * y0 + e[8] * z + e[12], e[1] * x + e[5] * y0 + e[9] * z + e[13], e[2] * x + e[6] * y0 + e[10] * z + e[14]];
    const d = [-e[4], -e[5], -e[6]];
    let tmin = -1e9, tmax = 1e9, ax = -1, sg = 0;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(d[i]) < 1e-9) { if (Math.abs(o[i]) > b.half[i]) return null; continue; }
      let t1 = (-b.half[i] - o[i]) / d[i], t2 = (b.half[i] - o[i]) / d[i], s = -1;
      if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; s = 1; }
      if (t1 > tmin) { tmin = t1; ax = i; sg = s; }
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
    if (tmax < 0) return null;
    const me = b.me, c = ax * 4;
    return { t: tmin, n: [me[c] * sg, me[c + 1] * sg, me[c + 2] * sg] };
  }

  P.surfaceAt = function (x, z, withProps) {
    const y0 = 60;
    let best = { y: 0, n: [0, 1, 0], mat: 'ground', id: 'ground' };
    const ph = P.pileH(x, z);
    if (ph > 0) {
      const e = 0.2, gx = (P.pileH(x + e, z) - P.pileH(x - e, z)) / (2 * e), gz = (P.pileH(x, z + e) - P.pileH(x, z - e)) / (2 * e);
      const l = Math.hypot(gx, 1, gz);
      best = { y: ph, n: [-gx / l, 1 / l, -gz / l], mat: 'rubble', id: 'pile' + Math.floor(x / 0.7) + '_' + Math.floor(z / 0.7) };
    }
    const lists = withProps === false ? [concrete, rubble] : [concrete, rubble, props];
    for (const L of lists) for (const b of L) {
      const a = b.aabb;
      if (x < a[0] || x > a[3] || z < a[2] || z > a[5] || a[4] < best.y) continue;
      const h = rayDownBox(b, x, z, y0);
      if (h && y0 - h.t > best.y) best = { y: y0 - h.t, n: h.n, mat: b.mat || b.type, id: b.id, role: b.role || b.kind };
    }
    return best;
  };

  P.victimState = function (v, h) {
    const level = v.tUnc === 0 || h >= v.tUnc ? 'unconscious' : h >= v.tWeak ? 'weak' : 'conscious';
    let battery = 0, phoneOn = false;
    if (v.phone && v.phone.works) { battery = Math.max(0, v.phone.bat - v.phone.drain * h); phoneOn = battery > 0; }
    return {
      level, alive: true,
      tapping: level === 'conscious' ? 1 : level === 'weak' ? 0.45 : 0,
      moving: level === 'conscious',
      breathRate: level === 'conscious' ? 16 : level === 'weak' ? 13 : 10,
      phoneOn, battery
    };
  };

  P.exits = function (v) {
    if (exitCache[v.id]) return exitCache[v.id];
    const out = [];
    const s = P.surfaceAt(v.x, v.z, false);
    out.push({ kind: 'up', pos: [v.x, s.y + 0.05, v.z], path: P.path(v.pos, [v.x, s.y + 0.05, v.z]) });
    sc.openings.forEach((o) => {
      if (S.dist(v.pos, o.inner) > 9) return;
      const p = P.path(v.pos, o.inner);
      out.push({ kind: 'opening', id: o.id, pos: o.outer, path: p });
    });

    const pf = sc.piles || {};
    [['z', sc.hz, v.z, v.z > 0 ? pf.front : pf.back], ['x', sc.hx, v.x, v.x > 0 ? pf.right : pf.left]].forEach(([ax, h, c, cf]) => {
      if (!cf || Math.abs(c) < h - 2.5 || Math.abs(c) > h + 0.5 || v.y < 0) return;
      const e = Math.sign(c) * (h + 0.8), q = ax === 'z' ? [v.x, v.y, e] : [e, v.y, v.z];
      const p1 = P.path(v.pos, q);
      const tp = P.surfaceAt(q[0], q[2], false).y + 0.05;
      if (tp < v.y) return;
      const p2 = P.path(q, [q[0], tp, q[2]]);
      out.push({ kind: 'edge', pos: [q[0], tp, q[2]], path: { dist: p1.dist + p2.dist, concrete: p1.concrete + p2.concrete, rubble: p1.rubble + p2.rubble, soil: p1.soil + p2.soil, air: p1.air + p2.air, crossings: p1.crossings + p2.crossings, slabs: p1.slabs + p2.slabs } });
    });
    exitCache[v.id] = out;
    return out;
  };

  P.placeOf = function (p) {
    let zone = 'ground';
    if (inFoot(p[0], p[2]) && p[1] > 0.3) zone = 'top';
    else if (P.surfaceAt(p[0], p[2]).mat === 'building') zone = 'neighbour';
    else if (p[1] > 0.3 && Math.abs(p[2]) >= sc.hz) zone = p[2] > 0 ? 'front' : 'back';
    else if (p[1] > 0.3) zone = 'side';
    return { k: 'zone.at', p: { zone: { k: 'zone.' + zone }, x: S.fmt(p[0], 0), z: S.fmt(p[2], 0) } };
  };
})(window.SIM);
