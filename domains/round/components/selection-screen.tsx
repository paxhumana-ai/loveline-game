"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Users, CheckCircle } from "lucide-react";
import { RoundTimer } from "./round-timer";
import { TimeWarning } from "./time-warning";

interface Participant {
  id: string;
  name: string;
  age: number;
  mbti?: string;
  profile?: {
    occupation?: string;
    bio?: string;
  };
}

interface SelectionScreenProps {
  roundNumber: number;
  question: string;
  participants: Participant[];
  currentUserId: string;
  selectedParticipantIds: string[];
  timeRemaining: number;
  isTimerRunning: boolean;
  onParticipantSelect: (participantId: string) => void;
  onParticipantDeselect: (participantId: string) => void;
  onTimeUp?: () => void;
  onTimeWarning?: (remainingTime: number) => void;
  className?: string;
}

export function SelectionScreen({
  roundNumber,
  question,
  participants,
  currentUserId,
  selectedParticipantIds,
  timeRemaining,
  isTimerRunning,
  onParticipantSelect,
  onParticipantDeselect,
  onTimeUp,
  onTimeWarning,
  className = "",
}: SelectionScreenProps) {
  const showWarning = timeRemaining <= 30;
  const availableParticipants = participants.filter(
    (p) => p.id !== currentUserId
  );

  const handleToggleSelection = (participantId: string) => {
    if (selectedParticipantIds.includes(participantId)) {
      onParticipantDeselect(participantId);
    } else {
      onParticipantSelect(participantId);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Warning Display */}
      {showWarning && (
        <TimeWarning remainingTime={timeRemaining} phase="selection" />
      )}

      {/* Main Content */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="outline" className="text-sm">
              Round {roundNumber}
            </Badge>
            <Badge className="bg-pink-100 text-pink-800 border-pink-200">
              💝 선택 시간
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            관심 있는 분을 선택해주세요
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Reminder */}
          <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  방금 대화한 주제
                </div>
                <div className="text-base text-gray-900">{question}</div>
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
              phase="selection"
              className="mx-auto max-w-sm"
            />
          </div>

          {/* Selection Stats */}
          <div className="text-center">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-primary">
                {selectedParticipantIds.length}명
              </span>
              선택됨 (최대 {availableParticipants.length}명)
            </div>
          </div>

          {/* Participant List */}
          <div className="space-y-3">
            {availableParticipants.length === 0 ? (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <div className="text-center text-gray-600">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <div>아직 다른 참가자가 없습니다</div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              availableParticipants.map((participant) => {
                const isSelected = selectedParticipantIds.includes(
                  participant.id
                );
                return (
                  <Card
                    key={participant.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? "border-pink-300 bg-pink-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => handleToggleSelection(participant.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-blue-600">
                              {participant.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {participant.name}
                              <span className="text-sm text-gray-500">
                                ({participant.age}세)
                              </span>
                              {participant.mbti && (
                                <Badge variant="outline" className="text-xs">
                                  {participant.mbti}
                                </Badge>
                              )}
                            </div>
                            {participant.profile?.occupation && (
                              <div className="text-sm text-gray-600">
                                {participant.profile.occupation}
                              </div>
                            )}
                            {participant.profile?.bio && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {participant.profile.bio}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <div className="flex items-center gap-1 text-pink-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">
                                선택됨
                              </span>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-pink-600 border-pink-200 hover:bg-pink-50"
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              선택
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Instructions */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>대화를 나눈 후 관심이 생긴 분을 선택해주세요</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>여러 명을 선택할 수 있습니다</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>시간이 끝나면 자동으로 다음 라운드로 진행됩니다</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
