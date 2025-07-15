"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import ParticipantAvatar from "./participant-avatar";
import { getParticipantsByRoom } from "../actions";

interface ParticipantData {
  id: string;
  nickname: string;
  character: string;
  status: "joined" | "ready" | "playing" | "finished";
  createdAt: Date;
  updatedAt: Date;
}

interface ParticipantListProps {
  gameRoomId: string;
  maxParticipants?: number;
  showRefresh?: boolean;
  variant?: "default" | "compact";
  className?: string;
}

export default function ParticipantList({
  gameRoomId,
  maxParticipants = 8,
  showRefresh = true,
  variant = "default",
  className,
}: ParticipantListProps) {
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchParticipants = async (showLoadingState = true) => {
    if (showLoadingState) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const result = await getParticipantsByRoom(gameRoomId);
      if (result.success && result.data) {
        setParticipants(result.data);
      } else {
        toast.error(result.error || "참가자 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      toast.error("참가자 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [gameRoomId]);

  const handleRefresh = () => {
    fetchParticipants(false);
  };

  const readyCount = participants.filter((p) => p.status === "ready").length;
  const joinedCount = participants.filter((p) => p.status === "joined").length;

  if (variant === "compact") {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="font-medium">
              참가자 ({participants.length}/{maxParticipants})
            </span>
          </div>
          {showRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {participants.map((participant) => (
            <ParticipantAvatar
              key={participant.id}
              character={participant.character}
              nickname={participant.nickname}
              status={participant.status}
              size="sm"
              variant="minimal"
            />
          ))}

          {participants.length === 0 && !isLoading && (
            <div className="text-center py-4 text-muted-foreground">
              아직 참가자가 없습니다.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              참가자 목록
            </CardTitle>
            <CardDescription>
              게임 참가자들을 확인하고 상태를 체크하세요.
            </CardDescription>
          </div>
          {showRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">
            전체 {participants.length}/{maxParticipants}
          </Badge>
          <Badge variant="secondary">준비 완료 {readyCount}명</Badge>
          <Badge variant="outline">대기 중 {joinedCount}명</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <ParticipantAvatar
                key={participant.id}
                character={participant.character}
                nickname={participant.nickname}
                status={participant.status}
                size="md"
                variant="default"
                showStatus={true}
              />
            ))}

            {participants.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>아직 참가자가 없습니다.</p>
                <p className="text-sm">
                  게임방 코드를 공유해 친구들을 초대해보세요!
                </p>
              </div>
            )}

            {/* Empty slots visualization */}
            {participants.length > 0 &&
              participants.length < maxParticipants && (
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">
                    남은 자리: {maxParticipants - participants.length}개
                  </div>
                  <div className="flex gap-2">
                    {Array.from({
                      length: maxParticipants - participants.length,
                    }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 border-2 border-dashed border-muted rounded-full flex items-center justify-center"
                      >
                        <div className="w-2 h-2 bg-muted rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
