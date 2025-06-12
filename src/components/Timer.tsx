import React, { useEffect, useState } from 'react';

interface TimerProps {
  duration: number;
  onTimeout: () => void;
  isActive: boolean;
}

export const Timer: React.FC<TimerProps> = ({ duration, onTimeout, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;
    
    setTimeLeft(duration);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, onTimeout, isActive]);

  const percentage = (timeLeft / duration) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-300">Time Remaining</span>
        <span className={`text-lg font-bold ${isUrgent ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${
            isUrgent ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};