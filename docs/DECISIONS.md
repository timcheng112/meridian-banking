# Decisions

Record meaningful choices here once, with status, rationale, and alternatives.
Submission README should reference this record rather than duplicate extended rationale.

## Accepted: lightweight project memory

The user requested AGENTS for persistent instructions, STATE for the current snapshot, and this file for decisions.
The assignment remains authoritative and the feature skill remains explicit-only.
Existing iteration-delivery and vibe-wise skills overlap but introduce different delivery records or learning conventions; a small standalone feature-dev skill fits the requested workflow.

## Accepted: branches and Treehouse

Use `main` for deployable code and `development` for integration.
Create one short-lived `feat/<kebab-case>`, `fix/<kebab-case>`, `chore/<kebab-case>`, or `docs/<kebab-case>` branch per approved slice in a leased Treehouse worktree, normally from a verified `development` commit.
An explicitly agreed alternative base supports dependent work; never infer it from whichever checkout happens to be active.
Create the branch inside the leased worktree with `git switch -c <branch> <base-commit>` because Treehouse acquisition does not select the intended feature base.
Switching the main checkout to development is unnecessary and can disturb ongoing work.
Use squash-merging accepted slices into development and promoting development to main with a merge that preserves ancestry after checks and release approval.
Alternative: branch directly from main, which reduces integration overhead for a solo assessment.
The user's two-branch preference is workable, provided deployment tracks main and promotion stays explicit.
Bootstrap exception: preserve the initial documentation setup on local main, then create development from that commit; subsequent slices use leased worktrees.

## Accepted: application boundaries

Keep the supplied React, TypeScript, Query, RHF, Zod, MSW, and Vitest stack.
Use a small App composition with dashboard and transfer feature folders, typed query/mutation functions over the existing API helper, and shared UI extracted only when reused.
Query owns customer, accounts, transactions and payees; React owns dialog/step/search/preferences; one RHF form owns transfer inputs across steps.
Derive totals and remaining limits from server data.
Search transactions through the API with a 300 ms debounce, a query key containing the term, limit=8, and a count from the response total; clearing restores the recent-transactions query immediately.
The candidate rejected local filtering because users expect search to find older transactions; both approaches are allowed by the contract.
Use a single composable validation definition with current account/limit context, blur validation, step validation, and final submission validation.
Invalidate/refetch customer, accounts and transactions after transfer success rather than manually reconstruct server changes in multiple caches.
Distinguish a successful transfer followed by refresh failure from a failed transfer to prevent accidental duplicate sending.
Use semantic native controls within small project-local components.
The dialog implementation choice remains pending design and slice planning; verify focus containment, restoration, Escape, and mobile behaviour in a real browser.
Use existing CSS tokens and a small pre-paint preference initializer; avoid routing, global stores, micro-frontends, and speculative component frameworks.
These boundaries are accepted; each implementation slice still needs its own approved plan.

## Accepted: design and delivery

Design the complete core flow before application implementation, starting with a few local HTML directions and reviewing mobile and desktop together.
Start at 390 px, check 360 px, then adapt to desktop using the required breakpoints.
After explicit external-write approval, build the chosen Figma design with reusable components, instances, and token bindings; supplied CSS tokens remain authoritative.
HTML imports alone do not establish a Figma component library.
Use optional HTML plan-review artifacts for consequential choices, not every small edit.
Use optional Sol delegation per approved slice; keep tests and implementation together where practical and optionally delegate independent review.
The main agent remains responsible for verification, review, explanation, and candidate acceptance.
Prepare PR descriptions and evidence locally; every external write requires explicit approval.
Keep worktrees until accepted work is merged and cleanup is authorized.

## Accepted: engineering guardrails

Preserve strict TypeScript and no explicit any; use unknown and narrowing at uncertain boundaries rather than assertions or suppressions to silence errors.
Infer form types from Zod, distinguishing input and transformed output; map validated data to supplied request types.
The supplied typed API client does not runtime-validate responses; retain that controlled mock boundary instead of duplicating all API types as schemas.
Keep rules and API operations separate from rendering where it clarifies responsibility, without forcing every feature component into a hook/presentation split.
Fetch independent dashboard resources together, debounce search, and keep skeleton layouts stable from the outset.
Measure production behaviour before adding prefetching, memoization, or other optimizations.
Behavioural tests, compiler checks, and browser evidence complement one another; screenshots alone do not establish correctness.

## Pending slice-level choices

- Visual direction, component variants, and dialog implementation.
- Browser automation tooling and evidence storage/upload mechanism; Playwright is proposed, not installed or committed to yet.
- Bank input design must account for the API's 2-30-character rule as well as the brief's required constraint.
