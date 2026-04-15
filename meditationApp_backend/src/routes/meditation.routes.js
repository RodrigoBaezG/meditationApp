import express from 'express';
import MeditationModel from '../models/meditation.model.js';
import checkAuth from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/meditations — registrar nueva sesión (protegida)
router.post('/', checkAuth, async (req, res) => {
  const userId = req.userId;
  const { duration, date, note } = req.body;

  if (!duration || !date) {
    return res.status(400).json({ message: 'La duración y la fecha son requeridas.' });
  }

  const durationNum = Number(duration);
  if (!Number.isInteger(durationNum) || durationNum < 1 || durationNum > 480) {
    return res.status(400).json({ message: 'La duración debe ser un número entero entre 1 y 480 minutos.' });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date) || isNaN(new Date(date).getTime())) {
    return res.status(400).json({ message: 'La fecha no tiene un formato válido (YYYY-MM-DD).' });
  }

  try {
    const newMeditation = await MeditationModel.create(userId, durationNum, date, note || null);
    res.status(201).json(newMeditation);
  } catch (error) {
    console.error('[meditations/POST]', error.message);
    res.status(500).json({ message: 'Error al guardar la meditación.' });
  }
});

// GET /api/meditations — historial del usuario (protegida, paginada)
router.get('/', checkAuth, async (req, res) => {
  const userId = req.userId;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;

  try {
    const history = await MeditationModel.findByUserId(userId, limit, offset);
    res.status(200).json(history);
  } catch (error) {
    console.error('[meditations/GET]', error.message);
    res.status(500).json({ message: 'Error al obtener el historial.' });
  }
});

export default router;
