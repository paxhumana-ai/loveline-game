"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  participantProfileSchema,
  type ParticipantProfileInput,
} from "../schemas";
import { validateNickname } from "../actions/create.action";

interface ParticipantProfileFormProps {
  gameRoomId: string;
  onSuccess: (data: ParticipantProfileInput) => void;
  onCancel?: () => void;
}

const genderLabels = {
  male: "남성",
  female: "여성",
  other: "기타",
};

export default function ParticipantProfileForm({
  gameRoomId,
  onSuccess,
  onCancel,
}: ParticipantProfileFormProps) {
  const [isValidatingNickname, setIsValidatingNickname] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<ParticipantProfileInput>({
    resolver: zodResolver(participantProfileSchema),
    defaultValues: {
      nickname: "",
      gender: undefined,
      gameRoomId,
    },
  });

  const nickname = watch("nickname");

  const handleNicknameValidation = async () => {
    if (!nickname || nickname.length < 2) {
      return;
    }

    setIsValidatingNickname(true);
    try {
      const result = await validateNickname(nickname, gameRoomId);
      if (!result.success) {
        setError("nickname", {
          type: "manual",
          message: result.error || "닉네임 검증에 실패했습니다.",
        });
        toast.error(result.error);
      } else {
        toast.success("사용 가능한 닉네임입니다!");
      }
    } catch (error) {
      toast.error("닉네임 검증 중 오류가 발생했습니다.");
    } finally {
      setIsValidatingNickname(false);
    }
  };

  const onSubmit = async (data: ParticipantProfileInput) => {
    try {
      // Final nickname validation before submission
      const nicknameValidation = await validateNickname(
        data.nickname,
        gameRoomId
      );
      if (!nicknameValidation.success) {
        setError("nickname", {
          type: "manual",
          message: nicknameValidation.error || "닉네임 검증에 실패했습니다.",
        });
        toast.error(nicknameValidation.error);
        return;
      }

      onSuccess(data);
    } catch (error) {
      toast.error("프로필 제출 중 오류가 발생했습니다.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>참가자 정보 입력</CardTitle>
        <CardDescription>
          게임 참가를 위해 닉네임과 성별을 입력해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <div className="flex gap-2">
              <Controller
                name="nickname"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="nickname"
                    placeholder="닉네임을 입력하세요 (2-8자)"
                    className="flex-1"
                  />
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNicknameValidation}
                disabled={
                  isValidatingNickname || !nickname || nickname.length < 2
                }
              >
                {isValidatingNickname ? "확인 중..." : "중복 확인"}
              </Button>
            </div>
            {errors.nickname && (
              <p className="text-destructive text-sm">
                {errors.nickname.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
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
                    {Object.entries(genderLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && (
              <p className="text-destructive text-sm">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                취소
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "처리 중..." : "다음 단계"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
