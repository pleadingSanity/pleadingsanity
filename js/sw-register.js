if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(function (reg) {
    reg.addEventListener("updatefound", function () {
      var next = reg.installing;
      if (!next) return;
      next.addEventListener("statechange", function () {
        if (next.state === "installed" && navigator.serviceWorker.controller) {
          next.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
  }).catch(function () {});
  var reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
}
