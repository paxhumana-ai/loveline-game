# workflow_state.md

_Last updated: 2025-01-21_

## Phase

ANALYZE

## Status

RUNNING

## Items

- [ ] 1. [participant] 도메인 dead code/미사용 파일 정리
  - [ ] 1-1. actions/components/schemas 내 미사용 파일/컴포넌트 탐색
  - [ ] 1-2. 불필요한 파일/코드 삭제 및 index.ts export 정리
  - [ ] 1-3. git 커밋
- [ ] 2. [participant] 도메인 엣지케이스/동시성 보완
  - [ ] 2-1. 닉네임/캐릭터 중복 체크 atomic/unique 보장(트랜잭션/DB unique 제약 확인)
  - [ ] 2-2. 재입장(temporarily_away→active) 라운드 상태별 처리(특히 selection_time 중 제한)
  - [ ] 2-3. 상태 변경 UI/서버 동기화 누락 여부 점검 및 보완
  - [ ] 2-4. git 커밋
- [ ] 3. [participant] 도메인 코드 규칙/구조 준수 점검
  - [ ] 3-1. 도메인별 index.ts, export/import 일관성 점검
  - [ ] 3-2. 불필요한 import, dead code 제거
  - [ ] 3-3. 코드 스타일 가이드(ui.rules.mdc, form-ui.rules.mdc 등) 준수 여부 점검
  - [ ] 3-4. git 커밋

## Plan

### 1. [participant] 도메인 dead code/미사용 파일 정리

- actions/components/schemas 내 파일/컴포넌트 사용처 추적
- 미사용/불필요 파일 삭제, index.ts export 정리
- git 커밋

### 2. [participant] 도메인 엣지케이스/동시성 보완

- 닉네임/캐릭터 중복 체크 로직 atomic/unique 보장(트랜잭션/DB unique 제약 확인)
- 재입장(temporarily_away→active) 라운드 상태별 처리(특히 selection_time 중 제한)
- 상태 변경 UI/서버 동기화 누락 여부 점검 및 보완
- git 커밋

### 3. [participant] 도메인 코드 규칙/구조 준수 점검

- 도메인별 index.ts, export/import 일관성 점검
- 불필요한 import, dead code 제거
- 코드 스타일 가이드(ui.rules.mdc, form-ui.rules.mdc 등) 준수 여부 점검
- git 커밋

## Log

(초기화)

## ArchiveLog

(초기화)

## Rules

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
