// video-feed.js

const container = document.getElementById('video-feed-container');
let page = 1;

const loadVideos = () => {
    for (let i = 0; i < 10; i++) {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = `<div class="placeholder">Video ${(page - 1) * 10 + i + 1}</div>`;
        container.appendChild(videoCard);
    }
    page++;
};

const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadVideos();
    }
};

window.addEventListener('scroll', handleScroll);
loadVideos(); // Initial load
