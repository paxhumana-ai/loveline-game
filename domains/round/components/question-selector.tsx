"use client";

import { useState, useEffect, useCallback } from "react";
import {
  selectQuestionForRound,
  getQuestionsByCategory,
  getAvailableQuestions,
} from "../actions/question.action";
import {
  getCategoriesForRound,
  getPhaseForRound,
  QuestionCategory,
} from "../schemas/question-selection.schema";

interface Question {
  id: string;
  content: string;
  category: string;
  difficulty: number;
  phase?: string;
  isUsed?: boolean;
}

interface QuestionSelectorProps {
  gameRoomId: string;
  roundNumber: number;
  autoSelectQuestion?: boolean;
  onQuestionSelected?: (question: Question) => void;
  onError?: (error: string) => void;
  children: (props: {
    selectedQuestion: Question | null;
    availableQuestions: Question[];
    isLoading: boolean;
    actions: {
      selectQuestion: (questionId?: string) => Promise<void>;
      refreshQuestions: () => Promise<void>;
      getQuestionsByCategory: (category: string) => Promise<Question[]>;
    };
  }) => React.ReactNode;
}

export function QuestionSelector({
  gameRoomId,
  roundNumber,
  autoSelectQuestion = true,
  onQuestionSelected,
  onError,
  children,
}: QuestionSelectorProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get appropriate categories and phase for current round
  const currentPhase = getPhaseForRound(roundNumber);
  const currentCategories = getCategoriesForRound(roundNumber);

  // Fetch available questions for the current round
  const fetchAvailableQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAvailableQuestions(gameRoomId, roundNumber);

      if (result.success && result.data) {
        const questionsWithPhase = result.data.map((q) => ({
          ...q,
          phase: currentPhase,
        }));
        setAvailableQuestions(questionsWithPhase);
      } else {
        onError?.((result.error as string) || "Failed to fetch questions");
      }
    } catch (error) {
      onError?.(`Failed to fetch available questions: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [gameRoomId, currentPhase, onError, roundNumber]);

  // Select a question for the current round
  const selectQuestion = useCallback(
    async (questionId?: string) => {
      setIsLoading(true);
      try {
        const result = await selectQuestionForRound({
          gameRoomId,
          roundNumber,
          excludeQuestionIds: [],
        });

        if (result.success && result.data) {
          const questionWithPhase: Question = {
            ...result.data,
            phase: currentPhase,
          };

          setSelectedQuestion(questionWithPhase);
          onQuestionSelected?.(questionWithPhase);

          // Refresh available questions after selection
          await fetchAvailableQuestions();
        } else {
          onError?.((result.error as string) || "Failed to select question");
        }
      } catch (error) {
        onError?.(`Failed to select question: ${error}`);
      } finally {
        setIsLoading(false);
      }
    },
    [
      gameRoomId,
      roundNumber,
      currentPhase,
      onQuestionSelected,
      onError,
      fetchAvailableQuestions,
    ]
  );

  // Get questions by specific category
  const getQuestionsByCategoryHandler = useCallback(
    async (category: string): Promise<Question[]> => {
      try {
        const result = await getQuestionsByCategory(
          [category as QuestionCategory],
          gameRoomId
        );

        if (result.success && result.data) {
          return result.data.map((q) => ({
            ...q,
            phase: currentPhase,
          }));
        } else {
          onError?.(
            (result.error as string) || "Failed to fetch questions by category"
          );
          return [];
        }
      } catch (error) {
        onError?.(`Failed to fetch questions by category: ${error}`);
        return [];
      }
    },
    [gameRoomId, currentPhase, onError]
  );

  // Auto-select question on mount or round change
  useEffect(() => {
    if (autoSelectQuestion && !selectedQuestion) {
      selectQuestion();
    }
  }, [autoSelectQuestion, selectedQuestion, selectQuestion, roundNumber]);

  // Fetch available questions on mount or round change
  useEffect(() => {
    fetchAvailableQuestions();
  }, [fetchAvailableQuestions, roundNumber]);

  // Reset selected question when round changes
  useEffect(() => {
    setSelectedQuestion(null);
  }, [roundNumber]);

  return (
    <>
      {children({
        selectedQuestion,
        availableQuestions,
        isLoading,
        actions: {
          selectQuestion,
          refreshQuestions: fetchAvailableQuestions,
          getQuestionsByCategory: getQuestionsByCategoryHandler,
        },
      })}
    </>
  );
}
