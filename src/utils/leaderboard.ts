import { LeaderboardEntry, LeaderboardFormData, GameState } from '../types';
import { supabase, handleSupabaseError } from './supabase';

// Generate a unique ID for each entry
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all leaderboard entries from Supabase
export const getLeaderboardEntries = async (): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('questions_answered', { ascending: false });

    if (error) throw error;

    return data.map(entry => ({
      id: entry.id,
      firstName: entry.first_name,
      lastName: entry.last_name,
      email: entry.email,
      score: entry.score,
      livesRemaining: entry.lives_remaining,
      questionsAnswered: entry.questions_answered,
      gameStatus: entry.game_status,
      persona: entry.persona || undefined,
      completedAt: new Date(entry.completed_at),
      timeTaken: entry.time_taken || undefined,
      isChallengeRound: entry.is_challenge_round ?? false,
      reachedLeaderboardThreshold: entry.reached_leaderboard_threshold ?? false
    }));
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

// Save a new leaderboard entry to Supabase
export const saveLeaderboardEntry = async (
  formData: LeaderboardFormData,
  gameState: GameState,
  persona?: string,
  startTime?: Date
): Promise<LeaderboardEntry> => {
  try {
    const entry = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      score: gameState.score,
      lives_remaining: gameState.lives,
      questions_answered: gameState.answeredQuestions,
      game_status: gameState.gameStatus as 'success' | 'failure',
      persona: persona || null,
      completed_at: new Date().toISOString(),
      time_taken: startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : null
    };

    const { data, error } = await supabase
      .from('leaderboard')
      .insert([entry])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      score: data.score,
      livesRemaining: data.lives_remaining,
      questionsAnswered: data.questions_answered,
      gameStatus: data.game_status,
      persona: data.persona || undefined,
      completedAt: new Date(data.completed_at),
      timeTaken: data.time_taken || undefined,
      isChallengeRound: data.is_challenge_round ?? false,
      reachedLeaderboardThreshold: data.reached_leaderboard_threshold ?? false
    };
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

// Get top entries (default: top 10)
export const getTopEntries = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('questions_answered', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(entry => ({
      id: entry.id,
      firstName: entry.first_name,
      lastName: entry.last_name,
      email: entry.email,
      score: entry.score,
      livesRemaining: entry.lives_remaining,
      questionsAnswered: entry.questions_answered,
      gameStatus: entry.game_status,
      persona: entry.persona || undefined,
      completedAt: new Date(entry.completed_at),
      timeTaken: entry.time_taken || undefined,
      isChallengeRound: entry.is_challenge_round ?? false,
      reachedLeaderboardThreshold: entry.reached_leaderboard_threshold ?? false
    }));
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

// Get entries by email (for user's history)
export const getUserEntries = async (email: string): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('email', email.toLowerCase())
      .order('completed_at', { ascending: false });

    if (error) throw error;

    return data.map(entry => ({
      id: entry.id,
      firstName: entry.first_name,
      lastName: entry.last_name,
      email: entry.email,
      score: entry.score,
      livesRemaining: entry.lives_remaining,
      questionsAnswered: entry.questions_answered,
      gameStatus: entry.game_status,
      persona: entry.persona || undefined,
      completedAt: new Date(entry.completed_at),
      timeTaken: entry.time_taken || undefined,
      isChallengeRound: entry.is_challenge_round ?? false,
      reachedLeaderboardThreshold: entry.reached_leaderboard_threshold ?? false
    }));
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

// Get leaderboard statistics
export const getLeaderboardStats = async () => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('score, email');

    if (error) throw error;

    const scores = data?.map(entry => entry.score) || [];
    const totalPlayers = new Set(data?.map(entry => entry.email)).size;
    const totalGames = scores.length;
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

    return {
      totalPlayers,
      averageScore,
      highestScore,
      totalGames
    };
  } catch (error) {
    throw handleSupabaseError(error);
  }
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Future: This is where you'd add cloud database integration
export const syncWithCloud = async (): Promise<void> => {
  // TODO: Implement cloud sync when ready
  // This would sync localStorage data with your chosen cloud provider
  // (Firebase, Supabase, Netlify Functions + database, etc.)
  console.log('Cloud sync not implemented yet');
};

export const getTopLeaderboardEntries = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}; 