"use server";

import { createDrizzleSupabaseClient } from "@/db";
import { rounds, questions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getRoundWithTimer(
  gameRoomId: string,
  roundNumber: number
) {
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

    const roundData = round[0];

    // Get question data if available
    let questionData = null;
    if (roundData.questionId) {
      const question = await db.rls((tx) =>
        tx
          .select({
            id: questions.id,
            content: questions.content,
            category: questions.category,
            difficulty: questions.difficulty,
          })
          .from(questions)
          .where(eq(questions.id, roundData.questionId))
      );

      if (question.length > 0) {
        questionData = question[0];
      }
    }

    // Calculate timer information
    const now = new Date();
    let remainingTime = 0;
    let totalTime = 0;
    const phase = roundData.status;

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
        round: roundData,
        question: questionData,
        timer: {
          phase,
          remainingTime,
          totalTime,
          currentTime: now.toISOString(),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching round with timer:", error);
    return {
      success: false,
      error: "Failed to fetch round data",
      data: null,
    };
  }
}

export async function checkRoundProgress(
  gameRoomId: string,
  lastUpdate: string
) {
  try {
    const db = await createDrizzleSupabaseClient();

    const roundsList = await db.rls((tx) =>
      tx
        .select({
          id: rounds.id,
          roundNumber: rounds.roundNumber,
          status: rounds.status,
          updatedAt: rounds.updatedAt,
          freeTimeStartedAt: rounds.freeTimeStartedAt,
          selectionTimeStartedAt: rounds.selectionTimeStartedAt,
          endedAt: rounds.endedAt,
        })
        .from(rounds)
        .where(eq(rounds.gameRoomId, gameRoomId))
    );

    const lastUpdateDate = new Date(lastUpdate);

    // Check if any round has been updated since last poll
    const hasRoundChanges = roundsList.some(
      (round) => new Date(round.updatedAt) > lastUpdateDate
    );

    // Get current active round
    const activeRound = roundsList.find(
      (round) =>
        round.status === "free_time" || round.status === "selection_time"
    );

    // Calculate progress information
    let progress = null;
    if (activeRound) {
      const now = new Date();
      let remainingTime = 0;
      let totalTime = 0;

      if (activeRound.status === "free_time" && activeRound.freeTimeStartedAt) {
        totalTime = 3 * 60 * 1000; // 3 minutes
        const elapsed =
          now.getTime() - new Date(activeRound.freeTimeStartedAt).getTime();
        remainingTime = Math.max(0, totalTime - elapsed);
      } else if (
        activeRound.status === "selection_time" &&
        activeRound.selectionTimeStartedAt
      ) {
        totalTime = 1 * 60 * 1000; // 1 minute
        const elapsed =
          now.getTime() -
          new Date(activeRound.selectionTimeStartedAt).getTime();
        remainingTime = Math.max(0, totalTime - elapsed);
      }

      progress = {
        roundId: activeRound.id,
        roundNumber: activeRound.roundNumber,
        status: activeRound.status,
        remainingTime,
        totalTime,
      };
    }

    // Count rounds by status
    const statusCount = roundsList.reduce((acc, round) => {
      acc[round.status] = (acc[round.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      error: null,
      data: {
        hasChanges: hasRoundChanges,
        lastChecked: new Date().toISOString(),
        totalRounds: roundsList.length,
        statusCount,
        currentProgress: progress,
        changeDetails: {
          rounds: hasRoundChanges,
        },
      },
    };
  } catch (error) {
    console.error("Error checking round progress:", error);
    return {
      success: false,
      error: "Failed to check round progress",
      data: null,
    };
  }
}
