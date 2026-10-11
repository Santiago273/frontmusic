// src/App.jsx
import { useState, useEffect } from 'react';
import { 
  getToken,
  verifySession,
  removeToken,
  searchTracks, 
  getPlaylists, 
  createPlaylist, 
  deletePlaylist,
  updatePlaylistName,
  addTrackToPlaylist, 
  removeTrackFromPlaylist 
} from './api/client';
import { Login } from './components/Login/Login';
import { Header } from './components/Header/Header';
import { TrackGrid } from './components/TrackGrid/TrackGrid';
import { PlayerBar } from './components/PlayerBar/PlayerBar';
import { CreatePlaylistModal } from './components/CreatePlaylistModal/CreatePlaylistModal';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Verificar si ya hay una sesión guardada válida
  useEffect(() => {
    const checkToken = async () => {
      const token = getToken();
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const user = await verifySession();
        setCurrentUser(user.username);
        fetchPlaylists();
      } catch {
        removeToken();
        setCurrentUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkToken();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const data = await getPlaylists();
      setPlaylists(data || []);
    } catch (err) {
      console.error('Error cargando listas:', err);
    }
  };

  const handleLoginSuccess = (username) => {
    setCurrentUser(username);
    fetchPlaylists();
  };

  const handleLogout = () => {
    removeToken();
    setCurrentUser(null);
    setPlaylists([]);
    setCurrentTrack(null);
  };

  // 2. Búsqueda de pistas
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await searchTracks(query);
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Error al buscar:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Gestión de listas
  const handleCreatePlaylist = async (name) => {
    try {
      const newPl = await createPlaylist(name);
      setPlaylists((prev) => [newPl, ...prev]);
      setActiveTab(`pl_${newPl.id}`);
    } catch (err) {
      console.error('Error creando playlist:', err);
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta lista?')) return;
    try {
      await deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      setActiveTab('search');
    } catch (err) {
      console.error('Error eliminando playlist:', err);
    }
  };

  const handleRenamePlaylist = async (id, newName) => {
    try {
      const updated = await updatePlaylistName(id, newName);
      setPlaylists((prev) =>
        prev.map((pl) => (pl.id === id ? { ...pl, name: updated.name } : pl))
      );
    } catch (err) {
      console.error('Error renombrando playlist:', err);
    }
  };

  const handleAddToPlaylist = async (playlistId, track) => {
    try {
      await addTrackToPlaylist(playlistId, track);
      setPlaylists((prev) =>
        prev.map((pl) => {
          if (pl.id === playlistId) {
            const exists = pl.tracks.some((t) => t.id === track.id);
            return exists ? pl : { ...pl, tracks: [...pl.tracks, track] };
          }
          return pl;
        })
      );
    } catch (err) {
      console.error('Error añadiendo pista:', err);
    }
  };

  const handleRemoveFromPlaylist = async (playlistId, trackId) => {
    try {
      await removeTrackFromPlaylist(playlistId, trackId);
      setPlaylists((prev) =>
        prev.map((pl) => {
          if (pl.id === playlistId) {
            return { ...pl, tracks: pl.tracks.filter((t) => t.id !== trackId) };
          }
          return pl;
        })
      );
    } catch (err) {
      console.error('Error quitando pista:', err);
    }
  };

  // Cargador inicial silencioso mientras chequea el token
  if (checkingAuth) {
    return (
      <div className="placeholder-msg" style={{ marginTop: '35vh' }}>
        Iniciando KekuWave...
      </div>
    );
  }

  // Si no hay usuario autenticado, muestra el Login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isSearchTab = activeTab === 'search';
  const activePlaylist = !isSearchTab ? playlists.find((p) => `pl_${p.id}` === activeTab) : null;
  const currentList = isSearchTab ? searchResults : (activePlaylist?.tracks || []);
  const currentIndex = currentList.findIndex((t) => t.id === currentTrack?.id);

  const handleNext = () => {
    if (currentList.length === 0) return;
    const nextIndex = (currentIndex + 1) % currentList.length;
    setCurrentTrack(currentList[nextIndex]);
  };

  const handlePrev = () => {
    if (currentList.length === 0) return;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentList.length - 1;
    setCurrentTrack(currentList[prevIndex]);
  };

  return (
    <div className="music-app">
      {/* Barra superior con usuario actual y botón para salir */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-1rem' }}>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            padding: '4px 8px',
            fontFamily: 'inherit'
          }}
          title="Cerrar sesión"
        >
          Cerrar sesión ({currentUser})
        </button>
      </div>

      <Header
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        playlists={playlists}
        onOpenCreateModal={() => setIsModalOpen(true)}
      />

      {loading && isSearchTab ? (
        <p className="placeholder-msg">Buscando pistas...</p>
      ) : (
        <TrackGrid
          tracks={currentList}
          currentTrack={currentTrack}
          onSelectTrack={setCurrentTrack}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          currentPlaylistId={activePlaylist?.id || null}
          currentPlaylistName={activePlaylist?.name}
          onRemoveFromPlaylist={handleRemoveFromPlaylist}
          onDeleteCurrentPlaylist={handleDeletePlaylist}
          onRenameCurrentPlaylist={handleRenamePlaylist}
          emptyMessage={
            isSearchTab
              ? 'Escribe un nombre arriba para descubrir canciones.'
              : 'Esta lista está vacía. Busca canciones en "Explorar" y agrégalas con el botón (+).'
          }
        />
      )}

      <PlayerBar
        currentTrack={currentTrack}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreatePlaylist}
      />
    </div>
  );
}

export default App;