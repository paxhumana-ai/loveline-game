"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { rounds, gameRooms } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getRoundStatus(gameRoomId: string, roundNumber: number) {
  try {
    const db = await createDrizzleSupabaseClient();

    const round = await db.rls((tx) =>
      tx
        .select({
          id: rounds.id,
          gameRoomId: rounds.gameRoomId,
          roundNumber: rounds.roundNumber,
          questionId: rounds.questionId,
          status: rounds.status,
          startedAt: rounds.startedAt,
          endedAt: rounds.endedAt,
          freeTimeStartedAt: rounds.freeTimeStartedAt,
          selectionTimeStartedAt: rounds.selectionTimeStartedAt,
          createdAt: rounds.createdAt,
          updatedAt: rounds.updatedAt,
        })
        .from(rounds)
        .where(
          and(
            eq(rounds.gameRoomId, gameRoomId),
            eq(rounds.roundNumber, roundNumber)
          )
        )
    );

    if (round.length === 0) {
      return {
        success: false,
        error: "Round not found",
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: round[0],
    };
  } catch (error) {
    console.error("Error fetching round status:", error);
    return {
      success: false,
      error: "Failed to fetch round status",
      data: null,
    };
  }
}

export async function updateRoundStatus(
  roundId: string,
  status: "waiting" | "free_time" | "selection_time" | "completed"
) {
  try {
    const db = await createDrizzleSupabaseClient();

    const updatedRound = await db.rls((tx) =>
      tx
        .update(rounds)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(rounds.id, roundId))
        .returning({
          id: rounds.id,
          status: rounds.status,
          updatedAt: rounds.updatedAt,
        })
    );

    if (updatedRound.length === 0) {
      return {
        success: false,
        error: "Round not found or no permission to update",
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: updatedRound[0],
    };
  } catch (error) {
    console.error("Error updating round status:", error);
    return {
      success: false,
      error: "Failed to update round status",
      data: null,
    };
  }
}

export async function getCurrentRound(gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    // Get the current round from game room
    const gameRoom = await db.rls((tx) =>
      tx
        .select({
          id: gameRooms.id,
          totalRounds: gameRooms.totalRounds,
          status: gameRooms.status,
        })
        .from(gameRooms)
        .where(eq(gameRooms.id, gameRoomId))
    );

    if (gameRoom.length === 0) {
      return {
        success: false,
        error: "Game room not found",
        data: null,
      };
    }

    // Get the latest round for this game room
    const latestRound = await db.rls((tx) =>
      tx
        .select({
          id: rounds.id,
          gameRoomId: rounds.gameRoomId,
          roundNumber: rounds.roundNumber,
          questionId: rounds.questionId,
          status: rounds.status,
          startedAt: rounds.startedAt,
          endedAt: rounds.endedAt,
          freeTimeStartedAt: rounds.freeTimeStartedAt,
          selectionTimeStartedAt: rounds.selectionTimeStartedAt,
          createdAt: rounds.createdAt,
          updatedAt: rounds.updatedAt,
        })
        .from(rounds)
        .where(eq(rounds.gameRoomId, gameRoomId))
        .orderBy(rounds.roundNumber)
        .limit(1)
    );

    return {
      success: true,
      error: null,
      data: {
        gameRoom: gameRoom[0],
        currentRound: latestRound.length > 0 ? latestRound[0] : null,
      },
    };
  } catch (error) {
    console.error("Error fetching current round:", error);
    return {
      success: false,
      error: "Failed to fetch current round",
      data: null,
    };
  }
}
