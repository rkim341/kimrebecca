/* Single source of truth for every project.
   Edit a project here and it updates everywhere it appears:
     - the home page grid            <div data-project-grid>
     - the case study header + hero  <header data-project-header> / <div data-project-hero>
     - "Other case studies" cards    <div data-project-more>
   A case study page says which project it is with <body data-project="slug">.
   See DESIGN.md for the full design system. */

var PROJECTS = [
  {
    slug: "georgia-tech",
    href: "georgia-tech.html",
    title: "0->1 Official Georgia Tech App for 50K+",
    desc: "Lead design for the official Georgia Tech App, combining five apps into one app",
    tags: [{ label: "UXD", accent: true }, { label: "Lead UX Designer" }, { label: "Beta" }],
    image: { src: "assets/gatech/gatech.hero.jpg", alt: "Official Georgia Tech App on a phone", width: 1800, height: 1013 }
  },
  {
    slug: "jotdown",
    href: "jotdown.html",
    title: "Lead of Design for 0→1 Development",
    desc: "AI-Powered Smart Notes with Semantic Search and Category Visualization",
    tags: [{ label: "UXD", accent: true }, { label: "Sr UX Designer" }, { label: "Dev + Design" }],
    image: { src: "assets/jotdown/jotdown.mock.jpg", alt: "Jotdown app mockup", width: 1800, height: 1013 }
  },
  {
    slug: "apm-season",
    href: "apm-season.html",
    title: "Turning Data into 3 New Features and a Redesign",
    desc: "APM Season monetization and job portal redesign, a pro-bono project with Product@GT",
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

  function tags(project) {
    var wrap = el("div", "tags");
    project.tags.forEach(function (t) {
      wrap.appendChild(el("span", t.accent ? "tag tag--teal" : "tag", t.label));
    });
    return wrap;
  }

  function card(project) {
    var a = el("a", "card");
    a.href = project.href;
    var media = el("div", "card__media");
    media.appendChild(img(project.image, true));
    var body = el("div", "card__body");
    body.appendChild(el("h3", "card__title", project.title));
    body.appendChild(el("p", "card__desc", project.desc));
    body.appendChild(tags(project));
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

  // Case study: every project except this one.
  document.querySelectorAll("[data-project-more]").forEach(function (grid) {
    PROJECTS.forEach(function (p) { if (p.slug !== current) grid.appendChild(card(p)); });
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
