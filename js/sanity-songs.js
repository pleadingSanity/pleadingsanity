// Sanity's Songs. The YouTube player lives on this shell page.
// Pages underneath load in an iframe, so moving around the house does not
// destroy the player. YouTube does not allow lock-screen or car playback.

const MUSIC_LIST = "PLTPhGvqiR_c-RxcDAFOcFAbgXRHgqEs2C";
let player = null;
let tracks = [];
let index = 0;

function safePage(raw) {
  try {
    const url = new URL(raw || "/", location.origin);
    if (url.origin !== location.origin) return "/";
    if (url.pathname === "/sanity-songs.html" || url.pathname.startsWith("/sanity-songs")) return "/";
    return url.pathname + url.search;
  } catch {
    return "/";
  }
}

function loadApi() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("yt-slot", {
    host: "https://www.youtube-nocookie.com",
    width: "320",
    height: "180",
    playerVars: {
      listType: "playlist",
      list: MUSIC_LIST,
      rel: 0,
      playsinline: 1,
      origin: location.origin,
      modestbranding: 1
    },
    events: {
      onStateChange(event) {
        const status = document.getElementById("song-status");
        if (!status) return;
        if (event.data === YT.PlayerState.PLAYING) status.textContent = "Playing. It will stop if you lock the phone. That is a YouTube limit.";
        if (event.data === YT.PlayerState.ENDED) playNext();
      }
    }
  });
};

function playId(id) {
  if (!player || !player.loadVideoById) return;
  player.loadVideoById(id);
}

function playNext() {
  if (!tracks.length) return;
  index = (index + 1) % tracks.length;
  playId(tracks[index].id);
  mark();
}

function mark() {
  document.querySelectorAll("[data-song]").forEach((btn) => {
    const on = btn.dataset.song === tracks[index]?.id;
    btn.setAttribute("aria-current", on ? "true" : "false");
  });
}

function boot(data) {
  tracks = data.tracks || [];
  const list = document.getElementById("song-list");
  const playlistBtn = document.getElementById("play-music-list");
  playlistBtn.addEventListener("click", () => {
    if (player && player.loadPlaylist) {
      player.loadPlaylist({ list: MUSIC_LIST, listType: "playlist" });
      document.getElementById("song-status").textContent = "Playing the Music playlist.";
    }
  });
  tracks.forEach((track, i) => {
    const wrap = document.createElement("div");
    wrap.className = "song-btn";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.song = track.id;
    btn.setAttribute("aria-label", "Play " + track.title + " by " + track.artist + " in the YouTube player");
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex:0 0 auto;fill:#00fff0;"><polygon points="6 4 20 12 6 20 6 4"/></svg>' +
      '<span style="flex:1 1 auto;min-width:0;text-align:left;white-space:normal;">' +
      track.artist + " — " + track.title + "</span>";
    btn.style.cssText = "display:flex;align-items:center;gap:.5rem;min-height:48px;text-align:left;";
    btn.addEventListener("click", () => {
      index = i;
      playId(track.id);
      mark();
      document.getElementById("song-status").textContent = "Playing " + track.artist + " — " + track.title + " in the YouTube player.";
    });
    const link = document.createElement("a");
    link.href = track.youtube;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "On YouTube";
    wrap.append(btn, link);
    list.appendChild(wrap);
  });
  loadApi();
  document.getElementById("house").src = safePage(new URLSearchParams(location.search).get("page"));
}

fetch("/music/songs.json")
  .then((res) => res.json())
  .then(boot)
  .catch(() => {
    document.getElementById("song-status").textContent = "The song list did not load.";
  });

/* R2 RADIO POLISH SHARD — share buttons on Sanity's Songs track list.
   Self-contained (this page may not load js/radio-share.js). Native
   Web Share with clipboard fallback + toast. Additive only. */
(function () {
  "use strict";
  try {
    var MARK = "ps-share-injected";
    var SONGS_PAGE = "https://pleadingsanity.co.uk/sanity-songs.html";
    var toastEl = null, toastTimer = null;
    function toast(msg) {
      try {
        if (!toastEl) {
          toastEl = document.createElement("div");
          toastEl.className = "ps-share-toast";
          toastEl.setAttribute("role", "status");
          toastEl.setAttribute("aria-live", "polite");
          (document.body || document.documentElement).appendChild(toastEl);
        }
        toastEl.textContent = msg;
        toastEl.classList.add("is-visible");
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, 2600);
      } catch (e) {}
    }
    function shareTrack(title, artist, url) {
      var text = "Listen on Pleading Sanity Insane Radio" + (artist ? " · " + artist : "") + " — " + title;
      var data = { title: title, text: text, url: url || SONGS_PAGE };
      function copyFallback() {
        var payload = data.text + "\n" + data.url;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(payload).then(function () { toast("Link copied to clipboard — paste anywhere."); })
            .catch(function () { legacyCopy(payload); });
        } else { legacyCopy(payload); }
      }
      function legacyCopy(t) {
        try {
          var ta = document.createElement("textarea");
          ta.value = t; ta.setAttribute("readonly", "");
          ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
          (document.body || document.documentElement).appendChild(ta);
          ta.select();
          var ok = false;
          try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
          ta.parentNode.removeChild(ta);
          toast(ok ? "Link copied to clipboard — paste anywhere." : "Long-press to share manually.");
        } catch (e) {}
      }
      if (navigator.share) {
        var p = null;
        try { p = navigator.share(data); } catch (e) { p = Promise.reject(e); }
        if (p && p.then) { p.then(function () { toast("Shared."); }).catch(copyFallback); }
        else copyFallback();
      } else copyFallback();
    }
    function makeBtn(title, artist, ytUrl) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ps-share-btn ps-share-song";
      btn.setAttribute("aria-label", "Share " + title + (artist ? " by " + artist : ""));
      btn.title = "Share song";
      btn.innerHTML = '<span class="ps-share-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="15" height="15"><circle cx="6" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.5" cy="6" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.5" cy="18" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.3 10.8l6.9-3.6M8.3 13.2l6.9 3.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></span><span class="ps-share-label">Share</span>';
      btn.addEventListener("click", function (e) {
        e.stopPropagation(); e.preventDefault();
        shareTrack(title, artist, ytUrl || SONGS_PAGE);
      });
      return btn;
    }
    function scan() {
      var list = document.getElementById("song-list");
      if (!list) return;
      var wraps = list.querySelectorAll(".song-btn");
      for (var i = 0; i < wraps.length; i++) {
        var w = wraps[i];
        if (w.classList.contains(MARK)) continue;
        w.classList.add(MARK);
        var btn = w.querySelector("button[data-song]");
        var link = w.querySelector("a[href]");
        var title = "", artist = "", ytUrl = "";
        if (btn) {
          var txt = (btn.textContent || "").trim();
          var dash = txt.indexOf("—");
          if (dash >= 0) { artist = txt.slice(0, dash).trim(); title = txt.slice(dash + 1).trim(); }
          else title = txt;
        }
        if (link) ytUrl = link.getAttribute("href") || "";
        w.appendChild(makeBtn(title, artist, ytUrl));
      }
    }
    function boot() {
      scan();
      setInterval(scan, 1200);
      if ("MutationObserver" in window) {
        var list = document.getElementById("song-list");
        if (list) { var mo = new MutationObserver(scan); mo.observe(list, { childList: true, subtree: true }); }
      }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  } catch (e) {}
})();
