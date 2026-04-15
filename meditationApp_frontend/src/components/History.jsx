import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../api/apiClient';
import { formatDate, formatTotalTime } from '../utils/formatters';
import './History.css';

const History = () => {
  const { authToken, logout } = useAuth();
  const { t } = useLanguage();
  const h = t.history;

  const [meditations, setMeditations] = useState([]);
  const [totalTime, setTotalTime]     = useState(0);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState('');

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await apiRequest('/meditations', { method: 'GET' }, authToken);
      setMeditations(data);
      setTotalTime(data.reduce((sum, m) => sum + m.duration_minutes, 0));
    } catch (err) {
      if (err.status === 401) { logout(); return; }
      setError(err.message || h.errorDefault);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, logout, h.errorDefault]);

  useEffect(() => {
    if (authToken) loadHistory();
  }, [authToken, loadHistory]);

  if (isLoading) {
    return <div className="history-loading">{h.loading}</div>;
  }

  if (error) {
    return (
      <div className="history-error" role="alert">
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{h.errorTitle}</p>
        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>{error}</p>
        <button className="btn-primary" onClick={loadHistory}>{h.retry}</button>
      </div>
    );
  }

  return (
    <div className="history-container animate-in">
      {/* Header */}
      <div className="history-header">
        <h1 className="history-title">{h.title}</h1>
        <p className="history-subtitle">{h.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="history-stats">
        <div className="stat-card">
          <div className="stat-value">{meditations.length}</div>
          <div className="stat-label">{h.sessions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatTotalTime(totalTime)}</div>
          <div className="stat-label">{h.totalTime}</div>
        </div>
      </div>

      {/* Lista */}
      {meditations.length === 0 ? (
        <div className="empty-state">
          <p>{h.empty}</p>
          <Link to="/new-meditation" className="btn-primary">
            {h.startFirst}
          </Link>
        </div>
      ) : (
        <div className="history-list">
          {meditations.map((med) => (
            <div key={med.id} className="meditation-card">
              <div className="meditation-card-icon" aria-hidden="true">🌿</div>

              <div className="meditation-card-body">
                <p className="meditation-card-date">{formatDate(med.meditation_date)}</p>
                {med.note && (
                  <p className="meditation-card-note" title={med.note}>
                    "{med.note}"
                  </p>
                )}
              </div>

              <div className="meditation-card-duration">
                {med.duration_minutes}
                <small>min</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
