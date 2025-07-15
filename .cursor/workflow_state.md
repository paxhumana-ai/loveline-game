# workflow_state.md

_Last updated: 2025-01-21_

## Phase

CONSTRUCT

## Status

RUNNING

## Items

- [ ] **1. CSR 기반 단일 게임방 페이지 구현**

  - [x] 1-1. `/app/room/[code]/page.tsx`를 CSR 구조로 전환 (Client Wrapper/Provider 적용)
  - [x] 1-2. `GameStateProvider`, `GameStatusProvider`, `GameProgressManager` 등 Context/Provider로 상태 관리 통합
  - [x] 1-3. 폴링 기반 상태 동기화(`useRoomPolling`, `useRoundPolling`) 적용
  - [x] 1-4. 상태별 UI(대기실, 자유시간, 지목, 결과, 최종결과) 컴포넌트 조건부 렌더링
  - [ ] 1-5. 기존 `/app/room/[code]/free-time/`, `/selection/`, `/results/`, `/round/` 등 서브 라우트 및 내부 page.tsx 삭제

- [ ] **2. game-states 컴포넌트 정리 및 이동**

  - [x] 2-1. `/components/game-states/` 내 주요 컴포넌트(`free-time.tsx`, `selection-time.tsx`, `round-results.tsx`, `final-results.tsx`)를 `/components/`로 이동
  - [x] 2-2. 네이밍/props 구조를 공통 스타일에 맞게 리팩터링 (props 타입, 네이밍, export 등)
  - [x] 2-3. 미사용/불필요 컴포넌트 및 dead code 삭제

- [ ] **3. 코드 스타일 및 PRD 준수**
  - [ ] 3-1. import 경로, 네이밍, props 타입 등 `/rules/ui.rules.mdc`, `/rules/form-ui.rules.mdc` 등 코드 스타일 가이드 준수 여부 점검
  - [ ] 3-2. PRD(`template.prd.mdc`)의 단일 페이지, 상태 기반 UI 전환, 폴링 기반 실시간 동기화 등 요구사항 충족 여부 점검

## Plan

### 1. CSR 기반 단일 게임방 페이지 구현

- `/app/room/[code]/page.tsx`:
  - 기존 SSR 구조 → Client Wrapper(`"use client"`), GameStateProvider, GameStatusProvider, GameProgressManager로 감싸기
  - 폴링 훅(`useRoomPolling`, `useRoundPolling`)으로 실시간 상태 동기화
  - 상태별로 아래 컴포넌트 조건부 렌더링
    - `WaitingRoom` (대기실)
    - `FreeTime` (자유시간)
    - `SelectionTime` (지목)
    - `RoundResults` (라운드 결과)
    - `FinalResults` (최종 결과)
  - 기존 `/free-time/`, `/selection/`, `/results/`, `/round/` 등 하위 라우트 및 내부 page.tsx 삭제

### 2. game-states 컴포넌트 정리 및 이동

- `/components/game-states/` 내 주요 컴포넌트:
  - `free-time.tsx` → `/components/FreeTime.tsx`
  - `selection-time.tsx` → `/components/SelectionTime.tsx`
  - `round-results.tsx` → `/components/RoundResults.tsx`
  - `final-results.tsx` → `/components/FinalResults.tsx`
- props 타입, 네이밍, export 방식 등 공통 스타일로 리팩터링
- 미사용/불필요 컴포넌트 및 dead code 삭제

### 3. 코드 스타일 및 PRD 준수

- `/rules/ui.rules.mdc`, `/rules/form-ui.rules.mdc` 등 코드 스타일 가이드 준수
- PRD(`template.prd.mdc`)의 단일 페이지, 상태 기반 UI 전환, 폴링 기반 실시간 동기화 등 요구사항 충족 여부 점검
- 최종적으로 전체 구조/코드가 PRD와 규칙에 부합하는지 VALIDATE 단계에서 검증

## Log

- PHASE: BLUEPRINT 진입. 세부 작업 분해 및 pseudocode/파일 diff 설계 완료.
- PHASE: CONSTRUCT 진입. 1-1 CSR 구조 전환부터 구현 시작.
- 1-2~1-4, 2-1~2-3 완료. 상태 기반 단일 게임방 페이지 구현 및 game-states dead code 정리.

## ArchiveLog

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
