import { z } from "zod";

export const participantProfileSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 최소 2자 이상이어야 합니다")
    .max(8, "닉네임은 최대 8자까지 가능합니다")
    .regex(
      /^[가-힣a-zA-Z0-9\s]+$/,
      "닉네임은 한글, 영문, 숫자, 공백만 사용 가능합니다"
    ),
  gender: z.enum(["male", "female", "other"]),
  gameRoomId: z.string().uuid("유효한 게임방 ID가 아닙니다"),
});

export type ParticipantProfileInput = z.infer<typeof participantProfileSchema>;

export const participantProfileUpdateSchema = participantProfileSchema.partial({
  gameRoomId: true,
});

export type ParticipantProfileUpdateInput = z.infer<
  typeof participantProfileUpdateSchema
>;
