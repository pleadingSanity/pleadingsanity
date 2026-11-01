/* Insane Solar chat. The server owns the knowledge and the provider chain. */
(function () {
  var form = document.querySelector("[data-solar-ask]");
  var box = document.getElementById("ai-chat-messages") || document.getElementById("solar-ask-log");
  var input = document.getElementById("ai-chat-input") || document.getElementById("solar-ask-input");
  if (!input || !box) return;

  function add(className, text) {
    var line = document.createElement("div");
    line.className = className;
    line.textContent = text;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
    return line;
  }

  function ask(text) {
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
