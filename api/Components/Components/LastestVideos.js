import { useEffect, useState } from 'react';

export default function LatestVideos() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch('/api/fetchVideos')
      .then(res => res.json())
      .then(setVideos);
  }, []);

  return (
    <section className="latest-videos">
      <h2>Latest Videos</h2>
      <div className="videos-grid">
        {videos.slice(0, 4).map(video => (
          <div key={video.id} className="video-card">
            <img src={video.thumbnail} alt={video.title} />
            <div className="video-info">
              <h3>{video.title}</h3>
              <a href={video.url} target="_blank" rel="noopener noreferrer">Watch</a>
              {video.subtitles && (
                <a href={video.subtitles} target="_blank" rel="noopener noreferrer">English Subtitles</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
