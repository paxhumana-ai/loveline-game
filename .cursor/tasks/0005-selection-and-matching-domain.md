## Task 0005: 지목 및 매칭(Selection & Matching) 도메인 구현

### 목표

참가자들의 지목 시스템과 상호 매칭 감지, 매칭 이벤트 처리 등 게임의 핵심 재미 요소를 담당하는 시스템을 구축합니다.

### 작업 상세

- [x] **백엔드 (Server Actions)**

  - **스키마 정의 (`src/domains/selection/schemas/`)**

    - `selection-input.schema.ts`: 지목 입력 검증 (선택된 참가자, 메시지 50자 이내)
    - `matching-result.schema.ts`: 매칭 결과 검증
    - `selection-status.schema.ts`: 지목 상태 관리 검증

  - **서버 액션 구현 (`src/domains/selection/actions/`)**
    - `create.action.ts`:
      - `createSelection()`: 새로운 지목 생성 (중복 체크 포함)
      - `updateSelection()`: 지목 수정 (시간 내에만 가능)
      - `deleteSelection()`: 지목 취소
    - `fetch.action.ts`:
      - `getSelectionsByRound()`: 라운드별 지목 결과 조회
      - `getParticipantSelections()`: 특정 참가자의 지목 이력
      - `getSelectionStatus()`: 참가자별 지목 완료 상태
    - `matching.action.ts`:
      - `detectMatches()`: 상호 지목 감지 및 매칭 생성
      - `getMatchesByRound()`: 라운드별 매칭 결과
      - `getMatchHistory()`: 전체 매칭 이력
    - `validation.action.ts`:
      - `validateSelectionEligibility()`: 지목 자격 검증 (자기 자신 선택 방지 등)
      - `checkSelectionTimeLimit()`: 지목 시간 제한 확인

- [x] **프론트엔드 (UI)**

  - **지목 관련 페이지 라우트 생성**

    - `/room/[code]/select/page.tsx` (지목 화면)
    - `/room/[code]/results/[roundNumber]/page.tsx` (라운드 결과)
    - `/room/[code]/final-results/page.tsx` (최종 결과)

  - **UI 컴포넌트 구현 (`src/domains/selection/components/`)**

    - `participant-selector.tsx`: 참가자 선택 그리드 (성별별 분리 표시)
    - `selection-form.tsx`: 지목 폼 (참가자 선택 + 메시지 입력)
    - `message-input.tsx`: 지목 메시지 입력 컴포넌트 (50자 제한)
    - `selection-confirmation.tsx`: 지목 확인 다이얼로그
    - `selection-status-board.tsx`: 전체 참가자 지목 완료 상태 표시
    - `pass-option.tsx`: "이번 라운드 패스" 옵션 컴포넌트

  - **매칭 결과 컴포넌트 (`src/domains/matching/components/`)**

    - `match-announcement.tsx`: 매칭 발표 애니메이션 (팡파레 효과)
    - `match-celebration.tsx`: 매칭 축하 화면 (아이스크림 산책 안내)
    - `round-results.tsx`: 라운드별 결과 요약
    - `match-history.tsx`: 매칭 이력 표시
    - `no-match-encouragement.tsx`: 매칭되지 않은 참가자 격려 메시지

  - **통계 및 결과 컴포넌트**
    - `game-statistics.tsx`: 게임 통계 (인기왕/퀸, 매칭 성공률 등)
    - `final-results-summary.tsx`: 최종 결과 요약
    - `popularity-ranking.tsx`: 인기도 랭킹 (익명 표시)

- [x] **지목 시스템**

  - **지목 규칙**

    - 라운드당 1명만 선택 가능
    - 자기 자신 선택 불가
    - 같은 방 참가자만 선택 가능
    - 선택과 함께 50자 이내 메시지 작성 가능
    - "이번 라운드 패스" 옵션 제공

  - **지목 상태 관리**

    - `not_selected`: 아직 선택하지 않음
    - `selected`: 선택 완료
    - `passed`: 패스 선택
    - 실시간 상태 업데이트

  - **지목 검증 로직**
    - 시간 제한 내 선택 확인
    - 중복 선택 방지
    - 유효한 참가자 선택 확인

- [x] **매칭 감지 시스템**

  - **매칭 로직**

    - A가 B를 선택하고, B도 A를 선택한 경우 매칭 성립
    - 라운드 종료 시점에 매칭 감지 실행
    - 매칭 결과를 `matches` 테이블에 저장

  - **매칭 이벤트 처리**

    - 매칭된 쌍에게 특별한 애니메이션 효과
    - "💕 {캐릭터1}과 {캐릭터2}가 매칭되었습니다!" 메시지
    - 5분 아이스크림 산책 안내
    - 다른 참가자들에게도 매칭 소식 공유

  - **매칭 통계**
    - 참가자별 매칭 횟수 집계
    - 라운드별 매칭 발생 현황
    - 전체 게임에서의 매칭률 계산

- [x] **결과 표시 시스템**

  - **라운드 결과**

    - 매칭된 쌍 발표 (애니메이션 효과)
    - 매칭되지 않은 참가자 격려
    - 다음 라운드 예고 또는 게임 종료 안내

  - **최종 결과**

    - 전체 매칭 이력 요약
    - 인기왕/인기퀸 발표 (가장 많이 지목받은 참가자)
    - 매칭 챔피언 발표 (가장 많이 매칭된 참가자)
    - 게임 통계 (총 지목 수, 매칭률 등)

  - **익명성 보장**
    - 지목 내용은 매칭 성립 시에만 공개
    - 매칭되지 않은 지목은 비공개 유지
    - 통계는 익명화하여 표시

- [x] **사용자 경험 향상**

  - **매칭 축하 효과**

    - 팡파레 애니메이션
    - 축하 사운드 효과
    - 하트 이모지 애니메이션

  - **격려 메시지**

    - 매칭되지 않은 참가자를 위한 긍정적 메시지
    - "다음 라운드에서 더 좋은 기회가 있을 거예요!" 등

  - **진행 상황 표시**
    - 참가자별 지목 완료 상태 실시간 표시
    - 전체 진행률 표시 바
    - 남은 시간 표시

### 완료 조건

- 참가자가 지목 화면에서 상대방을 선택하고 메시지를 작성할 수 있음
- 모든 참가자의 지목 완료 시 매칭 감지가 자동 실행됨
- 상호 지목 시 매칭 이벤트가 적절한 애니메이션과 함께 표시됨
- 라운드별 결과가 명확하게 표시됨
- 최종 게임 결과에서 통계와 랭킹이 올바르게 계산됨
- 지목 및 매칭 과정에서 익명성이 보장됨
- "패스" 옵션이 정상적으로 작동함
