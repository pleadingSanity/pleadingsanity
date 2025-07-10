export default function VideoCard({ video }) {
  return (
    <div className="video-card">
      <img src={video.thumbnail} alt={video.title} />
      <h3>{video.title}</h3>
      <a href={video.url} target="_blank" rel="noopener noreferrer">Watch</a>
      <a href={video.subtitles} target="_blank" rel="noopener noreferrer">English Subtitles</a>
    </div>
  );
}
