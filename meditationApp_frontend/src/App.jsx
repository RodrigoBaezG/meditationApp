import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
// Importamos los componentes de página
import Home from './components/Home';
import NewMeditation from './components/NewMeditation';
import History from './components/History';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Instructions from './components/Instructions';

// =======================================================
// 1. Componente de Utilidad para Proteger Rutas
// =======================================================
/**
 * Componente que verifica la autenticación. Si el usuario no tiene token, redirige a /login.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Muestra un loader mientras se revisa el token en localStorage
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-semibold text-green-700">
        Loading...
      </div>
    );
  }

  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, muestra el contenido de la ruta
  return children;
};


// =======================================================
// 2. Componente Principal de la Aplicación
// =======================================================
const App = () => {
  return (
    // Se envuelve toda la aplicación en el Router
    <Router>
      {/* El proveedor de autenticación envuelve el layout principal */}
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
};

// Componente de layout que contiene el Navbar y las Rutas
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <AppNavbar /> {/* Usamos la barra de navegación */}
      <main className="container mx-auto p-4">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Rutas Protegidas (Usan el ProtectedRoute) */}
          <Route
            path="/new-meditation"
            element={<ProtectedRoute><NewMeditation /></ProtectedRoute>}
          />
          <Route
            path="/history"
            element={<ProtectedRoute><History /></ProtectedRoute>}
          />

          {/* Ruta comodín */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


// =======================================================
// 3. Definición ÚNICA del Navbar (AppNavbar)
// =======================================================
const AppNavbar = () => {
  const { isAuthenticated, logout } = useAuth();
  return (
    <nav className="bg-green-800 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold hover:text-green-200 transition duration-150">
          Letting Be
        </Link>
        <div className="flex space-x-4">
          <Link to="/instructions" className="text-white hover:text-green-200 transition duration-150">
            Instructions
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/new-meditation" className="text-white hover:text-green-200 transition duration-150">
                Meditate
              </Link>
              <Link to="/history" className="text-white hover:text-green-200 transition duration-150">
                History
              </Link>
              <button
                onClick={logout}
                className="text-gray-300 hover:text-red-500 font-semibold transition duration-150 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-green-200 transition duration-150">
                Login
              </Link>
              <Link to="/signup" className="text-white hover:text-green-200 transition duration-150">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};