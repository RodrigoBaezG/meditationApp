// src/models/user.model.js
import pool from '../config/db_config.js';

/**
 * Módulo para interactuar con la tabla 'users'.
 */
const UserModel = {
    /**
     * Busca un usuario por su dirección de correo electrónico.
     * @param {string} email - Correo electrónico del usuario.
     * @returns {Promise<Object | null>} Objeto de usuario si es encontrado, o null.
     */
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1;';
        const { rows } = await pool.query(query, [email]);
        return rows[0] || null;
    },

    /**
     * Registra un nuevo usuario con la contraseña hasheada.
     * @param {string} email - Correo electrónico del nuevo usuario.
     * @param {string} passwordHash - Contraseña ya hasheada.
     * @returns {Promise<Object>} El nuevo registro de usuario.
     */
    create: async (email, passwordHash) => {
        const query = `
            INSERT INTO users (email, password_hash)
            VALUES ($1, $2) RETURNING id, email, created_at;
        `;
        const values = [email, passwordHash];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
};

export default UserModel;