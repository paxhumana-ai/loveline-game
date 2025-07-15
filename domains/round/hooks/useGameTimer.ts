"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getRoundTimer,
  startFreeTime,
  startSelectionTime,
  endRound,
} from "../actions/timer.action";

interface TimerState {
  roundId: string;
  phase: "waiting" | "free_time" | "selection_time" | "completed";
  remainingTime: number;
  totalTime: number;
  isRunning: boolean;
  currentTime: string;
}

interface UseGameTimerOptions {
  roundId: string;
  enabled?: boolean;
  interval?: number; // in milliseconds
  onTimerUpdate?: (state: TimerState) => void;
  onPhaseComplete?: (phase: string, roundId: string) => void;
  onError?: (error: string) => void;
}

interface UseGameTimerReturn {
  timer: TimerState | null;
  isLoading: boolean;
  error: string | null;
  startFreeTimePhase: () => Promise<void>;
  startSelectionTimePhase: () => Promise<void>;
  endRoundPhase: () => Promise<void>;
  forceRefresh: () => void;
}

export function useGameTimer({
  roundId,
  enabled = true,
  interval = 1000, // 1 second
  onTimerUpdate,
  onPhaseComplete,
  onError,
}: UseGameTimerOptions): UseGameTimerReturn {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const lastRemainingTimeRef = useRef<number | null>(null);

  const fetchTimerData = useCallback(async () => {
    if (isPollingRef.current || !roundId) return;
    isPollingRef.current = true;

    try {
      setError(null);
      const result = await getRoundTimer(roundId);

      if (result.success && result.data) {
        const timerData = result.data;
        const timerState: TimerState = {
          roundId,
          phase: timerData.status as
            | "waiting"
            | "free_time"
            | "selection_time"
            | "completed",
          remainingTime: timerData.remainingTime,
          totalTime: timerData.totalTime,
          isRunning:
            timerData.remainingTime > 0 &&
            (timerData.status === "free_time" ||
              timerData.status === "selection_time"),
          currentTime: timerData.currentTime,
        };

        setTimer(timerState);
        onTimerUpdate?.(timerState);

        // Check if timer has completed
        if (
          lastRemainingTimeRef.current !== null &&
          lastRemainingTimeRef.current > 0 &&
          timerState.remainingTime === 0
        ) {
          onPhaseComplete?.(timerState.phase, roundId);
        }

        lastRemainingTimeRef.current = timerState.remainingTime;
      } else {
        const errorMessage = result.error || "Failed to fetch timer data";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      isPollingRef.current = false;
    }
  }, [roundId, onTimerUpdate, onPhaseComplete, onError]);

  const startFreeTimePhase = useCallback(async () => {
    try {
      setError(null);
      const result = await startFreeTime(roundId);

      if (result.success) {
        // Refresh timer data immediately
        await fetchTimerData();
      } else {
        const errorMessage = result.error || "Failed to start free time";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [roundId, fetchTimerData, onError]);

  const startSelectionTimePhase = useCallback(async () => {
    try {
      setError(null);
      const result = await startSelectionTime(roundId);

      if (result.success) {
        // Refresh timer data immediately
        await fetchTimerData();
      } else {
        const errorMessage = result.error || "Failed to start selection time";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [roundId, fetchTimerData, onError]);

  const endRoundPhase = useCallback(async () => {
    try {
      setError(null);
      const result = await endRound(roundId);

      if (result.success) {
        // Refresh timer data immediately
        await fetchTimerData();
      } else {
        const errorMessage = result.error || "Failed to end round";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [roundId, fetchTimerData, onError]);

  const forceRefresh = useCallback(() => {
    fetchTimerData();
  }, [fetchTimerData]);

  // Initial fetch
  useEffect(() => {
    if (enabled && roundId) {
      fetchTimerData();
    }
  }, [enabled, roundId, fetchTimerData]);

  // Set up polling
  useEffect(() => {
    if (!enabled || !roundId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start polling
    intervalRef.current = setInterval(() => {
      fetchTimerData();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, roundId, interval, fetchTimerData]);

  // Handle page visibility change to pause/resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, clear polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Page is visible, resume polling
        if (enabled && roundId && !intervalRef.current) {
          fetchTimerData();
          intervalRef.current = setInterval(() => {
            fetchTimerData();
          }, interval);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, roundId, interval, fetchTimerData]);

  return {
    timer,
    isLoading,
    error,
    startFreeTimePhase,
    startSelectionTimePhase,
    endRoundPhase,
    forceRefresh,
  };
}
