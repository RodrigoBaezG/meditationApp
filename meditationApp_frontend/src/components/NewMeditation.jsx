import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from './Timer';
import { useAuth } from '../context/AuthContext'; // Import the authentication hook
// Import CSS if necessary (snippet suggests it is)
import './NewMeditation.css';

// Meditation duration options in minutes
const meditationDurations = [1, 2, 5, 10, 15, 30];

// ✨ Base URL for the backend
const API_BASE_URL = 'https://meditation-api-218f.onrender.com/api';

const NewMeditation = () => {
  // --- STATES AND CONTEXT ---
  const { authToken, logout } = useAuth(); // Get the token and logout function
  const navigate = useNavigate();

  const [durationInSeconds, setDurationInSeconds] = useState(0);
  const [isMeditating, setIsMeditating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [experience, setExperience] = useState('');
  const [meditationDate, setMeditationDate] = useState(new Date().toISOString().substring(0, 10)); // Default date
  const [saveError, setSaveError] = useState('');

  // --- VIEW HANDLERS AND LOGIC ---

  const selectTime = (durationMinutes) => {
    setDurationInSeconds(durationMinutes * 60);
    setIsMeditating(true);
    setIsFinished(false);
    setSaveError('');
    setExperience('');
  };

  const goBackToSelection = useCallback(() => {
    setIsMeditating(false);
    setIsFinished(false);
    setDurationInSeconds(0);
  }, []);

  const handleFinish = useCallback(() => {
    setIsMeditating(false);
    setIsFinished(true); // Show the form
  }, []);

  // Form handler to save the meditation to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');

    // Duration is in seconds, API expects minutes
    const durationMinutes = Math.round(durationInSeconds / 60);

    if (!authToken) {
      setSaveError('Error: Authentication token not found. Please log in again.');
      logout();
      return;
    }

    try {
      // 1. POST request using fetch
      const response = await fetch(`${API_BASE_URL}/meditations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ✨ USING THE JWT TOKEN
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          duration: durationMinutes,
          date: meditationDate,
          note: experience || null, // Send null if the note field is empty
        }),
      });

      // 2. Handle the response
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Invalid or expired token. Force logout.
          logout();
          throw new Error('Your session has expired. Please log in again.');
        }
        // Handle other backend errors (e.g., 400 Bad Request)
        throw new Error(data.message || 'Unknown error saving meditation.');
      }

      // 3. If successful, redirect to history
      alert('Meditation successfully recorded!');
      navigate('/history');

    } catch (err) {
      console.error('Error saving meditation:', err);
      setSaveError(err.message);
    }
  };


  // --- CONDITIONAL RENDERING ---

  // 1. Timer View
  if (isMeditating) {
    return (
      // Assuming Timer.jsx exists in the same directory
      <Timer
        initialTime={durationInSeconds}
        onFinish={handleFinish}
        onBack={goBackToSelection}
      />
    );
  }

  // 2. Form View (after meditation finishes)
  if (isFinished) {
    const durationMinutes = Math.round(durationInSeconds / 60);

    return (
      // Using the snippet's class: .meditation-form-container
      <div className="meditation-form-container">
        <h1 className="text-3xl font-bold text-green-700 mb-2">Meditation Log</h1>
        <p className="subtitle">Save your experience to your history.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {saveError && <p className="text-red-500 text-center font-semibold border border-red-200 p-2 rounded-lg mb-4">{saveError}</p>}

          <div className="flex space-x-4">
            <div className="form-group w-1/2">
              <label htmlFor="duration" className="block text-gray-700 font-semibold mb-1">Duration (minutes):</label>
              <input
                type="number"
                id="duration"
                value={durationMinutes}
                readOnly
                // Using Tailwind classes for a 'disabled' look
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div className="form-group w-1/2">
              <label htmlFor="date" className="block text-gray-700 font-semibold mb-1">Meditation Date:</label>
              <input
                type="date"
                id="date"
                value={meditationDate}
                onChange={(e) => setMeditationDate(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="experience" className="block text-gray-700 font-semibold mb-1">Experience and Notes:</label>
            <textarea
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows="6"
              placeholder="Describe how you felt, what thoughts arose..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            ></textarea>
          </div>

          <button type="submit" className="w-full py-3 cursor-pointer bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition duration-150 shadow-md">
            Save Meditation
          </button>
          <button
            type="button"
            onClick={goBackToSelection}
            className="w-full py-2 mt-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-100 transition duration-150"
          >
            Cancel and go back to time selection
          </button>
        </form>
      </div>
    );
  }

  // 3. Time Selection View (Default)
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-xl text-center mt-10">
      <h1 className="text-3xl font-bold text-green-800 mb-6">
        Select your meditation duration 🧘
      </h1>
      <p className="text-gray-600 mb-8">
        Choose a time and let's go.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {meditationDurations.map(minutes => (
          <button
            key={minutes}
            onClick={() => selectTime(minutes)}
            className="p-4 w-28 bg-green-800 cursor-pointer text-white text-xl font-bold rounded-xl hover:bg-green-600 transition duration-150 shadow-lg transform hover:scale-105"
          >
            {minutes} min
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewMeditation;