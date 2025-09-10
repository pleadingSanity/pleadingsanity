// ===== Pleading Sanity Core Script =====
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Pleading Sanity script loaded. Rise From Madness.");

  // Highlight active nav link automatically (works for /index.html or /)
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(link => {
    if (
      link.getAttribute("href") === currentPage ||
      (currentPage === "index.html" && link.getAttribute("href") === "index.html")
    ) {
      link.classList.add("active");
    }
  });

  // Smooth scroll for anchor links (internal)
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
});
