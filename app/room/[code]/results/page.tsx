import { notFound } from "next/navigation";
import { getRoundHistory } from "@/domains/round/actions";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Get round history
  const historyResult = await getRoundHistory(code);

  if (!historyResult.success) {
    notFound();
  }

  const rounds = historyResult.data || [];
  const completedRounds = rounds.filter(
    (round) => round.status === "completed"
  );

  if (completedRounds.length === 0) {
    notFound();
  }

  const latestRound = completedRounds[completedRounds.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              라운드 {latestRound.roundNumber} 결과
            </h1>
            <p className="text-muted-foreground">
              이번 라운드의 선택 결과를 확인해보세요
            </p>
          </div>

          {/* Question Recap */}
          <div className="bg-card rounded-lg border p-6 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-3">
                {latestRound.question.category}
              </div>
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                {latestRound.question.content}
              </h2>
              <p className="text-sm text-muted-foreground">
                라운드 {latestRound.roundNumber}의 질문
              </p>
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-card rounded-lg border p-6 mb-8">
            <h3 className="text-lg font-semibold text-card-foreground mb-4 text-center">
              선택 결과
            </h3>

            {/* Placeholder for actual selection results */}
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-muted-foreground mb-4">
                모든 참가자의 선택이 완료되었습니다
              </p>
              <div className="bg-muted/30 rounded-lg p-4 inline-block">
                <p className="text-sm text-muted-foreground">
                  선택 결과는 게임 종료 후 공개됩니다
                </p>
              </div>
            </div>
          </div>

          {/* Round Progress */}
          <div className="bg-muted/30 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
              게임 진행률
            </h3>
            <div className="flex items-center justify-center space-x-2">
              {Array.from({ length: 10 }, (_, i) => {
                const roundNum = i + 1;
                const isCompleted = completedRounds.some(
                  (r) => r.roundNumber === roundNum
                );
                const isCurrent = latestRound.roundNumber === roundNum;

                return (
                  <div
                    key={roundNum}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "bg-primary/50 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {roundNum}
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              완료된 라운드: {completedRounds.length} / 10
            </p>
          </div>

          {/* Next Round Button */}
          <div className="text-center">
            <div className="bg-card rounded-lg border p-6">
              <p className="text-muted-foreground mb-4">
                {completedRounds.length < 10
                  ? "다음 라운드를 준비해주세요"
                  : "모든 라운드가 완료되었습니다!"}
              </p>
              {completedRounds.length < 10 ? (
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors">
                  다음 라운드 시작
                </button>
              ) : (
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors">
                  최종 결과 확인
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
