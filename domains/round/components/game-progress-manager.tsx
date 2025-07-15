"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRoundPolling } from "../hooks/useRoundPolling";
import { useGameTimer } from "../hooks/useGameTimer";
import { useGameStatus } from "../../game-room/components/game-status-provider";

interface GameProgressContextType {
  // Current round data
  currentRound: RoundData | null;
  currentQuestion: QuestionData | null;

  // Timer data
  timer: TimerData | null;
  timeRemaining: number;
  timeTotal: number;
  isTimerRunning: boolean;
  currentPhase: string;

  // Progress state
  isRoundLoading: boolean;
  roundError: string | null;
  isTimerLoading: boolean;
  timerError: string | null;

  // Actions
  startFreeTime: () => Promise<void>;
  startSelectionTime: () => Promise<void>;
  endCurrentRound: () => Promise<void>;
  refreshRound: () => void;
  refreshTimer: () => void;

  // Progress flags
  canStartFreeTime: boolean;
  canStartSelectionTime: boolean;
  canEndRound: boolean;
  isRoundInProgress: boolean;
  isRoundCompleted: boolean;
}

interface RoundData {
  id: string;
  gameRoomId: string;
  roundNumber: number;
  questionId: string | null;
  status: string;
  startedAt: Date | null;
  endedAt: Date | null;
  freeTimeStartedAt: Date | null;
  selectionTimeStartedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface QuestionData {
  id: string;
  content: string;
  category: string;
  difficulty: number;
}

interface TimerData {
  phase: string;
  remainingTime: number;
  totalTime: number;
  currentTime: string;
}

interface GameProgressManagerProps {
  gameRoomId: string;
  currentRoundNumber: number;
  children: React.ReactNode;
  roundPollingInterval?: number;
  timerPollingInterval?: number;
  onPhaseChange?: (phase: string, roundNumber: number) => void;
  onRoundComplete?: (roundNumber: number) => void;
  onTimeWarning?: (secondsRemaining: number) => void;
}

const GameProgressContext = createContext<GameProgressContextType | undefined>(
  undefined
);

export function GameProgressManager({
  gameRoomId,
  currentRoundNumber,
  children,
  roundPollingInterval = 2000,
  timerPollingInterval = 1000,
  onPhaseChange,
  onRoundComplete,
  onTimeWarning,
}: GameProgressManagerProps) {
  const [previousPhase, setPreviousPhase] = useState<string | null>(null);

  const { isGameInProgress } = useGameStatus();

  // Round polling hook
  const {
    round: currentRound,
    question: currentQuestion,
    timer,
    isLoading: isRoundLoading,
    error: roundError,
    forceRefresh: refreshRound,
  } = useRoundPolling({
    gameRoomId,
    roundNumber: currentRoundNumber,
    enabled: isGameInProgress,
    interval: roundPollingInterval,
    onRoundUpdate: (round, question, timerData) => {
      // Check for phase changes
      if (previousPhase !== null && previousPhase !== round.status) {
        onPhaseChange?.(round.status, round.roundNumber);
      }
      setPreviousPhase(round.status);

      // Check for round completion
      if (round.status === "completed") {
        onRoundComplete?.(round.roundNumber);
      }
    },
    onTimerUpdate: (timerData) => {
      // Check for time warnings (30 seconds, 10 seconds)
      if (timerData.remainingTime <= 30000 && timerData.remainingTime > 29000) {
        onTimeWarning?.(30);
      } else if (
        timerData.remainingTime <= 10000 &&
        timerData.remainingTime > 9000
      ) {
        onTimeWarning?.(10);
      }
    },
    onError: (error) => {
      console.error("Round polling error:", error);
    },
  });

  // Timer hook for round control
  const {
    timer: timerState,
    isLoading: isTimerLoading,
    error: timerError,
    startFreeTimePhase,
    startSelectionTimePhase,
    endRoundPhase,
    forceRefresh: refreshTimer,
  } = useGameTimer({
    roundId: currentRound?.id || "",
    enabled: isGameInProgress && !!currentRound?.id,
    interval: timerPollingInterval,
    onTimerUpdate: (timerData) => {
      // Additional timer update handling if needed
    },
    onPhaseComplete: (phase, roundId) => {
      // Handle automatic phase transitions
      if (phase === "free_time") {
        // Automatically transition to selection time
        startSelectionTimePhase();
      } else if (phase === "selection_time") {
        // Automatically end the round
        endRoundPhase();
      }
    },
    onError: (error) => {
      console.error("Timer error:", error);
    },
  });

  // Compute derived state
  const timeRemaining = timer?.remainingTime || timerState?.remainingTime || 0;
  const timeTotal = timer?.totalTime || timerState?.totalTime || 0;
  const isTimerRunning = timerState?.isRunning || false;
  const currentPhase = currentRound?.status || "waiting";

  // Action permissions
  const canStartFreeTime = currentRound?.status === "waiting";
  const canStartSelectionTime =
    currentRound?.status === "free_time" && timeRemaining <= 0;
  const canEndRound =
    currentRound?.status === "selection_time" && timeRemaining <= 0;
  const isRoundInProgress =
    currentRound?.status === "free_time" ||
    currentRound?.status === "selection_time";
  const isRoundCompleted = currentRound?.status === "completed";

  // Wrapper functions for timer actions
  const startFreeTime = async () => {
    if (currentRound?.id) {
      await startFreeTimePhase();
    }
  };

  const startSelectionTime = async () => {
    if (currentRound?.id) {
      await startSelectionTimePhase();
    }
  };

  const endCurrentRound = async () => {
    if (currentRound?.id) {
      await endRoundPhase();
    }
  };

  const contextValue: GameProgressContextType = {
    // Current round data
    currentRound,
    currentQuestion,

    // Timer data
    timer: timer || timerState,
    timeRemaining,
    timeTotal,
    isTimerRunning,
    currentPhase,

    // Progress state
    isRoundLoading,
    roundError,
    isTimerLoading,
    timerError,

    // Actions
    startFreeTime,
    startSelectionTime,
    endCurrentRound,
    refreshRound,
    refreshTimer,

    // Progress flags
    canStartFreeTime,
    canStartSelectionTime,
    canEndRound,
    isRoundInProgress,
    isRoundCompleted,
  };

  return (
    <GameProgressContext.Provider value={contextValue}>
      {children}
    </GameProgressContext.Provider>
  );
}

export function useGameProgress() {
  const context = useContext(GameProgressContext);
  if (context === undefined) {
    throw new Error(
      "useGameProgress must be used within a GameProgressManager"
    );
  }
  return context;
}

// Additional helper hooks for specific use cases
export function useCurrentRound() {
  const {
    currentRound,
    currentQuestion,
    isRoundLoading,
    roundError,
    refreshRound,
  } = useGameProgress();
  return {
    currentRound,
    currentQuestion,
    isRoundLoading,
    roundError,
    refreshRound,
  };
}

export function useRoundTimer() {
  const {
    timer,
    timeRemaining,
    timeTotal,
    isTimerRunning,
    currentPhase,
    isTimerLoading,
    timerError,
    refreshTimer,
  } = useGameProgress();

  return {
    timer,
    timeRemaining,
    timeTotal,
    isTimerRunning,
    currentPhase,
    isTimerLoading,
    timerError,
    refreshTimer,
  };
}

export function useRoundActions() {
  const {
    startFreeTime,
    startSelectionTime,
    endCurrentRound,
    canStartFreeTime,
    canStartSelectionTime,
    canEndRound,
  } = useGameProgress();

  return {
    startFreeTime,
    startSelectionTime,
    endCurrentRound,
    canStartFreeTime,
    canStartSelectionTime,
    canEndRound,
  };
}

export function useRoundStatus() {
  const { isRoundInProgress, isRoundCompleted, currentPhase } =
    useGameProgress();
  return { isRoundInProgress, isRoundCompleted, currentPhase };
}
