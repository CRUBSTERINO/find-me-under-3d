(function (S) {
  const cfg = () => S.CONFIG.tools.thermal;
  const SUN = (function () { const v = [28, 45, 30], l = Math.hypot(...v); return v.map((x) => x / l); })();
  const h01 = (s) => (S.hash(s) % 10007) / 10007;

  function surfaceGrid(dep) {
    if (dep._surf) return dep._surf;
    const c = cfg(), [W, H] = c.footprintM, [nx, ny] = c.pixels, out = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const x = dep.point[0] - W / 2 + (i + 0.5) * W / nx, z = dep.point[2] - H / 2 + (j + 0.5) * H / ny;
      const s = S.phys.surfaceAt(x, z); s.x = x; s.z = z; out.push(s);
    }
    dep._surf = out; return out;
  }

  function heatSources(cond) {
    const c = cfg(), P = S.phys, src = [], why = [];
    const sc = S.SCENARIO;
    if (sc.fire) src.push({ pos: sc.fire.pos, a: c.fireC * Math.exp(-cond.hours / c.fireHours), sig: 0.8 });
    const best = {};
    sc.openings.forEach((o) => src.push({ pos: o.outer, a: (cond.night ? 1 : 0.4) * c.residualC * Math.exp(-cond.hours / c.residualHours), sig: 0.35 }));
    const bestPos = {};
    sc.victims.forEach((v) => {
      let best = 0;
      P.exits(v).forEach((e) => {
        const p = e.path; let a = 0, sig = 0.45;
        if (e.kind === 'up') { if (p.slabs < 0.3) { a = c.bodyThroughCoverC * Math.exp(-p.rubble / c.coverDecayM); sig = 0.35 + p.rubble; } }
        else if (p.slabs < 0.3 && p.rubble < 0.15) a = c.plumeC * Math.exp(-p.dist / c.plumeDecayM);
        if (a > 0.05) { src.push({ pos: e.pos, a, sig }); if (a > best) { best = a; bestPos[v.id] = e.pos; } }
      });
      why.push(best > 0.3 ? { k: 'why.therm', p: { id: v.id, t: S.fmt(best) } } : { k: 'why.thermNone', p: { id: v.id } });
    });
    return { src, why, bestPos };
  }

  S.TOOLS = S.TOOLS || [];
  S.TOOLS.push({
    id: 'thermal', color: S.C.red,
    deploy(hit) { return { point: hit.point.slice(), params: {} }; },

    evaluate(dep, cond) {
      const c = cfg(), [nx, ny] = c.pixels, grid = surfaceGrid(dep), hs = heatSources(cond);
      const air = cond.night ? c.airNightC : c.airDayC, r = S.rng(dep.id + 'tn'), T = new Float32Array(nx * ny);
      for (let k = 0; k < grid.length; k++) {
        const s = grid[k];
        let t = air;
        if (s.mat === 'human') t = c.humanC;
        else {
          if (!cond.night) {
            const ndl = Math.max(0, s.n[0] * SUN[0] + s.n[1] * SUN[1] + s.n[2] * SUN[2]);
            t += (c.sunGainC[s.mat] || 6) * ndl * (0.55 + 0.9 * h01(s.id));
          } else {
            t -= c.nightSkyCoolC * Math.max(0, s.n[1]);
            if (s.mat === 'building') t += 3;
          }
          if (s.mat === 'engine') t += c.engineC * cond.noise;
          t += (h01(Math.floor(s.x / 0.5) + ',' + Math.floor(s.z / 0.5)) - 0.5) * 2 * (cond.night ? c.textureC.night : c.textureC.day);
          for (const h of hs.src) {
            if (h.a < 0.05) continue;
            const dx = s.x - h.pos[0], dz = s.z - h.pos[2], d2 = dx * dx + dz * dz;
            if (d2 > 9 * h.sig * h.sig) continue;
            t += h.a * Math.exp(-d2 / (2 * h.sig * h.sig)) * Math.exp(-Math.max(0, Math.abs(s.y - h.pos[1]) - 0.5));
          }
        }
        T[k] = t + S.gauss(r) * c.sensorNoiseC;
      }

      const sorted = Array.from(T).sort((a, b) => a - b);
      const lo = sorted[Math.floor(sorted.length * 0.02)], hi = Math.max(lo + 6, sorted[Math.floor(sorted.length * 0.995)]);
      const med = sorted[Math.floor(sorted.length / 2)], thr = med + 4;
      const seen = new Uint8Array(T.length); let spots = 0;
      for (let k = 0; k < T.length; k++) {
        if (seen[k] || T[k] < thr) continue;
        let size = 0; const st = [k]; seen[k] = 1;
        while (st.length) { const q = st.pop(); size++; const qi = q % nx, qj = (q / nx) | 0;
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const i2 = qi + a, j2 = qj + b; if (i2 < 0 || j2 < 0 || i2 >= nx || j2 >= ny) return; const n2 = j2 * nx + i2; if (!seen[n2] && T[n2] >= thr) { seen[n2] = 1; st.push(n2); } }); }
        if (size >= 3) spots++;
      }

      const [W, H] = c.footprintM, hits = [];
      Object.entries(hs.bestPos).forEach(([id, pos]) => {
        const i = Math.floor((pos[0] - dep.point[0] + W / 2) / W * nx), j = Math.floor((pos[2] - dep.point[2] + H / 2) / H * ny);
        if (i < 2 || j < 2 || i >= nx - 2 || j >= ny - 2) return;
        let pk = -99; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) pk = Math.max(pk, T[(j + b) * nx + i + a]);
        const ring = []; for (let a = -10; a <= 10; a += 2) for (let b = -10; b <= 10; b += 2) { if (Math.abs(a) < 6 && Math.abs(b) < 6) continue; const ii = i + a, jj = j + b; if (ii >= 0 && jj >= 0 && ii < nx && jj < ny) ring.push(T[jj * nx + ii]); }
        ring.sort((x, y) => x - y);
        if (pk - ring[Math.floor(ring.length / 2)] >= 3 && spots <= 12) hits.push(id);
      });
      return {
        T, nx, ny, lo, hi, air, hits, max: sorted[sorted.length - 1], spots, found: hits.length > 0,
        summary: { k: 'thermal.sum', p: { n: spots, t: S.fmt(sorted[sorted.length - 1], 0) } },
        why: hs.why
      };
    },

    render(el, dep, res) {
      const c = cfg(), W = 324, H = Math.round(W * res.ny / res.nx);
      const img = document.createElement('canvas'); img.width = res.nx; img.height = res.ny;
      const g = img.getContext('2d'), id = g.createImageData(res.nx, res.ny);
      for (let k = 0; k < res.T.length; k++) {
        const col = S.widgets.inferno((res.T[k] - res.lo) / (res.hi - res.lo));
        id.data[k * 4] = col[0]; id.data[k * 4 + 1] = col[1]; id.data[k * 4 + 2] = col[2]; id.data[k * 4 + 3] = 255;
      }
      g.putImageData(id, 0, 0);
      const view = S.canvas(W, H, 'thermal');
      view.ctx.imageSmoothingEnabled = true; view.ctx.drawImage(img, 0, 0, W, H);
      view.ctx.fillStyle = 'rgba(255,255,255,0.85)'; view.ctx.font = '11px system-ui';
      view.ctx.fillText(S.t('thermal.front'), 6, H - 6);
      view.ctx.textAlign = 'right'; view.ctx.fillText(S.t('thermal.alt', { a: c.altitudeM }) + ', ' + c.footprintM[0] + '×' + c.footprintM[1] + ' m', W - 6, 14);
      const wrap = S.el('div', { class: 'thermal-wrap' }); wrap.appendChild(view.cv);
      const read = S.el('div', { class: 'thermal-read', text: S.t('thermal.hover') });
      view.cv.addEventListener('mousemove', (e) => {
        const b = view.cv.getBoundingClientRect(), i = Math.floor((e.clientX - b.left) / b.width * res.nx), j = Math.floor((e.clientY - b.top) / b.height * res.ny);
        const t = res.T[S.clamp(j, 0, res.ny - 1) * res.nx + S.clamp(i, 0, res.nx - 1)];
        read.textContent = S.fmt(t) + ' °C';
      });
      el.appendChild(wrap);

      const sc = S.canvas(W, 26, 'tscale'), q = sc.ctx;
      for (let x = 0; x < W; x++) { const col = S.widgets.inferno(x / W); q.fillStyle = 'rgb(' + col.map(Math.round).join(',') + ')'; q.fillRect(x, 0, 1, 12); }
      q.fillStyle = '#333'; q.font = '11px system-ui'; q.textAlign = 'left'; q.fillText(S.fmt(res.lo, 0) + ' °C', 0, 24);
      q.textAlign = 'right'; q.fillText(S.fmt(res.hi, 0) + ' °C', W, 24);
      el.appendChild(sc.cv);
      el.appendChild(S.el('div', { class: 'out-row' }, [read, S.el('div', { class: 'out-note', text: S.t('thermal.air', { t: S.fmt(res.air, 0) }) })]));
      return { update() {}, destroy() {} };
    },

    marker(dep) {
      const c = cfg(), g = new THREE.Group(), [W, H] = c.footprintM, p = dep.point, pts = [];
      const corners = [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2], [-W / 2, -H / 2]];
      for (let k = 0; k < 4; k++) for (let i = 0; i <= 24; i++) {
        const a = corners[k], b = corners[k + 1], x = p[0] + a[0] + (b[0] - a[0]) * i / 24, z = p[2] + a[1] + (b[1] - a[1]) * i / 24;
        pts.push(new THREE.Vector3(x, S.phys.surfaceAt(x, z, false).y + 0.15, z));
      }
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: S.C.red, depthTest: false }));
      line.renderOrder = 9; g.add(line);
      const top = [p[0], p[1] + 10, p[2]];
      g.add(S.widgets.line(p, top, S.C.red, true));
      const drone = new THREE.Group();
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => {
        const rot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16), new THREE.MeshBasicMaterial({ color: 0x333333 }));
        rot.position.set(a * 0.45, 0, b * 0.45); drone.add(rot);
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), new THREE.MeshBasicMaterial({ color: S.C.red })); drone.add(body);
      drone.position.set(top[0], top[1], top[2]); g.add(drone);
      return g;
    }
  });
})(window.SIM);
