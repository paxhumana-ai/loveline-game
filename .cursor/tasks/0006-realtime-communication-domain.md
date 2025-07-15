## Task 0006: 실시간 통신(Realtime Communication) 도메인 구현

### 목표

WebSocket을 이용한 실시간 통신 시스템을 구축하여 참가자들의 상태 변화, 게임 진행 상황, 매칭 이벤트 등을 실시간으로 동기화합니다.

### 작업 상세

- [ ] **백엔드 (WebSocket Server)**

  - **WebSocket 서버 설정 (`src/lib/websocket/`)**

    - `server.ts`: Socket.io 서버 설정 및 초기화
    - `types.ts`: WebSocket 이벤트 타입 정의
    - `middleware.ts`: 인증 및 방 접근 권한 확인

  - **이벤트 핸들러 (`src/domains/realtime/handlers/`)**

    - `room-events.handler.ts`:
      - `join-room`: 방 입장 이벤트 처리
      - `leave-room`: 방 퇴장 이벤트 처리
      - `update-participant-status`: 참가자 상태 변경
    - `game-events.handler.ts`:
      - `game-start`: 게임 시작 이벤트
      - `round-start`: 라운드 시작 이벤트
      - `round-end`: 라운드 종료 이벤트
      - `timer-update`: 타이머 업데이트
    - `selection-events.handler.ts`:
      - `selection-made`: 지목 완료 이벤트
      - `selection-status-update`: 지목 상태 업데이트
      - `all-selections-complete`: 모든 지목 완료
    - `matching-events.handler.ts`:
      - `match-detected`: 매칭 감지 이벤트
      - `match-celebration`: 매칭 축하 이벤트

  - **방 관리 시스템 (`src/domains/realtime/room-manager/`)**
    - `room-manager.ts`: 방별 연결 관리 클래스
    - `connection-tracker.ts`: 클라이언트 연결 상태 추적
    - `room-state.ts`: 방 상태 관리 (참가자, 게임 진행 상황)

- [ ] **프론트엔드 (WebSocket Client)**

  - **WebSocket 클라이언트 설정 (`src/lib/socket/`)**

    - `client.ts`: Socket.io 클라이언트 설정
    - `hooks.ts`: React Hook으로 WebSocket 사용
    - `events.ts`: 클라이언트 이벤트 타입 정의

  - **실시간 Hook (`src/domains/realtime/hooks/`)**

    - `useGameRoom.ts`: 게임방 실시간 상태 Hook
    - `useParticipants.ts`: 참가자 목록 실시간 업데이트
    - `useRoundTimer.ts`: 라운드 타이머 실시간 동기화
    - `useSelectionStatus.ts`: 지목 상태 실시간 추적
    - `useMatchEvents.ts`: 매칭 이벤트 실시간 수신

  - **상태 동기화 컴포넌트 (`src/domains/realtime/components/`)**
    - `realtime-provider.tsx`: 실시간 통신 Context Provider
    - `connection-indicator.tsx`: 연결 상태 표시 컴포넌트
    - `sync-status.tsx`: 동기화 상태 표시
    - `participant-online-indicator.tsx`: 참가자 온라인 상태 표시

- [ ] **실시간 이벤트 시스템**

  - **방 레벨 이벤트**

    - `participant-joined`: 새 참가자 입장
    - `participant-left`: 참가자 퇴장
    - `participant-status-changed`: 참가자 상태 변경 (온라인/오프라인/일시이탈)
    - `room-settings-updated`: 방 설정 변경
    - `host-transferred`: 호스트 권한 이양

  - **게임 진행 이벤트**

    - `game-started`: 게임 시작
    - `round-started`: 라운드 시작
    - `free-time-started`: 자유시간 시작
    - `selection-time-started`: 지목시간 시작
    - `timer-tick`: 타이머 틱 (매초 업데이트)
    - `time-warning`: 시간 경고 (30초, 10초 전)
    - `round-ended`: 라운드 종료

  - **지목 및 매칭 이벤트**
    - `participant-selected`: 참가자 지목 완료
    - `selection-progress-updated`: 전체 지목 진행률 업데이트
    - `matches-announced`: 매칭 결과 발표
    - `match-celebration-started`: 매칭 축하 이벤트 시작

- [ ] **연결 관리 시스템**

  - **연결 상태 추적**

    - 클라이언트별 연결 상태 모니터링
    - 네트워크 끊김 감지 및 자동 재연결
    - 중복 연결 방지

  - **방 접근 제어**

    - 방 코드 기반 접근 권한 확인
    - 참가자 인증 및 식별
    - 비인가 접근 차단

  - **에러 처리**
    - 연결 실패 시 재시도 로직
    - 서버 에러 시 클라이언트 알림
    - 네트워크 불안정 시 대응

- [ ] **성능 최적화**

  - **이벤트 최적화**

    - 불필요한 이벤트 발송 방지
    - 이벤트 배칭 (여러 업데이트를 한 번에 전송)
    - 방별 이벤트 격리 (다른 방 이벤트 수신 방지)

  - **메모리 관리**

    - 연결 해제 시 리소스 정리
    - 방 비움 시 자동 정리
    - 메모리 누수 방지

  - **대역폭 최적화**
    - 필요한 데이터만 전송
    - JSON 압축 적용
    - 빈번한 업데이트 최적화

- [ ] **보안 및 안정성**

  - **인증 및 권한**

    - JWT 토큰 기반 인증
    - 방별 접근 권한 확인
    - 호스트 권한 검증

  - **데이터 검증**

    - 클라이언트 전송 데이터 검증
    - SQL 인젝션 방지
    - XSS 공격 방지

  - **안정성 보장**
    - 서버 재시작 시 연결 복구
    - 장애 상황 대응
    - 백업 메커니즘

- [ ] **모니터링 및 로깅**

  - **연결 모니터링**

    - 동시 접속자 수 추적
    - 방별 활성 사용자 모니터링
    - 서버 부하 모니터링

  - **이벤트 로깅**
    - 중요 이벤트 로그 기록
    - 에러 발생 시 상세 로그
    - 성능 메트릭 수집

### 완료 조건

- 참가자가 방에 입장/퇴장할 때 실시간으로 다른 참가자들에게 알림됨
- 게임 진행 상황(라운드 시작, 타이머 등)이 모든 참가자에게 동기화됨
- 참가자의 지목 완료 상태가 실시간으로 업데이트됨
- 매칭 이벤트가 즉시 모든 참가자에게 전달됨
- 네트워크 끊김 시 자동 재연결이 작동함
- 방별로 이벤트가 격리되어 다른 방 이벤트가 수신되지 않음
- 연결 상태가 UI에 명확하게 표시됨
- 서버 부하와 성능이 안정적으로 관리됨
