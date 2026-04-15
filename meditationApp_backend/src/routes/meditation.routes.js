// src/routes/meditation.routes.js
import express from 'express';
import MeditationModel from '../models/meditation.model.js';
import checkAuth from '../middleware/auth.middleware.js'; // ✨ Importamos el middleware

const router = express.Router();

// 1. POST /api/meditations - Registrar nueva meditación (PROTEGIDA)
// El middleware checkAuth se ejecuta antes que la función asíncrona.
router.post('/', checkAuth, async (req, res) => {
    // ✨ Obtenemos el ID de usuario del token JWT decodificado
    const userId = req.userId;
    const { duration, date, note } = req.body;

    if (!duration || !date) {
        return res.status(400).send({ message: 'Duration and date are required.' });
    }

    try {
        const newMeditation = await MeditationModel.create(userId, duration, date, note);
        res.status(201).send(newMeditation);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error registering meditation.' });
    }
});

// 2. GET /api/meditations - Obtener historial de meditación (PROTEGIDA)
router.get('/', checkAuth, async (req, res) => {
    // ✨ Obtenemos el ID de usuario del token JWT decodificado
    const userId = req.userId;

    try {
        const history = await MeditationModel.findByUserId(userId);
        res.status(200).send(history);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error fetching meditation history.' });
    }
});

export default router;