# Project guidance

Build the smallest complete assessment application that the candidate can explain and modify independently.
The candidate approves feature plans and confirms understanding before acceptance.

## Mandatory recovery on every new session

1. Read this file, `docs/STATE.md`, and `docs/DECISIONS.md` before proposing or changing work.
2. Inspect `git status --short`, `git branch -av`, `git worktree list`, and recent commits; establish the active branch/worktree and reconcile them with STATE, using `treehouse status --json` when a lease needs recovery (it may initialize local files; if blocked, report lease status as unverified).
3. Read `README.md` and the relevant sections of `brief/candidate-brief.md`, `brief/api-contract.md`, `wireframes/wireframe.md`, and `brief/design-tokens.css`.
4. Inspect the relevant source, tests, package scripts, and runtime configuration; verify recorded evidence still applies to the current revision.
5. State what is implemented, what is verified, pending decisions, and the next safe action before continuing.
If records disagree with the repository, report the discrepancy and correct the snapshot at the next checkpoint.
Never depend on previous chat history to recover an approved scope.

## Ownership and working rules

- Assignment files own requirements; reference their IDs rather than copying them.
- Source and tests own implemented behaviour; STATE owns the current snapshot, verification, approved active scope, and next steps.
- DECISIONS owns meaningful choices, alternatives, rationale, and proposal/accepted status.
- Keep these records concise, public-safe, and current at meaningful checkpoints and handoffs, including unfinished work.
- Do not edit supplied mocks, seed data, generated files, or CHANGELOG.md.
- Preserve strict types, token-based styling, accessibility, responsive behaviour, and one definition per validation rule.
- Use the explicit `$feature-dev` skill for requested feature development; ordinary discussions do not activate it.
- Follow the accepted branch workflow in DECISIONS; inspect Treehouse help before acquiring a worktree and verify its base explicitly.
- Obtain explicit user approval before anything leaves local: pushes, PR creation/updates, evidence uploads, deployment, Figma writes, or other external submissions.
- Prepare review materials locally first; also obtain authorization for merges and worktree cleanup.
- Requirements override engineering preferences; read accepted decisions before proposing new patterns.
- Use plain hyphens, one complete sentence per physical line in long Markdown, and no agent commit co-authors.
