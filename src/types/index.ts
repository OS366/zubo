export interface Question {
  id: number;
  text: string;
  options: string[];
  answer?: number; // for non-weighted questions
  weights?: Record<string, number>; // for personality questions
  type: 'logical' | 'analytical' | 'gk' | 'weighted';
  timed: boolean;
}

export interface GameState {
  currentQuestionIndex: number;
  score: number;
  lives: number;
  questions: Question[];
  answeredQuestions: number;
  personaScores: Record<string, number>;
  gameStatus: 'playing' | 'success' | 'failure' | 'menu' | 'store';
}