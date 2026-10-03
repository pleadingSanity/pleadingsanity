import { api, loadMe, esc } from "/js/auth.js";
const KEY = "ps-circle";
const me = await loadMe();
if (!me) document.querySelector("#gate").hidden = false;
else {
  document.querySelector("#gate").hidden = true;
  document.querySelector("#here").hidden = false;
  document.querySelector("#count").textContent = String(me.counts?.friends || 0);
}
function read() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
function paint(items) { document.querySelector("#list").innerHTML = items.slice(0, 12).map((item) => `<p class="post">${esc(item.text)}</p>`).join(""); }
paint(read());
document.querySelector("#check").addEventListener("click", async () => {
  const text = document.querySelector("#line").value.trim().slice(0, 80);
  if (!text) return;
  const items = [{ text, at: Date.now() }, ...read()].slice(0, 12);
  localStorage.setItem(KEY, JSON.stringify(items));
  paint(items);
  document.querySelector("#line").value = "";
  try {
    await api("/api/posts", { method: "POST", body: { kind: "status", body: text, truthTag: "experience" } });
    document.querySelector("#status").textContent = "Checked in. It can show on the feed once it is accepted.";
  } catch {
    document.querySelector("#status").textContent = "Checked in on this phone. The feed did not take it yet.";
  }
});
