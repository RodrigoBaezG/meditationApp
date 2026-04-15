-- ─── SCHEMA DE LA BASE DE DATOS ─────────────────────────────────────────────
-- Se ejecuta automáticamente al crear el contenedor de PostgreSQL por primera vez.

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
