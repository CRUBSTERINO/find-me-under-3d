window.SIM = window.SIM || {};
(function (S) {
  const U = (S.ui = {});
  const st = (S.state = { tool: null, cond: Object.assign({}, S.CONFIG.conditions), deps: [], log: [], selected: null, panel: null, n: 0, locked: {}, budget: null });
  const $ = (id) => document.getElementById(id);
  const toolById = (id) => S.TOOLS.find((t) => t.id === id);
  const condChip = (c) => S.t('cond.chip', { n: Math.round(c.noise * 100), dn: S.t(c.night ? 'cond.night' : 'cond.day').toLowerCase(), h: c.hours });

  function texts() {
    document.documentElement.lang = S.lang;
    document.title = S.t('app.short');
    $('title').textContent = S.t('app.title');
    document.querySelectorAll('[data-t]').forEach((e) => (e.textContent = S.t(e.dataset.t)));
    document.querySelectorAll('[data-tt]').forEach((e) => { e.title = S.t(e.dataset.tt); e.setAttribute('aria-label', e.title); });
    buildTools(); buildCard(); renderLog(); renderPanel(); updateCondLabels();
  }

  function buildTools() {
    const box = $('toolList'); box.innerHTML = '';
    S.TOOLS.forEach((t, i) => {
      const lk = st.locked[t.id];
      const b = S.el('button', { class: 'tool' + (st.tool === t.id ? ' active' : '') + (lk ? ' locked' : ''), title: lk ? S.t('lvl.reason.' + lk) : S.t('tools.' + t.id + '.returns'), html: S.icons[t.id] });
      if (lk) b.appendChild(S.el('span', { class: 'lock', text: '🔒' }));
      b.style.setProperty('--tc', t.color);
      b.appendChild(S.el('span', { class: 'tool-name', text: S.t('tools.' + t.id + '.short') }));
      b.appendChild(S.el('kbd', { text: String(i + 1) }));
      b.onclick = () => selectTool(st.tool === t.id ? null : t.id);
      box.appendChild(b);
    });
  }
  function buildCard() {
    const c = $('toolCard'); c.innerHTML = '';
    if (!st.tool) { c.appendChild(S.el('div', { class: 'card-empty', text: S.t('hint.s1') })); return; }
    const k = 'tools.' + st.tool + '.', t = toolById(st.tool);
    c.style.setProperty('--tc', t.color);
    if (st.locked[st.tool]) c.appendChild(S.el('div', { class: 'card-locked', text: '🔒 ' + S.t('lvl.reason.' + st.locked[st.tool]) }));
    c.append(
      S.el('div', { class: 'card-title', html: S.icons[st.tool] + '<span>' + S.t(k + 'name') + '</span>' }),
      S.el('div', { class: 'card-sec', text: S.t('ui.returns') }), S.el('div', { class: 'card-txt', text: S.t(k + 'returns') }),
      S.el('div', { class: 'card-sec', text: S.t('ui.pros') }), S.el('ul', { class: 'pros' }, S.t(k + 'pros').map((x) => S.el('li', { text: x }))),
      S.el('div', { class: 'card-sec', text: S.t('ui.cons') }), S.el('ul', { class: 'cons' }, S.t(k + 'cons').map((x) => S.el('li', { text: x }))),
      S.el('div', { class: 'card-sec', text: S.t('ui.how') }), S.el('div', { class: 'card-txt', text: S.t(k + 'how') }),
      S.el('div', { class: 'card-note', text: S.t('ui.deselect') })
    );
  }
  function selectTool(id) {
    st.tool = id;
    buildTools(); buildCard();
    const t = id && toolById(id);
    S.view.showOpenings(!!(t && t.showsOpenings));
    $('view').classList.toggle('armed', !!id);
    S.main.setHover(t);
    if (id && U.onSelectTool) U.onSelectTool(id);
  }
  U.selectTool = selectTool;

  U.deploy = function (hit) {
    if (!st.tool) { toast(S.t('hint.s1')); return; }
    const t = toolById(st.tool);
    if (st.locked[t.id]) { toast('🔒 ' + S.t('lvl.reason.' + st.locked[t.id])); return; }
    const cost = S.CONFIG.costs[t.id].timeH;
    if (st.budget && st.budget.used + cost > st.budget.total + 1e-6) { toast(S.t('lvl.noTime')); return; }
    const d = t.deploy(hit);
    if (d.error) {
      let msg = S.t(d.error, d.p);
      if (d.detail) msg += ' ' + S.tr(d.detail);
      if (d.costH && st.budget) { st.budget.used = Math.min(st.budget.total, st.budget.used + d.costH); msg += ' (−' + S.fmt(d.costH) + ' ' + S.t('lvl.hShort') + ')'; if (U.onDeploy) U.onDeploy(); }
      if (d.error !== 'acc.cancel') toast(msg);
      return;
    }
    hideHint();
    const dep = { id: 'd' + (++st.n), n: st.n, tool: t.id, point: d.point, params: d.params, place: d.place || S.phys.placeOf(d.point) };
    st.deps.push(dep);
    const res = t.evaluate(dep, st.cond);
    dep.res = res;
    if (U.onResult) U.onResult(dep, res);
    const msgs = [];
    if (d.warn) msgs.push(S.t(d.warn));
    if (d.note) msgs.push(S.tr(d.note));
    S.access.discover(dep, res).forEach((f) => msgs.push(S.t('acc.found.' + f.how, { id: f.id })));
    if (msgs.length) toast(msgs.join('; '));
    addLog(dep, res, st.cond, false);
    st.selected = dep.id;
    st.panel = { dep, snap: null };
    if (st.budget) st.budget.used += cost + (d.costH || 0);
    rebuildMarkers(); renderPanel(); renderLog();
    if (U.onDeploy) U.onDeploy(dep);
  };

  function addLog(dep, res, cond, retest) {
    st.log.unshift({ dep, tool: dep.tool, place: dep.place, summary: res.summary, cond: Object.assign({}, cond), retest, found: res.found });
    renderLog();
  }

  function rebuildMarkers() {
    const g = S.view.markers;
    while (g.children.length) g.remove(g.children[0]);
    st.deps.forEach((dep) => {
      const t = toolById(dep.tool), grp = t.marker(dep, dep.res);
      const sel = st.selected === dep.id;
      const lab = S.makeLabel('#' + dep.n, { size: sel ? 0.6 : 0.42, bg: t.color, color: '#111', border: sel ? '#111' : null });
      const top = dep.tool === 'thermal' ? [dep.point[0], dep.point[1] + 10.6, dep.point[2]] : [dep.point[0], dep.point[1] + (dep.tool === 'phone' || dep.tool === 'dog' ? 1.8 : 0.6), dep.point[2]];
      lab.position.set(top[0], top[1], top[2]); grp.add(lab);
      grp.traverse((o) => { if (o.material && !sel && st.selected) { o.material.transparent = true; o.material.opacity = Math.min(o.material.opacity, 0.55); } });
      g.add(grp);
    });
  }
  U.rebuildMarkers = rebuildMarkers;

  let handle = null;
  const panelCtx = { changed: null, keyHandler: null };
  function renderPanel() {
    if (handle) { handle.destroy(); handle = null; }
    panelCtx.keyHandler = null;
    const box = $('resultBody'), head = $('resultHead');
    box.innerHTML = ''; head.innerHTML = '';
    if (!st.panel) { box.appendChild(S.el('div', { class: 'empty', text: S.t('ui.noResult') })); return; }
    const { dep, snap } = st.panel, t = toolById(dep.tool), cond = snap || st.cond;
    const res = t.evaluate(dep, cond);
    if (!snap) dep.res = res;
    head.style.setProperty('--tc', t.color);
    head.append(S.el('span', { class: 'rh-icon', html: S.icons[t.id] }), S.el('span', { class: 'rh-n', text: '#' + dep.n }),
      S.el('span', { class: 'rh-name', text: S.t('tools.' + t.id + '.short') }), S.el('span', { class: 'rh-place', text: S.tr(dep.place) }));
    if (snap) {
      const ban = S.el('div', { class: 'snap' }, [S.el('span', { text: S.t('ui.condAt') + ': ' + condChip(snap) })]);
      ban.appendChild(S.el('button', { class: 'btn small', text: S.t('ui.useNow'), onclick: () => { st.panel.snap = null; renderPanel(); rebuildMarkers(); } }));
      box.appendChild(ban);
    }
    const body = S.el('div', { class: 'out' }); box.appendChild(body);
    panelCtx.changed = () => {
      const r2 = t.evaluate(dep, st.panel.snap || st.cond);
      dep.res = r2;
      if (U.onResult) U.onResult(dep, r2);
      const last = st.log.find((l) => l.dep === dep);
      if (last) { last.summary = r2.summary; last.found = r2.found; renderLog(); }
      if (handle && handle.refresh) handle.refresh(r2); else renderPanel();
      rebuildMarkers(); renderWhy(r2);
    };
    handle = t.render(body, dep, res, panelCtx) || { update() {}, destroy() {} };
    const why = S.el('div', { id: 'why', class: 'why' }); box.appendChild(why);
    renderWhy(res);
  }
  function renderWhy(res) {
    const w = $('why'); if (!w) return; w.innerHTML = '';
    if (!S.view.debug || !res.why) return;
    w.appendChild(S.el('div', { class: 'why-title', text: S.t('ui.why') }));
    res.why.forEach((m) => w.appendChild(S.el('div', { text: S.tr(m) })));
  }
  U.update = function (dt, time) { if (handle) handle.update(dt, time); };
  U.key = function (k) { return panelCtx.keyHandler ? panelCtx.keyHandler(k) : false; };

  function renderLog() {
    const box = $('logList'); box.innerHTML = '';
    if (!st.log.length) { box.appendChild(S.el('div', { class: 'empty', text: S.t('ui.noTests') })); return; }
    st.log.forEach((l) => {
      const t = toolById(l.tool);
      const sel = st.selected === l.dep.id && st.panel && (st.panel.snap === l.cond || (!st.panel.snap && l === st.log.find((x) => x.dep === l.dep)));
      const row = S.el('button', { class: 'log-row' + (sel ? ' sel' : '') + (S.view.debug ? (l.found ? ' f-yes' : ' f-no') : '') });
      row.style.setProperty('--tc', t.color);
      row.append(S.el('span', { class: 'lr-icon', html: S.icons[t.id] }),
        S.el('span', { class: 'lr-main' }, [
          S.el('span', { class: 'lr-top', text: '#' + l.dep.n + ' ' + S.t('tools.' + t.id + '.short') + (l.retest ? ', ↻ ' + S.t('ui.retest') : '') + ', ' + S.tr(l.place) }),
          S.el('span', { class: 'lr-sum', text: S.tr(l.summary) }),
          S.el('span', { class: 'lr-cond', text: condChip(l.cond) })
        ]));
      row.onclick = () => {
        st.selected = l.dep.id;
        const latest = st.log.find((x) => x.dep === l.dep) === l && sameCond(l.cond, st.cond);
        st.panel = { dep: l.dep, snap: latest ? null : l.cond };
        S.main.focus(l.dep.point);
        rebuildMarkers(); renderPanel(); renderLog();
      };
      box.appendChild(row);
    });
  }
  const sameCond = (a, b) => a.noise === b.noise && a.night === b.night && a.hours === b.hours;

  function updateCondLabels() {
    $('noiseVal').textContent = Math.round(st.cond.noise * 100) + '%';
    $('hoursVal').textContent = S.t('cond.h', { h: st.cond.hours });
    $('btnDay').classList.toggle('on', !st.cond.night); $('btnNight').classList.toggle('on', st.cond.night);
  }
  function condChanged(final) {
    updateCondLabels();
    S.view.setNight(st.cond.night);
    if (S.view.debug) S.view.relabel(st.cond.hours);
    st.deps.forEach((d) => { if (d.tool !== 'thermal') d.res = toolById(d.tool).evaluate(d, st.cond); });
    if (st.panel) st.panel.snap = null;
    rebuildMarkers();
    if (st.panel) renderPanel();
    if (final && st.panel) {
      const dep = st.panel.dep, last = st.log.find((l) => l.dep === dep);
      if (!last || sameCond(last.cond, st.cond)) return;
      if (last.retest && S.tr(last.summary) === S.tr(dep.res.summary)) { last.cond = Object.assign({}, st.cond); renderLog(); }
      else addLog(dep, dep.res, st.cond, true);
    }
  }

  let toastT = 0;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), Math.max(2600, msg.length * 55)); }
  U.toast = toast;
  U.condChip = condChip; U.refreshTools = () => { buildTools(); buildCard(); };
  function hideHint() { $('hint').classList.add('hidden'); }
  function showCompare() {
    const m = $('compare'), body = $('compareBody'); body.innerHTML = '';
    const cols = ['returns', 'strengths', 'weaknesses', 'needs', 'time', 'cost'];
    const tbl = S.el('table', { class: 'cmp' });
    tbl.appendChild(S.el('tr', {}, [S.el('th', { text: S.t('compare.cols.tool') })].concat(cols.map((c) => S.el('th', { text: S.t('compare.cols.' + c) })))));
    S.TOOLS.forEach((t) => {
      const name = S.el('td', { class: 'cmp-tool', html: S.icons[t.id] + '<span>' + S.t('tools.' + t.id + '.name') + '</span>' }); name.style.setProperty('--tc', t.color);
      tbl.appendChild(S.el('tr', {}, [name].concat(cols.map((c) => S.el('td', { class: 'cmp-' + c, text: S.t('tools.' + t.id + '.cmp.' + c) })))));
    });
    body.appendChild(tbl);
    $('compareTitle').textContent = S.t('compare.title');
    m.classList.add('open');
  }

  function showTasks() {
    const body = $('compareBody'); body.innerHTML = '';
    body.appendChild(S.el('p', { class: 'tasks-intro', text: S.t('tasks.intro') }));
    const ol = S.el('ol', { class: 'tasks' });
    S.TEXT.en.tasks.items.forEach((it) => ol.appendChild(S.el('li', {}, [
      S.el('div', { class: 'task-q', text: it.q }),
      S.el('div', { class: 'task-h' }, [S.el('b', { text: S.t('tasks.sim') + ': ' }), S.el('span', { text: it.sim })]),
      S.el('div', { class: 'task-h' }, [S.el('b', { text: S.t('tasks.res') + ': ' }), S.el('span', { text: it.res })])
    ])));
    body.appendChild(ol);
    $('compareTitle').textContent = S.t('tasks.title');
    $('compare').classList.add('open');
  }

  U.init = function () {
    st.cond = Object.assign({}, S.CONFIG.conditions);
    S.view.setNight(st.cond.night);

    document.querySelectorAll('[data-icon]').forEach((e) => e.insertAdjacentHTML('afterbegin', S.icons[e.dataset.icon]));
    $('noise').value = st.cond.noise * 100; $('hours').value = st.cond.hours; $('hours').max = S.CONFIG.hoursMax;
    $('noise').oninput = (e) => { st.cond.noise = e.target.value / 100; condChanged(false); };
    $('noise').onchange = () => condChanged(true);
    $('hours').oninput = (e) => { st.cond.hours = +e.target.value; condChanged(false); };
    $('hours').onchange = () => condChanged(true);
    $('btnDay').onclick = () => { if (st.cond.night) { st.cond.night = false; condChanged(true); } };
    $('btnNight').onclick = () => { if (!st.cond.night) { st.cond.night = true; condChanged(true); } };
    $('btnReset').onclick = () => S.main.resetView();
    $('btnXray').onclick = () => { S.view.setXray(!S.view.xray); $('btnXray').classList.toggle('on', S.view.xray); };
    $('btnDebug').onclick = () => {
      const on = !S.view.debug; S.view.setDebug(on); $('btnDebug').classList.toggle('on', on); document.body.classList.toggle('teacher', on);
      if (on) S.view.relabel(st.cond.hours);
      renderPanel(); renderLog();
    };
    $('btnCompare').onclick = showCompare;
    $('btnTasks').onclick = showTasks;
    $('compareClose').onclick = () => $('compare').classList.remove('open');
    $('compare').onclick = (e) => { if (e.target.id === 'compare') $('compare').classList.remove('open'); };
    $('btnHelp').onclick = () => $('hint').classList.toggle('hidden');
    $('hintOk').onclick = hideHint;
    $('btnClear').onclick = () => {
      if (!st.deps.length || !confirm(S.t('ui.clearConfirm'))) return;
      st.deps = []; st.log = []; st.panel = null; st.selected = null; if (st.budget) st.budget.used = 0; S.dogFatigue = 0; rebuildMarkers(); renderPanel(); renderLog(); if (U.onDeploy) U.onDeploy();
    };
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if ($('compare').classList.contains('open')) { if (e.key === 'Escape') $('compare').classList.remove('open'); return; }
      if ($('modal').classList.contains('open')) { if (e.key === 'Escape' && !$('modal').dataset.sticky) $('modal').classList.remove('open'); return; }
      if (U.key(e.key)) { e.preventDefault(); return; }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= S.TOOLS.length) { selectTool(S.TOOLS[n - 1].id); return; }
      if (e.key === 'Escape') selectTool(null);
      else if (e.key === 'r' || e.key === 'R') S.main.resetView();
      else if (e.key === 'x' || e.key === 'X') $('btnXray').click();
    });
    texts();
  };
})(window.SIM);
