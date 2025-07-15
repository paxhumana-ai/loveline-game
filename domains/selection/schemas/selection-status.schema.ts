import { z } from "zod";

export const selectionStatusEnum = z.enum([
  "not_selected",
  "selected", 
  "passed"
]);

export const selectionStatusSchema = z.object({
  participantId: z.string().uuid("참가자 ID가 유효하지 않습니다"),
  roundId: z.string().uuid("라운드 ID가 유효하지 않습니다"),
  status: selectionStatusEnum,
  selectedParticipantId: z.string().uuid().optional(),
  message: z.string().max(50).optional(),
  createdAt: z.date().optional(),
});

export const participantSelectionSummarySchema = z.object({
  participantId: z.string().uuid(),
  nickname: z.string(),
  character: z.string(),
  hasSelected: z.boolean(),
  selectionStatus: selectionStatusEnum,
});

export type SelectionStatus = z.infer<typeof selectionStatusSchema>;
export type ParticipantSelectionSummary = z.infer<typeof participantSelectionSummarySchema>;