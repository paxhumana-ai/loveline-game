## Task 0002: 게임방(GameRoom) 도메인 구현

### 목표

게임방 생성, 참가자 입장, 방 상태 관리 등 게임방의 핵심 기능을 구현하여 참가자들이 게임에 참여할 수 있는 기반을 마련합니다.

### 작업 상세

- [x] **백엔드 (Server Actions)**

  - **스키마 정의 (`src/domains/game-room/schemas/`)**

    - `create-room.schema.ts`: 방 생성 입력 검증 (남성/여성 정원 2-8명, 라운드 수 3-10)
    - `join-room.schema.ts`: 방 참가 입력 검증 (방 코드 6자리, 성별, MBTI, 캐릭터, 닉네임)
    - `room-settings.schema.ts`: 방 설정 변경 검증

  - **서버 액션 구현 (`src/domains/game-room/actions/`)**
    - `create.action.ts`:
      - `createGameRoom()`: 6자리 고유 코드 생성, 방 생성, 호스트를 첫 번째 참가자로 등록
    - `join.action.ts`:
      - `joinGameRoom()`: 방 존재 확인, 정원 확인, 캐릭터 중복 확인, 참가자 등록
    - `fetch.action.ts`:
      - `getGameRoomByCode()`: 방 정보와 참가자 목록 조회
      - `getGameRoomStatus()`: 방 상태 및 진행 상황 조회
    - `update.action.ts`:
      - `updateGameRoomSettings()`: 호스트만 가능한 방 설정 변경
      - `startGame()`: 모든 참가자 입장 완료 시 게임 시작
    - `leave.action.ts`:
      - `leaveGameRoom()`: 참가자 퇴장 처리 (완전 퇴장 vs 임시 퇴장)
      - `transferHost()`: 호스트 권한 이양

- [x] **프론트엔드 (UI)**

  - **게임방 페이지 라우트 생성**

    - `/create-room/page.tsx` (방 생성)
    - `/join-room/page.tsx` (방 참가)
    - `/room/[code]/page.tsx` (참가자 대기실)

  - **UI 컴포넌트 구현 (`src/domains/game-room/components/`)**

    - `create-room-form.tsx`: 방 생성 폼 (정원 설정, 라운드 수 선택)
    - `join-room-form.tsx`: 방 참가 폼 (방 코드 입력, 프로필 설정)
    - `character-selector.tsx`: 동물 캐릭터 선택 컴포넌트 (중복 방지)
    - `mbti-selector.tsx`: MBTI 16가지 선택 컴포넌트
    - `waiting-room.tsx`: 참가자 대기실 (실시간 참가자 목록, 준비 상태)
    - `participant-card.tsx`: 참가자 정보 카드 (익명 캐릭터 표시)
    - `room-settings-panel.tsx`: 호스트용 방 설정 패널
    - `game-room-header.tsx`: 방 정보 헤더 (방 코드, 참가자 수, 설정)

  - **페이지 컴포넌트 조합**
    - `/create-room/page.tsx`: `create-room-form.tsx` 조합
    - `/join-room/page.tsx`: `join-room-form.tsx` 조합
    - `/room/[code]/page.tsx`: `waiting-room.tsx`, `participant-card.tsx`, `room-settings-panel.tsx` 조합

- [x] **비즈니스 로직 처리**

  - **방 코드 생성 로직**: 중복되지 않는 6자리 영숫자 코드 생성
  - **정원 관리**: 성별별 정원 확인 및 입장 제한
  - **캐릭터 중복 방지**: 같은 방 내에서 동일 캐릭터 선택 불가
  - **호스트 권한 관리**: 방 설정 변경, 게임 시작 권한
  - **참가자 상태 관리**: active, temporarily_away, left 상태 처리

### 완료 조건

- 방 생성 시 고유한 6자리 코드가 생성됨
- 방 코드로 참가 시 정원과 캐릭터 중복이 올바르게 검증됨
- 참가자 대기실에서 실시간으로 참가자 목록이 업데이트됨
- 호스트가 방 설정을 변경하고 게임을 시작할 수 있음
- 참가자 이탈 시 적절한 상태 처리가 이루어짐
- 모든 입력값이 zod 스키마로 검증됨
