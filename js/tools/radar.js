(function (S) {
  const cfg = () => S.CONFIG.tools.radar;

  S.TOOLS = S.TOOLS || [];
  S.TOOLS.push({
    id: 'radar', color: S.C.green,
    deploy(hit) { return { point: [hit.point[0], hit.point[1] + 0.05, hit.point[2]], params: {} }; },

    evaluate(dep, cond) {
      const c = cfg(), s = dep.point, P = S.phys, why = [];
      const N = c.noiseFloorDb + c.vibrationDb * cond.noise;
      let dets = [];
      S.SCENARIO.victims.forEach((v) => {
        const st = P.victimState(v, cond.hours);
        const d = S.dist(s, v.pos);
        if (d > c.maxRangeM) { why.push({ k: 'why.radarOut', p: { id: v.id, m: c.maxRangeM } }); return; }
        const pa = P.path(s, v.pos);
        const S0 = st.moving ? c.moveLevelDb : st.level === 'unconscious' ? c.unconsciousBreathDb : c.breathLevelDb;
        const L = S0 - 2 * (c.slabLossDb * pa.slabs + c.rubbleLossDbPerM * pa.rubble + c.soilLossDbPerM * pa.soil) - 40 * Math.log10(Math.max(1, pa.dist));
        const snr = L - N;
        why.push({ k: 'why.radar', p: { id: v.id, d: S.fmt(pa.dist), s: S.fmt(pa.slabs), r: S.fmt(pa.rubble), snr: S.fmt(snr, 0) } });
        if (snr >= c.detectSnrDb) {
          const r = S.rng(dep.id + v.id);
          dets.push({ r: Math.max(0.3, pa.dist + S.gauss(r) * c.rangeResM * 0.5), snr, kind: st.moving ? 'move' : 'breath', rate: st.breathRate, id: v.id });
        }
      });

      if (cond.noise > 0.55) {
        const r = S.rng(dep.id + 'clutter' + Math.round(cond.noise * 10));
        if (r() < (cond.noise - 0.55) * 2) dets.push({ r: 1 + r() * (c.maxRangeM - 2), snr: 3 + r() * 6, kind: 'clutter', rate: 0 });
      }
      dets.sort((a, b) => b.snr - a.snr);
      const merged = [];
      dets.forEach((d) => { if (!merged.some((m) => Math.abs(m.r - d.r) < c.mergeM)) merged.push(d); });
      dets = merged.sort((a, b) => a.r - b.r);
      const real = dets.filter((d) => d.kind !== 'clutter');
      return {
        noiseDb: N, dets, vib: cond.noise > 0.55, found: real.length > 0, hits: real.map((d) => d.id),
        summary: dets.length ? { k: 'radar.sum', p: { n: dets.length, r: dets.map((d) => '~' + S.fmt(d.r)).join(', ') } } : { k: 'radar.sumNone' },
        why
      };
    },

    render(el, dep, res) {
      const c = cfg(), W = 324;
      const pr = S.canvas(W, 92, 'scope'), br = S.canvas(W, 70, 'scope');
      el.appendChild(S.el('div', { class: 'out-label', text: S.t('radar.profile') }));
      el.appendChild(pr.cv);

      (function () {
        const g = pr.ctx, H = 92, x = (m) => 8 + m / c.maxRangeM * (W - 16), y = (snr) => H - 16 - S.clamp(snr, -5, 35) / 35 * (H - 26);
        g.fillStyle = '#0f1a16'; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,0.5)'; g.font = '10px system-ui'; g.textAlign = 'center';
        for (let m = 0; m <= c.maxRangeM; m++) { g.fillRect(x(m), H - 14, 1, 4); if (m % 3 === 0) g.fillText(m, x(m), H - 2); }
        g.strokeStyle = 'rgba(255,255,255,0.35)'; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(8, y(c.detectSnrDb)); g.lineTo(W - 8, y(c.detectSnrDb)); g.stroke(); g.setLineDash([]);
        const r = S.rng('prof' + dep.id);
        g.strokeStyle = S.C.green; g.lineWidth = 1.6; g.beginPath();
        for (let px = 8; px <= W - 8; px++) {
          const m = (px - 8) / (W - 16) * c.maxRangeM;
          let v = 1.5 + r() * 2.5 + (res.vib ? r() * 4 : 0);
          res.dets.forEach((d) => { v = Math.max(v, d.snr * Math.exp(-Math.pow((m - d.r) / (c.rangeResM * 0.8), 2))); });
          px === 8 ? g.moveTo(px, y(v)) : g.lineTo(px, y(v));
        }
        g.stroke();
      })();
      const list = S.el('div', { class: 'out-list' });
      if (!res.dets.length) list.appendChild(S.el('div', { class: 'out-big no', text: S.t('radar.none') }));
      res.dets.forEach((d) => {
        const kind = d.kind === 'move' ? 'radar.kindMove' : d.kind === 'breath' ? 'radar.kindBreath' : 'radar.kindClutter';
        list.appendChild(S.el('div', { class: 'out-big ' + (d.kind === 'clutter' ? 'maybe' : 'yes'), text: S.t('radar.det', { r: S.fmt(d.r), kind: S.t(kind) }) + (d.rate ? ', ' + S.t('radar.rate', { b: d.rate }) : '') }));
      });
      el.appendChild(list);
      el.appendChild(S.el('div', { class: 'out-line', text: S.t('radar.noDir') }));
      if (res.vib) el.appendChild(S.el('div', { class: 'out-warn', text: S.t('radar.vib') }));
      el.appendChild(S.el('div', { class: 'out-label', text: S.t('radar.breath') }));
      el.appendChild(br.cv);
      const best = res.dets.filter((d) => d.kind !== 'clutter').sort((a, b) => b.snr - a.snr)[0];
      const g = br.ctx, H = 70, buf = new Float32Array(W), rr = S.rng('br' + dep.id);
      let t = 0, acc = 0;
      const a = best ? S.clamp(best.snr / 30, 0.15, 1) * (H / 2 - 6) : 0;
      function sample(tc) {
        let v = (rr() - 0.5) * (res.vib ? 18 : 6);
        if (best) { v += a * Math.sin(tc * best.rate / 60 * 2 * Math.PI); if (best.kind === 'move' && Math.sin(tc * 0.7) > 0.93) v += (rr() - 0.5) * a * 1.5; }
        return v;
      }
      for (let i = 0; i < W; i++) buf[i] = sample((i - W) / 40);
      function draw() {
        g.fillStyle = '#0f1a16'; g.fillRect(0, 0, W, H);
        g.strokeStyle = S.C.green; g.lineWidth = 1.5; g.beginPath();
        for (let i = 0; i < W; i++) i ? g.lineTo(i, H / 2 - buf[i]) : g.moveTo(i, H / 2 - buf[i]);
        g.stroke();
      }
      draw();
      return {
        update(dt) {
          t += dt; acc += dt * 40; let n = Math.floor(acc); acc -= n; if (!n) return; n = Math.min(n, W);
          buf.copyWithin(0, n); for (let i = W - n; i < W; i++) buf[i] = sample(t + (i - W) / 40); draw();
        },
        destroy() {}
      };
    },

    marker(dep, res) {
      const g = new THREE.Group(), c = cfg();
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.4), new THREE.MeshBasicMaterial({ color: S.C.green }));
      box.position.set(dep.point[0], dep.point[1] + 0.12, dep.point[2]); g.add(box);
      if (!res.dets.length) g.add(S.widgets.ring(dep.point, c.maxRangeM, S.C.green, dep.point[1] + 0.1, 0.25));
      res.dets.forEach((d) => g.add(S.widgets.ring(dep.point, d.r, d.kind === 'clutter' ? 0x888888 : S.C.green, dep.point[1] + 0.1, d.kind === 'clutter' ? 0.5 : 0.95)));
      return g;
    }
  });
})(window.SIM);
