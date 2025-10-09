// ===== Pleading Sanity Universal Script (UPGRADED YouTube Feed) =====
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Pleading Sanity script loaded. Rise From Madness.");

  // Highlight active nav link (handles / and /index.html)
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(link => {
    if (
      link.getAttribute("href") === currentPage ||
      (currentPage === "index.html" && link.getAttribute("href") === "index.html")
    ) {
      link.classList.add("active");
    }
  });

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Newsletter feedback popup (works for .newsletter form and Mailchimp embeds)
  const newsletterForm = document.querySelector(".newsletter form, form[action*='mailchimp']");
  if (newsletterForm) {
    let submitted = false;
    newsletterForm.addEventListener("submit", () => {
      if (!submitted) {
        submitted = true;
        setTimeout(() => {
          alert("✅ Thanks for joining the movement! Watch your inbox for inspiration.");
          submitted = false;
        }, 550);
      }
    });
  }

  // Section fade-in effect
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

  // ======= Sanity Hub: REAL YouTube Community Feed =======
  const container = document.getElementById('video-list');
  if (container) {
    // Prefer Vercel API first, fall back to Netlify function
    const params = new URLSearchParams({ channel: 'UC0iP4yT2PpQqhFQ0oEc7ZVw', limit: '8' });
    const primary = `/api/ytFeed?${params.toString()}`;
    const fallback = `/.netlify/functions/ytFeed?${params.toString()}`;
    const tryFetch = async () => {
      try {
        const r1 = await fetch(primary);
        if (r1.ok) return r1.json();
        const r2 = await fetch(fallback);
        return r2.json();
      } catch {
        const r2 = await fetch(fallback).catch(() => null);
        return r2 ? r2.json() : { items: [] };
      }
    };
    tryFetch().then(({ items }) => {
        container.innerHTML = ''; // Clear out any placeholder junk
        if (!items || !items.length) {
          container.innerHTML = '<div style="color:var(--danger, #fa3c3c);text-align:center">No videos found. Please check your API key and config.</div>';
          return;
        }
        items.forEach(({ videoId, title, description, thumbnail, url }) => {
          const card = document.createElement('div');
          card.className = 'ps-video-card';
          card.innerHTML = `
            <a href="${url}" target="_blank" rel="noopener" class="ps-thumb-wrap">
              <img src="${thumbnail}" alt="${title}" class="ps-thumb" loading="lazy" />
            </a>
            <div class="ps-info">
              <h3 class="ps-title">${title}</h3>
              <p class="ps-desc">${description.substring(0, 120)}...</p>
              <a href="${url}" target="_blank" class="ps-watch-btn">▶ Watch on YouTube</a>
            </div>
          `;
          container.appendChild(card);
        });
      })
      .catch(err => {
        console.error("Feed error:", err);
        container.innerHTML = `
          <div style="color: #fa3c3c; text-align: center; padding: 20px; background: rgba(255, 59, 92, 0.1); border-radius: 12px; border: 1px solid rgba(255, 59, 92, 0.3);">
            <h3 style="margin: 0 0 10px 0;">⚡ Cosmic Connection Issues</h3>
            <p style="margin: 0 0 15px 0;">We're having trouble loading the latest videos right now.</p>
            <button onclick="location.reload()" style="background: #fa3c3c; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-right: 10px;">🔄 Try Again</button>
            <a href="/videos.html" style="background: #00fff0; color: #000; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold;">📺 Browse All Videos</a>
          </div>
        `;
        
        // Announce error to screen readers
        const announcer = document.getElementById('announcements');
        if (announcer) {
          announcer.textContent = 'Error loading video feed. Please try again or browse all videos.';
        }
      });
  }

  // ======= END Sanity Hub Feed =======
});
