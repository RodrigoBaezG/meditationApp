import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../api/apiClient';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { handleAuth } = useAuth();
  const { t } = useLanguage();
  const s = t.signup;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      handleAuth(data.token, data.user);
      navigate('/instructions');
    } catch (err) {
      setError(err.message || s.errorDefault);
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
          marginBottom: '0.5rem',
          color: 'var(--color-text)',
        }}>
          {s.title}
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.9375rem',
          marginBottom: '1.75rem',
        }}>
          {s.subtitle}
        </p>

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
            <label className="form-label" htmlFor="email">{s.emailLabel}</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={s.emailPlaceholder}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="password">{s.passwordLabel}</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={s.passwordPlaceholder}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {isLoading ? s.submitting : s.submit}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: 'var(--color-text-muted)',
        }}>
          {s.haveAccount}{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>
            {s.loginLink}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
