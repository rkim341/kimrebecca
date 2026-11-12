/* Builds the sticky progress rail from every <section data-nav="Label">
   and highlights the section that is currently in view. */
(function () {
  var rail = document.querySelector(".cs-progress");
  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  if (!rail || !sections.length) return;

  var list = document.createElement("ol");
  var links = sections.map(function (section, i) {
    if (!section.id) section.id = "section-" + (i + 1);
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#" + section.id;
    a.textContent = section.getAttribute("data-nav");
    li.appendChild(a);
    list.appendChild(li);
    return a;
  });
  var fill = document.createElement("span");
  fill.className = "cs-progress__fill";
  fill.setAttribute("aria-hidden", "true");
  list.appendChild(fill);
  rail.appendChild(list);

  var main = document.querySelector(".cs") || document.body;

  function setCurrent(index) {
    links.forEach(function (a, i) {
      if (i === index) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  // 0 at the top of the case study, 1 when its end reaches the bottom of the screen.
  function setProgress() {
    var rect = main.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    var p = total > 0 ? -rect.top / total : 1;
    p = Math.max(0, Math.min(1, p));
    list.style.setProperty("--progress", p.toFixed(4));
  }

  function update() {
    setProgress();
    var line = window.innerHeight * 0.3;
    var current = 0;
    sections.forEach(function (s, i) {
      if (s.getBoundingClientRect().top <= line) current = i;
    });
    setCurrent(current);
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
