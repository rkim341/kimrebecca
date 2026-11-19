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

  function dragVel(l) {
    var h = l.hist, a = h[0], z = h[h.length - 1], dt = (z.t - a.t) / 16.67;
    if (h.length < 2 || dt <= 0 || performance.now() - z.t > 100) return { x: 0, y: 0 };
    return { x: (z.x - a.x) / dt, y: (z.y - a.y) / dt };
  }

  // solid logos: circle collisions with impulse, spin and positional correction
  function collide(a, b, bd) {
    var dx = (b.x - a.x), dy = (b.y - a.y);
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d >= SIZE) return;
    if (d < 0.001) { dx = 0; dy = -1; d = 1; } // exactly stacked: nudge apart
    var nx = dx / d, ny = dy / d, overlap = SIZE - d;

    var da = a.dragging, db = b.dragging;
    if (da && db) return;
    var wa = da ? 0 : db ? 1 : 0.5, wb = db ? 0 : da ? 1 : 0.5;
    a.x -= nx * overlap * wa; a.y -= ny * overlap * wa;
    b.x += nx * overlap * wb; b.y += ny * overlap * wb;
    [a, b].forEach(function (l) {
      l.x = Math.max(0, Math.min(bd.w, l.x));
      l.y = Math.max(0, Math.min(bd.h, l.y));
    });

    var va = da ? dragVel(a) : { x: a.vx, y: a.vy };
    var vb = db ? dragVel(b) : { x: b.vx, y: b.vy };
    var vn = (vb.x - va.x) * nx + (vb.y - va.y) * ny;
    if (vn >= 0) return; // already separating
    var e = vn < -1.5 ? 0.55 : 0; // gentle contacts don't bounce
    var j = -(1 + e) * vn / (wa + wb || 1);
    if (!da) { a.vx -= j * nx * wa; a.vy -= j * ny * wa; }
    if (!db) { b.vx += j * nx * wb; b.vy += j * ny * wb; }
    // friction on the contact turns into spin
    var tx = -ny, ty = nx;
    var vt = (vb.x - va.x) * tx + (vb.y - va.y) * ty;
    if (!da) a.vr += vt * 0.35 * wa * 2;
    if (!db) b.vr += vt * 0.35 * wb * 2;
  }

  function step(t) {
    var dt = Math.min((t - last) / 16.67, 3);
    last = t;
    var b = bounds(), active = false;
    logos.forEach(function (l) {
      if (l.dragging) { active = true; return; }
      if (l.resting) return;
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
    });

    for (var pass = 0; pass < 3; pass++) {
      for (var i = 0; i < logos.length; i++) {
        for (var k = i + 1; k < logos.length; k++) {
          var A = logos[i], B = logos[k];
          if (A.resting && B.resting) continue;
          collide(A, B, b);
        }
      }
    }

    logos.forEach(function (l) {
      if (l.dragging) return;
      var speed = Math.sqrt(l.vx * l.vx + l.vy * l.vy);
      if (l.resting) {
        if (speed > 0.5) { l.resting = false; l.calm = 0; } else { l.vx = l.vy = 0; return; }
      }
      if (speed < 0.6 && Math.abs(l.vr) < 0.3) l.calm = (l.calm || 0) + 1; else l.calm = 0;
      if (l.calm > 20) { l.vx = l.vy = l.vr = 0; l.resting = true; l.calm = 0; }
      else active = true;
      render(l);
    });
    logos.forEach(function (l) { if (l.dragging || l.resting) render(l); });
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
      logos.forEach(function (o) { if (o !== l) o.resting = false; });
      startLoop();
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

  // first logo starts centered just above the text
  function textCenter() {
    var node = footer.firstChild;
    while (node && node.nodeType !== 3) node = node.nextSibling;
    var r = footer.getBoundingClientRect();
    if (!node) return { x: r.width / 2, y: r.height / 2 };
    var range = document.createRange();
    range.selectNodeContents(node);
    var t = range.getBoundingClientRect();
    return { x: t.left + t.width / 2 - r.left, y: t.top - r.top - SIZE / 2 - 12 };
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

  // "drag me!" hint after 2s in the footer, until the logo is first grabbed
  var hint = document.createElement("div");
  hint.className = "footer__hint";
  hint.textContent = "drag me!";
  hint.setAttribute("aria-hidden", "true");
  footer.appendChild(hint);
  function placeHint() {
    hint.style.left = first.x + SIZE / 2 + "px";
    hint.style.top = first.y - 4 + "px";
  }
  placeHint();
  window.addEventListener("load", placeHint);
  window.addEventListener("resize", placeHint);
  var timer = null;
  function hideHint() { clearTimeout(timer); hint.classList.remove("is-visible"); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      if (first.moved) return hideHint();
      if (entries[0].isIntersecting) {
        timer = setTimeout(function () {
          if (!first.moved) { placeHint(); hint.classList.add("is-visible"); }
        }, 2000);
      } else hideHint();
    }, { threshold: 0.6 }).observe(footer);
  }
  first.el.addEventListener("pointerdown", hideHint);
})();
