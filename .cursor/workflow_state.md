# workflow_state.md

_Last updated: 2025-01-21_

## Phase

VALIDATE

## Status

RUNNING

## Items

- [x] 1-1. 모든 참가자 'ready' 상태 체크 로직 구현 (서버/프론트)
- [x] 1-2. 참가자 상태 Badge UI 구현 및 테스트
- [x] 1-3. 호스트 전용 '게임 시작' 버튼 노출/활성화 구현 및 테스트
- [x] 1-4. 인증 연동/임시 currentUserId 세팅 가이드 문서화
- [x] 1-5. 상태 동기화/에러 안내 sonner toast 구현 및 테스트
- [x] 2-1. joined → ready → playing → finished 상태 Enum/로직 구현
- [x] 2-2. '준비 완료' 버튼 서버 액션/zod schema/상태 반영 구현
- [x] 2-3. 인증 미연동 시 임시 currentUserId 세팅 가이드 문서화
- [x] 2-4. useParticipantPolling 등 폴링 훅 상태 실시간 반영 구현
- [x] 3-1. 호스트만 '게임 시작' 버튼 노출/활성화 구현
  - room-settings-panel.tsx: 호스트만 버튼 노출, canStartGame 조건 활성화
- [x] 3-2. startGame 액션 정상 동작 및 상태 일괄 변경 구현
  - update.action.ts: startGame 서버 액션에서 방/참가자 상태 일괄 변경
- [x] 3-3. 상태 변경 실패/에러 발생 시 sonner toast 안내 구현
  - waiting-room.tsx, room-settings-panel.tsx: toast로 에러 안내 UX 구현
- [x] 4-1. 인증 연동/테스트 환경 currentUserId 세팅 가이드 문서화
  - waiting-room.tsx, README.md: 인증 연동/임시 세팅 가이드
- [x] 5-1. 상태 Badge, 버튼 활성화 조건, toast 안내 등 UI/UX 규칙 구현 및 테스트
  - waiting-room.tsx, participant-list.tsx, room-settings-panel.tsx: UI/UX 규칙 일관성 확인

## Plan

- 모든 단계 실제 코드/문서/UX 기준으로 일관성 있게 구현 및 점검 완료
- @/rules(server-action, db-schema, ui, form-ui, supabase-client) 규칙 명시적으로 준수

## Log

- 1-1 ~ 2-4 단계 완료: Enum/상태 전이, 서버 액션, 폴링, UI, toast 등 구현 및 점검
- 3-1 ~ 3-3 단계 완료: 호스트 전용 버튼, startGame 액션, 에러 안내 toast 구현 및 점검
- 4-1, 5-1 단계 완료: 인증 연동/임시 세팅, UI/UX 규칙 일관성 확인
- 전체 체크리스트 VALIDATE 단계 진입

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
