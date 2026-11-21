(function (S) {
  const cfg = () => S.CONFIG.tools.geophone;
  const amp = (db, H) => S.clamp((db - 10) / 60, 0, 1) * (H / 2 - 4);

  function tapTimes(src, t0, t1) {

    const per = src.level === 'conscious' ? 5 : 9, n = src.level === 'conscious' ? 3 : 2;
    const ph = (S.hash(src.id) % 1000) / 1000 * per, out = [];
    for (let k = Math.floor((t0 - ph) / per) - 1; k * per + ph < t1; k++) for (let j = 0; j < n; j++) out.push(k * per + ph + j * 0.38);
    return out;
  }

  S.TOOLS = S.TOOLS || [];
  S.TOOLS.push({
    id: 'geophone', color: S.C.orange,
    deploy(hit) { return { point: [hit.point[0], hit.point[1] + 0.05, hit.point[2]], params: {} }; },

    evaluate(dep, cond) {
      const c = cfg(), s = dep.point, P = S.phys;
      const N = c.noiseFloorDb + c.noiseRangeDb * cond.noise - (cond.night ? c.nightQuieterDb : 0);
      const src = [], why = [];
      S.SCENARIO.victims.forEach((v) => {
        const st = P.victimState(v, cond.hours);
        if (!st.tapping) { why.push({ k: 'why.noTap', p: { id: v.id, st: { k: 'state.' + st.level } } }); return; }
        const pa = P.path(s, v.pos);
        const L0 = st.level === 'conscious' ? c.tapLevelDb : c.weakTapDb;
        const L = L0 - 20 * Math.log10(Math.max(1, pa.dist)) - c.slabLossDb * pa.slabs - c.rubbleLossDbPerM * pa.rubble - c.soilLossDbPerM * pa.soil - c.airLossDbPerM * pa.air;
        why.push({ k: 'why.geo', p: { id: v.id, d: S.fmt(pa.dist), s: S.fmt(pa.slabs), r: S.fmt(pa.rubble), snr: S.fmt(L - N, 0) } });
        src.push({ id: v.id, pos: v.pos, L, snr: L - N, level: st.level });
      });
      src.sort((a, b) => b.snr - a.snr);
      const best = src[0], det = !!best && best.snr >= c.detectSnrDb;
      let bearing = null, err = null, dirKey = null;
      if (det) {
        const r = S.rng(dep.id + '|' + best.id);
        err = c.bearingErrMinDeg + (c.bearingErrMaxDeg - c.bearingErrMinDeg) * Math.exp(-(best.snr - c.detectSnrDb) / 8);
        bearing = Math.atan2(best.pos[0] - s[0], best.pos[2] - s[2]) + (r() * 2 - 1) * err * 0.6 * S.D2R;
        dirKey = S.dist2(best.pos, s) < 1.2 ? 'below' : S.dirKey(Math.sin(bearing), Math.cos(bearing));
      }
      return {
        noiseDb: N, sources: src.filter((x) => x.snr > -25), det, hits: src.filter((x) => x.snr >= c.detectSnrDb).map((x) => x.id), bearing, err, dirKey, bestSnr: best ? best.snr : null,
        settling: 0.3 * Math.exp(-cond.hours / c.settlingHours), loud: cond.noise > 0.6, found: det,
        summary: det ? { k: 'geo.sumTap', p: { dir: { k: 'dir.' + dirKey } } } : { k: cond.noise > 0.6 ? 'geo.sumMasked' : 'geo.sumNone' },
        why
      };
    },

    render(el, dep, res) {
      const W = 324, H = 100, wv = S.canvas(W, H, 'scope');
      el.appendChild(S.el('div', { class: 'out-label', text: S.t('geo.level', { n: S.fmt(res.noiseDb, 0) }) }));
      el.appendChild(wv.cv);
      const info = S.el('div', { class: 'out-big ' + (res.det ? 'yes' : 'no'), text: res.det ? S.t('geo.tap') : S.t('geo.noTap') });
      el.appendChild(info);
      if (res.det) el.appendChild(S.el('div', { class: 'out-line', text: S.t('geo.bearing', { dir: S.t('dir.' + res.dirKey), e: Math.round(res.err) }) }));
      if (res.loud) el.appendChild(S.el('div', { class: 'out-warn', text: S.t('geo.masked') }));
      if (res.settling > 0.08) el.appendChild(S.el('div', { class: 'out-note', text: S.t('geo.settle') }));
      const row = S.el('div', { class: 'out-row' });
      row.appendChild(S.widgets.minimap(150, 130, (g, M, s) => {
        const p = M(dep.point[0], dep.point[2]);
        if (res.det && res.dirKey !== 'below') {
          const a0 = res.bearing - res.err * S.D2R, a1 = res.bearing + res.err * S.D2R;
          g.fillStyle = 'rgba(230,159,0,0.45)'; g.beginPath(); g.moveTo(p[0], p[1]);
          for (let i = 0; i <= 12; i++) { const a = a0 + (a1 - a0) * i / 12; g.lineTo(p[0] + Math.sin(a) * 6 * s, p[1] + Math.cos(a) * 6 * s); }
          g.closePath(); g.fill();
        } else if (res.det) { g.strokeStyle = S.C.orange; g.lineWidth = 3; g.beginPath(); g.arc(p[0], p[1], 9, 0, 7); g.stroke(); }
        g.fillStyle = '#000'; g.beginPath(); g.arc(p[0], p[1], 4, 0, 7); g.fill();
      }));

      let audio = null;
      const btn = S.el('button', { class: 'btn small', text: S.t('geo.listen') });
      btn.onclick = () => { if (audio) { audio(); audio = null; btn.textContent = S.t('geo.listen'); } else { audio = playAudio(res); btn.textContent = S.t('geo.stop'); } };
      row.appendChild(S.el('div', { class: 'out-col' }, [btn, res.bestSnr !== null && S.view.debug ? S.el('div', { class: 'out-note', text: S.t('geo.snr', { s: S.fmt(res.bestSnr, 0) }) }) : null]));
      el.appendChild(row);

      const g = wv.ctx, cols = new Float32Array(W), r = S.rng('wave' + dep.id);
      let t = 0, acc = 0; const pxPerS = W / 4;
      const an = amp(res.noiseDb, H);
      function sample(tc) {
        let v = an * (0.45 + 0.55 * Math.abs(S.gauss(r))) * 0.6;
        res.sources.forEach((src) => {
          const at = amp(src.L, H); if (at <= 0) return;
          tapTimes(src, tc - 0.3, tc + 0.01).forEach((tk) => { const dt = tc - tk; if (dt >= 0 && dt < 0.3) v += at * Math.exp(-dt / 0.05); });
        });
        if (r() < res.settling / pxPerS * 4) v += (0.3 + r() * 0.5) * H / 2;
        return Math.min(v, H / 2 - 2);
      }
      for (let i = 0; i < W; i++) cols[i] = sample(i / pxPerS - 4);
      function draw() {
        g.fillStyle = '#10161c'; g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
        for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * W / 4, 0); g.lineTo(i * W / 4, H); g.stroke(); }
        g.strokeStyle = S.C.orange; g.lineWidth = 1; g.beginPath();
        for (let i = 0; i < W; i++) { g.moveTo(i + 0.5, H / 2 - cols[i]); g.lineTo(i + 0.5, H / 2 + cols[i]); }
        g.stroke();
      }
      draw();
      return {
        update(dt) {
          t += dt; acc += dt * pxPerS; let n = Math.floor(acc); acc -= n; n = Math.min(n, W);
          if (!n) return;
          cols.copyWithin(0, n); for (let i = W - n; i < W; i++) cols[i] = sample(t + (i - W) / pxPerS);
          draw();
        },
        destroy() { if (audio) audio(); }
      };
    },

    marker(dep, res) {
      const g = new THREE.Group();
      g.add(S.widgets.disc(dep.point, S.C.orange, 0.32));
      if (res.det && res.dirKey !== 'below') g.add(S.widgets.wedge(dep.point, res.bearing, res.err * S.D2R, 4, S.C.orange));
      else if (res.det) g.add(S.widgets.ring(dep.point, 0.8, S.C.orange, dep.point[1] + 0.15));
      return g;
    }
  });

  function playAudio(res) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return () => {};
    const ctx = new AC(), sr = ctx.sampleRate, secs = 10, len = sr * secs, buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    const r = S.rng('audio'), gn = Math.min(2, Math.pow(10, (res.noiseDb - 52) / 20));
    let b = 0;
    for (let i = 0; i < len; i++) { b = (b + 0.02 * (r() * 2 - 1)) / 1.02; d[i] = b * 3.5 * gn; }
    res.sources.forEach((src) => {
      const a = Math.min(1.2, Math.pow(10, (src.L - 52) / 20)); if (a < 0.003) return;
      tapTimes(src, 0, secs).forEach((tk) => {
        if (tk < 0) return; const i0 = Math.floor(tk * sr);
        for (let j = 0; j < 0.08 * sr && i0 + j < len; j++) d[i0 + j] += a * Math.exp(-j / (0.01 * sr)) * (0.6 * Math.sin(j / sr * 2 * Math.PI * 700) + 0.4 * (r() * 2 - 1));
      });
    });
    let pk = 0; for (let i = 0; i < len; i++) pk = Math.max(pk, Math.abs(d[i]));
    if (pk > 0.95) for (let i = 0; i < len; i++) d[i] *= 0.95 / pk;
    const srcN = ctx.createBufferSource(); srcN.buffer = buf; srcN.loop = true; srcN.connect(ctx.destination); srcN.start();
    return () => { try { srcN.stop(); ctx.close(); } catch (e) {} };
  }
})(window.SIM);
