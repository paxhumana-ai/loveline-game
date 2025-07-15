"use client";

import { useParams } from "next/navigation";
import { GameStateProvider } from "@/components/providers/game-state-provider";
import { GameStatusProvider } from "@/domains/game-room/components/game-status-provider";
// import { GameProgressManager } from "@/domains/round/components/game-progress-manager"; // (추후 라운드 상태 필요시)
// import 상태별 UI 컴포넌트 (추후)

export default function GameRoomPage() {
  const params = useParams();
  const code =
    typeof params.code === "string"
      ? params.code
      : Array.isArray(params.code)
      ? params.code[0]
      : "";

  // 추후: 상태별 UI 렌더링 로직 추가 예정
  return (
    <GameStateProvider roomCode={code}>
      <GameStatusProvider roomCode={code}>
        {/*
        <GameProgressManager gameRoomId={...} currentRoundNumber={...}>
          ...
        </GameProgressManager>
        */}
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* 상태별 UI 컴포넌트 조건부 렌더링 예정 */}
            </div>
          </div>
        </div>
      </GameStatusProvider>
    </GameStateProvider>
  );
}
