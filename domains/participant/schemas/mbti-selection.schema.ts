import { z } from "zod";

export const MBTI_TYPES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

export const MBTI_CATEGORIES = {
  analyst: ["INTJ", "INTP", "ENTJ", "ENTP"],
  diplomat: ["INFJ", "INFP", "ENFJ", "ENFP"],
  sentinel: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  explorer: ["ISTP", "ISFP", "ESTP", "ESFP"],
} as const;

export const MBTI_DESCRIPTIONS = {
  INTJ: "전략가 - 상상력이 풍부하고 전략적 사고",
  INTP: "논리학자 - 혁신적이고 독창적 사고",
  ENTJ: "통솔자 - 대담하고 상상력이 풍부한 지도자",
  ENTP: "변론가 - 똑똑하고 호기심이 많은 사상가",
  INFJ: "옹호자 - 선의를 지닌 완벽주의자",
  INFP: "중재자 - 시적이고 친절한 이타주의자",
  ENFJ: "선도자 - 카리스마 있고 영감을 주는 지도자",
  ENFP: "활동가 - 열정적이고 창의적인 사교가",
  ISTJ: "물류담당자 - 실용적이고 사실지향적",
  ISFJ: "수호자 - 따뜻하고 헌신적인 수호자",
  ESTJ: "경영자 - 뛰어난 관리자",
  ESFJ: "집정관 - 배려심이 많고 사교적인 협력자",
  ISTP: "만능재주꾼 - 대담하고 실용적인 실험가",
  ISFP: "모험가 - 유연하고 매력적인 예술가",
  ESTP: "사업가 - 똑똑하고 에너지 넘치는 인식가",
  ESFP: "연예인 - 자발적이고 열정적인 연예인",
} as const;

export const mbtiSelectionSchema = z.object({
  mbti: z.enum(MBTI_TYPES),
});

export type MbtiSelectionInput = z.infer<typeof mbtiSelectionSchema>;
