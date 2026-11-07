---
name: feature-dev
description: Develop an explicitly requested feature through collaborative planning, design approval, selective tests, implementation, verification, review, understanding, and persistence. Ordinary discussion does not activate this skill.
---

# Feature development

Follow project recovery instructions and existing durable records; keep requirements authoritative and the user the decision-maker.
Use existing commands and tools, one small slice at a time, without an orchestrator or extra tracking documents.
Optional delegation may cover exploration, tests/implementation, or independent review when the user requests it; give workers bounded scope and inspect their results.
Keep tests and implementation together where useful, and keep approvals and explanations with the main agent.

## PLAN and DESIGN

Inspect relevant requirements, accepted engineering decisions, implementation, and designs.
Propose scope, acceptance criteria, verification, exclusions, and meaningful trade-offs; discuss new engineering choices without reopening settled ones unnecessarily.
For UI changes, confirm an approved design covers the slice; propose missing or changed designs before implementation.
Use local HTML design variants or plan/grilling artifacts when they materially help discussion, not as duplicate authoritative records.
Wait for explicit plan and relevant design approval before tests or implementation changes.
Record approved scope, decisions, and next action in existing project records.

## BRANCH after approval

Inspect Git status, branches, worktrees, and project conventions; verify the integration base commit or an explicitly agreed alternative.
Ensure recovery documents are committed and available from that base; carry the approved slice scope into the new branch and commit its state record there before implementation.
Preserve unrelated changes; switching the main checkout is unnecessary to select a base.
Inspect Treehouse help, then acquire a durable lease using its supported non-interactive command (currently `treehouse get --lease --json`).
Check whether acquisition fetches remotely and respect project approval boundaries; use supported no-fetch mode when required.
In the returned clean worktree, create `<type>/<kebab-case-slug>` from the verified base commit, then verify path, branch, and base.
Run subsequent commands there; retain lease details locally and portable branch/base information in project state.
Reconcile leases on resumption; report acquisition failures and agree a fallback rather than inventing commands.

## TEST when appropriate

Derive behavioural scenarios from requirements and discuss consequential ambiguities.
Use selective TDD for validation, business logic, API interactions, and user-visible behaviour; confirm failures reflect missing behaviour rather than broken setup.
Do not force TDD for styling or trivial details, or test implementation structure.

## IMPLEMENT

Implement only approved scope with accepted engineering patterns, narrow types, and small reviewable changes.
Avoid duplicated rules, speculative abstractions, unnecessary dependencies, and unrelated refactoring.
Use compiler errors to improve the data model rather than weaken types; static checks do not replace runtime validation or behavioural tests.
Return to discussion if implementation materially changes approved design or architecture.

## VERIFY and AI REVIEW

Run relevant tests and project checks, then exercise loading, empty, error, boundary, and success behaviour.
Use available browser tools for responsive layout, keyboard/focus behaviour, accessibility, and console inspection.
Capture useful screenshots or recordings locally; prefer assertions for behaviour and report what remains unverified.
Review the diff for correctness, complexity, accessibility, regressions, and requirement deviations; fix findings and rerun affected checks.
Tie evidence to the reviewed revision and refresh it after relevant changes.

## DELIVERY, UNDERSTAND, and PERSIST

Prepare a concise local change/PR summary with requirements, decisions, files, verification, and evidence.
Follow project authorization rules before pushing, creating/updating PRs, uploading evidence, writing designs externally, or deploying; local preparation is not publication approval.
Allow user diff/design review and revisions; trace important data flows and identify an interview-sized modification.
Wait for explicit understanding and acceptance before marking the feature accepted.
Update existing state, decisions, and coverage evidence at meaningful checkpoints; unfinished handoffs must record phase, approved scope, pending acceptance, and next action.
Merge only with authorization and verify the accepted changes reached the integration branch.

## CLEANUP

After confirmed merge and cleanup authorization, verify all work is preserved and the worktree has no unsaved changes.
Stop only task-owned processes and return the Treehouse lease using current tool help; delete branches or artifacts only within authorized scope.
Record final status and next action; if merge or cleanup is pending, say so rather than declaring delivery complete.
