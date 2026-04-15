import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from './Timer';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/apiClient';
import './NewMeditation.css';

const DURATIONS = [1, 5, 10, 15, 20, 30];

const NewMeditation = () => {
  const { authToken, logout } = useAuth();
  const navigate = useNavigate();

  const [durationInSeconds, setDurationInSeconds] = useState(0);
  const [isMeditating, setIsMeditating]           = useState(false);
  const [isFinished, setIsFinished]               = useState(false);
  const [experience, setExperience]               = useState('');
  const [meditationDate, setMeditationDate]       = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [saveError, setSaveError]   = useState('');
  const [isSaving, setIsSaving]     = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectTime = (minutes) => {
    setDurationInSeconds(minutes * 60);
    setIsMeditating(true);
    setIsFinished(false);
    setSaveError('');
    setSaveSuccess(false);
    setExperience('');
  };

  const goBackToSelection = () => {
    setIsMeditating(false);
    setIsFinished(false);
    setDurationInSeconds(0);
  };

  const handleFinish = () => {
    setIsMeditating(false);
    setIsFinished(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');
    setIsSaving(true);

    const durationMinutes = Math.round(durationInSeconds / 60);

    try {
      await apiRequest(
        '/meditations',
        {
          method: 'POST',
          body: JSON.stringify({
            duration: durationMinutes,
            date: meditationDate,
            note: experience || null,
          }),
        },
        authToken
      );

      setSaveSuccess(true);
      setTimeout(() => navigate('/history'), 1200);
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setSaveError(err.message || 'Error al guardar la meditación.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Vista: Timer ──────────────────────────────────────────────────────────
  if (isMeditating) {
    return (
      <Timer
        initialTime={durationInSeconds}
        onFinish={handleFinish}
        onBack={goBackToSelection}
      />
    );
  }

  // ── Vista: Formulario de registro ─────────────────────────────────────────
  if (isFinished) {
    const durationMinutes = Math.round(durationInSeconds / 60);

    return (
      <div className="meditation-form-container animate-in">
        <h1>Registro de meditación</h1>
        <p className="subtitle">Guarda tu experiencia en el historial.</p>

        <form onSubmit={handleSubmit}>
          {saveSuccess && (
            <p className="success-banner" role="status">
              ¡Guardado! Redirigiendo al historial...
            </p>
          )}
          {saveError && (
            <p className="error-banner" role="alert">{saveError}</p>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="duration">Duración (min)</label>
              <input
                type="number"
                id="duration"
                className="form-input"
                value={durationMinutes}
                readOnly
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="date">Fecha</label>
              <input
                type="date"
                id="date"
                className="form-input"
                value={meditationDate}
                onChange={(e) => setMeditationDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="experience">Notas (opcional)</label>
            <textarea
              id="experience"
              className="form-input"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows="5"
              placeholder="¿Cómo te sentiste? ¿Qué observaste?"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving || saveSuccess}
              style={{ width: '100%' }}
            >
              {isSaving ? 'Guardando...' : 'Guardar meditación'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={goBackToSelection}
              style={{ width: '100%' }}
            >
              Volver a selección de tiempo
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Vista: Selección de duración (default) ────────────────────────────────
  return (
    <div className="selection-container animate-in">
      <h1 className="selection-title">¿Cuánto tiempo tienes?</h1>
      <p className="selection-subtitle">Elige una duración y comienza.</p>

      <div className="selection-grid">
        {DURATIONS.map((minutes) => (
          <button
            key={minutes}
            className="duration-btn"
            onClick={() => selectTime(minutes)}
            aria-label={`Meditar ${minutes} minutos`}
          >
            {minutes}
            <small>min</small>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewMeditation;
