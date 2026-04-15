/**
 * seed.js — Inicializa el schema y crea el usuario demo en Neon.
 * Uso: DATABASE_URL="postgresql://..." node seed.js
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Creando schema...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at    TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS meditations (
        id               SERIAL PRIMARY KEY,
        user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 1),
        meditation_date  DATE NOT NULL,
        note             TEXT,
        created_at       TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_meditations_user_id ON meditations(user_id);
      CREATE INDEX IF NOT EXISTS idx_meditations_date    ON meditations(meditation_date DESC);
    `);
    console.log('Schema OK.');

    console.log('Creando usuario demo...');
    const hash = await bcrypt.hash('demo1234', 10);

    const { rows } = await client.query(`
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id
    `, ['demo@demo.com', hash]);

    const userId = rows[0].id;
    console.log(`Usuario demo creado (id=${userId}).`);

    // Borrar meditaciones previas del demo para evitar duplicados
    await client.query('DELETE FROM meditations WHERE user_id = $1', [userId]);

    console.log('Insertando meditaciones de ejemplo...');
    const sessions = [
      { days: 1,  duration: 10, note: 'Meditación de la mañana, centrado en la respiración.' },
      { days: 2,  duration: 15, note: 'Sesión de atención plena antes de dormir.' },
      { days: 4,  duration: 5,  note: null },
      { days: 6,  duration: 20, note: 'Visualización guiada, muy relajante.' },
      { days: 8,  duration: 10, note: null },
      { days: 9,  duration: 15, note: 'Respiración 4-7-8, ayudó a reducir el estrés del día.' },
      { days: 11, duration: 30, note: 'Sesión larga de domingo, meditación body scan.' },
      { days: 13, duration: 10, note: 'Rápida pero efectiva.' },
      { days: 15, duration: 20, note: null },
      { days: 16, duration: 10, note: 'Mindfulness en movimiento.' },
      { days: 18, duration: 15, note: 'Meditación de gratitud.' },
      { days: 20, duration: 5,  note: null },
      { days: 21, duration: 20, note: 'Concentración profunda, sin distracciones.' },
      { days: 23, duration: 10, note: null },
      { days: 25, duration: 15, note: 'Observación de pensamientos sin juzgar.' },
    ];

    for (const s of sessions) {
      const date = new Date();
      date.setDate(date.getDate() - s.days);
      const dateStr = date.toISOString().split('T')[0];

      await client.query(`
        INSERT INTO meditations (user_id, duration_minutes, meditation_date, note)
        VALUES ($1, $2, $3, $4)
      `, [userId, s.duration, dateStr, s.note]);
    }

    console.log(`${sessions.length} meditaciones insertadas.`);
    console.log('\nSeed completado. Credenciales demo:');
    console.log('  Email:    demo@demo.com');
    console.log('  Password: demo1234');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Error en seed:', err.message);
  process.exit(1);
});
