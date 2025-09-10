// ===== Pleading Sanity Universal Script =====
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

  // ======= Videos Page: Dynamic Community Loader =======
  const container = document.getElementById('video-list');
  if (container) {
    // Add your community/exclusive video uploads here (update for real PS content!)
    const videos = [
      {
        src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        subtitles: "https://example.com/subtitles1.vtt",
        title: "Big Buck Bunny Sample"
      },
      {
        src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        subtitles: "https://example.com/subtitles2.vtt",
        title: "Another Sample Video"
      }
    ];

    videos.forEach(({ src, subtitles, title }) => {
      const titleElem = document.createElement('h3');
      titleElem.textContent = title;

      const videoElem = document.createElement('video');
      videoElem.controls = true;

      const sourceElem = document.createElement('source');
      sourceElem.src = src;
      sourceElem.type = 'video/mp4';

      const trackElem = document.createElement('track');
      trackElem.kind = 'subtitles';
      trackElem.label = 'English';
      trackElem.srclang = 'en';
      trackElem.src = subtitles;
      trackElem.default = true;

      videoElem.appendChild(sourceElem);
      videoElem.appendChild(trackElem);

      container.appendChild(titleElem);
      container.appendChild(videoElem);
    });
  }

  // ======= END Videos Page Script =======
});
