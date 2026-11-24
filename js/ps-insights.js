// Sanity Insights — read-only render of /api/views. No personal data shown.
(function () {
  "use strict";
  var els = {
    total: document.getElementById("ins-total"),
    today: document.getElementById("ins-today"),
    unique: document.getElementById("ins-unique"),
    list: document.getElementById("ins-pages"),
    note: document.getElementById("ins-note"),
    updated: document.getElementById("ins-updated"),
    refresh: document.getElementById("ins-refresh"),
  };

  function label(path) {
    if (path === "/" || path === "/index.html") return "Home";
    return path.replace(/^\/+|\/+$/g, "") || "Home";
  }

  function render(data) {
    if (!data) {
      els.note.textContent = "The counter is warming up. Views appear here after the first visitors.";
      return;
    }
    els.total.textContent = String(data.total ?? 0);
    els.today.textContent = String(data.today ?? 0);
    els.unique.textContent = String(data.todayUnique ?? 0);
    var pages = Array.isArray(data.pages) ? data.pages : [];
    els.list.innerHTML = "";
    if (!pages.length) {
      var empty = document.createElement("tr");
      var td = document.createElement("td");
      td.colSpan = 2;
      td.className = "insights-empty";
      td.textContent = "No page breakdown yet.";
      empty.appendChild(td);
      els.list.appendChild(empty);
    } else {
      pages.forEach(function (p) {
        var tr = document.createElement("tr");
        var a = document.createElement("td");
        a.textContent = label(p.path);
        var b = document.createElement("td");
        b.className = "num";
        b.textContent = String(p.views ?? 0);
        tr.appendChild(a);
        tr.appendChild(b);
        els.list.appendChild(tr);
      });
    }
    els.updated.textContent = data.updatedAt
      ? "Updated " + new Date(data.updatedAt).toLocaleString("en-GB")
      : "Waiting for the first beacon.";
    els.note.textContent =
      "Privacy-first: page views only. No cookies, no IP addresses, no visitor names, no ads, no third-party scripts.";
  }

  function load() {
    fetch("/api/views", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(render)
      .catch(function () { render(null); });
  }

  if (els.refresh) {
    els.refresh.addEventListener("click", function () {
      els.refresh.disabled = true;
      load();
      setTimeout(function () { els.refresh.disabled = false; }, 800);
    });
  }
  load();
})();
