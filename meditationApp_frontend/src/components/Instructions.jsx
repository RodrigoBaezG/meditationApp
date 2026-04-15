import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Instructions.css';

const Instructions = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="instructions-container animate-in">
      <h1>Cómo practicamos el Letting Be</h1>
      <p className="intro-text">
        Tómate unos minutos para leer estas instrucciones con calma antes de comenzar tu práctica.
      </p>

      <div className="step-card">
        <h2>Conceptos previos</h2>
        <ul>
          <li>Los pensamientos producen sensaciones físicas.</li>
          <li>Las emociones producen sensaciones físicas.</li>
          <li>La energía está detrás de los pensamientos y las emociones.</li>
          <li>Cuando dejamos de resistir las sensaciones causadas por pensamientos y emociones, la energía que hay detrás se disipa progresivamente.</li>
          <li>Sin esa energía, los pensamientos y emociones colapsan por sí solos.</li>
          <li>Cuando colapsan, te acercas a tu estado natural: la Paz.</li>
          <li>Cuando todo desaparece, la Paz es lo único que queda.</li>
          <li>Si no sentimos paz, significa que estamos resistiendo algo.</li>
        </ul>
      </div>

      <div className="step-card">
        <h2>La meditación Letting Be</h2>
        <ul>
          <li>Sé consciente de que siempre estás teniendo una experiencia física.</li>
          <li>Presta atención a esa experiencia. Presta atención a las sensaciones físicas.</li>
          <li>Observa cómo puedes dejar de resistir esas sensaciones. Sigue haciéndolo. Sigue notándolas.</li>
          <li>Pase lo que pase, lleva tu atención continuamente a esas sensaciones físicas y deja de resistirlas.</li>
          <li>Si encuentras dolor, deja de resistir la sensación física.</li>
          <li>Si encuentras tristeza, deja de resistir la sensación física.</li>
          <li>Si te sientes incómodo, deja de resistir la sensación física.</li>
          <li>Si encuentras deseo, deja de resistir la sensación física.</li>
          <li>Si no encuentras nada, deja de resistir la sensación física.</li>
          <li>Lo que sea que encuentres en el momento presente es lo que necesitas dejar de resistir.</li>
          <li>Sigue haciendo esto durante el tiempo que hayas elegido para meditar. Cierra los ojos si lo necesitas.</li>
        </ul>
      </div>

      <p className="closing-text">
        Dejar de resistir significa rendirse. Es un hábito que podemos construir momento a momento. Requiere práctica. Sé amable contigo mismo. Todos hacemos lo mejor que podemos.
      </p>

      <div className="instructions-cta">
        <p>¿Listo para comenzar?</p>
        {isAuthenticated ? (
          <Link to="/new-meditation" className="btn-primary">
            Iniciar meditación
          </Link>
        ) : (
          <Link to="/signup" className="btn-primary">
            Crear cuenta y meditar
          </Link>
        )}
      </div>
    </div>
  );
};

export default Instructions;
