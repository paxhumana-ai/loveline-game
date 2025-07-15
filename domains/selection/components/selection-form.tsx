"use client";

import { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ParticipantSelector } from "./participant-selector";
import { MessageInput } from "./message-input";
import { PassOption, PassButton } from "./pass-option";
import { selectionInputSchema, type SelectionInput } from "../schemas";

interface Participant {
  id: string;
  nickname: string;
  character: string;
  gender: "male" | "female" | "other";
  mbti?: string;
}

interface SelectionFormProps {
  participants: Participant[];
  roundId: string;
  currentParticipantId: string;
  roundNumber?: number;
  remainingTime?: number;
  onSubmit: (
    data: SelectionInput
  ) => Promise<{ success: boolean; error?: string }>;
  disabled?: boolean;
  existingSelection?: {
    selectedParticipantId?: string;
    message?: string;
    isPassed: boolean;
  };
  className?: string;
}

export function SelectionForm({
  participants,
  roundId,
  currentParticipantId,
  roundNumber,
  remainingTime,
  onSubmit,
  disabled = false,
  existingSelection,
  className,
}: SelectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"participant" | "pass">(
    existingSelection?.isPassed ? "pass" : "participant"
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<SelectionInput>({
    resolver: zodResolver(selectionInputSchema),
    defaultValues: {
      roundId,
      selectedParticipantId:
        existingSelection?.selectedParticipantId ?? undefined,
      message: existingSelection?.message ?? "",
      isPassed: existingSelection?.isPassed ?? false, // 항상 명시
    },
  });

  const watchedValues = watch();
  const hasSelectedParticipant = !!watchedValues.selectedParticipantId;
  const isPassed = watchedValues.isPassed;

  // Filter out current participant from selectable participants
  const selectableParticipants = participants.filter(
    (p) => p.id !== currentParticipantId
  );

  const handleParticipantSelect = (participantId: string) => {
    setValue("selectedParticipantId", participantId);
    setValue("isPassed", false);
    setSelectionMode("participant");
  };

  const handlePassSelect = () => {
    setValue("selectedParticipantId", undefined);
    setValue("isPassed", true);
    setValue("message", "");
    setSelectionMode("pass");
  };

  const handleFormSubmit: SubmitHandler<SelectionInput> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);
      if (result.success) {
        toast.success(
          data.isPassed ? "라운드를 패스했습니다" : "선택을 완료했습니다"
        );
      } else {
        toast.error(result.error || "선택 저장에 실패했습니다");
      }
    } catch (error) {
      toast.error("선택 저장 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = (hasSelectedParticipant || isPassed) && !disabled;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn("space-y-6", className)}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {roundNumber && `라운드 ${roundNumber} - `}선택하기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Mode Toggle */}
          <div className="flex gap-4 p-1 bg-muted rounded-lg">
            <Button
              type="button"
              variant={selectionMode === "participant" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setSelectionMode("participant")}
              disabled={disabled}
            >
              참가자 선택
            </Button>
            <Button
              type="button"
              variant={selectionMode === "pass" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setSelectionMode("pass")}
              disabled={disabled}
            >
              라운드 패스
            </Button>
          </div>

          {/* Participant Selection */}
          {selectionMode === "participant" && (
            <div className="space-y-4">
              <Controller
                name="selectedParticipantId"
                control={control}
                render={({ field }) => (
                  <ParticipantSelector
                    participants={selectableParticipants}
                    currentParticipantId={currentParticipantId}
                    selectedParticipantId={field.value}
                    onParticipantSelect={handleParticipantSelect}
                    disabled={disabled}
                  />
                )}
              />

              {errors.selectedParticipantId && (
                <p className="text-sm text-destructive text-center">
                  {errors.selectedParticipantId.message}
                </p>
              )}

              {/* Message Input */}
              {hasSelectedParticipant && (
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <MessageInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      disabled={disabled}
                      error={errors.message?.message}
                    />
                  )}
                />
              )}
            </div>
          )}

          {/* Pass Option */}
          {selectionMode === "pass" && (
            <div className="flex justify-center">
              <PassOption
                onPass={handlePassSelect}
                disabled={disabled}
                isSelected={isPassed}
                roundNumber={roundNumber}
                remainingTime={remainingTime}
                participantCount={selectableParticipants.length}
                className="max-w-md"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit || isSubmitting}
              className="w-full"
            >
              {isSubmitting
                ? "저장 중..."
                : isPassed
                ? "패스 확정"
                : hasSelectedParticipant
                ? "선택 확정"
                : "선택해주세요"}
            </Button>

            {/* Quick Pass Button for mobile */}
            {selectionMode === "participant" && !hasSelectedParticipant && (
              <div className="md:hidden">
                <PassButton
                  onPass={handlePassSelect}
                  disabled={disabled}
                  size="sm"
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Form Status */}
          {(hasSelectedParticipant || isPassed) && (
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-sm">
                {isPassed
                  ? "이번 라운드를 패스합니다"
                  : `${
                      participants.find(
                        (p) => p.id === watchedValues.selectedParticipantId
                      )?.nickname
                    }님을 선택했습니다`}
              </p>
              {watchedValues.message && (
                <p className="text-xs text-muted-foreground mt-1">
                  메시지: &quot;{watchedValues.message}&quot;
                </p>
              )}
            </div>
          )}

          {/* Time Warning */}
          {remainingTime && remainingTime <= 60 && remainingTime > 0 && (
            <div className="text-center p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning font-medium">
                ⏰ {remainingTime}초 남았습니다!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
