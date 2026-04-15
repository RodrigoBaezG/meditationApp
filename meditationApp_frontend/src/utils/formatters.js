/**
 * Convierte segundos a formato MM:SS.
 */
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * Formatea una fecha ISO/YYYY-MM-DD a texto legible en español.
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

/**
 * Convierte minutos totales a "Xh Ymin" (ej. 1h 30min).
 */
export const formatTotalTime = (totalMinutes) => {
  if (!totalMinutes || totalMinutes === 0) return '0 min';
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const remaining = totalMinutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}min` : `${hours}h`;
};
