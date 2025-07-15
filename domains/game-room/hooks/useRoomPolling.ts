"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getRoomStatus } from "../actions/status.action";
import { checkRoomChanges } from "../actions/polling.action";
import { toast } from "sonner";

interface RoomData {
  id: string;
  code: string;
  status: string;
  maxParticipants: number;
  totalRounds: number;
  hostId: string | null;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UseRoomPollingOptions {
  roomCode: string;
  enabled?: boolean;
  interval?: number; // in milliseconds
  onRoomUpdate?: (room: RoomData) => void;
  onError?: (error: string) => void;
}

interface UseRoomPollingReturn {
  room: RoomData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  forceRefresh: () => void;
}

export function useRoomPolling({
  roomCode,
  enabled = true,
  interval = 5000, // 5 seconds
  onRoomUpdate,
  onError,
}: UseRoomPollingOptions): UseRoomPollingReturn {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const fetchRoomData = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      setError(null);
      const result = await getRoomStatus(roomCode);

      if (result.success && result.data) {
        setRoom(result.data);
        setLastUpdate(new Date().toISOString());
        onRoomUpdate?.(result.data);
      } else {
        const errorMessage = result.error || "Failed to fetch room data";
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
      isPollingRef.current = false;
    }
  }, [roomCode, onRoomUpdate, onError]);

  const checkForChanges = useCallback(async () => {
    if (!lastUpdate || isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const result = await checkRoomChanges(roomCode, lastUpdate);

      if (result.success && result.data?.hasChanges) {
        // Room has changes, fetch latest data
        await fetchRoomData();
      }
    } catch (err) {
      console.error("Error checking room changes:", err);
    } finally {
      isPollingRef.current = false;
    }
  }, [roomCode, lastUpdate, fetchRoomData]);

  const forceRefresh = useCallback(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  // Initial fetch
  useEffect(() => {
    if (enabled && roomCode) {
      fetchRoomData();
    }
  }, [enabled, roomCode, fetchRoomData]);

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
      if (lastUpdate) {
        checkForChanges();
      } else {
        fetchRoomData();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, roomCode, interval, lastUpdate, checkForChanges, fetchRoomData]);

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
          fetchRoomData();
          intervalRef.current = setInterval(() => {
            if (lastUpdate) {
              checkForChanges();
            } else {
              fetchRoomData();
            }
          }, interval);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, roomCode, interval, lastUpdate, checkForChanges, fetchRoomData]);

  return {
    room,
    isLoading,
    error,
    lastUpdate,
    forceRefresh,
  };
}
