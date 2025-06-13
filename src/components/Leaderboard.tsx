import React, { useEffect, useState } from "react";
import { getTopLeaderboardEntries, getLeaderboardStats } from "../utils/leaderboard";
import { LeaderboardEntry } from "../types";
import { Trophy, Star, Clock, Target, Users } from "lucide-react";

export const Leaderboard: React.FC = () => {
  const [topEntries, setTopEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<{
    totalPlayers: number;
    averageScore: number;
    highestScore: number;
    totalGames: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        const [entries, leaderboardStats] = await Promise.all([
          getTopLeaderboardEntries(10),
          getLeaderboardStats()
        ]);
        setTopEntries(entries);
        setStats(leaderboardStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Error Loading Leaderboard</h1>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Leaderboard</h1>
          <p className="text-gray-300 text-lg">Top performers in the Zubo challenge</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white text-center">{stats.totalPlayers}</div>
              <div className="text-gray-400 text-center">Total Players</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white text-center">{stats.averageScore}</div>
              <div className="text-gray-400 text-center">Average Score</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white text-center">{stats.highestScore}</div>
              <div className="text-gray-400 text-center">Highest Score</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white text-center">{stats.totalGames}</div>
              <div className="text-gray-400 text-center">Total Games</div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl">
          <div className="grid grid-cols-12 gap-4 mb-4 text-gray-400 font-medium px-4">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-3">Player</div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-2 text-center">Persona</div>
            <div className="col-span-2 text-center">Questions</div>
            <div className="col-span-2 text-center">Date</div>
            <div className="col-span-2 text-center">Efficiency</div>
          </div>

          <div className="space-y-2">
            {topEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`grid grid-cols-12 gap-4 items-center p-4 rounded-xl transition-colors ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30"
                    : index === 2
                    ? "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-600/30"
                    : "bg-gray-700/50 hover:bg-gray-700/70"
                }`}
              >
                <div className="col-span-1 text-center">
                  {index === 0 ? (
                    <Trophy className="w-6 h-6 text-yellow-400 mx-auto" />
                  ) : index === 1 ? (
                    <Trophy className="w-6 h-6 text-gray-400 mx-auto" />
                  ) : index === 2 ? (
                    <Trophy className="w-6 h-6 text-amber-600 mx-auto" />
                  ) : (
                    <span className="text-gray-400">{index + 1}</span>
                  )}
                </div>
                <div className="col-span-3 flex items-center gap-3">
                  <img 
                    src={entry.avatarUrl} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full border-2 border-purple-400 bg-white" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=default';
                    }}
                  />
                  <div className="font-medium text-white">
                    {entry.firstName} {entry.lastName}
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <div className="text-xl font-bold text-white">{entry.score}</div>
                </div>
                <div className="col-span-2 text-center">
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300">
                    {entry.persona}
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <div className="text-white">{entry.questionsAnswered}</div>
                  <div className="text-sm text-gray-400">
                    {entry.timeTaken !== undefined ? `${Math.round(entry.timeTaken / 60)}m` : '-'}
                  </div>
                </div>
                <div className="col-span-2 text-center text-gray-400">
                  {entry.completedAt ? entry.completedAt.toLocaleDateString() : '-'}
                </div>
                <div className="col-span-2 text-center">
                  {(() => {
                    const extraLives = Math.max(0, entry.livesRemaining - 3);
                    const totalExtraLives = Math.max(1, (entry.livesBought || 0) + (entry.livesGained || 0));
                    const efficiency = extraLives / totalExtraLives;
                    return (
                      <div className="text-xl font-bold text-green-400">
                        {(efficiency * 100).toFixed(0)}%
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

          {topEntries.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-2">No Scores Yet</h3>
              <p className="text-gray-400">Be the first to complete the challenge!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 