import React, { useState } from "react";
import { Clock, Heart, Trophy, Zap } from "lucide-react";
import { TimeBank as TimeBankType, GameStage } from "../types";
import {
  formatTime,
  getMaxLivesAvailable,
  tradeTimeForLives,
  calculateLeaderboardBonus,
  getStageProgress,
} from "../utils/timeBank";

interface TimeBankProps {
  timeBank: TimeBankType;
  currentStage: GameStage;
  questionNumber: number;
  onTradeTime: (livesToBuy: number) => void;
  gameStatus: string;
}

export const TimeBankComponent: React.FC<TimeBankProps> = ({
  timeBank,
  currentStage,
  questionNumber,
  onTradeTime,
  gameStatus,
}) => {
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [livesToBuy, setLivesToBuy] = useState(1);

  const maxLivesAvailable = getMaxLivesAvailable(timeBank);
  const stageProgress = getStageProgress(questionNumber, currentStage);
  const leaderboardBonus = calculateLeaderboardBonus(timeBank);

  const handleTrade = () => {
    if (livesToBuy > 0 && livesToBuy <= maxLivesAvailable) {
      onTradeTime(livesToBuy);
      setShowTradeModal(false);
      setLivesToBuy(1);
    }
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
      {/* Stage Information */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Stage {currentStage.id}: {currentStage.name}
          </h3>
          <span className="text-sm text-gray-300">Q{questionNumber}/100</span>
        </div>

        {/* Stage Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${currentStage.balloonColor}`}
            style={{ width: `${stageProgress}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>
            Questions {currentStage.questionRange[0]}-
            {currentStage.questionRange[1]}
          </span>
          <span>{currentStage.timeLimit}s per question</span>
        </div>
      </div>

      {/* Time Bank Display */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Time Bank</span>
          </div>
          <div className="text-xl font-bold text-white">
            {formatTime(timeBank.totalSeconds)}
          </div>
          {timeBank.earnedThisQuestion > 0 && (
            <div className="text-xs text-green-400 animate-pulse">
              +{timeBank.earnedThisQuestion}s earned!
            </div>
          )}
        </div>

        <div className="bg-purple-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">
              Leaderboard Bonus
            </span>
          </div>
          <div className="text-xl font-bold text-white">
            +{leaderboardBonus}
          </div>
          <div className="text-xs text-gray-400">Level 4 bonus points</div>
        </div>
      </div>

      {/* Trade Section */}
      {gameStatus === "playing" && maxLivesAvailable > 0 && (
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">
              Available Lives: {maxLivesAvailable}
            </span>
            <span className="text-xs text-gray-400">1000s = 1 life</span>
          </div>

          <button
            onClick={() => setShowTradeModal(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Trade Time for Lives
          </button>
        </div>
      )}

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">
              Trade Time for Lives
            </h3>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">
                Lives to buy (1000s each):
              </label>
              <input
                type="number"
                min="1"
                max={maxLivesAvailable}
                value={livesToBuy}
                onChange={(e) =>
                  setLivesToBuy(
                    Math.max(
                      1,
                      Math.min(maxLivesAvailable, parseInt(e.target.value) || 1)
                    )
                  )
                }
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Cost:</span>
                <span className="text-white">
                  {formatTime(livesToBuy * 1000)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Remaining:</span>
                <span className="text-white">
                  {formatTime(timeBank.totalSeconds - livesToBuy * 1000)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTradeModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTrade}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
