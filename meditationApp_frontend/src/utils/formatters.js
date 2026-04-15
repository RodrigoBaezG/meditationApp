/**
 * Convierte segundos a formato MM:SS.
 * @param {number} seconds - Segundos a formatear.
 * @returns {string} Tiempo en formato MM:SS.
 */
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  // Asegura que minutos y segundos siempre tengan dos dígitos (ej. 05:03)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formatea una cadena de fecha ISO para el historial.
 * @param {string} isoString - Cadena de fecha ISO.
 * @returns {string} Fecha y hora formateadas.
 */
export const formatDate = (isoString) => {
    const date = new Date(isoString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false // Formato 24h
    };
    // El 'es-ES' asegura que el formato sea en español
    return date.toLocaleDateString('es-ES', options);
};