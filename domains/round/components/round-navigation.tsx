"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Play, Square } from "lucide-react";

interface RoundNavigationProps {
  currentRound: number;
  totalRounds: number;
  canGoToPrevious?: boolean;
  canGoToNext?: boolean;
  canStartRound?: boolean;
  canEndRound?: boolean;
  isLoading?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onStartRound?: () => void;
  onEndRound?: () => void;
  className?: string;
}

export function RoundNavigation({
  currentRound,
  totalRounds,
  canGoToPrevious = false,
  canGoToNext = false,
  canStartRound = false,
  canEndRound = false,
  isLoading = false,
  onPrevious,
  onNext,
  onStartRound,
  onEndRound,
  className = "",
}: RoundNavigationProps) {
  return (
    <Card className={`${className}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Round Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={!canGoToPrevious || isLoading || currentRound <= 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              이전 라운드
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">현재 라운드</p>
              <p className="text-lg font-semibold text-foreground">
                {currentRound} / {totalRounds}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={
                !canGoToNext || isLoading || currentRound >= totalRounds
              }
              className="flex items-center gap-2"
            >
              다음 라운드
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Round Controls */}
          <div className="flex items-center justify-center gap-3">
            {canStartRound && (
              <Button
                onClick={onStartRound}
                disabled={isLoading}
                className="flex items-center gap-2"
                size="sm"
              >
                <Play className="w-4 h-4" />
                라운드 시작
              </Button>
            )}

            {canEndRound && (
              <Button
                variant="destructive"
                onClick={onEndRound}
                disabled={isLoading}
                className="flex items-center gap-2"
                size="sm"
              >
                <Square className="w-4 h-4" />
                라운드 종료
              </Button>
            )}
          </div>

          {/* Round Status Indicator */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              {Array.from({ length: totalRounds }, (_, i) => {
                const roundNumber = i + 1;
                const isCurrentRound = roundNumber === currentRound;
                const isPast = roundNumber < currentRound;

                return (
                  <div
                    key={roundNumber}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      isCurrentRound
                        ? "bg-primary scale-125"
                        : isPast
                        ? "bg-primary/60"
                        : "bg-muted"
                    }`}
                    title={`라운드 ${roundNumber}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Helper Text */}
          <div className="text-center text-xs text-muted-foreground">
            {currentRound === 1 && "첫 번째 라운드입니다"}
            {currentRound === totalRounds && "마지막 라운드입니다"}
            {currentRound > 1 &&
              currentRound < totalRounds &&
              `${totalRounds - currentRound}개 라운드가 남았습니다`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
