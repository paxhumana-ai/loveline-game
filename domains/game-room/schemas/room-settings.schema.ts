import { z } from "zod";

export const roomSettingsSchema = z.object({
  maxParticipants: z.number().int().min(2).max(8).optional(),
  totalRounds: z.number().int().min(3).max(10).optional(),
});

export type RoomSettingsInput = z.infer<typeof roomSettingsSchema>;

export const transferHostSchema = z.object({
  newHostParticipantId: z.string().uuid(),
});

export type TransferHostInput = z.infer<typeof transferHostSchema>;