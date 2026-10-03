import { api, loadMe, esc } from "/js/auth.js";

// Everything in the room is kept on the phone first (localStorage "ps-room"),
// then offered to the server. If the server says no, the words stay here and we say so.
const STORAGE_KEY = "ps-room";
const COLORS = ["#00fff0", "#7aa2ff", "#c9a0ff", "#ffb4d9", "#eef6ff", "#f0c36a"];
const PIC_SIZE = 256; // pictures are shrunk so they fit in phone storage

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false; // storage full or blocked (private browsing)
  }
}

const dated = (items) =>
  items
    .slice()
    .reverse()
    .map((e) => `<div class="post"><p class="note">${esc(new Date(e.at).toLocaleDateString("en-GB"))}</p><p>${esc(e.text)}</p></div>`)
    .join("");

function shrink(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, PIC_SIZE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That picture couldn't be opened"));
    };
    img.src = url;
  });
}

async function initMyRoom() {
  const room = document.getElementById("room");
  if (!room) return;

  const me = await loadMe();
  if (!me) {
    location.replace("/login.html?next=/my-room.html");
    return;
  }

  document.getElementById("gate").style.display = "none";
  room.style.display = "block";

  const data = loadFromStorage();
  const note = document.getElementById("room-note");
  const picFile = document.getElementById("pic-file");
  const picPreview = document.getElementById("pic-preview");
  const headlineInput = document.getElementById("headline");
  const headlineDisplay = document.getElementById("headline-display");
  const songInput = document.getElementById("song");
  const songDisplay = document.getElementById("song-display");
  const swatches = document.getElementById("swatches");
  const entryInput = document.getElementById("entry");
  const entriesList = document.getElementById("entries");
  const postInput = document.getElementById("post");
  const postsList = document.getElementById("posts");

  const say = (text) => (note.textContent = text);
  const keep = (what) => (saveToStorage(data) ? "" : ` Your phone's storage is full, so the ${what} may not stay after you close this page.`);
  const offline = (error, what) =>
    `Saved on this phone only — ${error?.status === 404 ? "the server can't take this yet" : error?.message || "the server didn't answer"}. Your ${what} is safe here.`;

  const paint = (color) => {
    if (!COLORS.includes(color)) return;
    document.documentElement.style.setProperty("--room-accent", color);
    swatches?.querySelectorAll(".swatch").forEach((s) => s.setAttribute("aria-pressed", String(s.dataset.color === color)));
  };

  if (data.pic) {
    picPreview.src = data.pic;
    picPreview.style.display = "block";
  }
  if (data.headline) {
    headlineInput.value = data.headline;
    headlineDisplay.textContent = data.headline;
  }
  if (data.song) {
    songInput.value = data.song;
    songDisplay.textContent = data.song;
  }
  if (data.accent) paint(data.accent);
  if (Array.isArray(data.entries)) entriesList.innerHTML = dated(data.entries);
  if (Array.isArray(data.posts)) postsList.innerHTML = dated(data.posts);
  postInput.maxLength = 280; // one short post

  picFile?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      data.pic = await shrink(file);
      picPreview.src = data.pic;
      picPreview.style.display = "block";
      say("Picture saved on this phone." + keep("picture"));
    } catch (error) {
      say(error.message);
    }
  });

  swatches?.addEventListener("click", (e) => {
    const swatch = e.target.closest(".swatch");
    if (!swatch) return;
    data.accent = swatch.dataset.color;
    paint(data.accent);
    say("Colour saved." + keep("colour"));
  });

  document.getElementById("save-look")?.addEventListener("click", async () => {
    data.headline = headlineInput.value.trim();
    data.song = songInput.value.trim();
    headlineDisplay.textContent = data.headline || "Your room";
    songDisplay.textContent = data.song;
    const local = keep("look");
    try {
      await api("/api/profile", { method: "PATCH", body: { headline: data.headline, song: data.song, accent: data.accent || "" } });
      say("Look saved." + local);
    } catch (error) {
      say(offline(error, "look") + local);
    }
  });

  document.getElementById("save-entry")?.addEventListener("click", async () => {
    const text = entryInput.value.trim();
    if (!text) return;
    data.entries = [...(Array.isArray(data.entries) ? data.entries : []), { text, at: Date.now() }];
    const local = keep("entry");
    entryInput.value = "";
    entriesList.innerHTML = dated(data.entries);
    try {
      await api("/api/journal", { method: "POST", body: { body: text } });
      say("Saved to your private journal." + local);
    } catch (error) {
      say(offline(error, "entry") + local);
    }
  });

  document.getElementById("share")?.addEventListener("click", async () => {
    const text = postInput.value.trim().slice(0, 280);
    if (!text) return;
    data.posts = [...(Array.isArray(data.posts) ? data.posts : []), { text, at: Date.now() }];
    const local = keep("post");
    postInput.value = "";
    postsList.innerHTML = dated(data.posts);
    try {
      const res = await api("/api/posts", { method: "POST", body: { kind: "text", body: text } });
      const support = res?.crisis ? " If you're struggling right now: Samaritans 116 123 · text SHOUT to 85258." : "";
      say((res?.pending ? "Shared — it shows on the feed once a guardian has had a look." : "Shared on the feed.") + support + local);
    } catch (error) {
      say(offline(error, "post") + local);
    }
  });
}

initMyRoom();
