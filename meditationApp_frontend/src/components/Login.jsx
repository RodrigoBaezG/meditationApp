import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/apiClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { handleAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      handleAuth(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto' }} className="animate-in">
      <div className="card">
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2rem',
          textAlign: 'center',
          marginBottom: '1.75rem',
          color: 'var(--color-text)',
        }}>
          Bienvenido de nuevo
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <p role="alert" style={{
              color: 'var(--color-error)',
              fontSize: '0.875rem',
              textAlign: 'center',
              padding: '0.6rem 1rem',
              background: 'rgba(192, 97, 106, 0.08)',
              borderRadius: '8px',
              margin: 0,
            }}>
              {error}
            </p>
          )}

          <div>
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {isLoading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: 'var(--color-text-muted)',
        }}>
          ¿No tienes cuenta?{' '}
          <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
