import { z } from "zod";

export const joinRoomSchema = z.object({
  code: z.string().length(6).regex(/^[A-Z0-9]{6}$/, "방 코드는 6자리 영숫자여야 합니다"),
  nickname: z.string().min(1).max(20),
  gender: z.enum(["male", "female", "other"]),
  mbti: z.enum([
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP", 
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
    "ISTP", "ISFP", "ESTP", "ESFP"
  ]),
  character: z.string().min(1).max(50),
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;