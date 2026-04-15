import React, { useState, useEffect, useCallback } from 'react';
import './Timer.css'; // ✨ Importamos el nuevo CSS

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}`;
};

const Timer = ({ initialTime, onFinish, onCancel, onBack }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleFinishCallback = useCallback(() => {
    new Audio('https://s3.amazonaws.com/iamnapo/audios/gong.mp3').play();
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      handleFinishCallback();
      return;
    }

    if (isRunning && !isPaused && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(timerId);
    }

  }, [isRunning, isPaused, timeLeft, handleFinishCallback]);

  // --- MANEJADORES DE ACCIONES ---

  const handleStart = () => {
    if (!isRunning && timeLeft === initialTime) {
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
    }
  };

  const handleContinue = () => {
    if (isRunning && isPaused) {
      setIsPaused(false);
    }
  };

  // ✨ NUEVO: Función para detener y resetear el contador
  const handleStop = () => {
    setIsRunning(false); // Detiene el contador
    setIsPaused(false);  // Desactiva la pausa
    setTimeLeft(initialTime); // Vuelve al tiempo inicial
  };

  // --- RENDERIZADO DE BOTONES DE CONTROL ---

  const renderControlButton = () => {
    // Si el tiempo terminó, mostramos el botón de "Guardar" (esto lo maneja NewMeditation.jsx)
    if (timeLeft === 0) {
      return null;
    }

    // 1. Botón Start (se muestra si no está corriendo y el tiempo está al inicio)
    // ✨ MODIFICADO: Añadimos la condición de que el tiempo esté al inicio
    if (!isRunning && timeLeft === initialTime) {
      return (
        <button
          onClick={handleStart}
          className="control-button-base control-button-start-continue"
        >
          ▶️ Start meditation
        </button>
      );
    }

    // 2. Botón Continue (se muestra si está pausado)
    if (isPaused) {
      return (
        <button
          onClick={handleContinue}
          className="control-button-base control-button-start-continue"
        >
          ▶️ Continue
        </button>
      );
    }

    // 3. Botón Pause (se muestra si está corriendo y no pausado)
    if (isRunning && !isPaused && timeLeft > 0) {
      return (
        <button
          onClick={handlePause}
          className="control-button-base control-button-pause"
        >
          ⏸️ Pause
        </button>
      );
    }

    return null;
  };

  return (
    // ✨ Clase semántica
    <div className="timer-container">

      {/* Botón Volver (solo se muestra cuando no estamos corriendo ni pausados) */}
      <button
        onClick={onBack}
        // ✨ MODIFICADO: Solo permitimos volver a la selección de tiempo si el timer no está activo
        className={`back-button-corner ${!isRunning ? '' : 'hidden'}`}
      >
        ← Choose time
      </button>

      {/* ✨ Clase semántica */}
      <h1 className="timer-title">
        {isRunning ? (isPaused ? 'Meditation Paused' : 'Meditating...') : 'Ready to Meditate'}
      </h1>

      {/* ✨ Clase semántica */}
      <div className="time-display">
        {formatTime(timeLeft)}
      </div>

      <div className="flex justify-center items-center">
        {renderControlButton()}

        {/* ✨ NUEVO: Botón de Detener (Stop) */}
        {/* Se muestra si está corriendo o pausado Y no ha terminado el tiempo */}
        {(isRunning || isPaused) && timeLeft > 0 && (
          <button
            onClick={handleStop}
            // ✨ Clase semántica (asumimos que tienes una clase 'stop-button' o la estilizamos con Tailwind)
            className="control-button-base stop-button"
          >
            ⏹️ Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default Timer;