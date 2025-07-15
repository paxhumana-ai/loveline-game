"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle } from "lucide-react";
import { GameRoomHeader } from "./game-room-header";
import { ParticipantCard } from "./participant-card";
import { RoomSettingsPanel } from "./room-settings-panel";
import { getGameRoomByCode } from "../actions/fetch.action";
import { updateParticipantStatus } from "../actions/update.action";
import { leaveGameRoom } from "../actions/leave.action";
import { transferHost } from "../actions/leave.action";
import { toast } from "sonner";

interface WaitingRoomProps {
  gameRoom: {
    id: string;
    code: string;
    maxParticipants: number;
    totalRounds: number;
    hostId: string | null;
    status: "waiting" | "in_progress" | "completed" | "cancelled";
  };
  participants: Array<{
    id: string;
    nickname: string;
    gender: "male" | "female" | "other";
    mbti: string;
    character: string;
    status: "joined" | "ready" | "playing" | "finished";
  }>;
  roomCode: string;
}

export function WaitingRoom({
  gameRoom: initialGameRoom,
  participants: initialParticipants,
  roomCode,
}: WaitingRoomProps) {
  const router = useRouter();
  const [gameRoom, setGameRoom] = useState(initialGameRoom);
  const [participants, setParticipants] = useState(initialParticipants);
  const [isReady, setIsReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 현재 사용자 정보 (실제로는 auth에서 가져와야 함)
  const currentUserId = "current-user-id"; // TODO: 실제 auth 연동
  const currentParticipant = participants.find((p) => p.id === currentUserId);
  const isHost = gameRoom.hostId === currentUserId;

  const readyParticipants = participants.filter((p) => p.status === "ready");
  const canStartGame =
    participants.length >= 2 &&
    readyParticipants.length === participants.length;

  // 주기적으로 방 상태 업데이트
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await getGameRoomByCode(roomCode);
        if (result.success) {
          setGameRoom(result.data?.gameRoom || initialGameRoom);
          setParticipants(result.data?.participants || initialParticipants);
        }
      } catch (error) {
        console.error("방 상태 업데이트 오류:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [roomCode, initialGameRoom, initialParticipants]);

  const handleToggleReady = async () => {
    if (!currentParticipant) return;

    try {
      setIsUpdating(true);
      const newStatus = isReady ? "joined" : "ready";

      const result = await updateParticipantStatus(
        currentParticipant.id,
        newStatus
      );

      if (result.success) {
        setIsReady(!isReady);
        toast.success(isReady ? "준비 취소" : "준비 완료!");

        // 참가자 상태 업데이트
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === currentParticipant.id ? { ...p, status: newStatus } : p
          )
        );
      } else {
        toast.error(result.error || "상태 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("준비 상태 변경 오류:", error);
      toast.error("준비 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentParticipant) return;

    try {
      const result = await leaveGameRoom(
        gameRoom.id,
        currentParticipant.id,
        false
      );

      if (result.success) {
        toast.success("게임방에서 나갔습니다.");
        router.push("/");
      } else {
        toast.error(result.error || "게임방 나가기에 실패했습니다.");
      }
    } catch (error) {
      console.error("게임방 나가기 오류:", error);
      toast.error("게임방 나가기 중 오류가 발생했습니다.");
    }
  };

  const handleTransferHost = async (participantId: string) => {
    try {
      const result = await transferHost(gameRoom.id, {
        newHostParticipantId: participantId,
      });

      if (result.success) {
        toast.success("호스트 권한이 이양되었습니다.");
        setGameRoom((prev) => ({
          ...prev,
          hostId: result.data?.newHost?.userId || null,
        }));
      } else {
        toast.error(result.error || "호스트 권한 이양에 실패했습니다.");
      }
    } catch (error) {
      console.error("호스트 권한 이양 오류:", error);
      toast.error("호스트 권한 이양 중 오류가 발생했습니다.");
    }
  };

  const handleSettingsUpdated = () => {
    // 방 설정 업데이트 후 새로고침
    router.refresh();
  };

  const handleGameStarted = () => {
    // 게임 시작 후 게임 페이지로 이동
    router.push(`/game/${roomCode}`);
  };

  return (
    <div className="space-y-6">
      <GameRoomHeader
        gameRoom={gameRoom}
        participantCount={participants.length}
        onLeaveRoom={handleLeaveRoom}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                참가자 목록 ({participants.length}/{gameRoom.maxParticipants})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  isHost={gameRoom.hostId === participant.id}
                  canTransferHost={isHost && gameRoom.hostId !== participant.id}
                  onTransferHost={handleTransferHost}
                />
              ))}
            </CardContent>
          </Card>

          {currentParticipant && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">준비 상태</span>
                    <Badge variant={isReady ? "default" : "secondary"}>
                      {isReady ? "준비완료" : "대기중"}
                    </Badge>
                  </div>

                  <Button
                    onClick={handleToggleReady}
                    disabled={isUpdating || gameRoom.status !== "waiting"}
                    variant={isReady ? "outline" : "default"}
                  >
                    {isUpdating
                      ? "변경 중..."
                      : isReady
                      ? "준비 취소"
                      : "준비 완료"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <RoomSettingsPanel
            gameRoom={gameRoom}
            isHost={isHost}
            participantCount={participants.length}
            canStartGame={canStartGame}
            onSettingsUpdated={handleSettingsUpdated}
            onGameStarted={handleGameStarted}
          />
        </div>
      </div>
    </div>
  );
}
