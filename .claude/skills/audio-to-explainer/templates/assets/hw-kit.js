/* hw-kit: hand-drawn helpers shared by every scene (seek-safe, no Math.random). */
(function () {
  window.__timelines = window.__timelines || {};
  window.hwOnUpdate = function (tl, fn) {
    if (!tl.__hwRenders) {
      tl.__hwRenders = [];
      tl.eventCallback("onUpdate", function () { for (var i = 0; i < tl.__hwRenders.length; i++) tl.__hwRenders[i](); });
    }
    tl.__hwRenders.push(fn); fn();
  };
  window.hwHash = function (n, seed) { var x = Math.sin(n * 127.1 + (seed || 1) * 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };
  window.hwBoil = function (tl, target, opts) {
    opts = opts || {}; var amp = opts.amp !== undefined ? opts.amp : 1.4, rot = opts.rot !== undefined ? opts.rot : 0.4;
    var fps = opts.fps || 30, drop = opts.frameDrop || 3, seed = opts.seed || 1, els = gsap.utils.toArray(target);
    window.hwOnUpdate(tl, function () {
      var step = Math.floor((tl.time() * fps) / drop);
      for (var i = 0; i < els.length; i++) gsap.set(els[i], { x: window.hwHash(step * 3 + i * 97, seed) * amp, y: window.hwHash(step * 3 + 1 + i * 97, seed) * amp, rotation: (opts.baseRot || 0) + window.hwHash(step * 3 + 2 + i * 97, seed) * rot });
    });
  };
  function f(v) { return (+v).toFixed(1); }
  /* wobbly closed ellipse */
  window.hwWobbleEllipse = function (cx, cy, rx, ry, seed, wobblePct) {
    wobblePct = wobblePct === undefined ? 3 : wobblePct; var N = 14, pts = [];
    for (var i = 0; i < N; i++) { var a = (i / N) * Math.PI * 2; var wr = 1 + window.hwHash(i * 13 + 5, seed) * (wobblePct / 100); pts.push([cx + Math.cos(a) * rx * wr, cy + Math.sin(a) * ry * wr]); }
    var mx = (pts[0][0] + pts[N - 1][0]) / 2, my = (pts[0][1] + pts[N - 1][1]) / 2, d = "M" + f(mx) + " " + f(my);
    for (var j = 0; j < N; j++) { var p = pts[j], q = pts[(j + 1) % N]; d += " Q" + f(p[0]) + " " + f(p[1]) + " " + f((p[0] + q[0]) / 2) + " " + f((p[1] + q[1]) / 2); }
    return d;
  };
  /* wobbly line from (x0,y0) to (x1,y1), n segments */
  window.hwLine = function (x0, y0, x1, y1, seed, amp) {
    amp = amp === undefined ? 2.2 : amp; var n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 70)); var d = "M " + f(x0) + " " + f(y0);
    for (var i = 1; i <= n; i++) { var t = i / n; var nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1; var w = window.hwHash(i * 7 + 3, seed) * amp;
      d += " L " + f(x0 + (x1 - x0) * t + (nx / L) * w) + " " + f(y0 + (y1 - y0) * t + (ny / L) * w); }
    return d;
  };
  /* wobbly rectangle (x,y,w,h), slightly overshooting corners like a marker */
  window.hwRect = function (x, y, w, h, seed, r) {
    r = r || 0; var pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], d = "";
    for (var i = 0; i < 4; i++) { var a = pts[i], b = pts[(i + 1) % 4]; var seg = window.hwLine(a[0], a[1], b[0], b[1], seed + i * 11, 2.4); d += (i ? " " : "") + seg; }
    return d;
  };
  /* hand-drawn arrow (from hw-arrow) */
  window.hwArrowPath = function (w, h, curve, seed) {
    seed = seed || 1; var bend = curve === "swoop" ? 0.55 : curve === "gentle" ? 0.28 : 0.06;
    function wob(v, n, range) { return v + window.hwHash(n, seed) * range; }
    var x0 = wob(4, 1, 3), y0 = wob(h * 0.72, 2, 4), x1 = wob(w - 10, 3, 4), y1 = wob(h * 0.3, 4, 4);
    var cx1 = wob(w * 0.35, 5, 10), cy1 = wob(h * (0.72 + bend * 0.5), 6, 8), cx2 = wob(w * 0.7, 7, 10), cy2 = wob(h * (0.3 + bend), 8, 8);
    var ang = Math.atan2(y1 - cy2, x1 - cx2);
    function head(da, len) { var a = ang + Math.PI + da; return "M " + f(x1) + " " + f(y1) + " l " + f(Math.cos(a) * len) + " " + f(Math.sin(a) * len); }
    return "M " + f(x0) + " " + f(y0) + " C " + f(cx1) + " " + f(cy1) + ", " + f(cx2) + " " + f(cy2) + ", " + f(x1) + " " + f(y1) + " " + head(0.5, wob(30, 9, 6)) + " " + head(-0.5, wob(30, 10, 6));
  };
  /* underline squiggle / strike / bracket (from hw-underline) */
  window.hwMarkPath = function (w, h, style, seed) {
    seed = seed || 1; function wob(n, range) { return window.hwHash(n, seed) * (range === undefined ? 5 : range); } var mid = h / 2;
    if (style === "strike") return "M " + (2 + wob(1, 3)) + " " + (mid + wob(2)) + " L " + (w - 4 + wob(3, 3)) + " " + (mid - 3 + wob(4)) + " M " + (w - 10 + wob(5, 4)) + " " + (mid + 7 + wob(6)) + " L " + (8 + wob(7, 4)) + " " + (mid + 3 + wob(8));
    var segs = Math.max(5, Math.round(w / 95)), d = "M 2 " + (mid + wob(0, 4));
    for (var i = 1; i <= segs; i++) { var x = (w / segs) * i; d += " Q " + (x - w / segs / 2 + wob(i * 4 + 1, 9)) + " " + (mid + (i % 2 ? -1 : 1) * (9 + wob(i * 4 + 2, 4))) + " " + f(x) + " " + (mid + wob(i * 4 + 3, 4)); }
    return d;
  };
  /* marker highlight band behind a word: a fat wobbly stroke */
  window.hwHighlightPath = function (w, h, seed) { return window.hwLine(2, h * 0.55, w - 2, h * 0.5, seed, 3); };
  /* draw-on: dash-reveal a path at time `at` over `dur` seconds */
  window.hwDrawOn = function (tl, path, at, dur, ease) {
    var p = typeof path === "string" ? document.querySelector(path) : path; var len = p.getTotalLength();
    p.setAttribute("stroke-dasharray", len + " " + len); p.setAttribute("stroke-dashoffset", len); gsap.set(p, { opacity: 0 });
    tl.set(p, { opacity: 1 }, at); tl.to(p, { strokeDashoffset: 0, duration: dur === undefined ? 0.6 : dur, ease: ease || "power2.inOut" }, at);
  };
  /* draw every path in a container in order, each taking `each` seconds, overlapping 35% */
  window.hwDrawAll = function (tl, container, at, each, ease) {
    var c = typeof container === "string" ? document.querySelector(container) : container; var ps = c.querySelectorAll("path, line, polyline, circle, ellipse, rect"); var t = at;
    for (var i = 0; i < ps.length; i++) { var p = ps[i]; var d = each * (0.6 + Math.min(1.4, p.getTotalLength() / 500)); window.hwDrawOn(tl, p, t, d, ease); t += d * 0.65; }
    return t;
  };
  /* pop-in with a cartoon spring (scale) on a wrapper */
  window.hwPop = function (tl, target, at, dur) { tl.fromTo(target, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: dur || 0.45, ease: "back.out(2.2)" }, at); };
  /* hand-written text: reveal letter by letter via clip on a wrapper */
  window.hwWrite = function (tl, target, at, dur) { tl.fromTo(target, { clipPath: "inset(0% 58% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: dur || 0.6, ease: "none" }, at); };
  /* seek-safe counter: writes formatted number into el over [at, at+dur] */
  window.hwCount = function (tl, el, from, to, at, dur, fmt) {
    var e = typeof el === "string" ? document.querySelector(el) : el; var o = { v: from };
    tl.to(o, { v: to, duration: dur, ease: "power2.out", onUpdate: function () { e.textContent = fmt ? fmt(o.v) : Math.round(o.v).toLocaleString("en-IN"); } }, at);
  };
  window.hwINR = function (v) { return "₹" + Math.round(v).toLocaleString("en-IN"); };
})();
