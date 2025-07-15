## Task 0006: 폴링 기반 상태 관리 시스템 구현

### 목표

WebSocket이나 실시간 통신 없이 Server Actions와 폴링을 이용하여 게임방 상태, 참가자 변화, 라운드 진행 등을 관리합니다. 모든 상태 업데이트는 클라이언트가 서버에 주기적으로 요청하여 확인하는 방식으로 처리합니다.

### 작업 상세

- [ ] **백엔드 (Server Actions)**

  - **게임방 상태 Server Actions (`domains/game-room/actions/`)**

    - `status.action.ts`: 게임방 현재 상태 조회, 마지막 활동 시간 업데이트
    - `polling.action.ts`: 참가자 포함 게임방 정보 조회, 변경사항 체크

  - **참가자 관리 Server Actions (`domains/participant/actions/`)**

    - `status.action.ts`: 참가자 상태 업데이트, 온라인 상태 조회
    - `polling.action.ts`: 활성 참가자 목록 조회, 마지막 접속 시간 업데이트

  - **라운드 관리 Server Actions (`domains/round/actions/`)**
    - `status.action.ts`: 라운드 상태 조회 및 업데이트
    - `timer.action.ts`: 자유시간/선택시간 시작, 라운드 종료 처리
    - `polling.action.ts`: 타이머 포함 라운드 정보 조회, 진행상황 체크

- [ ] **프론트엔드 (폴링 시스템)**

  - **폴링 Hook (`domains/game-room/hooks/`)**

    - `useRoomPolling.ts`: 게임방 상태 주기적 조회 (5초 간격)
    - `useParticipantPolling.ts`: 참가자 목록 주기적 조회 (5초 간격)

  - **라운드 폴링 Hook (`domains/round/hooks/`)**

    - `useRoundPolling.ts`: 라운드 상태 주기적 조회 (1초 간격)
    - `useGameTimer.ts`: 클라이언트 측 타이머 관리
    - `useRoundTimer.ts`: 라운드별 타이머 (자유시간 3분, 선택시간 1분)
    - `useServerTimeSync.ts`: 서버 시간과 동기화

  - **최적화 Hook**

    - `usePollingOptimization.ts`: 백그라운드 시 폴링 중단, 에러 재시도
    - `useConnectionStatus.ts`: 네트워크 상태 감지

  - **상태 관리 컴포넌트 (`domains/game-room/components/`, `domains/round/components/`)**
    - `game-status-provider.tsx`: 게임 상태 Context Provider
    - `polling-provider.tsx`: 폴링 상태 관리 Provider
    - `polling-indicator.tsx`: 폴링 상태 표시 컴포넌트
    - `timer-display.tsx`: 타이머 표시 컴포넌트
    - `connection-status.tsx`: 연결 상태 표시 컴포넌트

- [ ] **타이머 기반 게임 진행**

  - **라운드 타이머 시스템**

    - 서버에서 라운드 시작 시간 저장
    - 클라이언트에서 서버 시간 기준으로 남은 시간 계산
    - 자유시간(3분) → 선택시간(1분) → 결과 처리 자동 진행

  - **선택 시간 관리**

    - 선택시간 1분 타이머 관리
    - 시간 초과 시 자동으로 "선택 안함" 처리
    - 1분 완료 후 모든 선택 결과 일괄 처리

  - **페이지 접속 시 상태 복구**
    - Server Action 호출로 현재 라운드 상태 확인
    - 남은 시간 계산하여 타이머 동기화
    - 진행 중인 단계에 맞는 화면 표시

- [ ] **폴링 최적화**

  - **폴링 간격 관리**

    - 게임방 상태: 5초 간격 (참가자 입장/퇴장 감지)
    - 라운드 상태: 1초 간격 (타이머 동기화)
    - 결과 조회: 라운드 종료 시점에만 조회

  - **불필요한 요청 방지**

    - 페이지가 백그라운드일 때 폴링 중단
    - 게임 종료 시 폴링 중단
    - 동일한 데이터 중복 요청 방지

  - **에러 처리**
    - 네트워크 에러 시 재시도 로직
    - 서버 에러 시 사용자 알림
    - 연결 끊김 시 자동 재연결

- [ ] **데이터베이스 스키마 확장**

  - **시간 관리 필드 추가**

    - `rounds` 테이블에 `free_time_started_at`, `selection_time_started_at` 추가
    - `game_rooms` 테이블에 `last_activity_at` 추가
    - `participants` 테이블에 `last_seen_at` 추가

  - **상태 추적**
    - 라운드별 진행 상태 (`waiting`, `free_time`, `selection_time`, `completed`)
    - 참가자별 온라인 상태 추적
    - 선택 완료 상태 추적

- [ ] **성능 최적화**

  - **Server Action 응답 최적화**

    - 필요한 데이터만 반환
    - 캐싱 전략 적용
    - 중복 요청 방지

  - **데이터베이스 최적화**

    - 폴링 쿼리 인덱스 최적화
    - 불필요한 JOIN 제거
    - 쿼리 실행 계획 최적화

  - **클라이언트 최적화**
    - 폴링 결과 캐싱
    - 변경된 데이터만 업데이트
    - 메모리 누수 방지

- [ ] **사용자 경험 개선**

  - **로딩 상태 표시**

    - 폴링 중 로딩 인디케이터
    - 데이터 업데이트 시 부드러운 전환
    - 에러 상태 시 재시도 버튼

  - **오프라인 대응**

    - 네트워크 연결 상태 표시
    - 오프라인 시 마지막 상태 유지
    - 온라인 복구 시 자동 동기화

  - **시각적 피드백**
    - 새로운 참가자 입장 시 하이라이트
    - 타이머 경고 표시 (30초, 10초 전)
    - 매칭 결과 애니메이션

### 완료 조건

- 게임방 상태가 폴링을 통해 주기적으로 업데이트됨
- 참가자 입장/퇴장이 5초 이내에 다른 참가자들에게 반영됨
- 라운드 타이머가 서버 시간과 정확히 동기화됨
- 선택시간이 1분으로 설정되고 시간 완료 후 일괄 처리됨
- 페이지 새로고침 시 현재 게임 상태가 정확히 복구됨
- 네트워크 끊김 시 자동 재연결 및 상태 동기화됨
- 폴링 최적화로 서버 부하가 최소화됨
- 사용자에게 명확한 상태 표시 및 피드백 제공됨
