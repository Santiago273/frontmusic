// src/components/PlayerBar/PlayerBar.jsx
import { useEffect, useRef } from 'react';
import './PlayerBar.css';

const PrevIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="19 20 9 12 19 4 19 20"></polygon>
    <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></line>
  </svg>
);

const NextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 4 15 12 5 20 5 4"></polygon>
    <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></line>
  </svg>
);

export function PlayerBar({ currentTrack, onNext, onPrev }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const onNextRef = useRef(onNext);

  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    if (!currentTrack) return;

    const initOrLoadPlayer = () => {
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(currentTrack.id);
        return;
      }

      if (window.YT && window.YT.Player && containerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '100%',
          width: '100%',
          videoId: currentTrack.id,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              event.target.playVideo();
            },
            onStateChange: (event) => {
              if (event.data === 0) {
                if (onNextRef.current) {
                  onNextRef.current();
                }
              }
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initOrLoadPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initOrLoadPlayer;
    }
  }, [currentTrack]);

  if (!currentTrack) return null;

  return (
    <aside className="player-bar">
      <div className="current-meta">
        <img
          src={currentTrack.cover}
          alt={currentTrack.title}
          className="current-cover"
        />
        <div className="meta-text">
          <strong title={currentTrack.title}>{currentTrack.title}</strong>
          <span>{currentTrack.artist}</span>
        </div>
      </div>

      <div className="player-controls">
        <button
          className="control-btn"
          onClick={onPrev}
          disabled={!onPrev}
          title="Anterior"
        >
          <PrevIcon />
        </button>
        <button
          className="control-btn"
          onClick={onNext}
          disabled={!onNext}
          title="Siguiente"
        >
          <NextIcon />
        </button>
      </div>

      <div className="player-embed">
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </aside>
  );
}