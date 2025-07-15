"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuestionDisplayProps {
  content: string;
  category: string;
  difficulty?: number;
  phase?: string;
  className?: string;
}

export function QuestionDisplay({
  content,
  category,
  difficulty = 1,
  phase,
  className = "",
}: QuestionDisplayProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "romance":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "friendship":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "personality":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "lifestyle":
        return "bg-green-100 text-green-800 border-green-200";
      case "preferences":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "hypothetical":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case "romance":
        return "💕";
      case "friendship":
        return "🤝";
      case "personality":
        return "🎭";
      case "lifestyle":
        return "🌟";
      case "preferences":
        return "🎯";
      case "hypothetical":
        return "🤔";
      default:
        return "💭";
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return "⭐".repeat(Math.min(difficulty, 5));
  };

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case "초반":
        return "워밍업";
      case "중반":
        return "본격적인";
      case "후반":
        return "마무리";
      default:
        return phase;
    }
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="pt-6">
        <div className="text-center">
          {/* Category Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge
              className={`${getCategoryColor(
                category
              )} px-3 py-1 text-sm font-medium border`}
            >
              <span className="mr-1">{getCategoryEmoji(category)}</span>
              {category}
            </Badge>
            {phase && (
              <Badge variant="outline" className="text-xs">
                {getPhaseText(phase)}
              </Badge>
            )}
          </div>

          {/* Question Content */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-card-foreground leading-relaxed">
              {content}
            </h2>
          </div>

          {/* Difficulty and Metadata */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            {difficulty > 0 && (
              <div className="flex items-center gap-1">
                <span>난이도:</span>
                <span>{getDifficultyStars(difficulty)}</span>
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
