import "dotenv/config";
import { adminDb } from "./index";
import { questions, questionCategoryEnum } from "./schema";

// 러브라인 게임용 질문 데이터 (100개)
const questionData: Array<{
  content: string;
  category:
    | "romance"
    | "friendship"
    | "personality"
    | "lifestyle"
    | "preferences"
    | "hypothetical";
  difficulty: number;
}> = [
  // Romance 카테고리 (20개)
  {
    content: "누가 이상형의 외모를 가장 중요하게 생각할까요?",
    category: "romance",
    difficulty: 1,
  },
  {
    content: "누가 첫 데이트 장소를 가장 로맨틱하게 선택할까요?",
    category: "romance",
    difficulty: 1,
  },
  {
    content: "누가 연인과의 기념일을 가장 잘 챙길까요?",
    category: "romance",
    difficulty: 2,
  },
  {
    content: "누가 사랑에 빠졌을 때 가장 큰 변화를 보일까요?",
    category: "romance",
    difficulty: 2,
  },
  {
    content: "누가 연인의 과거 연애사를 가장 궁금해할까요?",
    category: "romance",
    difficulty: 3,
  },
  {
    content: "누가 결혼 전 동거에 가장 개방적일까요?",
    category: "romance",
    difficulty: 3,
  },
  {
    content: "누가 연인과 취향이 달라도 가장 잘 맞춰갈까요?",
    category: "romance",
    difficulty: 2,
  },
  {
    content: "누가 가장 로맨틱한 프러포즈를 원할까요?",
    category: "romance",
    difficulty: 2,
  },
  {
    content: "누가 연인과 싸웠을 때 먼저 사과할까요?",
    category: "romance",
    difficulty: 2,
  },
  {
    content: "누가 원거리 연애를 가장 잘 견뎌낼까요?",
    category: "romance",
    difficulty: 3,
  },
  {
    content: "누가 연인이 질투를 많이 해도 이해할까요?",
    category: "romance",
    difficulty: 3,
  },
  {
    content: "누가 스킨십을 연애에서 가장 중요하게 생각할까요?",
    category: "romance",
    difficulty: 3,
  },
  {
    content: "누가 연인과 함께 가장 다양한 취미활동을 하고 싶어할까요?",
    category: "romance",
    difficulty: 1,
  },
  {
    content: "누가 이별 후에도 친구로 지낼 수 있을까요?",
    category: "romance",
    difficulty: 4,
  },
  {
    content: "누가 연인의 친구들과 가장 잘 어울릴까요?",
    category: "romance",
    difficulty: 2,
  },
  {
    content: "누가 소개팅보다 자연스러운 만남을 선호할까요?",
    category: "romance",
    difficulty: 2,
  },
  {
    content: "누가 연애할 때 진실함을 가장 중요하게 생각할까요?",
    category: "romance",
    difficulty: 3,
  },
  {
    content: "누가 연인과의 미래를 가장 구체적으로 계획할까요?",
    category: "romance",
    difficulty: 3,
  },
  {
    content: "누가 첫눈에 반한 경험이 가장 많을까요?",
    category: "romance",
    difficulty: 1,
  },
  {
    content: "누가 연인에게 선의의 거짓말을 할 수 있을까요?",
    category: "romance",
    difficulty: 4,
  },

  // Friendship 카테고리 (20개)
  {
    content: "누가 친구를 선택할 때 성격을 가장 중요하게 생각할까요?",
    category: "friendship",
    difficulty: 2,
  },
  {
    content: "누가 친구와 연인 사이에서 가장 고민할까요?",
    category: "friendship",
    difficulty: 3,
  },
  {
    content: "누가 친구의 비밀을 가장 잘 지킬까요?",
    category: "friendship",
    difficulty: 2,
  },
  {
    content: "누가 친구에게 가장 선뜻 돈을 빌려줄까요?",
    category: "friendship",
    difficulty: 3,
  },
  {
    content: "누가 친구와 가장 재밌는 여행을 할까요?",
    category: "friendship",
    difficulty: 1,
  },
  {
    content: "누가 친구의 단점을 가장 솔직하게 말해줄까요?",
    category: "friendship",
    difficulty: 3,
  },
  {
    content: "누가 친구가 힘들어할 때 가장 잘 위로해줄까요?",
    category: "friendship",
    difficulty: 2,
  },
  {
    content: "누가 친구와 취향이 달라도 가장 잘 지낼까요?",
    category: "friendship",
    difficulty: 1,
  },
  {
    content: "누가 친구와 오랫동안 연락이 안 되어도 괜찮을까요?",
    category: "friendship",
    difficulty: 2,
  },
  {
    content: "누가 친구의 연인을 좋아하게 되면 가장 고민할까요?",
    category: "friendship",
    difficulty: 5,
  },
  {
    content: "친구와 같은 사람을 좋아하게 된다면?",
    category: "friendship",
    difficulty: 4,
  },
  {
    content: "친구에게 조언을 구하는 편인가요?",
    category: "friendship",
    difficulty: 2,
  },
  {
    content: "친구들과 있을 때와 혼자 있을 때 중 언제가 더 편한가요?",
    category: "friendship",
    difficulty: 2,
  },
  {
    content: "친구의 성공을 진심으로 축하할 수 있나요?",
    category: "friendship",
    difficulty: 3,
  },
  {
    content: "친구와 의견이 다를 때 어떻게 하나요?",
    category: "friendship",
    difficulty: 2,
  },
  {
    content: "소수의 깊은 친구 vs 많은 수의 얕은 친구?",
    category: "friendship",
    difficulty: 2,
  },
  {
    content: "친구의 부탁을 거절할 수 있나요?",
    category: "friendship",
    difficulty: 3,
  },
  {
    content: "친구들과의 추억 중 가장 소중한 것은?",
    category: "friendship",
    difficulty: 1,
  },
  {
    content: "친구에게 실망한 경험이 있나요?",
    category: "friendship",
    difficulty: 3,
  },
  {
    content: "평생 친구라고 생각하는 사람이 있나요?",
    category: "friendship",
    difficulty: 2,
  },

  // Personality 카테고리 (20개)
  {
    content: "누가 스트레스를 받을 때 가장 독특한 방법으로 풀까요?",
    category: "personality",
    difficulty: 2,
  },
  {
    content: "누가 새로운 환경에 가장 빨리 적응할까요?",
    category: "personality",
    difficulty: 2,
  },
  {
    content: "누가 계획보다는 즉흥적인 것을 더 선호할까요?",
    category: "personality",
    difficulty: 1,
  },
  {
    content: "누가 혼자만의 시간이 가장 많이 필요할까요?",
    category: "personality",
    difficulty: 2,
  },
  {
    content: "누가 감정표현을 가장 잘할까요?",
    category: "personality",
    difficulty: 2,
  },
  {
    content: "리더십을 발휘하는 편인가요?",
    category: "personality",
    difficulty: 2,
  },
  {
    content: "완벽주의 성향이 있나요?",
    category: "personality",
    difficulty: 2,
  },
  {
    content: "도전적인 일을 좋아하나요?",
    category: "personality",
    difficulty: 2,
  },
  {
    content: "다른 사람의 시선을 많이 의식하나요?",
    category: "personality",
    difficulty: 3,
  },
  {
    content: "화가 났을 때 어떻게 표현하나요?",
    category: "personality",
    difficulty: 3,
  },
  {
    content: "실수를 했을 때 어떻게 반응하나요?",
    category: "personality",
    difficulty: 2,
  },
  {
    content: "자신의 단점을 인정하는 편인가요?",
    category: "personality",
    difficulty: 3,
  },
  {
    content: "칭찬을 받는 것과 주는 것 중 어느 쪽이 더 편한가요?",
    category: "personality",
    difficulty: 2,
  },
  { content: "변화를 두려워하나요?", category: "personality", difficulty: 3 },
  {
    content: "자신만의 철학이나 신념이 있나요?",
    category: "personality",
    difficulty: 3,
  },
  {
    content: "타인의 조언을 잘 받아들이나요?",
    category: "personality",
    difficulty: 2,
  },
  {
    content: "자신감이 부족하다고 느낄 때가 있나요?",
    category: "personality",
    difficulty: 3,
  },
  {
    content: "목표를 달성하기 위해 얼마나 노력하나요?",
    category: "personality",
    difficulty: 2,
  },
  {
    content: "남들과 다른 점을 개성으로 받아들이나요?",
    category: "personality",
    difficulty: 3,
  },
  {
    content: "과거보다는 미래에 집중하는 편인가요?",
    category: "personality",
    difficulty: 2,
  },

  // Lifestyle 카테고리 (20개)
  {
    content: "누가 주말을 가장 알차게 보낼까요?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "누가 가장 철저한 아침형 인간일까요?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "누가 운동을 가장 꾸준히 할까요?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "누가 요리를 가장 잘할까요?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "누가 SNS를 가장 자주 사용할까요?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "여행을 갈 때 계획을 세우나요?",
    category: "lifestyle",
    difficulty: 2,
  },
  {
    content: "쇼핑할 때 충동구매를 하는 편인가요?",
    category: "lifestyle",
    difficulty: 2,
  },
  { content: "돈 관리를 어떻게 하나요?", category: "lifestyle", difficulty: 2 },
  { content: "패션에 관심이 많나요?", category: "lifestyle", difficulty: 1 },
  {
    content: "건강관리를 어떻게 하나요?",
    category: "lifestyle",
    difficulty: 2,
  },
  {
    content: "독서를 얼마나 자주 하나요?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "음악을 들을 때 선호하는 장르는?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "영화를 볼 때 선호하는 장르는?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "집에서 보내는 시간과 밖에서 보내는 시간 중 어느 쪽을 선호하나요?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "새로운 음식을 시도하는 것을 좋아하나요?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "환경보호에 관심이 있나요?",
    category: "lifestyle",
    difficulty: 2,
  },
  {
    content: "반려동물을 기르고 있거나 기르고 싶나요?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "자기계발에 얼마나 투자하나요?",
    category: "lifestyle",
    difficulty: 2,
  },
  {
    content: "소셜미디어에서 어떤 콘텐츠를 주로 보나요?",
    category: "lifestyle",
    difficulty: 1,
  },
  {
    content: "일과 삶의 균형을 어떻게 맞추나요?",
    category: "lifestyle",
    difficulty: 3,
  },

  // Preferences 카테고리 (10개)
  {
    content: "누가 여름을 가장 좋아할까요?",
    category: "preferences",
    difficulty: 1,
  },
  {
    content: "누가 빨간색을 가장 좋아할까요?",
    category: "preferences",
    difficulty: 1,
  },
  {
    content: "누가 저녁 데이트를 가장 선호할까요?",
    category: "preferences",
    difficulty: 1,
  },
  {
    content: "누가 매운 음식을 가장 좋아할까요?",
    category: "preferences",
    difficulty: 1,
  },
  {
    content: "누가 액티브한 휴가를 가장 선호할까요?",
    category: "preferences",
    difficulty: 1,
  },
  { content: "좋아하는 날씨는?", category: "preferences", difficulty: 1 },
  { content: "선호하는 교통수단은?", category: "preferences", difficulty: 1 },
  { content: "좋아하는 향수 계열은?", category: "preferences", difficulty: 1 },
  {
    content: "선호하는 인테리어 스타일은?",
    category: "preferences",
    difficulty: 1,
  },
  {
    content: "좋아하는 카페 분위기는?",
    category: "preferences",
    difficulty: 1,
  },

  // Hypothetical 카테고리 (10개)
  {
    content: "누가 무인도에 가장 실용적인 것을 가져갈까요?",
    category: "hypothetical",
    difficulty: 2,
  },
  {
    content: "누가 시간을 되돌릴 수 있다면 가장 멀리 갈까요?",
    category: "hypothetical",
    difficulty: 3,
  },
  {
    content: "누가 로또 1등에 당첨되면 가장 먼저 가족을 생각할까요?",
    category: "hypothetical",
    difficulty: 2,
  },
  {
    content: "누가 투명인간이 되면 가장 재밌는 일을 할까요?",
    category: "hypothetical",
    difficulty: 3,
  },
  {
    content: "누가 마지막 식사로 가장 특별한 음식을 선택할까요?",
    category: "hypothetical",
    difficulty: 2,
  },
  {
    content: "과거나 미래 중 한 곳을 여행할 수 있다면?",
    category: "hypothetical",
    difficulty: 2,
  },
  {
    content: "세상에서 하나의 문제를 해결할 수 있다면?",
    category: "hypothetical",
    difficulty: 4,
  },
  {
    content: "유명인과 하루를 보낼 수 있다면 누구와?",
    category: "hypothetical",
    difficulty: 2,
  },
  {
    content: "평생 하나의 음식만 먹어야 한다면?",
    category: "hypothetical",
    difficulty: 2,
  },
  {
    content: "초능력을 하나 가질 수 있다면?",
    category: "hypothetical",
    difficulty: 2,
  },
];

// 동물 캐릭터 데이터 (20개)
const characterData = [
  "🐱 고양이 - 도도하고 독립적인",
  "🐶 강아지 - 활발하고 충성스러운",
  "🐰 토끼 - 귀엽고 수줍은",
  "🐻 곰 - 든든하고 포근한",
  "🦊 여우 - 영리하고 매력적인",
  "🐼 판다 - 느긋하고 사랑스러운",
  "🐯 호랑이 - 당당하고 카리스마 있는",
  "🦁 사자 - 리더십 있고 용감한",
  "🐸 개구리 - 활기차고 유쾌한",
  "🐵 원숭이 - 장난스럽고 똑똑한",
  "🐨 코알라 - 평화롭고 느긋한",
  "🐺 늑대 - 신비롭고 독립적인",
  "🦔 고슴도치 - 방어적이지만 따뜻한",
  "🐧 펭귄 - 사교적이고 귀여운",
  "🦋 나비 - 자유롭고 아름다운",
  "🐢 거북이 - 신중하고 지혜로운",
  "🦅 독수리 - 날카롭고 집중력 있는",
  "🐙 문어 - 유연하고 다재다능한",
  "🦄 유니콘 - 특별하고 환상적인",
  "🐉 용 - 강력하고 신비로운",
];

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // 질문 데이터 삽입
    console.log("📝 Inserting questions...");
    for (const question of questionData) {
      await adminDb.insert(questions).values(question).onConflictDoNothing();
    }

    console.log("✅ Database seeding completed!");
    console.log(`📝 ${questionData.length} questions inserted`);
    console.log(`🎭 ${characterData.length} characters available`);

    // 캐릭터 데이터는 별도 테이블 없이 하드코딩으로 사용
    console.log("\n🎭 Available Characters:");
    characterData.forEach((character, index) => {
      console.log(`${index + 1}. ${character}`);
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// CLI에서 직접 실행할 때
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Seed completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seed failed:", error);
      process.exit(1);
    });
}
