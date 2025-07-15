import { z } from "zod";

export const AVAILABLE_CHARACTERS = [
  "🐱 고양이",
  "🐶 강아지",
  "🐰 토끼",
  "🐻 곰",
  "🦊 여우",
  "🐼 판다",
  "🐯 호랑이",
  "🦁 사자",
  "🐸 개구리",
  "🐵 원숭이",
  "🐨 코알라",
  "🐺 늑대",
  "🦔 고슴도치",
  "🐧 펭귄",
  "🦋 나비",
  "🐢 거북이",
  "🦅 독수리",
  "🐙 문어",
  "🦄 유니콘",
  "🐉 용",
] as const;

export const characterSelectionSchema = z.object({
  character: z.enum(AVAILABLE_CHARACTERS),
  gameRoomId: z.string().uuid("유효한 게임방 ID가 아닙니다"),
});

export type CharacterSelectionInput = z.infer<typeof characterSelectionSchema>;

export const characterUpdateSchema = characterSelectionSchema.omit({
  gameRoomId: true,
});

export type CharacterUpdateInput = z.infer<typeof characterUpdateSchema>;
