import { notFound } from "next/navigation";
import { getCurrentRound } from "@/domains/round/actions";

export default async function RoundPage({
  params,
}: {
  params: Promise<{ code: string; roundNumber: string }>;
}) {
  const { code, roundNumber } = await params;
  const roundNum = parseInt(roundNumber, 10);

  if (isNaN(roundNum) || roundNum < 1 || roundNum > 10) {
    notFound();
  }

  // Get current round information
  const roundResult = await getCurrentRound(code);

  if (!roundResult.success) {
    notFound();
  }

  const currentRound = roundResult.data;

  if (!currentRound || currentRound.roundNumber !== roundNum) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Round Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              라운드 {currentRound.roundNumber}
            </h1>
            <p className="text-muted-foreground">게임이 진행 중입니다</p>
          </div>

          {/* Question Display */}
          <div className="bg-card rounded-lg border p-8 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
                {currentRound.question.category}
              </div>
              <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                {currentRound.question.content}
              </h2>
              <p className="text-muted-foreground">
                참가자들과 자유롭게 대화해보세요
              </p>
            </div>
          </div>

          {/* Round Status */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              라운드 상태:{" "}
              {currentRound.status === "active" ? "진행 중" : "대기 중"}
            </p>
            {currentRound.startedAt && (
              <p className="text-sm text-muted-foreground mt-1">
                시작 시간:{" "}
                {new Date(currentRound.startedAt).toLocaleTimeString("ko-KR")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
