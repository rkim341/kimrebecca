/* Draggable, tossable, spinning logos that fall and bounce inside the footer.
   Tap anywhere in the footer to add another one. */
(function () {
  var footer = document.querySelector(".footer");
  if (!footer) return;

  var SIZE = 40, MAX = 30;
  var GRAVITY = 0.32;      // pulls down every frame (a bit lighter)
  var BOUNCE = 0.58;       // energy kept on impact
  var AIR = 0.992;         // air drag
  var FLOOR_FRICTION = 0.93; // sliding friction on the floor
  var THROW = 0.9;         // release speed multiplier
  var logos = [], raf = null, last = 0;

  function bounds() {
    return { w: footer.clientWidth - SIZE, h: footer.clientHeight - SIZE };
  }

  function make(px, py) {
    var el = document.createElement("img");
    el.src = "assets/images/rk.logo.big.png";
    el.alt = logos.length ? "" : "RK logo";
    el.className = "footer__logo";
    el.draggable = false;
    footer.appendChild(el);
    var b = bounds();
    var l = {
      el: el, vx: 0, vy: 0, rot: 0, vr: 0, resting: true,
      x: Math.max(0, Math.min(b.w, px - SIZE / 2)),
      y: Math.max(0, Math.min(b.h, py - SIZE / 2)),
      dragging: false, offX: 0, offY: 0, hist: []
    };
    logos.push(l);
    render(l);
    bind(l);
    return l;
  }

  function render(l) {
    l.el.style.transform =
      "translate(" + l.x + "px," + l.y + "px) rotate(" + l.rot + "deg)";
  }

  function wake(l) { l.resting = false; startLoop(); }

  function step(t) {
    var dt = Math.min((t - last) / 16.67, 3);
    last = t;
    var b = bounds(), active = false;
    logos.forEach(function (l) {
      if (l.dragging || l.resting) return;
      l.vy += GRAVITY * dt;
      var drag = Math.pow(AIR, dt);
      l.vx *= drag; l.vy *= drag; l.vr *= drag;
      l.x += l.vx * dt; l.y += l.vy * dt; l.rot += l.vr * dt;

      if (l.x < 0) { l.x = 0; l.vx = Math.abs(l.vx) * BOUNCE; l.vr += l.vy * 0.3; }
      else if (l.x > b.w) { l.x = b.w; l.vx = -Math.abs(l.vx) * BOUNCE; l.vr -= l.vy * 0.3; }
      if (l.y < 0) { l.y = 0; l.vy = Math.abs(l.vy) * BOUNCE; }
      else if (l.y >= b.h) {
        l.y = b.h;
        l.vy = -Math.abs(l.vy) * BOUNCE;
        if (Math.abs(l.vy) < 1.2) l.vy = 0;
        var f = Math.pow(FLOOR_FRICTION, dt);
        l.vx *= f;
        l.vr = l.vr * f + l.vx * 0.4 * (1 - f); // roll a little with motion
      }
      if (l.y >= b.h && l.vy === 0 && Math.abs(l.vx) < 0.08 && Math.abs(l.vr) < 0.3) {
        l.vx = l.vr = 0; l.resting = true;
      } else active = true;
      render(l);
    });
    raf = active ? requestAnimationFrame(step) : null;
  }
  function startLoop() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  }

  function bind(l) {
    var el = l.el;
    el.addEventListener("pointerdown", function (e) {
      l.dragging = true; l.moved = true;
      l.vx = l.vy = l.vr = 0;
      var r = footer.getBoundingClientRect();
      l.offX = e.clientX - r.left - l.x;
      l.offY = e.clientY - r.top - l.y;
      l.hist = [{ t: performance.now(), x: l.x, y: l.y }];
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
      e.preventDefault();
      e.stopPropagation();
    });
    el.addEventListener("pointermove", function (e) {
      if (!l.dragging) return;
      var r = footer.getBoundingClientRect(), b = bounds();
      l.x = Math.max(0, Math.min(b.w, e.clientX - r.left - l.offX));
      l.y = Math.max(0, Math.min(b.h, e.clientY - r.top - l.offY));
      var now = performance.now();
      l.hist.push({ t: now, x: l.x, y: l.y });
      while (l.hist.length > 2 && now - l.hist[0].t > 100) l.hist.shift();
      render(l);
    });
    function release() {
      if (!l.dragging) return;
      l.dragging = false;
      el.classList.remove("is-dragging");
      var a = l.hist[0], z = l.hist[l.hist.length - 1], dt = (z.t - a.t) / 16.67;
      if (dt > 0 && performance.now() - z.t < 100) {
        l.vx = ((z.x - a.x) / dt) * THROW;
        l.vy = ((z.y - a.y) / dt) * THROW;
      }
      var speed = Math.sqrt(l.vx * l.vx + l.vy * l.vy);
      // random spin direction/amount, bigger for harder tosses
      l.vr = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 8 + speed * 0.6);
      wake(l);
    }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
  }

  // tap anywhere in the footer to add another logo
  footer.addEventListener("pointerdown", function (e) {
    if (e.target.classList && e.target.classList.contains("footer__logo")) return;
    if (logos.length >= MAX) return;
    var r = footer.getBoundingClientRect();
    var l = make(e.clientX - r.left, e.clientY - r.top);
    l.vr = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 5);
    wake(l);
  });

  window.addEventListener("resize", function () {
    var b = bounds();
    logos.forEach(function (l) {
      l.x = Math.min(l.x, b.w); l.y = Math.min(l.y, b.h);
      if (l.y < b.h) l.resting = false;
      render(l);
    });
    startLoop();
  });

  // first logo starts centered exactly on top of the text
  function textCenter() {
    var node = footer.firstChild;
    while (node && node.nodeType !== 3) node = node.nextSibling;
    var r = footer.getBoundingClientRect();
    if (!node) return { x: r.width / 2, y: r.height / 2 };
    var range = document.createRange();
    range.selectNodeContents(node);
    var t = range.getBoundingClientRect();
    return { x: t.left + t.width / 2 - r.left, y: t.top + t.height / 2 - r.top };
  }
  var c = textCenter();
  var first = make(c.x, c.y);
  window.addEventListener("load", function () {
    if (first.resting && !first.moved) {
      var c2 = textCenter();
      first.x = c2.x - SIZE / 2; first.y = c2.y - SIZE / 2;
      render(first);
    }
  });
})();
