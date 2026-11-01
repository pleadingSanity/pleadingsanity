// Pleading Sanity Music. Playback stays alive for this document only.
// Leaving the page for another house page stops the song. That is a limit of
// the multi-page site, so this page is its own installable app.

import { nextIndex, previousIndex, sessionArtwork } from "/netlify/lib/music-core.js";

const audio = () => document.getElementById("track");

export function describeEmpty(needsSongs) {
  return needsSongs
    ? "No songs yet. Shane adds his own from the Creators hub. Nothing here is filled in with other people's music."
    : "";
}

function boot() {
  if (typeof document === "undefined") return;
  const el = audio();
  if (!el) return;
  const title = document.getElementById("now-title");
  const artist = document.getElementById("now-artist");
  const list = document.getElementById("playlist");
  const empty = document.getElementById("empty-note");
  const seek = document.getElementById("seek");
  const playBtn = document.getElementById("play");
  const status = document.getElementById("player-status");
  let tracks = [];
  let index = -1;
  let repeat = "off";
  let shuffle = false;
  const queue = [];

  function say(text) { if (status) status.textContent = text; }

  function render() {
    list.replaceChildren();
    tracks.forEach((track, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "song" + (i === index ? " on" : "");
      btn.textContent = track.title + " · " + (track.artist || "Shane Cooper");
      btn.setAttribute("aria-current", i === index ? "true" : "false");
      btn.addEventListener("click", () => start(i));
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function session() {
    const track = tracks[index];
    if (!track || !navigator.mediaSession) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist || "Shane Cooper",
      album: "Pleading Sanity Music",
      artwork: sessionArtwork(location.origin),
    });
    navigator.mediaSession.playbackState = el.paused ? "paused" : "playing";
  }

  async function cacheTrack(track) {
    if (!("caches" in window) || !track.src.startsWith("/")) return;
    try {
      const cache = await caches.open("ps-music-tracks");
      const hit = await cache.match(track.src);
      if (!hit) {
        const res = await fetch(track.src);
        if (res.ok) await cache.put(track.src, res.clone());
      }
    } catch { /* offline cache is optional */ }
  }

  async function start(i) {
    if (!tracks.length || i < 0 || i >= tracks.length) return;
    index = i;
    const track = tracks[i];
    title.textContent = track.title;
    artist.textContent = track.artist || "Shane Cooper";
    el.src = track.src;
    try { await el.play(); say("Playing " + track.title); }
    catch { say("Tap play to start. The phone has to allow sound."); }
    playBtn.setAttribute("aria-pressed", el.paused ? "false" : "true");
    playBtn.querySelector("span").textContent = el.paused ? "Play" : "Pause";
    render();
    session();
    cacheTrack(track);
  }

  function step(dir) {
    const mode = { shuffle, repeat };
    const next = dir < 0 ? previousIndex(index, tracks.length, repeat) : nextIndex(index, tracks.length, mode, Math.random);
    if (queue.length && dir > 0) { start(queue.shift()); return; }
    if (next < 0) { el.pause(); say("End of the list."); session(); return; }
    start(next);
  }

  playBtn.addEventListener("click", () => {
    if (!tracks.length) { say(empty.textContent); return; }
    if (index < 0) { start(0); return; }
    if (el.paused) el.play(); else el.pause();
  });
  document.getElementById("prev").addEventListener("click", () => step(-1));
  document.getElementById("next").addEventListener("click", () => step(1));
  document.getElementById("shuffle").addEventListener("click", (event) => {
    shuffle = !shuffle;
    event.currentTarget.setAttribute("aria-pressed", shuffle ? "true" : "false");
  });
  document.getElementById("repeat").addEventListener("click", (event) => {
    repeat = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
    event.currentTarget.querySelector("span").textContent = repeat === "off" ? "Repeat" : repeat === "all" ? "Repeat all" : "Repeat one";
    event.currentTarget.setAttribute("aria-pressed", repeat === "off" ? "false" : "true");
  });
  seek.addEventListener("input", () => {
    if (!el.duration) return;
    el.currentTime = (Number(seek.value) / 1000) * el.duration;
  });
  el.addEventListener("timeupdate", () => {
    if (!el.duration) return;
    seek.value = String(Math.round((el.currentTime / el.duration) * 1000));
  });
  el.addEventListener("play", () => { playBtn.querySelector("span").textContent = "Pause"; playBtn.setAttribute("aria-pressed", "true"); session(); });
  el.addEventListener("pause", () => { playBtn.querySelector("span").textContent = "Play"; playBtn.setAttribute("aria-pressed", "false"); session(); });
  el.addEventListener("ended", () => step(1));

  if (navigator.mediaSession) {
    navigator.mediaSession.setActionHandler("play", () => el.play());
    navigator.mediaSession.setActionHandler("pause", () => el.pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => step(-1));
    navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) el.currentTime = details.seekTime;
    });
  }

  document.getElementById("queue-add").addEventListener("click", () => {
    if (index < 0) return;
    queue.push(index);
    say("Queued " + tracks[index].title);
  });

  const installBtn = document.getElementById("install-music");
  let promptEvent = null;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    promptEvent = event;
    installBtn.hidden = false;
  });
  if (ios) installBtn.hidden = false;
  installBtn.addEventListener("click", async () => {
    if (!promptEvent) {
      say(ios ? "In Safari, tap Share, then Add to Home Screen." : "Open the browser menu and choose Install app, if it is offered.");
      return;
    }
    promptEvent.prompt();
    promptEvent = null;
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/music/sw.js", { scope: "/music/" }).catch(() => {});
  }

  Promise.all([
    fetch("/music/tracks.json").then((res) => res.json()).catch(() => ({ tracks: [] })),
    fetch("/api/music").then((res) => res.json()).catch(() => ({ tracks: [], needsSongs: true, note: "" })),
  ]).then(([repo, live]) => {
    const seen = new Set();
    tracks = [...(repo.tracks || []), ...(live.tracks || [])].filter((track) => {
      if (!track || !track.src || !track.title || String(track.src).includes("cosmic-healing")) return false;
      if (seen.has(track.src)) return false;
      seen.add(track.src);
      return true;
    });
    const needs = tracks.length === 0;
    empty.textContent = needs ? (live.note || describeEmpty(true)) : "";
    render();
    if (needs) say("No songs yet.");
  });
}

boot();
