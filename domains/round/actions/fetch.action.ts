"use server";

import { eq, and, desc, asc } from "drizzle-orm";
import { createDrizzleSupabaseClient } from "@/db";
import { gameRooms, rounds, questions, participants } from "@/db/schema";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string | Record<string, string[]>;
};

export type RoundInfo = {
  id: string;
  gameRoomId: string;
  roundNumber: number;
  status: "pending" | "active" | "completed";
  startedAt: Date | null;
  endedAt: Date | null;
  question: {
    id: string;
    content: string;
    category: string;
    difficulty: number;
  };
};

export type RoundStatus = {
  currentRound: RoundInfo | null;
  totalRounds: number;
  completedRounds: number;
  gameStatus: "waiting" | "in_progress" | "completed" | "cancelled";
  canStartNextRound: boolean;
};

export async function getCurrentRound(
  gameRoomId: string
): Promise<ActionResult<RoundInfo | null>> {
  try {
    if (!gameRoomId) {
      return { success: false, error: "Game room ID is required" };
    }

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Verify access to game room
      const gameRoom = await tx
        .select({ id: gameRooms.id })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);

      if (!gameRoom.length) {
        return { success: false, error: "Game room not found" };
      }

      // Get current active round
      const currentRound = await tx
        .select({
          id: rounds.id,
          gameRoomId: rounds.gameRoomId,
          roundNumber: rounds.roundNumber,
          status: rounds.status,
          startedAt: rounds.startedAt,
          endedAt: rounds.endedAt,
          questionId: rounds.questionId,
          questionContent: questions.content,
          questionCategory: questions.category,
          questionDifficulty: questions.difficulty,
        })
        .from(rounds)
        .innerJoin(questions, eq(rounds.questionId, questions.id))
        .where(
          and(eq(rounds.gameRoomId, gameRoomId), eq(rounds.status, "active"))
        )
        .orderBy(desc(rounds.roundNumber))
        .limit(1);

      if (!currentRound.length) {
        return { success: true, data: null };
      }

      const round = currentRound[0];
      const roundInfo: RoundInfo = {
        id: round.id,
        gameRoomId: round.gameRoomId,
        roundNumber: round.roundNumber,
        status: round.status,
        startedAt: round.startedAt,
        endedAt: round.endedAt,
        question: {
          id: round.questionId,
          content: round.questionContent,
          category: round.questionCategory,
          difficulty: round.questionDifficulty,
        },
      };

      return { success: true, data: roundInfo };
    });
  } catch (error) {
    console.error("Error getting current round:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get current round",
    };
  }
}

export async function getRoundHistory(
  gameRoomId: string
): Promise<ActionResult<RoundInfo[]>> {
  try {
    if (!gameRoomId) {
      return { success: false, error: "Game room ID is required" };
    }

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Verify access to game room
      const gameRoom = await tx
        .select({ id: gameRooms.id })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);

      if (!gameRoom.length) {
        return { success: false, error: "Game room not found" };
      }

      // Get all rounds for this game room
      const roundHistory = await tx
        .select({
          id: rounds.id,
          gameRoomId: rounds.gameRoomId,
          roundNumber: rounds.roundNumber,
          status: rounds.status,
          startedAt: rounds.startedAt,
          endedAt: rounds.endedAt,
          questionId: rounds.questionId,
          questionContent: questions.content,
          questionCategory: questions.category,
          questionDifficulty: questions.difficulty,
        })
        .from(rounds)
        .innerJoin(questions, eq(rounds.questionId, questions.id))
        .where(eq(rounds.gameRoomId, gameRoomId))
        .orderBy(asc(rounds.roundNumber));

      const rounds_data: RoundInfo[] = roundHistory.map((round) => ({
        id: round.id,
        gameRoomId: round.gameRoomId,
        roundNumber: round.roundNumber,
        status: round.status,
        startedAt: round.startedAt,
        endedAt: round.endedAt,
        question: {
          id: round.questionId,
          content: round.questionContent,
          category: round.questionCategory,
          difficulty: round.questionDifficulty,
        },
      }));

      return { success: true, data: rounds_data };
    });
  } catch (error) {
    console.error("Error getting round history:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get round history",
    };
  }
}

export async function getRoundStatus(
  gameRoomId: string
): Promise<ActionResult<RoundStatus>> {
  try {
    if (!gameRoomId) {
      return { success: false, error: "Game room ID is required" };
    }

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get game room info
      const gameRoom = await tx
        .select({
          id: gameRooms.id,
          totalRounds: gameRooms.totalRounds,
          status: gameRooms.status,
        })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
        .limit(1);

      if (!gameRoom.length) {
        return { success: false, error: "Game room not found" };
      }

      const room = gameRoom[0];

      // Get current round
      const currentRoundResult = await getCurrentRound(gameRoomId);
      const currentRound = currentRoundResult.success
        ? currentRoundResult.data ?? null
        : null;

      // Get round statistics
      const roundStats = await tx
        .select({
          total: rounds.id,
          status: rounds.status,
        })
        .from(rounds)
        .where(eq(rounds.gameRoomId, gameRoomId));

      const completedRounds = roundStats.filter(
        (r) => r.status === "completed"
      ).length;
      const totalRounds = room.totalRounds;

      // Determine if next round can be started
      const canStartNextRound =
        room.status === "in_progress" &&
        !currentRound &&
        completedRounds < totalRounds;

      const roundStatus: RoundStatus = {
        currentRound,
        totalRounds,
        completedRounds,
        gameStatus: room.status,
        canStartNextRound,
      };

      return { success: true, data: roundStatus };
    });
  } catch (error) {
    console.error("Error getting round status:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get round status",
    };
  }
}

export async function getRoundById(
  roundId: string
): Promise<ActionResult<RoundInfo | null>> {
  try {
    if (!roundId) {
      return { success: false, error: "Round ID is required" };
    }

    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get specific round
      const roundData = await tx
        .select({
          id: rounds.id,
          gameRoomId: rounds.gameRoomId,
          roundNumber: rounds.roundNumber,
          status: rounds.status,
          startedAt: rounds.startedAt,
          endedAt: rounds.endedAt,
          questionId: rounds.questionId,
          questionContent: questions.content,
          questionCategory: questions.category,
          questionDifficulty: questions.difficulty,
        })
        .from(rounds)
        .innerJoin(questions, eq(rounds.questionId, questions.id))
        .where(eq(rounds.id, roundId))
        .limit(1);

      if (!roundData.length) {
        return { success: true, data: null };
      }

      const round = roundData[0];
      const roundInfo: RoundInfo = {
        id: round.id,
        gameRoomId: round.gameRoomId,
        roundNumber: round.roundNumber,
        status: round.status,
        startedAt: round.startedAt,
        endedAt: round.endedAt,
        question: {
          id: round.questionId,
          content: round.questionContent,
          category: round.questionCategory,
          difficulty: round.questionDifficulty,
        },
      };

      return { success: true, data: roundInfo };
    });
  } catch (error) {
    console.error("Error getting round by ID:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get round",
    };
  }
}
