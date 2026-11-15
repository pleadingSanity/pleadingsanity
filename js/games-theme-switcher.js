// Additive only. Optional theme switcher for games. Nothing removed.
// Evolution Not Erasure.
(function () {
  if (document.getElementById("ps-theme-bar")) return;
  const bar = document.createElement("div");
  bar.id = "ps-theme-bar";
  bar.className = "theme-bar";
  bar.setAttribute("role", "group");
  bar.setAttribute("aria-label", "Optional game themes");
  const themes = [
    { id: "cosmic", label: "Cosmic" },
    { id: "gold", label: "Gold" },
    { id: "night", label: "Night" },
    { id: "cozy", label: "Cozy" },
    { id: "nebula", label: "Nebula" },
    { id: "aurora", label: "Aurora" }
  ];
  themes.forEach(t => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = t.label;
    btn.dataset.theme = t.id;
    btn.style.minHeight = "48px";
    btn.addEventListener("click", () => {
      document.body.className = document.body.className.replace(/\btheme-\w+\b/g, "").trim();
      document.body.classList.add("theme-" + t.id);
      localStorage.setItem("ps-game-theme", t.id);
      bar.querySelectorAll("button").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
    });
    bar.appendChild(btn);
  });
  const intro = document.querySelector(".intro");
  if (intro) intro.parentNode.insertBefore(bar, intro.nextSibling);
  const saved = localStorage.getItem("ps-game-theme");
  if (saved) {
    document.body.classList.add("theme-" + saved);
    const active = bar.querySelector(`[data-theme="${saved}"]`);
    if (active) active.classList.add("on");
  }
})();
