"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Coffee, Users, MessageCircle } from "lucide-react";

interface FreeTimeProps {
  roomCode: string;
  currentRound: number;
  totalRounds: number;
  duration: number; // 초 단위 (기본 180초 = 3분)
  participants: Array<{
    id: string;
    nickname: string;
    character: string;
    status: string;
  }>;
  onTimeUp?: () => void;
}

export function FreeTime({
  roomCode,
  currentRound,
  totalRounds,
  duration = 180,
  participants,
  onTimeUp,
}: FreeTimeProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }

        // 30초 남았을 때 경고 표시
        if (prev === 31) {
          setShowWarning(true);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 30) return "text-destructive";
    if (timeLeft <= 60) return "text-orange-500";
    return "text-primary";
  };

  const getProgressValue = () => {
    return ((duration - timeLeft) / duration) * 100;
  };

  const activeParticipants = participants.filter(
    (p) => p.status !== "left" && p.status !== "temporarily_away"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Coffee className="mr-2 h-5 w-5" />
          라운드 {currentRound} / {totalRounds}
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold">자유시간</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          지금은 자유롭게 대화하며 서로를 알아가는 시간이에요!
          <br className="hidden sm:block" />곧 지목 시간이 시작됩니다.
        </p>
      </div>

      {/* Timer Section */}
      <Card
        className={`${showWarning ? "animate-pulse border-orange-500" : ""}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Clock className={`h-6 w-6 ${getTimeColor()}`} />
            <span className={`text-4xl font-mono ${getTimeColor()}`}>
              {formatTime(timeLeft)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={getProgressValue()} className="h-3" />

          {showWarning && (
            <div className="text-center">
              <Badge variant="destructive" className="animate-bounce">
                ⚠️ 30초 후 지목 시간 시작!
              </Badge>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            {timeLeft > 30
              ? "편안하게 대화를 나누어보세요"
              : "곧 지목 시간이 시작됩니다. 준비해주세요!"}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              대화 가이드
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">💬 추천 대화 주제</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• 취미나 관심사 공유하기</li>
                <li>• 좋아하는 음식이나 여행지</li>
                <li>• 재미있었던 경험 이야기</li>
                <li>• MBTI 성향에 대한 이야기</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">🎯 다음 라운드 힌트</p>
              <p className="text-sm text-muted-foreground">
                곧 흥미로운 질문이 나올 예정이니 서로의 매력을 발견해보세요!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              참가자 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">활성 참가자</span>
                <Badge variant="secondary">{activeParticipants.length}명</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {activeParticipants.slice(0, 8).map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                  >
                    <div className="w-6 h-6 text-center text-xs">
                      {participant.character}
                    </div>
                    <span className="text-sm font-medium truncate">
                      {participant.nickname}
                    </span>
                  </div>
                ))}
              </div>

              {activeParticipants.length > 8 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{activeParticipants.length - 8}명 더
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Info */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">방 코드</p>
            <p className="text-2xl font-mono font-bold tracking-wider">
              {roomCode}
            </p>
            <p className="text-xs text-muted-foreground">친구들과 공유하세요</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
