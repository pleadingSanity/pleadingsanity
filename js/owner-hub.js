// Owner-only Test Lab and song upload. Hidden unless /api/me says isOwner.
import { loadMe, api } from "/js/auth.js";

const lab = document.getElementById("test-lab");
const upload = document.getElementById("song-upload");
if (lab) {
  const me = await loadMe();
  if (me?.user?.isOwner) {
    lab.hidden = false;
    if (upload) upload.hidden = false;
    boot(me).catch((error) => {
      lab.innerHTML = `<p>${error.message || "The test lab did not open."}</p>`;
    });
  }
}

function el(tag, text, attrs = {}) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function dictate(into) {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = el("button", "Speak", { type: "button" });
  if (!Rec) {
    btn.disabled = true;
    btn.textContent = "Type it";
    return btn;
  }
  btn.addEventListener("click", () => {
    const rec = new Rec();
    rec.lang = "en-GB";
    rec.onresult = (event) => {
      const said = event.results[0][0].transcript;
      into.value = (into.value ? into.value + " " : "") + said;
    };
    rec.start();
  });
  return btn;
}

async function shotFile(file) {
  if (!file) return "";
  if (file.size > 120000) throw new Error("Use a picture under 120 KB.");
  const data = await file.arrayBuffer();
  const bytes = new Uint8Array(data);
  let raw = "";
  for (const b of bytes) raw += String.fromCharCode(b);
  return `data:${file.type};base64,${btoa(raw)}`;
}

async function boot() {
  const book = await api("/api/test-lab");
  lab.replaceChildren();
  lab.append(el("h2", "Test Lab"), el("p", "Tap a test, try it, then say if it works. Only you can see this."));
  const summary = el("p", book.summary || "");
  summary.id = "lab-summary";
  summary.setAttribute("role", "status");
  lab.append(summary);
  const ask = el("button", "Ask Arron for a short summary", { type: "button" });
  ask.addEventListener("click", async () => {
    ask.disabled = true;
    try {
      const reply = await api("/api/arron/chat", { method: "POST", body: { message: "Summarise this test lab for Shane in plain words. Do not invent results.\n" + (book.summary || "") } });
      summary.textContent = reply.reply || book.summary;
    } catch {
      summary.textContent = book.summary || "Arron did not answer. The counts above are what was saved.";
    }
    ask.disabled = false;
  });
  lab.append(ask);

  for (const item of book.items || []) {
    const card = el("article", null, { class: "lab-card" });
    card.append(el("h3", item.title), el("p", item.what));
    const open = el("a", "Open it", { href: item.href, class: "lab-open" });
    if (String(item.href).startsWith("http")) open.target = "_blank";
    const notes = el("textarea", null, { "aria-label": "How " + item.title + " went", rows: "3" });
    const file = el("input", null, { type: "file", accept: "image/png,image/jpeg,image/webp", "aria-label": "Optional picture for " + item.title });
    const row = el("div", null, { class: "lab-row" });
    row.append(open);
    for (const [status, label] of [["works", "Works"], ["broken", "Broken"], ["changes", "Needs changes"]]) {
      const btn = el("button", label, { type: "button" });
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
          const saved = await api("/api/test-lab", { method: "POST", body: { action: "result", item: item.id, status, notes: notes.value, page: item.page, screenshot: await shotFile(file.files[0]) } });
          summary.textContent = saved.book?.summary || "Saved.";
        } catch (error) {
          summary.textContent = error.message;
        }
        btn.disabled = false;
      });
      row.append(btn);
    }
    card.append(row, notes, dictate(notes), file);
    lab.append(card);
  }

  const general = el("textarea", null, { "aria-label": "Anything else", rows: "3" });
  const send = el("button", "Save a general note", { type: "button" });
  send.addEventListener("click", async () => {
    try {
      const saved = await api("/api/test-lab", { method: "POST", body: { action: "feedback", notes: general.value, page: "/creator.html" } });
      summary.textContent = saved.book?.summary || "Saved.";
      general.value = "";
    } catch (error) {
      summary.textContent = error.message;
    }
  });
  lab.append(el("h3", "Anything else"), general, dictate(general), send);

  if (upload) {
    const form = upload.querySelector("form");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const res = await fetch("/api/music", { method: "POST", body: data, credentials: "same-origin" });
      const body = await res.json().catch(() => ({}));
      upload.querySelector("[data-upload-status]").textContent = res.ok ? "Saved " + (body.track?.title || "the song") + "." : (body.error || "That did not save.");
    });
  }
}
