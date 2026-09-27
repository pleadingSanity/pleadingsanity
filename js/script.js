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
        videoId: "iCvmsMzlF7o",
        title: "The Power of Vulnerability — Brené Brown (TED)",
        description: "Why real courage starts with showing up and letting ourselves be seen.",
        thumbnail: "https://img.youtube.com/vi/iCvmsMzlF7o/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=iCvmsMzlF7o"
      },
      {
        videoId: "F2hc2FLOdhI",
        title: "How to Practice Emotional First Aid — Guy Winch (TED)",
        description: "Why we should look after our minds as carefully as we look after our bodies.",
        thumbnail: "https://img.youtube.com/vi/F2hc2FLOdhI/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=F2hc2FLOdhI"
      },
      {
        videoId: "PY9DcIMGxMs",
        title: "Everything You Think You Know About Addiction Is Wrong — Johann Hari (TED)",
        description: "Connection, not isolation, is the opposite of addiction.",
        thumbnail: "https://img.youtube.com/vi/PY9DcIMGxMs/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=PY9DcIMGxMs"
      },
      {
        videoId: "-eBUcBfkVCo",
        title: "Depression, the Secret We Share — Andrew Solomon (TED)",
        description: "A raw, hopeful look at depression from someone who has lived it.",
        thumbnail: "https://img.youtube.com/vi/-eBUcBfkVCo/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=-eBUcBfkVCo"
      },
      {
        videoId: "XiCrniLQGYc",
        title: "I Had a Black Dog, His Name Was Depression — WHO",
        description: "A gentle, honest animation about living with depression and finding a way through.",
        thumbnail: "https://img.youtube.com/vi/XiCrniLQGYc/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=XiCrniLQGYc"
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
