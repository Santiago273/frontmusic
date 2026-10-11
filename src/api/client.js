// src/api/client.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function getToken() {
  return localStorage.getItem('keku_token');
}

export function setToken(token) {
  localStorage.setItem('keku_token', token);
}

export function removeToken() {
  localStorage.removeItem('keku_token');
  localStorage.removeItem('keku_user');
}

async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    removeToken();
    window.location.reload();
    throw new Error('Sesión finalizada o no autorizada');
  }

  return res;
}

// --- Autenticación ---
export async function loginUser(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Usuario o contraseña incorrectos');
  }

  return res.json();
}

export async function verifySession() {
  const res = await authFetch(`${API_URL}/auth/me`);
  if (!res.ok) throw new Error('Sesión inválida');
  return res.json();
}

// --- Búsqueda de música ---
export async function searchTracks(query, limit = 10) {
  const res = await fetch(`${API_URL}/music/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) throw new Error('Error al buscar pistas');
  return res.json();
}

// --- Playlists (Protegidas por usuario) ---
export async function getPlaylists() {
  const res = await authFetch(`${API_URL}/playlists`);
  if (!res.ok) throw new Error('Error al obtener playlists');
  return res.json();
}

export async function createPlaylist(name) {
  const res = await authFetch(`${API_URL}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Error al crear playlist');
  return res.json();
}

export async function deletePlaylist(playlistId) {
  const res = await authFetch(`${API_URL}/playlists/${playlistId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar playlist');
}

export async function updatePlaylistName(playlistId, newName) {
  const res = await authFetch(`${API_URL}/playlists/${playlistId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName }),
  });
  if (!res.ok) throw new Error('Error al renombrar playlist');
  return res.json();
}

export async function addTrackToPlaylist(playlistId, track) {
  const res = await authFetch(`${API_URL}/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album || null,
      cover: track.cover || null,
    }),
  });
  if (!res.ok) throw new Error('Error al añadir canción');
  return res.json();
}

export async function removeTrackFromPlaylist(playlistId, trackId) {
  const res = await authFetch(`${API_URL}/playlists/${playlistId}/tracks/${trackId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar canción');
}