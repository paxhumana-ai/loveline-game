import { notFound } from "next/navigation";
import { getCurrentRound } from "@/domains/round/actions/fetch.action";

export default async function FreeTimePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Get current round information
  const roundResult = await getCurrentRound(code);

  if (!roundResult.success) {
    notFound();
  }

  const currentRound = roundResult.data;

  if (!currentRound || currentRound.status !== "active") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Timer Display Area */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/20 mb-6">
              <span
                className="text-4xl font-bold text-primary"
                id="timer-display"
              >
                3:00
              </span>
            </div>
          </div>

          {/* Phase Title */}
          <h1 className="text-4xl font-bold text-foreground mb-4">자유시간</h1>

          <p className="text-xl text-muted-foreground mb-8">
            3분 동안 자유롭게 오프라인으로 대화해보세요
          </p>

          {/* Current Question */}
          <div className="bg-card rounded-lg border p-6 mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-3">
              {currentRound.question.category}
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">
              {currentRound.question.content}
            </h2>
          </div>

          {/* Instructions */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              💡 자유시간 가이드
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="text-left">
                <p className="mb-2">✨ 자연스럽게 대화를 시작해보세요</p>
                <p className="mb-2">🤝 서로에 대해 알아가는 시간입니다</p>
              </div>
              <div className="text-left">
                <p className="mb-2">😊 편안한 분위기를 만들어보세요</p>
                <p className="mb-2">⏰ 3분 후 선택 시간이 시작됩니다</p>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>자유시간</span>
              <div className="w-8 h-px bg-border"></div>
              <div className="w-3 h-3 rounded-full bg-muted"></div>
              <span>선택시간</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
