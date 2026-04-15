import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatTime } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import './Timer.css';

const RADIUS = 104;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Timer = ({ initialTime, onFinish, onBack }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { t } = useLanguage();
  const ti = t.timer;

  // Refs para cálculo robusto con Date.now() (resiste tabs en background)
  const startTimeRef    = useRef(null);
  const pauseTimeRef    = useRef(null);
  const totalPausedRef  = useRef(0);
  const intervalRef     = useRef(null);

  const progress   = 1 - timeLeft / initialTime;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const handleFinish = useCallback(() => {
    clearInterval(intervalRef.current);
    new Audio('https://s3.amazonaws.com/iamnapo/audios/gong.mp3').play().catch(() => {});
    onFinish();
  }, [onFinish]);

  // Tick usando Date.now() para evitar deriva en pestañas inactivas
  useEffect(() => {
    if (!isRunning || isPaused) return;

    intervalRef.current = setInterval(() => {
      const elapsed   = (Date.now() - startTimeRef.current - totalPausedRef.current) / 1000;
      const remaining = Math.max(0, initialTime - elapsed);
      const rounded   = Math.round(remaining);

      setTimeLeft(rounded);

      if (rounded === 0) {
        clearInterval(intervalRef.current);
        handleFinish();
      }
    }, 500);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, initialTime, handleFinish]);

  const handleStart = () => {
    startTimeRef.current   = Date.now();
    totalPausedRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    pauseTimeRef.current = Date.now();
    setIsPaused(true);
  };

  const handleContinue = () => {
    totalPausedRef.current += Date.now() - pauseTimeRef.current;
    setIsPaused(false);
  };

  const handleStop = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(initialTime);
    startTimeRef.current   = null;
    totalPausedRef.current = 0;
  };

  const statusText = isRunning
    ? (isPaused ? ti.paused : ti.meditating)
    : ti.ready;

  return (
    <div className="timer-container animate-in">
      {!isRunning && (
        <button className="back-button-corner" onClick={onBack}>
          {ti.back}
        </button>
      )}

      <h1 className="timer-title">{statusText}</h1>

      {/* SVG Progress Ring */}
      <div className="timer-ring-wrapper" role="timer" aria-label={`${ti.remaining}: ${formatTime(timeLeft)}`}>
        <svg className="timer-ring" viewBox="0 0 240 240">
          <circle className="timer-ring-bg"       cx="120" cy="120" r={RADIUS} />
          <circle
            className="timer-ring-progress"
            cx="120" cy="120" r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="timer-display">
          <span className="timer-time">{formatTime(timeLeft)}</span>
          <span className="timer-label">{ti.remaining}</span>
        </div>
      </div>

      {/* Controles */}
      <div className="timer-controls">
        {!isRunning && timeLeft === initialTime && (
          <button className="btn-primary" onClick={handleStart}>
            {ti.start}
          </button>
        )}

        {isRunning && isPaused && (
          <button className="btn-primary" onClick={handleContinue}>
            {ti.continue}
          </button>
        )}

        {isRunning && !isPaused && timeLeft > 0 && (
          <button className="btn-ghost" onClick={handlePause}>
            {ti.pause}
          </button>
        )}

        {(isRunning || isPaused) && timeLeft > 0 && (
          <button className="btn-danger" onClick={handleStop}>
            {ti.stop}
          </button>
        )}
      </div>
    </div>
  );
};

export default Timer;
