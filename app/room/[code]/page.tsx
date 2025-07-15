"use client";

import { useParams } from "next/navigation";
import { GameStateProvider } from "@/components/providers/game-state-provider";
import {
  GameStatusProvider,
  useGameStatus,
} from "@/domains/game-room/components/game-status-provider";
import { WaitingRoom } from "@/domains/game-room/components/waiting-room";
import {
  GameProgressManager,
  useGameProgress,
} from "@/domains/round/components/game-progress-manager";
import { FreeTimeScreen } from "@/domains/round/components/free-time-screen";
import { SelectionScreen } from "@/domains/round/components/selection-screen";
// TODO: import RoundResults, FinalResults when implemented

function GameRoomContent({ roomCode }: { roomCode: string }) {
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
      // Cast status to expected union type (fallback to 'waiting' if unknown)
      status: ["waiting", "in_progress", "completed", "cancelled"].includes(
        room.status
      )
        ? (room.status as "waiting" | "in_progress" | "completed" | "cancelled")
        : "waiting",
    },
    participants: participants.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      // Cast gender to expected union type (fallback to 'other')
      gender: ["male", "female", "other"].includes(p.gender)
        ? (p.gender as "male" | "female" | "other")
        : "other",
      mbti: p.mbti,
      character: p.character,
      // Cast status to expected union type (fallback to 'joined')
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
  // Safely access currentRound if present, else fallback to 1
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

function GameProgressContent() {
  const {
    currentPhase,
    currentRound,
    currentQuestion,
    timeRemaining,
    isTimerRunning,
  } = useGameProgress();
  // TODO: props 구조는 실제 도메인 컴포넌트에 맞게 조정 필요

  switch (currentPhase) {
    case "free_time":
      return (
        <FreeTimeScreen
          roundNumber={currentRound?.roundNumber || 1}
          question={currentQuestion?.content || ""}
          participantCount={0} // TODO: 실제 참가자 수 전달
          timeRemaining={timeRemaining}
          isTimerRunning={isTimerRunning}
        />
      );
    case "selection_time":
      return (
        <SelectionScreen
          roundNumber={currentRound?.roundNumber || 1}
          question={currentQuestion?.content || ""}
          participants={[]} // TODO: 실제 참가자 목록 전달
          currentUserId={""} // TODO: 실제 유저 ID 전달
          selectedParticipantIds={[]} // TODO: 실제 선택 상태 전달
          timeRemaining={timeRemaining}
          isTimerRunning={isTimerRunning}
          onParticipantSelect={() => {}}
          onParticipantDeselect={() => {}}
        />
      );
    case "round_result":
      return <div>라운드 결과 (구현 예정)</div>; // TODO: RoundResults 컴포넌트로 대체
    case "finished":
      return <div>최종 결과 (구현 예정)</div>; // TODO: FinalResults 컴포넌트로 대체
    default:
      return <div>진행 중...</div>;
  }
}

export default function GameRoomPage() {
  const params = useParams();
  const code =
    typeof params.code === "string"
      ? params.code
      : Array.isArray(params.code)
      ? params.code[0]
      : "";

  return (
    <GameStateProvider roomCode={code}>
      <GameStatusProvider roomCode={code}>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <GameRoomContent roomCode={code} />
            </div>
          </div>
        </div>
      </GameStatusProvider>
    </GameStateProvider>
  );
}
