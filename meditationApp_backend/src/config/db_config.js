// src/config/db.config.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuración para usar la variable de entorno DATABASE_URL
// Esto es estándar en entornos de nube como Render, Heroku, etc.
const config = {
    connectionString: process.env.DATABASE_URL,
};

// Render requiere SSL para conexiones externas (como tu Node.js app)
// Se añade la configuración SSL solo si estamos usando la URL de la DB
if (process.env.DATABASE_URL) {
    config.ssl = {
        rejectUnauthorized: false // Es común deshabilitarlo en entornos de desarrollo/Render
    };
}

const pool = new pg.Pool(config);

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

console.log('PostgreSQL pool initialized using DATABASE_URL.');

export default pool;