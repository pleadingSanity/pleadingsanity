// ===== PLEADING SANITY — UNIVERSAL MASTER SCRIPT =====
// Upgraded: Dual YouTube Feed + Crisis System + Fallback Guarantee
// Zero Blanks • Zero Errors • Always Works • Evolution Not Erasure
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Pleading Sanity — System Online. Rise From Madness.");

  // ==========================================
  // 🚨 CRISIS RESPONSE SYSTEM — 24/7 ACTIVE
  // ==========================================
  if (typeof CrisisResponseSystem === 'undefined') {
    const crisisScript = document.createElement('script');
    crisisScript.src = 'crisis-response-system.js';
    crisisScript.defer = true;
    crisisScript.onerror = () => console.warn("⚠️ Crisis script missing — links still work");
    document.head.appendChild(crisisScript);
  } else {
    console.log("✅ Crisis Response System — Ready");
  }

  // ==========================================
  // 🧭 SMART NAVIGATION — Highlights Active Page
  // ==========================================
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage || 
        (currentPage === "" && href === "index.html") ||
        (currentPage === "/" && (href === "index.html" || href === "/"))) {
      link.classList.add("active");
    }
  });

  // ==========================================
  // 🔗 SMOOTH SCROLL — In-Page Anchors
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const targetId = anchor.getAttribute("href");
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ==========================================
  // ✉️ NEWSLETTER — Join Confirmation
  // ==========================================
  const newsletterForm = document.querySelector(".newsletter form, form[action*='mailchimp']");
  if (newsletterForm) {
    let submitted = false;
    newsletterForm.addEventListener("submit", e => {
      if (!submitted) {
        submitted = true;
        setTimeout(() => {
          alert("✅ Welcome to the movement! Watch your inbox — we rise together. 💙✨");
          submitted = false;
        }, 600);
      }
    });
  }

  // ==========================================
  // ✨ FADE-IN ANIMATION — Sections Appear
  // ==========================================
  const sections = document.querySelectorAll("section");
  if ("IntersectionObserver" in window && sections.length) {
    const appearOptions = { threshold: 0.13, rootMargin: "0px 0px -48px 0px" };
    const appearOnScroll = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      });
    }, appearOptions);

    sections.forEach(sec => {
      sec.classList.add("fade-in");
      appearOnScroll.observe(sec);
    });
  }

  // ==========================================
  // 📺 YOUTUBE FEED — DUAL API + FALLBACK GUARANTEE
  // ==========================================
  const container = document.getElementById('video-list') || document.getElementById('video-feed-container');
  
  if (container) {
    // 🌟 CURATED FALLBACK — ALWAYS SHOWS SOMETHING
    const FALLBACK = [
      {
        videoId: "8nTFjVm9sTQ",
        title: "Shane's Story — Rise From Madness",
        description: "From darkness to purpose. One voice starting a movement.",
        thumbnail: "https://img.youtube.com/vi/8nTFjVm9sTQ/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=8nTFjVm9sTQ"
      },
      {
        videoId: "mRf3-JkwqfU",
        title: "You Are Not Alone — Survivor Voices",
        description: "Real stories. Breaking the silence. We rise together.",
        thumbnail: "https://img.youtube.com/vi/mRf3-JkwqfU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=mRf3-JkwqfU"
      },
      {
        videoId: "8F7b8FFsKis",
        title: "Keep Going — Cosmic Motivation",
        description: "Every fall prepares you to rise higher. Stars are with you.",
        thumbnail: "https://img.youtube.com/vi/8F7b8FFsKis/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=8F7b8FFsKis"
      },
      {
        videoId: "VbfpW0pbvaU",
        title: "Built Not Broken — Resilience",
        description: "What doesn't break you rewrites you. Evolution, Not Erasure.",
        thumbnail: "https://img.youtube.com/vi/VbfpW0pbvaU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=VbfpW0pbvaU"
      },
      {
        videoId: "dQw4w9WgXcQ",
        title: "Hope Rises — The Movement Grows",
        description: "Every heart that joins makes us stronger. You matter.",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }
    ];

    // 🎨 Render Video Card — Matches Cosmic Theme
    function renderCard(video, index) {
      const card = document.createElement('div');
      card.className = 'ps-video-card';
      card.style.animationDelay = `${index * 0.12}s`;
      
      card.innerHTML = `
        <a href="${video.url}" target="_blank" rel="noopener" class="ps-thumb-wrap">
          <img src="${video.thumbnail}" alt="${video.title}" class="ps-thumb" loading="lazy" />
        </a>
        <div class="ps-info">
          <h3 class="ps-title">${video.title}</h3>
          <p class="ps-desc">${video.description.substring(0, 120)}...</p>
          <a href="${video.url}" target="_blank" class="ps-watch-btn">▶ Watch on YouTube</a>
        </div>
      `;
      return card;
    }

    // 📥 Try API → Fallback Gracefully
    async function loadFeed() {
      container.innerHTML = '<p style="text-align:center;color:#00fff0;">✨ Loading cosmic stories...</p>';
      
      const params = new URLSearchParams({ channel: 'UC0iP4yT2PpQqhFQ0oEc7ZVw', limit: '8' });
      const primary = `/api/ytFeed?${params}`;
      const fallbackApi = `/.netlify/functions/ytFeed?${params}`;
      
      try {
        // Try Vercel first
        let res = await fetch(primary);
        if (!res.ok) res = await fetch(fallbackApi);
        if (!res.ok) throw new Error("API offline");
        
        const data = await res.json();
        if (data.items && data.items.length) {
          container.innerHTML = '';
          data.items.forEach((vid, i) => container.appendChild(renderCard(vid, i)));
          return;
        }
      } catch (err) {
        console.log("📡 API unreachable — using curated fallback", err.message);
      }
      
      // ✅ FALLBACK TRIGGER — NEVER BLANK!
      container.innerHTML = '';
      FALLBACK.forEach((vid, i) => container.appendChild(renderCard(vid, i)));
      
      // Announce mode
      const announcer = document.getElementById('announcements');
      if (announcer) announcer.textContent = 'Showing featured videos. API sync pending.';
    }

    // 🚀 GO!
    loadFeed();
  }
  // ======= END YOUTUBE FEED =======

  console.log("✅ Pleading Sanity — All Systems Active. We Rise Together.");
});
