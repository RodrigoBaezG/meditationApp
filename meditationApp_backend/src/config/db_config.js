import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// SSL solo para conexiones en la nube (Render, Neon, etc.)
// Las conexiones locales/Docker no necesitan SSL
const isCloudDB = connectionString &&
  !connectionString.includes('localhost') &&
  !connectionString.includes('127.0.0.1') &&
  !connectionString.includes('@db:');   // hostname del servicio Docker

const pool = new pg.Pool({
  connectionString,
  ...(isCloudDB && { ssl: { rejectUnauthorized: false } }),
});

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en cliente idle:', err.message);
});

console.log(`[DB] Pool inicializado — ${isCloudDB ? 'cloud (SSL)' : 'local'}`);

export default pool;
