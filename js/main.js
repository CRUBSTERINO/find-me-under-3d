window.SIM = window.SIM || {};
(function (S) {
  const M = (S.main = {});
  let orbit, hover = null;
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();

  function pick(e) {
    const cv = S.view.renderer.domElement, b = cv.getBoundingClientRect();
    mouse.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(mouse, S.view.camera);
    const h = ray.intersectObjects(S.view.pickables, false)[0];
    if (!h) return null;
    const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
    return { point: h.point.toArray(), normal: n.toArray(), object: h.object };
  }

  M.setHover = function (tool) {
    if (hover) { S.view.scene.remove(hover); hover = null; }
    if (!tool) return;
    hover = new THREE.Group();
    const col = tool.color;
    if (tool.id === 'dog') hover.add(S.widgets.ring([0, 0, 0], S.CONFIG.tools.dog.searchRadiusM, col, 0.2, 0.6));
    else if (tool.id === 'thermal') {
      const [w, h] = S.CONFIG.tools.thermal.footprintM, pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2]].map((p) => new THREE.Vector3(p[0], 0.25, p[1]));
      hover.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.6, depthTest: false })));
    }
    hover.add(S.widgets.ring([0, 0, 0], 0.45, col, 0.12, 1));
    hover.visible = false; S.view.scene.add(hover);
  };

  M.resetView = () => orbit.reset();
  M.focus = (p) => orbit.focus(p);

  M.start = function () {

    const h = new URLSearchParams(location.hash.slice(1));
    S.level = h.get('level') ? (S.LEVELS || []).find((l) => l.id === h.get('level')) || null : null;
    const scId = S.level ? S.level.scenario : (h.get('sandbox') && S.SCENARIOS[h.get('sandbox')] ? h.get('sandbox') : 'panel9');
    S.SCENARIO = S.SCENARIOS[scId];
    S.teacherKey = h.has('teacher');
    if (S.level) {
      S.CONFIG.conditions = Object.assign({}, S.level.cond);

      let v = parseInt(h.get('v'), 10);
      if (!(v > 0)) { v = 1000 + Math.floor(Math.random() * 9000); h.set('v', v); history.replaceState(null, '', '#' + h.toString()); }
      S.variant = S.level.variant === false ? null : S.applyVariant(S.SCENARIO, v);
    }
    S.buildScenario(S.SCENARIO);
    S.phys.init(S.SCENARIO);
    S.access.init(S.SCENARIO, !!S.level);
    const cv = document.getElementById('view');
    S.view.build(cv);
    orbit = new S.Orbit(S.view.camera, cv, (e) => {
      const h = pick(e);
      if (!h) S.ui.toast(S.t('err.noSurface'));
      else if (S.levelsUI.markMode) S.levelsUI.mark(h);
      else S.ui.deploy(h);
    });
    orbit.hover = (e) => {
      if (!hover) return;
      const h = pick(e);
      hover.visible = !!h;
      if (h) hover.position.set(h.point[0], h.point[1], h.point[2]);
    };
    cv.addEventListener('pointerleave', () => { if (hover) hover.visible = false; });
    S.ui.init();
    S.levelsUI.init();

    const wrap = document.getElementById('viewWrap');
    const fit = () => S.view.resize(wrap.clientWidth, wrap.clientHeight);
    new ResizeObserver(fit).observe(wrap); fit();

    M.orbit = orbit;
    let last = performance.now();
    M.frame = function (dt, now) {
      orbit.update(dt);
      S.view.animate(now / 1000, S.state.cond.hours);
      S.ui.update(dt, now / 1000);
      S.view.renderer.render(S.view.scene, S.view.camera);
    };
    function loop(now) {
      M.frame(Math.min(0.1, (now - last) / 1000), now); last = now;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  };
  window.addEventListener('DOMContentLoaded', M.start);
})(window.SIM);
