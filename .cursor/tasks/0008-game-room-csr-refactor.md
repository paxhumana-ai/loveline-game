## Task 0008: 게임방 CSR 구조 리팩터링 및 game-states 컴포넌트 정리

### 목표

- 게임방(`/room/[code]`)을 단일 CSR(클라이언트 사이드 렌더링) 페이지로 통합하여, 게임 상태에 따라 컴포넌트만 전환하는 구조로 리팩터링합니다.
- 기존 SSR/SSG 기반의 서브 라우트(`/free-time`, `/selection`, `/results` 등)를 제거하고, 상태 기반 UI 전환을 구현합니다.
- `/components/game-states` 폴더의 컴포넌트 중 실제로 쓸만한 것들은 `/components`로 이동하여 공통 컴포넌트로 재정비합니다.

### 작업 상세

- [ ] **CSR 기반 단일 게임방 페이지 구현**

  - `/app/room/[code]/page.tsx`에서 게임 상태(`waiting`, `free_time`, `selection_time`, `round_result`, `finished`)에 따라 컴포넌트 조건부 렌더링
  - 상태 관리는 폴링 기반(`useRoomPolling`, `useRoundPolling` 등)으로 구현
  - 기존 `/app/room/[code]/free-time/`, `/selection/`, `/results/`, `/round/` 등 서브 라우트 및 관련 페이지 삭제
  - 상태별 UI는 `domains/round/components/` 또는 `/components` 내 컴포넌트로 분리하여 import

- [ ] **game-states 컴포넌트 정리 및 이동**

  - `/components/game-states` 폴더 내 `FreeTime`, `SelectionTime`, `RoundResults`, `FinalResults` 등 실제로 재사용 가치가 있거나 UI가 우수한 컴포넌트는 `/components`로 이동
  - 이동 후 네이밍 및 props 구조를 공통 컴포넌트 스타일에 맞게 리팩터링
  - 사용되지 않는 컴포넌트/코드는 삭제

- [ ] **코드 스타일 및 PRD 준수**

  - import 경로, 네이밍, props 타입 등은 `/rules/ui.rules.mdc`, `/rules/form-ui.rules.mdc` 등 코드 스타일 가이드 준수
  - PRD(`template.prd.mdc`)의 단일 페이지, 상태 기반 UI 전환, 폴링 기반자, 이제 @0001-database-schema-setup.md 테스크를 구현해보자. 각 테스크를 워크플로우 state 메모장에 정리해서 구현을 들어갈거야.

- @/rules 의 rules에는 코드 규칙이 있기 때문에 이 규칙에 따라서 관련된 코드 규칙을 ANALZE 단계에서 조회하고 진행해줘.

- @workflow_state.md 에 위의 테스크를 쪼개서 정의하고, ANALYZE 단계부터 시작하기. state은 초기화하고 시작하자. 새로운 @workflow_state.md 를 생성하지 말고 수정해줘
- 알아서 state을 업데이트하고 state 트리거가 실행되면, 다음 phase로 자동으로 이동하기. 모든 서브테스크를 완수할 때까지 멈추지 않기.
- 각 메인테스크가 끝날때마다 깃 커밋 짧게 추가하기.
- VALIDATE 단계까지 끝날때까지 멈추지 말기. 실시간 동기화 등 요구사항 충족

### 완료 조건

- `/room/[code]` 단일 경로에서 URL 변경 없이 게임 상태에 따라 UI가 CSR로 전환됨
- 기존 SSR/SSG 서브 라우트 및 관련 dead code가 모두 제거됨
- game-states 컴포넌트 중 유용한 것들은 `/components`로 이동 및 리팩터링되어 실제로 사용됨
- 코드 스타일 및 PRD 요구사항을 모두 만족함
