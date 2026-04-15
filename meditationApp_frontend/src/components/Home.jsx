import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Mantenemos la importación

const Home = () => {
    return (
        // Aplicamos la clase semántica 'home-container'
        <div className="home-container">

            {/* Aplicamos la clase semántica 'hero-section' */}
            <div className="hero-section">
                <h1 className="main-title">Letting be Meditation</h1>
                <p className="tagline">Find peace within you.</p>
                <img
                    src="/Home.jpg" // <-- Reemplaza esto con la ruta real de tu imagen
                    alt="Small decorative leaf"
                    // max-h-5 establece la altura máxima a 1.25rem (20px)
                    // mx-auto centra la imagen si es un elemento de bloque
                    // w-auto asegura que el ancho se ajuste automáticamente
                    className="max-h-100 mx-auto w-auto -rotate-2"
                />

                {/* Aplicamos la clase semántica 'info-section' */}
                <div className="info-section">
                    <h2 className='text-2xl font-bold'>Why do we meditate?</h2>
                    <p>We want peace. We recognize that we are not in peace and that we do not know how to reach it. To meditate is to strengthen our willingness to surrender to the moment as it is.</p>
                    <h2 className='text-2xl font-bold'>What is meditation for?</h2>
                    <p>Since we do not know how to be in peace, we are willing to be taught. We seek reality. We step aside.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;