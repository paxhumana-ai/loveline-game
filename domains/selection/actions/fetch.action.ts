"use server";

import { eq, and } from "drizzle-orm";
import { createDrizzleSupabaseClient } from "@/db";
import { selections, participants, rounds, gameRooms } from "@/db/schema";

export async function getSelectionsByRound(roundId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      const roundSelections = await tx
        .select({
          id: selections.id,
          selectorId: selections.selectorParticipantId,
          selectedId: selections.selectedParticipantId,
          message: selections.message,
          isPassed: selections.isPassed,
          createdAt: selections.createdAt,
          selectorNickname: participants.nickname,
          selectorCharacter: participants.character,
        })
        .from(selections)
        .leftJoin(participants, eq(selections.selectorParticipantId, participants.id))
        .where(eq(selections.roundId, roundId))
        .orderBy(selections.createdAt);

      return { success: true, data: roundSelections };
    });
  } catch (error) {
    console.error("Get selections by round error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "라운드 선택 조회에 실패했습니다" 
    };
  }
}

export async function getParticipantSelections(participantId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      const participantSelections = await tx
        .select({
          id: selections.id,
          roundId: selections.roundId,
          selectedId: selections.selectedParticipantId,
          message: selections.message,
          isPassed: selections.isPassed,
          createdAt: selections.createdAt,
          roundNumber: rounds.roundNumber,
        })
        .from(selections)
        .leftJoin(rounds, eq(selections.roundId, rounds.id))
        .where(eq(selections.selectorParticipantId, participantId))
        .orderBy(rounds.roundNumber);

      return { success: true, data: participantSelections };
    });
  } catch (error) {
    console.error("Get participant selections error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "참가자 선택 이력 조회에 실패했습니다" 
    };
  }
}

export async function getSelectionStatus(roundId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // First get all participants in the game room for this round
      const roundInfo = await tx
        .select({
          gameRoomId: rounds.gameRoomId,
        })
        .from(rounds)
        .where(eq(rounds.id, roundId))
        .limit(1);

      if (roundInfo.length === 0) {
        return { success: false, error: "라운드를 찾을 수 없습니다" };
      }

      // Get all participants in the game room
      const allParticipants = await tx
        .select({
          id: participants.id,
          nickname: participants.nickname,
          character: participants.character,
        })
        .from(participants)
        .where(eq(participants.gameRoomId, roundInfo[0].gameRoomId));

      // Get selections for this round
      const roundSelections = await tx
        .select({
          selectorId: selections.selectorParticipantId,
          isPassed: selections.isPassed,
        })
        .from(selections)
        .where(eq(selections.roundId, roundId));

      // Create selection status map
      const selectionMap = new Map(
        roundSelections.map(s => [s.selectorId, s.isPassed ? "passed" : "selected"])
      );

      // Build status summary
      const participantStatuses = allParticipants.map(p => ({
        participantId: p.id,
        nickname: p.nickname,
        character: p.character,
        hasSelected: selectionMap.has(p.id),
        selectionStatus: selectionMap.get(p.id) || "not_selected",
      }));

      const totalParticipants = allParticipants.length;
      const completedSelections = roundSelections.length;
      const progressPercentage = totalParticipants > 0 
        ? Math.round((completedSelections / totalParticipants) * 100) 
        : 0;

      return { 
        success: true, 
        data: {
          participants: participantStatuses,
          summary: {
            totalParticipants,
            completedSelections,
            remainingSelections: totalParticipants - completedSelections,
            progressPercentage,
            allCompleted: completedSelections === totalParticipants,
          }
        }
      };
    });
  } catch (error) {
    console.error("Get selection status error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "선택 상태 조회에 실패했습니다" 
    };
  }
}

export async function getCurrentParticipantSelection(roundId: string, participantId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      const currentSelection = await tx
        .select({
          id: selections.id,
          selectedParticipantId: selections.selectedParticipantId,
          message: selections.message,
          isPassed: selections.isPassed,
          createdAt: selections.createdAt,
        })
        .from(selections)
        .where(
          and(
            eq(selections.roundId, roundId),
            eq(selections.selectorParticipantId, participantId)
          )
        )
        .limit(1);

      return { 
        success: true, 
        data: currentSelection.length > 0 ? currentSelection[0] : null 
      };
    });
  } catch (error) {
    console.error("Get current participant selection error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "현재 선택 조회에 실패했습니다" 
    };
  }
}