import { LeaderboardEntry, LeaderboardFormData, GameState } from '../types';
import { supabase, handleSupabaseError } from './supabase';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || '';
console.log('ENCRYPTION_KEY:', ENCRYPTION_KEY ? '[set]' : '[missing]');
function encryptField(value: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('Encryption key missing! Refusing to store plain text.');
  }
  return CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
}
function decryptField(value: string): string {
  if (!ENCRYPTION_KEY) return value;
  try {
    const bytes = CryptoJS.AES.decrypt(value, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || value;
  } catch {
    return value;
  }
}



// Helper to generate a DiceBear avatar URL with fallback
function getAvatarUrl(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  // Create a simple hash from email for consistent avatars
  let hash = 0;
  for (let i = 0; i < cleanEmail.length; i++) {
    const char = cleanEmail.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const seed = Math.abs(hash).toString();
  
  // Use PNG format which is more reliable in emails
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50&size=200`;
  console.log('Generated avatar URL for', cleanEmail, ':', avatarUrl);
  return avatarUrl;
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
    // 1. Check for existing entry by email only (since names can have different cases)
    const { data: existing, error: fetchError } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('email', encryptField(formData.email.trim().toLowerCase()))
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const plainEmail = formData.email.trim().toLowerCase();
    const avatarUrl = getAvatarUrl(plainEmail);
    const entry = {
      first_name: encryptField(formData.firstName.trim()),
      last_name: encryptField(formData.lastName.trim()),
      email: encryptField(plainEmail),
      score: gameState.score,
      lives_remaining: gameState.lives,
      questions_answered: typeof gameState.answeredQuestions === 'number' ? gameState.answeredQuestions : 0,
      game_status: gameState.gameStatus as 'success' | 'failure',
      persona: persona || null,
      completed_at: new Date().toISOString(),
      time_taken: startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : null,
      is_challenge_round: gameState.isChallengeRound ?? false,
      endurance: gameState.isEnduranceMode ?? false,
      reached_leaderboard_threshold: gameState.leaderboardEligible ?? false,
      avatar_url: avatarUrl,
      age_range: formData.ageRange,
      answer_history: gameState.answerHistory,
      session_duration: sessionDuration ?? 0,
      feedback: encryptField(formData.feedback || ''),
      rating: formData.rating || null,
      lives_bought: gameState.livesBought,
      lives_gained: gameState.livesGained,
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
interface DatabaseEntry {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  score: number;
  lives_remaining: number;
  questions_answered: number;
  game_status: 'success' | 'failure';
  persona?: string;
  completed_at: string;
  time_taken?: number;
  is_challenge_round: boolean;
  endurance?: boolean;
  reached_leaderboard_threshold: boolean;
  avatar_url?: string;
  age_range?: string;
  answer_history?: number[];
  session_duration?: number;
  attempts?: number;
  feedback?: string;
  rating?: number;
  leaderboard_rank?: number;
  lives_bought?: number;
  lives_gained?: number;
}

function mapLeaderboardEntry(entry: DatabaseEntry): LeaderboardEntry {
  const decryptedEmail = decryptField(entry.email);
  const avatarUrl = entry.avatar_url || getAvatarUrl(decryptedEmail);
  
  if (!entry.questions_answered || !entry.completed_at) {
    console.warn('Leaderboard entry missing questions_answered or completed_at:', entry);
  }
  
  console.log('Mapping leaderboard entry:', {
    id: entry.id,
    email: decryptedEmail,
    avatarUrl,
    storedAvatarUrl: entry.avatar_url
  });
  
  return {
    id: entry.id,
    firstName: decryptField(entry.first_name),
    lastName: decryptField(entry.last_name),
    email: decryptedEmail,
    score: entry.score,
    livesRemaining: entry.lives_remaining,
    questionsAnswered: typeof entry.questions_answered === 'number' ? entry.questions_answered : 0,
    gameStatus: entry.game_status,
    persona: entry.persona || undefined,
    completedAt: entry.completed_at ? new Date(entry.completed_at) : new Date(0),
    timeTaken: entry.time_taken || undefined,
    isChallengeRound: entry.is_challenge_round ?? false,
    endurance: entry.endurance ?? false,
    reachedLeaderboardThreshold: entry.reached_leaderboard_threshold ?? false,
    avatarUrl,
    ageRange: entry.age_range || '',
    answerHistory: entry.answer_history || [],
    sessionDuration: entry.session_duration || 0,
    attempts: entry.attempts || 0,
    feedback: decryptField(entry.feedback) || undefined,
    rating: entry.rating || undefined,
    leaderboardRank: entry.leaderboard_rank || undefined,
    livesBought: entry.lives_bought || 0,
    livesGained: entry.lives_gained || 0,
    timeBankSeconds: 0, // Add default values for missing fields in LeaderboardEntry
    timeBankBonus: 0,
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
      .order('questions_answered', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapLeaderboardEntry);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
}; 