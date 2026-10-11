// src/components/PlayerBar/PlayerBar.jsx
import { useEffect, useRef, useState } from 'react';
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

  // Estados para el Modal, Play/Pausa y Barra de Avance
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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

  // Intervalo para actualizar la barra de progreso mientras suena el tema
  useEffect(() => {
    const timer = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || 0;
        setCurrentTime(cur);
        setDuration(dur);
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentTrack) return;

    setCurrentTime(0);
    setIsPlaying(true);

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
              setIsPlaying(true);
            },
            onStateChange: (event) => {
              // event.data: 1 = Playing, 2 = Paused, 0 = Ended
              if (event.data === 1) setIsPlaying(true);
              if (event.data === 2) setIsPlaying(false);

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

  // Alternar Play / Pause usando la instancia de YouTube
  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!playerRef.current) return;

    if (isPlaying) {
      if (typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
      setIsPlaying(false);
    } else {
      if (typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
      setIsPlaying(true);
    }
  };

  // Adelantar o retroceder en la barra
  const handleSeek = (e) => {
    e.stopPropagation();
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(newTime, true);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentTrack) return null;

  return (
    <>
      <aside className="player-bar">
        {/* Tocar la carátula o nombre abre el modal */}
        <div
          className="current-meta"
          onClick={() => setIsExpanded(true)}
          style={{ cursor: 'pointer' }}
          title="Toca para ampliar carátula"
        >
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className="current-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/keku-svg.svg';
            }}
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

      {/* --- MODAL PANTALLA COMPLETA --- */}
      {isExpanded && (
        <div className="player-modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="player-modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Botón cerrar modal */}
            <div className="modal-header">
              <button className="close-modal-btn" onClick={() => setIsExpanded(false)}>
                ▼
              </button>
              <div className="modal-header-title">Reproduciendo</div>
              <div style={{ width: 32 }}></div>
            </div>

            {/* Disco en grande: tocar el centro pausa o reanuda */}
            <div className="big-cover-container" onClick={togglePlay}>
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="big-cover-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/keku-svg.svg';
                }}
              />
              <div className="center-play-overlay">
                <span className="overlay-icon">{isPlaying ? '⏸' : '▶'}</span>
              </div>
            </div>

            {/* Info de la pista */}
            <div className="modal-track-info">
              <h2>{currentTrack.title}</h2>
              <p>{currentTrack.artist}</p>
            </div>

            {/* Barra de avance de reproducción */}
            <div className="progress-container">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="progress-slider"
              />
              <div className="time-display">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controles en el modal */}
            <div className="modal-controls">
              <button className="control-btn large-btn" onClick={onPrev} disabled={!onPrev}>
                <PrevIcon />
              </button>
              <button className="control-btn play-hero-btn" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button className="control-btn large-btn" onClick={onNext} disabled={!onNext}>
                <NextIcon />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}