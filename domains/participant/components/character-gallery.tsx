"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AVAILABLE_CHARACTERS, characterSelectionSchema } from "../schemas";
import { getAvailableCharacters } from "../actions/fetch.action";

interface CharacterGalleryProps {
  gameRoomId: string;
  selectedCharacter?: string;
  onCharacterSelect: (character: string) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface CharacterInfo {
  character: string;
  emoji: string;
  name: string;
  description: string;
}

// Parse character data from the AVAILABLE_CHARACTERS array
const parseCharacterData = (characters: readonly string[]): CharacterInfo[] => {
  return characters.map((char) => {
    const [emoji, name] = char.split(" ");
    return {
      character: char,
      emoji: emoji || "🎭",
      name: name || "Unknown",
      description: `${name} 캐릭터`,
    };
  });
};

export default function CharacterGallery({
  gameRoomId,
  selectedCharacter,
  onCharacterSelect,
  onConfirm,
  onCancel,
}: CharacterGalleryProps) {
  const [availableCharacters, setAvailableCharacters] = useState<string[]>([]);
  const [usedCharacters, setUsedCharacters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const characterData = parseCharacterData(AVAILABLE_CHARACTERS);

  useEffect(() => {
    const fetchAvailableCharacters = async () => {
      try {
        const result = await getAvailableCharacters(gameRoomId);
        if (result.success && result.data) {
          setAvailableCharacters(result.data.available);
          setUsedCharacters(result.data.used);
        } else {
          toast.error(result.error || "캐릭터 정보를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        toast.error("캐릭터 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableCharacters();
  }, [gameRoomId]);

  const handleCharacterClick = (character: string) => {
    if (usedCharacters.includes(character)) {
      toast.error("이미 선택된 캐릭터입니다.");
      return;
    }

    try {
      characterSelectionSchema.parse({
        character: character as (typeof AVAILABLE_CHARACTERS)[number],
        gameRoomId,
      });
      onCharacterSelect(character);
    } catch (error) {
      toast.error("유효하지 않은 캐릭터입니다.");
    }
  };

  const isCharacterSelected = (character: string) =>
    character === selectedCharacter;
  const isCharacterUsed = (character: string) =>
    usedCharacters.includes(character);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">캐릭터 로딩 중...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>캐릭터 선택</CardTitle>
        <CardDescription>
          마음에 드는 캐릭터를 선택해주세요. 회색으로 표시된 캐릭터는 이미 다른
          참가자가 선택했습니다.
        </CardDescription>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">
            총 {AVAILABLE_CHARACTERS.length}개 캐릭터
          </Badge>
          <Badge variant="outline">
            사용 가능 {availableCharacters.length}개
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-6">
          {characterData.map((char) => {
            const isSelected = isCharacterSelected(char.character);
            const isUsed = isCharacterUsed(char.character);
            const isDisabled = isUsed && !isSelected;

            return (
              <button
                key={char.character}
                onClick={() => handleCharacterClick(char.character)}
                disabled={isDisabled}
                className={`
                  relative p-3 rounded-lg border-2 transition-all duration-200
                  ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md scale-105"
                      : isDisabled
                      ? "border-muted bg-muted/50 cursor-not-allowed opacity-50"
                      : "border-border hover:border-primary/50 hover:bg-accent hover:scale-102"
                  }
                  flex flex-col items-center gap-1
                `}
              >
                <div className="text-2xl">{char.emoji}</div>
                <div className="text-xs text-center font-medium">
                  {char.name}
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
                {isUsed && !isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-muted-foreground rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedCharacter && (
          <div className="mb-4 p-3 bg-accent rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {
                  characterData.find((c) => c.character === selectedCharacter)
                    ?.emoji
                }
              </div>
              <div>
                <div className="font-medium">
                  {
                    characterData.find((c) => c.character === selectedCharacter)
                      ?.name
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  선택된 캐릭터
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              이전
            </Button>
          )}
          {onConfirm && (
            <Button
              onClick={onConfirm}
              disabled={!selectedCharacter}
              className="flex-1"
            >
              다음 단계
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
