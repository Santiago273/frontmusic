// src/components/CreatePlaylistModal/CreatePlaylistModal.jsx
import { useState } from 'react';
import './CreatePlaylistModal.css';

export function CreatePlaylistModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Crear nueva lista</h3>
        <p>Ponle un nombre a tu lista (ej: Electrónica, Cuarteto, Gym)</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la lista..."
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={!name.trim()}>
              Crear lista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}