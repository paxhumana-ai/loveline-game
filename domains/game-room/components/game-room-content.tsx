"use client";

import { useGameStatus } from "./game-status-provider";
import { WaitingRoom } from "./waiting-room";
import { GameProgressManager } from "@/domains/round/components/game-progress-manager";
import { GameProgressContent } from "@/domains/round/components/game-progress-content";

export function GameRoomContent({ roomCode }: { roomCode: string }) {
  const { room, participants, isRoomLoading, isParticipantsLoading } =
    useGameStatus();

  if (isRoomLoading || isParticipantsLoading || !room) {
    return <div>로딩 중...</div>;
  }

  // Normalize room and participants for WaitingRoom props
  const waitingRoomProps = {
    gameRoom: {
      id: room.id,
      code: room.code,
      maxParticipants: room.maxParticipants,
      totalRounds: room.totalRounds,
      hostId: room.hostId,
      status: ["waiting", "in_progress", "completed", "cancelled"].includes(
        room.status
      )
        ? (room.status as "waiting" | "in_progress" | "completed" | "cancelled")
        : "waiting",
    },
    participants: participants.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      gender: ["male", "female", "other"].includes(p.gender)
        ? (p.gender as "male" | "female" | "other")
        : "other",
      mbti: p.mbti,
      character: p.character,
      status: [
        "joined",
        "ready",
        "playing",
        "temporarily_away",
        "left",
        "finished",
      ].includes(p.status)
        ? (p.status as
            | "joined"
            | "ready"
            | "playing"
            | "temporarily_away"
            | "left"
            | "finished")
        : "joined",
    })),
    roomCode,
  };

  if (waitingRoomProps.gameRoom.status === "waiting") {
    return <WaitingRoom {...waitingRoomProps} />;
  }

  // 게임 진행 중: 라운드 상태 기반 렌더링
  const currentRoundNumber =
    typeof (room as unknown as { currentRound?: unknown }).currentRound ===
    "number"
      ? (room as unknown as { currentRound: number }).currentRound
      : 1;

  return (
    <GameProgressManager
      gameRoomId={room.id}
      currentRoundNumber={currentRoundNumber}
    >
      <GameProgressContent />
    </GameProgressManager>
  );
}
