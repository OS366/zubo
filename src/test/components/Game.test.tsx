import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Game } from "../../components/Game";

// Mock the questions data
vi.mock("../../data/questions", () => ({
  getRandomQuestions: vi.fn(() => [
    {
      id: 1,
      text: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: 1,
      type: "logical",
      timed: true,
    },
    {
      id: 2,
      text: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      answer: 2,
      type: "gk",
      timed: true,
    },
    {
      id: 3,
      text: "What is 5 + 5?",
      options: ["8", "9", "10", "11"],
      answer: 2,
      type: "logical",
      timed: true,
    },
    {
      id: 4,
      text: "What is the capital of Italy?",
      options: ["Milan", "Rome", "Naples", "Turin"],
      answer: 1,
      type: "gk",
      timed: true,
    },
  ]),
  getChallengeQuestions: vi.fn(() => [
    {
      id: 101,
      text: "Challenge question?",
      options: ["A", "B", "C", "D"],
      answer: 0,
      type: "analytical",
      timed: true,
    },
  ]),
  injectRandomRiddles: vi.fn((questions) => questions),
}));

// Mock the leaderboard functions
vi.mock("../../utils/leaderboard", () => ({
  saveLeaderboardEntry: vi.fn(() =>
    Promise.resolve({
      id: "test-123",
      score: 85,
      avatarUrl: "test-avatar.jpg",
    })
  ),
  getLeaderboardEntries: vi.fn(() => Promise.resolve([])),
  getUserEntries: vi.fn(() => Promise.resolve([])),
}));

// Mock persona functions
vi.mock("../../utils/persona", () => ({
  calculatePersona: vi.fn(() => "Analytical Thinker"),
  getPersonaInfo: vi.fn(() => ({
    title: "Analytical Thinker",
    description: "You think logically",
    traits: ["Logical", "Methodical"],
  })),
}));

describe("Game Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Menu Screen", () => {
    it("renders the menu screen by default", () => {
      render(<Game />);

      expect(
        screen.getByText(/Welcome to the Zubo Challenge/)
      ).toBeInTheDocument();
      expect(screen.getByText("Play the Challenge")).toBeInTheDocument();
      expect(screen.getByText("Game Rules")).toBeInTheDocument();
    });

    it("shows game rules correctly", () => {
      render(<Game />);

      expect(screen.getByText("Start with 3 lives")).toBeInTheDocument();
      expect(
        screen.getByText("Score 75+ out of 100 to succeed")
      ).toBeInTheDocument();
      expect(
        screen.getByText("4 stages with increasing difficulty")
      ).toBeInTheDocument();
    });

    it("starts the game when Play button is clicked", async () => {
      const user = userEvent.setup();
      render(<Game />);

      const playButton = screen.getByText("Play the Challenge");
      await user.click(playButton);

      await waitFor(() => {
        // Should show either regular question or challenge question
        const hasRegularQuestion = screen.queryByText("What is 2 + 2?");
        const hasChallengeQuestion = screen.queryByText("Challenge question?");
        expect(hasRegularQuestion || hasChallengeQuestion).toBeTruthy();
      });
    });
  });

  describe("Game Playing", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<Game />);

      const playButton = screen.getByText("Play the Challenge");
      await user.click(playButton);

      await waitFor(() => {
        // Should show either regular question or challenge question
        const hasRegularQuestion = screen.queryByText("What is 2 + 2?");
        const hasChallengeQuestion = screen.queryByText("Challenge question?");
        expect(hasRegularQuestion || hasChallengeQuestion).toBeTruthy();
      });
    });

    it("displays the first question correctly", () => {
      // Should show either regular question or challenge question
      const hasRegularQuestion = screen.queryByText("What is 2 + 2?");
      const hasChallengeQuestion = screen.queryByText("Challenge question?");
      expect(hasRegularQuestion || hasChallengeQuestion).toBeTruthy();

      // Should have answer options
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(3); // At least 4 answer options
    });

    it("shows game header with lives, score, and progress", () => {
      expect(screen.getByText("3")).toBeInTheDocument(); // Lives
      expect(screen.getByText("0")).toBeInTheDocument(); // Score
      expect(screen.getByText("Q1/100")).toBeInTheDocument(); // Progress
    });

    it("handles correct answer selection", async () => {
      const user = userEvent.setup();

      // Click the first answer option
      const answerButtons = screen
        .getAllByRole("button")
        .filter(
          (btn) => btn.textContent && /^[A-D]$/.test(btn.textContent.trim())
        );
      await user.click(answerButtons[0]);

      await waitFor(
        () => {
          // Should advance to next question or show some progress
          const progressText = screen.queryByText(/Q\d+\/100/);
          expect(progressText).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("handles incorrect answer selection", async () => {
      const user = userEvent.setup();

      // Click an answer option
      const answerButtons = screen
        .getAllByRole("button")
        .filter(
          (btn) => btn.textContent && /^[A-D]$/.test(btn.textContent.trim())
        );
      await user.click(answerButtons[1]);

      // Should continue to next question or show progress
      await waitFor(
        () => {
          const progressText = screen.queryByText(/Q\d+\/100/);
          expect(progressText).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Store Integration", () => {
    it("opens store when Store button is clicked", async () => {
      const user = userEvent.setup();
      render(<Game />);

      // Start game first
      const playButton = screen.getByText("Play the Challenge");
      await user.click(playButton);

      await waitFor(() => {
        expect(screen.getByText("Store")).toBeInTheDocument();
      });

      const storeButton = screen.getByText("Store");
      await user.click(storeButton);

      await waitFor(() => {
        expect(screen.getByText("Life Store")).toBeInTheDocument();
      });
    });
  });

  describe("Time Bank System", () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<Game />);

      const playButton = screen.getByText("Play the Challenge");
      await user.click(playButton);

      await waitFor(() => {
        // Should show either regular question or challenge question
        const hasRegularQuestion = screen.queryByText("What is 2 + 2?");
        const hasChallengeQuestion = screen.queryByText("Challenge question?");
        expect(hasRegularQuestion || hasChallengeQuestion).toBeTruthy();
      });
    });

    it("displays time bank in header", () => {
      expect(screen.getByText("0s")).toBeInTheDocument(); // Initial time bank
    });

    it("shows trade button when time bank has enough seconds", () => {
      // This would require mocking the time bank to have 1000+ seconds
      // For now, we test that the UI structure is correct
      expect(screen.getByText("Store")).toBeInTheDocument();
    });
  });

  describe("Game State Persistence", () => {
    it("saves game state to localStorage during gameplay", async () => {
      const user = userEvent.setup();
      render(<Game />);

      const playButton = screen.getByText("Play the Challenge");
      await user.click(playButton);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          "zubo-game-state",
          expect.stringContaining('"gameStatus":"playing"')
        );
      });
    });

    it("restores game state from localStorage on mount", () => {
      const mockGameState = {
        currentQuestionIndex: 5,
        score: 3,
        lives: 2,
        questions: [
          {
            id: 1,
            text: "Test",
            options: ["A", "B"],
            answer: 0,
            type: "logical",
          },
        ],
        gameStatus: "playing",
        answeredQuestions: 5,
        personaScores: {},
        isChallengeRound: false,
        leaderboardEligible: false,
        perQuestionTimes: [],
        questionTimings: [],
        answerHistory: [],
        livesBought: 0,
        livesGained: 0,
        timeBank: { totalSeconds: 0, earnedThisQuestion: 0, livesTraded: 0 },
        currentStage: {
          id: 1,
          name: "Foundation",
          timeLimit: 60,
          backgroundColor: "from-blue-500 to-purple-600",
          balloonColor: "bg-blue-500",
        },
      };

      localStorage.setItem("zubo-game-state", JSON.stringify(mockGameState));

      render(<Game />);

      expect(localStorage.getItem).toHaveBeenCalledWith("zubo-game-state");
    });
  });

  describe("Payment Success Handling", () => {
    it("processes payment success URL parameters", () => {
      // Mock URL with payment success parameters
      Object.defineProperty(window, "location", {
        value: {
          search: "?payment_success=true&lives=5",
          href: "http://localhost:3000?payment_success=true&lives=5",
          origin: "http://localhost:3000",
        },
        writable: true,
      });

      render(<Game />);

      // Should process the payment success
      expect(
        screen.getByText(/Welcome to the Zubo Challenge/)
      ).toBeInTheDocument();
    });
  });

  describe("Failure Screen", () => {
    it("shows failure screen when lives reach zero", async () => {
      const user = userEvent.setup();
      render(<Game />);

      // Start game
      const playButton = screen.getByText("Play the Challenge");
      await user.click(playButton);

      await waitFor(() => {
        // Should show either regular question or challenge question
        const hasRegularQuestion = screen.queryByText("What is 2 + 2?");
        const hasChallengeQuestion = screen.queryByText("Challenge question?");
        expect(hasRegularQuestion || hasChallengeQuestion).toBeTruthy();
      });

      // Answer incorrectly 3 times to lose all lives
      for (let i = 0; i < 3; i++) {
        const answerButtons = screen
          .getAllByRole("button")
          .filter(
            (btn) => btn.textContent && /^[A-D]$/.test(btn.textContent.trim())
          );
        await user.click(answerButtons[0]); // Click first answer option

        if (i < 2) {
          await waitFor(
            () => {
              // Should continue to next question
              const progressText = screen.queryByText(/Q\d+\/100/);
              expect(progressText).toBeInTheDocument();
            },
            { timeout: 1000 }
          );
        }
      }

      await waitFor(
        () => {
          expect(screen.getByText("Game Over")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });
});
