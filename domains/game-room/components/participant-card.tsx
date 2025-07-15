"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MBTI_LABELS } from "@/utils/game-room";

interface ParticipantCardProps {
  participant: {
    id: string;
    nickname: string;
    gender: "male" | "female" | "other";
    mbti: string;
    character: string;
    status: "joined" | "ready" | "playing" | "finished";
  };
  isHost?: boolean;
  canTransferHost?: boolean;
  onTransferHost?: (participantId: string) => void;
}

export function ParticipantCard({
  participant,
  isHost = false,
  canTransferHost = false,
  onTransferHost,
}: ParticipantCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-green-500";
      case "playing": return "bg-blue-500";
      case "finished": return "bg-gray-500";
      default: return "bg-yellow-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready": return "준비완료";
      case "playing": return "플레이중";
      case "finished": return "완료";
      default: return "대기중";
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case "male": return "♂️";
      case "female": return "♀️";
      default: return "⚧️";
    }
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{participant.character}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{participant.nickname}</h3>
                {isHost && (
                  <Badge variant="secondary" className="text-xs">
                    호스트
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {getGenderIcon(participant.gender)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {participant.mbti}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {MBTI_LABELS[participant.mbti as keyof typeof MBTI_LABELS]}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(participant.status)}`} />
              <span className="text-xs text-muted-foreground">
                {getStatusText(participant.status)}
              </span>
            </div>
            
            {canTransferHost && !isHost && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTransferHost?.(participant.id)}
                className="text-xs"
              >
                호스트 이양
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}