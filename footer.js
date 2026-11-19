/* Draggable, tossable logo that bounces inside the footer. */
(function () {
  var footer = document.querySelector(".footer");
  if (!footer) return;

  var SIZE = 40, BOUNCE = 0.8, FRICTION = 0.995, STOP = 0.05;
  var logo = document.createElement("img");
  logo.src = "assets/images/rk.logo.big.png";
  logo.alt = "RK logo";
  logo.className = "footer__logo";
  logo.draggable = false;
  footer.appendChild(logo);

  var x = 0, y = 0, vx = 0, vy = 0, placed = false;
  var dragging = false, offX = 0, offY = 0, raf = null, last = 0, hist = [];

  function bounds() {
    return { w: footer.clientWidth - SIZE, h: footer.clientHeight - SIZE };
  }
  function render() {
    logo.style.transform = "translate(" + x + "px," + y + "px)";
  }
  function place() {
    var b = bounds();
    x = b.w / 2; y = b.h / 2; // starts centered, on top of the text
    placed = true;
    render();
  }
  function clamp() {
    var b = bounds();
    if (x < 0) { x = 0; vx = Math.abs(vx) * BOUNCE; }
    else if (x > b.w) { x = b.w; vx = -Math.abs(vx) * BOUNCE; }
    if (y < 0) { y = 0; vy = Math.abs(vy) * BOUNCE; }
    else if (y > b.h) { y = b.h; vy = -Math.abs(vy) * BOUNCE; }
  }
  function step(t) {
    var dt = Math.min((t - last) / 16.67, 3);
    last = t;
    x += vx * dt; y += vy * dt;
    clamp();
    var f = Math.pow(FRICTION, dt);
    vx *= f; vy *= f;
    render();
    if (Math.abs(vx) < STOP && Math.abs(vy) < STOP) { raf = null; return; }
    raf = requestAnimationFrame(step);
  }
  function startLoop() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  }

  logo.addEventListener("pointerdown", function (e) {
    if (!placed) place();
    dragging = true;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    vx = vy = 0;
    var r = footer.getBoundingClientRect();
    offX = e.clientX - r.left - x;
    offY = e.clientY - r.top - y;
    hist = [{ t: performance.now(), x: x, y: y }];
    logo.setPointerCapture(e.pointerId);
    logo.classList.add("is-dragging");
    e.preventDefault();
  });
  logo.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var r = footer.getBoundingClientRect(), b = bounds();
    x = Math.max(0, Math.min(b.w, e.clientX - r.left - offX));
    y = Math.max(0, Math.min(b.h, e.clientY - r.top - offY));
    var now = performance.now();
    hist.push({ t: now, x: x, y: y });
    while (hist.length > 2 && now - hist[0].t > 100) hist.shift();
    render();
  });
  function release() {
    if (!dragging) return;
    dragging = false;
    logo.classList.remove("is-dragging");
    var a = hist[0], z = hist[hist.length - 1], dt = (z.t - a.t) / 16.67;
    if (dt > 0 && performance.now() - z.t < 100) {
      vx = (z.x - a.x) / dt; vy = (z.y - a.y) / dt;
    }
    startLoop();
  }
  logo.addEventListener("pointerup", release);
  logo.addEventListener("pointercancel", release);

  window.addEventListener("resize", function () {
    if (!placed) return;
    clamp(); render();
  });

  place();
})();
