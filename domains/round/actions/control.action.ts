"use server";

import { eq, and, desc } from "drizzle-orm";
import { createDrizzleSupabaseClient } from "@/db";
import { gameRooms, rounds, questions } from "@/db/schema";
import {
  startRoundSchema,
  endRoundSchema,
  pauseRoundSchema,
  resumeRoundSchema,
  type StartRoundInput,
  type EndRoundInput,
  type PauseRoundInput,
  type ResumeRoundInput,
} from "../schemas";
// import { selectQuestionForRound } from "./question.action"; // TODO: Implement question action

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string | Record<string, string[]>;
};

export async function startRound(
  input: StartRoundInput
): Promise<ActionResult<{ roundId: string }>> {
  try {
    // Validate input
    const validatedInput = startRoundSchema.parse(input);
    const { gameRoomId, roundNumber } = validatedInput;

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Verify user is host of the game room
      const gameRoom = await tx
        .select({ hostId: gameRooms.hostId })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);

      if (!gameRoom.length) {
        return { success: false, error: "Game room not found" };
      }

      // Check if round already exists
      const existingRound = await tx
        .select({ id: rounds.id, status: rounds.status })
        .from(rounds)
        .where(
          and(
            eq(rounds.gameRoomId, gameRoomId),
            eq(rounds.roundNumber, roundNumber)
          )
        )
        .limit(1);

      if (
        existingRound.length &&
        (existingRound[0].status === "free_time" ||
          existingRound[0].status === "selection_time")
      ) {
        return { success: false, error: "Round is already active" };
      }

      if (existingRound.length && existingRound[0].status === "completed") {
        return { success: false, error: "Round is already completed" };
      }

      // TODO: Select a question for this round
      // For now, select the first available question as placeholder
      const availableQuestions = await tx.select().from(questions).limit(1);

      if (!availableQuestions.length) {
        return { success: false, error: "No questions available" };
      }

      const selectedQuestion = availableQuestions[0];

      // Create or update the round
      let roundId: string;

      if (existingRound.length) {
        // Update existing round
        roundId = existingRound[0].id;
        await tx
          .update(rounds)
          .set({
            questionId: selectedQuestion.id,
            status: "free_time",
            startedAt: new Date(),
            endedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(rounds.id, roundId));
      } else {
        // Create new round
        const newRound = await tx
          .insert(rounds)
          .values({
            gameRoomId,
            roundNumber,
            questionId: selectedQuestion.id,
            status: "free_time",
            startedAt: new Date(),
          })
          .returning({ id: rounds.id });

        roundId = newRound[0].id;
      }

      return {
        success: true,
        data: { roundId },
      };
    });
  } catch (error) {
    console.error("Error starting round:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start round",
    };
  }
}

export async function endRound(input: EndRoundInput): Promise<ActionResult> {
  try {
    // Validate input
    const validatedInput = endRoundSchema.parse(input);
    const { roundId, gameRoomId } = validatedInput;

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Verify user is host of the game room
      const gameRoom = await tx
        .select({ hostId: gameRooms.hostId })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);

      if (!gameRoom.length) {
        return { success: false, error: "Game room not found" };
      }

      // Verify round exists and is active
      const round = await tx
        .select({ id: rounds.id, status: rounds.status })
        .from(rounds)
        .where(and(eq(rounds.id, roundId), eq(rounds.gameRoomId, gameRoomId)))
        .limit(1);

      if (!round.length) {
        return { success: false, error: "Round not found" };
      }

      if (
        round[0].status !== "free_time" &&
        round[0].status !== "selection_time"
      ) {
        return { success: false, error: "Round is not active" };
      }

      // End the round
      await tx
        .update(rounds)
        .set({
          status: "completed",
          endedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(rounds.id, roundId));

      return { success: true };
    });
  } catch (error) {
    console.error("Error ending round:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to end round",
    };
  }
}

export async function pauseRound(
  input: PauseRoundInput
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedInput = pauseRoundSchema.parse(input);
    const { roundId, gameRoomId } = validatedInput;

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Verify user is host of the game room
      const gameRoom = await tx
        .select({ hostId: gameRooms.hostId })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);

      if (!gameRoom.length) {
        return { success: false, error: "Game room not found" };
      }

      // Verify round exists and is active
      const round = await tx
        .select({ id: rounds.id, status: rounds.status })
        .from(rounds)
        .where(and(eq(rounds.id, roundId), eq(rounds.gameRoomId, gameRoomId)))
        .limit(1);

      if (!round.length) {
        return { success: false, error: "Round not found" };
      }

      if (
        round[0].status !== "free_time" &&
        round[0].status !== "selection_time"
      ) {
        return { success: false, error: "Round is not active" };
      }

      // Note: We don't change the database status for pause/resume
      // This will be handled in the frontend timer logic
      // The round remains "active" but timer is paused

      return { success: true };
    });
  } catch (error) {
    console.error("Error pausing round:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to pause round",
    };
  }
}

export async function resumeRound(
  input: ResumeRoundInput
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedInput = resumeRoundSchema.parse(input);
    const { roundId, gameRoomId } = validatedInput;

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Verify user is host of the game room
      const gameRoom = await tx
        .select({ hostId: gameRooms.hostId })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);

      if (!gameRoom.length) {
        return { success: false, error: "Game room not found" };
      }

      // Verify round exists and is active
      const round = await tx
        .select({ id: rounds.id, status: rounds.status })
        .from(rounds)
        .where(and(eq(rounds.id, roundId), eq(rounds.gameRoomId, gameRoomId)))
        .limit(1);

      if (!round.length) {
        return { success: false, error: "Round not found" };
      }

      if (
        round[0].status !== "free_time" &&
        round[0].status !== "selection_time"
      ) {
        return { success: false, error: "Round is not active" };
      }

      // Note: We don't change the database status for pause/resume
      // This will be handled in the frontend timer logic
      // The round remains "active" and timer is resumed

      return { success: true };
    });
  } catch (error) {
    console.error("Error resuming round:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resume round",
    };
  }
}
