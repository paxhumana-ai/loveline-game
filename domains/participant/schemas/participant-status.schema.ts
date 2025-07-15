import { z } from "zod";

export const PARTICIPANT_STATUS = [
  "joined",
  "ready",
  "playing",
  "finished",
] as const;

export const participantStatusSchema = z.object({
  status: z.enum(PARTICIPANT_STATUS),
});

export type ParticipantStatusInput = z.infer<typeof participantStatusSchema>;

export const participantStatusUpdateSchema = z.object({
  participantId: z.uuid("유효한 참가자 ID가 아닙니다"),
  status: z.enum(PARTICIPANT_STATUS),
});

export type ParticipantStatusUpdateInput = z.infer<
  typeof participantStatusUpdateSchema
>;
