export interface Question {
  id: number;
  text: string;
  options: string[];
  answer?: number; // for non-weighted questions
  weights?: Record<string, number>; // for personality questions
  type: 'logical' | 'analytical' | 'gk' | 'weighted' | 'riddle';
  timed: boolean;
  difficulty?: 'tough' | 'regular'; // new field for question difficulty
}

export interface QuestionTiming {
  questionId: number;
  startTime: Date;
  endTime: Date;
  timeTaken: number; // in milliseconds
  wasTimeout: boolean;
  answerIndex: number;
}

export interface GameStage {
  id: number;
  name: string;
  questionRange: [number, number]; // [start, end] inclusive
  timeLimit: number; // seconds per question
  backgroundColor: string;
  balloonColor: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface TimeBank {
  totalSeconds: number;
  earnedThisQuestion: number;
  livesTraded: number; // number of lives purchased with time
}

export interface GameState {
  currentQuestionIndex: number;
  score: number;
  lives: number;
  questions: Question[];
  answeredQuestions: number;
  personaScores: Record<string, number>;
  gameStatus: 'playing' | 'success' | 'failure' | 'menu' | 'store' | 'challenge'; // added challenge status
  isChallengeRound: boolean; // new field to track if we're in the challenge round
  isEnduranceMode: boolean; // new field for endurance mode
  leaderboardEligible: boolean; // new field to track if player is eligible for leaderboard
  perQuestionTimes: number[]; // seconds taken for each question
  questionTimings: QuestionTiming[]; // detailed timing information for each question
  answerHistory: number[];
  livesBought: number;
  livesGained: number;
  timeBank: TimeBank; // new time bank system
  currentStage: GameStage; // current stage information
}

export interface LeaderboardEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  score: number;
  livesRemaining: number;
  questionsAnswered: number;
  gameStatus: 'success' | 'failure';
  persona?: string;
  completedAt: Date;
  timeTaken?: number; // in seconds
  isChallengeRound: boolean; // new field to track if score is from challenge round
  endurance: boolean; // new field for endurance mode
  reachedLeaderboardThreshold: boolean; // new field to track if player reached 25 questions
  avatarUrl: string; // avatar/gravatar URL
  ageRange: string; // e.g., '10-19', '20-29', etc.
  answerHistory: number[]; // index of selected answer for each question
  sessionDuration: number; // total session duration in seconds
  attempts: number; // number of times this user has played
  feedback?: string;
  rating?: number;
  leaderboardRank?: number;
  livesBought: number;
  livesGained: number;
  timeBankSeconds: number; // total time bank accumulated
  timeBankBonus: number; // leaderboard bonus from time bank
}

export interface LeaderboardFormData {
  firstName: string;
  lastName: string;
  email: string;
  ageRange: string;
  feedback?: string;
  rating?: number;
}