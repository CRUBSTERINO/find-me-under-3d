window.SIM = window.SIM || {};
(function (S) {
  const A = (S.analysis = {});
  const tool = (id) => S.TOOLS.find((t) => t.id === id);

  function surfacePoints(step) {
    const sc = S.SCENARIO, out = [];
    for (let x = -sc.hx - 6; x <= sc.hx + 6; x += step) for (let z = -sc.hz - 6; z <= sc.hz + 6; z += step) {
      const s = S.phys.surfaceAt(x, z);
      if (['building', 'engine', 'metal', 'human'].includes(s.mat)) continue;
      out.push([x, s.y + 0.05, z]);
    }
    return out;
  }

  A.coverage = function (cond) {
    const sc = S.SCENARIO, res = {}, pts = surfacePoints(1.5);
    let n = 0;
    const add = (tid, hits, p) => (hits || []).forEach((id) => { if (!res[tid][id]) res[tid][id] = p; });
    ['geophone', 'radar', 'dog', 'phone'].forEach((tid) => {
      res[tid] = {};
      pts.forEach((p, i) => {
        if (tid === 'phone' && i % 3) return;
        const r = tool(tid).evaluate({ id: 'cov' + n++, tool: tid, point: p, params: { fatigue: 0 } }, cond);
        add(tid, r.hits, p);
      });
    });
    res.thermal = {};
    const fp = S.CONFIG.tools.thermal.footprintM;
    for (let x = -sc.hx; x <= sc.hx + 0.1; x += fp[0] / 2.5) for (let z = -sc.hz; z <= sc.hz + 0.1; z += fp[1] / 2.5) {
      const p = [x, S.phys.surfaceAt(x, z, false).y, z];
      add('thermal', tool('thermal').evaluate({ id: 'cov' + n++, tool: 'thermal', point: p, params: {} }, cond).hits, p);
    }
    res.camera = {};
    const cam = tool('camera'), maxL = S.CONFIG.tools.camera.maxLengthM;
    sc.openings.forEach((o) => {
      const vert = Math.abs(o.dir[1]) > 0.7;
      const bends = vert ? [0, 40, 70, 90] : [-40, -15, 0, 20], spins = vert ? [0, 45, 90, 135, 180, 225, 270, 315] : [-90, -60, -30, 0, 30, 60, 90];
      [1.2, 2.5, maxL].forEach((len) => bends.forEach((b) => spins.forEach((sp) => {
        const r = cam.evaluate({ id: 'cov' + n++, tool: 'camera', point: o.outer, params: { op: o.id, length: len, bend: b, spin: sp } }, cond);
        add('camera', r.hits, o.outer);
      })));
    });
    return res;
  };

  A.yours = function (deps, cond) {
    const out = {};
    deps.forEach((d) => {
      const r = tool(d.tool).evaluate(d, cond);
      (r.hits || []).forEach((id) => { (out[id] = out[id] || []).push(d); });
    });
    return out;
  };

  A.where = function (v) {
    const up = S.phys.exits(v)[0].path;
    const zone = v.y < 0 ? 'basement' : S.phys.inFoot(v.x, v.z) ? 'stack' : 'pile';
    return { k: 'deb.where', p: { zone: { k: 'deb.zone.' + zone }, s: Math.round(up.crossings), r: S.fmt(up.rubble) } };
  };

  A.kits = function (cov, budget, toolIds) {
    const out = [];
    const ids = toolIds || S.TOOLS.map((t) => t.id);
    for (let m = 1; m < 1 << ids.length; m++) {
      const kit = ids.filter((_, i) => m & (1 << i));
      const price = kit.reduce((a, t) => a + S.CONFIG.costs[t].price, 0);
      if (price > budget) continue;
      const found = new Set(); kit.forEach((t) => Object.keys(cov[t] || {}).forEach((id) => found.add(id)));
      out.push({ kit, price, found: [...found].sort() });
    }
    out.sort((a, b) => b.found.length - a.found.length || a.price - b.price || a.kit.length - b.kit.length);
    return out;
  };
})(window.SIM);
