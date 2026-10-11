// src/components/TrackCard/TrackCard.jsx
import { useState, useRef, useEffect } from 'react';
import './TrackCard.css';

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export function TrackCard({
  track,
  isPlaying,
  onSelect,
  playlists = [],
  onAddToPlaylist,
  currentPlaylistId = null,
  onRemoveFromPlaylist
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <article
      className={`track-card ${isPlaying ? 'active' : ''}`}
      onClick={() => onSelect(track)}
    >
      <div className="cover-wrapper">
        <img
          src={track.cover || 'https://via.placeholder.com/300x300?text=Sin+Portada'}
          alt={track.title}
          loading="lazy"
        />
        
        {/* Play overlay en el centro */}
        <div className="play-overlay">
          <span className="play-badge">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </span>
        </div>

        {/* Acción en la esquina superior derecha */}
        {currentPlaylistId ? (
          <button
            type="button"
            className="card-corner-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromPlaylist(currentPlaylistId, track.id);
            }}
            title="Quitar canción de la lista"
          >
            <TrashIcon />
          </button>
        ) : (
          <div className="dropdown-container" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="card-corner-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              title="Guardar en lista..."
            >
              <PlusIcon />
            </button>

            {menuOpen && (
              <div className="playlist-menu">
                <p className="menu-title">Guardar en:</p>
                {playlists.length === 0 ? (
                  <p className="menu-empty">No hay listas aún</p>
                ) : (
                  playlists.map((pl) => (
                    <button
                      key={pl.id}
                      type="button"
                      className="menu-item"
                      onClick={() => {
                        onAddToPlaylist(pl.id, track);
                        setMenuOpen(false);
                      }}
                    >
                      {pl.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="track-info">
        <strong title={track.title}>{track.title}</strong>
        <span title={track.artist}>{track.artist}</span>
      </div>
    </article>
  );
}