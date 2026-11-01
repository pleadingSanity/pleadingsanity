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
    btn.textContent = track.artist + " — " + track.title;
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
