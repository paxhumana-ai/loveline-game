import { z } from "zod";

export const matchingResultSchema = z.object({
  id: z.string().uuid(),
  gameRoomId: z.string().uuid(),
  participant1Id: z.string().uuid(),
  participant2Id: z.string().uuid(),
  createdAt: z.date(),
});

export const matchDetectionInputSchema = z.object({
  roundId: z.string().uuid("라운드 ID가 유효하지 않습니다"),
  gameRoomId: z.string().uuid("게임방 ID가 유효하지 않습니다"),
});

export const participantMatchSchema = z.object({
  participantId: z.string().uuid(),
  nickname: z.string(),
  character: z.string(),
  selectedBy: z.array(z.string().uuid()).optional(),
  hasSelected: z.boolean(),
  matchedWith: z.string().uuid().optional(),
});

export const roundMatchSummarySchema = z.object({
  roundId: z.string().uuid(),
  roundNumber: z.number(),
  totalParticipants: z.number(),
  totalSelections: z.number(),
  totalMatches: z.number(),
  matchingRate: z.number(),
  matches: z.array(matchingResultSchema),
  unmatched: z.array(participantMatchSchema),
});

export const gameStatisticsSchema = z.object({
  gameRoomId: z.string().uuid(),
  totalRounds: z.number(),
  totalParticipants: z.number(),
  totalMatches: z.number(),
  overallMatchingRate: z.number(),
  mostPopularParticipant: participantMatchSchema.optional(),
  matchingChampion: participantMatchSchema.optional(),
  roundSummaries: z.array(roundMatchSummarySchema),
});

export type MatchingResult = z.infer<typeof matchingResultSchema>;
export type MatchDetectionInput = z.infer<typeof matchDetectionInputSchema>;
export type ParticipantMatch = z.infer<typeof participantMatchSchema>;
export type RoundMatchSummary = z.infer<typeof roundMatchSummarySchema>;
export type GameStatistics = z.infer<typeof gameStatisticsSchema>;