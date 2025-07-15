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
import { createGameRoom } from "../actions/create.action";
import { createRoomSchema, type CreateRoomInput } from "../schemas";
import { toast } from "sonner";

export function CreateRoomForm() {
  const router = useRouter();

  const form = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      maxParticipants: 8,
      totalRounds: 3,
      hostNickname: "",
      hostGender: "male",
      hostMbti: "ENFP",
      hostCharacter: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = form;

  const onSubmit = async (data: CreateRoomInput) => {
    try {
      const result = await createGameRoom(data);

      if (result.success) {
        toast.success("게임방이 생성되었습니다!");
        router.push(`/room/${result.data?.roomCode}`);
      } else {
        toast.error(result.error || "게임방 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("게임방 생성 오류:", error);
      toast.error("게임방 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                        <SelectItem key={num} value={num.toString()}>
                          {num}명
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

          <div>
            <Label htmlFor="hostNickname">호스트 닉네임</Label>
            <Controller
              name="hostNickname"
              control={control}
              render={({ field }) => (
                <Input
                  id="hostNickname"
                  placeholder="닉네임을 입력하세요"
                  {...field}
                />
              )}
            />
            {errors.hostNickname && (
              <p className="text-destructive text-sm mt-1">
                {errors.hostNickname.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="hostGender">성별</Label>
            <Controller
              name="hostGender"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="hostGender">
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
            {errors.hostGender && (
              <p className="text-destructive text-sm mt-1">
                {errors.hostGender.message}
              </p>
            )}
          </div>

          <div>
            <Label>MBTI</Label>
            <Controller
              name="hostMbti"
              control={control}
              render={({ field }) => (
                <MBTISelector
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.hostMbti?.message}
                />
              )}
            />
          </div>

          <div>
            <Label>캐릭터</Label>
            <Controller
              name="hostCharacter"
              control={control}
              render={({ field }) => (
                <CharacterSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.hostCharacter?.message}
                />
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "게임방 생성 중..." : "게임방 만들기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
