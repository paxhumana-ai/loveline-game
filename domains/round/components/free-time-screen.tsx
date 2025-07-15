"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageCircle, Users } from "lucide-react";
import { RoundTimer } from "./round-timer";
import { TimeWarning } from "./time-warning";

interface FreeTimeScreenProps {
  roundNumber: number;
  question: string;
  participantCount: number;
  timeRemaining: number;
  isTimerRunning: boolean;
  onTimeUp?: () => void;
  onTimeWarning?: (remainingTime: number) => void;
  className?: string;
}

export function FreeTimeScreen({
  roundNumber,
  question,
  participantCount,
  timeRemaining,
  isTimerRunning,
  onTimeUp,
  onTimeWarning,
  className = "",
}: FreeTimeScreenProps) {
  const showWarning = timeRemaining <= 30;
  const showUrgentWarning = timeRemaining <= 10;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Warning Display */}
      {showWarning && (
        <TimeWarning remainingTime={timeRemaining} phase="free_time" />
      )}

      {/* Main Content */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="outline" className="text-sm">
              Round {roundNumber}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              💬 자유 대화 시간
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            오프라인에서 대화해보세요
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Display */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-lg font-medium text-gray-600 mb-2">
                  대화 주제
                </div>
                <div className="text-xl font-semibold text-gray-900 leading-relaxed">
                  {question}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timer Display */}
          <div className="text-center">
            <RoundTimer
              initialTime={timeRemaining}
              isRunning={isTimerRunning}
              onTimeUp={onTimeUp}
              onWarning={onTimeWarning}
              phase="free_time"
              className="mx-auto max-w-sm"
            />
          </div>

          {/* Instructions */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      편안하게 대화하세요
                    </div>
                    <div className="text-sm text-gray-600">
                      주어진 주제로 자연스럽게 이야기를 나누어보세요
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      서로를 알아가세요
                    </div>
                    <div className="text-sm text-gray-600">
                      상대방의 생각과 가치관을 들어보는 시간입니다
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      시간이 끝나면 자동으로 진행됩니다
                    </div>
                    <div className="text-sm text-gray-600">
                      3분 후 참가자 선택 단계로 넘어갑니다
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participant Count */}
          <div className="text-center">
            <div className="text-sm text-gray-600">
              현재{" "}
              <span className="font-semibold text-primary">
                {participantCount}명
              </span>
              이 참여 중입니다
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
