## Task 0004: 라운드 및 질문 관리(Round & Question) 도메인 구현

### 목표

게임의 라운드 진행, 질문 관리, 시간 제어 등 게임 플로우의 핵심을 담당하는 시스템을 구축하여 원활한 게임 진행을 보장합니다.

### 작업 상세

- [x] **백엔드 (Server Actions)**

  - **스키마 정의 (`src/domains/round/schemas/`)**

    - `round-control.schema.ts`: 라운드 진행 제어 검증 (시작, 종료, 일시정지)
    - `question-selection.schema.ts`: 질문 선택 로직 검증
    - `round-timer.schema.ts`: 시간 관리 검증 (자유시간 3분, 지목시간 2분)

  - **서버 액션 구현 (`src/domains/round/actions/`)**
    - `control.action.ts`:
      - `startRound()`: 새 라운드 시작, 질문 선택, 타이머 시작
      - `endRound()`: 라운드 종료, 결과 집계, 다음 라운드 준비
      - `pauseRound()`: 라운드 일시정지 (호스트 권한)
    - `fetch.action.ts`:
      - `getCurrentRound()`: 현재 라운드 정보 조회
      - `getRoundHistory()`: 완료된 라운드 이력 조회
      - `getRoundStatus()`: 라운드 진행 상태 및 남은 시간
    - `question.action.ts`:
      - `selectQuestionForRound()`: 라운드별 적절한 질문 선택
      - `getQuestionsByCategory()`: 카테고리별 질문 목록 조회
      - `markQuestionAsUsed()`: 사용된 질문 마킹 (중복 방지)
    - `timer.action.ts`:
      - `startFreeTime()`: 3분 자유시간 시작
      - `startSelectionTime()`: 2분 지목시간 시작
      - `getRemainingTime()`: 남은 시간 조회
      - `handleTimeOut()`: 시간 초과 처리

- [x] **프론트엔드 (UI)**

  - **라운드 진행 페이지 라우트 생성**

    - `/room/[code]/round/[roundNumber]/page.tsx` (라운드 진행)
    - `/room/[code]/free-time/page.tsx` (자유시간)
    - `/room/[code]/selection/page.tsx` (지목시간)

  - **UI 컴포넌트 구현 (`src/domains/round/components/`)**

    - `round-header.tsx`: 라운드 정보 표시 (라운드 번호, 총 라운드 수)
    - `question-display.tsx`: 질문 표시 컴포넌트 (카테고리별 스타일링)
    - `round-timer.tsx`: 시간 표시 및 카운트다운 (진행 상황 표시)
    - `free-time-screen.tsx`: 자유시간 화면 (안내 메시지, 타이머)
    - `selection-screen.tsx`: 지목시간 화면 (질문 + 참가자 선택)
    - `round-progress-bar.tsx`: 라운드 진행률 표시
    - `time-warning.tsx`: 시간 경고 알림 (30초 전, 10초 전)
    - `round-navigation.tsx`: 라운드 네비게이션 (이전/다음 라운드)

  - **비즈니스 컴포넌트**
    - `round-manager.tsx`: 라운드 상태 관리 컨테이너
    - `question-selector.tsx`: 질문 선택 로직
    - `timer-controller.tsx`: 타이머 제어 로직

- [x] **질문 관리 시스템**

  - **질문 카테고리 분류**

    - `초반` (1-3라운드): 가벼운 아이스브레이킹 질문 33개
      - "첫인상이 가장 좋은 사람은?"
      - "가장 웃음이 매력적인 사람은?"
      - "함께 카페에 가고 싶은 사람은?"
    - `중반` (4-7라운드): 흥미롭고 재미있는 질문 34개
      - "여행을 함께 가고 싶은 사람은?"
      - "가장 센스가 있어 보이는 사람은?"
      - "운전을 잘할 것 같은 사람은?"
    - `후반` (8-10라운드): 조금 더 깊이 있는 질문 33개
      - "진지한 대화를 나누고 싶은 사람은?"
      - "가장 신뢰감이 느껴지는 사람은?"
      - "가족에게 소개하고 싶은 사람은?"

  - **질문 선택 로직**
    - 라운드별 적절한 카테고리에서 랜덤 선택
    - 같은 게임 내에서 질문 중복 방지
    - 질문 사용 이력 관리

- [x] **시간 관리 시스템**

  - **자유시간 (3분)**

    - 카운트다운 타이머 표시
    - 30초 전 준비 알림
    - 자유롭게 오프라인 대화 안내 메시지

  - **지목시간 (2분)**

    - 질문 표시 후 선택 시간 제공
    - 모든 참가자 선택 완료 시 조기 종료
    - 시간 초과 시 자동으로 "선택 안함" 처리

  - **시간 경고 시스템**
    - 30초 전: 준비 알림
    - 10초 전: 긴급 알림
    - 시간 초과: 자동 진행

- [x] **라운드 상태 관리**

  - **라운드 단계**

    - `waiting`: 라운드 시작 대기
    - `free_time`: 3분 자유시간 진행
    - `selection`: 지목시간 진행
    - `processing`: 결과 처리 중
    - `completed`: 라운드 완료

  - **게임 진행 제어**
    - 호스트의 라운드 제어 권한
    - 비상시 라운드 일시정지/재시작
    - 자동 진행 vs 수동 진행 옵션

### 완료 조건

- 라운드가 설정된 순서대로 자동 진행됨
- 각 라운드에서 적절한 카테고리의 질문이 표시됨
- 자유시간과 지목시간이 정확한 타이머로 관리됨
- 시간 경고 알림이 적절한 시점에 표시됨
- 모든 참가자가 선택 완료하면 조기 종료됨
- 라운드 진행 상황이 실시간으로 업데이트됨
- 호스트가 게임 진행을 제어할 수 있음
