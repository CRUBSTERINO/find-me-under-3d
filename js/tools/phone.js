(function (S) {
  const cfg = () => S.CONFIG.tools.phone;
  const devId = (id) => 'IMSI ...' + String(1000 + (S.hash('dev' + id) % 9000));

  S.TOOLS = S.TOOLS || [];
  S.TOOLS.push({
    id: 'phone', color: S.C.purple,
    deploy(hit) { return { point: [hit.point[0], hit.point[1] + 0.05, hit.point[2]], params: {} }; },

    evaluate(dep, cond) {
      const c = cfg(), P = S.phys, s = [dep.point[0], dep.point[1] + 1.0, dep.point[2]], why = [], devs = [];
      const loss = (d) => c.pl0Db + 10 * c.pathExp * Math.log10(Math.max(1, d));
      S.SCENARIO.victims.forEach((v) => {
        const st = P.victimState(v, cond.hours);
        if (!st.phoneOn) { if (v.phone) why.push({ k: 'why.phoneOff', p: { id: v.id } }); return; }
        const pa = P.path(s, v.pos);
        const rssi = c.txDbm - loss(pa.dist) - c.slabLossDb * pa.slabs - c.rubbleLossDbPerM * pa.rubble - c.soilLossDbPerM * pa.soil;
        why.push({ k: 'why.phone', p: { id: v.id, d: S.fmt(pa.dist), s: S.fmt(pa.slabs), rssi: S.fmt(rssi, 0) } });
        if (rssi >= c.sensitivityDbm) devs.push({ id: devId(v.id), owner: v.id, victim: true, rssi, moving: false, trueD: pa.dist });
      });
      S.SCENARIO.devices.forEach((d) => {
        const dist = S.dist(s, d.pos);
        const pa = d.role === 'neighbour' ? { slabs: 0, rubble: 0, soil: 0 } : P.path(s, d.pos);
        const rssi = c.txDbm - loss(dist) - d.extraLossDb - c.slabLossDb * pa.slabs - c.rubbleLossDbPerM * pa.rubble - c.soilLossDbPerM * pa.soil;
        if (rssi >= c.sensitivityDbm) devs.push({ id: devId(d.id), owner: d.role, rssi, moving: d.moving, trueD: dist });
      });
      devs.forEach((d) => { d.est = Math.pow(10, (c.txDbm - c.pl0Db - d.rssi) / (10 * c.estPathExp)); });
      devs.sort((a, b) => b.rssi - a.rssi);
      return {
        devs, found: devs.some((d) => d.victim), hits: devs.filter((d) => d.victim).map((d) => d.owner),
        summary: devs.length ? { k: 'phone.sum', p: { n: devs.length, s: S.fmt(devs[0].rssi, 0) } } : { k: 'phone.sumNone' },
        why
      };
    },

    render(el, dep, res) {
      const c = cfg();
      if (!res.devs.length) { el.appendChild(S.el('div', { class: 'out-big no', text: S.t('phone.none') })); return { update() {}, destroy() {} }; }
      const tbl = S.el('table', { class: 'devtbl' });
      const hd = S.t('phone.head');
      tbl.appendChild(S.el('tr', {}, hd.map((h) => S.el('th', { text: h }))));
      const cells = [];
      res.devs.forEach((d) => {
        const bar = S.el('div', { class: 'sig' }), fill = S.el('div', { class: 'sig-fill' }), lab = S.el('span', { class: 'sig-lab' });
        bar.append(fill, lab);
        const est = d.est > c.displayMaxM ? S.t('phone.far', { m: c.displayMaxM }) : S.t('phone.est', { d: S.fmt(d.est, d.est < 10 ? 1 : 0) });
        const name = S.el('td', {}, [S.el('div', { class: 'mono', text: d.id }), d.moving ? S.el('div', { class: 'tag', text: S.t('phone.moving') }) : null,
          S.view.debug ? S.el('div', { class: 'tag dbg', text: d.owner + ', ' + S.fmt(d.trueD) + ' m' }) : null]);
        tbl.appendChild(S.el('tr', {}, [name, S.el('td', {}, [bar]), S.el('td', { class: 'mono', text: est })]));
        cells.push({ d, fill, lab, r: S.rng('fade' + d.id) });
      });
      el.appendChild(tbl);
      el.appendChild(S.el('div', { class: 'out-note', text: S.t('phone.note') }));
      let acc = 1;
      function tick() {
        cells.forEach((x) => {
          const v = x.d.rssi + S.gauss(x.r) * (x.d.moving ? c.fadingDb * 2.5 : c.fadingDb) * 0.6;
          const f = S.clamp((v + 110) / 70, 0, 1);
          x.fill.style.width = Math.round(f * 100) + '%'; x.lab.textContent = S.fmt(v, 0) + ' dBm';
        });
      }
      tick();
      return { update(dt) { acc += dt; if (acc > 0.5) { acc = 0; tick(); } }, destroy() {} };
    },

    marker(dep, res) {
      const g = new THREE.Group();
      g.add(S.widgets.pin(dep.point, S.C.purple, 1.4));
      const l = S.makeLabel(String(res.devs.length), { size: 0.38, bg: 'rgba(120,40,100,0.9)' });
      l.position.set(dep.point[0] + 0.35, dep.point[1] + 1.3, dep.point[2]); g.add(l);
      return g;
    }
  });
})(window.SIM);
