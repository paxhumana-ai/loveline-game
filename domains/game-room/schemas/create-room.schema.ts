import { z } from "zod";

export const createRoomSchema = z.object({
  maxParticipants: z.number().int().min(2).max(8),
  totalRounds: z.number().int().min(3).max(10),
  hostNickname: z.string().min(1).max(20),
  hostGender: z.enum(["male", "female", "other"]),
  hostMbti: z.enum([
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP", 
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
    "ISTP", "ISFP", "ESTP", "ESFP"
  ]),
  hostCharacter: z.string().min(1).max(50),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;