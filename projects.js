/* Single source of truth for every project.
   Edit a project here and it updates everywhere it appears:
     - home, A: Grid                 <div data-project-grid>   (uses title)
     - home, B: Linear               <div data-project-list>   (uses name)
     - the case study header + hero  <header data-project-header> / <div data-project-hero>
     - "Other case studies" cards    <div data-project-more>
   A case study page says which project it is with <body data-project="slug">.
   See DESIGN.md for the full design system. */

var PROJECTS = [
  {
    slug: "georgia-tech",
    href: "georgia-tech.html",
    name: "Official Georgia Tech App",
    title: "Georgia Tech App",
    desc: "Launching the official Georgia Tech App, combining eight apps into one, all-in-one app for 50K+ students.",
    tags: [{ label: "UXD", accent: true }, { label: "Lead UX Designer" }, { label: "Beta" }],
    image: { src: "assets/gatech/gatech.hero.jpg", alt: "Official Georgia Tech App on a phone", width: 1800, height: 1013 }
  },
  {
    slug: "jotdown",
    href: "jotdown.html",
    name: "JotDown",
    title: "JotDown",
    desc: "AI-Powered Smart Note App with Semantic (natural language) Search and Category Visualization (UX Design)",
    tags: [{ label: "UXD", accent: true }, { label: "Sr UX Designer" }, { label: "Dev + Design" }],
    image: { src: "assets/jotdown/jotdown.mock.jpg", alt: "Jotdown app mockup", width: 1800, height: 1013 }
  },
  {
    slug: "apm-season",
    href: "apm-season.html",
    name: "APM Season",
    title: "APM Season",
    desc: "Monetization & Information Architecture focused Job Portal Redesign (UX Design)",
    tags: [{ label: "UX/UI", accent: true }, { label: "Design Lead" }, { label: "UX Research" }],
    image: { src: "assets/apm-season/apmseason.mock.jpg", alt: "APM Season website on two laptop screens", width: 1800, height: 1013 }
  }
];

(function () {
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function img(image, lazy) {
    var node = el("img");
    node.src = image.src;
    node.alt = image.alt;
    node.width = image.width;
    node.height = image.height;
    if (lazy) node.loading = "lazy";
    return node;
  }

  // limit: show only the first N tags (row cards show 2).
  function tags(project, limit) {
    var wrap = el("div", "tags");
    project.tags.slice(0, limit || project.tags.length).forEach(function (t) {
      wrap.appendChild(el("span", t.accent ? "tag tag--teal" : "tag", t.label));
    });
    return wrap;
  }

  // variant "row" = small thumbnail on the left, title and tags on the right
  // (no description).
  function card(project, variant) {
    var a = el("a", variant === "row" ? "card card--row" : "card");
    a.href = project.href;
    var media = el("div", "card__media");
    media.appendChild(img(project.image, true));
    var body = el("div", "card__body");
    body.appendChild(el("h3", "card__title", project.title));
    if (variant !== "row") body.appendChild(el("p", "card__desc", project.desc));
    body.appendChild(tags(project, variant === "row" ? 2 : 0));
    a.appendChild(media);
    a.appendChild(body);
    return a;
  }

  // B: Linear card: wide, short thumbnail; name + tags on one line; description below.
  function linearCard(project) {
    var a = el("a", "card card--linear");
    a.href = project.href;
    var media = el("div", "card__media");
    media.appendChild(img(project.image, true));
    var head = el("div", "card__head");
    head.appendChild(el("h3", "card__title", project.name || project.title));
    head.appendChild(tags(project));
    var body = el("div", "card__body");
    body.appendChild(head);
    body.appendChild(el("p", "card__desc", project.desc));
    a.appendChild(media);
    a.appendChild(body);
    return a;
  }

  var current = document.body.getAttribute("data-project");
  var project = PROJECTS.filter(function (p) { return p.slug === current; })[0];

  // Home page grid: every project.
  document.querySelectorAll("[data-project-grid]").forEach(function (grid) {
    PROJECTS.forEach(function (p) { grid.appendChild(card(p)); });
  });

  // Home page, B: Linear: every project.
  document.querySelectorAll("[data-project-list]").forEach(function (list) {
    PROJECTS.forEach(function (p) { list.appendChild(linearCard(p)); });
  });

  // Case study: every project except this one.
  document.querySelectorAll("[data-project-more]").forEach(function (grid) {
    PROJECTS.forEach(function (p) { if (p.slug !== current) grid.appendChild(card(p, "row")); });
  });

  if (!project) return;

  document.querySelectorAll("[data-project-header]").forEach(function (head) {
    head.appendChild(el("h1", "cs-title", project.title));
    head.appendChild(el("p", "cs-lede", project.desc));
    head.appendChild(tags(project));
  });

  document.querySelectorAll("[data-project-hero]").forEach(function (hero) {
    hero.appendChild(img(project.image, false));
  });
})();
