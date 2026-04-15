import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// ✨ URL base del backend
const API_BASE_URL = 'http://localhost:3000/api/auth';

// 3. Proveedor del Contexto
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Contiene {id, email} del usuario
    const [authToken, setAuthToken] = useState(null); // El JWT
    const [isLoading, setIsLoading] = useState(true); // Para chequear el token al inicio
    const navigate = useNavigate();

    // 4. Función de Log Out
    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        setUser(null);
        setAuthToken(null);
        navigate('/login');
    }, [navigate]);

    // 5. Función de Login/Registro (centralizada)
    const handleAuth = (token, userData) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        setUser(userData);
        setIsLoading(false);
    };

    // 6. Efecto para cargar la sesión desde localStorage al montar
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            // Se asume que si hay token, es válido. 
            // En una app real, se haría una llamada a /api/auth/me
            // para validar el token en el backend.
            setAuthToken(storedToken);
            // Si el token existe, asumimos que estamos logueados. 
            // Una implementación real decodificaría el token aquí para obtener el userId/email
            // o haría una llamada al backend. Por simplicidad, dejamos el user como un placeholder.
            // Para fines de esta demo, esto es suficiente para habilitar las rutas protegidas.
            setUser({ email: 'usuario@demo.com' });
        }
        setIsLoading(false);
    }, []);

    // 7. Proveer el estado y funciones
    const contextValue = {
        user,
        isAuthenticated: !!authToken, // true si hay token
        authToken,
        handleAuth,
        logout,
        isLoading,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};