import { WaitingRoom } from "@/domains/game-room/components";
import { getGameRoomByCode } from "@/domains/game-room/actions/fetch.action";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock, Target, Trophy } from "lucide-react";

export default async function GameRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const result = await getGameRoomByCode(code);

  if (!result.success) {
    notFound();
  }

  const { gameRoom, participants } = result.data!;

  // 게임 상태에 따른 컴포넌트 렌더링
  const renderGameState = () => {
    switch (gameRoom.status) {
      case "waiting":
        return (
          <WaitingRoom
            gameRoom={gameRoom}
            participants={participants}
            roomCode={code}
          />
        );

      case "in_progress":
        // TODO: 실제 게임 진행 상태를 더 세분화해야 함 (free_time, selection_time, round_results)
        // 현재는 임시 UI
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Clock className="h-16 w-16 text-primary mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold mb-2">게임 진행 중</h2>
                <p className="text-muted-foreground mb-4">
                  게임이 진행 중입니다. 잠시만 기다려주세요.
                </p>
                <div className="text-sm text-muted-foreground">
                  방 코드: <span className="font-mono font-bold">{code}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "completed":
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Trophy className="h-16 w-16 text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-2">게임 완료!</h2>
                <p className="text-muted-foreground mb-4">
                  모든 라운드가 끝났습니다. 수고하셨어요!
                </p>
                <div className="text-sm text-muted-foreground">
                  방 코드: <span className="font-mono font-bold">{code}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "cancelled":
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle className="h-16 w-16 text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2">게임 취소됨</h2>
                <p className="text-muted-foreground mb-4">
                  게임이 취소되었습니다.
                </p>
                <div className="text-sm text-muted-foreground">
                  방 코드: <span className="font-mono font-bold">{code}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">알 수 없는 상태</h2>
                <p className="text-muted-foreground mb-4">
                  게임 상태를 확인할 수 없습니다.
                </p>
                <div className="text-sm text-muted-foreground">
                  상태: {gameRoom.status} | 방 코드:{" "}
                  <span className="font-mono font-bold">{code}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">{renderGameState()}</div>
      </div>
    </div>
  );
}
