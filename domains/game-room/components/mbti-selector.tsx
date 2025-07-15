"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MBTI_LABELS } from "@/utils/game-room";

interface MBTISelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
}

export function MBTISelector({
  value,
  onValueChange,
  error,
}: MBTISelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (mbti: string) => {
    onValueChange(mbti);
    setIsOpen(false);
  };

  const mbtiTypes = Object.keys(MBTI_LABELS) as Array<keyof typeof MBTI_LABELS>;

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        {value ? (
          <span>
            {value} - {MBTI_LABELS[value as keyof typeof MBTI_LABELS]}
          </span>
        ) : (
          "MBTI를 선택하세요"
        )}
        <span className="text-xs">▼</span>
      </Button>
      
      {isOpen && (
        <Card className="max-h-60 overflow-y-auto">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-2">
              {mbtiTypes.map((mbti) => (
                <Button
                  key={mbti}
                  type="button"
                  variant={value === mbti ? "default" : "outline"}
                  onClick={() => handleSelect(mbti)}
                  className="justify-start text-left h-auto p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono">
                      {mbti}
                    </Badge>
                    <span className="text-sm">{MBTI_LABELS[mbti]}</span>
                  </div>
                </Button>
              ))}
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