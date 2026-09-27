/* Pleading Sanity — scrollFeed.js
 * Infinite, lazy "explore" feed (carried over from pleading-sanity-frontend).
 * - Mounts on any element with [data-scroll-feed]; optional data-src="/path.json"
 * - Loads /content/content_feed.json by default
 * - Supports { items: [{title,url,thumb,embed?}] } and
 *   { youtube: { categories: [{name, keywords[]}] } } (or a flat keywords list)
 * - YouTube + TikTok URLs become real players, everything else a link card
 * - Infinite scroll via IntersectionObserver
 * - Defensive against bad/missing data
 */

(function () {
  const DEFAULT_URLS = ["/content/content_feed.json", "/content_feed.json"];
  const PAGE_SIZE = 6; // how many posts to append per “page”
  const SKELETON_COUNT = 3;

  // ---------- helpers ----------
  function escapeHTML(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function safeUrl(u) {
    try {
      const url = new URL(u, location.href);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  async function fetchFirstAvailable(urls) {
    for (const u of urls) {
      try {
        const res = await fetch(u, { cache: "no-cache" });
        if (res.ok) return await res.json();
      } catch (e) {
        // try next
      }
    }
    throw new Error("No feed JSON found");
  }

  function uniqueByUrl(items) {
    const seen = new Set();
    return items.filter((it) => {
      const key = (it.url || it.title || "").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ---- parsers for embeds ----
  function ytIdFromUrl(u) {
    if (!u) return null;
    try {
      const url = new URL(u);
      if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
        return url.searchParams.get("v");
      }
      if (url.hostname === "youtu.be") return url.pathname.replace("/", "");
    } catch (_) {}
    const m = String(u).match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
    return m ? m[1] : null;
  }

  function ttIdFromUrl(u) {
    const m = String(u).match(/tiktok\.com\/.*video\/(\d{8,})/);
    return m ? m[1] : null;
  }

  function buildYouTubeEmbed(id, title) {
    const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1`;
    return `<iframe class="ps-embed" loading="lazy" title="${escapeHTML(title)}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen src="${src}"></iframe>`;
  }

  function buildTikTokEmbed(id, title) {
    const src = `https://www.tiktok.com/embed/v2/${encodeURIComponent(id)}`;
    return `<iframe class="ps-embed" loading="lazy" title="${escapeHTML(title)}" allow="encrypted-media; clipboard-write; fullscreen; picture-in-picture" allowfullscreen src="${src}"></iframe>`;
  }

  function cardHTML({ title = "", url = "", thumb = "", tag = "", embedHTML = "" }) {
    const link = safeUrl(url);
    const img = safeUrl(thumb);
    const media = embedHTML
      ? `<div class="ps-media">${embedHTML}</div>`
      : img ? `<img class="ps-img" loading="lazy" src="${escapeHTML(img)}" alt=""/>` : "";
    return `
    <article class="ps-post">
      ${media}
      <div class="ps-meta">
        ${tag ? `<span class="ps-tag">${escapeHTML(tag)}</span>` : ""}
        <div class="ps-title">${escapeHTML(title)}</div>
        ${link ? `<div class="ps-actions"><a href="${escapeHTML(link)}" target="_blank" rel="noopener noreferrer">Open <span class="sr-only">${escapeHTML(title)} (opens in a new tab)</span></a></div>` : ""}
      </div>
    </article>`;
  }

  function skeletonHTML() {
    return `
    <article class="ps-post ps-skeleton" aria-hidden="true">
      <div class="ps-meta">
        <div class="ps-title"></div>
        <div class="ps-actions"></div>
      </div>
    </article>`;
  }

  // ---------- transform JSON to post objects ----------
  function searchCard(keyword, tag) {
    return {
      title: keyword,
      tag,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`,
    };
  }

  function normalizeItems(json) {
    // primary: json.items = [{title,url,thumb,embed?}]
    let items = Array.isArray(json?.items) ? json.items.slice() : [];

    // category keywords → YouTube search cards
    const cats = Array.isArray(json?.youtube?.categories) ? json.youtube.categories : [];
    for (const cat of cats) {
      for (const k of cat.keywords || []) items.push(searchCard(k, cat.name));
    }
    // legacy flat list
    for (const k of json?.youtube?.keywords || []) items.push(searchCard(k, "YouTube"));
    // TikTok video URLs
    for (const u of json?.tiktok?.urls || []) items.push({ title: "TikTok", url: u });

    // Map to enriched objects with embed where possible
    return items.map((it) => {
      const title = it.title || "";
      const url = it.url || "";
      let embedHTML = "";

      const yid = ytIdFromUrl(url);
      if (yid && !url.includes("/results")) embedHTML = buildYouTubeEmbed(yid, title);

      const tid = !embedHTML ? ttIdFromUrl(url) : null;
      if (tid) embedHTML = buildTikTokEmbed(tid, title);

      return { title, url, thumb: it.thumb || "", tag: it.tag || "", embedHTML };
    });
  }

  // ---------- one feed instance ----------
  function mount(feedEl) {
    let allPosts = [];
    let page = 0;
    let sentinel;
    let observer;

    function appendPage() {
      const slice = allPosts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
      if (!slice.length) {
        // no more pages — stop observing
        if (observer && sentinel) observer.unobserve(sentinel);
        sentinel?.remove();
        return;
      }
      feedEl.insertAdjacentHTML("beforeend", slice.map(cardHTML).join(""));
      if (sentinel) feedEl.appendChild(sentinel); // keep sentinel last
      page++;
    }

    async function init() {
      feedEl.innerHTML = Array.from({ length: SKELETON_COUNT }, skeletonHTML).join("");
      const src = feedEl.dataset.src;
      try {
        const json = await fetchFirstAvailable(src ? [src] : DEFAULT_URLS);
        allPosts = uniqueByUrl(normalizeItems(json));
      } catch (e) {
        allPosts = [];
      }
      feedEl.innerHTML = "";
      page = 0;

      if (!allPosts.length) {
        feedEl.innerHTML = `
          <article class="ps-post">
            <div class="ps-meta"><div class="ps-title">Nothing to explore right now — check back soon. 💙</div></div>
          </article>`;
        return;
      }

      appendPage(); // first page

      if (!("IntersectionObserver" in window)) {
        while (page * PAGE_SIZE < allPosts.length) appendPage();
        return;
      }
      // sentinel for infinite scroll
      sentinel = document.createElement("div");
      sentinel.setAttribute("aria-hidden", "true");
      sentinel.style.height = "1px";
      feedEl.appendChild(sentinel);
      observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) appendPage();
      }, { rootMargin: "200px" });
      observer.observe(sentinel);
    }

    init();
    return { reload: () => { observer?.disconnect(); init(); } };
  }

  // Inject minimal brand styles if host page doesn’t have them
  function decorateStyles() {
    if (document.getElementById("ps-scrollfeed-styles")) return;
    const css = `
      [data-scroll-feed]{
        display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
        gap:18px; padding:8px 0; max-width:1100px; margin:0 auto;
      }
      .ps-post{
        background:rgba(15,22,56,.6); border:1px solid rgba(0,255,240,.18);
        border-radius:16px; overflow:hidden;
        box-shadow:0 2px 12px rgba(0,0,0,.35);
      }
      .ps-embed, .ps-img{ width:100%; display:block; aspect-ratio:16/9; border:0; background:#000; }
      .ps-meta{ padding:14px 16px; display:flex; flex-direction:column; gap:8px; }
      .ps-tag{ align-self:flex-start; font-size:.78rem; color:#b9faff; border:1px solid rgba(0,255,240,.3); border-radius:999px; padding:.15rem .6rem; }
      .ps-title{ font-weight:700; color:#eafffd; text-transform:capitalize; }
      .ps-actions a{ display:inline-flex; align-items:center; min-height:44px; color:#00fff0; font-weight:600; }
      .ps-skeleton .ps-title{ height:16px; width:60%; background:#1e1e2d; border-radius:6px }
      .ps-skeleton .ps-actions{ height:44px; width:30%; background:#161626; border-radius:6px }
    `;
    const style = document.createElement("style");
    style.id = "ps-scrollfeed-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function start() {
    const els = document.querySelectorAll("[data-scroll-feed]");
    if (!els.length) return;
    decorateStyles();
    const feeds = Array.from(els, mount);
    // expose for manual re-init if needed
    window.PSScrollFeed = { reload: () => feeds.forEach((f) => f.reload()) };
  }

  // auto-init on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
