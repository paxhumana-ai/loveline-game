"use client";

import { useState, useEffect, useCallback } from "react";
import {
  startRound,
  endRound,
  pauseRound,
  resumeRound,
} from "../actions/control.action";
import { getCurrentRound, getRoundStatus } from "../actions/fetch.action";
import {
  startTimer,
  getRemainingTime,
  controlTimer,
} from "../actions/timer.action";

interface RoundState {
  id?: string;
  roundNumber: number;
  status: "pending" | "active" | "completed";
  phase?: "free_time" | "selection";
  questionId?: string;
  question?: string;
  startedAt?: Date;
  endedAt?: Date;
}

interface TimerState {
  remainingTime: number;
  isRunning: boolean;
  phase: "free_time" | "selection";
}

interface RoundManagerProps {
  gameRoomId: string;
  totalRounds?: number;
  autoProgressRounds?: boolean;
  onRoundStateChange?: (state: RoundState) => void;
  onTimerStateChange?: (state: TimerState) => void;
  onError?: (error: string) => void;
  children: (props: {
    roundState: RoundState;
    timerState: TimerState;
    actions: {
      startRound: (roundNumber: number) => Promise<void>;
      endCurrentRound: () => Promise<void>;
      pauseCurrentRound: () => Promise<void>;
      resumeCurrentRound: () => Promise<void>;
      startTimer: (phase: "free_time" | "selection") => Promise<void>;
      pauseTimer: () => Promise<void>;
      resumeTimer: () => Promise<void>;
    };
  }) => React.ReactNode;
}

export function RoundManager({
  gameRoomId,
  totalRounds = 10,
  autoProgressRounds = true,
  onRoundStateChange,
  onTimerStateChange,
  onError,
  children,
}: RoundManagerProps) {
  const [roundState, setRoundState] = useState<RoundState>({
    roundNumber: 1,
    status: "pending",
  });

  const [timerState, setTimerState] = useState<TimerState>({
    remainingTime: 180, // 3 minutes default
    isRunning: false,
    phase: "free_time",
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Fetch current round status
  const fetchRoundStatus = useCallback(async () => {
    try {
      const result = await getCurrentRound(gameRoomId);
      if (result.success && result.data) {
        const newState: RoundState = {
          id: result.data.id,
          roundNumber: result.data.roundNumber,
          status: result.data.status as "pending" | "active" | "completed",
          questionId: result.data.question?.id,
          question: result.data.question?.content,
          startedAt: result.data.startedAt
            ? new Date(result.data.startedAt)
            : undefined,
          endedAt: result.data.endedAt
            ? new Date(result.data.endedAt)
            : undefined,
        };

        setRoundState(newState);
        onRoundStateChange?.(newState);
      }
    } catch (error) {
      onError?.(`Failed to fetch round status: ${error}`);
    }
  }, [gameRoomId, onRoundStateChange, onError]);

  // Fetch timer status
  const fetchTimerStatus = useCallback(async () => {
    if (!roundState.id) return;

    try {
      const result = await getRemainingTime({ roundId: roundState.id });
      if (result.success && result.data) {
        const newTimerState: TimerState = {
          remainingTime: result.data.remainingTime,
          isRunning: result.data.state === "running",
          phase: result.data.phase as "free_time" | "selection",
        };

        setTimerState(newTimerState);
        onTimerStateChange?.(newTimerState);

        // Auto-progress when time expires
        if (autoProgressRounds && result.data.remainingTime <= 0) {
          if (result.data.phase === "free_time") {
            // Move to selection phase
            await handleStartTimer("selection");
          } else if (result.data.phase === "selection") {
            // End current round and potentially start next
            await handleEndCurrentRound();
          }
        }
      }
    } catch (error) {
      onError?.(`Failed to fetch timer status: ${error}`);
    }
  }, [roundState.id, autoProgressRounds, onTimerStateChange, onError]);

  // Start polling when round is active
  useEffect(() => {
    if (roundState.status === "active") {
      const interval = setInterval(() => {
        fetchTimerStatus();
      }, 1000); // Update every second

      setPollingInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [roundState.status, fetchTimerStatus]);

  // Initial load
  useEffect(() => {
    fetchRoundStatus();
  }, [fetchRoundStatus]);

  // Actions
  const handleStartRound = async (roundNumber: number) => {
    try {
      const result = await startRound({
        gameRoomId,
        roundNumber,
      });

      if (result.success) {
        await fetchRoundStatus();
        // Start free time automatically
        if (result.data?.roundId) {
          await handleStartTimer("free_time");
        }
      } else {
        onError?.(result.error as string);
      }
    } catch (error) {
      onError?.(`Failed to start round: ${error}`);
    }
  };

  const handleEndCurrentRound = async () => {
    if (!roundState.id) return;

    try {
      const result = await endRound({
        roundId: roundState.id,
        gameRoomId,
      });

      if (result.success) {
        await fetchRoundStatus();

        // Auto-start next round if not at max
        if (autoProgressRounds && roundState.roundNumber < totalRounds) {
          setTimeout(() => {
            handleStartRound(roundState.roundNumber + 1);
          }, 2000); // 2 second delay between rounds
        }
      } else {
        onError?.(result.error as string);
      }
    } catch (error) {
      onError?.(`Failed to end round: ${error}`);
    }
  };

  const handlePauseCurrentRound = async () => {
    if (!roundState.id) return;

    try {
      const result = await pauseRound({
        roundId: roundState.id,
        gameRoomId,
      });

      if (result.success) {
        await fetchRoundStatus();
      } else {
        onError?.(result.error as string);
      }
    } catch (error) {
      onError?.(`Failed to pause round: ${error}`);
    }
  };

  const handleResumeCurrentRound = async () => {
    if (!roundState.id) return;

    try {
      const result = await resumeRound({
        roundId: roundState.id,
        gameRoomId,
      });

      if (result.success) {
        await fetchRoundStatus();
      } else {
        onError?.(result.error as string);
      }
    } catch (error) {
      onError?.(`Failed to resume round: ${error}`);
    }
  };

  const handleStartTimer = async (phase: "free_time" | "selection") => {
    if (!roundState.id) return;

    try {
      const duration = phase === "free_time" ? 180 : 120; // 3min or 2min
      const result = await startTimer({
        roundId: roundState.id,
        gameRoomId,
        phase,
        duration,
      });

      if (result.success) {
        await fetchTimerStatus();
      } else {
        onError?.(result.error as string);
      }
    } catch (error) {
      onError?.(`Failed to start timer: ${error}`);
    }
  };

  const handlePauseTimer = async () => {
    if (!roundState.id) return;

    try {
      const result = await controlTimer({
        roundId: roundState.id,
        gameRoomId,
        action: "pause",
      });

      if (result.success) {
        await fetchTimerStatus();
      } else {
        onError?.(result.error as string);
      }
    } catch (error) {
      onError?.(`Failed to pause timer: ${error}`);
    }
  };

  const handleResumeTimer = async () => {
    if (!roundState.id) return;

    try {
      const result = await controlTimer({
        roundId: roundState.id,
        gameRoomId,
        action: "resume",
      });

      if (result.success) {
        await fetchTimerStatus();
      } else {
        onError?.(result.error as string);
      }
    } catch (error) {
      onError?.(`Failed to resume timer: ${error}`);
    }
  };

  return (
    <>
      {children({
        roundState,
        timerState,
        actions: {
          startRound: handleStartRound,
          endCurrentRound: handleEndCurrentRound,
          pauseCurrentRound: handlePauseCurrentRound,
          resumeCurrentRound: handleResumeCurrentRound,
          startTimer: handleStartTimer,
          pauseTimer: handlePauseTimer,
          resumeTimer: handleResumeTimer,
        },
      })}
    </>
  );
}
