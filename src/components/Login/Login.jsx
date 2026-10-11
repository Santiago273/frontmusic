import { useState } from 'react';
import { loginUser, setToken } from '../../api/client';
import './Login.css';

export function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setError('');
    setLoading(true);

    try {
      const data = await loginUser(username.trim(), password.trim());
      setToken(data.access_token);
      localStorage.setItem('keku_user', data.username);
      onLoginSuccess(data.username);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-brand">
          <img src="/keku-svg.svg" alt="KekuWave" width="56" height="56" className="login-logo" />
          <h2>KekuSound</h2>
          <p>Mi música</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error-msg">{error}</div>}

          <div className="form-group">
            <label htmlFor="login-username">Usuario</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}