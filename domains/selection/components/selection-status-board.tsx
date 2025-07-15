"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantStatus {
  participantId: string;
  nickname: string;
  character: string;
  hasSelected: boolean;
  selectionStatus: "not_selected" | "selected" | "passed";
}

interface SelectionStatusBoardProps {
  participants: ParticipantStatus[];
  totalParticipants: number;
  completedSelections: number;
  progressPercentage: number;
  allCompleted: boolean;
  roundNumber?: number;
  remainingTime?: number;
  className?: string;
}

export function SelectionStatusBoard({
  participants,
  totalParticipants,
  completedSelections,
  progressPercentage,
  allCompleted,
  roundNumber,
  remainingTime,
  className,
}: SelectionStatusBoardProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "selected":
        return <Check className="w-4 h-4 text-success" />;
      case "passed":
        return <X className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "selected":
        return <Badge variant="default" className="text-xs">선택완료</Badge>;
      case "passed":
        return <Badge variant="secondary" className="text-xs">패스</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">대기중</Badge>;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {roundNumber && `라운드 ${roundNumber} `}진행 상황
          </CardTitle>
          {remainingTime && remainingTime > 0 && (
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(remainingTime)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              전체 진행률
            </span>
            <span className="font-medium">
              {completedSelections}/{totalParticipants} ({progressPercentage}%)
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {allCompleted && (
            <div className="text-center py-2">
              <Badge variant="default" className="bg-success text-success-foreground">
                ✅ 모든 참가자가 선택을 완료했습니다!
              </Badge>
            </div>
          )}
        </div>

        {/* Participant List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            참가자별 상태
          </h4>
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {participants.map((participant) => (
              <div
                key={participant.participantId}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg border transition-colors",
                  {
                    "bg-success/10 border-success/20": participant.selectionStatus === "selected",
                    "bg-warning/10 border-warning/20": participant.selectionStatus === "passed",
                    "bg-muted/30": participant.selectionStatus === "not_selected",
                  }
                )}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {participant.character.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {participant.nickname}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {participant.character}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(participant.selectionStatus)}
                  {getStatusBadge(participant.selectionStatus)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-success">
              {participants.filter(p => p.selectionStatus === "selected").length}
            </p>
            <p className="text-xs text-muted-foreground">선택완료</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-warning">
              {participants.filter(p => p.selectionStatus === "passed").length}
            </p>
            <p className="text-xs text-muted-foreground">패스</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-muted-foreground">
              {participants.filter(p => p.selectionStatus === "not_selected").length}
            </p>
            <p className="text-xs text-muted-foreground">대기중</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}