// server.js
import express from 'express';
import cors from 'cors';
import meditationRoutes from './src/routes/meditation.routes.js';
import authRoutes from './src/routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permite peticiones desde tu frontend
app.use(express.json()); // Permite leer JSON en el body

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/meditations', meditationRoutes);
// (Aquí se añadirían las rutas de usuario: /api/users/register, /api/users/login)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});