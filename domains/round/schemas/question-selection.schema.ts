import { z } from "zod";

// Question category validation (existing in DB)
export const questionCategorySchema = z.enum([
  "romance",
  "friendship",
  "personality",
  "lifestyle",
  "preferences",
  "hypothetical",
]);

// Question selection phase validation (for round categorization)
export const questionPhaseSchema = z.enum(["초반", "중반", "후반"]);

// Question selection input validation
export const questionSelectionSchema = z.object({
  gameRoomId: z.string().uuid("Invalid game room ID"),
  roundNumber: z.number().int().min(1).max(10),
  excludeQuestionIds: z.array(z.string().uuid()).optional().default([]),
});

// Question filter validation
export const questionFilterSchema = z.object({
  categories: z.array(questionCategorySchema).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  excludeIds: z.array(z.string().uuid()).optional().default([]),
});

// Mark question as used validation
export const markQuestionUsedSchema = z.object({
  gameRoomId: z.string().uuid("Invalid game room ID"),
  questionId: z.string().uuid("Invalid question ID"),
  roundId: z.string().uuid("Invalid round ID"),
});

// Question with metadata
export const questionWithMetadataSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  category: questionCategorySchema,
  difficulty: z.number().int().min(1).max(5),
  phase: questionPhaseSchema,
  isUsed: z.boolean().default(false),
});

// Types
export type QuestionCategory = z.infer<typeof questionCategorySchema>;
export type QuestionPhase = z.infer<typeof questionPhaseSchema>;
export type QuestionSelectionInput = z.infer<typeof questionSelectionSchema>;
export type QuestionFilterInput = z.infer<typeof questionFilterSchema>;
export type MarkQuestionUsedInput = z.infer<typeof markQuestionUsedSchema>;
export type QuestionWithMetadata = z.infer<typeof questionWithMetadataSchema>;

// Helper function to get categories by round number
export function getCategoriesForRound(roundNumber: number): QuestionCategory[] {
  if (roundNumber >= 1 && roundNumber <= 3) {
    // 초반: lighter topics
    return ["romance", "friendship"];
  } else if (roundNumber >= 4 && roundNumber <= 7) {
    // 중반: deeper engagement
    return ["personality", "lifestyle"];
  } else if (roundNumber >= 8 && roundNumber <= 10) {
    // 후반: serious selection
    return ["preferences", "hypothetical"];
  }
  // Fallback to all categories
  return [
    "romance",
    "friendship",
    "personality",
    "lifestyle",
    "preferences",
    "hypothetical",
  ];
}

// Helper function to get phase by round number
export function getPhaseForRound(roundNumber: number): QuestionPhase {
  if (roundNumber >= 1 && roundNumber <= 3) return "초반";
  if (roundNumber >= 4 && roundNumber <= 7) return "중반";
  if (roundNumber >= 8 && roundNumber <= 10) return "후반";
  return "초반"; // fallback
}
