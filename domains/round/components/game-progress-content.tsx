"use client";

import { useGameProgress } from "./game-progress-manager";
import { FreeTimeScreen } from "./free-time-screen";
import { SelectionScreen } from "./selection-screen";
// TODO: import RoundResults, FinalResults when implemented

export function GameProgressContent() {
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
