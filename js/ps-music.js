// Soft music — an optional, free player for the house playlist.
// Put the playlist link in data-playlist on <div data-ps-music>. Spotify links
// become an embed; any other link (Amazon Music, etc.) stays a plain link.
// No autoplay. Nothing from the player loads until the visitor taps Open.
// Sits in the page flow, so it never covers text. No account needed here.
(function () {
  const box = document.querySelector("[data-ps-music]");
  if (!box) return;
  const link = (box.dataset.playlist || "").trim();
  const extra = (box.dataset.link || "").trim();
  if (!link && !extra) return; // Nothing set yet: stay hidden.

  const spotify = link.match(/^https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|artist|track)\/([A-Za-z0-9]+)/);
  box.hidden = false;
  box.classList.add("ps-music");
  box.innerHTML =
    '<p class="ps-music-title"> Soft music <span>· free, optional, never plays by itself</span></p>' +
    '<div class="ps-music-row"></div><div class="ps-music-frame" hidden></div>';
  const row = box.querySelector(".ps-music-row");
  const frame = box.querySelector(".ps-music-frame");

  const addLink = (href, text) => {
    const a = document.createElement("a");
    a.href = href; a.target = "_blank"; a.rel = "noopener"; a.className = "ps-music-btn"; a.textContent = text;
    row.appendChild(a);
  };

  if (spotify) {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "ps-music-btn"; btn.setAttribute("aria-expanded", "false");
    btn.textContent = "Open player";
    btn.addEventListener("click", () => {
      const open = frame.hidden;
      if (open && !frame.firstChild) {
        const f = document.createElement("iframe");
        f.src = "https://open.spotify.com/embed/" + spotify[1] + "/" + spotify[2] + "?utm_source=generator&theme=0";
        f.title = "Pleading Sanity playlist";
        f.loading = "lazy";
        f.allow = "clipboard-write; encrypted-media; fullscreen; picture-in-picture";
        frame.appendChild(f);
      }
      // Closing removes the embed, so the music always stops.
      if (!open) frame.textContent = "";
      frame.hidden = !open;
      btn.textContent = open ? "Close player" : "Open player";
      btn.setAttribute("aria-expanded", String(open));
    });
    row.appendChild(btn);
  } else if (link) {
    addLink(link, "Open the playlist ");
  }
  if (extra) addLink(extra, "Listen on Amazon Music ");
})();
