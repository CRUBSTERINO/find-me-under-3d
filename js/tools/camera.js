(function (S) {
  const cfg = () => S.CONFIG.tools.camera;
  const ray = new THREE.Raycaster(); ray.layers.enableAll();
  const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);

  const targets = (o) => S.view.probeTargets.filter((m) => !m.userData.pile && !m.userData.rubbleBox && !(o.throughGround && m === S.view.ground));
  function opening(dep) { return dep.params.o || S.SCENARIO.openings.find((o) => o.id === dep.params.op); }

  function headDir(dir, bend, spin) {
    const b = bend * S.D2R, s = spin * S.D2R;
    let fwd, up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(dir.y) > 0.7) {
      const side = new THREE.Vector3(Math.cos(s), 0, Math.sin(s));
      fwd = dir.clone().multiplyScalar(Math.cos(b)).addScaledVector(side, Math.sin(b));
      if (Math.abs(fwd.y) > 0.95) up = side;
    } else {
      const h = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -s);
      fwd = h.multiplyScalar(Math.cos(b)).add(new THREE.Vector3(0, Math.sin(b), 0));
      if (Math.abs(fwd.y) > 0.95) up = dir.clone();
    }
    return { fwd: fwd.normalize(), up };
  }

  let bodies = null;
  function bodyPts() {
    if (bodies) return bodies;
    bodies = [];
    S.view.victims.children.forEach((grp) => {
      if (!grp.userData.victim) return;
      [[0.66, 0, 0], [0.15, 0.05, 0], [-0.6, 0, 0]].forEach((q) => bodies.push(grp.localToWorld(new THREE.Vector3(q[0], q[1], q[2]))));
    });
    return bodies;
  }

  const perp = (v) => { const a = Math.abs(v.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0); return new THREE.Vector3().crossVectors(v, a).normalize(); };
  function turnToward(h, t, maxRad) {
    const a = h.angleTo(t); if (a < 1e-4) return h.clone();
    let ax = new THREE.Vector3().crossVectors(h, t); if (ax.lengthSq() < 1e-8) ax = perp(h); ax.normalize();
    return h.clone().applyAxisAngle(ax, Math.min(a, maxRad)).normalize();
  }

  function steps(p) {
    if (p.steps) return p.steps;
    const n = Math.round(Math.min(p.length, cfg().maxLengthM) / cfg().stepM);
    return Array.from({ length: n }, () => [p.bend, p.spin]);
  }

  function geo(dep) {
    const c = cfg(), o = opening(dep), p = dep.params, P = S.phys, st = steps(p);
    const start = v3(o.outer), dir = v3(o.dir).normalize(), head = headDir(dir, p.bend, p.spin);
    const step = 0.05, want = st.length * c.stepM, bp = bodyPts();
    const air = (x, y, z) => P.classify(x, y, z) === 'air';
    const R = c.clearanceM, offs = [[R, 0, 0], [-R, 0, 0], [0, R, 0], [0, -R, 0], [0, 0, R], [0, 0, -R]];
    const roomy = (q) => offs.every((d) => air(q.x + d[0], q.y + d[1], q.z + d[2]));
    const touches = (q) => bp.some((b) => b.distanceTo(q) < 0.3);
    const pts = [start.clone()];
    let pos = start.clone(), h = dir.clone(), len = 0, stop = null;

    if (!air(start.x, start.y, start.z)) stop = 'solid';
    while (!stop && len < want - 1e-6) {
      const leg = st[Math.min(st.length - 1, Math.floor(len / c.stepM + 1e-6))];
      const aim = headDir(dir, leg[0], leg[1]).fwd;
      const goal = len < 0.15 ? h : turnToward(h, aim, c.steerDegPerM * S.D2R * step);

      const cands = [goal], u = perp(goal), w = new THREE.Vector3().crossVectors(goal, u);
      [12, 25, 40, 60, c.deflectDeg].forEach((deg) => { for (let k = 0; k < 8; k++) {
        const ang = k / 8 * Math.PI * 2, ax = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang));
        cands.push(goal.clone().applyAxisAngle(ax, deg * S.D2R).normalize());
      } });
      const rest = cands.slice(1).sort((a, b) => a.angleTo(aim) - b.angleTo(aim)), order = [goal].concat(rest);
      const ok = (d, room) => { if (d.dot(dir) <= -0.2) return false; const q = pos.clone().addScaledVector(d, step); return air(q.x, q.y, q.z) && (!room || roomy(q)); };

      const next = (len > 0.3 && order.find((d) => ok(d, true))) || order.find((d) => ok(d, false)) || null;
      if (!next) { stop = 'solid'; break; }
      const q = pos.clone().addScaledVector(next, step);
      if (touches(q)) { stop = 'person'; break; }
      h = next; pos = q; len += step; pts.push(pos.clone());
    }
    const blocked = !!stop && len < want - 1e-6;
    return { o, start, dir, tip: pos, fwd: head.fwd, up: head.up, len, pts, stop, blocked, maxFree: blocked ? len : c.maxLengthM, vertical: Math.abs(dir.y) > 0.7 };
  }

  function seenPeople(g) {
    const c = cfg(), out = [];
    S.view.victims.children.forEach((grp) => {
      const v = grp.userData.victim; if (!v) return;
      const pts = [[0.66, 0, 0], [0.15, 0.05, 0], [-0.6, 0, 0]].map((q) => grp.localToWorld(new THREE.Vector3(q[0], q[1], q[2])));
      const meshes = grp.children;
      let best = null;
      pts.forEach((p) => {
        const d = p.distanceTo(g.tip); if (d > c.lightRangeM) return;
        const dirTo = p.clone().sub(g.tip).normalize();
        if (dirTo.angleTo(g.fwd) > c.fovDeg * 0.5 * S.D2R * 1.05) return;
        ray.set(g.tip, dirTo); ray.far = d - 0.08;
        const h = ray.intersectObjects(targets(g.o), false).filter((x) => !meshes.includes(x.object));
        if (!h.length && (!best || d < best)) best = d;
      });
      if (best !== null) out.push({ id: v.id, d: best });
    });
    return out;
  }

  S.TOOLS = S.TOOLS || [];
  S.TOOLS.push({
    id: 'camera', color: S.C.sky, showsOpenings: true,
    deploy(hit) {
      const c = cfg(), A = S.access;
      const o = A.pick(hit.point);

      if (!o) return { error: S.level ? 'acc.blindNone' : 'err.noOpening', costH: S.level ? c.blindSearchH : 0 };
      const bend = o.side === 'top' ? 70 : -15, spin = o.side === 'top' ? 180 : 0;
      return {
        point: o.outer.slice(),
        params: { op: o.id, length: 1.0, bend, spin, steps: Array.from({ length: Math.round(1.0 / c.stepM) }, () => [bend, spin]) },
        place: { k: 'zone.opening', p: { id: o.id } },
        note: A.revealBlind(o) ? { k: 'acc.foundBlind', p: { id: o.id } } : null
      };
    },

    evaluate(dep) {
      const g = geo(dep), seen = seenPeople(g);
      let summary;
      if (seen.length) summary = { k: 'cam.sumSeen', p: { d: S.fmt(Math.min(...seen.map((x) => x.d))) } };
      else if (g.blocked && g.len < 1.2) summary = { k: 'cam.sumBlocked', p: { l: S.fmt(g.len) } };
      else summary = { k: 'cam.sumNothing' };
      return {
        geo: g, seen, found: seen.length > 0, hits: seen.map((x) => x.id), summary,
        why: [seen.length ? { k: 'why.cam', p: { ids: seen.map((x) => x.id).join(', ') } } : { k: 'why.camNone' }]
      };
    },

    render(el, dep, res, ctx) {
      const c = cfg();
      const wrap = S.el('div', { class: 'probe' });
      const cv = S.view.probe.canvas; cv.className = 'probe-cv';
      const hud = S.el('div', { class: 'probe-hud' });
      wrap.append(cv, hud, S.el('div', { class: 'probe-cross' }));
      el.appendChild(wrap);
      const status = S.el('div', { class: 'out-big' });
      el.appendChild(status);
      const pad = S.el('div', { class: 'probe-pad' });
      const step = (k, d) => () => {
        const p = dep.params;
        if (k === 'len') {

          const st = p.steps || (p.steps = steps(p));
          if (d > 0) {
            if (res.geo.blocked) st.length = Math.floor(res.geo.len / c.stepM + 1e-6);
            if (st.length < Math.round(c.maxLengthM / c.stepM)) st.push([p.bend, p.spin]);
          } else st.pop();
          p.length = st.length * c.stepM;
        }
        if (k === 'bend') p.bend = S.clamp(p.bend + d * c.stepDeg, res.geo.vertical ? 0 : -80, res.geo.vertical ? 100 : 80);
        if (k === 'spin') p.spin = res.geo.vertical ? (p.spin + d * 15) % 360 : S.clamp(p.spin + d * 15, -100, 100);
        ctx.changed();
      };
      [['◀', 'spin', -1], ['▲', 'bend', 1], ['▼', 'bend', -1], ['▶', 'spin', 1], ['−', 'len', -1], ['+', 'len', 1]].forEach(([t, k, d]) => {
        pad.appendChild(S.el('button', { class: 'btn pad', text: t, onclick: step(k, d) }));
      });
      el.appendChild(pad);
      el.appendChild(S.el('div', { class: 'out-note', text: S.t('cam.keys') }));
      function fill(r) {
        const g = r.geo;
        hud.innerHTML = '';
        hud.append(S.el('div', { text: dep.params.op + ', ' + S.t('cam.len', { l: S.fmt(g.len), m: S.fmt(c.maxLengthM, 0) }) }),
          S.el('div', { text: S.t('cam.bend', { a: Math.round(dep.params.bend) }) + ', ' + S.t('cam.dark', { r: S.fmt(c.lightRangeM) }) }));
        if (g.blocked) hud.appendChild(S.el('div', { class: 'warn', text: '⚠ ' + S.t(g.stop === 'person' ? 'cam.atPerson' : 'cam.blocked') }));
        status.className = 'out-big ' + (r.found ? 'yes' : 'no');
        status.textContent = r.found ? S.t('cam.seen', { d: S.fmt(Math.min(...r.seen.map((x) => x.d))) }) : S.t('cam.nothing');
      }
      fill(res);
      ctx.keyHandler = (key) => {
        const map = { ArrowLeft: ['spin', -1], ArrowRight: ['spin', 1], ArrowUp: ['bend', 1], ArrowDown: ['bend', -1], '+': ['len', 1], '=': ['len', 1], '-': ['len', -1] };
        if (map[key]) { step(map[key][0], map[key][1])(); return true; }
        return false;
      };
      let acc = 0;
      return {
        refresh(r) { res = r; fill(r); },
        update(dt) {
          acc += dt; if (acc < 1 / 30) return; acc = 0;
          const g = res.geo; S.view.renderProbe(g.tip.toArray(), g.fwd.toArray(), g.up.toArray());
        },
        destroy() {}
      };
    },

    marker(dep, res) {
      const g = new THREE.Group(), geo = res.geo;
      for (let i = 4; i < geo.pts.length + 3; i += 4) {
        const a = geo.pts[i - 4], b = geo.pts[Math.min(i, geo.pts.length - 1)];
        if (a.distanceTo(b) > 1e-3) g.add(S.widgets.tube(a.toArray(), b.toArray(), S.C.sky, 0.05));
      }
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: S.C.sky, depthTest: false }));
      tip.position.copy(geo.tip); tip.renderOrder = 9; g.add(tip);
      g.add(S.widgets.line(geo.tip.toArray(), geo.tip.clone().addScaledVector(geo.fwd, 0.4).toArray(), 0xffffff, true));
      return g;
    }
  });
})(window.SIM);
