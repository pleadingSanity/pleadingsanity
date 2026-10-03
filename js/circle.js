import { api, loadMe, esc } from "/js/auth.js";
const KEY = "ps-circle";
const LIGHT = "ps-possy-light";
const me = await loadMe();
const lightEl = document.querySelector("#light");
function light() { return Number(localStorage.getItem(LIGHT) || 0); }
function showLight() { if (lightEl) lightEl.textContent = `Your light: ${light()} possies given.`; }
if (!me) document.querySelector("#gate").hidden = false;
else {
  document.querySelector("#gate").hidden = true;
  document.querySelector("#here").hidden = false;
  document.querySelector("#count").textContent = String(me.counts?.friends || 0);
  showLight();
}
function read() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
function paint(items) {
  document.querySelector("#list").innerHTML = items.slice(0, 12).map((item, i) => `
    <div class="post">
      <p>${esc(item.text)}</p>
      <p class="note">Possy ${item.possy || 0}</p>
      <button type="button" data-possy="${i}">Possy</button>
      <button type="button" data-neggy="${i}">Neggy</button>
    </div>`).join("");
}
paint(read());
document.querySelector("#list").addEventListener("click", async (e) => {
  const possy = e.target.dataset.possy;
  const neggy = e.target.dataset.neggy;
  const items = read();
  if (possy != null) {
    items[possy].possy = (items[possy].possy || 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(items));
    localStorage.setItem(LIGHT, String(light() + 1));
    paint(items);
    showLight();
    document.querySelector("#status").textContent = light() >= 5 ? "Light mark: five possies. That is the reward for now — a mark, not money." : "Possy given.";
    try { await api("/api/reactions", { method: "POST", body: { kind: "possy", text: items[possy].text } }); } catch { /* phone keeps it */ }
  }
  if (neggy != null) {
    items[neggy].neggy = (items[neggy].neggy || 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(items));
    document.querySelector("#status").textContent = "Neggy kept private. It is care, not a public count.";
    try { await api("/api/reactions", { method: "POST", body: { kind: "neggy", text: items[neggy].text, private: true } }); } catch { /* phone keeps it */ }
  }
});
document.querySelector("#check").addEventListener("click", async () => {
  const text = document.querySelector("#line").value.trim().slice(0, 80);
  if (!text) return;
  const items = [{ text, at: Date.now(), possy: 0, neggy: 0 }, ...read()].slice(0, 12);
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
