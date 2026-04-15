import React from 'react';
import './Instructions.css'; // Importa el archivo CSS

const Instructions = () => {
    return (
        <div className="instructions-container">
            <h1>How do we practice the Letting Be Meditation?</h1>
            <p className="intro-text">
                Welcome! Take a few minutes to read these instructions carefully before starting your meditation practice.
            </p>

            <div className="step-card">
                <h2>Previous concepts</h2>
                <ul>
                    <li>Thoughts produce physical sensations.</li>
                    <li>Emotions produce physical sensations.</li>
                    <li>Energy is behind thoughts and emotions.</li>
                    <li>When we stop resisting the sensations caused by thoughts and emotions, the energy behind them dissipates progressively.</li>
                    <li>Without that energy, thoughts and emotions collapse themselves.</li>
                    <li>When thoughts and emotions collapse, you get closer to your natural state: Peace.</li>
                    <li>When everything is gone, Peace is the only thing that remains.</li>
                    <li>If we feel no peace, it means we are resisting something.</li>
                </ul>
            </div>

            <div className="step-card">
                <h2>Letting Be meditation</h2>
                <ul>
                    <li>Be aware that you are always having a physical experience.</li>
                    <li>Pay atention to that physical experience. Pay atention to those physical sensations.</li>
                    <li>See how you can stop resisting the physical sensations. Keep doing that. Keep noticing them.</li>
                    <li>No matter what, take your atention continuously to those physical sensations and stop resisting them.</li>
                    <li>If you find pain, stop resisting the physical sensation.</li>
                    <li>If you find sadness, stop resisting the physical sensation.</li>
                    <li>If you feel uncomfortable, stop resisting the physical sensation.</li>
                    <li>If you find desire, stop resisting the physical sensation.</li>
                    <li>If you find nothing, stop resisting the physical sensation.</li>
                    <li>Whatever you find in the present moment, that is what you need to stop resisting.</li>
                    <li>Keep doing that during the selected time for your meditation. Close your eyes if needed.</li>
                </ul>
            </div>

            <p className="closing-text">
                To stop resisting means surrender. It's a habit we can build moment by moment. It takes practice. Be gentle with yourself. We all do the best we can.
            </p>
        </div>
    );
};

export default Instructions;