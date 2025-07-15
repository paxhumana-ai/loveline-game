"use server";

import { eq, and, notInArray, sql } from "drizzle-orm";
import { createDrizzleSupabaseClient } from "@/db";
import { questions, rounds } from "@/db/schema";
import {
  questionSelectionSchema,
  questionFilterSchema,
  markQuestionUsedSchema,
  getCategoriesForRound,
  getPhaseForRound,
  type QuestionSelectionInput,
  type QuestionFilterInput,
  type MarkQuestionUsedInput,
  type QuestionWithMetadata,
  type QuestionCategory,
} from "../schemas";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string | Record<string, string[]>;
};

export type QuestionInfo = {
  id: string;
  content: string;
  category: string;
  difficulty: number;
  phase?: string;
  isUsed?: boolean;
};

export async function selectQuestionForRound(
  input: QuestionSelectionInput
): Promise<ActionResult<QuestionInfo>> {
  try {
    // Validate input
    const validatedInput = questionSelectionSchema.parse(input);
    const { gameRoomId, roundNumber, excludeQuestionIds = [] } = validatedInput;

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get used questions for this game room
      const usedQuestions = await tx
        .select({ questionId: rounds.questionId })
        .from(rounds)
        .where(eq(rounds.gameRoomId, gameRoomId));

      const usedQuestionIds = usedQuestions.map((r) => r.questionId);
      const allExcludedIds = [...usedQuestionIds, ...excludeQuestionIds];

      // Get appropriate categories for this round
      const appropriateCategories = getCategoriesForRound(roundNumber);
      const phase = getPhaseForRound(roundNumber);

      // Build query conditions
      const whereConditions = [];

      // Filter by categories
      if (appropriateCategories.length > 0) {
        whereConditions.push(
          sql`${questions.category} IN (${sql.join(
            appropriateCategories.map((c) => sql`${c}`),
            sql`, `
          )})`
        );
      }

      // Exclude used questions
      if (allExcludedIds.length > 0) {
        whereConditions.push(notInArray(questions.id, allExcludedIds));
      }

      // Combine conditions
      const whereClause =
        whereConditions.length > 0
          ? whereConditions.reduce(
              (acc, condition) => sql`${acc} AND ${condition}`
            )
          : sql`true`;

      // Get available questions
      const availableQuestions = await tx
        .select()
        .from(questions)
        .where(whereClause)
        .orderBy(sql`RANDOM()`)
        .limit(10); // Get a few options

      if (!availableQuestions.length) {
        // Fallback: try any unused question if no appropriate category questions available
        const fallbackQuestions = await tx
          .select()
          .from(questions)
          .where(
            allExcludedIds.length > 0
              ? notInArray(questions.id, allExcludedIds)
              : sql`true`
          )
          .orderBy(sql`RANDOM()`)
          .limit(1);

        if (!fallbackQuestions.length) {
          return { success: false, error: "No available questions found" };
        }

        const selectedQuestion = fallbackQuestions[0];
        const questionInfo: QuestionInfo = {
          id: selectedQuestion.id,
          content: selectedQuestion.content,
          category: selectedQuestion.category,
          difficulty: selectedQuestion.difficulty,
          phase,
          isUsed: false,
        };

        return { success: true, data: questionInfo };
      }

      // Select random question from appropriate category
      const selectedQuestion = availableQuestions[0];
      const questionInfo: QuestionInfo = {
        id: selectedQuestion.id,
        content: selectedQuestion.content,
        category: selectedQuestion.category,
        difficulty: selectedQuestion.difficulty,
        phase,
        isUsed: false,
      };

      return { success: true, data: questionInfo };
    });
  } catch (error) {
    console.error("Error selecting question for round:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to select question",
    };
  }
}

export async function getQuestionsByCategory(
  categories?: QuestionCategory[],
  gameRoomId?: string
): Promise<ActionResult<QuestionInfo[]>> {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get used questions if gameRoomId provided
      let usedQuestionIds: string[] = [];
      if (gameRoomId) {
        const usedQuestions = await tx
          .select({ questionId: rounds.questionId })
          .from(rounds)
          .where(eq(rounds.gameRoomId, gameRoomId));

        usedQuestionIds = usedQuestions.map((r) => r.questionId);
      }

      // Build query
      const whereConditions = [];

      if (categories && categories.length > 0) {
        whereConditions.push(
          sql`${questions.category} IN (${sql.join(
            categories.map((c) => sql`${c}`),
            sql`, `
          )})`
        );
      }

      const whereClause =
        whereConditions.length > 0
          ? whereConditions.reduce(
              (acc, condition) => sql`${acc} AND ${condition}`
            )
          : sql`true`;

      const questionList = await tx
        .select()
        .from(questions)
        .where(whereClause)
        .orderBy(questions.category, questions.difficulty);

      const questionsInfo: QuestionInfo[] = questionList.map((q) => ({
        id: q.id,
        content: q.content,
        category: q.category,
        difficulty: q.difficulty,
        isUsed: usedQuestionIds.includes(q.id),
      }));

      return { success: true, data: questionsInfo };
    });
  } catch (error) {
    console.error("Error getting questions by category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get questions",
    };
  }
}

export async function getAvailableQuestions(
  gameRoomId: string,
  roundNumber?: number
): Promise<ActionResult<QuestionInfo[]>> {
  try {
    if (!gameRoomId) {
      return { success: false, error: "Game room ID is required" };
    }

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get used questions for this game room
      const usedQuestions = await tx
        .select({ questionId: rounds.questionId })
        .from(rounds)
        .where(eq(rounds.gameRoomId, gameRoomId));

      const usedQuestionIds = usedQuestions.map((r) => r.questionId);

      // Determine categories based on round number
      let appropriateCategories: QuestionCategory[] = [];
      let phase: string | undefined;

      if (roundNumber) {
        appropriateCategories = getCategoriesForRound(roundNumber);
        phase = getPhaseForRound(roundNumber);
      }

      // Build query conditions
      const whereConditions = [];

      if (appropriateCategories.length > 0) {
        whereConditions.push(
          sql`${questions.category} IN (${sql.join(
            appropriateCategories.map((c) => sql`${c}`),
            sql`, `
          )})`
        );
      }

      if (usedQuestionIds.length > 0) {
        whereConditions.push(notInArray(questions.id, usedQuestionIds));
      }

      const whereClause =
        whereConditions.length > 0
          ? whereConditions.reduce(
              (acc, condition) => sql`${acc} AND ${condition}`
            )
          : sql`true`;

      const availableQuestions = await tx
        .select()
        .from(questions)
        .where(whereClause)
        .orderBy(questions.category, questions.difficulty);

      const questionsInfo: QuestionInfo[] = availableQuestions.map((q) => ({
        id: q.id,
        content: q.content,
        category: q.category,
        difficulty: q.difficulty,
        phase,
        isUsed: false,
      }));

      return { success: true, data: questionsInfo };
    });
  } catch (error) {
    console.error("Error getting available questions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get available questions",
    };
  }
}

export async function markQuestionAsUsed(
  input: MarkQuestionUsedInput
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedInput = markQuestionUsedSchema.parse(input);
    const { gameRoomId, questionId, roundId } = validatedInput;

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Verify the round exists and belongs to the game room
      const round = await tx
        .select({ id: rounds.id })
        .from(rounds)
        .where(
          and(
            eq(rounds.id, roundId),
            eq(rounds.gameRoomId, gameRoomId),
            eq(rounds.questionId, questionId)
          )
        )
        .limit(1);

      if (!round.length) {
        return {
          success: false,
          error: "Round not found or question mismatch",
        };
      }

      // The question is already marked as used by being associated with the round
      // No additional action needed as the association in rounds table serves as the "used" marker

      return { success: true };
    });
  } catch (error) {
    console.error("Error marking question as used:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark question as used",
    };
  }
}

export async function getUsedQuestions(
  gameRoomId: string
): Promise<ActionResult<QuestionInfo[]>> {
  try {
    if (!gameRoomId) {
      return { success: false, error: "Game room ID is required" };
    }

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get used questions with round information
      const usedQuestions = await tx
        .select({
          id: questions.id,
          content: questions.content,
          category: questions.category,
          difficulty: questions.difficulty,
          roundNumber: rounds.roundNumber,
        })
        .from(rounds)
        .innerJoin(questions, eq(rounds.questionId, questions.id))
        .where(eq(rounds.gameRoomId, gameRoomId))
        .orderBy(rounds.roundNumber);

      const questionsInfo: QuestionInfo[] = usedQuestions.map((q) => ({
        id: q.id,
        content: q.content,
        category: q.category,
        difficulty: q.difficulty,
        isUsed: true,
      }));

      return { success: true, data: questionsInfo };
    });
  } catch (error) {
    console.error("Error getting used questions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get used questions",
    };
  }
}
