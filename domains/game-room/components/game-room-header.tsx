"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Users, Clock } from "lucide-react";
import { toast } from "sonner";

interface GameRoomHeaderProps {
  gameRoom: {
    id: string;
    code: string;
    maxParticipants: number;
    totalRounds: number;
    status: "waiting" | "in_progress" | "completed" | "cancelled";
  };
  participantCount: number;
  onLeaveRoom?: () => void;
}

export function GameRoomHeader({
  gameRoom,
  participantCount,
  onLeaveRoom,
}: GameRoomHeaderProps) {
  const [copying, setCopying] = useState(false);

  const copyRoomCode = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(gameRoom.code);
      toast.success("방 코드가 복사되었습니다!");
    } catch (error) {
      toast.error("방 코드 복사에 실패했습니다.");
    } finally {
      setCopying(false);
    }
  };

  const shareRoom = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "게임방 참가",
          text: `방 코드: ${gameRoom.code}`,
          url: `${window.location.origin}/join-room?code=${gameRoom.code}`,
        });
      } else {
        // 폴백: 클립보드에 링크 복사
        const shareUrl = `${window.location.origin}/join-room?code=${gameRoom.code}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success("게임방 링크가 복사되었습니다!");
      }
    } catch (error) {
      toast.error("공유에 실패했습니다.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-yellow-500";
      case "in_progress": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting": return "대기중";
      case "in_progress": return "진행중";
      case "completed": return "완료";
      case "cancelled": return "취소됨";
      default: return "알 수 없음";
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">게임방</h1>
            <Badge className={getStatusColor(gameRoom.status)}>
              {getStatusText(gameRoom.status)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareRoom}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              공유
            </Button>
            
            {onLeaveRoom && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLeaveRoom}
                className="text-red-600 hover:text-red-700"
              >
                나가기
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">방 코드:</span>
            <div className="flex items-center gap-2">
              <code className="bg-muted px-2 py-1 rounded text-lg font-mono">
                {gameRoom.code}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRoomCode}
                disabled={copying}
                className="p-1 h-8 w-8"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {participantCount}/{gameRoom.maxParticipants}명
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {gameRoom.totalRounds}라운드
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(gameRoom.status)}`} />
            <span className="text-sm text-muted-foreground">
              {getStatusText(gameRoom.status)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}