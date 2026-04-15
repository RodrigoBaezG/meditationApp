import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from './Timer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../api/apiClient';
import './NewMeditation.css';

const DURATIONS = [1, 5, 10, 15, 20, 30];

const NewMeditation = () => {
  const { authToken, logout } = useAuth();
  const { t } = useLanguage();
  const nm = t.newMeditation;
  const navigate = useNavigate();

  const [durationInSeconds, setDurationInSeconds] = useState(0);
  const [isMeditating, setIsMeditating]           = useState(false);
  const [isFinished, setIsFinished]               = useState(false);
  const [experience, setExperience]               = useState('');
  const [meditationDate, setMeditationDate]       = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [saveError, setSaveError]     = useState('');
  const [isSaving, setIsSaving]       = useState(false);
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
      setSaveError(err.message || nm.errorDefault);
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
        <h1>{nm.formTitle}</h1>
        <p className="subtitle">{nm.formSubtitle}</p>

        <form onSubmit={handleSubmit}>
          {saveSuccess && (
            <p className="success-banner" role="status">{nm.saved}</p>
          )}
          {saveError && (
            <p className="error-banner" role="alert">{saveError}</p>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="duration">{nm.durationLabel}</label>
              <input
                type="number"
                id="duration"
                className="form-input"
                value={durationMinutes}
                readOnly
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="date">{nm.dateLabel}</label>
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
            <label className="form-label" htmlFor="experience">{nm.notesLabel}</label>
            <textarea
              id="experience"
              className="form-input"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows="5"
              placeholder={nm.notesPlaceholder}
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
              {isSaving ? nm.saving : nm.save}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={goBackToSelection}
              style={{ width: '100%' }}
            >
              {nm.backToSelection}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Vista: Selección de duración (default) ────────────────────────────────
  return (
    <div className="selection-container animate-in">
      <h1 className="selection-title">{nm.selectionTitle}</h1>
      <p className="selection-subtitle">{nm.selectionSubtitle}</p>

      <div className="selection-grid">
        {DURATIONS.map((minutes) => (
          <button
            key={minutes}
            className="duration-btn"
            onClick={() => selectTime(minutes)}
            aria-label={`${nm.selectionTitle} ${minutes} min`}
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
