// Click-to-load YouTube on the About page only. No autoplay.
(function () {
  document.querySelectorAll(".yt-facade").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-yt");
      if (!/^[A-Za-z0-9_-]{11}$/.test(id || "")) return;
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?rel=0&autoplay=0";
      frame.title = btn.getAttribute("data-title") || "Video";
      frame.width = "640";
      frame.height = "360";
      frame.loading = "lazy";
      frame.setAttribute("allowfullscreen", "");
      frame.allow = "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      btn.replaceWith(frame);
    });
  });
})();
