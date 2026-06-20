(function () {
  "use strict";

  var DATA = { ru: window.CV_DATA_RU, en: window.CV_DATA_EN };
  var STORE_LANG = "cv-lang";
  var STORE_THEME = "cv-theme";

  var root = document.getElementById("cv-root");
  var langButtons = Array.prototype.slice.call(document.querySelectorAll(".lang-btn"));
  var themeToggle = document.querySelector(".theme-toggle");
  var downloadBtn = document.getElementById("download-btn");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // -------- icons --------
  var ICONS = {
    email:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.3-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H10z"/></svg>',
    globe:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/></svg>',
  };

  // -------- render --------
  function render(lang) {
    var d = DATA[lang];
    if (!d) return;
    var S = d.ui.sections;
    var html = "";

    // header
    html += '<header class="cv-header">';
    html += '<div class="cv-photo"><img src="assets/photo.jpg" alt="' + esc(d.header.name) + '" /></div>';
    html += '<div class="cv-header-main">';
    html += '<h1>' + esc(d.header.name) + "</h1>";
    html += '<p class="role">' + esc(d.header.role) + "</p>";
    html += '<p class="role-sub">' + esc(d.header.roleSub) + "</p>";
    html += '<p class="tagline">' + esc(d.header.tagline) + "</p>";
    html += '<p class="open-badge"><span class="badge-dot" aria-hidden="true">&#9679;</span>' + esc(d.ui.openToWork) + "</p>";
    html += '<p class="location">' + esc(d.header.location) + "</p>";
    html += '<ul class="contacts">';
    d.header.contacts.forEach(function (c) {
      var icon = ICONS[c.icon] || "";
      html +=
        '<li><a href="' + esc(c.href) + '"' +
        (/^https?:/.test(c.href) ? ' target="_blank" rel="noopener"' : "") +
        ">" + icon + "<span>" + esc(c.value) + "</span></a></li>";
    });
    html += "</ul>";
    html += "</div>";
    html += "</header>";

    // summary (one or more paragraphs)
    var summaryParas = Array.isArray(d.summary) ? d.summary : [d.summary];
    var summaryHtml = summaryParas
      .map(function (p) { return '<p class="summary">' + esc(p) + "</p>"; })
      .join("");
    html += section(S.summary, summaryHtml);

    // competencies
    var comp = '<div class="grid grid-2">';
    d.competencies.forEach(function (c) {
      comp += '<div class="card"><h3>' + esc(c.title) + "</h3><p>" + esc(c.text) + "</p></div>";
    });
    comp += "</div>";
    html += section(S.competencies, comp);

    // selected matters — full-width rows (title + tags left, description right)
    var matters = '<p class="section-note">' + esc(d.ui.mattersNote) + "</p>";
    matters += '<div class="matters-list">';
    d.matters.forEach(function (m) {
      matters += '<article class="matter-row">';
      matters += '<div class="m-head"><h3>' + esc(m.title) + "</h3>";
      matters += '<div class="tags small">';
      (m.tags || []).forEach(function (t) {
        matters += '<span class="tag">' + esc(t) + "</span>";
      });
      matters += "</div></div>";
      matters += '<div class="m-body"><p>' + esc(m.text) + "</p></div>";
      matters += "</article>";
    });
    matters += "</div>";
    html += section(S.matters, matters);

    // experience
    function expBody(o) {
      var b = "";
      if (o.bullets && o.bullets.length) {
        b += "<ul>";
        o.bullets.forEach(function (x) { b += "<li>" + esc(x) + "</li>"; });
        b += "</ul>";
      }
      if (o.achievements && o.achievements.length) {
        b += '<p class="ach-label">' + esc(S.achievements) + "</p>";
        b += '<ul class="achievements">';
        o.achievements.forEach(function (x) { b += "<li>" + esc(x) + "</li>"; });
        b += "</ul>";
      }
      return b;
    }

    var exp = '<div class="timeline">';
    d.experience.forEach(function (e) {
      exp += '<div class="exp">';
      exp += '<div class="exp-head"><div><h3>' + esc(e.company) + "</h3>";
      if (!e.roles) exp += '<p class="exp-role">' + esc(e.role) + "</p>";
      exp += '</div><span class="period">' + esc(e.period) + "</span></div>";
      if (e.companyNote) exp += '<p class="exp-note">' + esc(e.companyNote) + "</p>";
      if (e.concurrent) exp += '<p class="exp-concurrent">' + esc(e.concurrent) + "</p>";

      if (e.roles) {
        e.roles.forEach(function (r) {
          exp += '<div class="exp-subrole">';
          exp += '<div class="exp-head"><p class="exp-role">' + esc(r.role) + "</p>";
          exp += '<span class="period">' + esc(r.period) + "</span></div>";
          exp += expBody(r);
          exp += "</div>";
        });
      } else {
        exp += expBody(e);
      }
      exp += "</div>";
    });
    exp += "</div>";
    html += section(S.experience, exp);

    // education
    var edu = '<ul class="plain-list">';
    d.education.forEach(function (e) {
      edu +=
        '<li><span class="li-main">' + esc(e.degree) + "</span>" +
        '<span class="li-sub">' + esc(e.institution) + " · " + esc(e.year) + "</span></li>";
    });
    edu += "</ul>";
    html += section(S.education, edu);

    // languages
    var lng = '<ul class="plain-list">';
    d.languages.forEach(function (l) {
      lng +=
        '<li><span class="li-main">' + esc(l.name) + "</span>" +
        '<span class="li-sub">' + esc(l.level) + "</span></li>";
    });
    lng += "</ul>";
    html += section(S.languages, lng);

    root.innerHTML = html;

    // page chrome
    document.documentElement.lang = d.meta.lang;
    document.title = d.meta.title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", d.meta.description);
    setSlot("print-label", d.ui.downloadPdf);
    setSlot("source-label", d.ui.sourceOnGitHub);

    langButtons.forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function section(title, inner) {
    return '<section class="section"><h2>' + esc(title) + "</h2>" + inner + "</section>";
  }

  function setSlot(name, value) {
    var el = document.querySelector('[data-slot="' + name + '"]');
    if (el) el.textContent = value;
  }

  // -------- state --------
  function pickLang() {
    var saved = localStorage.getItem(STORE_LANG);
    if (saved === "ru" || saved === "en") return saved;
    return (navigator.language || "ru").toLowerCase().indexOf("ru") === 0 ? "ru" : "en";
  }

  function setLang(lang) {
    localStorage.setItem(STORE_LANG, lang);
    render(lang);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORE_THEME, theme);
  }

  // -------- init --------
  var savedTheme = localStorage.getItem(STORE_THEME);
  setTheme(savedTheme === "dark" ? "dark" : "light");
  setSlot("year", String(new Date().getFullYear()));

  langButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      setLang(b.getAttribute("data-lang"));
    });
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      setTheme(cur === "dark" ? "light" : "dark");
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      window.print();
    });
  }

  render(pickLang());
})();
