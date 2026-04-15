import pool from '../config/db_config.js';

const create = async (userId, duration, date, note) => {
  try {
    const query = `
      INSERT INTO meditations (user_id, duration_minutes, meditation_date, note)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, duration, date, note]);
    return rows[0];
  } catch (err) {
    console.error('[MeditationModel.create]', err.message);
    throw new Error('Error al guardar la meditación en la base de datos.');
  }
};

const findByUserId = async (userId, limit = 50, offset = 0) => {
  try {
    const query = `
      SELECT id, duration_minutes, meditation_date, note, created_at
      FROM meditations
      WHERE user_id = $1
      ORDER BY meditation_date DESC, created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const { rows } = await pool.query(query, [userId, limit, offset]);
    return rows;
  } catch (err) {
    console.error('[MeditationModel.findByUserId]', err.message);
    throw new Error('Error al obtener el historial de meditaciones.');
  }
};

export default { create, findByUserId };
