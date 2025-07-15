"use server";

import { eq, and, sql } from "drizzle-orm";
import { createDrizzleSupabaseClient } from "@/db";
import { matches, participants, rounds, selections } from "@/db/schema";

export async function getMatchesByRound(roundId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // First get the round to find the game room
      const round = await tx
        .select({
          id: rounds.id,
          gameRoomId: rounds.gameRoomId,
          roundNumber: rounds.roundNumber,
        })
        .from(rounds)
        .where(eq(rounds.id, roundId))
        .limit(1);

      if (round.length === 0) {
        return { success: false, error: "라운드를 찾을 수 없습니다" };
      }

      // Get all participants who made selections in this round
      const roundSelections = await tx
        .select({
          selectorId: selections.selectorParticipantId,
          selectedId: selections.selectedParticipantId,
        })
        .from(selections)
        .where(
          and(
            eq(selections.roundId, roundId),
            eq(selections.isPassed, false),
            sql`${selections.selectedParticipantId} IS NOT NULL`
          )
        );

      // Get matches that involve participants from this round
      const participantIds = Array.from(new Set([
        ...roundSelections.map(s => s.selectorId),
        ...roundSelections.map(s => s.selectedId).filter(Boolean) as string[]
      ]));

      if (participantIds.length === 0) {
        return { 
          success: true, 
          data: { 
            matches: [],
            roundNumber: round[0].roundNumber,
            message: "이번 라운드에는 매칭이 없습니다"
          } 
        };
      }

      // Find matches involving these participants
      const roundMatches = await tx
        .select({
          id: matches.id,
          gameRoomId: matches.gameRoomId,
          participant1Id: matches.participant1Id,
          participant2Id: matches.participant2Id,
          createdAt: matches.createdAt,
        })
        .from(matches)
        .where(
          and(
            eq(matches.gameRoomId, round[0].gameRoomId),
            sql`(${matches.participant1Id} = ANY(${participantIds}) OR ${matches.participant2Id} = ANY(${participantIds}))`
          )
        );

      // Get participant details for each match
      const matchesWithDetails = [];
      for (const match of roundMatches) {
        const participant1 = await tx
          .select({
            id: participants.id,
            nickname: participants.nickname,
            character: participants.character,
            gender: participants.gender,
          })
          .from(participants)
          .where(eq(participants.id, match.participant1Id))
          .limit(1);

        const participant2 = await tx
          .select({
            id: participants.id,
            nickname: participants.nickname,
            character: participants.character,
            gender: participants.gender,
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
          roundNumber: round[0].roundNumber,
          totalMatches: matchesWithDetails.length,
          message: matchesWithDetails.length > 0 
            ? `${matchesWithDetails.length}개의 매칭이 발견되었습니다!` 
            : "이번 라운드에는 매칭이 없습니다"
        }
      };
    });
  } catch (error) {
    console.error("Get matches by round error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "라운드 매칭 조회에 실패했습니다" 
    };
  }
}

export async function getMatchHistory(gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get all matches for the game room
      const allMatches = await tx
        .select({
          id: matches.id,
          gameRoomId: matches.gameRoomId,
          participant1Id: matches.participant1Id,
          participant2Id: matches.participant2Id,
          createdAt: matches.createdAt,
        })
        .from(matches)
        .where(eq(matches.gameRoomId, gameRoomId))
        .orderBy(matches.createdAt);

      // Get participant details for all matches
      const matchHistory = [];
      for (const match of allMatches) {
        const participant1 = await tx
          .select({
            id: participants.id,
            nickname: participants.nickname,
            character: participants.character,
            gender: participants.gender,
          })
          .from(participants)
          .where(eq(participants.id, match.participant1Id))
          .limit(1);

        const participant2 = await tx
          .select({
            id: participants.id,
            nickname: participants.nickname,
            character: participants.character,
            gender: participants.gender,
          })
          .from(participants)
          .where(eq(participants.id, match.participant2Id))
          .limit(1);

        if (participant1.length > 0 && participant2.length > 0) {
          matchHistory.push({
            id: match.id,
            gameRoomId: match.gameRoomId,
            participant1: participant1[0],
            participant2: participant2[0],
            createdAt: match.createdAt,
          });
        }
      }

      // Group matches by date for better organization
      const matchesByDate = matchHistory.reduce((acc, match) => {
        const date = match.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(match);
        return acc;
      }, {} as Record<string, typeof matchHistory>);

      return { 
        success: true, 
        data: {
          allMatches: matchHistory,
          matchesByDate,
          totalMatches: matchHistory.length,
          summary: {
            totalMatches: matchHistory.length,
            uniqueParticipants: new Set([
              ...matchHistory.map(m => m.participant1.id),
              ...matchHistory.map(m => m.participant2.id)
            ]).size,
          }
        }
      };
    });
  } catch (error) {
    console.error("Get match history error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "매칭 이력 조회에 실패했습니다" 
    };
  }
}

export async function getParticipantMatches(participantId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get all matches for this participant
      const participantMatches = await tx
        .select({
          id: matches.id,
          gameRoomId: matches.gameRoomId,
          participant1Id: matches.participant1Id,
          participant2Id: matches.participant2Id,
          createdAt: matches.createdAt,
        })
        .from(matches)
        .where(
          sql`${matches.participant1Id} = ${participantId} OR ${matches.participant2Id} = ${participantId}`
        )
        .orderBy(matches.createdAt);

      // Get details for each match
      const matchesWithDetails = [];
      for (const match of participantMatches) {
        // Determine which participant is the "other" one
        const otherParticipantId = match.participant1Id === participantId 
          ? match.participant2Id 
          : match.participant1Id;

        const otherParticipant = await tx
          .select({
            id: participants.id,
            nickname: participants.nickname,
            character: participants.character,
            gender: participants.gender,
          })
          .from(participants)
          .where(eq(participants.id, otherParticipantId))
          .limit(1);

        if (otherParticipant.length > 0) {
          matchesWithDetails.push({
            id: match.id,
            gameRoomId: match.gameRoomId,
            matchedWith: otherParticipant[0],
            createdAt: match.createdAt,
          });
        }
      }

      return { 
        success: true, 
        data: {
          matches: matchesWithDetails,
          totalMatches: matchesWithDetails.length,
          message: matchesWithDetails.length > 0 
            ? `${matchesWithDetails.length}번의 매칭이 있었습니다` 
            : "아직 매칭된 적이 없습니다"
        }
      };
    });
  } catch (error) {
    console.error("Get participant matches error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "참가자 매칭 조회에 실패했습니다" 
    };
  }
}

export async function getMatchDetails(matchId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get match details
      const match = await tx
        .select({
          id: matches.id,
          gameRoomId: matches.gameRoomId,
          participant1Id: matches.participant1Id,
          participant2Id: matches.participant2Id,
          createdAt: matches.createdAt,
        })
        .from(matches)
        .where(eq(matches.id, matchId))
        .limit(1);

      if (match.length === 0) {
        return { success: false, error: "매칭을 찾을 수 없습니다" };
      }

      const matchData = match[0];

      // Get participant details
      const participant1 = await tx
        .select({
          id: participants.id,
          nickname: participants.nickname,
          character: participants.character,
          gender: participants.gender,
          mbti: participants.mbti,
        })
        .from(participants)
        .where(eq(participants.id, matchData.participant1Id))
        .limit(1);

      const participant2 = await tx
        .select({
          id: participants.id,
          nickname: participants.nickname,
          character: participants.character,
          gender: participants.gender,
          mbti: participants.mbti,
        })
        .from(participants)
        .where(eq(participants.id, matchData.participant2Id))
        .limit(1);

      if (participant1.length === 0 || participant2.length === 0) {
        return { success: false, error: "참가자 정보를 찾을 수 없습니다" };
      }

      // Get the selection messages if they exist (find the selections that led to this match)
      const selections1to2 = await tx
        .select({ message: selections.message })
        .from(selections)
        .where(
          and(
            eq(selections.selectorParticipantId, matchData.participant1Id),
            eq(selections.selectedParticipantId, matchData.participant2Id)
          )
        )
        .limit(1);

      const selections2to1 = await tx
        .select({ message: selections.message })
        .from(selections)
        .where(
          and(
            eq(selections.selectorParticipantId, matchData.participant2Id),
            eq(selections.selectedParticipantId, matchData.participant1Id)
          )
        )
        .limit(1);

      return { 
        success: true, 
        data: {
          id: matchData.id,
          gameRoomId: matchData.gameRoomId,
          participant1: participant1[0],
          participant2: participant2[0],
          messages: {
            fromParticipant1: selections1to2[0]?.message,
            fromParticipant2: selections2to1[0]?.message,
          },
          createdAt: matchData.createdAt,
        }
      };
    });
  } catch (error) {
    console.error("Get match details error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "매칭 상세 조회에 실패했습니다" 
    };
  }
}