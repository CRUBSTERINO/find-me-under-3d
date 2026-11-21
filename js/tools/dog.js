(function (S) {
  const cfg = () => S.CONFIG.tools.dog;
  S.dogFatigue = 0;

  S.TOOLS = S.TOOLS || [];
  S.TOOLS.push({
    id: 'dog', color: S.C.blue,
    deploy(hit) {
      const c = cfg(), f = S.dogFatigue;
      S.dogFatigue = Math.min(1, S.dogFatigue + c.fatiguePerSearch);
      return { point: hit.point.slice(), params: { fatigue: f }, warn: f >= 0.7 ? 'err.dogTired' : null };
    },

    evaluate(dep, cond) {
      const c = cfg(), P = S.phys, ctr = dep.point, why = [], R = c.searchRadiusM;
      const F = dep.params.fatigue || 0;
      const eff = (1 - c.fatigueImpact * F) * (cond.night ? 1 : c.dayFactor) * (1 - c.noiseImpact * cond.noise) * Math.min(1, 0.5 + 0.5 * cond.hours / c.scentBuildHours);
      const r = S.rng(dep.id + 'dog');
      let spots = [];
      S.SCENARIO.victims.forEach((v) => {
        let best = 0;
        P.exits(v).forEach((e) => {
          const p = e.path;
          const str = Math.pow(c.slabFactor, p.slabs) * Math.exp(-p.rubble / c.rubbleDecayM) * Math.exp(-p.air / c.airDecayM) * Math.exp(-(p.soil || 0) / c.soilDecayM);
          const dd = S.dist2(e.pos, ctr), prox = dd <= R ? 1 : Math.exp(-(dd - R) / c.outsideDecayM);
          const score = str * prox * eff + (r() - 0.5) * 0.04;
          best = Math.max(best, score);
          if (score > c.interestThreshold) spots.push({ pos: e.pos, score, id: v.id, exit: e.id || e.kind });
        });
        why.push(best > 0.03 ? { k: 'why.dog', p: { id: v.id, s: S.fmt(best, 2), exit: '' } } : { k: 'why.dogNone', p: { id: v.id } });
      });

      if (cond.noise > 0.4) {
        S.SCENARIO.props.filter((p) => p.kind === 'rescuer' && S.dist2(p.c, ctr) < R + 2).slice(0, 1).forEach((p) => {
          if (r() < 0.7) spots.push({ pos: [p.c[0] - 1.2, 0.05, p.c[2] - 1.2], score: c.interestThreshold + 0.06 + r() * 0.08, id: 'false' });
        });
      }

      spots.sort((a, b) => b.score - a.score);
      const merged = [];
      spots.forEach((s) => { const m = merged.find((x) => S.dist2(x.pos, s.pos) < 1.5); if (m) { if (!m.ids.includes(s.id)) m.ids.push(s.id); } else merged.push(Object.assign({ ids: [s.id] }, s)); });
      spots = merged.slice(0, 4);
      spots.forEach((s) => (s.alert = s.score > c.alertThreshold));
      const top = spots.find((s) => s.alert);
      const conf = top ? (top.score > 0.55 ? 'confH' : top.score > 0.32 ? 'confM' : 'confL') : null;
      const dirKey = top ? S.dirKey(top.pos[0] - ctr[0], top.pos[2] - ctr[2]) : null;

      const track = [], rr = S.rng(dep.id + 'track');
      let a = rr() * 6.28, x = ctr[0], z = ctr[2];
      const targets = spots.map((s) => s.pos);
      for (let i = 0; i < 70; i++) {
        if (targets.length && i % 18 === 9) { const t = targets.shift(); x = S.lerp(x, t[0], 0.9); z = S.lerp(z, t[2], 0.9); }
        a += (rr() - 0.5) * 1.6; x += Math.sin(a) * 0.9; z += Math.cos(a) * 0.9;
        const d = S.dist2([x, 0, z], ctr); if (d > R) { a += Math.PI * 0.8; x = ctr[0] + (x - ctr[0]) * R / d; z = ctr[2] + (z - ctr[2]) * R / d; }
        track.push([x, z]);
      }
      const alerts = spots.filter((s) => s.alert);
      const hits = [...new Set(alerts.flatMap((s) => s.ids).filter((i) => i !== 'false'))];
      return {
        spots, alerts, track, conf, dirKey, fatigue: F, eff, hits, found: hits.length > 0,
        minutes: Math.round(8 + 10 * F),
        summary: top ? { k: 'dog.sum', p: { c: { k: 'dog.' + conf }, dir: { k: 'dir.' + dirKey }, n: spots.length } }
          : spots.length ? { k: 'dog.sumInterest', p: { n: spots.length } } : { k: 'dog.sumNone' },
        why
      };
    },

    render(el, dep, res) {
      const c = cfg();
      const nA = res.alerts.length, nI = res.spots.length - nA;
      el.appendChild(S.el('div', { class: 'dog-status ' + (nA ? 'yes' : nI ? 'maybe' : 'no'), text: nA ? S.t('dog.alert') : nI ? S.t('dog.interest') : S.t('dog.noAlert') }));
      el.appendChild(S.el('div', { class: 'out-line', text: S.t('dog.worked', { m: res.minutes, a: nA, i: nI }) }));
      if (nA) {
        el.appendChild(S.el('div', { class: 'out-line', text: S.t('dog.conf', { c: S.t('dog.' + res.conf) }) + ', ' + S.t('dog.dir', { dir: S.t('dir.' + res.dirKey) }) }));
      }
      if (res.spots.length) {
        const list = S.el('div', { class: 'out-list' });
        res.spots.forEach((s, i) => {
          const lab = String.fromCharCode(65 + i);
          const d = S.dist2(s.pos, dep.point);
          list.appendChild(S.el('div', { class: 'spot-row' }, [
            S.el('b', { class: 'spot-lab' + (s.alert ? ' al' : ''), text: lab }),
            S.el('span', { text: (s.alert ? S.t('dog.spotAlert') : S.t('dog.spotInt')) + ', ' + S.t('dog.spotAt', { d: S.fmt(d, 0), dir: S.t('dir.' + S.dirKey(s.pos[0] - dep.point[0], s.pos[2] - dep.point[2])) }) }),
            S.widgets.bar(Math.min(1, s.score / 0.8), s.alert ? S.C.blue : '#8fb8d6')
          ]));
        });
        el.appendChild(list);
        el.appendChild(S.el('div', { class: 'out-note', text: S.t('dog.depth') }));
      }
      const row = S.el('div', { class: 'out-row' });
      row.appendChild(S.widgets.minimap(160, 140, (g, M, s) => {
        const p = M(dep.point[0], dep.point[2]);
        g.strokeStyle = S.C.blue; g.lineWidth = 1.5; g.setLineDash([4, 3]); g.beginPath(); g.arc(p[0], p[1], c.searchRadiusM * s, 0, 7); g.stroke(); g.setLineDash([]);
        g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 1; g.beginPath();
        res.track.forEach((t, i) => { const q = M(t[0], t[1]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke();
        res.spots.forEach((sp, i) => {
          const q = M(sp.pos[0], sp.pos[2]);
          g.fillStyle = sp.alert ? S.C.blue : '#8fb8d6'; g.beginPath(); g.arc(q[0], q[1], sp.alert ? 6 : 4.5, 0, 7); g.fill();
          g.fillStyle = sp.alert ? '#fff' : '#003050'; g.font = 'bold 8px system-ui'; g.textAlign = 'center'; g.fillText(String.fromCharCode(65 + i), q[0], q[1] + 3);
        });
        g.fillStyle = '#000'; g.beginPath(); g.arc(p[0], p[1], 3, 0, 7); g.fill();
      }));
      const col = S.el('div', { class: 'out-col' });
      col.appendChild(S.el('div', { class: 'out-label', text: S.t('dog.fatigue') }));
      col.appendChild(S.widgets.bar(res.fatigue, res.fatigue > 0.6 ? S.C.red : S.C.blue, Math.round(res.fatigue * 100) + '%'));
      const now = S.el('div', { class: 'out-note', text: S.t('dog.next', { f: Math.round(S.dogFatigue * 100) }) });
      col.appendChild(now);
      col.appendChild(S.el('button', { class: 'btn small', text: S.t('dog.rest'), onclick: () => { S.dogFatigue = 0; now.textContent = S.t('dog.rested'); } }));
      col.appendChild(S.el('div', { class: 'out-note', text: S.t('dog.area', { r: c.searchRadiusM }) }));
      row.appendChild(col);
      el.appendChild(row);
      return { update() {}, destroy() {} };
    },

    marker(dep, res) {
      const g = new THREE.Group(), c = cfg();
      g.add(S.widgets.ring(dep.point, c.searchRadiusM, S.C.blue, undefined, 0.8));
      g.add(S.widgets.disc(dep.point, S.C.blue, 0.25));
      const pts = res.track.map((t) => new THREE.Vector3(t[0], S.phys.surfaceAt(t[0], t[1], false).y + 0.1, t[1]));
      const tl = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: S.C.blue, dashSize: 0.25, gapSize: 0.2, transparent: true, opacity: 0.7 }));
      tl.computeLineDistances(); g.add(tl);
      res.spots.forEach((s, i) => {
        const p = S.widgets.pin(s.pos, s.alert ? S.C.blue : 0x8fb8d6, s.alert ? 1.5 : 0.9); g.add(p);
        const l = S.makeLabel(String.fromCharCode(65 + i), { size: 0.32, bg: s.alert ? S.C.blue : '#8fb8d6' }); l.position.set(s.pos[0], s.pos[1] + (s.alert ? 1.8 : 1.2), s.pos[2]); g.add(l);
      });
      return g;
    }
  });
})(window.SIM);
