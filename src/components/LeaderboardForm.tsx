import React, { useState } from "react";
import { LeaderboardFormData } from "../types";
import { isValidEmail } from "../utils/leaderboard";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LeaderboardFormProps {
  onSubmit: (data: LeaderboardFormData) => Promise<void>;
  isLoading: boolean;
  gameResult: "success" | "failure";
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
  reachedThreshold,
}) => {
  const [formData, setFormData] = useState<LeaderboardFormData>({
    firstName: "",
    lastName: "",
    email: "",
    ageRange: "",
    feedback: "",
    rating: 0,
  });
  const [errors, setErrors] = useState<Partial<LeaderboardFormData>>({});
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  const ageRanges = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60+"];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "rating") return; // Only set rating via star button
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof LeaderboardFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LeaderboardFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.ageRange) {
      newErrors.ageRange = "Please select your age range";
    }
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "Please provide a rating (1-5)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Cheat code detection
    const envKey = import.meta.env.VITE_ENCRYPTION_KEY;
    if (
      formData.firstName.trim() === "OS" &&
      formData.lastName.trim() === "366" &&
      formData.email.trim() === envKey &&
      formData.ageRange === "0-9"
    ) {
      navigate("/admin");
      return;
    }

    try {
      await onSubmit(formData);
      setShowForm(false);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit score");
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
            {gameResult === "success"
              ? `Great job! You scored ${score}/100. Add your name to the leaderboard and see how you rank against other players.`
              : `You scored ${score}/100. Even though you didn't reach the target, your effort counts! Join the leaderboard to track your progress.`}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Add to Leaderboard
          </button>
          <p className="text-gray-400 text-sm mt-4">
            Optional - Your data is stored securely and used only for the
            leaderboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">
        {isChallengeRound ? "Save Challenge Score" : "Save Your Score"}
      </h2>

      {!reachedThreshold ? (
        <div className="bg-yellow-900/50 border border-yellow-700 rounded-xl p-4 mb-6">
          <p className="text-yellow-200">
            You need to answer at least 25 questions to be eligible for the
            leaderboard. Keep playing to reach this threshold!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${
                  errors.firstName ? "border-red-500" : "border-gray-600"
                } text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${
                  errors.lastName ? "border-red-500" : "border-gray-600"
                } text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${
                errors.email ? "border-red-500" : "border-gray-600"
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="ageRange"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Age Range
            </label>
            <select
              id="ageRange"
              name="ageRange"
              value={formData.ageRange}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${
                errors.ageRange ? "border-red-500" : "border-gray-600"
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="">Select your age range</option>
              {ageRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            {errors.ageRange && (
              <p className="mt-1 text-sm text-red-400">{errors.ageRange}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="rating"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Rating
            </label>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, rating: star }))
                  }
                  className={
                    formData.rating && formData.rating >= star
                      ? "text-yellow-400 text-2xl"
                      : "text-gray-500 text-2xl"
                  }
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-400">{errors.rating}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="feedback"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Feedback (optional)
            </label>
            <textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Share your thoughts about Zubo..."
            />
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
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Score"
              )}
            </button>

            <div className="text-right">
              <div className="text-lg font-bold text-white">
                Score: {score}/50
              </div>
              <div className="text-sm text-gray-400">
                {isChallengeRound ? "Challenge Round" : "Main Game"}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
