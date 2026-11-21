window.SIM = window.SIM || {};
(function (S) {
  S.D2R = Math.PI / 180;
  S.lang = 'en';

  function lookup(o, key) { return key.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o); }
  S.t = function (key, p) {
    let v = lookup(S.TEXT.en, key);
    if (v === undefined) return key;
    if (typeof v === 'string' && p) v = v.replace(/\{(\w+)\}/g, (m, k) => (p[k] !== undefined ? (typeof p[k] === 'object' && p[k].k ? S.tr(p[k]) : p[k]) : m));
    return v;
  };

  S.tr = function (m) { return typeof m === 'string' ? m : S.t(m.k, m.p); };

  S.fmt = function (n, d) {
    const s = (+n).toFixed(d === undefined ? 1 : d);
    return s.replace('-', '−');
  };

  S.hash = function (str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  S.rng = function (seed) {
    let a = typeof seed === 'number' ? seed : S.hash(String(seed));
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  S.gauss = function (r) { const u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  S.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  S.lerp = (a, b, t) => a + (b - a) * t;
  S.smooth = (a, b, x) => { const t = S.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  S.dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  S.dist2 = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);

  S.dirKey = function (dx, dz) {
    if (Math.hypot(dx, dz) < 1) return 'below';
    const a = Math.atan2(dx, dz) / S.D2R;
    const keys = ['f', 'fr', 'r', 'br', 'b', 'bl', 'l', 'fl'];
    return keys[((Math.round(a / 45) % 8) + 8) % 8];
  };

  S.el = function (tag, attrs, kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'style') e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach((c) => c != null && e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return e;
  };

  S.canvas = function (w, h, cls) {
    const cv = document.createElement('canvas');
    const r = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * r); cv.height = Math.round(h * r);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    if (cls) cv.className = cls;
    const ctx = cv.getContext('2d'); ctx.scale(r, r);
    return { cv, ctx, w, h };
  };

  S.C = { orange: '#E69F00', sky: '#56B4E9', green: '#009E73', yellow: '#F0E442', blue: '#0072B2', red: '#D55E00', purple: '#CC79A7', ink: '#1d2329' };

  const sv = (p) => '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  S.icons = {
    geophone: sv('<path d="M6 20h12M12 20v-5"/><circle cx="12" cy="11" r="3"/><path d="M6 6a8 8 0 0 0 0 10M18 6a8 8 0 0 1 0 10"/>'),
    camera: sv('<path d="M2 22c5-1 7-5 8.5-9"/><circle cx="14" cy="8" r="5"/><circle cx="14" cy="8" r="1.8"/>'),
    radar: sv('<path d="M12 21v-7M8 21h8"/><path d="M4.5 10a7.5 7.5 0 0 1 15 0"/><path d="M8 10a4 4 0 0 1 8 0"/><circle cx="12" cy="11" r="1.2"/>'),
    phone: sv('<rect x="8" y="4" width="8" height="16" rx="2"/><path d="M11 17h2"/><path d="M4 9a6 6 0 0 0 0 6M20 9a6 6 0 0 1 0 6"/>'),
    thermal: sv('<circle cx="5" cy="5" r="2.5"/><circle cx="19" cy="5" r="2.5"/><path d="M7 6.5l3 3h4l3-3"/><rect x="9.5" y="9.5" width="5" height="4" rx="1"/><path d="M8 17l4 4 4-4" opacity=".7"/>'),
    dog: sv('<circle cx="6.5" cy="10" r="1.8"/><circle cx="10" cy="6" r="1.8"/><circle cx="14.5" cy="6" r="1.8"/><circle cx="18" cy="10" r="1.8"/><path d="M8 17.5c0-3 2-5.5 4.3-5.5s4.4 2.5 4 5.5c-.4 2.2-2.8 2.5-4.2 1.6-1.6 1-4.1.6-4.1-1.6z"/>'),
    reset: sv('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
    xray: sv('<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5" opacity=".6"/><path d="M3 17l9 5 9-5" opacity=".35"/>'),
    teacher: sv('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    compare: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11M15 9v11"/>'),
    help: sv('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>'),
    trash: sv('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    sun: sv('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5"/>'),
    moon: sv('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
    noise: sv('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
    clock: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    levels: sv('<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>'),
    globe: sv('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>')
  };
})(window.SIM);
