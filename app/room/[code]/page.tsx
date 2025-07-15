"use client";

import { useParams } from "next/navigation";
import { GameStateProvider } from "@/components/providers/game-state-provider";
import {
  GameStatusProvider,
  useGameStatus,
} from "@/domains/game-room/components/game-status-provider";
import { GameRoomContent } from "@/domains/game-room/components/game-room-content";
import {
  GameProgressManager,
  useGameProgress,
} from "@/domains/round/components/game-progress-manager";
import { FreeTimeScreen } from "@/domains/round/components/free-time-screen";
import { SelectionScreen } from "@/domains/round/components/selection-screen";
// TODO: import RoundResults, FinalResults when implemented

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
