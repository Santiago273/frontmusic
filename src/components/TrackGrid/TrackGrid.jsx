// src/components/TrackGrid/TrackGrid.jsx
import { TrackCard } from '../TrackCard/TrackCard';
import './TrackGrid.css';

export function TrackGrid({
  tracks = [],
  currentTrack,
  onSelectTrack,
  playlists = [],
  onAddToPlaylist,
  currentPlaylistId = null,
  onRemoveFromPlaylist,
  emptyMessage,
  onDeleteCurrentPlaylist,
  currentPlaylistName
}) {
  return (
    <section>
      {/* Cabecera si estamos viendo una lista propia */}
      {currentPlaylistId && (
        <div className="playlist-header-bar">
          <div>
            <h2 className="current-list-title">{currentPlaylistName}</h2>
            <span className="current-list-count">{tracks.length} canciones</span>
          </div>

          {onDeleteCurrentPlaylist && (
            <button
              type="button"
              className="delete-playlist-btn"
              onClick={() => onDeleteCurrentPlaylist(currentPlaylistId)}
            >
              Eliminar esta lista
            </button>
          )}
        </div>
      )}

      {tracks.length === 0 ? (
        <p className="placeholder-msg">{emptyMessage}</p>
      ) : (
        <main className="tracks-grid">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isPlaying={currentTrack?.id === track.id}
              onSelect={onSelectTrack}
              playlists={playlists}
              onAddToPlaylist={onAddToPlaylist}
              currentPlaylistId={currentPlaylistId}
              onRemoveFromPlaylist={onRemoveFromPlaylist}
            />
          ))}
        </main>
      )}
    </section>
  );
}