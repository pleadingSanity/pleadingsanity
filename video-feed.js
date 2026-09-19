// ==========================================
// 📺 PLEADING SANITY — Video Feed Engine
// Infinite Scroll • Fallback System • Cosmic Theme
// ==========================================

const container = document.getElementById('video-feed-container');
let page = 1;
let isLoading = false;

// 🔑 YouTube API — leave blank for curated fallback mode
const API_KEY = ""; 
const PLAYLIST_ID = "PL7C1VriGLDPrAq1Im9t7WQxZcuXlA77DA";
let nextPageToken = "";

// 🌟 Curated Fallback Videos — ALWAYS shows something
const FALLBACK_VIDEOS = [
  {
    videoId: "8nTFjVm9sTQ",
    title: "Shane's Story: Pleading Sanity — Rise From Madness",
    description: "From darkness to purpose. One voice starting a movement. This is why we're here."
  },
  {
    videoId: "mRf3-JkwqfU",
    title: "Survivor Voices — You Are Not Alone",
    description: "Real people. Real stories. Breaking the silence. We rise together."
  },
  {
    videoId: "8F7b8FFsKis",
    title: "Cosmic Motivation — Keep Going",
    description: "Every fall is just preparation to rise higher. The stars are with you."
  },
  {
    videoId: "VbfpW0pbvaU",
    title: "Resilience — Built Not Broken",
    description: "What doesn't break you rewrites you. Evolution, Not Erasure."
  },
  {
    videoId: "dQw4w9WgXcQ",
    title: "Hope Rises — The Movement Grows",
    description: "Every heart that joins makes us stronger. You matter. We matter."
  }
];

// 🎨 Render single video card
function createVideoCard(video, index) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.style.animationDelay = `${index * 0.12}s`;
  
  card.innerHTML = `
    <iframe 
      src="https://www.youtube.com/embed/${video.videoId}" 
      title="${video.title}"
      loading="lazy"
      allowfullscreen
    ></iframe>
    <div class="video-card-content">
      <h3 class="video-title">${video.title}</h3>
      <p class="video-desc">${video.description}</p>
      <div class="video-actions">
        <button class="like-btn" onclick="handleLike(this)">👍 Positive</button>
      </div>
    </div>
  `;
  
  return card;
}

// 👍 Like handler
window.handleLike = function(btn) {
  btn.classList.add('liked');
  btn.textContent = "✅ +1 Positive Energy";
  btn.disabled = true;
};

// 📥 Load videos — API or Fallback
async function loadVideos() {
  if (isLoading) return;
  isLoading = true;

  try {
    if (!API_KEY) throw new Error("No API key — using fallback mode");

    // ✅ Try YouTube API first
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=8&playlistId=${PLAYLIST_ID}&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    
    const data = await res.json();
    nextPageToken = data.nextPageToken || "";
    
    const videos = data.items.map(item => ({
      videoId: item.snippet.resourceId?.videoId,
      title: item.snippet.title,
      description: item.snippet.description || ""
    }));
    
    renderVideos(videos);
    
  } catch (err) {
    console.log("📺 Feed: Fallback mode active —", err.message);
    
    // ✅ Loop fallback videos infinitely
    const startIndex = ((page - 1) * 5) % FALLBACK_VIDEOS.length;
    const batch = [];
    for (let i = 0; i < 5; i++) {
      batch.push(FALLBACK_VIDEOS[(startIndex + i) % FALLBACK_VIDEOS.length]);
    }
    renderVideos(batch);
    nextPageToken = "fallback-continue"; // Keep scroll loading working
  }

  page++;
  isLoading = false;
}

function renderVideos(videos) {
  videos.forEach((video, i) => {
    const card = createVideoCard(video, i);
    container.appendChild(card);
  });
}

// 📜 Infinite Scroll Trigger
function handleScroll() {
  if (!nextPageToken && nextPageToken !== "fallback-continue") return;
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    loadVideos();
  }
}

// 🚀 Initialize
window.addEventListener('scroll', handleScroll);
loadVideos();
