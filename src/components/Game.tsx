import React, { useState, useEffect, useCallback, useRef } from "react";
import { Question as QuestionComponent } from "./Question";
import { Store } from "./Store";
import { LeaderboardForm } from "./LeaderboardForm";
import { TimeBankComponent } from "./TimeBank";
import { BalloonAnimation } from "./BalloonAnimation";
import { GameState, Question, LeaderboardFormData } from "../types";
import {
  getRandomQuestions,
  getChallengeQuestions,
  injectRandomRiddles,
} from "../data/questions";
import { calculatePersona, getPersonaInfo } from "../utils/persona";
import {
  saveLeaderboardEntry,
  getUserEntries,
  getLeaderboardEntries,
} from "../utils/leaderboard";
import {
  getCurrentStage,
  initializeTimeBank,
  addTimeToBank,
  calculateTimeEarned,
  formatTime,
  getStageProgress,
  tradeTimeForLives,
  GAME_STAGES,
} from "../utils/timeBank";
import { Heart, Trophy, Star, Sparkles } from "lucide-react";
import logo from "../assets/logo.png";

const THRESHOLD_QUESTIONS =
  Number(process.env.REACT_APP_THRESHOLD_QUESTIONS) || 5;

// Add this debug panel component at the top of the Game component
const DebugPanel = ({ gameState }: { gameState: any }) => (
  <div
    style={{
      position: "fixed",
      bottom: 0,
      right: 0,
      background: "#222",
      color: "#fff",
      padding: 12,
      zIndex: 9999,
      fontSize: 12,
      borderRadius: 8,
      opacity: 0.9,
    }}
  >
    <div>
      <b>DEBUG</b>
    </div>
    <div>gameStatus: {gameState.gameStatus}</div>
    <div>questions.length: {gameState.questions.length}</div>
    <div>currentQuestionIndex: {gameState.currentQuestionIndex}</div>
    <div>answeredQuestions: {gameState.answeredQuestions}</div>
    <div>lives: {gameState.lives}</div>
    <div>isChallengeRound: {String(gameState.isChallengeRound)}</div>
    <div>leaderboardEligible: {String(gameState.leaderboardEligible)}</div>
    {gameState.questionTimings && gameState.questionTimings.length > 0 && (
      <div>
        <div>
          <b>TIMING STATS</b>
        </div>
        <div>
          Avg Time:{" "}
          {Math.round(
            gameState.questionTimings.reduce(
              (sum: number, t: any) => sum + t.timeTaken,
              0
            ) /
              gameState.questionTimings.length /
              1000
          )}
          s
        </div>
        <div>
          Fastest:{" "}
          {Math.round(
            Math.min(
              ...gameState.questionTimings.map((t: any) => t.timeTaken)
            ) / 1000
          )}
          s
        </div>
        <div>
          Slowest:{" "}
          {Math.round(
            Math.max(
              ...gameState.questionTimings.map((t: any) => t.timeTaken)
            ) / 1000
          )}
          s
        </div>
        <div>
          Timeouts:{" "}
          {gameState.questionTimings.filter((t: any) => t.wasTimeout).length}
        </div>
      </div>
    )}
  </div>
);

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    lives: 3,
    questions: [],
    answeredQuestions: 0,
    personaScores: {},
    gameStatus: "menu",
    isChallengeRound: false,
    leaderboardEligible: false,
    perQuestionTimes: [],
    questionTimings: [],
    answerHistory: [],
    livesBought: 0,
    livesGained: 0,
    timeBank: initializeTimeBank(),
    currentStage: GAME_STAGES[0],
  });

  const [showLifeGained, setShowLifeGained] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [purchasedLives, setPurchasedLives] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [leaderboardSaved, setLeaderboardSaved] = useState(false);
  const [savingToLeaderboard, setSavingToLeaderboard] = useState(false);
  const [visualSurprise, setVisualSurprise] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [sessionEnd, setSessionEnd] = useState<Date | null>(null);

  const [userAttempts, setUserAttempts] = useState<number | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [showStageTransition, setShowStageTransition] = useState(false);
  const [transitionStage, setTransitionStage] = useState(GAME_STAGES[0]);

  // Debug: Log game state changes
  useEffect(() => {
    console.log("Game state changed:", {
      gameStatus: gameState.gameStatus,
      lives: gameState.lives,
      currentQuestion: gameState.currentQuestionIndex + 1,
      hasQuestions: gameState.questions.length > 0,
    });
  }, [gameState.gameStatus, gameState.lives, gameState.currentQuestionIndex]);

  // Check for payment success with lives parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const livesParam = urlParams.get("lives");
    const paymentSuccess = urlParams.get("payment_success");

    console.log("Checking URL params:", {
      livesParam,
      paymentSuccess,
      currentStatus: gameState.gameStatus,
    });

    if (livesParam && paymentSuccess === "true") {
      const livesToAdd = parseInt(livesParam, 10);
      if (livesToAdd > 0) {
        console.log("Processing payment success:", {
          livesToAdd,
          currentLives: gameState.lives,
          currentStatus: gameState.gameStatus,
        });

        setGameState((prev) => {
          const newLives = prev.lives + livesToAdd;
          const shouldResume =
            prev.gameStatus === "failure" && prev.questions.length > 0;

          console.log("State update decision:", {
            oldLives: prev.lives,
            newLives,
            shouldResume,
            hasQuestions: prev.questions.length > 0,
            currentQuestion: prev.currentQuestionIndex + 1,
          });

          return {
            ...prev,
            lives: newLives,
            livesBought: prev.livesBought + livesToAdd,
            gameStatus: shouldResume ? "playing" : prev.gameStatus,
          };
        });
        setPurchasedLives(livesToAdd);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setPurchasedLives(0);
        }, 5000);

        // Clean up URL
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, []); // Run once on mount

  // Also check for URL parameters when window gains focus (user returns from Stripe)
  useEffect(() => {
    const handleFocus = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const livesParam = urlParams.get("lives");
      const paymentSuccess = urlParams.get("payment_success");

      if (livesParam && paymentSuccess === "true") {
        const livesToAdd = parseInt(livesParam, 10);
        if (livesToAdd > 0) {
          console.log("Focus event - Processing payment success:", {
            livesToAdd,
          });

          setGameState((prev) => {
            const newLives = prev.lives + livesToAdd;
            const shouldResume =
              prev.gameStatus === "failure" && prev.questions.length > 0;

            console.log("Focus event - State update:", {
              oldLives: prev.lives,
              newLives,
              shouldResume,
              currentQuestion: prev.currentQuestionIndex + 1,
            });

            return {
              ...prev,
              lives: newLives,
              livesBought: prev.livesBought + livesToAdd,
              gameStatus: shouldResume ? "playing" : prev.gameStatus,
            };
          });
          setPurchasedLives(livesToAdd);
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
            setPurchasedLives(0);
          }, 5000);

          // Clean up URL
          window.history.replaceState({}, document.title, "/");
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const startGame = useCallback(() => {
    let questions = getRandomQuestions(100); // Now using 100 questions for 4 stages
    questions = injectRandomRiddles(questions, 10);
    setGameState({
      currentQuestionIndex: 0,
      score: 0,
      lives: 3,
      questions,
      answeredQuestions: 0,
      personaScores: {},
      gameStatus: "playing",
      isChallengeRound: false,
      leaderboardEligible: false,
      perQuestionTimes: [],
      questionTimings: [],
      answerHistory: [],
      livesBought: 0,
      livesGained: 0,
      timeBank: initializeTimeBank(),
      currentStage: GAME_STAGES[0],
    });
    setGameStartTime(new Date());
    setSessionStart(new Date());
    setLeaderboardSaved(false);
  }, []);

  const startChallengeRound = useCallback(() => {
    let questions = getChallengeQuestions();
    questions = injectRandomRiddles(questions, 10);
    console.log("Starting challenge round, questions:", questions);
    setGameState({
      currentQuestionIndex: 0,
      score: 0,
      lives: 3,
      questions,
      answeredQuestions: 0,
      personaScores: {},
      gameStatus: "playing",
      isChallengeRound: true,
      leaderboardEligible: false,
      perQuestionTimes: [],
      questionTimings: [],
      answerHistory: [],
      livesBought: 0,
      livesGained: 0,
      timeBank: initializeTimeBank(),
      currentStage: GAME_STAGES[0],
    });
    setGameStartTime(new Date());
    setSessionStart(new Date());
    setLeaderboardSaved(false);
  }, []);

  const handleAnswer = useCallback(
    (
      answerIndex: number,
      timingData: {
        startTime: Date;
        endTime: Date;
        timeTaken: number;
        wasTimeout: boolean;
      }
    ) => {
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

      const timeInSeconds = Math.round(timingData.timeTaken / 1000);
      const questionTiming = {
        questionId: currentQuestion.id,
        startTime: timingData.startTime,
        endTime: timingData.endTime,
        timeTaken: timingData.timeTaken,
        wasTimeout: timingData.wasTimeout,
        answerIndex: answerIndex,
      };

      setGameState((prev) => {
        const newScore = isCorrect ? prev.score + 1 : prev.score;
        const newLives = loseLife ? prev.lives - 1 : prev.lives;
        const newAnsweredQuestions = prev.answeredQuestions + 1;
        const newLeaderboardEligible =
          newAnsweredQuestions >= THRESHOLD_QUESTIONS ||
          prev.leaderboardEligible;

        // Calculate current stage and time bank updates
        const questionNumber = prev.currentQuestionIndex + 1;
        const nextQuestionNumber = questionNumber + 1;
        const currentStage = getCurrentStage(questionNumber);
        const nextStage = getCurrentStage(nextQuestionNumber);
        const timeEarned = calculateTimeEarned(
          currentStage.timeLimit,
          timeInSeconds
        );
        const updatedTimeBank = addTimeToBank(prev.timeBank, timeEarned);

        // Check if we're transitioning to a new stage
        const isStageTransition =
          currentStage.id !== nextStage.id && nextQuestionNumber <= 100;
        if (isStageTransition) {
          setTransitionStage(nextStage);
          setShowStageTransition(true);
        }

        // Check game end conditions
        if (newLives <= 0) {
          return {
            ...prev,
            score: newScore,
            lives: newLives,
            answeredQuestions: newAnsweredQuestions,
            gameStatus: "failure",
            leaderboardEligible: newLeaderboardEligible,
            perQuestionTimes: [...prev.perQuestionTimes, timeInSeconds],
            questionTimings: [...prev.questionTimings, questionTiming],
            answerHistory: [...prev.answerHistory, answerIndex],
            timeBank: updatedTimeBank,
            currentStage: nextStage,
          };
        }
        if (newAnsweredQuestions >= 100) {
          // Updated to 100 questions
          return {
            ...prev,
            score: newScore,
            lives: newLives,
            answeredQuestions: newAnsweredQuestions,
            gameStatus: "success",
            leaderboardEligible: newLeaderboardEligible,
            perQuestionTimes: [...prev.perQuestionTimes, timeInSeconds],
            questionTimings: [...prev.questionTimings, questionTiming],
            answerHistory: [...prev.answerHistory, answerIndex],
            timeBank: updatedTimeBank,
            currentStage: nextStage,
          };
        }

        if (isCorrect && Math.random() < 0.2) {
          // Trigger life gained animation
          setShowLifeGained(true);
          setTimeout(() => setShowLifeGained(false), 3000);

          return {
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            lives: newLives + 1,
            livesGained: prev.livesGained + 1,
            answeredQuestions: newAnsweredQuestions,
            leaderboardEligible: newLeaderboardEligible,
            perQuestionTimes: [...prev.perQuestionTimes, timeInSeconds],
            questionTimings: [...prev.questionTimings, questionTiming],
            answerHistory: [...prev.answerHistory, answerIndex],
            timeBank: updatedTimeBank,
            currentStage: nextStage,
          };
        }

        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          score: newScore,
          lives: newLives,
          answeredQuestions: newAnsweredQuestions,
          leaderboardEligible: newLeaderboardEligible,
          perQuestionTimes: [...prev.perQuestionTimes, timeInSeconds],
          questionTimings: [...prev.questionTimings, questionTiming],
          answerHistory: [...prev.answerHistory, answerIndex],
          timeBank: updatedTimeBank,
          currentStage: nextStage,
        };
      });
    },
    [gameState.questions, gameState.currentQuestionIndex]
  );

  const openStore = () => {
    setGameState((prev) => ({ ...prev, gameStatus: "store" }));
  };

  const closeStore = () => {
    setGameState((prev) => {
      // If user has lives and an active game, return to playing; otherwise go to failure screen
      const hasActiveGame = prev.questions.length > 0;
      const hasLives = prev.lives > 0;

      if (hasActiveGame && hasLives) {
        return { ...prev, gameStatus: "playing" };
      } else if (hasActiveGame && !hasLives) {
        return { ...prev, gameStatus: "failure" };
      } else {
        return { ...prev, gameStatus: "menu" };
      }
    });
  };

  const respawnGame = () => {
    if (gameState.lives > 0 && gameState.questions.length > 0) {
      setGameState((prev) => ({ ...prev, gameStatus: "playing" }));
    }
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
      isChallengeRound: false,
      leaderboardEligible: false,
      perQuestionTimes: [],
      questionTimings: [],
      answerHistory: [],
      livesBought: 0,
      livesGained: 0,
      timeBank: initializeTimeBank(),
      currentStage: GAME_STAGES[0],
    });
  };

  const handleTradeTime = useCallback((livesToBuy: number) => {
    setGameState((prev) => {
      const updatedTimeBank = tradeTimeForLives(prev.timeBank, livesToBuy);
      if (updatedTimeBank) {
        return {
          ...prev,
          lives: prev.lives + livesToBuy,
          timeBank: updatedTimeBank,
        };
      }
      return prev; // Trade failed, not enough time
    });
  }, []);

  const handleStageTransitionComplete = useCallback(() => {
    setShowStageTransition(false);
  }, []);

  const handleLeaderboardSubmit = async (formData: LeaderboardFormData) => {
    try {
      setSavingToLeaderboard(true);
      setEmailError(null);
      const topPersona = calculatePersona(gameState.personaScores);
      const sessionDuration =
        sessionStart && sessionEnd
          ? Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 1000)
          : 0;
      const leaderboardEntry = await saveLeaderboardEntry(
        formData,
        {
          ...gameState,
          livesBought: gameState.livesBought,
          livesGained: gameState.livesGained,
        },
        topPersona,
        gameStartTime ?? undefined,
        sessionDuration
      );
      setLeaderboardSaved(true);
      // Send congratulatory email
      if (leaderboardEntry) {
        try {
          const res = await fetch(
            "/.netlify/functions/send-leaderboard-email",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: formData.email,
                firstName: formData.firstName,
                avatarUrl: leaderboardEntry.avatarUrl,
                lives: leaderboardEntry.livesRemaining,
                easterEggs: 0, // TODO: Track easter eggs properly
                score: gameState.score,
                questionsAnswered: gameState.answeredQuestions,
                persona: calculatePersona(gameState.personaScores),
              }),
            }
          );
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setEmailError(data.error || "Failed to send email");
            console.error("Email send failed:", data.error || res.statusText);
          }
        } catch (err) {
          setEmailError((err as Error).message || "Failed to send email");
          console.error("Email send error:", err);
        }
      }

      const userEntries = await getUserEntries(formData.email);
      const attempts = userEntries.length;
      const allEntries = await getLeaderboardEntries();
      const sorted = allEntries.sort(
        (a, b) => b.score - a.score || b.questionsAnswered - a.questionsAnswered
      );
      const rank = sorted.findIndex((e) => e.id === leaderboardEntry?.id) + 1;

      setUserAttempts(attempts);
      setUserRank(rank);

      // Pass attempts and rank to the success screen state/UI
    } catch (error) {
      console.error("Failed to save to leaderboard:", error);
      throw error; // Let the form component handle the error
    } finally {
      setSavingToLeaderboard(false);
    }
  };

  // Menu Screen
  if (gameState.gameStatus === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <img
              src={logo}
              alt="Zubo Logo"
              className="mx-auto mb-4 w-40 h-40 object-contain drop-shadow-xl"
            />
            <p className="text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Welcome to the Zubo Challenge! Master 4 stages, build your time
              bank, and discover your persona in the ultimate 100-question
              challenge.
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
                  <span>4 stages with increasing difficulty</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Sparkles className="w-5 h-5 text-purple-400 mr-3" />
                  <span>
                    20% chance to gain a life on correct answers (no max limit)
                  </span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">⏱️</span>
                  <span>Build time bank & trade for lives</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-pink-400 mr-3">♦</span>
                  <span>Discover your inner persona</span>
                </div>
              </div>
            </div>
          </div>

          <button
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
            onClick={startChallengeRound}
          >
            Play the Challenge
          </button>
        </div>
        <DebugPanel gameState={gameState} />
      </div>
    );
  }

  // Store Screen
  if (gameState.gameStatus === "store") {
    return (
      <Store
        onBack={closeStore}
        currentLevel={gameState.currentQuestionIndex + 1}
      />
    );
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
              {gameState.isChallengeRound
                ? "Challenge Complete!"
                : "Congratulations!"}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              You've completed{" "}
              {gameState.isChallengeRound
                ? "the challenge round"
                : "the main game"}{" "}
              with a score of {gameState.score}/100!
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

          {!leaderboardSaved && gameState.leaderboardEligible ? (
            <div className="mb-8">
              <LeaderboardForm
                onSubmit={handleLeaderboardSubmit}
                isLoading={savingToLeaderboard}
                gameResult="success"
                score={gameState.score}
                isChallengeRound={gameState.isChallengeRound}
                reachedThreshold={
                  gameState.answeredQuestions >= THRESHOLD_QUESTIONS
                }
              />
            </div>
          ) : leaderboardSaved ? (
            <div className="bg-green-900/50 border border-green-700 rounded-2xl p-6 mb-8">
              <div className="text-green-400 text-xl font-bold mb-2">
                Score Saved to Leaderboard!
              </div>
              <p className="text-gray-300">
                Your achievement has been recorded. Check the leaderboard to see
                your ranking!
              </p>
              {userAttempts !== null && userRank !== null && (
                <div className="mt-4 text-lg text-white">
                  <div>
                    You have played{" "}
                    <span className="font-bold text-purple-400">
                      {userAttempts}
                    </span>{" "}
                    time{userAttempts === 1 ? "" : "s"}.
                  </div>
                  <div>
                    Your current leaderboard rank:{" "}
                    <span className="font-bold text-yellow-400">
                      #{userRank}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-900/50 border border-yellow-700 rounded-2xl p-6 mb-8">
              <div className="text-yellow-400 text-xl font-bold mb-2">
                Keep Going!
              </div>
              <p className="text-gray-300">
                Answer more questions to be eligible for the leaderboard!
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            {!gameState.isChallengeRound ? (
              <button
                onClick={startChallengeRound}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Challenge Round
              </button>
            ) : null}
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Play Again
            </button>
          </div>

          {emailError && (
            <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-red-700 text-white px-6 py-3 rounded-xl shadow-2xl">
              <span className="font-bold">Email Error:</span> {emailError}
            </div>
          )}
        </div>
        <DebugPanel gameState={gameState} />
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
                : `You scored ${gameState.score}/100. You need at least ${THRESHOLD_QUESTIONS} questions answered to be eligible for the leaderboard.`}
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

          {!leaderboardSaved && gameState.leaderboardEligible ? (
            <div className="mb-8">
              <LeaderboardForm
                onSubmit={handleLeaderboardSubmit}
                isLoading={savingToLeaderboard}
                gameResult="failure"
                score={gameState.score}
                isChallengeRound={gameState.isChallengeRound}
                reachedThreshold={
                  gameState.answeredQuestions >= THRESHOLD_QUESTIONS
                }
              />
            </div>
          ) : leaderboardSaved ? (
            <div className="bg-green-900/50 border border-green-700 rounded-2xl p-6 mb-8">
              <div className="text-green-400 text-xl font-bold mb-2">
                Score Saved to Leaderboard!
              </div>
              <p className="text-gray-300">
                Your progress has been recorded. Keep playing to improve your
                score!
              </p>
            </div>
          ) : (
            <div className="bg-yellow-900/50 border border-yellow-700 rounded-2xl p-6 mb-8">
              <div className="text-yellow-400 text-xl font-bold mb-2">
                Keep Going!
              </div>
              <p className="text-gray-300">
                Answer more questions to be eligible for the leaderboard!
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
            {gameState.lives > 0 && gameState.questions.length > 0 ? (
              <>
                <button
                  onClick={respawnGame}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Respawn (Question {gameState.currentQuestionIndex + 1})
                </button>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Over
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {emailError && (
            <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-red-700 text-white px-6 py-3 rounded-xl shadow-2xl">
              <span className="font-bold">Email Error:</span> {emailError}
            </div>
          )}
        </div>
        <DebugPanel gameState={gameState} />
      </div>
    );
  }

  // Playing Screen
  if (gameState.gameStatus === "playing" && gameState.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center">
          <div className="text-4xl text-red-400 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            No Questions Loaded
          </h1>
          <p className="text-gray-300 mb-4">
            There was a problem loading the challenge questions. Please try
            again.
          </p>
          <button
            onClick={resetGame}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Back to Menu
          </button>
        </div>
        <DebugPanel gameState={gameState} />
      </div>
    );
  }

  // Before rendering QuestionComponent, add a check for undefined question
  if (!gameState.questions[gameState.currentQuestionIndex]) {
    console.log(
      "No question to render:",
      gameState.currentQuestionIndex,
      gameState.questions.length
    );
    return (
      <div className="text-center text-red-400 text-2xl mt-12">
        No more questions! (Debug: {gameState.currentQuestionIndex} /{" "}
        {gameState.questions.length})
      </div>
    );
  }

  return (
    <div
      className={
        visualSurprise
          ? "min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200 p-4 transition-all duration-700"
          : `min-h-screen bg-gradient-to-br ${gameState.currentStage.backgroundColor} p-4 transition-all duration-1000`
      }
    >
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

      {/* Time Bank Component */}
      <div className="max-w-4xl mx-auto mb-8">
        <TimeBankComponent
          timeBank={gameState.timeBank}
          currentStage={gameState.currentStage}
          questionNumber={gameState.currentQuestionIndex + 1}
          onTradeTime={handleTradeTime}
          gameStatus={gameState.gameStatus}
        />
      </div>

      {/* Life Gained Animation */}
      {showLifeGained && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-6 rounded-2xl shadow-2xl border-4 border-green-300 animate-pulse">
            <div className="flex items-center justify-center">
              <div className="animate-spin mr-3">
                <Heart className="w-10 h-10 text-red-300" fill="currentColor" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">+1 Life Gained!</div>
                <div className="text-lg opacity-90">🎉 Lucky bonus! 🎉</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-8 right-8 z-50">
          <div className="bg-green-600 text-white px-8 py-4 rounded-xl shadow-2xl animate-pulse">
            <div className="flex items-center">
              <Heart className="w-6 h-6 mr-2" />
              <span className="font-bold">
                {purchasedLives > 0
                  ? `+${purchasedLives} lives purchased successfully!`
                  : "Lives added successfully!"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Question Component */}
      <QuestionComponent
        question={gameState.questions[gameState.currentQuestionIndex]}
        onAnswer={handleAnswer}
        questionNumber={gameState.currentQuestionIndex + 1}
        totalQuestions={gameState.questions.length}
        timeLimit={gameState.currentStage.timeLimit}
      />

      <DebugPanel gameState={gameState} />

      {/* Stage Transition Animation */}
      <BalloonAnimation
        stage={transitionStage}
        show={showStageTransition}
        onComplete={handleStageTransitionComplete}
      />
    </div>
  );
};
