/**
 * 6자리 영숫자 게임방 코드 생성
 * @returns 6자리 대문자 영숫자 코드
 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * 캐릭터 이름 목록 (동물 캐릭터)
 */
export const AVAILABLE_CHARACTERS = [
  "🐶 강아지", "🐱 고양이", "🐰 토끼", "🐻 곰", "🦊 여우",
  "🐯 호랑이", "🦁 사자", "🐼 판다", "🐨 코알라", "🐸 개구리",
  "🐧 펭귄", "🦋 나비", "🐝 벌", "🐢 거북이", "🐹 햄스터",
  "🦉 올빼미", "🐺 늑대", "🦌 사슴", "🐙 문어", "🦜 앵무새"
];

/**
 * MBTI 타입 라벨 매핑
 */
export const MBTI_LABELS = {
  INTJ: "건축가", INTP: "논리술사", ENTJ: "통솔자", ENTP: "변론가",
  INFJ: "옹호자", INFP: "중재자", ENFJ: "선도자", ENFP: "활동가",
  ISTJ: "현실주의자", ISFJ: "수호자", ESTJ: "경영자", ESFJ: "집정관",
  ISTP: "만능재주꾼", ISFP: "모험가", ESTP: "사업가", ESFP: "연예인"
};