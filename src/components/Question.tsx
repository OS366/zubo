import React, { useState, useEffect } from "react";
import { Question as QuestionType } from "../types";
import { Timer } from "./Timer";

interface QuestionProps {
  question: QuestionType;
  onAnswer: (answerIndex: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const Question: React.FC<QuestionProps> = ({
  question,
  onAnswer,
  questionNumber,
  totalQuestions,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(question.timed);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowTimer(question.timed);
  }, [question.id, question.timed]);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowTimer(false);
    setTimeout(() => {
      onAnswer(index);
    }, 500);
  };

  const handleTimeout = () => {
    setShowTimer(false);
    onAnswer(-1); // -1 indicates timeout
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "logical":
        return "from-blue-500 to-cyan-500";
      case "analytical":
        return "from-purple-500 to-pink-500";
      case "gk":
        return "from-green-500 to-emerald-500";
      case "weighted":
        return "from-orange-500 to-red-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "logical":
        return "Logical Reasoning";
      case "analytical":
        return "Analytical Thinking";
      case "gk":
        return "General Knowledge";
      case "weighted":
        return "Personality Insight";
      default:
        return "Question";
    }
  };

  // Prevent copy, paste, and other clipboard operations
  const preventClipboardOperations = (e: React.ClipboardEvent) => {
    e.preventDefault();
    console.warn(
      "Copy/paste operations are disabled during the quiz to maintain integrity."
    );
    return false;
  };

  // Prevent right-click context menu
  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    console.warn("Right-click is disabled during the quiz.");
    return false;
  };

  // Prevent text selection
  const preventSelection = (e: React.SyntheticEvent) => {
    e.preventDefault();
    return false;
  };

  // Prevent drag operations
  const preventDrag = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  // Prevent keyboard shortcuts for copying/pasting
  const preventKeyboardShortcuts = (e: React.KeyboardEvent) => {
    // Prevent Ctrl+A (Select All), Ctrl+C (Copy), Ctrl+V (Paste), Ctrl+X (Cut)
    if (e.ctrlKey || e.metaKey) {
      if (["a", "c", "v", "x", "s", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        console.warn(
          `Keyboard shortcut Ctrl+${e.key.toUpperCase()} is disabled during the quiz.`
        );
        return false;
      }
    }
    // Prevent F12 (Developer Tools)
    if (e.key === "F12") {
      e.preventDefault();
      console.warn("Developer tools access is disabled during the quiz.");
      return false;
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto select-none no-select no-drag question-container"
      onCopy={preventClipboardOperations}
      onPaste={preventClipboardOperations}
      onCut={preventClipboardOperations}
      onContextMenu={preventContextMenu}
      onSelectStart={preventSelection}
      onDragStart={preventDrag}
      onKeyDown={preventKeyboardShortcuts}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
      }}
      tabIndex={0}
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-300">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-300">
            {Math.round((questionNumber / totalQuestions) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Timer */}
      {showTimer && (
        <Timer duration={60} onTimeout={handleTimeout} isActive={showTimer} />
      )}

      {/* Question Card */}
      <div
        className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 select-none"
        onCopy={preventClipboardOperations}
        onPaste={preventClipboardOperations}
        onCut={preventClipboardOperations}
        onContextMenu={preventContextMenu}
        onSelectStart={preventSelection}
        onDragStart={preventDrag}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
        }}
      >
        {/* Question Type Badge */}
        <div className="mb-6">
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getQuestionTypeColor(
              question.type
            )}`}
          >
            {getQuestionTypeLabel(question.type)}
            {question.timed && <span className="ml-2">⏱️</span>}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
          {question.text}
        </h2>

        {/* Answer Options */}
        <div className="grid gap-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`w-full text-left p-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                selectedAnswer === index
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-100 hover:text-white"
              } ${
                selectedAnswer !== null
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-bold ${
                    selectedAnswer === index
                      ? "border-white bg-white text-purple-600"
                      : "border-gray-400 text-gray-400"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-lg">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
