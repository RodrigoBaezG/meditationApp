import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos el contexto de Auth

// ✨ Reemplaza con la URL base de tu backend (Render o Local)
const API_BASE_URL = 'https://meditation-api-218f.onrender.com/api/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { handleAuth } = useAuth(); // Obtenemos la función para manejar el token

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // 1. Petición POST usando fetch
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), // Convertir el objeto a JSON
            });

            // 2. Manejo de la respuesta
            const data = await response.json();

            if (!response.ok) {
                // Si el código de estado es 400, 401, etc.
                throw new Error(data.message || 'Error al iniciar sesión.');
            }

            // 3. Si es exitoso, usar la función handleAuth del contexto
            handleAuth(data.token, data.user);

            alert(`Sesión iniciada como: ${data.user.email}`);
            navigate('/'); // Redirigir a la página de inicio

        } catch (err) {
            console.error('Login failed:', err);
            // 4. Mostrar el mensaje de error
            setError(err.message || 'Error de conexión con el servidor.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl">
            <h1 className="text-3xl font-bold text-center text-green-700 mb-6">Login</h1>

            <div className="my-4 text-xs">
                <p>Demo credentials</p>
                <p>email: example@gmail.com</p>
                <p>password: 12345</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-center font-semibold border border-red-200 p-2 rounded-lg">{error}</p>}

                <div>
                    <label className="block text-gray-700 font-semibold mb-1" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-1" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition duration-150 shadow-md"
                >
                    Login
                </button>
            </form>

            <p className="text-center text-gray-600 mt-4">
                Don't have an account? <Link to="/signup" className="text-green-600 hover:text-green-800 font-semibold">Signup</Link>
            </p>
        </div>
    );
};

export default Login;