import React, { useEffect, useState } from "react";
import { GameStage } from "../types";

interface BalloonAnimationProps {
  stage: GameStage;
  show: boolean;
  onComplete: () => void;
}

export const BalloonAnimation: React.FC<BalloonAnimationProps> = ({
  stage,
  show,
  onComplete,
}) => {
  const [balloons, setBalloons] = useState<
    Array<{ id: number; delay: number; size: number }>
  >([]);

  useEffect(() => {
    if (show) {
      // Generate random balloons
      const newBalloons = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        delay: Math.random() * 2000, // Random delay up to 2 seconds
        size: 20 + Math.random() * 40, // Random size between 20-60px
      }));
      setBalloons(newBalloons);

      // Auto-complete after animation duration
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Stage Announcement */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/80 backdrop-blur-sm rounded-3xl p-8 text-center animate-pulse">
          <div className="text-6xl mb-4">🎈</div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Stage {stage.id}
          </h2>
          <h3 className="text-2xl font-semibold text-gray-300 mb-4">
            {stage.name}
          </h3>
          <div className="text-lg text-gray-400">
            {stage.timeLimit}s per question • {stage.difficulty} difficulty
          </div>
        </div>
      </div>

      {/* Floating Balloons */}
      {balloons.map((balloon) => (
        <div
          key={balloon.id}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: "-100px",
            animationDelay: `${balloon.delay}ms`,
            animationDuration: "3s",
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          }}
        >
          <div
            className={`rounded-full ${stage.balloonColor} opacity-80 shadow-lg animate-pulse`}
            style={{
              width: `${balloon.size}px`,
              height: `${balloon.size}px`,
              animation: `float-up 4s ease-out forwards, pulse 2s ease-in-out infinite`,
            }}
          />
        </div>
      ))}

      {/* Confetti Effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3000}ms`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-50vh) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
