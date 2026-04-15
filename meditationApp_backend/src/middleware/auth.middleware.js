// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Es crucial que esta sea la misma clave secreta usada en auth.routes.js
// La cargamos desde el .env
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro';

/**
 * Middleware para verificar un Token JWT y añadir el ID del usuario a la request.
 */
const checkAuth = (req, res, next) => {
    // 1. Obtener la cabecera de autorización (ej: "Bearer <token>")
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'Authorization required. No token provided.' });
    }

    // Extraer el token (quitamos "Bearer ")
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Token format is "Bearer <token>".' });
    }

    try {
        // 2. Verificar y decodificar el token usando la clave secreta
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. ✨ AÑADIR EL ID DEL USUARIO a la request para que las rutas puedan usarlo
        req.userId = decoded.userId;
        req.userEmail = decoded.email;

        // 4. Si es válido, continuar con la siguiente función (la ruta)
        next();
    } catch (error) {
        // Si la verificación falla (token expirado o inválido)
        return res.status(401).send({ message: 'Invalid or expired token.' });
    }
};

export default checkAuth;