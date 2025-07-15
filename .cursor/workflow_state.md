# workflow_state.md

_Last updated: 2025-01-21_

## Phase

CONSTRUCT

## Status

RUNNING

## Items

- [ ] **1. [공통] 게임 시작 체크리스트 요구사항 분석 및 설계**

  - [x] 1-1. 모든 참가자 '준비 완료' 조건 분석 및 pseudocode 설계
  - [x] 1-2. 참가자 상태 UI/UX 표시 규칙 pseudocode 설계
  - [x] 1-3. 호스트 전용 '게임 시작' 버튼 활성화 조건 pseudocode 설계
  - [x] 1-4. 인증 연동/임시 ID 세팅 UX pseudocode 설계
  - [x] 1-5. 상태 동기화/에러 안내 UX pseudocode 설계

- [ ] **2. [participant] 참가자 상태 전이 및 UI/UX 설계**

  - [x] 2-1. joined → ready → playing → finished 상태 전이 흐름 pseudocode 설계
  - [x] 2-2. '준비 완료' 버튼 동작 및 서버 반영 pseudocode 설계
  - [x] 2-3. 인증 미연동 시 임시 currentUserId 세팅 가이드 pseudocode 설계
  - [x] 2-4. 폴링/구독 방식의 상태 실시간 반영 pseudocode 설계

- [ ] **3. [game-room] 게임 시작 버튼 및 상태 일괄 변경 설계**

  - [x] 3-1. 호스트만 '게임 시작' 버튼 노출/활성화 조건 pseudocode 설계
  - [x] 3-2. startGame 액션 정상 동작 및 상태 일괄 변경 pseudocode 설계
  - [x] 3-3. 상태 변경 실패/에러 발생 시 sonner toast 안내 pseudocode 설계

- [ ] **4. [auth] 인증 연동 및 테스트 환경 가이드 설계**

  - [x] 4-1. currentUserId 인증 연동 로직 pseudocode 설계
  - [x] 4-2. 임시 currentUserId 세팅 가이드 pseudocode 설계

- [ ] **5. [ui] 상태 Badge/버튼 활성화/에러 안내 UI/UX 설계**
  - [x] 5-1. 참가자 상태 Badge 등 UI 표시 규칙 pseudocode 설계
  - [x] 5-2. 버튼 활성화/비활성화 조건 UI/UX 규칙 pseudocode 설계
  - [x] 5-3. sonner toast 에러/상태 안내 규칙 pseudocode 설계

## Plan

### 1. [공통] 게임 시작 체크리스트 요구사항 설계

- 모든 참가자가 'ready' 상태일 때만 게임 시작 가능 (서버/프론트 모두 체크)
- 참가자 상태는 UI에서 Badge 등으로 명확히 표시
- 호스트만 '게임 시작' 버튼 노출, 조건 충족 시 활성화
- 인증 연동이 안 된 경우 임시 currentUserId 세팅 가이드 제공
- 상태 동기화/에러 안내는 sonner toast 등으로 즉시 안내

### 2. [participant] 참가자 상태 전이 및 UI/UX 설계

- 상태 Enum: joined → ready → playing → finished
- '준비 완료' 버튼 클릭 시 서버 액션으로 상태 변경, zod schema로 검증
- 인증 미연동 시 currentUserId를 임시로 세팅할 수 있도록 개발 가이드 제공
- useParticipantPolling 등 폴링 훅으로 상태 실시간 반영

### 3. [game-room] 게임 시작 버튼 및 상태 일괄 변경 설계

- 호스트만 '게임 시작' 버튼 노출, canStartGame 조건(모두 ready) 충족 시 활성화
- startGame 서버 액션: 방 상태 waiting → in_progress, 참가자 ready → playing 일괄 변경
- 상태 변경 실패/에러 발생 시 sonner toast로 안내

### 4. [auth] 인증 연동 및 테스트 환경 가이드 설계

- supabase client(server/client)로 currentUserId 연동
- 인증 미연동 시 임시 currentUserId 세팅 가이드 문서화

### 5. [ui] 상태 Badge/버튼 활성화/에러 안내 UI/UX 설계

- 참가자 상태 Badge 등 UI 표시: shadcn, semantic class 사용
- 버튼 활성화/비활성화 조건: UI/UX 규칙에 맞게 구현
- 에러/상태 변경 시 sonner toast로 즉시 안내

## Log

- [BLUEPRINT] 각 도메인별로 pseudocode, 파일/컴포넌트/액션별 diff outline 설계 완료. CONSTRUCT 단계로 진입.

## Rules NEVER REMOVE THIS SECTION!

> **Keep every major section under an explicit H2 (`##`) heading so the agent can locate them unambiguously.**

### [PHASE: ANALYZE]

1.  Read **project_config.mdc**, relevant code & docs.
    - IF task relavant to revising db schema, then read `docs/db-schema.rules.mdc`
    - IF task relavant to connecting to supabase auth, storage, realtime, then read `docs/supabase-client.rules.mdc`
    - IF task relavant to defining server action, then read `docs/server-aciton.rules.mdc`
    - IF task relavant to building frontend ui, then read `docs/ui.rules.mdc`
    - IF task relavant to supabase building form ui, then read `docs/form-ui.rules.mdc`
2.  Summarize requirements. _No code or planning._

### [PHASE: BLUEPRINT]

1.  Decompose task into ordered steps and write task sub items under **## Items**. Sub task items should be split enough to commit. NOT TOO SMALL.
2.  Write pseudocode or file-level diff outline under **## Plan**. Pseudocode must follow relavant rules which we read at PHASE: ANALYE.
3.  Set `Status = RUNNING` and begin implementation.

### [PHASE: CONSTRUCT]

1.  Follow the approved **## Plan** exactly.
2.  After each atomic change:
    - run test / linter commands specified in `project_config.md`
    - capture tool output in **## Log**
3.  On success of all steps, set `Phase = VALIDATE`.
4.  Trigger **RULE_SUMMARY_01** when applicable.
5.  Check git status and commit with compact message.

### [PHASE: VALIDATE]

1.  Rerun full test suite & any E2E checks.
2.  If clean, set `Status = COMPLETED`.
3.  Check git status and commit with compact message.
4.  Trigger **RULE_ITERATE_01** when applicable.
5.  Trigger **RULE_SUMMARY_01** when applicable.

---

### RULE_INIT_01

Trigger ▶ `Phase == INIT`
Action ▶ Ask user for first high-level task → `Phase = ANALYZE, Status = RUNNING`.

### RULE_ITERATE_01

Trigger ▶ `Status == COMPLETED && Items contains unprocessed rows`
Action ▶

1.  Set `CurrentItem` to next unprocessed row in **## Items**.
2.  Clear **## Log**, reset `Phase = ANALYzE, Status = RUNNING`.

### RULE_LOG_ROTATE_01

Trigger ▶ `length(## Log) > 5 000 chars`
Action ▶ Summarise the top 5 findings from **## Log** into **## ArchiveLog**, then clear **## Log**.

### RULE_SUMMARY_01

Trigger ▶ `Phase == VALIDATE && Status == COMPLETED`
Action ▶

1.  Read `/docs/project_config.md`.
2.  Construct the new changelog line: `- <One-sentence summary of completed work>`.
3.  Find the `## Changelog` in `/docs/project_config.md`.
4.  Insert the new changelog line immediately after the `## Changelog` heading and its following newline (making it the new first item in the list).

---
