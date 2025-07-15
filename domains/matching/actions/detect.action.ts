"use server";

import { eq, and, sql } from "drizzle-orm";
import { createDrizzleSupabaseClient } from "@/db";
import { selections, matches, participants, rounds } from "@/db/schema";
import { matchDetectionInputSchema } from "../schemas";
import type { MatchDetectionInput } from "../schemas";

export async function detectMatches(data: MatchDetectionInput) {
  try {
    const validatedData = matchDetectionInputSchema.parse(data);
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // First verify that the round exists and belongs to the game room
      const round = await tx
        .select({
          id: rounds.id,
          gameRoomId: rounds.gameRoomId,
          roundNumber: rounds.roundNumber,
        })
        .from(rounds)
        .where(
          and(
            eq(rounds.id, validatedData.roundId),
            eq(rounds.gameRoomId, validatedData.gameRoomId)
          )
        )
        .limit(1);

      if (round.length === 0) {
        return { success: false, error: "라운드를 찾을 수 없습니다" };
      }

      // Get all selections for this round (excluding passed selections)
      const roundSelections = await tx
        .select({
          id: selections.id,
          selectorId: selections.selectorParticipantId,
          selectedId: selections.selectedParticipantId,
          message: selections.message,
        })
        .from(selections)
        .where(
          and(
            eq(selections.roundId, validatedData.roundId),
            eq(selections.isPassed, false),
            sql`${selections.selectedParticipantId} IS NOT NULL`
          )
        );

      if (roundSelections.length === 0) {
        return { 
          success: true, 
          data: { 
            matches: [], 
            message: "이번 라운드에는 선택이 없어서 매칭이 생성되지 않았습니다" 
          } 
        };
      }

      // Create a map of selections: participantId -> selectedParticipantId
      const selectionMap = new Map<string, string>();
      roundSelections.forEach(selection => {
        if (selection.selectedId) {
          selectionMap.set(selection.selectorId, selection.selectedId);
        }
      });

      // Find mutual selections (matches)
      const mutualMatches: Array<{participant1Id: string, participant2Id: string}> = [];
      const processedPairs = new Set<string>();

      for (const [selectorId, selectedId] of selectionMap.entries()) {
        // Check if the selected participant also selected the selector
        const reverseSelection = selectionMap.get(selectedId);
        
        if (reverseSelection === selectorId) {
          // Create a sorted pair key to avoid duplicates
          const pairKey = [selectorId, selectedId].sort().join('-');
          
          if (!processedPairs.has(pairKey)) {
            mutualMatches.push({
              participant1Id: selectorId,
              participant2Id: selectedId,
            });
            processedPairs.add(pairKey);
          }
        }
      }

      // Insert matches into the database
      const createdMatches = [];
      for (const match of mutualMatches) {
        const newMatch = await tx
          .insert(matches)
          .values({
            gameRoomId: validatedData.gameRoomId,
            participant1Id: match.participant1Id,
            participant2Id: match.participant2Id,
          })
          .returning();
        
        if (newMatch.length > 0) {
          createdMatches.push(newMatch[0]);
        }
      }

      // Get participant details for the matches
      const matchesWithDetails = [];
      for (const match of createdMatches) {
        const participant1 = await tx
          .select({
            id: participants.id,
            nickname: participants.nickname,
            character: participants.character,
          })
          .from(participants)
          .where(eq(participants.id, match.participant1Id))
          .limit(1);

        const participant2 = await tx
          .select({
            id: participants.id,
            nickname: participants.nickname,
            character: participants.character,
          })
          .from(participants)
          .where(eq(participants.id, match.participant2Id))
          .limit(1);

        if (participant1.length > 0 && participant2.length > 0) {
          matchesWithDetails.push({
            id: match.id,
            gameRoomId: match.gameRoomId,
            participant1: participant1[0],
            participant2: participant2[0],
            createdAt: match.createdAt,
          });
        }
      }

      return { 
        success: true, 
        data: { 
          matches: matchesWithDetails,
          totalMatches: createdMatches.length,
          roundNumber: round[0].roundNumber,
          message: createdMatches.length > 0 
            ? `${createdMatches.length}개의 매칭이 생성되었습니다!` 
            : "이번 라운드에는 매칭이 없었습니다"
        } 
      };
    });
  } catch (error) {
    console.error("Detect matches error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "매칭 감지에 실패했습니다" 
    };
  }
}

export async function createMatches(gameRoomId: string, matchPairs: Array<{participant1Id: string, participant2Id: string}>) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      const createdMatches = [];

      for (const pair of matchPairs) {
        // Check if match already exists
        const existingMatch = await tx
          .select()
          .from(matches)
          .where(
            and(
              eq(matches.gameRoomId, gameRoomId),
              sql`(
                (${matches.participant1Id} = ${pair.participant1Id} AND ${matches.participant2Id} = ${pair.participant2Id}) OR
                (${matches.participant1Id} = ${pair.participant2Id} AND ${matches.participant2Id} = ${pair.participant1Id})
              )`
            )
          )
          .limit(1);

        if (existingMatch.length === 0) {
          const newMatch = await tx
            .insert(matches)
            .values({
              gameRoomId,
              participant1Id: pair.participant1Id,
              participant2Id: pair.participant2Id,
            })
            .returning();

          if (newMatch.length > 0) {
            createdMatches.push(newMatch[0]);
          }
        }
      }

      return { 
        success: true, 
        data: createdMatches,
        message: `${createdMatches.length}개의 새로운 매칭이 생성되었습니다`
      };
    });
  } catch (error) {
    console.error("Create matches error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "매칭 생성에 실패했습니다" 
    };
  }
}

export async function validateMatchDetection(roundId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Check if round exists and is completed
      const round = await tx
        .select({
          id: rounds.id,
          gameRoomId: rounds.gameRoomId,
          status: rounds.status,
          roundNumber: rounds.roundNumber,
        })
        .from(rounds)
        .where(eq(rounds.id, roundId))
        .limit(1);

      if (round.length === 0) {
        return { 
          success: false, 
          error: "라운드를 찾을 수 없습니다",
          canDetect: false 
        };
      }

      // Check if all participants have made their selections
      const gameRoomId = round[0].gameRoomId;
      
      const totalParticipants = await tx
        .select({ count: sql<number>`count(*)` })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoomId));

      const totalSelections = await tx
        .select({ count: sql<number>`count(*)` })
        .from(selections)
        .where(eq(selections.roundId, roundId));

      const participantCount = totalParticipants[0]?.count || 0;
      const selectionCount = totalSelections[0]?.count || 0;

      if (selectionCount < participantCount) {
        return { 
          success: true, 
          canDetect: false,
          message: `아직 모든 참가자가 선택을 완료하지 않았습니다 (${selectionCount}/${participantCount})` 
        };
      }

      // Check if matches have already been detected for this round
      const existingMatches = await tx
        .select({ count: sql<number>`count(*)` })
        .from(matches)
        .leftJoin(selections, 
          sql`${matches.participant1Id} = ${selections.selectorParticipantId} OR ${matches.participant2Id} = ${selections.selectorParticipantId}`
        )
        .where(eq(selections.roundId, roundId));

      const matchCount = existingMatches[0]?.count || 0;

      return { 
        success: true, 
        canDetect: true,
        alreadyDetected: matchCount > 0,
        participantCount,
        selectionCount,
        message: matchCount > 0 
          ? "이미 매칭이 감지되었습니다" 
          : "매칭 감지를 시작할 수 있습니다" 
      };
    });
  } catch (error) {
    console.error("Validate match detection error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "매칭 감지 검증에 실패했습니다",
      canDetect: false 
    };
  }
}