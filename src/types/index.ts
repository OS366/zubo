export interface Question {
  id: number;
  text: string;
  options: string[];
  answer?: number; // for non-weighted questions
  weights?: Record<string, number>; // for personality questions
  type: 'logical' | 'analytical' | 'gk' | 'weighted';
  timed: boolean;
  difficulty?: 'tough' | 'regular'; // new field for question difficulty
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
  leaderboardEligible: boolean; // new field to track if player is eligible for leaderboard
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
  reachedLeaderboardThreshold: boolean; // new field to track if player reached 25 questions
}

export interface LeaderboardFormData {
  firstName: string;
  lastName: string;
  email: string;
}