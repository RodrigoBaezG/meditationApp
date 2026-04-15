// src/routes/auth.routes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
// Es recomendable guardar esta clave secreta en el archivo .env
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro';

// --- RUTA DE REGISTRO ---
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required.' });
    }

    try {
        // 1. Verificar si el usuario ya existe
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).send({ message: 'User already exists.' });
        }

        // 2. Hashear la contraseña (usamos 10 rounds para seguridad)
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Crear el usuario en la DB
        const newUser = await UserModel.create(email, passwordHash);

        // 4. Generar Token JWT (para iniciar sesión inmediatamente)
        const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).send({
            user: { id: newUser.id, email: newUser.email },
            token
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).send({ message: 'Error during registration.' });
    }
});

// --- RUTA DE LOGIN ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required.' });
    }

    try {
        // 1. Buscar usuario
        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).send({ message: 'Invalid credentials.' });
        }

        // 2. Comparar la contraseña hasheada
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).send({ message: 'Invalid credentials.' });
        }

        // 3. Generar Token JWT
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

        res.status(200).send({
            user: { id: user.id, email: user.email },
            token
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send({ message: 'Error during login.' });
    }
});

export default router;