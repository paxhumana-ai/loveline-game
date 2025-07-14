## Task 0003: 참가자 관리(Participant Management) 도메인 구현

### 목표

게임 참가자의 프로필, 캐릭터, MBTI 정보를 관리하고, 익명성을 보장하면서도 게임 진행에 필요한 참가자 정보를 제공하는 시스템을 구축합니다.

### 작업 상세

- [x] **백엔드 (Server Actions)**

  - **스키마 정의 (`src/domains/participant/schemas/`)**

    - `participant-profile.schema.ts`: 참가자 기본 정보 검증 (닉네임 8자 이내, 성별)
    - `character-selection.schema.ts`: 캐릭터 선택 검증 (20개 동물 캐릭터 중 선택)
    - `mbti-selection.schema.ts`: MBTI 선택 검증 (16가지 유형)
    - `participant-status.schema.ts`: 참가자 상태 변경 검증

  - **서버 액션 구현 (`src/domains/participant/actions/`)**
    - `create.action.ts`:
      - `createParticipant()`: 새 참가자 생성 및 방 입장
      - `validateNickname()`: 방 내 닉네임 중복 확인
    - `update.action.ts`:
      - `updateParticipantProfile()`: 참가자 정보 수정 (게임 시작 전에만 가능)
      - `updateParticipantStatus()`: 참가자 상태 변경 (active, temporarily_away, left)
      - `updateCharacter()`: 캐릭터 변경 (중복 확인 포함)
    - `fetch.action.ts`:
      - `getParticipantsByRoom()`: 방의 모든 참가자 조회 (익명 정보만)
      - `getParticipantProfile()`: 특정 참가자 상세 정보 조회
      - `getAvailableCharacters()`: 방 내 사용 가능한 캐릭터 목록
    - `validation.action.ts`:
      - `checkCharacterAvailability()`: 캐릭터 사용 가능 여부 확인
      - `validateParticipantCapacity()`: 성별별 정원 확인

- [x] **프론트엔드 (UI)**

  - **참가자 관리 컴포넌트 (`src/domains/participant/components/`)**

    - `participant-profile-form.tsx`: 참가자 프로필 설정 폼 (닉네임, 성별 입력)
    - `character-gallery.tsx`: 캐릭터 선택 갤러리 (그리드 레이아웃, 선택/비활성화 상태)
    - `mbti-quiz.tsx`: MBTI 선택 컴포넌트 (16가지 유형을 카테고리별로 분류)
    - `participant-avatar.tsx`: 참가자 아바타 표시 (캐릭터 + 닉네임)
    - `participant-list.tsx`: 참가자 목록 표시 (대기실용)
    - `participant-status-indicator.tsx`: 참가자 상태 표시 (온라인, 일시이탈 등)
    - `gender-balance-indicator.tsx`: 성별 균형 표시 (남성/여성 비율)

  - **비즈니스 컴포넌트**
    - `participant-manager.tsx`: 참가자 관리 로직을 담당하는 컨테이너 컴포넌트
    - `character-validator.tsx`: 캐릭터 중복 검증 로직
    - `nickname-validator.tsx`: 닉네임 중복 검증 로직

- [x] **참가자 정보 관리**

  - **익명성 보장 시스템**

    - 실명 대신 동물 캐릭터와 닉네임만 표시
    - MBTI 정보는 게임 로직에만 사용, 다른 참가자에게 비공개
    - 개인 식별 정보 최소화

  - **캐릭터 관리 시스템**

    - 20가지 동물 캐릭터 (🐶 강아지, 🐱 고양이, 🐻 곰, 🦊 여우 등)
    - 방 내에서 캐릭터 중복 방지
    - 캐릭터별 고유한 색상 및 스타일 적용

  - **상태 관리 시스템**
    - `active`: 정상 참여 중
    - `temporarily_away`: 일시적 이탈 (재입장 가능)
    - `left`: 완전 퇴장 (재입장 불가)
    - 상태 변경 시 다른 참가자들에게 알림

- [x] **데이터 검증 및 보안**

  - **입력 데이터 검증**

    - 닉네임: 한글/영문 2-8자, 특수문자 제한
    - 캐릭터: 정의된 20개 중에서만 선택 가능
    - MBTI: 정확한 16가지 유형만 허용

  - **접근 권한 제어**
    - 같은 방 참가자들만 서로의 정보 조회 가능
    - 민감한 개인정보는 참가자 본인만 조회 가능
    - 호스트는 참가자 관리 권한 보유

### 완료 조건

- 참가자가 닉네임, 성별, MBTI, 캐릭터를 설정할 수 있음
- 방 내에서 캐릭터와 닉네임 중복이 방지됨
- 참가자 상태가 실시간으로 업데이트됨
- 익명성이 보장되면서도 게임 진행에 필요한 정보가 제공됨
- 성별별 정원이 올바르게 관리됨
- 모든 데이터 입력이 안전하게 검증됨
