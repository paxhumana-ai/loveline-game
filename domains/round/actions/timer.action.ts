"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { rounds } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function startFreeTime(roundId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const updatedRound = await db.rls((tx) =>
      tx
        .update(rounds)
        .set({
          status: "free_time",
          freeTimeStartedAt: new Date(),
          startedAt: new Date(), // Mark round as started
          updatedAt: new Date(),
        })
        .where(eq(rounds.id, roundId))
        .returning({
          id: rounds.id,
          status: rounds.status,
          freeTimeStartedAt: rounds.freeTimeStartedAt,
          startedAt: rounds.startedAt,
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
    console.error("Error starting free time:", error);
    return {
      success: false,
      error: "Failed to start free time",
      data: null,
    };
  }
}

export async function startSelectionTime(roundId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const updatedRound = await db.rls((tx) =>
      tx
        .update(rounds)
        .set({
          status: "selection_time",
          selectionTimeStartedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(rounds.id, roundId))
        .returning({
          id: rounds.id,
          status: rounds.status,
          selectionTimeStartedAt: rounds.selectionTimeStartedAt,
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
    console.error("Error starting selection time:", error);
    return {
      success: false,
      error: "Failed to start selection time",
      data: null,
    };
  }
}

export async function endRound(roundId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const updatedRound = await db.rls((tx) =>
      tx
        .update(rounds)
        .set({
          status: "completed",
          endedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(rounds.id, roundId))
        .returning({
          id: rounds.id,
          status: rounds.status,
          endedAt: rounds.endedAt,
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
    console.error("Error ending round:", error);
    return {
      success: false,
      error: "Failed to end round",
      data: null,
    };
  }
}

export async function getRoundTimer(roundId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    const round = await db.rls((tx) =>
      tx
        .select({
          id: rounds.id,
          status: rounds.status,
          startedAt: rounds.startedAt,
          freeTimeStartedAt: rounds.freeTimeStartedAt,
          selectionTimeStartedAt: rounds.selectionTimeStartedAt,
          endedAt: rounds.endedAt,
        })
        .from(rounds)
        .where(eq(rounds.id, roundId))
    );

    if (round.length === 0) {
      return {
        success: false,
        error: "Round not found",
        data: null,
      };
    }

    const roundData = round[0];
    const now = new Date();

    // Calculate remaining time based on current status
    let remainingTime = 0;
    let totalTime = 0;

    if (roundData.status === "free_time" && roundData.freeTimeStartedAt) {
      totalTime = 3 * 60 * 1000; // 3 minutes in milliseconds
      const elapsed =
        now.getTime() - new Date(roundData.freeTimeStartedAt).getTime();
      remainingTime = Math.max(0, totalTime - elapsed);
    } else if (
      roundData.status === "selection_time" &&
      roundData.selectionTimeStartedAt
    ) {
      totalTime = 1 * 60 * 1000; // 1 minute in milliseconds
      const elapsed =
        now.getTime() - new Date(roundData.selectionTimeStartedAt).getTime();
      remainingTime = Math.max(0, totalTime - elapsed);
    }

    return {
      success: true,
      error: null,
      data: {
        ...roundData,
        remainingTime,
        totalTime,
        currentTime: now.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error fetching round timer:", error);
    return {
      success: false,
      error: "Failed to fetch round timer",
      data: null,
    };
  }
}
