window.SIM = window.SIM || {};
(function (S) {
  S.Orbit = function (camera, dom, onClick) {
    const self = this;
    const v = (S.SCENARIO && S.SCENARIO.view) || { target: [0, 3, 1], r: 62 };
    const home = { target: new THREE.Vector3(v.target[0], v.target[1], v.target[2]), r: v.r, theta: -0.55, phi: 0.98 };
    this.target = home.target.clone(); this.r = home.r; this.theta = home.theta; this.phi = home.phi;
    let anim = null;
    const pointers = new Map();
    let mode = null, last = null, downAt = null, moved = 0, pinch0 = 0;

    function pan(dx, dy) {
      const s = self.r * 0.0016;
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
      const fwd = new THREE.Vector3(-Math.sin(self.theta), 0, -Math.cos(self.theta));
      self.target.addScaledVector(right, -dx * s).addScaledVector(fwd, dy * s);
      self.target.y = S.clamp(self.target.y, 0, 20);
    }
    dom.addEventListener('contextmenu', (e) => e.preventDefault());
    dom.addEventListener('pointerdown', (e) => {
      dom.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      anim = null;
      if (pointers.size === 1) {
        mode = e.button === 2 || e.button === 1 || e.shiftKey ? 'pan' : 'rot';
        last = { x: e.clientX, y: e.clientY }; downAt = { x: e.clientX, y: e.clientY, t: performance.now(), button: e.button }; moved = 0;
      } else if (pointers.size === 2) {
        mode = 'pinch'; const [a, b] = [...pointers.values()];
        pinch0 = Math.hypot(a.x - b.x, a.y - b.y); last = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; moved = 99;
      }
    });
    dom.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) { self.hover && self.hover(e); return; }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (mode === 'pinch' && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (pinch0 > 0) self.r = S.clamp(self.r * pinch0 / d, 6, 140);
        pinch0 = d; pan(m.x - last.x, m.y - last.y); last = m; return;
      }
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      last = { x: e.clientX, y: e.clientY };
      if (mode === 'rot') { self.theta -= dx * 0.006; self.phi = S.clamp(self.phi - dy * 0.006, 0.15, 1.52); }
      else if (mode === 'pan') pan(dx, dy);
    });
    const up = (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        if (downAt && moved < 6 && downAt.button === 0 && performance.now() - downAt.t < 700) onClick(e);
        mode = null; downAt = null;
      }
    };
    dom.addEventListener('pointerup', up);
    dom.addEventListener('pointercancel', up);
    dom.addEventListener('wheel', (e) => {
      e.preventDefault(); anim = null;
      const k = e.ctrlKey ? 0.012 : 0.0016;
      self.r = S.clamp(self.r * Math.exp(e.deltaY * k), 6, 140);
    }, { passive: false });

    this.reset = function () { anim = { t: 0, from: { target: self.target.clone(), r: self.r, theta: self.theta, phi: self.phi } }; };
    this.focus = function (p) { anim = { t: 0, from: { target: self.target.clone(), r: self.r, theta: self.theta, phi: self.phi }, to: { target: new THREE.Vector3(p[0], p[1], p[2]), r: Math.min(self.r, 28), theta: self.theta, phi: self.phi } }; };
    this.update = function (dt) {
      if (anim) {
        anim.t = Math.min(1, anim.t + dt * 2.2);
        const k = S.smooth(0, 1, anim.t), to = anim.to || home, f = anim.from;
        self.target.lerpVectors(f.target, to.target, k);
        self.r = S.lerp(f.r, to.r, k);
        let dth = to.theta - f.theta; dth = Math.atan2(Math.sin(dth), Math.cos(dth));
        self.theta = f.theta + dth * k; self.phi = S.lerp(f.phi, to.phi, k);
        if (anim.t >= 1) anim = null;
      }
      const sp = Math.sin(self.phi);
      camera.position.set(self.target.x + self.r * sp * Math.sin(self.theta), self.target.y + self.r * Math.cos(self.phi), self.target.z + self.r * sp * Math.cos(self.theta));
      camera.lookAt(self.target);
    };
  };
})(window.SIM);
