"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, UserPlus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { participants } from "@/db/schema";
import ParticipantProfileForm from "./participant-profile-form";
import CharacterGallery from "./character-gallery";
import MbtiQuiz from "./mbti-quiz";
import ParticipantList from "./participant-list";
import GenderBalanceIndicator from "./gender-balance-indicator";
import { createParticipant, validateNickname } from "../actions/create.action";
import {
  validateGameRoomAccess,
  validateParticipantCapacity,
} from "../actions/validation.action";
import {
  type ParticipantProfileInput,
  type CharacterSelectionInput,
  type MbtiSelectionInput,
  AVAILABLE_CHARACTERS,
  MBTI_TYPES,
} from "../schemas";

type ParticipantData = typeof participants.$inferSelect;

interface ParticipantManagerProps {
  gameRoomId: string;
  maxParticipants?: number;
  onParticipantJoined?: (participant: ParticipantData) => void;
  onError?: (error: string) => void;
  className?: string;
}

type Step = "profile" | "character" | "mbti" | "complete";

interface ParticipantFormData {
  profile?: ParticipantProfileInput;
  character?: CharacterSelectionInput;
  mbti?: MbtiSelectionInput;
}

export default function ParticipantManager({
  gameRoomId,
  maxParticipants = 8,
  onParticipantJoined,
  onError,
  className,
}: ParticipantManagerProps) {
  const [currentStep, setCurrentStep] = useState<Step>("profile");
  const [formData, setFormData] = useState<ParticipantFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingRoom, setIsValidatingRoom] = useState(true);
  const [roomValid, setRoomValid] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Validate room access on mount
  useEffect(() => {
    const validateRoom = async () => {
      setIsValidatingRoom(true);
      try {
        const result = await validateGameRoomAccess(gameRoomId);
        if (result.success) {
          setRoomValid(true);
        } else {
          setRoomValid(false);
          onError?.(result.error || "게임방에 접근할 수 없습니다.");
        }
      } catch (error) {
        setRoomValid(false);
        onError?.("게임방 접근 권한을 확인하는 중 오류가 발생했습니다.");
      } finally {
        setIsValidatingRoom(false);
      }
    };

    validateRoom();
  }, [gameRoomId, onError]);

  const handleProfileSubmit = async (profileData: ParticipantProfileInput) => {
    try {
      // Validate participant capacity
      const capacityResult = await validateParticipantCapacity(
        gameRoomId,
        profileData.gender
      );

      if (!capacityResult.success) {
        toast.error(capacityResult.error);
        return;
      }

      setFormData((prev) => ({ ...prev, profile: profileData }));
      setCurrentStep("character");
    } catch (error) {
      toast.error("참가자 정보 검증 중 오류가 발생했습니다.");
    }
  };

  const handleCharacterSelect = (character: string) => {
    const characterData: CharacterSelectionInput = {
      character: character as (typeof AVAILABLE_CHARACTERS)[number],
      gameRoomId,
    };
    setFormData((prev) => ({ ...prev, character: characterData }));
  };

  const handleCharacterConfirm = () => {
    if (!formData.character) {
      toast.error("캐릭터를 선택해주세요.");
      return;
    }
    setCurrentStep("mbti");
  };

  const handleMbtiSelect = (mbti: string) => {
    const mbtiData: MbtiSelectionInput = {
      mbti: mbti as (typeof MBTI_TYPES)[number],
    };
    setFormData((prev) => ({ ...prev, mbti: mbtiData }));
  };

  const handleMbtiConfirm = async () => {
    if (!formData.profile || !formData.character || !formData.mbti) {
      toast.error("모든 정보를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createParticipant(
        formData.profile,
        formData.character,
        formData.mbti
      );

      if (result.success && result.data) {
        toast.success("게임방에 성공적으로 참가했습니다!");
        setCurrentStep("complete");
        onParticipantJoined?.(result.data);
      } else {
        toast.error(result.error || "참가 중 오류가 발생했습니다.");
      }
    } catch (error) {
      toast.error("참가 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepBack = () => {
    switch (currentStep) {
      case "character":
        setCurrentStep("profile");
        break;
      case "mbti":
        setCurrentStep("character");
        break;
      default:
        break;
    }
  };

  const handleJoinAnother = () => {
    setFormData({});
    setCurrentStep("profile");
    setShowJoinForm(true);
  };

  const stepLabels = {
    profile: "1. 프로필 입력",
    character: "2. 캐릭터 선택",
    mbti: "3. MBTI 선택",
    complete: "완료",
  };

  if (isValidatingRoom) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>게임방 확인 중...</span>
        </CardContent>
      </Card>
    );
  }

  if (!roomValid) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="text-center py-8">
          <div className="text-destructive mb-4">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <h3 className="font-semibold">게임방에 접근할 수 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              게임방이 존재하지 않거나 이미 시작되었습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">게임 참가</span>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(stepLabels).map(([step, label], index) => (
            <div key={step} className="flex items-center">
              <Badge
                variant={
                  step === currentStep
                    ? "default"
                    : Object.keys(stepLabels).indexOf(step) <
                      Object.keys(stepLabels).indexOf(currentStep)
                    ? "secondary"
                    : "outline"
                }
                className="text-xs"
              >
                {label}
              </Badge>
              {index < Object.keys(stepLabels).length - 1 && (
                <div className="w-2 h-px bg-border mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Room info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ParticipantList
          gameRoomId={gameRoomId}
          maxParticipants={maxParticipants}
          variant="compact"
        />
        <GenderBalanceIndicator
          gameRoomId={gameRoomId}
          maxParticipants={maxParticipants}
          variant="compact"
        />
      </div>

      {/* Step content */}
      <div className="space-y-4">
        {currentStep === "profile" && (
          <ParticipantProfileForm
            gameRoomId={gameRoomId}
            onSuccess={handleProfileSubmit}
            onCancel={() => setShowJoinForm(false)}
          />
        )}

        {currentStep === "character" && (
          <CharacterGallery
            gameRoomId={gameRoomId}
            selectedCharacter={formData.character?.character}
            onCharacterSelect={handleCharacterSelect}
            onConfirm={handleCharacterConfirm}
            onCancel={handleStepBack}
          />
        )}

        {currentStep === "mbti" && (
          <MbtiQuiz
            selectedMbti={formData.mbti?.mbti}
            onMbtiSelect={handleMbtiSelect}
            onConfirm={handleMbtiConfirm}
            onCancel={handleStepBack}
          />
        )}

        {currentStep === "complete" && (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">🎉 참가 완료!</CardTitle>
              <CardDescription className="text-center">
                게임방에 성공적으로 참가했습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-2xl">
                  {formData.character?.character?.split(" ")[0]}
                </div>
                <div className="font-medium">{formData.profile?.nickname}</div>
                <div className="text-sm text-muted-foreground">
                  {formData.mbti?.mbti} ·{" "}
                  {formData.profile?.gender === "male"
                    ? "남성"
                    : formData.profile?.gender === "female"
                    ? "여성"
                    : "기타"}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleJoinAnother}
                  className="flex-1"
                >
                  다른 참가자 추가
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardContent className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>참가 처리 중...</span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
