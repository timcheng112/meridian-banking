# Current state

## Snapshot and recovery

Deadline: 10 November 2026, EOD, supplied by the candidate.
The application remains the starter health-check screen; no assessment features or approved visual designs exist.
Active scope: local setup only, including documentation consolidation, skill evaluation, branch bootstrap, and runtime baseline.
The setup checkpoint is preserved on local main and development; inspect current Git refs and cleanliness on recovery.
No feature worktree lease or external publication is authorized or active.
Accepted choices are in DECISIONS; follow AGENTS recovery before continuing.

## Roadmap

| Stage | Scope | Status / next action |
| --- | --- | --- |
| Setup | Durable records, skill, branches, Node 22 baseline | Complete; verification below |
| Design | Local HTML directions, selected core flow, mobile/desktop, states and shared components | Next after setup; discuss direction, then prepare local prototypes |
| Figma | Approved core designs using components and supplied tokens | Requires explicit approval before external writes |
| S1 | Dashboard parallel reads, total/accounts/eight transactions, skeletons, error/retry | Pending design and slice plan approval |
| S2 | API search, responsive dashboard, persistent theme/segment | Pending; responsive/accessibility work also belongs within S1 |
| S3 | Accessible transfer dialog, recipient/amount/review, shared validation | Pending |
| S4 | Transfer mutation, failures, success and dashboard refresh | Pending |
| Release | Full requirement audit, production checks, submission README, deployment | Pending; publication requires approval |

Each slice uses feature-dev for technical planning and approval before implementation.
Acceptance requires candidate understanding; verification alone does not mark a slice accepted.

## Coverage and evidence index

References point to authoritative requirements rather than duplicating acceptance text.
All application coverage is pending unless current evidence explicitly says otherwise.
Evidence must identify the checked revision; changes invalidate affected checks.

| Requirement/source | Owner | Planned evidence | Status |
| --- | --- | --- | --- |
| D1-D5 | S1 | Behavioural tests plus loading/layout browser checks | Pending |
| D6 | S2 | API search, debounce, count, older match, clear/no-match tests | Pending |
| D7; E4 dashboard retry | S1 | Failure then Retry integration test | Pending |
| D8; brief §5 | S1-S3 | 360/390 px, breakpoint/desktop, overflow and tap-target checks | Pending |
| T1; T8 | S3-S4 | Keyboard, focus restoration, labels/errors/live announcements | Pending |
| T2-T4; brief §3.3 | S3 | Form boundaries, new/saved recipient, step preservation and focus tests | Pending |
| T5-T7; E4 transfer cases | S4 | Over-balance/no request, success refresh, failure, duplicate-submit tests | Pending |
| TH1-TH3; tokens | S2 | Four theme combinations, persistence/pre-paint, contrast/focus checks | Pending |
| E1-E3 | All slices | Typecheck, boundary review, state/schema ownership review | Pending implementation |
| E5 | Every slice, release | npm run check, build, browser console | Starter baseline passed; repeat for implemented slices |
| E6; DEPLOYMENT.md | Release | HTTPS deployment, worker, transfer/refresh without local server | Pending |
| brief §4; wireframes §1-7 | Design, all slices | Exact copy/formatters, required screens and states review | Pending |
| API contract requests/errors/hooks | S1-S4 | Typed requests, server field errors, no POST retries, refetch-failure separation | Pending |
| README §5 | Release | Submission README sections, AI-use examples, repository/deployed URLs | Pending |

Optional features stay deferred until mandatory criteria are satisfied.
Final audit must expand grouped rows against each referenced requirement and re-run evidence against the release revision.

## Verification and limitations

- Independent read-only recovery and five-scenario skill eval passed: missing approvals, approved delegation, local PR preparation, pre-merge cleanup, and interrupted handoff.
- Eval findings addressed: account for Treehouse status initialization and place slice approval records on the new feature branch.
- Starter tests cover health connectivity and formatters, not assessment acceptance flows.
- Dependencies installed from the local npm cache; no dependency or lockfile edits intended.
- Node 22.23.4 installed through Volta with approval; this changes the local Volta default.
- npm ci --offline, npm run check (lint/typecheck/3 starter tests), and npm run build passed on Node 22.23.4 against unchanged starter application revision bb9a6fe.
- The broken Homebrew Node 22 installation was not repaired.
- Skill frontmatter and explicit-only metadata passed Ruby YAML validation; bundled Python validator remains unavailable without PyYAML.
- The skill is 67 lines; no evaluator scripts or additional documentation files were added.
- Fresh-session skill discovery, Treehouse allocation, browser automation, and deployed behaviour remain untested.

## Next safe action

Discuss visual direction and local design preview scope; use the roadmap above to resume.
No application feature plan is approved.
