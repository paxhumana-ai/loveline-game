"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Settings, Play } from "lucide-react";
import { updateGameRoomSettings, startGame } from "../actions";
import { roomSettingsSchema, type RoomSettingsInput } from "../schemas";
import { toast } from "sonner";

interface RoomSettingsPanelProps {
  gameRoom: {
    id: string;
    maxParticipants: number;
    totalRounds: number;
    status: "waiting" | "in_progress" | "completed" | "cancelled";
  };
  isHost: boolean;
  participantCount: number;
  canStartGame: boolean;
  onSettingsUpdated?: () => void;
  onGameStarted?: () => void;
}

export function RoomSettingsPanel({
  gameRoom,
  isHost,
  participantCount,
  canStartGame,
  onSettingsUpdated,
  onGameStarted,
}: RoomSettingsPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoomSettingsInput>({
    resolver: zodResolver(roomSettingsSchema),
    defaultValues: {
      maxParticipants: gameRoom.maxParticipants,
      totalRounds: gameRoom.totalRounds,
    },
  });

  const onSubmitSettings = async (data: RoomSettingsInput) => {
    try {
      setIsUpdating(true);
      const result = await updateGameRoomSettings(gameRoom.id, null, data);
      
      if (result.success) {
        toast.success("방 설정이 업데이트되었습니다!");
        onSettingsUpdated?.();
      } else {
        toast.error(result.error || "방 설정 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("방 설정 업데이트 오류:", error);
      toast.error("방 설정 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartGame = async () => {
    try {
      setIsStarting(true);
      const result = await startGame(gameRoom.id);
      
      if (result.success) {
        toast.success("게임이 시작되었습니다!");
        onGameStarted?.();
      } else {
        toast.error(result.error || "게임 시작에 실패했습니다.");
      }
    } catch (error) {
      console.error("게임 시작 오류:", error);
      toast.error("게임 시작 중 오류가 발생했습니다.");
    } finally {
      setIsStarting(false);
    }
  };

  if (!isHost) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          호스트 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmitSettings)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxParticipants">최대 참가자 수</Label>
              <Controller
                name="maxParticipants"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value?.toString()} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger id="maxParticipants">
                      <SelectValue placeholder="참가자 수" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem 
                          key={num} 
                          value={num.toString()}
                          disabled={num < participantCount}
                        >
                          {num}명 {num < participantCount && "(참가자 수 초과)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.maxParticipants && (
                <p className="text-destructive text-sm mt-1">
                  {errors.maxParticipants.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="totalRounds">총 라운드 수</Label>
              <Controller
                name="totalRounds"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value?.toString()} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger id="totalRounds">
                      <SelectValue placeholder="라운드 수" />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}라운드
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.totalRounds && (
                <p className="text-destructive text-sm mt-1">
                  {errors.totalRounds.message}
                </p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            variant="outline" 
            className="w-full"
            disabled={isUpdating || gameRoom.status !== "waiting"}
          >
            {isUpdating ? "설정 업데이트 중..." : "설정 저장"}
          </Button>
        </form>

        <div className="pt-4 border-t">
          <Button 
            onClick={handleStartGame}
            disabled={!canStartGame || isStarting || gameRoom.status !== "waiting"}
            className="w-full flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isStarting ? "게임 시작 중..." : "게임 시작"}
          </Button>
          
          {!canStartGame && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {participantCount < 2 
                ? "최소 2명의 참가자가 필요합니다"
                : "모든 참가자가 준비 완료해야 합니다"
              }
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}