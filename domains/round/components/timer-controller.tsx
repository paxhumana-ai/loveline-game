"use client";

import { useState, useEffect, useCallback } from "react";
import {
  startTimer,
  getRemainingTime,
  controlTimer,
  checkTimeWarning,
} from "../actions/timer.action";
import { TIMER_DURATIONS } from "../schemas/round-timer.schema";

interface TimerStatus {
  roundId: string;
  phase: "free_time" | "selection";
  state: "stopped" | "running" | "paused" | "expired";
  remainingTime: number;
  totalDuration: number;
  startedAt?: Date;
  endedAt?: Date;
}

interface TimeWarning {
  roundId: string;
  phase: "free_time" | "selection";
  remainingTime: number;
  warningLevel: "warning_30" | "warning_10" | "expired";
}

interface TimerControllerProps {
  roundId: string;
  gameRoomId: string;
  initialPhase?: "free_time" | "selection";
  autoStart?: boolean;
  enableWarnings?: boolean;
  onTimerUpdate?: (status: TimerStatus) => void;
  onTimeWarning?: (warning: TimeWarning) => void;
  onTimeExpired?: (phase: "free_time" | "selection") => void;
  onError?: (error: string) => void;
  children: (props: {
    timerStatus: TimerStatus | null;
    isLoading: boolean;
    actions: {
      startTimer: (
        phase: "free_time" | "selection",
        duration?: number
      ) => Promise<void>;
      pauseTimer: () => Promise<void>;
      resumeTimer: () => Promise<void>;
      stopTimer: () => Promise<void>;
      resetTimer: () => Promise<void>;
    };
  }) => React.ReactNode;
}

export function TimerController({
  roundId,
  gameRoomId,
  initialPhase = "free_time",
  autoStart = false,
  enableWarnings = true,
  onTimerUpdate,
  onTimeWarning,
  onTimeExpired,
  onError,
  children,
}: TimerControllerProps) {
  const [timerStatus, setTimerStatus] = useState<TimerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [hasWarned30, setHasWarned30] = useState(false);
  const [hasWarned10, setHasWarned10] = useState(false);

  // Fetch current timer status
  const fetchTimerStatus = useCallback(async () => {
    try {
      const result = await getRemainingTime({ roundId });

      if (result.success && result.data) {
        const status: TimerStatus = {
          roundId: result.data.roundId,
          phase: result.data.phase as "free_time" | "selection",
          state: result.data.state as
            | "stopped"
            | "running"
            | "paused"
            | "expired",
          remainingTime: result.data.remainingTime,
          totalDuration: result.data.totalDuration,
          startedAt: result.data.startedAt
            ? new Date(result.data.startedAt)
            : undefined,
          endedAt: result.data.endedAt
            ? new Date(result.data.endedAt)
            : undefined,
        };

        setTimerStatus(status);
        onTimerUpdate?.(status);

        // Check for warnings
        if (enableWarnings && status.state === "running") {
          const remainingTime = status.remainingTime;

          if (remainingTime <= 0) {
            // Time expired
            const warning: TimeWarning = {
              roundId,
              phase: status.phase,
              remainingTime: 0,
              warningLevel: "expired",
            };
            onTimeWarning?.(warning);
            onTimeExpired?.(status.phase);
          } else if (remainingTime <= 10 && !hasWarned10) {
            // 10 second warning
            setHasWarned10(true);
            const warning: TimeWarning = {
              roundId,
              phase: status.phase,
              remainingTime,
              warningLevel: "warning_10",
            };
            onTimeWarning?.(warning);
          } else if (remainingTime <= 30 && !hasWarned30) {
            // 30 second warning
            setHasWarned30(true);
            const warning: TimeWarning = {
              roundId,
              phase: status.phase,
              remainingTime,
              warningLevel: "warning_30",
            };
            onTimeWarning?.(warning);
          }
        }
      }
    } catch (error) {
      onError?.(`Failed to fetch timer status: ${error}`);
    }
  }, [
    roundId,
    enableWarnings,
    hasWarned30,
    hasWarned10,
    onTimerUpdate,
    onTimeWarning,
    onTimeExpired,
    onError,
  ]);

  // Start timer
  const handleStartTimer = useCallback(
    async (phase: "free_time" | "selection", duration?: number) => {
      setIsLoading(true);
      try {
        const timerDuration =
          duration ||
          (phase === "free_time"
            ? TIMER_DURATIONS.FREE_TIME
            : TIMER_DURATIONS.SELECTION_TIME);

        const result = await startTimer({
          roundId,
          gameRoomId,
          phase,
          duration: timerDuration,
        });

        if (result.success) {
          // Reset warning flags when starting new timer
          setHasWarned30(false);
          setHasWarned10(false);
          await fetchTimerStatus();
        } else {
          onError?.((result.error as string) || "Failed to start timer");
        }
      } catch (error) {
        onError?.(`Failed to start timer: ${error}`);
      } finally {
        setIsLoading(false);
      }
    },
    [roundId, gameRoomId, fetchTimerStatus, onError]
  );

  // Control timer (pause, resume, stop, reset)
  const controlTimerAction = useCallback(
    async (action: "pause" | "resume" | "stop" | "reset") => {
      setIsLoading(true);
      try {
        const result = await controlTimer({
          roundId,
          gameRoomId,
          action,
        });

        if (result.success) {
          await fetchTimerStatus();
        } else {
          onError?.((result.error as string) || `Failed to ${action} timer`);
        }
      } catch (error) {
        onError?.(`Failed to ${action} timer: ${error}`);
      } finally {
        setIsLoading(false);
      }
    },
    [roundId, gameRoomId, fetchTimerStatus, onError]
  );

  // Auto-start timer
  useEffect(() => {
    if (autoStart && !timerStatus) {
      handleStartTimer(initialPhase);
    }
  }, [autoStart, timerStatus, initialPhase, handleStartTimer]);

  // Set up polling interval when timer is running
  useEffect(() => {
    if (timerStatus?.state === "running") {
      const interval = setInterval(fetchTimerStatus, 1000); // Update every second
      setUpdateInterval(interval);

      return () => {
        clearInterval(interval);
        setUpdateInterval(null);
      };
    } else {
      if (updateInterval) {
        clearInterval(updateInterval);
        setUpdateInterval(null);
      }
    }
  }, [timerStatus?.state, fetchTimerStatus, updateInterval]);

  // Initial fetch
  useEffect(() => {
    fetchTimerStatus();
  }, [fetchTimerStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [updateInterval]);

  return (
    <>
      {children({
        timerStatus,
        isLoading,
        actions: {
          startTimer: handleStartTimer,
          pauseTimer: () => controlTimerAction("pause"),
          resumeTimer: () => controlTimerAction("resume"),
          stopTimer: () => controlTimerAction("stop"),
          resetTimer: () => controlTimerAction("reset"),
        },
      })}
    </>
  );
}
