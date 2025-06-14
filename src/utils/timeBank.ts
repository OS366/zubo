import { GameStage, TimeBank } from '../types';

// Define the 4 game stages with increasing difficulty
export const GAME_STAGES: GameStage[] = [
  {
    id: 1,
    name: "Foundation",
    questionRange: [1, 25],
    timeLimit: 60,
    backgroundColor: "from-green-900 via-emerald-900 to-teal-900",
    balloonColor: "bg-green-500",
    difficulty: 'easy'
  },
  {
    id: 2,
    name: "Ascension", 
    questionRange: [26, 50],
    timeLimit: 45,
    backgroundColor: "from-blue-900 via-indigo-900 to-purple-900",
    balloonColor: "bg-blue-500",
    difficulty: 'medium'
  },
  {
    id: 3,
    name: "Mastery",
    questionRange: [51, 75], 
    timeLimit: 30,
    backgroundColor: "from-purple-900 via-pink-900 to-red-900",
    balloonColor: "bg-purple-500",
    difficulty: 'hard'
  },
  {
    id: 4,
    name: "Transcendence",
    questionRange: [76, 100],
    timeLimit: 20,
    backgroundColor: "from-red-900 via-orange-900 to-yellow-900",
    balloonColor: "bg-red-500",
    difficulty: 'expert'
  }
];

// Time bank constants
export const TIME_TO_LIFE_RATIO = 1000; // 1000 seconds = 1 life
export const LEADERBOARD_TIME_BONUS = 4; // Level 4 bonus for leaderboard

// Get current stage based on question number
export function getCurrentStage(questionNumber: number): GameStage {
  for (const stage of GAME_STAGES) {
    if (questionNumber >= stage.questionRange[0] && questionNumber <= stage.questionRange[1]) {
      return stage;
    }
  }
  // Default to first stage if somehow out of range
  return GAME_STAGES[0];
}

// Calculate time earned for a question
export function calculateTimeEarned(timeLimit: number, timeUsed: number): number {
  const timeRemaining = Math.max(0, timeLimit - timeUsed);
  return timeRemaining;
}

// Add time to time bank
export function addTimeToBank(timeBank: TimeBank, secondsEarned: number): TimeBank {
  return {
    ...timeBank,
    totalSeconds: timeBank.totalSeconds + secondsEarned,
    earnedThisQuestion: secondsEarned
  };
}

// Trade time for lives (1000 seconds = 1 life)
export function tradeTimeForLives(timeBank: TimeBank, livesToBuy: number): TimeBank | null {
  // Validate input
  if (livesToBuy <= 0) {
    return null;
  }
  
  const timeRequired = livesToBuy * TIME_TO_LIFE_RATIO;
  
  if (timeBank.totalSeconds >= timeRequired) {
    return {
      ...timeBank,
      totalSeconds: timeBank.totalSeconds - timeRequired,
      livesTraded: timeBank.livesTraded + livesToBuy,
      earnedThisQuestion: 0
    };
  }
  
  return null; // Not enough time
}

// Calculate maximum lives that can be purchased
export function getMaxLivesAvailable(timeBank: TimeBank): number {
  return Math.floor(timeBank.totalSeconds / TIME_TO_LIFE_RATIO);
}

// Calculate leaderboard time bonus (for level 4)
export function calculateLeaderboardBonus(timeBank: TimeBank): number {
  return Math.floor(timeBank.totalSeconds / LEADERBOARD_TIME_BONUS);
}

// Format time for display (MM:SS)
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Get stage progress percentage
export function getStageProgress(questionNumber: number, stage: GameStage): number {
  const [start, end] = stage.questionRange;
  const progress = ((questionNumber - start) / (end - start + 1)) * 100;
  return Math.min(100, Math.max(0, progress));
}

// Initialize time bank
export function initializeTimeBank(): TimeBank {
  return {
    totalSeconds: 0,
    earnedThisQuestion: 0,
    livesTraded: 0
  };
} 