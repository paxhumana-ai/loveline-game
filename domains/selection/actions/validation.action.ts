"use server";

import { eq, and } from "drizzle-orm";
import { createDrizzleSupabaseClient } from "@/db";
import { selections, participants, rounds } from "@/db/schema";

export async function validateSelectionEligibility(
  participantId: string,
  targetParticipantId: string,
  roundId: string
) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Check if selector exists and is in the same game room
      const selector = await tx
        .select({
          id: participants.id,
          gameRoomId: participants.gameRoomId,
        })
        .from(participants)
        .where(eq(participants.id, participantId))
        .limit(1);

      if (selector.length === 0) {
        return {
          success: false,
          error: "참가자를 찾을 수 없습니다",
          eligible: false,
        };
      }

      // Check if target participant exists and is in the same game room
      const target = await tx
        .select({
          id: participants.id,
          gameRoomId: participants.gameRoomId,
        })
        .from(participants)
        .where(eq(participants.id, targetParticipantId))
        .limit(1);

      if (target.length === 0) {
        return {
          success: false,
          error: "선택할 참가자를 찾을 수 없습니다",
          eligible: false,
        };
      }

      // Check if both participants are in the same game room
      if (selector[0].gameRoomId !== target[0].gameRoomId) {
        return {
          success: false,
          error: "같은 게임방 참가자만 선택할 수 있습니다",
          eligible: false,
        };
      }

      // Check if trying to select self
      if (participantId === targetParticipantId) {
        return {
          success: false,
          error: "자기 자신을 선택할 수 없습니다",
          eligible: false,
        };
      }

      // Check if round exists and belongs to the same game room
      const round = await tx
        .select({
          id: rounds.id,
          gameRoomId: rounds.gameRoomId,
          status: rounds.status,
        })
        .from(rounds)
        .where(eq(rounds.id, roundId))
        .limit(1);

      if (round.length === 0) {
        return {
          success: false,
          error: "라운드를 찾을 수 없습니다",
          eligible: false,
        };
      }

      if (round[0].gameRoomId !== selector[0].gameRoomId) {
        return {
          success: false,
          error: "해당 라운드에 참가할 수 없습니다",
          eligible: false,
        };
      }

      // Check if round is active
      if (
        round[0].status !== "selection_time" &&
        round[0].status !== "free_time"
      ) {
        return {
          success: false,
          error: "현재 활성화된 라운드가 아닙니다",
          eligible: false,
        };
      }

      // Check if already made a selection for this round
      const existingSelection = await tx
        .select()
        .from(selections)
        .where(
          and(
            eq(selections.roundId, roundId),
            eq(selections.selectorParticipantId, participantId)
          )
        )
        .limit(1);

      if (existingSelection.length > 0) {
        return {
          success: false,
          error: "이미 선택을 완료했습니다",
          eligible: false,
        };
      }

      return {
        success: true,
        eligible: true,
        message: "선택 가능합니다",
      };
    });
  } catch (error) {
    console.error("Validate selection eligibility error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "선택 자격 검증에 실패했습니다",
      eligible: false,
    };
  }
}

export async function checkSelectionTimeLimit(roundId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      const round = await tx
        .select({
          id: rounds.id,
          status: rounds.status,
          startedAt: rounds.startedAt,
          endedAt: rounds.endedAt,
        })
        .from(rounds)
        .where(eq(rounds.id, roundId))
        .limit(1);

      if (round.length === 0) {
        return {
          success: false,
          error: "라운드를 찾을 수 없습니다",
          withinTimeLimit: false,
        };
      }

      const currentRound = round[0];
      const now = new Date();

      // Check if round is active
      if (
        currentRound.status !== "selection_time" &&
        currentRound.status !== "free_time"
      ) {
        return {
          success: true,
          withinTimeLimit: false,
          message: "라운드가 활성화되지 않았습니다",
        };
      }

      // Check if round has started
      if (!currentRound.startedAt) {
        return {
          success: true,
          withinTimeLimit: false,
          message: "라운드가 아직 시작되지 않았습니다",
        };
      }

      // Check if round has ended
      if (currentRound.endedAt && now > currentRound.endedAt) {
        return {
          success: true,
          withinTimeLimit: false,
          message: "라운드가 종료되었습니다",
        };
      }

      // Calculate remaining time (assuming 5 minutes per round)
      const startTime = new Date(currentRound.startedAt);
      const timeLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
      const elapsedTime = now.getTime() - startTime.getTime();
      const remainingTime = timeLimit - elapsedTime;

      if (remainingTime <= 0) {
        return {
          success: true,
          withinTimeLimit: false,
          message: "선택 시간이 초과되었습니다",
        };
      }

      return {
        success: true,
        withinTimeLimit: true,
        remainingTime: Math.ceil(remainingTime / 1000), // seconds
        message: "선택 시간이 남아있습니다",
      };
    });
  } catch (error) {
    console.error("Check selection time limit error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "시간 제한 확인에 실패했습니다",
      withinTimeLimit: false,
    };
  }
}

export async function validatePassOption(
  participantId: string,
  roundId: string
) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Check if participant exists
      const participant = await tx
        .select({
          id: participants.id,
          gameRoomId: participants.gameRoomId,
        })
        .from(participants)
        .where(eq(participants.id, participantId))
        .limit(1);

      if (participant.length === 0) {
        return {
          success: false,
          error: "참가자를 찾을 수 없습니다",
          canPass: false,
        };
      }

      // Check if round exists and is active
      const round = await tx
        .select({
          id: rounds.id,
          gameRoomId: rounds.gameRoomId,
          status: rounds.status,
        })
        .from(rounds)
        .where(eq(rounds.id, roundId))
        .limit(1);

      if (round.length === 0) {
        return {
          success: false,
          error: "라운드를 찾을 수 없습니다",
          canPass: false,
        };
      }

      if (
        round[0].status !== "selection_time" &&
        round[0].status !== "free_time"
      ) {
        return {
          success: false,
          error: "활성화된 라운드가 아닙니다",
          canPass: false,
        };
      }

      // Check if participant is in the same game room as the round
      if (participant[0].gameRoomId !== round[0].gameRoomId) {
        return {
          success: false,
          error: "해당 라운드에 참가할 수 없습니다",
          canPass: false,
        };
      }

      // Check if already made a selection for this round
      const existingSelection = await tx
        .select()
        .from(selections)
        .where(
          and(
            eq(selections.roundId, roundId),
            eq(selections.selectorParticipantId, participantId)
          )
        )
        .limit(1);

      if (existingSelection.length > 0) {
        return {
          success: false,
          error: "이미 선택을 완료했습니다",
          canPass: false,
        };
      }

      return {
        success: true,
        canPass: true,
        message: "패스할 수 있습니다",
      };
    });
  } catch (error) {
    console.error("Validate pass option error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "패스 옵션 검증에 실패했습니다",
      canPass: false,
    };
  }
}
