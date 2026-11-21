window.SIM = window.SIM || {};
(function (S) {
  const W = (S.widgets = {});

  W.minimap = function (w, h, draw) {
    const c = S.canvas(w, h, 'minimap'), g = c.ctx, sc = S.SCENARIO, HX = sc.hx, HZ = sc.hz;
    const s = Math.min(w / (2 * HX + 12), h / (2 * HZ + 14));
    const M = (x, z) => [w / 2 + x * s, h / 2 + z * s];
    const rect = (x0, z0, x1, z1) => { const p = M(x0, z0), q = M(x1, z1); g.fillRect(p[0], p[1], q[0] - p[0], q[1] - p[1]); };
    g.fillStyle = '#eef0ee'; g.fillRect(0, 0, w, h);

    g.fillStyle = '#d6d2c4';
    for (let x = -HX - 6; x < HX + 6; x += 0.5) for (let z = -HZ - 7; z < HZ + 7; z += 0.5) if (S.phys.pileH(x, z) > 0.3) rect(x, z, x + 0.5, z + 0.5);
    g.fillStyle = '#c9c4b6';
    sc.props.filter((p) => p.kind === 'neighbour').forEach((p) => rect(p.c[0] - p.s[0] / 2, p.c[2] - p.s[2] / 2, p.c[0] + p.s[0] / 2, p.c[2] + p.s[2] / 2));
    g.fillStyle = '#9d978a'; rect(-HX, -HZ, HX, HZ);
    g.strokeStyle = '#555'; g.lineWidth = 1; const p0 = M(-HX, -HZ); g.strokeRect(p0[0], p0[1], 2 * HX * s, 2 * HZ * s);
    g.fillStyle = '#333'; g.font = '10px system-ui'; g.textAlign = 'center';
    g.fillText(S.t('map.front') + ' ↓', w / 2, h - 4); g.fillText(S.t('map.back'), w / 2, 11);
    if (draw) draw(g, M, s);
    return c.cv;
  };

  const INF = [[0, 0, 4], [40, 11, 84], [101, 21, 110], [159, 42, 99], [212, 72, 66], [245, 125, 21], [250, 193, 39], [252, 255, 164]];
  W.inferno = function (t) {
    t = S.clamp(t, 0, 1) * (INF.length - 1); const i = Math.min(INF.length - 2, Math.floor(t)), f = t - i, a = INF[i], b = INF[i + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  };

  W.color = (hex) => new THREE.Color(hex);
  W.disc = function (p, color, r) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r || 0.35, r || 0.35, 0.12, 20), new THREE.MeshBasicMaterial({ color }));
    m.position.set(p[0], p[1] + 0.06, p[2]); return m;
  };
  W.pin = function (p, color, h) {
    const g = new THREE.Group();
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h || 1.6, 6), new THREE.MeshBasicMaterial({ color: 0x222222 }));
    stick.position.y = (h || 1.6) / 2;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), new THREE.MeshBasicMaterial({ color }));
    head.position.y = h || 1.6; g.add(stick, head); g.position.set(p[0], p[1], p[2]); return g;
  };

  W.ring = function (c, r, color, flatY, opacity) {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = i / 64 * Math.PI * 2, x = c[0] + Math.cos(a) * r, z = c[2] + Math.sin(a) * r;
      pts.push(new THREE.Vector3(x, flatY !== undefined ? flatY : S.phys.surfaceAt(x, z, false).y + 0.12, z));
    }
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: opacity || 1, depthTest: false }));
  };

  W.wedge = function (p, ang, halfErr, len, color) {
    const n = 18, pos = [0, 0, 0], idx = [];
    for (let i = 0; i <= n; i++) { const a = ang - halfErr + 2 * halfErr * i / n; pos.push(Math.sin(a) * len, 0, Math.cos(a) * len); if (i) idx.push(0, i, i + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthTest: false }));
    m.position.set(p[0], p[1] + 0.15, p[2]); m.renderOrder = 8;
    return m;
  };
  W.line = function (a, b, color, dashed) {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
    const mat = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.3, gapSize: 0.2, depthTest: false }) : new THREE.LineBasicMaterial({ color, depthTest: false });
    const l = new THREE.Line(geo, mat); if (dashed) l.computeLineDistances(); l.renderOrder = 9; return l;
  };
  W.tube = function (a, b, color, r) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), len = va.distanceTo(vb);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r || 0.04, r || 0.04, Math.max(0.01, len), 8), new THREE.MeshBasicMaterial({ color }));
    m.position.copy(va).add(vb).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    return m;
  };

  W.bar = function (frac, color, label) {
    const wrap = S.el('div', { class: 'bar' });
    const fill = S.el('div', { class: 'bar-fill', style: 'width:' + Math.round(S.clamp(frac, 0, 1) * 100) + '%;background:' + color });
    wrap.appendChild(fill); if (label) wrap.appendChild(S.el('span', { class: 'bar-label', text: label }));
    return wrap;
  };
})(window.SIM);
