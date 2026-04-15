import React from 'react';

const DurationSelector = ({ sessionDuration, handleDurationChange, isDisabled }) => {
    // Duraciones en minutos
    const durations = [1, 2, 5, 10, 30]; 

    return (
        <div className="flex flex-col items-center">
            <div className="text-gray-700 text-lg mb-4 font-semibold">
                Duración de la Meditación
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-8 w-full max-w-xs">
                {durations.map((min) => (
                <button
                    key={min}
                    onClick={() => handleDurationChange(min)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 
                    ${sessionDuration === min * 60 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={isDisabled}
                >
                    {min} min
                </button>
                ))}
            </div>
        </div>
    );
};

export default DurationSelector;