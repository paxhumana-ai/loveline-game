"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  MBTI_TYPES,
  MBTI_CATEGORIES,
  MBTI_DESCRIPTIONS,
  mbtiSelectionSchema,
  type MbtiSelectionInput,
} from "../schemas";

interface MbtiQuizProps {
  selectedMbti?: string;
  onMbtiSelect: (mbti: string) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const categoryLabels = {
  analyst: "분석가 (NT)",
  diplomat: "외교관 (NF)",
  sentinel: "관리자 (SJ)",
  explorer: "탐험가 (SP)",
};

const categoryDescriptions = {
  analyst: "논리적이고 체계적인 사고를 중시하며, 전략적 접근을 선호합니다.",
  diplomat: "사람과의 관계를 중시하며, 가능성과 이상을 추구합니다.",
  sentinel: "전통과 질서를 중시하며, 안정성과 신뢰성을 추구합니다.",
  explorer: "자유롭고 유연한 사고를 가지며, 새로운 경험을 추구합니다.",
};

export default function MbtiQuiz({
  selectedMbti,
  onMbtiSelect,
  onConfirm,
  onCancel,
}: MbtiQuizProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleMbtiClick = (mbti: string) => {
    try {
      mbtiSelectionSchema.parse({ mbti: mbti as (typeof MBTI_TYPES)[number] });
      onMbtiSelect(mbti);

      // Find the category of selected MBTI
      const category = Object.entries(MBTI_CATEGORIES).find(([_, types]) =>
        (types as readonly string[]).includes(mbti)
      );
      if (category) {
        setSelectedCategory(category[0]);
      }
    } catch (error) {
      toast.error("유효하지 않은 MBTI 유형입니다.");
    }
  };

  const isMbtiSelected = (mbti: string) => mbti === selectedMbti;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>MBTI 유형 선택</CardTitle>
        <CardDescription>
          자신의 성격과 가장 비슷한 MBTI 유형을 선택해주세요. 각 카테고리별로
          분류되어 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(MBTI_CATEGORIES).map(([category, types]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-medium">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {
                    categoryDescriptions[
                      category as keyof typeof categoryDescriptions
                    ]
                  }
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {types.map((mbti) => {
                  const isSelected = isMbtiSelected(mbti);
                  const description = MBTI_DESCRIPTIONS[mbti];

                  return (
                    <button
                      key={mbti}
                      onClick={() => handleMbtiClick(mbti)}
                      className={`
                        relative p-4 rounded-lg border-2 transition-all duration-200
                        ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-md scale-105"
                            : "border-border hover:border-primary/50 hover:bg-accent hover:scale-102"
                        }
                        flex flex-col items-center gap-2 text-center
                      `}
                    >
                      <div className="font-bold text-lg">{mbti}</div>
                      <div className="text-xs text-muted-foreground leading-tight">
                        {description}
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {selectedMbti && (
          <>
            <Separator className="my-6" />
            <div className="p-4 bg-accent rounded-lg">
              <div className="text-center space-y-2">
                <div className="font-bold text-xl">{selectedMbti}</div>
                <div className="text-sm text-muted-foreground">
                  {
                    MBTI_DESCRIPTIONS[
                      selectedMbti as keyof typeof MBTI_DESCRIPTIONS
                    ]
                  }
                </div>
                <div className="text-xs text-muted-foreground">
                  선택된 MBTI 유형
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2 mt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              이전
            </Button>
          )}
          {onConfirm && (
            <Button
              onClick={onConfirm}
              disabled={!selectedMbti}
              className="flex-1"
            >
              완료
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
