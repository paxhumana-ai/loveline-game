import { notFound } from "next/navigation";
import { getCurrentRound } from "@/domains/round/actions/fetch.action";
// import { getParticipantsByRoom } from "@/domains/participant/actions"; // TODO: Implement participant actions

export default async function SelectionPage({
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

  // TODO: Get participants for selection
  // const participantsResult = await getParticipantsByRoom(code);
  // const participants = participantsResult.success ? participantsResult.data : [];

  // Placeholder participants data
  const participants: Array<{ id: string; nickname: string; mbti: string }> = [
    { id: "1", nickname: "참가자1", mbti: "ENFP" },
    { id: "2", nickname: "참가자2", mbti: "INTJ" },
    { id: "3", nickname: "참가자3", mbti: "ISFJ" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/10 border-4 border-destructive/20 mb-4">
              <span
                className="text-2xl font-bold text-destructive"
                id="timer-display"
              >
                2:00
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              선택시간
            </h1>
            <p className="text-muted-foreground">
              2분 안에 선택을 완료해주세요
            </p>
          </div>

          {/* Question Display */}
          <div className="bg-card rounded-lg border p-6 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-3">
                {currentRound.question.category}
              </div>
              <h2 className="text-xl font-semibold text-card-foreground">
                {currentRound.question.content}
              </h2>
            </div>
          </div>

          {/* Participants Grid */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
              참가자를 선택해주세요
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {participants.map((participant) => (
                <button
                  key={participant.id}
                  className="bg-card hover:bg-card/80 border rounded-lg p-4 transition-colors group"
                  type="button"
                >
                  <div className="text-center">
                    {/* Character Display */}
                    <div className="text-3xl mb-2">
                      {/* This would be the character emoji/image */}
                      🐱
                    </div>
                    <div className="text-sm font-medium text-card-foreground mb-1">
                      {participant.nickname}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {participant.mbti}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selection Status */}
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              💭 질문에 대한 답을 생각하며 선택해보세요
            </p>
            <p className="text-xs text-muted-foreground">
              시간이 초과되면 &quot;선택 안함&quot;으로 처리됩니다
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-muted"></div>
              <span>자유시간</span>
              <div className="w-8 h-px bg-border"></div>
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span>선택시간</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
