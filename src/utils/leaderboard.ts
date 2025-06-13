import { LeaderboardEntry, LeaderboardFormData, GameState } from '../types';
import { supabase, handleSupabaseError } from './supabase';

// Generate a unique ID for each entry
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper to generate a DiceBear avatar URL
function getAvatarUrl(email: string) {
  const hash = encodeURIComponent(email.trim().toLowerCase());
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${hash}`;
}

// Get all leaderboard entries from Supabase
export const getLeaderboardEntries = async (): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('questions_answered', { ascending: false });

    if (error) throw error;

    return data.map(mapLeaderboardEntry);
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
  startTime?: Date,
  sessionDuration?: number
): Promise<LeaderboardEntry | null> => {
  try {
    // 1. Check for existing entry
    const { data: existing, error: fetchError } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('first_name', formData.firstName.trim())
      .eq('last_name', formData.lastName.trim())
      .eq('email', formData.email.trim().toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const avatarUrl = getAvatarUrl(formData.email);
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
      time_taken: startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : null,
      is_challenge_round: gameState.isChallengeRound ?? false,
      reached_leaderboard_threshold: gameState.leaderboardEligible ?? false,
      avatar_url: avatarUrl,
      age_range: formData.ageRange,
      answer_history: gameState.answerHistory,
      session_duration: sessionDuration ?? 0,
      feedback: formData.feedback || null,
      rating: formData.rating || null,
    };

    if (existing) {
      // 2. If found, update only if new score is higher
      if (gameState.score > existing.score) {
        const { data, error } = await supabase
          .from('leaderboard')
          .update(entry)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return mapLeaderboardEntry(data);
      } else {
        // Return existing entry if not updated
        return mapLeaderboardEntry(existing);
      }
    } else {
      // 3. If not found, insert new row
      const { data, error } = await supabase
        .from('leaderboard')
        .insert([entry])
        .select()
        .single();
      if (error) throw error;
      return mapLeaderboardEntry(data);
    }
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

// Update mapping code to include avatarUrl
function mapLeaderboardEntry(entry: any): LeaderboardEntry {
  return {
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
    reachedLeaderboardThreshold: entry.reached_leaderboard_threshold ?? false,
    avatarUrl: entry.avatar_url || getAvatarUrl(entry.email),
    ageRange: entry.age_range || '',
    answerHistory: entry.answer_history || [],
    sessionDuration: entry.session_duration || 0,
    attempts: entry.attempts || 0,
    feedback: entry.feedback || undefined,
    rating: entry.rating || undefined,
    leaderboardRank: entry.leaderboard_rank || undefined,
  };
}

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

    return data.map(mapLeaderboardEntry);
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

    return data.map(mapLeaderboardEntry);
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