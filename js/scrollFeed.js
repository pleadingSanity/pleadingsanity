/* Pleading Sanity — scrollFeed.js. Order stays as written. Possy is a lift, not a rank. */
(function () {
  const DEFAULT_URLS = ["/content/content_feed.json", "/content_feed.json"];
  const PAGE_SIZE = 4;
  function escapeHTML(s) { return String(s || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
  function safeUrl(u) { try { const url = new URL(u, location.href); return url.protocol === "https:" || url.protocol === "http:" ? url.href : ""; } catch (_) { return ""; } }
  async function fetchFirstAvailable(urls) {
    for (const u of urls) { try { const res = await fetch(u, { cache: "no-cache" }); if (res.ok) return await res.json(); } catch (e) {} }
    throw new Error("No feed JSON found");
  }
  function uniqueByUrl(items) {
    const seen = new Set();
    return items.filter((it) => { const key = (it.url || it.title || "").trim(); if (!key || seen.has(key)) return false; seen.add(key); return true; });
  }
  function ytIdFromUrl(u) {
    if (!u) return null;
    try { const url = new URL(u); if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) return url.searchParams.get("v"); if (url.hostname === "youtu.be") return url.pathname.replace("/", ""); } catch (_) {}
    const m = String(u).match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{6,})/); return m ? m[1] : null;
  }
  function ttIdFromUrl(u) { const m = String(u).match(/tiktok\.com\/.*video\/(\d{8,})/); return m ? m[1] : null; }
  function buildYouTubeEmbed(id, title) { return `<iframe class="ps-embed" loading="lazy" title="${escapeHTML(title)}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1"></iframe>`; }
  function buildTikTokEmbed(id, title) { return `<iframe class="ps-embed" loading="lazy" title="${escapeHTML(title)}" allow="encrypted-media; clipboard-write; fullscreen; picture-in-picture" allowfullscreen src="https://www.tiktok.com/embed/v2/${encodeURIComponent(id)}"></iframe>`; }
  function cardHTML({ title = "", url = "", thumb = "", tag = "", embedHTML = "" }) {
    const link = safeUrl(url); const img = safeUrl(thumb);
    const media = embedHTML ? `<div class="ps-media">${embedHTML}</div>` : img ? `<img class="ps-img" loading="lazy" src="${escapeHTML(img)}" alt=""/>` : "";
    return `<article class="ps-post">${media}<div class="ps-meta">${tag ? `<span class="ps-tag">${escapeHTML(tag)}</span>` : ""}<div class="ps-title">${escapeHTML(title)}</div><div class="ps-actions"><button type="button" data-possy="${escapeHTML(link || title)}">Possy</button>${link ? `<a href="${escapeHTML(link)}" target="_blank" rel="noopener noreferrer">Open</a>` : ""}</div></div></article>`;
  }
  function searchCard(keyword, tag) { return { title: keyword, tag, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}` }; }
  function normalizeItems(json) {
    let items = Array.isArray(json?.items) ? json.items.slice() : [];
    for (const cat of json?.youtube?.categories || []) for (const k of cat.keywords || []) items.push(searchCard(k, cat.name));
    for (const k of json?.youtube?.keywords || []) items.push(searchCard(k, "YouTube"));
    for (const u of json?.tiktok?.urls || []) items.push({ title: "TikTok", url: u });
    return items.map((it) => {
      const title = it.title || "", url = it.url || ""; let embedHTML = "";
      const yid = ytIdFromUrl(url); if (yid && !url.includes("/results")) embedHTML = buildYouTubeEmbed(yid, title);
      const tid = !embedHTML ? ttIdFromUrl(url) : null; if (tid) embedHTML = buildTikTokEmbed(tid, title);
      return { title, url, thumb: it.thumb || "", tag: it.tag || "", embedHTML };
    });
  }
  function mount(feedEl) {
    let allPosts = [], page = 0, sentinel, observer;
    function appendPage() {
      const slice = allPosts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
      if (!slice.length) { if (observer && sentinel) observer.unobserve(sentinel); sentinel?.remove(); return; }
      feedEl.insertAdjacentHTML("beforeend", slice.map(cardHTML).join(""));
      if (sentinel) feedEl.appendChild(sentinel); page++;
    }
    if (!feedEl.dataset.possy) {
      feedEl.dataset.possy = "on";
      feedEl.addEventListener("click", (e) => {
        const b = e.target.closest("[data-possy]"); if (!b) return;
        const n = Number(b.dataset.n || 0) + 1; b.dataset.n = String(n); b.textContent = "Possy " + n;
        localStorage.setItem("ps-possy-light", String(Number(localStorage.getItem("ps-possy-light") || 0) + 1));
      });
    }
    async function init() {
      feedEl.innerHTML = "<article class=\"ps-post\"><div class=\"ps-meta\"><div class=\"ps-title\">Loading stories…</div></div></article>";
      try { allPosts = uniqueByUrl(normalizeItems(await fetchFirstAvailable(feedEl.dataset.src ? [feedEl.dataset.src] : DEFAULT_URLS))); } catch (e) { allPosts = []; }
      feedEl.innerHTML = ""; page = 0;
      if (!allPosts.length) { feedEl.innerHTML = "<article class=\"ps-post\"><div class=\"ps-meta\"><div class=\"ps-title\">Nothing to explore right now.</div></div></article>"; return; }
      appendPage();
      if (!("IntersectionObserver" in window)) { while (page * PAGE_SIZE < allPosts.length) appendPage(); return; }
      sentinel = document.createElement("div"); sentinel.style.height = "1px"; feedEl.appendChild(sentinel);
      observer = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) appendPage(); }, { rootMargin: "480px" });
      observer.observe(sentinel);
    }
    init();
    return { reload: () => { observer?.disconnect(); init(); } };
  }
  function start() {
    const els = document.querySelectorAll("[data-scroll-feed]"); if (!els.length) return;
    const feeds = Array.from(els, mount);
    window.PSScrollFeed = { reload: () => feeds.forEach((f) => f.reload()) };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
