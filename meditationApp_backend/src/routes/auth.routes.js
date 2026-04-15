import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro';
const JWT_EXPIRES = '7d';

// ─── VALIDACIÓN ──────────────────────────────────────────────────────────────
const validateFields = (email, password, checkLength = false) => {
  if (!email || !password) return 'Email y contraseña son requeridos.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El formato del email no es válido.';
  if (checkLength && password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
};

// ─── REGISTRO ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const validationError = validateFields(email, password, true); // longitud solo en registro
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create(email, passwordHash);
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(201).json({ user: { id: newUser.id, email: newUser.email }, token });

  } catch (error) {
    console.error('[auth/register]', error.message);
    res.status(500).json({ message: 'Error durante el registro. Intenta de nuevo.' });
  }
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const validationError = validateFields(email, password); // login: sin chequeo de longitud
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(200).json({ user: { id: user.id, email: user.email }, token });

  } catch (error) {
    console.error('[auth/login]', error.message);
    res.status(500).json({ message: 'Error durante el login. Intenta de nuevo.' });
  }
});

export default router;
