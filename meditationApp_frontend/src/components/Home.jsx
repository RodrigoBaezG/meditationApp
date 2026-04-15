import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const h = t.home;

  return (
    <div>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero animate-in">
        <div className="hero-content">
          <span className="hero-eyebrow">{h.eyebrow}</span>
          <h1 className="hero-title">
            {h.title1}<br />
            <em>{h.title2}</em>
          </h1>
          <p className="hero-subtitle">{h.subtitle}</p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/new-meditation" className="btn-primary">
                {h.ctaNew}
              </Link>
            ) : (
              <Link to="/signup" className="btn-primary">
                {h.ctaStart}
              </Link>
            )}
            <Link to="/instructions" className="btn-ghost">
              {h.ctaHow}
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="breathing-ring">
            <div className="breathing-core" />
          </div>
        </div>
      </section>

      {/* ─── INFO ─────────────────────────────────────────────────────────── */}
      <section className="home-info animate-in-2">
        <div className="home-info-card">
          <h2>{h.card1Title}</h2>
          <p>{h.card1Text}</p>
        </div>
        <div className="home-info-card">
          <h2>{h.card2Title}</h2>
          <p>{h.card2Text}</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
