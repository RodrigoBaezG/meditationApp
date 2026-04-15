import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero animate-in">
        <div className="hero-content">
          <span className="hero-eyebrow">Meditación consciente</span>
          <h1 className="hero-title">
            Encontrar paz<br />
            <em>es posible</em>
          </h1>
          <p className="hero-subtitle">
            Letting Be es una práctica simple para observar tu mente
            sin juzgar lo que encuentras. Momento a momento.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/new-meditation" className="btn-primary">
                Nueva meditación
              </Link>
            ) : (
              <Link to="/signup" className="btn-primary">
                Comenzar gratis
              </Link>
            )}
            <Link to="/instructions" className="btn-ghost">
              Cómo funciona
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
          <h2>¿Para qué meditamos?</h2>
          <p>
            Queremos paz. Reconocemos que no estamos en paz y que no sabemos
            cómo alcanzarla. Meditar es fortalecer nuestra disposición a
            entregarnos al momento tal como es.
          </p>
        </div>
        <div className="home-info-card">
          <h2>¿Qué busca esta práctica?</h2>
          <p>
            Como no sabemos cómo estar en paz, estamos dispuestos a ser
            enseñados. Buscamos la realidad. Nos apartamos. Dejamos ser
            lo que ya es.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
