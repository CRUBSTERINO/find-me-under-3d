window.SIM = window.SIM || {};
(function (S) {
  const V = (S.view = { pickables: [], probeTargets: [], structMats: [], fadeMats: [] });
  const LAYER_HIDDEN = 1;

  function std(color, extra) {
    return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.92, metalness: 0 }, extra || {}));
  }
  function struct(m, fade) { (fade ? V.fadeMats : V.structMats).push(m); return m; }

  S.makeLabel = function (text, opt) {
    opt = opt || {};
    const fs = 44, pad = 14;
    const c = document.createElement('canvas'), g = c.getContext('2d');
    g.font = '600 ' + fs + 'px system-ui, sans-serif';
    const w = Math.ceil(g.measureText(text).width) + pad * 2, h = fs + pad * 1.4;
    c.width = w; c.height = h;
    g.font = '600 ' + fs + 'px system-ui, sans-serif';
    g.fillStyle = opt.bg || 'rgba(20,24,30,0.85)';
    const r = 12; g.beginPath(); g.roundRect ? g.roundRect(0, 0, w, h, r) : g.rect(0, 0, w, h); g.fill();
    if (opt.border) { g.lineWidth = 6; g.strokeStyle = opt.border; g.stroke(); }
    g.fillStyle = opt.color || '#fff'; g.textBaseline = 'middle'; g.fillText(text, pad, h / 2 + 2);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: opt.depthTest !== undefined ? opt.depthTest : false, transparent: true }));
    const s = opt.size || 0.5;
    sp.scale.set(s * w / h, s, 1); sp.renderOrder = 20; sp.center.set(0.5, 0);
    return sp;
  };

  function boxMesh(def, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(def.s[0], def.s[1], def.s[2]), mat);
    m.position.set(def.c[0], def.c[1], def.c[2]);
    m.rotation.set(def.r[0] * S.D2R, def.r[1] * S.D2R, def.r[2] * S.D2R, 'XYZ');
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  function moundMesh(d, mat) {
    const nx = Math.max(4, Math.round(d.s[0] / 0.4)), nz = Math.max(4, Math.round(d.s[2] / 0.4));
    const geo = new THREE.PlaneGeometry(d.s[0], d.s[2], nx, nz); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, bot = d.c[1] - d.s[1] / 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), e = Math.max(Math.abs(x) / (d.s[0] / 2), Math.abs(z) / (d.s[2] / 2));
      const n = 0.08 * Math.sin((x + d.c[0]) * 2.1) * Math.cos((z + d.c[2]) * 1.7) + 0.05 * Math.sin((x + d.c[0]) * 5.3 + z);
      pos.setY(i, bot + Math.max(0.02, d.s[1] * (1 - S.smooth(0.55, 1, e)) + (e < 0.97 ? n : 0)));
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat); m.position.set(d.c[0], 0, d.c[2]); m.castShadow = true; m.receiveShadow = true; m.userData.pile = true;
    return m;
  }
  function edges(mesh, color, op) {
    const l = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: op || 0.55 }));
    mesh.add(l); return l;
  }

  function facadeTexture(exposed, seed, n, style) {
    n = n || 9;
    const W = 512, H = Math.round(80 * n + 20), c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), r = S.rng(seed), fl = H / (n + 0.2);
    if (!exposed) {
      g.fillStyle = style === 'brick' ? '#a9654e' : style === 'frame' ? '#c9ced2' : '#d9d3c5'; g.fillRect(0, 0, W, H);
      g.strokeStyle = style === 'brick' ? 'rgba(60,30,20,0.25)' : 'rgba(90,85,75,0.35)'; g.lineWidth = style === 'brick' ? 1 : 2;
      if (style === 'brick') for (let y = 0; y < H; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      else for (let f = 0; f <= n; f++) { g.beginPath(); g.moveTo(0, H - f * fl); g.lineTo(W, H - f * fl); g.stroke(); }
      if (style !== 'brick') for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(i * W / 6, 0); g.lineTo(i * W / 6, H); g.stroke(); }
      for (let f = 0; f < n; f++) for (let i = 0; i < 6; i++) {
        const x = i * W / 6 + 18, y = H - (f + 1) * fl + 16, ww = W / 6 - 36, hh = fl * 0.55;
        g.fillStyle = r() < 0.18 ? '#2b333c' : '#4a5a6b'; g.fillRect(x, y, ww, hh);
        g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x, y, ww, 3);
        if (r() < 0.12) { g.fillStyle = '#1f252b'; g.fillRect(x, y, ww, hh); }
      }
    } else {
      g.fillStyle = '#5b5852'; g.fillRect(0, 0, W, H);
      for (let f = 0; f < n; f++) {
        const y0 = H - (f + 1) * fl;
        for (let i = 0; i < 4; i++) {
          const tints = ['#8f8475', '#7d8a86', '#9a8a7a', '#7b7468', '#6f7a83'];
          g.fillStyle = tints[Math.floor(r() * tints.length)]; g.fillRect(i * W / 4 + 4, y0 + 8, W / 4 - 8, fl - 14);
          g.fillStyle = 'rgba(30,30,30,0.35)'; g.fillRect(i * W / 4 + 4, y0 + fl * 0.55, W / 4 - 8, fl * 0.4);
        }
        g.fillStyle = '#b8b2a6'; g.fillRect(0, y0 - 3, W, 9);
      }
      g.fillStyle = 'rgba(40,38,35,0.6)';
      for (let k = 0; k < 40; k++) { g.beginPath(); g.arc(r() * W, r() * H, 3 + r() * 10, 0, 7); g.fill(); }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function gableTexture(n, style) {
    n = n || 9;
    const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d');
    g.fillStyle = style === 'brick' ? '#a9654e' : '#cfc8b9'; g.fillRect(0, 0, 256, 512); g.strokeStyle = 'rgba(90,85,75,0.35)'; g.lineWidth = 2;
    for (let f = 0; f <= n; f++) { g.beginPath(); g.moveTo(0, 512 - f * 512 / (n + 0.2)); g.lineTo(256, 512 - f * 512 / (n + 0.2)); g.stroke(); }
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 512); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function textPlane(text, w, h, color) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 160; const g = c.getContext('2d');
    g.fillStyle = color || 'rgba(30,30,30,0.55)'; g.font = '700 96px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 512, 84);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; return m;
  }

  function makeVictim(v) {
    const g = new THREE.Group();
    const cloth = std(v.cloth || 0x555555, { roughness: 1 }), skin = std(0xc99a78), dust = std(0x9a948a, { roughness: 1 });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.5, 4, 10), cloth); torso.rotation.z = Math.PI / 2; torso.position.x = 0.15;
    const legs = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.7, 4, 8), dust); legs.rotation.z = Math.PI / 2; legs.position.set(-0.55, -0.03, 0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), skin); head.position.set(0.66, 0.0, 0);
    const armPivot = new THREE.Group(); armPivot.position.set(0.35, 0.05, 0.17);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.42, 3, 6), cloth); arm.rotation.z = Math.PI / 2; arm.position.x = -0.22;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), skin); hand.position.x = -0.48;
    armPivot.add(arm, hand);
    g.add(torso, legs, head, armPivot);
    g.position.set(v.x, v.y, v.z); g.rotation.y = (v.yaw || 0) * S.D2R;
    g.userData = { victim: v, arm: armPivot };

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true, opacity: 0.9 }));
    beacon.renderOrder = 15; g.add(beacon); g.userData.beacon = beacon;
    g.traverse((o) => { o.layers.set(LAYER_HIDDEN); if (o.isMesh) { o.castShadow = false; } });
    return g;
  }

  V.build = function (canvas) {
    const sc = S.SCENARIO;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.3, 600);
    camera.layers.enable(0);
    Object.assign(V, { renderer, scene, camera });

    V.hemi = new THREE.HemisphereLight(0xe6eef5, 0x6d665c, 1.5);
    V.sun = new THREE.DirectionalLight(0xffffff, 2.3);
    V.sun.position.set(28, 45, 30); V.sun.castShadow = true;
    V.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(V.sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 5, far: 140 });
    V.sun.shadow.bias = -0.0005; V.sun.shadow.normalBias = 0.03;
    V.flood = new THREE.SpotLight(0xffe2b0, 0, 0, 0.55, 0.6, 0);
    V.flood.position.set(14, 16, 20); V.flood.target.position.set(0, 4, 0);
    scene.add(V.hemi, V.sun, V.flood, V.flood.target);

    const HX = sc.hx, HZ = sc.hz;
    V.groundMat = std(0xa3a08f);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), V.groundMat);
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.userData.surface = true;
    scene.add(ground); V.pickables.push(ground); V.probeTargets.push(ground); V.ground = ground;
    const street = new THREE.Mesh(new THREE.PlaneGeometry(300, 10), std(0x74746f));
    street.rotation.x = -Math.PI / 2; street.position.set(0, 0.005, HZ + 13); street.receiveShadow = true; scene.add(street);
    const g1 = new THREE.GridHelper(120, 120, 0x000000, 0x000000); g1.material.transparent = true; g1.material.opacity = 0.07; g1.position.y = 0.02;
    const g5 = new THREE.GridHelper(120, 24, 0x000000, 0x000000); g5.material.transparent = true; g5.material.opacity = 0.2; g5.position.y = 0.025;
    scene.add(g1, g5);
    const bar = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(1, 0.06, 0.35), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffffff : 0x222222 }));
      seg.position.set(-HX - 9 + i + 0.5, 0.04, HZ + 5); bar.add(seg);
    }
    V.scaleLabel = S.makeLabel(S.t('scene.scale'), { size: 0.9, depthTest: true }); V.scaleLabel.position.set(-HX - 4, 0.2, HZ + 5.3);
    bar.add(V.scaleLabel); scene.add(bar);
    V.frontLabel = textPlane(S.t('scene.front'), 16, 2.5, 'rgba(255,255,255,0.75)'); V.frontLabel.position.set(0, 0.03, HZ + 13); scene.add(V.frontLabel);
    V.backLabel = textPlane(S.t('scene.back'), 16, 2.5); V.backLabel.position.set(0, 0.03, -HZ - 9); V.backLabel.rotation.z = Math.PI; scene.add(V.backLabel);

    const slabMats = [0xc3beb3, 0xbab5aa, 0xc8c3b8, 0xb5b0a5].map((c) => struct(std(c)));
    const wallMat = struct(std(0xd1cbbd)), panelMat = struct(std(0xcdc6b6));
    const pal = sc.palette || {};
    const rubbleMat = struct(std(pal.rubble || 0x8f887c, { flatShading: true, roughness: 1 }));
    sc.solids.forEach((d, i) => {
      let mat;
      if (d.role === 'slab' || d.role === 'plinth') mat = slabMats[(d.level || 0) % slabMats.length];
      else if (d.role === 'wall') mat = wallMat;
      else if (d.role === 'panel') mat = panelMat;
      else mat = rubbleMat;
      const m = d.role === 'topRubble' && !d.r.some((x) => x) ? moundMesh(d, mat) : boxMesh(d, mat);
      m.userData.surface = true; m.userData.solid = d; if (d.type === 'rubble') m.userData.rubbleBox = true;
      if (d.type === 'concrete') edges(m, 0x3e3b36, d.role === 'slab' ? 0.7 : 0.45);
      scene.add(m); V.pickables.push(m); V.probeTargets.push(m);
    });

    function pileMesh(x0, x1, z0, z1) {
      const nx = Math.round((x1 - x0) / 0.35), nz = Math.round((z1 - z0) / 0.35);
      const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position, col = [], r = S.rng('pile' + z0);
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) + (x0 + x1) / 2, z = pos.getZ(i) + (z0 + z1) / 2;
        pos.setXYZ(i, x, Math.max(0.01, S.phys.pileH(x, z)), z);
        const k = 0.82 + r() * 0.3, pc = (sc.palette && sc.palette.pile) || [0.56, 0.53, 0.48]; col.push(pc[0] * k, pc[1] * k, pc[2] * k);
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, V.pileMat); m.receiveShadow = true; m.castShadow = true; m.userData.surface = true; m.userData.pile = true;
      scene.add(m); V.pickables.push(m); V.probeTargets.push(m);
    }
    V.pileMat = struct(new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
    pileMesh(-HX - 7, HX + 7, -HZ - 7, HZ + 7);

    const chunkGeo = new THREE.DodecahedronGeometry(0.5, 0);
    const chunkMat = struct(std(0xffffff, { flatShading: true, roughness: 1 }));
    const N = 1700, chunks = new THREE.InstancedMesh(chunkGeo, chunkMat, N);
    const r = S.rng('chunks'), mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color();
    const palette = pal.chunks || [0x9b958a, 0x8a8479, 0xb1ab9f, 0x7c766c, 0xa0907e, 0x8c6f5e, 0xc9c4b8, 0x6e6a63];
    let n = 0;
    function put(x, y, z, s, sy) {
      if (n >= N) return;
      e.set(r() * 6, r() * 6, r() * 6); q.setFromEuler(e);
      mtx.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s * (0.8 + r() * 0.6), s * (sy || 0.6 + r() * 0.5), s * (0.8 + r() * 0.6)));
      chunks.setMatrixAt(n, mtx); col.setHex(palette[Math.floor(r() * palette.length)]); chunks.setColorAt(n, col); n++;
    }
    for (let i = 0; i < 1100; i++) {
      const x = -HX - 6 + r() * (2 * HX + 12), z = -HZ - 6 + r() * (2 * HZ + 12);
      const h = S.phys.pileH(x, z); if (h < 0.08) continue;
      put(x, h + 0.03, z, 0.12 + r() * r() * 0.55);
    }
    sc.solids.filter((d) => d.role === 'topRubble').forEach((d) => {
      const cnt = Math.round(d.s[0] * d.s[2] * 3.2);
      for (let i = 0; i < cnt; i++) {
        const u = r() - 0.5, w = r() - 0.5, e = Math.max(Math.abs(u), Math.abs(w)) * 2;
        put(d.c[0] + u * d.s[0], d.c[1] - d.s[1] / 2 + d.s[1] * (1 - S.smooth(0.55, 1, e)), d.c[2] + w * d.s[2], 0.12 + r() * r() * 0.5);
      }
    });
    for (let i = 0; i < 160; i++) { const a = r() * 6.28, d = 1 + r() * 0.5; put(Math.cos(a) * d * (HX + 5), 0.02, Math.sin(a) * d * (HZ + 5), 0.08 + r() * 0.2); }
    for (let k = 1; k < sc.levels.length; k++) {
      for (let i = 0; i < 26; i++) {
        const x = -HX + 0.4 + r() * (2 * HX - 0.8), z = -HZ + 0.4 + r() * (2 * HZ - 0.8);
        const fl = sc.floorY(k - 1, x, z), gap = sc.ceilY(k, x, z) - fl; if (gap < 0.35) continue;

        if (sc.openings.some((o) => S.dist2(o.inner, [x, 0, z]) < 2.5 || S.dist2(o.outer, [x, 0, z]) < 1.5)) continue;
        put(x, fl + 0.02, z, Math.min(0.12, gap * 0.28) + r() * 0.06, 0.5);
      }
    }
    chunks.count = n; chunks.castShadow = true; chunks.receiveShadow = true; chunks.instanceMatrix.needsUpdate = true;
    scene.add(chunks); V.chunks = chunks;

    const reb = [], rr = S.rng('rebar');
    sc.levelInfo.forEach((L) => L.pieces.forEach((p) => {
      for (let i = 0; i < 10; i++) {
        const side = rr() < 0.5 ? 1 : -1, x = p.x0 + rr() * (p.x1 - p.x0), z = side > 0 ? p.z1 : p.z0, y = p.cy;
        const len = 0.2 + rr() * 0.5, bend = (rr() - 0.5) * 0.4;
        reb.push(x, y, z, x + bend, y - len * 0.3 * rr(), z + side * len);
      }
    }));
    const rebGeo = new THREE.BufferGeometry(); rebGeo.setAttribute('position', new THREE.Float32BufferAttribute(reb, 3));
    scene.add(new THREE.LineSegments(rebGeo, new THREE.LineBasicMaterial({ color: 0x5b3b2b })));

    sc.props.filter((p) => p.kind === 'neighbour').forEach((p, i) => {
      const n = p.storeys || sc.storeys, st = p.style || 'panel', gable = gableTexture(n, st);
      const fac = facadeTexture(false, 'f' + i, n, st), back = facadeTexture(false, 'b' + i, n, st), exp = facadeTexture(true, 'e' + i, n, st);
      const mk = (tex) => struct(std(0xffffff, { map: tex }), true);
      const roof = struct(std(0x77726a), true);
      const mats = [mk(p.exposed === 'px' ? exp : gable), mk(p.exposed === 'nx' ? exp : gable), roof, roof, mk(fac), mk(back)];
      const m = new THREE.Mesh(new THREE.BoxGeometry(p.s[0], p.s[1], p.s[2]), mats);
      m.position.set(p.c[0], p.c[1], p.c[2]); m.castShadow = true; m.receiveShadow = true; m.userData.surface = true;
      scene.add(m); V.pickables.push(m);
      if (!p.exposed) return;

      const sg = p.exposed === 'px' ? 1 : -1, edge = p.c[0] + sg * p.s[0] / 2, hm = struct(std(0xbdb8ad), true), fh = p.s[1] / n;
      [[n - 1, 2.4, 40], [n - 3, 1.8, 55]].forEach(([fl, len, ang], j) => {
        if ((i + j) % 2 === 1 && j === 1) return;
        const a = ang * S.D2R, y = fl * fh;
        const h = new THREE.Mesh(new THREE.BoxGeometry(len, 0.22, 4 + j), hm);
        h.position.set(edge + sg * Math.cos(a) * len / 2, y - Math.sin(a) * len / 2, (j - 0.5) * 3);
        h.rotation.z = -sg * a; h.castShadow = true; edges(h, 0x3e3b36); scene.add(h);
      });
    });

    const propMat = {
      excavator: std(0xd8a23a), generator: std(0x58705f), truck: std(0xb23a2e), rescuer: std(0xe07b22)
    };
    sc.props.filter((p) => p.kind !== 'neighbour').forEach((p) => {
      const grp = new THREE.Group(); grp.position.set(p.c[0], p.c[1], p.c[2]);
      const body = new THREE.Mesh(p.kind === 'rescuer' ? new THREE.CapsuleGeometry(0.22, 1.3, 4, 8) : new THREE.BoxGeometry(p.s[0], p.s[1] * (p.kind === 'excavator' ? 0.55 : 1), p.s[2]), propMat[p.kind]);
      body.castShadow = true; body.userData.surface = true; grp.add(body);
      if (p.kind === 'excavator') {
        body.position.y = -0.4;
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.6), std(0x3a4148)); cab.position.set(0.6, 0.6, 0.6);
        const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 4), propMat.excavator); arm1.position.set(-0.6, 1.5, -2.6); arm1.rotation.x = 0.5;
        const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.4, 0.3), propMat.excavator); arm2.position.set(-0.6, 1.5, -4.6); arm2.rotation.x = -0.3;
        const tr = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.7, 4.4), std(0x2b2b2b)); tr.position.y = -0.95;
        [cab, arm1, arm2, tr].forEach((o) => { o.castShadow = true; grp.add(o); });
      }
      if (p.kind === 'truck') { const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 2.4), propMat.truck); cab.position.set(-4.9, -0.3, 0); cab.castShadow = true; grp.add(cab); }
      if (p.kind === 'rescuer') { const hel = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), std(0xf2f2f2)); hel.position.y = 0.95; grp.add(hel); }
      scene.add(grp); V.pickables.push(body);
    });

    V.victims = new THREE.Group(); scene.add(V.victims);
    sc.victims.forEach((v) => {
      const m = makeVictim(v); V.victims.add(m); m.children.forEach((c) => c !== m.userData.beacon && V.probeTargets.push(c));
      const lab = S.makeLabel(v.id, { size: 0.45, bg: 'rgba(255,255,255,0.92)', color: '#111' });
      lab.position.set(v.x, v.y + 0.45, v.z); lab.layers.set(LAYER_HIDDEN); V.victims.add(lab); m.userData.label = lab;
    });

    V.openings = new THREE.Group(); V.openings.visible = false; scene.add(V.openings);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x56b4e9, depthTest: false, transparent: true, opacity: 0.95 });
    V.addOpening = function (o) {
      const at = o.ring || o.outer, g = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 8, 24), ringMat);
      ring.position.set(at[0], at[1], at[2]);
      ring.lookAt(at[0] + o.dir[0], at[1] + o.dir[1], at[2] + o.dir[2]);
      ring.renderOrder = 12; g.add(ring);
      const l = S.makeLabel(o.id, { size: 0.35, bg: 'rgba(0,80,140,0.9)' }); l.position.set(at[0], at[1] + 0.4, at[2]); g.add(l);
      g.userData.op = o; g.visible = !!o.known; V.openings.add(g);
    };
    V.refreshOpenings = function () { V.openings.children.forEach((g) => (g.visible = !!(g.userData.op.known || V.xray))); };
    sc.openings.forEach((o) => {
      if (o.hatch) {
        const hm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 1.4), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
        hm.position.set(o.outer[0], 0.03, o.outer[2]); scene.add(hm);
      }
      V.addOpening(o);
    });

    V.markers = new THREE.Group(); scene.add(V.markers);

    const pc = document.createElement('canvas');
    V.probe = {
      canvas: pc,
      renderer: new THREE.WebGLRenderer({ canvas: pc, antialias: true }),
      camera: new THREE.PerspectiveCamera(S.CONFIG.tools.camera.fovDeg, 4 / 3, 0.01, 12),
      light: new THREE.SpotLight(0xfff4e0, 0, 7, 0.75, 0.5, 2)
    };
    V.probe.renderer.setPixelRatio(1); V.probe.renderer.setSize(320, 240, false);
    V.probe.camera.layers.enable(LAYER_HIDDEN);
    scene.add(V.probe.light, V.probe.light.target);

    V.setNight(false);
  };

  V.resize = function (w, h) { V.renderer.setSize(w, h, false); V.camera.aspect = w / h; V.camera.updateProjectionMatrix(); };

  V.setNight = function (night) {
    V.night = night;
    const bg = new THREE.Color(night ? 0x1b2230 : 0xcdd7de);
    V.scene.background = bg; V.scene.fog = new THREE.Fog(bg, 110, 260);
    V.hemi.color.setHex(night ? 0x8597bd : 0xe6eef5); V.hemi.groundColor.setHex(night ? 0x2c2c33 : 0x6d665c);
    V.hemi.intensity = night ? 0.9 : 1.5;
    V.sun.color.setHex(night ? 0xb3c6ea : 0xffffff); V.sun.intensity = night ? 0.55 : 2.3;
    V.flood.intensity = night ? 1.3 : 0;
    V.frontLabel.material.opacity = night ? 0.6 : 1;
  };

  V.setXray = function (on) {
    V.xray = on;
    V.structMats.concat(V.fadeMats).forEach((m) => {
      const fade = V.fadeMats.includes(m);
      m.transparent = on; m.opacity = on ? (fade ? 0.1 : 0.2) : 1; m.depthWrite = !on; m.needsUpdate = true;
    });
    V.openings.visible = !!(on || V.showOpen); V.refreshOpenings();
    V.groundMat.transparent = on; V.groundMat.opacity = on ? 0.35 : 1; V.groundMat.depthWrite = !on; V.groundMat.needsUpdate = true;
  };
  V.setDebug = function (on) { V.debug = on; on ? V.camera.layers.enable(LAYER_HIDDEN) : V.camera.layers.disable(LAYER_HIDDEN); };
  V.showOpenings = function (on) { V.showOpen = !!on; V.openings.visible = !!(on || V.xray); };

  V.renderProbe = function (pos, dir, up) {
    const P = V.probe, cfg = S.CONFIG.tools.camera, sc = V.scene;
    const keep = { sun: V.sun.intensity, hemi: V.hemi.intensity, flood: V.flood.intensity, bg: sc.background, fog: sc.fog, m: V.markers.visible, o: V.openings.visible };
    V.sun.intensity = 0; V.hemi.intensity = 0.03; V.flood.intensity = 0;
    sc.background = new THREE.Color(0x000000); sc.fog = new THREE.Fog(0x000000, cfg.lightRangeM * 0.45, cfg.lightRangeM + 0.6);
    V.markers.visible = false; V.openings.visible = false;
    V.victims.children.forEach((c) => { if (c.userData.beacon) c.userData.beacon.visible = false; if (c.isSprite) c.visible = false; });
    P.camera.position.set(pos[0], pos[1], pos[2]);
    P.camera.up.set(up[0], up[1], up[2]);
    P.camera.lookAt(pos[0] + dir[0], pos[1] + dir[1], pos[2] + dir[2]);
    P.light.position.set(pos[0] - dir[0] * 0.05, pos[1] - dir[1] * 0.05, pos[2] - dir[2] * 0.05);
    P.light.target.position.set(pos[0] + dir[0], pos[1] + dir[1], pos[2] + dir[2]); P.light.target.updateMatrixWorld();
    P.light.intensity = 4;
    P.renderer.render(sc, P.camera);
    P.light.intensity = 0;
    V.sun.intensity = keep.sun; V.hemi.intensity = keep.hemi; V.flood.intensity = keep.flood; sc.background = keep.bg; sc.fog = keep.fog;
    V.markers.visible = keep.m; V.openings.visible = keep.o;
    V.victims.children.forEach((c) => { if (c.userData.beacon) c.userData.beacon.visible = true; if (c.isSprite) c.visible = true; });
  };

  V.animate = function (time, hours) {
    V.victims.children.forEach((g) => {
      const v = g.userData.victim; if (!v) return;
      const st = S.phys.victimState(v, hours);
      const k = st.level === 'conscious' ? 0.5 : st.level === 'weak' ? 0.15 : 0;
      g.userData.arm.rotation.y = Math.sin(time * 2.2 + v.x) * k;
      g.children[0].scale.y = 1 + 0.03 * Math.sin(time * st.breathRate / 60 * 6.283);
      g.userData.beacon.material.color.setHex(st.level === 'conscious' ? 0x56b4e9 : st.level === 'weak' ? 0xe69f00 : 0xcc79a7);
    });
  };

  V.relabel = function (hours) {
    V.victims.children.forEach((g) => {
      const v = g.userData.victim; if (!v) return;
      const st = S.phys.victimState(v, hours);
      const txt = v.id + ', ' + S.t('state.' + st.level) + ', ' + (st.phoneOn ? S.t('state.phoneOn', { b: Math.round(st.battery) }) : S.t('state.phoneOff'));
      const old = g.userData.label; V.victims.remove(old); old.material.map.dispose();
      const lab = S.makeLabel(txt, { size: 0.42, bg: 'rgba(255,255,255,0.93)', color: '#111' });
      lab.position.copy(old.position); lab.layers.set(LAYER_HIDDEN); V.victims.add(lab); g.userData.label = lab;
    });
  };
})(window.SIM);
