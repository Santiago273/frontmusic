// src/components/Header/Header.jsx
import './Header.css';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export function Header({
  query,
  setQuery,
  onSearch,
  loading,
  activeTab,
  setActiveTab,
  playlists = [],
  onOpenCreateModal
}) {
  return (
    <header className="hero">
      <h1 className="hero-title">
        <img src="/keku-svg.svg" alt="Logo" width="40" height="40" className="hero-logo-img" />
        <span className="gradient-text">KekuSound</span>
      </h1>
      <p className="hero-subtitle">Tu biblioteca musical personal en alta fidelidad</p>

      {/* Pestañas de Navegación y Listas */}
      <div className="tab-buttons-container">
        <div className="tab-buttons">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <SearchIcon />
            <span>Explorar</span>
          </button>

          {playlists.map((pl) => (
            <button
              key={pl.id}
              type="button"
              className={`tab-btn ${activeTab === `pl_${pl.id}` ? 'active' : ''}`}
              onClick={() => setActiveTab(`pl_${pl.id}`)}
            >
              <ListIcon />
              <span>{pl.name}</span>
              <span className="badge-count">{pl.tracks?.length || 0}</span>
            </button>
          ))}

          <button
            type="button"
            className="tab-btn add-list-btn"
            onClick={onOpenCreateModal}
            title="Crear nueva lista"
          >
            <PlusIcon />
            <span>Nueva Lista</span>
          </button>
        </div>
      </div>

      {activeTab === 'search' && (
        <form onSubmit={onSearch} className="search-box">
          <span className="search-input-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar canciones, artistas o álbumes..."
            autoFocus
          />
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      )}
    </header>
  );
}