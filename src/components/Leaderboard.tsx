import React, { useEffect, useState } from "react";
import {
  getTopLeaderboardEntries,
  getLeaderboardStats,
  getLeaderboardEntries,
} from "../utils/leaderboard";
import { LeaderboardEntry } from "../types";
import { Trophy, Clock, Target, Users, TrendingUp } from "lucide-react";

// Avatar component with robust error handling
const Avatar: React.FC<{
  entry: LeaderboardEntry;
  size?: number;
}> = ({ entry, size = 40 }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create a unique seed for each user based on their email and name
  const createUniqueSeed = (entry: LeaderboardEntry): string => {
    const emailSeed = entry.email || "unknown";
    const nameSeed = `${entry.firstName}-${entry.lastName}`.toLowerCase();
    const combinedSeed = `${emailSeed}-${nameSeed}-${entry.id}`;

    // Create a simple hash for consistent avatars
    let hash = 0;
    for (let i = 0; i < combinedSeed.length; i++) {
      const char = combinedSeed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  };

  const uniqueSeed = createUniqueSeed(entry);
  const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${uniqueSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  const defaultUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=default-${entry.id}&backgroundColor=f3f4f6`;

  const getImageUrl = () => {
    if (imageError) return defaultUrl;
    return entry.avatarUrl || fallbackUrl;
  };

  const handleImageError = () => {
    console.warn(
      "Avatar failed to load for:",
      entry.firstName,
      entry.lastName,
      "URL:",
      getImageUrl(),
      "Seed:",
      uniqueSeed
    );
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-300 rounded-full animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
      <img
        src={getImageUrl()}
        alt={`${entry.firstName} ${entry.lastName} avatar`}
        className={`rounded-full border-2 border-purple-400 bg-gray-100 transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        style={{ width: size, height: size }}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export const Leaderboard: React.FC = () => {
  const [topEntries, setTopEntries] = useState<LeaderboardEntry[]>([]);
  const [allEntries, setAllEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<{
    totalPlayers: number;
    averageScore: number;
    highestScore: number;
    totalGames: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to calculate percentile for a given score
  const calculatePercentile = (score: number, allScores: number[]): number => {
    if (allScores.length === 0) return 0;

    const sortedScores = [...allScores].sort((a, b) => a - b);
    const belowCount = sortedScores.filter((s) => s < score).length;
    const percentile = (belowCount / sortedScores.length) * 100;

    return Math.round(percentile);
  };

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        const [topEntries, allEntries, leaderboardStats] = await Promise.all([
          getTopLeaderboardEntries(10),
          getLeaderboardEntries(),
          getLeaderboardStats(),
        ]);
        setTopEntries(topEntries);
        setAllEntries(allEntries);
        setStats(leaderboardStats);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load leaderboard"
        );
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
          <h1 className="text-2xl font-bold text-white mb-2">
            Error Loading Leaderboard
          </h1>
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
          <p className="text-gray-300 text-lg">
            Top performers in the Zubo challenge
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white text-center">
                {stats.totalPlayers}
              </div>
              <div className="text-gray-400 text-center">Total Players</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white text-center">
                {stats.averageScore}
              </div>
              <div className="text-gray-400 text-center">Average Score</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white text-center">
                {stats.highestScore}
              </div>
              <div className="text-gray-400 text-center">Highest Score</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white text-center">
                {stats.totalGames}
              </div>
              <div className="text-gray-400 text-center">Total Games</div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="grid grid-cols-8 gap-4 mb-4 text-gray-400 font-medium px-4">
            <div className="text-center">#</div>
            <div className="col-span-2">Player</div>
            <div className="text-center">Score</div>
            <div className="text-center">Mode</div>
            <div className="text-center">Persona</div>
            <div className="text-center">Questions</div>
            <div className="text-center flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Percentile</span>
              <span className="sm:hidden">%ile</span>
            </div>
          </div>

          <div className="space-y-2">
            {topEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`grid grid-cols-8 gap-4 items-center p-4 rounded-xl transition-colors ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30"
                    : index === 2
                    ? "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-600/30"
                    : "bg-gray-700/50 hover:bg-gray-700/70"
                }`}
              >
                {/* Rank */}
                <div className="text-center">
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

                {/* Player */}
                <div className="col-span-2 flex items-center gap-3 min-w-0">
                  <Avatar entry={entry} />
                  <div className="font-medium text-white truncate">
                    {entry.firstName} {entry.lastName}
                  </div>
                </div>

                {/* Score */}
                <div className="text-center">
                  <div className="text-xl font-bold text-white">
                    {entry.score}
                  </div>
                </div>

                {/* Mode */}
                <div className="text-center">
                  {entry.endurance ? (
                    <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                      🔥 Endurance
                    </div>
                  ) : (
                    <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                      Normal
                    </div>
                  )}
                </div>

                {/* Persona */}
                <div className="text-center">
                  <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 truncate max-w-full">
                    {entry.persona}
                  </div>
                </div>

                {/* Questions */}
                <div className="text-center">
                  <div className="text-white">{entry.questionsAnswered}</div>
                  <div className="text-xs text-gray-400">
                    {entry.timeTaken !== undefined
                      ? `${Math.round(entry.timeTaken / 60)}m`
                      : "-"}
                  </div>
                </div>

                {/* Percentile */}
                <div className="text-center">
                  {(() => {
                    if (allEntries.length === 0) {
                      return <div className="text-gray-400">-</div>;
                    }

                    const allScores = allEntries.map((e) => e.score);
                    const percentile = calculatePercentile(
                      entry.score,
                      allScores
                    );
                    const percentileColor =
                      percentile >= 90
                        ? "text-green-400"
                        : percentile >= 75
                        ? "text-blue-400"
                        : percentile >= 50
                        ? "text-yellow-400"
                        : "text-gray-400";

                    // Handle special cases for display
                    const displayText =
                      percentile === 100
                        ? "Top"
                        : percentile === 0
                        ? "Bot"
                        : `${percentile}th`;

                    return (
                      <div className={`text-lg font-bold ${percentileColor}`}>
                        {displayText}
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
              <h3 className="text-xl font-bold text-white mb-2">
                No Scores Yet
              </h3>
              <p className="text-gray-400">
                Be the first to complete the challenge!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
