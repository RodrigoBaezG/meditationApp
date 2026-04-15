import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Home from './components/Home';
import NewMeditation from './components/NewMeditation';
import History from './components/History';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Instructions from './components/Instructions';
import './App.css';

// ─── RUTA PROTEGIDA ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>
          {t.loading}
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ─── APP ─────────────────────────────────────────────────────────────────────
const App = () => (
  <Router>
    <LanguageProvider>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </LanguageProvider>
  </Router>
);

const AppLayout = () => (
  <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
    <AppNavbar />
    <main className="app-main">
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/instructions"   element={<Instructions />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/signup"         element={<SignUp />} />
        <Route path="/new-meditation" element={<ProtectedRoute><NewMeditation /></ProtectedRoute>} />
        <Route path="/history"        element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="*"               element={<Navigate to="/" />} />
      </Routes>
    </main>
  </div>
);

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
const AppNavbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="main-header">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">Letting Be</Link>

        <nav className="navbar-links">
          <Link to="/instructions" className="nav-link">{t.nav.instructions}</Link>

          {isAuthenticated ? (
            <>
              <Link to="/new-meditation" className="nav-link">{t.nav.meditate}</Link>
              <Link to="/history"        className="nav-link">{t.nav.history}</Link>
              <button onClick={logout}   className="nav-logout">{t.nav.logout}</button>
            </>
          ) : (
            <>
              <Link to="/login"  className="nav-link">{t.nav.login}</Link>
              <Link to="/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                {t.nav.signup}
              </Link>
            </>
          )}

          <button
            onClick={toggleLang}
            className="nav-link"
            style={{ fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.8rem' }}
            aria-label="Switch language"
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default App;
