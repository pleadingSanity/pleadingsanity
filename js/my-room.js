import { api, loadMe, esc } from "/js/auth.js";

const STORAGE_KEY = "ps-room";
const COLORS = ["#00fff0", "#7aa2ff", "#c9a0ff", "#ffb4d9", "#eef6ff", "#f0c36a"];

function loadFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function initMyRoom() {
  const gate = document.getElementById("gate");
  const room = document.getElementById("room");

  if (!gate || !room) {
    console.warn("My room sections not found");
    return;
  }

  const me = await loadMe();

  if (!me) {
    gate.style.display = "block";
    room.style.display = "none";
    return;
  }

  gate.style.display = "none";
  room.style.display = "block";

  const data = loadFromStorage();
  const picFile = document.getElementById("pic-file");
  const picPreview = document.getElementById("pic-preview");
  const headlineInput = document.getElementById("headline");
  const headlineDisplay = document.getElementById("headline-display");
  const songInput = document.getElementById("song");
  const songDisplay = document.getElementById("song-display");
  const swatches = document.getElementById("swatches");
  const saveLookBtn = document.getElementById("save-look");
  const entryInput = document.getElementById("entry");
  const saveEntryBtn = document.getElementById("save-entry");
  const entriesList = document.getElementById("entries");
  const postInput = document.getElementById("post");
  const shareBtn = document.getElementById("share");
  const postsList = document.getElementById("posts");

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

  if (data.entries) {
    entriesList.innerHTML = data.entries
      .map(
        (e) =>
          `<div class="post"><p style="font-size:0.85rem;color:#999;">${new Date(e.at).toLocaleDateString()}</p><p>${esc(e.text)}</p></div>`
      )
      .join("");
  }

  if (data.posts) {
    postsList.innerHTML = data.posts
      .map(
        (p) =>
          `<div class="post"><p style="font-size:0.85rem;color:#999;">${new Date(p.at).toLocaleDateString()}</p><p>${esc(p.text)}</p></div>`
      )
      .join("");
  }

  if (picFile) {
    picFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          picPreview.src = ev.target.result;
          picPreview.style.display = "block";
          data.pic = ev.target.result;
          saveToStorage(data);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (swatches) {
    swatches.addEventListener("click", (e) => {
      const swatch = e.target.closest(".swatch");
      if (!swatch) return;
      const color = swatch.dataset.color;
      data.accent = color;
      saveToStorage(data);
      document.documentElement.style.setProperty("--room-accent", color);
    });
  }

  if (saveLookBtn) {
    saveLookBtn.addEventListener("click", async () => {
      data.headline = headlineInput.value || "";
      data.song = songInput.value || "";
      headlineDisplay.textContent = data.headline;
      songDisplay.textContent = data.song;
      saveToStorage(data);

      try {
        await api("PATCH", "/api/profile", {
          displayName: data.headline || me.username,
          statusText: data.song,
        });
      } catch (err) {
        console.warn("Profile save failed, keeping local:", err);
      }
    });
  }

  if (saveEntryBtn) {
    saveEntryBtn.addEventListener("click", async () => {
      const text = entryInput.value.trim();
      if (!text) return;

      const entry = { text, at: Date.now() };
      if (!data.entries) data.entries = [];
      data.entries.push(entry);
      saveToStorage(data);
      entryInput.value = "";

      entriesList.innerHTML = data.entries
        .map(
          (e) =>
            `<div class="post"><p style="font-size:0.85rem;color:#999;">${new Date(e.at).toLocaleDateString()}</p><p>${esc(e.text)}</p></div>`
        )
        .join("");

      try {
        await api("POST", "/api/journal", { body: text, source: "my-room" });
      } catch (err) {
        console.warn("Journal save failed, keeping on phone:", err);
      }
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const text = postInput.value.trim();
      if (!text) return;

      const post = { text, at: Date.now() };
      if (!data.posts) data.posts = [];
      data.posts.push(post);
      saveToStorage(data);
      postInput.value = "";

      postsList.innerHTML = data.posts
        .map(
          (p) =>
            `<div class="post"><p style="font-size:0.85rem;color:#999;">${new Date(p.at).toLocaleDateString()}</p><p>${esc(p.text)}</p></div>`
        )
        .join("");

      try {
        await api("POST", "/api/posts", {
          kind: "writing",
          body: text,
          visibility: "public",
        });
      } catch (err) {
        console.warn("Post share failed, keeping on phone:", err);
      }
    });
  }

  const installBtn = document.getElementById("install-arron");
  if (installBtn) {
    installBtn.addEventListener("click", () => {
      window.location.href = "/arron-app.html";
    });
  }
}

initMyRoom();
