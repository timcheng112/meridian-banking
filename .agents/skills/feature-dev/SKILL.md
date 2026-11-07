---
name: feature-dev
description: Develop an explicitly requested feature with Astra-led planning, an approved HTML technical plan, Sol implementation, verification, review, understanding, and persistence. Ordinary discussion does not activate this skill.
---

# Feature development

Follow project recovery instructions and existing durable records; keep requirements authoritative and the user the decision-maker.
Use existing commands and tools, one small slice at a time, without an orchestrator or extra tracking documents.
Use Astra for the lead role: recovery, technical planning, user discussion, approvals, integration review, verification and delivery coordination.
Delegate approved implementation and its tests to lower-cost Sol workers; this is the candidate's standing authorization for this explicitly invoked workflow.
Select model overrides explicitly instead of inheriting the lead model: use the available Astra model for planning/review specialists and the available Sol model for implementation workers (currently gpt-6-astra and gpt-6.1-sol).
With Codex collaboration, use fork_turns="none" when selecting a model and supply the approved plan, relevant records, worktree, file ownership, constraints and verification commands in the worker brief.
Do not silently substitute models or claim to change the active lead model; if the required model or delegation capability is unavailable, explain the limitation and agree a fallback before implementation.
Give workers bounded, non-overlapping scope and inspect their changes and evidence; use additional exploration or independent-review agents where useful.
Keep tests and implementation together where useful, and keep approvals and explanations with the main agent.

## PLAN and DESIGN

Inspect relevant requirements, accepted engineering decisions, implementation, and designs.
For every slice plan, starting with S2, apply the installed vercel-react-best-practices and vercel-composition-patterns skills before presenting the plan for approval; read the rules relevant to the proposed work.
Include a concise React and composition assessment in the technical plan: state ownership and subscriptions, derived data/effects, async query flow, component responsibilities, and candidate composition seams.
Explain which recommendations apply, which composition changes solve a concrete problem, and which abstractions or optimizations are unnecessary; account for the React/Vite stack rather than importing unrelated framework patterns.
Keep presentation hooks, context, slots and memoization proportional to demonstrated needs; identify meaningful verification for any rendering-performance claim.
Carry the agreed assessment into implementation and verify it during the existing review gate; a separate recurring architecture-review round is not required by this process.
Propose scope, acceptance criteria, verification, exclusions, and meaningful trade-offs; discuss new engineering choices without reopening settled ones unnecessarily.
For UI changes, confirm an approved design covers the slice; propose missing or changed designs before implementation.
Before implementation for each slice/checkpoint, create and present a local HTML technical-plan artifact for explicit candidate approval.
Include requirement IDs and exclusions, exact files to create/change and their responsibilities, component/module boundaries, data flow, meaningful trade-offs, proposed missing-state designs/copy, test cases and why they matter, verification, review checkpoints, and named model roles/delegated ownership.
Link the artifact and make it reviewable before asking for approval; use diagrams or tables where they clarify the proposed code.
Keep the artifact a disposable review view of the proposal; existing STATE and DECISIONS own durable scope, choices, approval status and next action.
A roadmap, chat scope approval or approval of the previous checkpoint does not replace approval of the concrete technical plan for the next checkpoint.
Wait for explicit approval of that plan and any relevant design additions before tests, application implementation or implementation-worker dispatch; read-only planning/review delegation may happen before approval.
Record which artifact/version was approved, its scope, decisions and next action in existing project records.

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
Have Sol execute the approved plan and behavioural tests in the verified worktree; require it to stop and report consequential ambiguity or needed scope changes to the Astra lead.
Avoid duplicated rules, speculative abstractions, unnecessary dependencies, and unrelated refactoring.
Use compiler errors to improve the data model rather than weaken types; static checks do not replace runtime validation or behavioural tests.
If implementation materially changes approved scope, design or architecture, stop affected work, revise the HTML technical plan, and obtain explicit approval before resuming.

## VERIFY and AI REVIEW

Run relevant tests and project checks, then exercise loading, empty, error, boundary, and success behaviour.
Use available browser tools for responsive layout, keyboard/focus behaviour, accessibility, and console inspection.
Capture useful screenshots or recordings locally; prefer assertions for behaviour and report what remains unverified.
Review the diff for correctness, complexity, accessibility, regressions, and requirement deviations; fix findings and rerun affected checks.
The Astra lead reviews Sol's diff and verification evidence before the candidate walkthrough; worker completion alone is not checkpoint acceptance.
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
