"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRoomPolling } from "../hooks/useRoomPolling";
import { useParticipantPolling } from "../hooks/useParticipantPolling";

interface GameStatusContextType {
  // Room data
  room: RoomData | null;
  isRoomLoading: boolean;
  roomError: string | null;

  // Participants data
  participants: ParticipantData[];
  isParticipantsLoading: boolean;
  participantsError: string | null;
  participantCount: number;
  statusCount: Record<string, number>;

  // Actions
  refreshRoom: () => void;
  refreshParticipants: () => void;
  refreshAll: () => void;

  // Status flags
  isGameReady: boolean;
  isGameInProgress: boolean;
  isGameCompleted: boolean;
}

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

interface GameStatusProviderProps {
  roomCode: string;
  children: React.ReactNode;
  roomPollingInterval?: number;
  participantPollingInterval?: number;
  onGameStateChange?: (status: string) => void;
  onParticipantJoin?: (participant: ParticipantData) => void;
  onParticipantLeave?: (participantId: string) => void;
}

const GameStatusContext = createContext<GameStatusContextType | undefined>(
  undefined
);

export function GameStatusProvider({
  roomCode,
  children,
  roomPollingInterval = 5000,
  participantPollingInterval = 3000,
  onGameStateChange,
  onParticipantJoin,
  onParticipantLeave,
}: GameStatusProviderProps) {
  const [previousParticipantIds, setPreviousParticipantIds] = useState<
    Set<string>
  >(new Set());
  const [previousGameStatus, setPreviousGameStatus] = useState<string | null>(
    null
  );

  // Room polling hook
  const {
    room,
    isLoading: isRoomLoading,
    error: roomError,
    forceRefresh: refreshRoom,
  } = useRoomPolling({
    roomCode,
    enabled: true,
    interval: roomPollingInterval,
    onRoomUpdate: (updatedRoom) => {
      // Check for game status changes
      if (
        previousGameStatus !== null &&
        previousGameStatus !== updatedRoom.status
      ) {
        onGameStateChange?.(updatedRoom.status);
      }
      setPreviousGameStatus(updatedRoom.status);
    },
    onError: (error) => {
      console.error("Room polling error:", error);
    },
  });

  // Participant polling hook
  const {
    participants,
    isLoading: isParticipantsLoading,
    error: participantsError,
    participantCount,
    statusCount,
    forceRefresh: refreshParticipants,
  } = useParticipantPolling({
    roomCode,
    enabled: true,
    interval: participantPollingInterval,
    onParticipantsUpdate: (updatedParticipants) => {
      const currentParticipantIds = new Set(
        updatedParticipants.map((p) => p.id)
      );

      // Check for new participants (join)
      for (const participant of updatedParticipants) {
        if (!previousParticipantIds.has(participant.id)) {
          onParticipantJoin?.(participant);
        }
      }

      // Check for removed participants (leave)
      for (const previousId of previousParticipantIds) {
        if (!currentParticipantIds.has(previousId)) {
          onParticipantLeave?.(previousId);
        }
      }

      setPreviousParticipantIds(currentParticipantIds);
    },
    onError: (error) => {
      console.error("Participant polling error:", error);
    },
  });

  // Compute derived state
  const isGameReady =
    room?.status === "waiting" &&
    participants.length >= 2 &&
    participants.length === room.maxParticipants;

  const isGameInProgress = room?.status === "in_progress";
  const isGameCompleted = room?.status === "completed";

  const refreshAll = () => {
    refreshRoom();
    refreshParticipants();
  };

  const contextValue: GameStatusContextType = {
    // Room data
    room,
    isRoomLoading,
    roomError,

    // Participants data
    participants,
    isParticipantsLoading,
    participantsError,
    participantCount,
    statusCount,

    // Actions
    refreshRoom,
    refreshParticipants,
    refreshAll,

    // Status flags
    isGameReady,
    isGameInProgress,
    isGameCompleted,
  };

  return (
    <GameStatusContext.Provider value={contextValue}>
      {children}
    </GameStatusContext.Provider>
  );
}

export function useGameStatus() {
  const context = useContext(GameStatusContext);
  if (context === undefined) {
    throw new Error("useGameStatus must be used within a GameStatusProvider");
  }
  return context;
}

// Additional helper hooks for specific use cases
export function useGameRoom() {
  const { room, isRoomLoading, roomError, refreshRoom } = useGameStatus();
  return { room, isRoomLoading, roomError, refreshRoom };
}

export function useGameParticipants() {
  const {
    participants,
    isParticipantsLoading,
    participantsError,
    participantCount,
    statusCount,
    refreshParticipants,
  } = useGameStatus();

  return {
    participants,
    isParticipantsLoading,
    participantsError,
    participantCount,
    statusCount,
    refreshParticipants,
  };
}

export function useGameReadiness() {
  const { isGameReady, isGameInProgress, isGameCompleted } = useGameStatus();
  return { isGameReady, isGameInProgress, isGameCompleted };
}
