"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AVAILABLE_CHARACTERS } from "@/utils/game-room";

interface CharacterSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  unavailableCharacters?: string[];
  error?: string;
}

export function CharacterSelector({
  value,
  onValueChange,
  unavailableCharacters = [],
  error,
}: CharacterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (character: string) => {
    onValueChange(character);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        {value || "캐릭터를 선택하세요"}
        <span className="text-xs">▼</span>
      </Button>
      
      {isOpen && (
        <Card className="max-h-60 overflow-y-auto">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_CHARACTERS.map((character) => {
                const isUnavailable = unavailableCharacters.includes(character);
                
                return (
                  <Button
                    key={character}
                    type="button"
                    variant={value === character ? "default" : "outline"}
                    onClick={() => !isUnavailable && handleSelect(character)}
                    disabled={isUnavailable}
                    className="relative justify-start text-left h-auto p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{character}</span>
                      {isUnavailable && (
                        <Badge variant="secondary" className="text-xs">
                          선택됨
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  );
}