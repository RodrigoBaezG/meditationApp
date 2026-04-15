import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Instructions.css';

const Instructions = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const i = t.instructions;

  return (
    <div className="instructions-container animate-in">
      <h1>{i.title}</h1>
      <p className="intro-text">{i.intro}</p>

      <div className="step-card">
        <h2>{i.conceptsTitle}</h2>
        <ul>
          {i.concepts.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="step-card">
        <h2>{i.practiceTitle}</h2>
        <ul>
          {i.practice.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <p className="closing-text">{i.closing}</p>

      <div className="instructions-cta">
        <p>{i.ctaTitle}</p>
        {isAuthenticated ? (
          <Link to="/new-meditation" className="btn-primary">
            {i.ctaAuth}
          </Link>
        ) : (
          <Link to="/signup" className="btn-primary">
            {i.ctaGuest}
          </Link>
        )}
      </div>
    </div>
  );
};

export default Instructions;
