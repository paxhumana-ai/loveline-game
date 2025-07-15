"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getRoundWithTimer,
  checkRoundProgress,
} from "../actions/polling.action";
import { getRoundTimer } from "../actions/timer.action";

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

interface UseRoundPollingOptions {
  gameRoomId: string;
  roundNumber: number;
  enabled?: boolean;
  interval?: number; // in milliseconds
  onRoundUpdate?: (
    round: RoundData,
    question: QuestionData | null,
    timer: TimerData
  ) => void;
  onTimerUpdate?: (timer: TimerData) => void;
  onError?: (error: string) => void;
}

interface UseRoundPollingReturn {
  round: RoundData | null;
  question: QuestionData | null;
  timer: TimerData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  forceRefresh: () => void;
}

export function useRoundPolling({
  gameRoomId,
  roundNumber,
  enabled = true,
  interval = 1000, // 1 second for timer updates
  onRoundUpdate,
  onTimerUpdate,
  onError,
}: UseRoundPollingOptions): UseRoundPollingReturn {
  const [round, setRound] = useState<RoundData | null>(null);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [timer, setTimer] = useState<TimerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const fetchRoundData = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      setError(null);
      const result = await getRoundWithTimer(gameRoomId, roundNumber);

      if (result.success && result.data) {
        const {
          round: roundData,
          question: questionData,
          timer: timerData,
        } = result.data;
        setRound(roundData);
        setQuestion(questionData);
        setTimer(timerData);
        setLastUpdate(new Date().toISOString());

        onRoundUpdate?.(roundData, questionData, timerData);
        onTimerUpdate?.(timerData);
      } else {
        const errorMessage = result.error || "Failed to fetch round data";
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
  }, [gameRoomId, roundNumber, onRoundUpdate, onTimerUpdate, onError]);

  const checkForChanges = useCallback(async () => {
    if (!lastUpdate || isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const result = await checkRoundProgress(gameRoomId, lastUpdate);

      if (result.success && result.data?.hasChanges) {
        // Round has changes, fetch latest data
        await fetchRoundData();
      } else if (result.success && result.data?.currentProgress) {
        // Update timer only if this is the current round
        const currentProgress = result.data.currentProgress;
        if (currentProgress.roundNumber === roundNumber) {
          const updatedTimer: TimerData = {
            phase: currentProgress.status,
            remainingTime: currentProgress.remainingTime,
            totalTime: currentProgress.totalTime,
            currentTime: new Date().toISOString(),
          };
          setTimer(updatedTimer);
          onTimerUpdate?.(updatedTimer);
        }
      }
    } catch (err) {
      console.error("Error checking round changes:", err);
    } finally {
      isPollingRef.current = false;
    }
  }, [gameRoomId, roundNumber, lastUpdate, fetchRoundData, onTimerUpdate]);

  const forceRefresh = useCallback(() => {
    fetchRoundData();
  }, [fetchRoundData]);

  // Initial fetch
  useEffect(() => {
    if (enabled && gameRoomId && roundNumber) {
      fetchRoundData();
    }
  }, [enabled, gameRoomId, roundNumber, fetchRoundData]);

  // Set up polling
  useEffect(() => {
    if (!enabled || !gameRoomId || !roundNumber) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start polling
    intervalRef.current = setInterval(() => {
      if (lastUpdate) {
        checkForChanges();
      } else {
        fetchRoundData();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    enabled,
    gameRoomId,
    roundNumber,
    interval,
    lastUpdate,
    checkForChanges,
    fetchRoundData,
  ]);

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
        if (enabled && gameRoomId && roundNumber && !intervalRef.current) {
          fetchRoundData();
          intervalRef.current = setInterval(() => {
            if (lastUpdate) {
              checkForChanges();
            } else {
              fetchRoundData();
            }
          }, interval);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    enabled,
    gameRoomId,
    roundNumber,
    interval,
    lastUpdate,
    checkForChanges,
    fetchRoundData,
  ]);

  return {
    round,
    question,
    timer,
    isLoading,
    error,
    lastUpdate,
    forceRefresh,
  };
}
