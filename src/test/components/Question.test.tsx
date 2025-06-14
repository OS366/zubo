import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Question } from "../../components/Question";
import { Question as QuestionType } from "../../types";

const mockQuestion: QuestionType = {
  id: 1,
  text: "What is 2 + 2?",
  options: ["2", "3", "4", "5"],
  answer: 2,
  type: "logical",
};

const mockWeightedQuestion: QuestionType = {
  id: 2,
  text: "How do you prefer to work?",
  options: ["Alone", "In a team", "With guidance", "Independently"],
  type: "weighted",
  weights: {
    "Analytical Thinker": 2,
    "Creative Visionary": 1,
    "Practical Doer": 3,
    "Social Connector": 0,
  },
};

describe("Question Component", () => {
  const mockOnAnswer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Basic Rendering", () => {
    it("renders question text and options correctly", () => {
      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={60}
        />
      );

      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("shows progress information", () => {
      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={5}
          totalQuestions={100}
          timeLimit={60}
        />
      );

      expect(screen.getByText("Question 5 of 100")).toBeInTheDocument();
      expect(screen.getByText("5% Complete")).toBeInTheDocument();
    });

    it("displays correct question type badge", () => {
      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={60}
        />
      );

      expect(screen.getByText("Logical Reasoning")).toBeInTheDocument();
    });

    it("displays weighted question type correctly", () => {
      render(
        <Question
          question={mockWeightedQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={60}
        />
      );

      expect(screen.getByText("Personality Insight")).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    it("handles answer selection correctly", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={60}
        />
      );

      const correctAnswer = screen.getByText("4");
      await user.click(correctAnswer);

      // Wait for the timeout delay
      vi.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockOnAnswer).toHaveBeenCalledWith(
          2, // Index of correct answer
          expect.objectContaining({
            startTime: expect.any(Date),
            endTime: expect.any(Date),
            timeTaken: expect.any(Number),
            wasTimeout: false,
          })
        );
      });
    });

    it("disables buttons after selection", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={60}
        />
      );

      const firstAnswer = screen.getByText("2");
      await user.click(firstAnswer);

      // All buttons should be disabled
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("prevents multiple answer selections", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={60}
        />
      );

      const firstAnswer = screen.getByText("2");
      const secondAnswer = screen.getByText("3");

      await user.click(firstAnswer);
      await user.click(secondAnswer);

      vi.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockOnAnswer).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Countdown Timer", () => {
    it("shows countdown when 5 seconds remain", async () => {
      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={10} // 10 second limit
        />
      );

      // Fast forward to 5 seconds before timeout (5 seconds elapsed)
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("⚠️ TIME RUNNING OUT! ⚠️")).toBeInTheDocument();
      });
    });

    it("countdown numbers decrease correctly", async () => {
      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={10}
        />
      );

      // Start countdown
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByText("5")).toBeInTheDocument();
      });

      // Advance 1 second
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText("4")).toBeInTheDocument();
      });

      // Advance another second
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText("3")).toBeInTheDocument();
      });
    });

    it("hides countdown when user answers during countdown", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={10}
        />
      );

      // Start countdown
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByText("5")).toBeInTheDocument();
      });

      // Answer during countdown
      const answer = screen.getByText("4");
      await user.click(answer);

      // Countdown should disappear
      await waitFor(() => {
        expect(screen.queryByText("5")).not.toBeInTheDocument();
        expect(
          screen.queryByText("⚠️ TIME RUNNING OUT! ⚠️")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Timeout Handling", () => {
    it("calls onAnswer with timeout when time runs out", async () => {
      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={5} // 5 second limit
        />
      );

      // Fast forward past the time limit
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(mockOnAnswer).toHaveBeenCalledWith(
          -1, // Timeout indicator
          expect.objectContaining({
            wasTimeout: true,
          })
        );
      });
    });

    it("does not timeout if user answers in time", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={10}
        />
      );

      // Answer before timeout
      const answer = screen.getByText("4");
      await user.click(answer);

      // Fast forward past what would have been timeout
      vi.advanceTimersByTime(15000);

      // Should only be called once (for the answer, not timeout)
      expect(mockOnAnswer).toHaveBeenCalledTimes(1);
      expect(mockOnAnswer).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          wasTimeout: false,
        })
      );
    });
  });

  describe("Security Features", () => {
    it("prevents right-click context menu", () => {
      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={60}
        />
      );

      const questionContainer = screen
        .getByText("What is 2 + 2?")
        .closest("div");

      const contextMenuEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(contextMenuEvent, "preventDefault");

      questionContainer?.dispatchEvent(contextMenuEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("prevents text selection", () => {
      render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={60}
        />
      );

      const questionContainer = screen
        .getByText("What is 2 + 2?")
        .closest("div");

      expect(questionContainer).toHaveStyle("user-select: none");
    });
  });

  describe("Question State Reset", () => {
    it("resets state when question changes", () => {
      const { rerender } = render(
        <Question
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={1}
          totalQuestions={100}
          timeLimit={60}
        />
      );

      const newQuestion: QuestionType = {
        id: 2,
        text: "What is 3 + 3?",
        options: ["5", "6", "7", "8"],
        answer: 1,
        type: "logical",
      };

      rerender(
        <Question
          question={newQuestion}
          onAnswer={mockOnAnswer}
          questionNumber={2}
          totalQuestions={100}
          timeLimit={60}
        />
      );

      expect(screen.getByText("What is 3 + 3?")).toBeInTheDocument();
      expect(screen.getByText("Question 2 of 100")).toBeInTheDocument();
    });
  });
});
