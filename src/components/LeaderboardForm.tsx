import React, { useState } from 'react';
import { LeaderboardFormData } from '../types';
import { isValidEmail } from '../utils/leaderboard';
import { User, Mail, Trophy } from 'lucide-react';

interface LeaderboardFormProps {
  onSubmit: (data: LeaderboardFormData) => Promise<void>;
  isLoading: boolean;
  gameResult: 'success' | 'failure';
  score: number;
  isChallengeRound: boolean;
  reachedThreshold: boolean;
}

export const LeaderboardForm: React.FC<LeaderboardFormProps> = ({
  onSubmit,
  isLoading,
  gameResult,
  score,
  isChallengeRound,
  reachedThreshold
}) => {
  const [formData, setFormData] = useState<LeaderboardFormData>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [errors, setErrors] = useState<Partial<LeaderboardFormData>>({});
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LeaderboardFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LeaderboardFormData> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save score');
    }
  };

  if (!showForm) {
    return (
      <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Join the Leaderboard!
          </h3>
          <p className="text-gray-300 mb-6">
            {gameResult === 'success' 
              ? `Great job! You scored ${score}/100. Add your name to the leaderboard and see how you rank against other players.`
              : `You scored ${score}/100. Even though you didn't reach the target, your effort counts! Join the leaderboard to track your progress.`
            }
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Add to Leaderboard
          </button>
          <p className="text-gray-400 text-sm mt-4">
            Optional - Your data is stored securely and used only for the leaderboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">
        {isChallengeRound ? 'Save Challenge Score' : 'Save Your Score'}
      </h2>
      
      {!reachedThreshold ? (
        <div className="bg-yellow-900/50 border border-yellow-700 rounded-xl p-4 mb-6">
          <p className="text-yellow-200">
            You need to answer at least 25 questions to be eligible for the leaderboard.
            Keep playing to reach this threshold!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${
                  errors.firstName ? 'border-red-500' : 'border-gray-600'
                } text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${
                  errors.lastName ? 'border-red-500' : 'border-gray-600'
                } text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {submitError && (
            <div className="bg-red-900/50 border border-red-700 rounded-xl p-4">
              <p className="text-red-200">{submitError}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Score'
              )}
            </button>

            <div className="text-right">
              <div className="text-lg font-bold text-white">
                Score: {score}/50
              </div>
              <div className="text-sm text-gray-400">
                {isChallengeRound ? 'Challenge Round' : 'Main Game'}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}; 