window.SIM = window.SIM || {};
(function (S) {
  const A = (S.access = {});
  const cam = () => S.CONFIG.tools.camera;

  A.init = function (sc, level) {
    sc.openings.forEach((o) => (o.known = !level));
  };

  function reveal(o, how, out) {
    if (o.known) return;
    o.known = true;
    out.push({ id: o.id, how });
  }

  A.discover = function (dep, res) {
    const out = [], ops = S.SCENARIO.openings.filter((o) => !o.known);
    if (!ops.length || !res) return out;
    if (dep.tool === 'dog') {

      const R = S.CONFIG.tools.dog.searchRadiusM;
      (res.spots || []).forEach((s) => {
        if (S.dist2(s.pos, dep.point) > R) return;
        ops.forEach((o) => { if (s.exit === o.id || S.dist2(s.pos, o.outer) < 1) reveal(o, 'dog', out); });
      });
    }
    if (dep.tool === 'thermal' && res.T) {
      const [W, H] = S.CONFIG.tools.thermal.footprintM, nx = res.nx, ny = res.ny, T = res.T;
      ops.forEach((o) => {
        const i = Math.floor((o.outer[0] - dep.point[0] + W / 2) / W * nx), j = Math.floor((o.outer[2] - dep.point[2] + H / 2) / H * ny);
        if (i < 3 || j < 3 || i >= nx - 3 || j >= ny - 3) return;
        let pk = -99; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) pk = Math.max(pk, T[(j + b) * nx + i + a]);
        const ring = [];
        for (let a = -10; a <= 10; a += 2) for (let b = -10; b <= 10; b += 2) {
          if (Math.abs(a) < 6 && Math.abs(b) < 6) continue;
          const ii = i + a, jj = j + b; if (ii >= 0 && jj >= 0 && ii < nx && jj < ny) ring.push(T[jj * nx + ii]);
        }
        ring.sort((x, y) => x - y);
        if (pk - ring[Math.floor(ring.length / 2)] >= 1.5) reveal(o, 'thermal', out);
      });
    }
    if (out.length) S.view.refreshOpenings();
    return out;
  };

  A.pick = function (p) {
    const c = cam(); let best = null, bd = 1e9;
    S.SCENARIO.openings.forEach((o) => {
      const d = S.dist(p, o.ring || o.outer), lim = o.known ? c.accessRadiusM : c.blindRadiusM;
      if (d <= lim && d < bd) { bd = d; best = o; }
    });
    return best;
  };
  A.revealBlind = function (o) { if (!o.known) { o.known = true; S.view.refreshOpenings(); return true; } return false; };
})(window.SIM);
