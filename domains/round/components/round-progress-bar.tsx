"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoundProgressBarProps {
  currentRound: number;
  totalRounds: number;
  completedRounds: number[];
  className?: string;
}

export function RoundProgressBar({
  currentRound,
  totalRounds,
  completedRounds,
  className = "",
}: RoundProgressBarProps) {
  const progressPercentage = (completedRounds.length / totalRounds) * 100;

  const getRoundStatus = (roundNumber: number) => {
    if (completedRounds.includes(roundNumber)) return "completed";
    if (roundNumber === currentRound) return "current";
    if (roundNumber < currentRound) return "completed";
    return "pending";
  };

  const getRoundClassName = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary text-primary-foreground border-primary";
      case "current":
        return "bg-primary/50 text-primary-foreground border-primary animate-pulse";
      case "pending":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "current":
        return "●";
      case "pending":
        return "○";
      default:
        return "○";
    }
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="pt-6">
        <div className="text-center">
          {/* Title */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              게임 진행률
            </h3>
            <p className="text-sm text-muted-foreground">
              완료된 라운드: {completedRounds.length} / {totalRounds}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">0%</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(progressPercentage)}% 완료
              </Badge>
              <span className="text-sm text-muted-foreground">100%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
          </div>

          {/* Round Indicators */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: totalRounds }, (_, i) => {
                const roundNumber = i + 1;
                const status = getRoundStatus(roundNumber);

                return (
                  <div
                    key={roundNumber}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all duration-300 ${getRoundClassName(
                      status
                    )}`}
                    title={`라운드 ${roundNumber} - ${
                      status === "completed"
                        ? "완료"
                        : status === "current"
                        ? "진행중"
                        : "대기"
                    }`}
                  >
                    <span className="sr-only">{getStatusIcon(status)}</span>
                    {roundNumber}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>완료</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary/50 animate-pulse" />
              <span>진행중</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-muted border border-border" />
              <span>대기</span>
            </div>
          </div>

          {/* Game Status */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {completedRounds.length === totalRounds
                ? "🎉 모든 라운드가 완료되었습니다!"
                : currentRound <= totalRounds
                ? `현재 라운드 ${currentRound}이 진행 중입니다`
                : "게임이 종료되었습니다"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
