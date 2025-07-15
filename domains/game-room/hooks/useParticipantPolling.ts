"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getRoomWithParticipants } from "../actions/polling.action";
import {
  getActiveParticipants,
  checkParticipantChanges,
} from "../../participant/actions/polling.action";

interface ParticipantData {
  id: string;
  nickname: string;
  gender: string;
  mbti: string;
  character: string;
  status: string;
  userId: string | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UseParticipantPollingOptions {
  roomCode: string;
  enabled?: boolean;
  interval?: number; // in milliseconds
  onParticipantsUpdate?: (participants: ParticipantData[]) => void;
  onError?: (error: string) => void;
}

interface UseParticipantPollingReturn {
  participants: ParticipantData[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  forceRefresh: () => void;
  participantCount: number;
  statusCount: Record<string, number>;
}

export function useParticipantPolling({
  roomCode,
  enabled = true,
  interval = 5000, // 5 seconds
  onParticipantsUpdate,
  onError,
}: UseParticipantPollingOptions): UseParticipantPollingReturn {
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [statusCount, setStatusCount] = useState<Record<string, number>>({});

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const roomIdRef = useRef<string | null>(null);

  const fetchParticipantData = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      setError(null);
      const result = await getRoomWithParticipants(roomCode);

      if (result.success && result.data) {
        const { room, participants: participantsList } = result.data;
        roomIdRef.current = room.id;
        setParticipants(participantsList);
        setLastUpdate(new Date().toISOString());

        // Calculate status count
        const counts = participantsList.reduce((acc, participant) => {
          acc[participant.status] = (acc[participant.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setStatusCount(counts);

        onParticipantsUpdate?.(participantsList);
      } else {
        const errorMessage = result.error || "Failed to fetch participant data";
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
  }, [roomCode, onParticipantsUpdate, onError]);

  const checkForChanges = useCallback(async () => {
    if (!lastUpdate || !roomIdRef.current || isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const result = await checkParticipantChanges(
        roomIdRef.current,
        lastUpdate
      );

      if (result.success && result.data?.hasChanges) {
        // Participants have changes, fetch latest data
        await fetchParticipantData();
      } else if (result.success && result.data) {
        // Update status count even if no changes
        setStatusCount(result.data.statusCount);
      }
    } catch (err) {
      console.error("Error checking participant changes:", err);
    } finally {
      isPollingRef.current = false;
    }
  }, [lastUpdate, fetchParticipantData]);

  const forceRefresh = useCallback(() => {
    fetchParticipantData();
  }, [fetchParticipantData]);

  // Initial fetch
  useEffect(() => {
    if (enabled && roomCode) {
      fetchParticipantData();
    }
  }, [enabled, roomCode, fetchParticipantData]);

  // Set up polling
  useEffect(() => {
    if (!enabled || !roomCode) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start polling
    intervalRef.current = setInterval(() => {
      if (lastUpdate && roomIdRef.current) {
        checkForChanges();
      } else {
        fetchParticipantData();
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
    roomCode,
    interval,
    lastUpdate,
    checkForChanges,
    fetchParticipantData,
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
        if (enabled && roomCode && !intervalRef.current) {
          fetchParticipantData();
          intervalRef.current = setInterval(() => {
            if (lastUpdate && roomIdRef.current) {
              checkForChanges();
            } else {
              fetchParticipantData();
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
    roomCode,
    interval,
    lastUpdate,
    checkForChanges,
    fetchParticipantData,
  ]);

  return {
    participants,
    isLoading,
    error,
    lastUpdate,
    forceRefresh,
    participantCount: participants.length,
    statusCount,
  };
}
