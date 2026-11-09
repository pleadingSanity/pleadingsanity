/* Insane Solar chat. The server owns the knowledge and the provider chain.
   Lead-gate: name + mobile captured before the AI answers (once per device). */
(function () {
  var LEAD_KEY = "solarLead";
  var form = document.querySelector("[data-solar-ask]");
  var box = document.getElementById("ai-chat-messages") || document.getElementById("solar-ask-log");
  var input = document.getElementById("ai-chat-input") || document.getElementById("solar-ask-input");
  var leadgate = document.getElementById("ai-chat-leadgate");
  var inputrow = document.getElementById("ai-chat-inputrow");
  if (!input || !box) return;

  function add(className, text) {
    var line = document.createElement("div");
    line.className = className;
    line.textContent = text;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
    return line;
  }

  function leadOk() {
    try { return JSON.parse(localStorage.getItem(LEAD_KEY)); } catch (e) { return null; }
  }

  function showInput() {
    if (leadgate) leadgate.style.display = "none";
    if (inputrow) inputrow.style.display = "flex";
  }

  function captureLead() {
    var nameEl = document.getElementById("ai-lead-name");
    var phoneEl = document.getElementById("ai-lead-phone");
    var err = document.getElementById("ai-lead-err");
    var name = (nameEl ? nameEl.value : "").trim();
    var phone = (phoneEl ? phoneEl.value : "").trim();
    var digits = phone.replace(/\D/g, "");
    if (!name) { if (err) { err.textContent = "Pop your name in so Shane knows who to call."; err.style.display = "block"; } if (nameEl) nameEl.focus(); return; }
    if (digits.length < 10) { if (err) { err.textContent = "Pop a real mobile number in — Shane needs it to call you back."; err.style.display = "block"; } if (phoneEl) phoneEl.focus(); return; }
    if (err) err.style.display = "none";
    try { localStorage.setItem(LEAD_KEY, JSON.stringify({ name: name, phone: phone, t: Date.now() })); } catch (e) {}
    // Fire the lead to Shane via Netlify Forms (non-blocking)
    try {
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ "form-name": "solar-chat-lead", "name": name, "phone": phone, "source": "insane-solar-chat" })
      }).catch(function () {});
    } catch (e) {}
    showInput();
    var g = document.createElement("div");
    g.textContent = "Cheers " + name + " — ask me anything solar. If it turns into a quote, Shane will call " + phone + " back.";
    g.style.cssText = "background:rgba(0,255,240,.1);padding:8px 12px;border-radius:12px;margin-bottom:8px;line-height:1.45;";
    box.appendChild(g);
    box.scrollTop = box.scrollHeight;
    try { input.focus(); } catch (e) {}
  }

  // Returning visitor — skip the gate
  if (leadOk()) showInput();

  var submitBtn = document.getElementById("ai-lead-submit");
  if (submitBtn) submitBtn.addEventListener("click", captureLead);
  ["ai-lead-name", "ai-lead-phone"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); captureLead(); } });
  });

  function ask(text) {
    if (!leadOk()) { if (submitBtn) submitBtn.click(); return; } // safety: never answer without lead
    var message = String(text || "").trim();
    if (!message) return;
    add("ai-user", message);
    input.value = "";
    input.disabled = true;
    var pending = add("ai-msg", "Thinking…");
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 22000);
    fetch("/api/solar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message }),
      signal: controller.signal,
    }).then(function (response) {
      return response.json().then(function (data) { return { ok: response.ok, data: data }; });
    }).then(function (result) {
      var reply = result.data && (result.data.reply || result.data.error);
      pending.textContent = reply || "The solar desk is quiet. Call 07999 899304 or WhatsApp 447711147663.";
    }).catch(function () {
      pending.textContent = "The solar desk is quiet. Call 07999 899304 or WhatsApp 447711147663.";
    }).finally(function () {
      clearTimeout(timer);
      input.disabled = false;
      try { input.focus(); } catch (e) {}
    });
  }
  window.sendAiChat = function () { ask(input.value); };
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") { event.preventDefault(); ask(input.value); }
  });
  if (form) form.addEventListener("submit", function (event) { event.preventDefault(); ask(input.value); });
  var send = document.querySelector("[data-solar-send]");
  if (send) send.addEventListener("click", function () { ask(input.value); });
})();
