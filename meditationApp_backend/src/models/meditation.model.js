// src/models/meditation.model.js
// Usando funciones y exportando un objeto de métodos.

import pool from '../config/db_config.js';

/**
 * Registra una nueva sesión de meditación en la base de datos.
 * @param {number} userId - El ID del usuario que registra la meditación.
 * @param {number} duration - La duración de la meditación en minutos.
 * @param {string} date - La fecha de la meditación (formato YYYY-MM-DD).
 * @param {string} note - La nota o experiencia de la meditación.
 * @returns {Promise<Object>} El registro de la meditación creado.
 */
const create = async (userId, duration, date, note) => {
    const query = `
        INSERT INTO meditations (user_id, duration_minutes, meditation_date, note)
        VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [userId, duration, date, note];

    // Ejecuta la consulta SQL
    const { rows } = await pool.query(query, values);

    // Retorna el primer (y único) registro insertado
    return rows[0];
};

/**
 * Obtiene todas las meditaciones registradas por un usuario específico.
 * @param {number} userId - El ID del usuario.
 * @returns {Promise<Array<Object>>} Una lista de objetos de meditación.
 */
const findByUserId = async (userId) => {
    const query = `
        SELECT id, duration_minutes, meditation_date, note, created_at
        FROM meditations WHERE user_id = $1 ORDER BY meditation_date DESC;
    `;

    // Ejecuta la consulta SQL. Solo necesita el userId como valor.
    const { rows } = await pool.query(query, [userId]);

    // Retorna todos los registros encontrados
    return rows;
};


// Exportamos las funciones como un objeto.
// Esto permite que en otros archivos se use: import MeditationModel from '...';
// y luego se llame a MeditationModel.create(...)
export default {
    create,
    findByUserId,
    // Aquí podrías añadir otras funciones como update, remove, etc.
};