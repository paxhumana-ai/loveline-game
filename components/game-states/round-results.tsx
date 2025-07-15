"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import {
  Heart,
  Sparkles,
  Coffee,
  ArrowRight,
  Users,
  MessageCircle,
} from "lucide-react";

interface Match {
  participant1: {
    id: string;
    nickname: string;
    character: string;
  };
  participant2: {
    id: string;
    nickname: string;
    character: string;
  };
  message1?: string;
  message2?: string;
}

interface RoundResultsProps {
  roomCode: string;
  currentRound: number;
  totalRounds: number;
  matches: Match[];
  allSelections: Array<{
    selector: {
      id: string;
      nickname: string;
      character: string;
    };
    selected: {
      id: string;
      nickname: string;
      character: string;
    };
    message?: string;
  }>;
  currentUserId?: string;
  isLastRound?: boolean;
  onContinue?: () => void;
}

export function RoundResults({
  roomCode,
  currentRound,
  totalRounds,
  matches,
  allSelections,
  currentUserId,
  isLastRound = false,
  onContinue,
}: RoundResultsProps) {
  const [showMatches, setShowMatches] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const userMatches = matches.filter(
    (match) =>
      match.participant1.id === currentUserId ||
      match.participant2.id === currentUserId
  );

  const userSelections = allSelections.filter(
    (selection) =>
      selection.selector.id === currentUserId ||
      selection.selected.id === currentUserId
  );

  useEffect(() => {
    // 매칭 애니메이션 시작
    const timer = setTimeout(() => {
      setShowMatches(true);
      if (matches.length > 0) {
        setShowConfetti(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [matches.length]);

  useEffect(() => {
    // 매칭 순차적 표시
    if (showMatches && matches.length > 0) {
      const timer = setTimeout(() => {
        if (currentMatchIndex < matches.length - 1) {
          setCurrentMatchIndex(currentMatchIndex + 1);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showMatches, currentMatchIndex, matches.length]);

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Sparkles className="mr-2 h-5 w-5" />
          라운드 {currentRound} / {totalRounds} 결과
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold">
          {matches.length > 0 ? "💕 매칭 성공! 💕" : "이번 라운드 결과"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {matches.length > 0
            ? "축하합니다! 서로 선택한 분들이 있어요!"
            : "이번 라운드에는 매칭이 없었어요. 다음 라운드에서 더 좋은 기회가 있을 거예요!"}
        </p>
      </div>

      {/* Matches Display */}
      {showMatches && matches.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            매칭된 커플
          </h2>

          <div className="space-y-4">
            {matches.slice(0, currentMatchIndex + 1).map((match, index) => (
              <Card
                key={index}
                className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 animate-in slide-in-from-bottom duration-1000"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-4 md:gap-8">
                    {/* Participant 1 */}
                    <div className="text-center space-y-2">
                      <div className="text-4xl animate-bounce">
                        {match.participant1.character}
                      </div>
                      <div className="font-semibold">
                        {match.participant1.nickname}
                      </div>
                      {match.message1 && (
                        <Card className="bg-white/80 max-w-[200px]">
                          <CardContent className="p-3">
                            <p className="text-sm italic">
                              &ldquo;{match.message1}&rdquo;
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Heart Animation */}
                    <div className="flex flex-col items-center gap-2">
                      <Heart className="h-8 w-8 text-red-500 animate-ping" />
                      <ArrowRight className="h-4 w-4 text-muted-foreground animate-pulse" />
                      <Heart className="h-8 w-8 text-red-500 animate-ping animation-delay-300" />
                    </div>

                    {/* Participant 2 */}
                    <div className="text-center space-y-2">
                      <div className="text-4xl animate-bounce animation-delay-300">
                        {match.participant2.character}
                      </div>
                      <div className="font-semibold">
                        {match.participant2.nickname}
                      </div>
                      {match.message2 && (
                        <Card className="bg-white/80 max-w-[200px]">
                          <CardContent className="p-3">
                            <p className="text-sm italic">
                              &ldquo;{match.message2}&rdquo;
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>

                  {/* Special message for user matches */}
                  {userMatches.includes(match) && (
                    <div className="mt-4 text-center">
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white animate-pulse">
                        🎉 당신이 매칭되었습니다!
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        5분간 아이스크림 산책을 다녀오세요! ☕️
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Matches */}
      {showMatches && matches.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Coffee className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              이번 라운드는 매칭이 없었어요
            </h3>
            <p className="text-muted-foreground mb-4">
              괜찮아요! 다음 라운드에서는 더 좋은 기회가 있을 거예요.
            </p>
            <Badge variant="outline">다음 기회를 기대해보세요! 💪</Badge>
          </CardContent>
        </Card>
      )}

      {/* User's Selections Summary */}
      {showMatches && userSelections.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              나의 이번 라운드 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userSelections.map((selection, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  {selection.selector.id === currentUserId ? (
                    <>
                      <div className="text-sm">
                        <span className="font-medium">내가 선택:</span>{" "}
                        {selection.selected.character}{" "}
                        {selection.selected.nickname}
                      </div>
                      {selection.message && (
                        <div className="text-sm text-muted-foreground italic">
                          &ldquo;{selection.message}&rdquo;
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-sm">
                        <span className="font-medium">나를 선택:</span>{" "}
                        {selection.selector.character}{" "}
                        {selection.selector.nickname}
                      </div>
                      {selection.message && (
                        <div className="text-sm text-muted-foreground italic">
                          &ldquo;{selection.message}&rdquo;
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {showMatches && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {matches.length}
              </div>
              <div className="text-sm text-muted-foreground">매칭 커플</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {allSelections.length}
              </div>
              <div className="text-sm text-muted-foreground">총 선택</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {currentRound}
              </div>
              <div className="text-sm text-muted-foreground">현재 라운드</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {totalRounds - currentRound}
              </div>
              <div className="text-sm text-muted-foreground">남은 라운드</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Continue Button */}
      {showMatches && (
        <div className="text-center space-y-4">
          {matches.length > 0 && (
            <div className="text-sm text-muted-foreground">
              💡 매칭된 분들은 5분간 자유시간을 가져보세요!
            </div>
          )}

          <Button onClick={onContinue} size="lg" className="px-8">
            {isLastRound ? (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                최종 결과 보기
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-5 w-5" />
                다음 라운드 시작
              </>
            )}
          </Button>
        </div>
      )}

      {/* Room Info */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">방 코드</p>
            <p className="text-xl font-mono font-bold tracking-wider">
              {roomCode}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
