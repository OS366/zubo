import React, { useState, useEffect, useCallback } from "react";
import { Question as QuestionComponent } from "./Question";
import { Store } from "./Store";
import { GameState, Question } from "../types";
import { getRandomQuestions } from "../data/questions";
import { calculatePersona, getPersonaInfo } from "../utils/persona";
import { Heart, Trophy, Star, Sparkles } from "lucide-react";

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    lives: 3,
    questions: [],
    answeredQuestions: 0,
    personaScores: {},
    gameStatus: "menu",
  });

  const [showLifeGained, setShowLifeGained] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for success page with lives parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const livesParam = urlParams.get("lives");

    if (livesParam && window.location.pathname === "/success") {
      const livesToAdd = parseInt(livesParam, 10);
      if (livesToAdd > 0) {
        setGameState((prev) => ({
          ...prev,
          lives: prev.lives + livesToAdd,
        }));
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        // Clean up URL
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, []);

  const startGame = useCallback(() => {
    const questions = getRandomQuestions(100);
    setGameState({
      currentQuestionIndex: 0,
      score: 0,
      lives: gameState.lives, // Preserve current lives
      questions,
      answeredQuestions: 0,
      personaScores: {},
      gameStatus: "playing",
    });
  }, [gameState.lives]);

  const handleAnswer = useCallback(
    (answerIndex: number) => {
      const currentQuestion =
        gameState.questions[gameState.currentQuestionIndex];
      let isCorrect = false;
      let loseLife = false;

      // Handle timeout (answerIndex === -1)
      if (answerIndex === -1) {
        loseLife = true;
      } else {
        // Check if answer is correct for non-weighted questions
        if (currentQuestion.type !== "weighted") {
          isCorrect = answerIndex === currentQuestion.answer;
          if (!isCorrect) {
            loseLife = true;
          }
        } else {
          // For weighted questions, always correct (no lives lost)
          isCorrect = true;
        }

        // Update persona scores for weighted questions
        if (currentQuestion.type === "weighted" && currentQuestion.weights) {
          const selectedOption = Object.keys(currentQuestion.weights)[
            answerIndex
          ];
          if (selectedOption) {
            setGameState((prev) => ({
              ...prev,
              personaScores: {
                ...prev.personaScores,
                [selectedOption]:
                  (prev.personaScores[selectedOption] || 0) +
                  currentQuestion.weights![selectedOption],
              },
            }));
          }
        }
      }

      // Update game state
      setGameState((prev) => {
        const newScore = isCorrect ? prev.score + 1 : prev.score;
        const newLives = loseLife ? prev.lives - 1 : prev.lives;
        const newAnsweredQuestions = prev.answeredQuestions + 1;

        // Random life gain (10% chance on correct answers)
        let finalLives = newLives;
        if (isCorrect && Math.random() < 0.1 && newLives < 5) {
          finalLives = newLives + 1;
          setShowLifeGained(true);
          setTimeout(() => setShowLifeGained(false), 2000);
        }

        // Check game end conditions
        if (finalLives <= 0) {
          return {
            ...prev,
            score: newScore,
            lives: finalLives,
            answeredQuestions: newAnsweredQuestions,
            gameStatus: "failure",
          };
        }

        if (newAnsweredQuestions >= 100) {
          return {
            ...prev,
            score: newScore,
            lives: finalLives,
            answeredQuestions: newAnsweredQuestions,
            gameStatus: newScore >= 75 ? "success" : "failure",
          };
        }

        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          score: newScore,
          lives: finalLives,
          answeredQuestions: newAnsweredQuestions,
        };
      });
    },
    [gameState.questions, gameState.currentQuestionIndex]
  );

  const openStore = () => {
    setGameState((prev) => ({ ...prev, gameStatus: "store" }));
  };

  const closeStore = () => {
    setGameState((prev) => ({ ...prev, gameStatus: "playing" }));
  };

  const resetGame = () => {
    setGameState({
      currentQuestionIndex: 0,
      score: 0,
      lives: 3,
      questions: [],
      answeredQuestions: 0,
      personaScores: {},
      gameStatus: "menu",
    });
  };

  // Menu Screen
  if (gameState.gameStatus === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Zubo
              </span>
            </h1>
            <p className="text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover your true persona through 100 thought-provoking
              questions. Challenge your mind and unlock the depths of your
              personality.
            </p>
          </div>

          <div className="bg-gray-800 rounded-3xl p-8 mb-8 border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Game Rules</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Heart className="w-5 h-5 text-red-400 mr-3" />
                  <span>Start with 3 lives</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Trophy className="w-5 h-5 text-yellow-400 mr-3" />
                  <span>Score 75+ out of 100 to succeed</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Star className="w-5 h-5 text-blue-400 mr-3" />
                  <span>Some questions are timed (60s)</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Sparkles className="w-5 h-5 text-purple-400 mr-3" />
                  <span>10% chance to gain lives</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>4 question categories</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-pink-400 mr-3">♦</span>
                  <span>Discover your inner persona</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Begin Your Journey
          </button>
        </div>
      </div>
    );
  }

  // Store Screen
  if (gameState.gameStatus === "store") {
    return <Store onBack={closeStore} />;
  }

  // Success Screen
  if (gameState.gameStatus === "success") {
    const topPersona = calculatePersona(gameState.personaScores);
    const personaInfo = getPersonaInfo(topPersona);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Congratulations!
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              You've successfully completed the Zubo challenge with a score of{" "}
              {gameState.score}/100!
            </p>
          </div>

          <div className="bg-gray-800 rounded-3xl p-8 mb-8 border border-gray-700 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">Your Persona</h2>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {personaInfo.title}
              </h3>
              <p className="text-gray-100 text-lg leading-relaxed">
                {personaInfo.description}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {personaInfo.traits.map((trait, index) => (
                <div key={index} className="bg-gray-700 rounded-xl p-3">
                  <span className="text-white font-medium">{trait}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failure Screen
  if (gameState.gameStatus === "failure") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="text-6xl mb-4">💔</div>
            <h1 className="text-5xl font-bold text-white mb-4">Game Over</h1>
            <p className="text-xl text-gray-300 mb-8">
              {gameState.lives <= 0
                ? "You've run out of lives! Don't give up - try again or visit the store for more lives."
                : `You scored ${gameState.score}/100. You need at least 75 to succeed. Keep trying!`}
            </p>
          </div>

          <div className="bg-gray-800 rounded-3xl p-8 mb-8 border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              Your Progress
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {gameState.score}
                </div>
                <div className="text-gray-300">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">
                  {gameState.lives}
                </div>
                <div className="text-gray-300">Lives Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {gameState.answeredQuestions}
                </div>
                <div className="text-gray-300">Questions Answered</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Try Again
            </button>
            <button
              onClick={openStore}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Get More Lives
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      {/* Game Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Heart className="w-6 h-6 text-red-400 mr-2" />
              <span className="text-2xl font-bold text-white">
                {gameState.lives}
              </span>
            </div>
            <div className="flex items-center">
              <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
              <span className="text-2xl font-bold text-white">
                {gameState.score}
              </span>
            </div>
          </div>
          <button
            onClick={openStore}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Store
          </button>
        </div>
      </div>

      {/* Life Gained Animation */}
      {showLifeGained && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-pulse">
            <div className="flex items-center">
              <Heart className="w-8 h-8 mr-3" />
              <span className="text-2xl font-bold">+1 Life Gained!</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-8 right-8 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl animate-pulse">
            <span className="font-bold">Lives added successfully!</span>
          </div>
        </div>
      )}

      {/* Question Component */}
      <QuestionComponent
        question={gameState.questions[gameState.currentQuestionIndex]}
        onAnswer={handleAnswer}
        questionNumber={gameState.currentQuestionIndex + 1}
        totalQuestions={gameState.questions.length}
      />
    </div>
  );
};
