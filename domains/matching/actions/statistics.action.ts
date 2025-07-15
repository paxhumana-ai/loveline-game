"use server";

import { eq, and, sql, desc } from "drizzle-orm";
import { createDrizzleSupabaseClient } from "@/db";
import { matches, participants, selections, rounds } from "@/db/schema";

export async function getGameStatistics(gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get total participants in the game room
      const totalParticipants = await tx
        .select({ count: sql<number>`count(*)` })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoomId));

      // Get total matches in the game room
      const totalMatches = await tx
        .select({ count: sql<number>`count(*)` })
        .from(matches)
        .where(eq(matches.gameRoomId, gameRoomId));

      // Get total rounds
      const totalRounds = await tx
        .select({ count: sql<number>`count(*)` })
        .from(rounds)
        .where(eq(rounds.gameRoomId, gameRoomId));

      // Get total selections (non-passed)
      const totalSelections = await tx
        .select({ count: sql<number>`count(*)` })
        .from(selections)
        .leftJoin(rounds, eq(selections.roundId, rounds.id))
        .where(
          and(
            eq(rounds.gameRoomId, gameRoomId),
            eq(selections.isPassed, false)
          )
        );

      const participantCount = totalParticipants[0]?.count || 0;
      const matchCount = totalMatches[0]?.count || 0;
      const roundCount = totalRounds[0]?.count || 0;
      const selectionCount = totalSelections[0]?.count || 0;

      // Calculate overall matching rate
      const overallMatchingRate = selectionCount > 0 
        ? Math.round((matchCount * 2 / selectionCount) * 100) 
        : 0;

      // Get popularity ranking (most selected participants)
      const popularityQuery = await tx
        .select({
          participantId: selections.selectedParticipantId,
          selectionCount: sql<number>`count(*)`,
        })
        .from(selections)
        .leftJoin(rounds, eq(selections.roundId, rounds.id))
        .where(
          and(
            eq(rounds.gameRoomId, gameRoomId),
            eq(selections.isPassed, false),
            sql`${selections.selectedParticipantId} IS NOT NULL`
          )
        )
        .groupBy(selections.selectedParticipantId)
        .orderBy(desc(sql`count(*)`));

      // Get matching champions (most matched participants)
      const matchingChampionsQuery = await tx
        .select({
          participantId: sql<string>`CASE 
            WHEN ${matches.participant1Id} IS NOT NULL THEN ${matches.participant1Id}
            WHEN ${matches.participant2Id} IS NOT NULL THEN ${matches.participant2Id}
          END`,
          matchCount: sql<number>`count(*)`,
        })
        .from(matches)
        .where(eq(matches.gameRoomId, gameRoomId))
        .groupBy(sql`CASE 
          WHEN ${matches.participant1Id} IS NOT NULL THEN ${matches.participant1Id}
          WHEN ${matches.participant2Id} IS NOT NULL THEN ${matches.participant2Id}
        END`)
        .orderBy(desc(sql`count(*)`));

      // Actually need to count both participant1 and participant2 for matching champions
      const matchingStats = new Map<string, number>();
      
      const allMatches = await tx
        .select({
          participant1Id: matches.participant1Id,
          participant2Id: matches.participant2Id,
        })
        .from(matches)
        .where(eq(matches.gameRoomId, gameRoomId));

      for (const match of allMatches) {
        matchingStats.set(match.participant1Id, (matchingStats.get(match.participant1Id) || 0) + 1);
        matchingStats.set(match.participant2Id, (matchingStats.get(match.participant2Id) || 0) + 1);
      }

      // Get participant details for top performers
      let mostPopularParticipant = null;
      if (popularityQuery.length > 0 && popularityQuery[0].participantId) {
        const popularParticipant = await tx
          .select({
            id: participants.id,
            nickname: participants.nickname,
            character: participants.character,
            gender: participants.gender,
          })
          .from(participants)
          .where(eq(participants.id, popularityQuery[0].participantId))
          .limit(1);

        if (popularParticipant.length > 0) {
          mostPopularParticipant = {
            ...popularParticipant[0],
            selectionCount: popularityQuery[0].selectionCount,
          };
        }
      }

      let matchingChampion = null;
      if (matchingStats.size > 0) {
        const [championId, championMatches] = Array.from(matchingStats.entries())
          .sort((a, b) => b[1] - a[1])[0];

        const championParticipant = await tx
          .select({
            id: participants.id,
            nickname: participants.nickname,
            character: participants.character,
            gender: participants.gender,
          })
          .from(participants)
          .where(eq(participants.id, championId))
          .limit(1);

        if (championParticipant.length > 0) {
          matchingChampion = {
            ...championParticipant[0],
            matchCount: championMatches,
          };
        }
      }

      // Get round-by-round statistics
      const roundStats = await tx
        .select({
          roundId: rounds.id,
          roundNumber: rounds.roundNumber,
          status: rounds.status,
        })
        .from(rounds)
        .where(eq(rounds.gameRoomId, gameRoomId))
        .orderBy(rounds.roundNumber);

      const roundSummaries = [];
      for (const round of roundStats) {
        const roundSelections = await tx
          .select({ count: sql<number>`count(*)` })
          .from(selections)
          .where(
            and(
              eq(selections.roundId, round.roundId),
              eq(selections.isPassed, false)
            )
          );

        const roundMatches = await tx
          .select({ count: sql<number>`count(*)` })
          .from(matches)
          .leftJoin(selections, 
            sql`${matches.participant1Id} = ${selections.selectorParticipantId} OR ${matches.participant2Id} = ${selections.selectorParticipantId}`
          )
          .where(eq(selections.roundId, round.roundId));

        const roundSelectionCount = roundSelections[0]?.count || 0;
        const roundMatchCount = roundMatches[0]?.count || 0;
        const roundMatchingRate = roundSelectionCount > 0 
          ? Math.round((roundMatchCount * 2 / roundSelectionCount) * 100) 
          : 0;

        roundSummaries.push({
          roundId: round.roundId,
          roundNumber: round.roundNumber,
          status: round.status,
          totalSelections: roundSelectionCount,
          totalMatches: roundMatchCount,
          matchingRate: roundMatchingRate,
        });
      }

      return { 
        success: true, 
        data: {
          gameRoomId,
          totalRounds: roundCount,
          totalParticipants: participantCount,
          totalMatches: matchCount,
          totalSelections: selectionCount,
          overallMatchingRate,
          mostPopularParticipant,
          matchingChampion,
          roundSummaries,
          summary: {
            averageMatchesPerRound: roundCount > 0 ? Math.round(matchCount / roundCount * 100) / 100 : 0,
            participationRate: Math.round((selectionCount / (participantCount * roundCount)) * 100),
            uniqueMatchedParticipants: matchingStats.size,
          }
        }
      };
    });
  } catch (error) {
    console.error("Get game statistics error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "게임 통계 조회에 실패했습니다" 
    };
  }
}

export async function getPopularityRanking(gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get selection counts per participant
      const popularityData = await tx
        .select({
          participantId: selections.selectedParticipantId,
          selectionCount: sql<number>`count(*)`,
        })
        .from(selections)
        .leftJoin(rounds, eq(selections.roundId, rounds.id))
        .where(
          and(
            eq(rounds.gameRoomId, gameRoomId),
            eq(selections.isPassed, false),
            sql`${selections.selectedParticipantId} IS NOT NULL`
          )
        )
        .groupBy(selections.selectedParticipantId)
        .orderBy(desc(sql`count(*)`));

      // Get participant details and build ranking
      const ranking = [];
      for (let i = 0; i < popularityData.length; i++) {
        const data = popularityData[i];
        if (!data.participantId) continue;

        const participant = await tx
          .select({
            id: participants.id,
            nickname: participants.nickname,
            character: participants.character,
            gender: participants.gender,
          })
          .from(participants)
          .where(eq(participants.id, data.participantId))
          .limit(1);

        if (participant.length > 0) {
          ranking.push({
            rank: i + 1,
            participant: participant[0],
            selectionCount: data.selectionCount,
            percentage: Math.round((data.selectionCount / popularityData.reduce((sum, p) => sum + p.selectionCount, 0)) * 100),
          });
        }
      }

      // Also include participants who weren't selected
      const allParticipants = await tx
        .select({
          id: participants.id,
          nickname: participants.nickname,
          character: participants.character,
          gender: participants.gender,
        })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoomId));

      const rankedParticipantIds = new Set(ranking.map(r => r.participant.id));
      const unrankedParticipants = allParticipants.filter(p => !rankedParticipantIds.has(p.id));

      for (const participant of unrankedParticipants) {
        ranking.push({
          rank: ranking.length + 1,
          participant,
          selectionCount: 0,
          percentage: 0,
        });
      }

      return { 
        success: true, 
        data: {
          ranking,
          totalParticipants: allParticipants.length,
          summary: {
            mostPopular: ranking[0] || null,
            averageSelections: ranking.length > 0 
              ? Math.round(ranking.reduce((sum, r) => sum + r.selectionCount, 0) / ranking.length * 100) / 100 
              : 0,
          }
        }
      };
    });
  } catch (error) {
    console.error("Get popularity ranking error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "인기도 랭킹 조회에 실패했습니다" 
    };
  }
}

export async function getMatchingStatistics(gameRoomId: string) {
  try {
    const db = await createDrizzleSupabaseClient();

    return await db.rls(async (tx) => {
      // Get all matches
      const allMatches = await tx
        .select({
          participant1Id: matches.participant1Id,
          participant2Id: matches.participant2Id,
          createdAt: matches.createdAt,
        })
        .from(matches)
        .where(eq(matches.gameRoomId, gameRoomId));

      // Count matches per participant
      const matchingStats = new Map<string, number>();
      for (const match of allMatches) {
        matchingStats.set(match.participant1Id, (matchingStats.get(match.participant1Id) || 0) + 1);
        matchingStats.set(match.participant2Id, (matchingStats.get(match.participant2Id) || 0) + 1);
      }

      // Get participant details and build ranking
      const matchingRanking = [];
      for (const [participantId, matchCount] of Array.from(matchingStats.entries()).sort((a, b) => b[1] - a[1])) {
        const participant = await tx
          .select({
            id: participants.id,
            nickname: participants.nickname,
            character: participants.character,
            gender: participants.gender,
          })
          .from(participants)
          .where(eq(participants.id, participantId))
          .limit(1);

        if (participant.length > 0) {
          matchingRanking.push({
            participant: participant[0],
            matchCount,
            rank: matchingRanking.length + 1,
          });
        }
      }

      // Include participants with no matches
      const allParticipants = await tx
        .select({
          id: participants.id,
          nickname: participants.nickname,
          character: participants.character,
          gender: participants.gender,
        })
        .from(participants)
        .where(eq(participants.gameRoomId, gameRoomId));

      const rankedParticipantIds = new Set(matchingRanking.map(r => r.participant.id));
      const unmatchedParticipants = allParticipants.filter(p => !rankedParticipantIds.has(p.id));

      for (const participant of unmatchedParticipants) {
        matchingRanking.push({
          participant,
          matchCount: 0,
          rank: matchingRanking.length + 1,
        });
      }

      // Gender-based statistics
      const genderStats = {
        male: { matched: 0, total: 0 },
        female: { matched: 0, total: 0 },
        other: { matched: 0, total: 0 },
      };

      for (const participant of allParticipants) {
        const gender = participant.gender as keyof typeof genderStats;
        if (genderStats[gender]) {
          genderStats[gender].total++;
          if (matchingStats.has(participant.id)) {
            genderStats[gender].matched++;
          }
        }
      }

      return { 
        success: true, 
        data: {
          matchingRanking,
          totalMatches: allMatches.length,
          totalParticipants: allParticipants.length,
          genderStats,
          summary: {
            matchingChampion: matchingRanking[0] || null,
            averageMatchesPerParticipant: allParticipants.length > 0 
              ? Math.round((allMatches.length * 2) / allParticipants.length * 100) / 100 
              : 0,
            uniqueMatchedParticipants: matchingStats.size,
            matchingRate: allParticipants.length > 0 
              ? Math.round((matchingStats.size / allParticipants.length) * 100) 
              : 0,
          }
        }
      };
    });
  } catch (error) {
    console.error("Get matching statistics error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "매칭 통계 조회에 실패했습니다" 
    };
  }
}