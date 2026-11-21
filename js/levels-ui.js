window.SIM = window.SIM || {};
(function (S) {
  const L = (S.levelsUI = {});
  const $ = (id) => document.getElementById(id);
  const tx = (o) => (typeof o === 'string' ? o : o ? o.en || '' : '');
  const st = () => S.state;
  const MC = () => S.CONFIG.marks;
  const toolName = (id) => S.t('tools.' + id + '.short');
  const icon = (id, cls) => { const e = S.el('span', { class: 'ticon ' + (cls || ''), html: S.icons[id], title: S.t('tools.' + id + '.name') }); e.style.setProperty('--tc', S.TOOLS.find((t) => t.id === id).color); return e; };

  function modal(title, body, buttons, sticky) {
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = ''; $('modalBody').appendChild(body);
    $('modalFoot').innerHTML = ''; (buttons || []).forEach((b) => $('modalFoot').appendChild(b));
    $('modal').dataset.sticky = sticky ? '1' : '';
    $('modalClose').style.display = sticky ? 'none' : '';
    $('modal').classList.add('open');
  }
  const close = () => $('modal').classList.remove('open');
  const btn = (text, onclick, cls) => S.el('button', { class: 'btn ' + (cls || ''), text, onclick });

  function go(hash) {
    if ((st().deps.length || st().marks.length) && !confirm(S.t('lvl.leave'))) return;
    location.hash = hash + (S.teacherKey ? '&teacher' : ''); location.reload();
  }

  L.menu = function () {
    const box = S.el('div', { class: 'lvl-grid' });
    box.appendChild(S.el('div', { class: 'lvl-sub', text: S.t('lvl.pick') }));
    S.LEVELS.forEach((lv, i) => {
      const sc = S.SCENARIOS[lv.scenario];
      const card = S.el('button', { class: 'lvl-card' + (S.level === lv ? ' cur' : ''), onclick: () => go('level=' + lv.id) }, [
        S.el('div', { class: 'lvl-n', text: S.t('lvl.levelN', { n: i + 1 }) }),
        S.el('div', { class: 'lvl-t', text: tx(lv.title) }),
        S.el('div', { class: 'lvl-b', text: tx(sc.name) }),
        S.el('div', { class: 'lvl-tools' }, S.TOOLS.map((t) => icon(t.id, lv.locked && lv.locked[t.id] ? 'off' : lv.shop ? 'shop' : '')))
      ]);
      box.appendChild(card);
    });
    Object.values(S.SCENARIOS).forEach((sc) => {
      box.appendChild(S.el('button', { class: 'lvl-card sand' + (!S.level && S.SCENARIO === sc ? ' cur' : ''), onclick: () => go('sandbox=' + sc.id) }, [
        S.el('div', { class: 'lvl-n', text: S.t('lvl.sandbox') }),
        S.el('div', { class: 'lvl-t', text: tx(sc.name) }),
        S.el('div', { class: 'lvl-b', text: S.t('lvl.sandboxDesc') })
      ]));
    });
    modal(S.t('lvl.menu'), box);
  };

  function rules() {
    const c = S.CONFIG.tools.camera;
    return S.el('ul', { class: 'brief-rules' }, [
      S.t('lvl.rule.marks', { m: MC().max, r: S.fmt(MC().radiusM, 0), h: MC().falseCostH }),
      S.t('lvl.rule.openings', { b: S.fmt(c.blindSearchH) }),
      S.t('lvl.rule.camera'),
      S.t('lvl.rule.locked')
    ].map((t) => S.el('li', { text: t })));
  }
  function brief(first) {
    const lv = S.level, sc = S.SCENARIO, body = S.el('div', { class: 'brief' });
    const sec = (k, el) => body.append(S.el('div', { class: 'card-sec', text: S.t(k) }), el);
    sec('lvl.building', S.el('div', { text: tx(sc.name) }));
    body.appendChild(S.el('p', { class: 'brief-txt', text: tx(lv.brief) }));
    if (S.variant) body.appendChild(S.el('p', { class: 'brief-txt', text: S.t('lvl.residents', { a: S.variant.min, b: S.variant.max }) }));
    sec('lvl.conditions', S.el('div', { class: 'chip', text: S.ui.condChip(lv.cond) }));
    sec('lvl.task', S.el('div', { text: tx(lv.task) }));
    body.appendChild(S.el('div', { class: 'chip', text: S.t('lvl.budgetH', { h: S.fmt(lv.budgetH, 0) }) }));
    sec('lvl.rules', rules());
    if (S.variant) body.appendChild(S.el('div', { class: 'out-note', text: S.t('lvl.variant', { v: S.variant.seed, id: lv.id }) }));
    let startBtn;
    if (lv.shop && first) {
      const sel = new Set(), info = S.el('div', { class: 'shop-info' });
      sec('lvl.shop', S.el('div'));
      const list = S.el('div', { class: 'shop' });
      const upd = () => {
        const used = [...sel].reduce((a, t) => a + S.CONFIG.costs[t].price, 0);
        info.textContent = S.t('lvl.budget', { u: used, b: lv.shop.budget }) + (used > lv.shop.budget ? ', ' + S.t('lvl.overBudget') : '');
        info.classList.toggle('bad', used > lv.shop.budget);
        startBtn.disabled = used > lv.shop.budget || !sel.size;
      };
      S.TOOLS.forEach((t) => {
        const c = S.CONFIG.costs[t.id];
        const cb = S.el('input', { type: 'checkbox' });
        cb.onchange = () => { cb.checked ? sel.add(t.id) : sel.delete(t.id); upd(); };
        list.appendChild(S.el('label', { class: 'shop-row' }, [cb, icon(t.id), S.el('span', { class: 'shop-name', text: S.t('tools.' + t.id + '.name') }),
          S.el('span', { class: 'shop-price', text: S.t('lvl.price', { p: c.price }) + ', ' + S.t('lvl.perTest', { h: S.fmt(c.timeH) }) })]));
      });
      body.append(list, info);
      startBtn = btn(S.t('lvl.start'), () => { st().kit = [...sel]; S.TOOLS.forEach((t) => { if (!sel.has(t.id)) st().locked[t.id] = 'kit'; }); S.ui.refreshTools(); hud(); close(); }, 'primary');
      modal(tx(lv.title), body, [startBtn], true);
      upd();
      return;
    }
    sec('lvl.tools', S.el('div', { class: 'brief-tools' }, S.TOOLS.map((t) => {
      const lk = st().locked[t.id];
      return S.el('div', { class: 'bt-row' + (lk ? ' off' : '') }, [icon(t.id, lk ? 'off' : ''), S.el('span', { text: toolName(t.id) }),
        S.el('span', { class: 'bt-note', text: lk ? '🔒 ' + S.t('lvl.reason.' + lk) : S.t('lvl.perTest', { h: S.fmt(S.CONFIG.costs[t.id].timeH) }) })]);
    })));
    modal(tx(lv.title), body, [btn(S.t('lvl.start'), close, 'primary')], first);
  }

  L.markMode = false;
  let markGroup = null, markBtn = null;
  function setMarkMode(on) {
    L.markMode = !!on;
    if (on) S.ui.selectTool(null);
    $('view').classList.toggle('armed', L.markMode || !!st().tool);
    if (markBtn) markBtn.classList.toggle('on', L.markMode);
  }
  function drawMarks() {
    if (!markGroup) return;
    while (markGroup.children.length) markGroup.remove(markGroup.children[0]);
    st().marks.forEach((m) => {
      markGroup.add(S.widgets.pin(m.point, m.auto ? 0x009E73 : 0xF0E442, 2.0));
      const l = S.makeLabel(markName(m), { size: 0.42, bg: m.auto ? S.C.green : S.C.yellow, color: m.auto ? '#fff' : '#111', border: '#111' });
      l.position.set(m.point[0], m.point[1] + 2.4, m.point[2]); markGroup.add(l);
    });
  }
  const markName = (m) => (m.auto ? '✓' : '?') + m.n;
  const manual = () => st().marks.filter((m) => !m.auto);
  L.mark = function (hit) {
    const ms = st().marks, near = ms.find((m) => S.dist2(m.point, hit.point) < 1.2);
    if (near && near.auto) { S.ui.toast(S.t('mark.isAuto', { n: near.n })); return; }
    if (near) { ms.splice(ms.indexOf(near), 1); S.ui.toast(S.t('mark.removed', { n: near.n })); }
    else if (manual().length >= MC().max) { S.ui.toast(S.t('mark.full', { m: MC().max })); return; }
    else { const n = (ms.reduce((a, m) => Math.max(a, m.n), 0)) + 1; ms.push({ n, point: hit.point.slice() }); S.ui.toast(S.t('mark.added', { n })); }
    drawMarks(); hud();
  };

  function confirmSeen(dep, res) {
    if (!S.level || dep.tool !== 'camera' || !res.seen || !res.seen.length) return;
    const ms = st().marks; let added = 0;
    res.seen.forEach((s) => {
      if (ms.some((m) => m.auto && m.vid === s.id)) return;
      added++;
      const v = S.SCENARIO.victims.find((x) => x.id === s.id); if (!v) return;
      const own = manual().map((m) => ({ m, d: S.dist2(m.point, [v.x, 0, v.z]) })).filter((x) => x.d <= MC().radiusM).sort((a, b) => a.d - b.d)[0];
      if (own) ms.splice(ms.indexOf(own.m), 1);
      const n = (ms.reduce((a, m) => Math.max(a, m.n), 0)) + 1;
      ms.push({ n, auto: true, vid: s.id, test: dep.n, point: [v.x, S.phys.surfaceAt(v.x, v.z, false).y, v.z] });
      S.ui.toast(S.t(own ? 'mark.autoMoved' : 'mark.auto', { n, k: own ? own.m.n : '', t: dep.n }));
    });
    if (added) { drawMarks(); hud(); }
  }

  function hud() {
    const h = $('levelHud'); h.innerHTML = '';
    if (!S.level) { $('modeLabel').textContent = S.t('lvl.sandbox') + ': ' + tx(S.SCENARIO.name); return; }
    const idx = S.LEVELS.indexOf(S.level) + 1, b = st().budget;
    $('modeLabel').textContent = S.t('lvl.levelN', { n: idx }) + ': ' + tx(S.level.title) + (S.variant ? ' (' + S.t('lvl.varShort', { v: S.variant.seed }) + ')' : '');
    markBtn = btn('📍 ' + S.t('mark.btn', { n: manual().length, m: MC().max }), () => setMarkMode(!L.markMode), 'small' + (L.markMode ? ' on' : ''));
    markBtn.title = S.t('mark.tip');
    h.append(
      S.el('span', { class: 'hud-t', text: S.t('lvl.time', { u: S.fmt(b.used), t: S.fmt(b.total, 0) }) }),
      S.widgets.bar(b.used / b.total, b.used / b.total > 0.85 ? S.C.red : S.C.blue),
      markBtn,
      btn(S.t('lvl.brief'), () => brief(false), 'small'),
      btn(S.t('lvl.finish'), debrief, 'small primary')
    );
  }

  function matchMarks(marks, victims) {
    const R = MC().radiusM, pairs = [];
    marks.forEach((m) => victims.forEach((v) => { const d = S.dist2([v.x, 0, v.z], m.point); if (d <= R) pairs.push({ m, v, d }); }));
    pairs.sort((a, b) => a.d - b.d);
    const byV = {}, byM = new Map();
    pairs.forEach((p) => { if (byV[p.v.id] || byM.has(p.m)) return; byV[p.v.id] = p; byM.set(p.m, p); });
    const dup = marks.filter((m) => !byM.has(m) && pairs.some((p) => p.m === m));
    const wrong = marks.filter((m) => !byM.has(m) && !dup.includes(m));
    return { byV, dup, wrong };
  }

  function unlock() {
    ['btnXray', 'btnDebug', 'btnClear'].forEach((id) => { $(id).disabled = false; $(id).title = S.t($(id).dataset.tt); });
  }

  function debrief() {
    setMarkMode(false);
    const lv = S.level, sc = S.SCENARIO, cond = lv.cond, wait = S.el('div', { class: 'empty', text: S.t('deb.analysing') });
    modal(S.t('deb.title', { t: tx(lv.title) }), wait);
    setTimeout(() => {
      const cov = S.analysis.coverage(cond), yours = S.analysis.yours(st().deps, cond);
      const avail = (t) => !st().locked[t];
      const N = sc.victims.length, b = st().budget, mm = matchMarks(st().marks, sc.victims);
      const nOk = Object.keys(mm.byV).length, nBad = mm.wrong.length;
      const body = S.el('div', { class: 'deb' });
      body.append(
        S.el('div', { class: 'deb-big', text: S.t('deb.marked', { f: nOk, n: N }) }),
        S.el('div', { class: 'deb-sub' + (nBad ? ' bad' : ''), text: nBad ? S.t('deb.falseN', { k: nBad, h: nBad * MC().falseCostH }) : S.t('deb.falseNone') }),
        S.el('div', { class: 'out-note', text: S.t('deb.used', { u: S.fmt(b.used), t: S.fmt(b.total, 0), k: st().deps.length, m: st().marks.length }) + (S.variant ? ' (' + S.t('lvl.varShort', { v: S.variant.seed }) + ')' : '') })
      );
      const signalNoMark = sc.victims.filter((v) => yours[v.id] && !mm.byV[v.id]).map((v) => v.id);
      if (signalNoMark.length) body.appendChild(S.el('div', { class: 'deb-if', text: S.t('deb.signalNoMark', { ids: signalNoMark.join(', ') }) }));
      if (!st().marks.length) body.appendChild(S.el('div', { class: 'deb-if none', text: S.t('deb.noMarks') }));

      body.appendChild(S.el('h3', { text: S.t('deb.people') }));
      const tbl = S.el('table', { class: 'cmp deb-t' });
      tbl.appendChild(S.el('tr', {}, ['person', 'where', 'state', 'mark', 'yours', 'could'].map((c) => S.el('th', { text: S.t('deb.cols.' + c) }))));
      sc.victims.forEach((v) => {
        const vs = S.phys.victimState(v, cond.hours);
        const phone = !v.phone ? S.t('deb.phoneNone') : !v.phone.works ? S.t('deb.phoneBroken') : vs.phoneOn ? S.t('state.phoneOn', { b: Math.round(vs.battery) }) : S.t('deb.phoneDead');
        const y = yours[v.id], mk = mm.byV[v.id];
        const could = S.el('div', { class: 'deb-icons' }, S.TOOLS.filter((t) => cov[t.id][v.id]).map((t) => icon(t.id, avail(t.id) ? '' : 'off')));
        tbl.appendChild(S.el('tr', { class: mk ? 'ok' : 'miss' }, [
          S.el('td', { class: 'mono', text: v.id }), S.el('td', { text: S.tr(S.analysis.where(v)) }),
          S.el('td', { text: S.t('state.' + vs.level) + ', ' + phone }),
          S.el('td', { text: mk ? (mk.m.auto ? S.t('mark.camCell', { n: mk.m.n, t: mk.m.test }) : '✓ ?' + mk.m.n + ', ' + S.fmt(mk.d) + ' ' + S.t('lvl.mShort')) : '✗' }),
          S.el('td', { text: y ? y.map((d) => '#' + d.n + ' ' + toolName(d.tool)).join(', ') : '—' }),
          S.el('td', {}, [could])
        ]));
      });
      body.appendChild(tbl);
      body.appendChild(S.el('div', { class: 'out-note', text: S.t('deb.note', { r: S.fmt(MC().radiusM, 0) }) }));
      if (mm.wrong.length || mm.dup.length) {
        body.appendChild(S.el('h3', { text: S.t('deb.falseTitle') }));
        mm.wrong.forEach((m) => {
          const nv = sc.victims.map((v) => ({ v, d: S.dist2([v.x, 0, v.z], m.point) })).sort((a, b) => a.d - b.d)[0];
          body.appendChild(S.el('div', { class: 'deb-if none', text: S.t('deb.falseRow', { n: m.n, r: S.fmt(MC().radiusM, 0), id: nv ? nv.v.id : '—', d: nv ? S.fmt(nv.d) : '—' }) }));
        });
        mm.dup.forEach((m) => body.appendChild(S.el('div', { class: 'deb-if', text: S.t('deb.dupRow', { n: m.n }) })));
      }

      body.appendChild(S.el('h3', { text: S.t('deb.tools') }));
      const tl = S.el('div', { class: 'deb-tools' });
      S.TOOLS.forEach((t) => {
        const ids = Object.keys(cov[t.id]), n = ids.length, used = st().deps.filter((d) => d.tool === t.id).length, lk = st().locked[t.id];
        const uniq = ids.filter((id) => !S.TOOLS.some((o) => o.id !== t.id && cov[o.id][id]));
        tl.appendChild(S.el('div', { class: 'deb-tool' + (lk ? ' off' : '') }, [icon(t.id, lk ? 'off' : ''), S.el('span', { class: 'dt-name', text: toolName(t.id) }),
          S.widgets.bar(n / N, t.color, S.t('deb.could', { n, t: N })),
          S.el('span', { class: 'dt-note', text: (uniq.length ? S.t('deb.only', { ids: uniq.join(', ') }) + ', ' : '') + (lk ? '🔒 ' + (lk === 'kit' ? S.t('deb.notInKit') : S.t('deb.unavailable')) : S.t('deb.usedN', { n: used })) })]));
      });
      body.appendChild(tl);
      body.appendChild(S.el('div', { class: 'out-note', text: S.t('deb.covNote') }));

      const lockedIds = S.TOOLS.map((t) => t.id).filter((t) => !avail(t));
      const availSet = new Set(); S.TOOLS.filter((t) => avail(t.id)).forEach((t) => Object.keys(cov[t.id]).forEach((id) => availSet.add(id)));
      if (lockedIds.length) {
        body.appendChild(S.el('h3', { text: S.t('deb.whatIf') }));
        lockedIds.forEach((t) => {
          const all = Object.keys(cov[t]).sort(), extra = all.filter((id) => !availSet.has(id));
          const msg = extra.length ? S.t('deb.ifHad', { tool: toolName(t), ids: extra.join(', ') }) : all.length ? S.t('deb.ifNothing', { tool: toolName(t), ids: all.join(', ') }) : S.t('deb.ifZero', { tool: toolName(t) });
          body.appendChild(S.el('div', { class: 'deb-if' + (extra.length ? ' plus' : '') }, [icon(t), S.el('span', { text: msg })]));
        });
      }
      const anySet = new Set(); S.TOOLS.forEach((t) => Object.keys(cov[t.id]).forEach((id) => anySet.add(id)));
      const nobody = sc.victims.map((v) => v.id).filter((id) => !anySet.has(id));
      if (nobody.length) body.appendChild(S.el('div', { class: 'deb-if none', text: S.t('deb.nobody', { ids: nobody.join(', ') }) }));

      if (lv.shop) {
        body.appendChild(S.el('h3', { text: S.t('deb.kits', { b: lv.shop.budget }) }));
        const kits = S.analysis.kits(cov, lv.shop.budget);
        const mine = kits.find((k) => k.kit.length === (st().kit || []).length && k.kit.every((t) => st().kit.includes(t)));
        const rows = kits.slice(0, 4); if (mine && !rows.includes(mine)) rows.push(mine);
        rows.forEach((k) => body.appendChild(S.el('div', { class: 'deb-kit' + (k === mine ? ' mine' : '') }, [
          S.el('span', { class: 'deb-icons' }, k.kit.map((t) => icon(t))),
          S.el('span', { text: S.t('deb.kitRow', { p: k.price, n: k.found.length, t: N }) + ' (' + k.found.join(', ') + ')' + (k === mine ? ' (' + S.t('deb.yourKit') + ')' : '') })
        ])));
        body.appendChild(S.el('div', { class: 'out-note', text: S.t('deb.kitNote') }));
      }

      body.append(S.el('h3', { text: S.t('deb.lesson') }), S.el('p', { class: 'brief-txt', text: tx(lv.lesson) }));
      st().finished = true; unlock();
      modal(S.t('deb.title', { t: tx(lv.title) }), body, [
        btn(S.t('deb.show'), () => { if (!S.view.debug) $('btnDebug').click(); close(); }, ''),
        btn(S.t('deb.again'), () => go('level=' + lv.id), ''),
        btn(S.t('deb.other'), L.menu, ''),
        btn(S.t('deb.cont'), close, 'primary')
      ]);
    }, 30);
  }

  L.init = function () {
    $('btnLevels').onclick = L.menu;
    $('modalClose').onclick = close;
    $('modal').onclick = (e) => { if (e.target.id === 'modal' && !$('modal').dataset.sticky) close(); };
    S.ui.onDeploy = hud;
    S.ui.onResult = confirmSeen;
    S.ui.onSelectTool = () => { if (L.markMode) setMarkMode(false); };
    st().marks = [];
    if (S.level) {
      const lv = S.level;
      st().locked = Object.assign({}, lv.locked || {});
      st().budget = { total: lv.budgetH, used: 0 };
      ['noise', 'hours'].forEach((id) => { $(id).disabled = true; });
      ['btnDay', 'btnNight'].forEach((id) => { $(id).disabled = true; });
      $('conditions').classList.add('fixed'); $('conditions').title = S.t('lvl.condFixed');
      $('hint').classList.add('hidden');

      if (!S.teacherKey) ['btnXray', 'btnDebug', 'btnClear'].forEach((id) => { $(id).disabled = true; $(id).title = S.t('lvl.afterDebrief'); });
      markGroup = new THREE.Group(); S.view.scene.add(markGroup);
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || $('modal').classList.contains('open') || $('compare').classList.contains('open')) return;
        if (e.key === 'm' || e.key === 'M') setMarkMode(!L.markMode);
        if (e.key === 'Escape' && L.markMode) setMarkMode(false);
      });
      S.ui.refreshTools();
      brief(true);
    }
    hud();
  };
})(window.SIM);
