// src/components/PlayerBar/PlayerBar.jsx
import { useState, useEffect, useRef } from 'react';
import './PlayerBar.css';

export function PlayerBar({ currentTrack, onNext, onPrev }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioRef = useRef(null);

  // Cada vez que cambia la pista seleccionada
  useEffect(() => {
    if (currentTrack) {
      setCurrentTime(0);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    } else {
      setIsPlaying(false);
    }
  }, [currentTrack]);

  // Manejador de Play/Pause
  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Actualizar tiempos mientras se reproduce
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  // Salto en la barra de tiempo
  const handleSeek = (e) => {
    e.stopPropagation();
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentTrack) return null;

  const audioSource = currentTrack.streamUrl || currentTrack.url || `https://www.youtube.com/watch?v=${currentTrack.id}`;
  const coverUrl = currentTrack.cover || currentTrack.thumbnail || '/keku-svg.svg';

  return (
    <>
      {/* Audio nativo oculto */}
      <audio
        ref={audioRef}
        src={audioSource}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
      />

      {/* --- 1. BARRA INFERIOR HABITUAL --- */}
      <div className="player-bar">
        {/* Al hacer clic en los datos del tema, se expande a pantalla completa */}
        <div className="current-meta clickable-meta" onClick={() => setIsExpanded(true)}>
          <img src={coverUrl} alt="Cover" className="current-cover" />
          <div className="meta-text">
            <strong>{currentTrack.title}</strong>
            <span>{currentTrack.artist}</span>
          </div>
          <span className="expand-hint">▲</span>
        </div>

        {/* Controles de la barra reducida */}
        <div className="player-controls">
          <button className="control-btn" onClick={onPrev} title="Anterior">⏮</button>
          <button className="control-btn play-main-btn" onClick={togglePlay} title={isPlaying ? "Pausar" : "Reproducir"}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="control-btn" onClick={onNext} title="Siguiente">⏭</button>
        </div>
      </div>

      {/* --- 2. MODAL / VISTA EXPANDIDA EN PANTALLA COMPLETA --- */}
      {isExpanded && (
        <div className="player-modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="player-modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Cabecera con botón de cierre */}
            <div className="modal-header">
              <button className="close-modal-btn" onClick={() => setIsExpanded(false)}>▼</button>
              <div className="modal-header-title">Reproduciendo</div>
              <div style={{ width: 32 }}></div>
            </div>

            {/* Disco grande: al tocarlo pausa / reanuda */}
            <div className="big-cover-container" onClick={togglePlay}>
              <img
                src={coverUrl}
                alt="Carátula completa"
                className={`big-cover-img ${isPlaying ? 'rotating-subtle' : 'paused'}`}
              />
              <div className="center-play-overlay">
                <span className="overlay-icon">{isPlaying ? '⏸' : '▶'}</span>
              </div>
            </div>

            {/* Título y artista */}
            <div className="modal-track-info">
              <h2>{currentTrack.title}</h2>
              <p>{currentTrack.artist}</p>
            </div>

            {/* Barra de progreso de reproducción */}
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

            {/* Controles expandidos */}
            <div className="modal-controls">
              <button className="control-btn large-btn" onClick={onPrev}>⏮</button>
              <button className="control-btn play-hero-btn" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button className="control-btn large-btn" onClick={onNext}>⏭</button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}