"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CharacterSelector } from "./character-selector";
import { MBTISelector } from "./mbti-selector";
import { joinGameRoom } from "../actions/join.action";
import { joinRoomSchema, type JoinRoomInput } from "../schemas";
import { toast } from "sonner";

export function JoinRoomForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<JoinRoomInput>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      code: "",
      nickname: "",
      gender: "male",
      mbti: "ENFP",
      character: "",
    },
  });

  const onSubmit = async (data: JoinRoomInput) => {
    try {
      const result = await joinGameRoom(data);

      if (result.success) {
        toast.success("게임방에 참가했습니다!");
        router.push(`/room/${result.data?.roomCode}`);
      } else {
        toast.error(result.error || "게임방 참가에 실패했습니다.");
      }
    } catch (error) {
      console.error("게임방 참가 오류:", error);
      toast.error("게임방 참가 중 오류가 발생했습니다.");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="code">방 코드</Label>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input
                  id="code"
                  placeholder="6자리 방 코드를 입력하세요"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="font-mono text-center text-lg tracking-wider"
                />
              )}
            />
            {errors.code && (
              <p className="text-destructive text-sm mt-1">
                {errors.code.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="nickname">닉네임</Label>
            <Controller
              name="nickname"
              control={control}
              render={({ field }) => (
                <Input
                  id="nickname"
                  placeholder="닉네임을 입력하세요"
                  {...field}
                />
              )}
            />
            {errors.nickname && (
              <p className="text-destructive text-sm mt-1">
                {errors.nickname.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="gender">성별</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="성별을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">남성</SelectItem>
                    <SelectItem value="female">여성</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && (
              <p className="text-destructive text-sm mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div>
            <Label>MBTI</Label>
            <Controller
              name="mbti"
              control={control}
              render={({ field }) => (
                <MBTISelector
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.mbti?.message}
                />
              )}
            />
          </div>

          <div>
            <Label>캐릭터</Label>
            <Controller
              name="character"
              control={control}
              render={({ field }) => (
                <CharacterSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.character?.message}
                />
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "게임방 참가 중..." : "게임방 참가하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
