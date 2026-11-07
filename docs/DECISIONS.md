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
Bootstrap exception: preserve the initial documentation setup on local main, then create development from that commit; subsequent implementation slices use leased worktrees.
Standalone temporary HTML design explorations do not require a worktree.

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

## Accepted: Clarity visual direction

The candidate selected Clarity from the second local dashboard prototype round.
Use bold hierarchy, crisp dividers, restrained token-based surfaces, and a structured transaction list.
Clarity must preserve the supplied wireframe structure, required responsive layouts, exact copy, and design tokens; inspiration from other apps never overrides the assignment.
Audit the existing prototype against those sources before refining it, since direction acceptance does not establish specification compliance.
This accepts the visual direction, not the complete screen designs or application implementation.
Next refine the dashboard, transfer flow, shared component states, and responsive/theme combinations before design approval.
The HTML prototypes are disposable direction-review artifacts; this record owns the selection.
The candidate confirmed that Clarity's visual style works and authorized proceeding to detailed design.
Figma will be the source of truth for reviewed screen and component designs, within the authoritative brief, wireframes and supplied tokens.
Detailed component review and acceptance happen in Figma; the HTML draft does not establish component approval.
Carry the candidate's feedback into Figma: disabled navigation should not resemble filled action buttons, and new-recipient disclosure needs controlled dialog sizing, scrolling and footer behaviour.
The detailed design package covers the responsive dashboard, three transfer steps, success, wireframe section 7 states, reusable components and all four theme/segment combinations.
The candidate explicitly authorized file creation in Figma folder 686015682 in team 979639308237463845.
The resulting Clarity design file is https://www.figma.com/design/LVZHN7v88I6WOCMr80nXlu.
This authorization covers continuing the agreed design work in that destination; application publication remains a separate approval.

## Pending slice-level choices

- Complete screen designs, component variants, and dialog implementation.
- Browser automation tooling and evidence storage/upload mechanism; Playwright is proposed, not installed or committed to yet.
- Bank input design must account for the API's 2-30-character rule as well as the brief's required constraint.

## Proposed: feedback refinements for candidate review

Keep the payee search visible but disabled when the API returns no saved payees, since T2 requires a search box and states no exception.
When saved payees exist but search has no matches, retain the active search, offer Clear search, and keep the new-recipient disclosure available.
Use a single-line optional note input with the T3 50-character counter, matching wireframe section 4; a textarea adds height without a multiline requirement.
Validation wording comes from brief section 3.3 where prescribed and local wording where permitted; API rejections additionally expose their message and field errors as required by the contract.
The mock #fail response omits the final "Try again." sentence from brief section 4, so the design retains the full prescribed generic send-error copy while preserving the server message meaning.

## Accepted: connected stepper and icon navigation

The candidate selected Stepper A and navigation N4 and explicitly requested removal of the unused alternatives.
Center each step label beneath its circle in equal-width columns, with connectors aligned to the circle centers.
Use the icon-and-underline header navigation; Cards, Payments and Insights remain disabled.
Applied these components throughout the Figma flow boards and removed B/C, N1-N3 and their comparison boards.
Keep the selected stepper's three current-step variants because they represent required progress states.
This selection does not establish full screen or application acceptance.

## Accepted scope: modern dashboard refinement

The candidate requested a softer modern finance-app direction using the supplied Monetra reference and explicitly approved refining the dashboard toward it.
Retain the assignment layout, Meridian colour and typography tokens, selected N4 navigation and centered Stepper A.
Use separate rounded account cards, stronger balance emphasis, deliberate spacing, and cohesive transaction and daily-limit surfaces.
The reference informs visual treatment; its lime palette, charts, sidebar and additional banking actions are outside this refinement.
The resulting Figma designs remain pending candidate acceptance.

## Accepted process: final research-led design attempt

The candidate rejected the resulting dashboard refinement and requested one final design attempt.
The current deliverable is reference research, a specific critique of the live Figma designs, and a cohesive visual-direction proposal for discussion.
Inspect actual rendered reference images and current desktop/mobile screenshots before proposing changes.
Do not edit Figma designs until the candidate explicitly approves the proposed direction.
After approval, prioritize desktop, adapt mobile, reuse tokens and components, and inspect rendered output in a visual QA loop.
The candidate has not accepted the alternative of designing in the browser during application implementation.
Neither the current design nor an application feature plan is approved.

## Accepted direction: research-led Clarity refinement

The candidate reiterated that brief, wireframe structure and supplied tokens take precedence over every visual reference.
Preserve section order, desktop main column and 300px daily-limit rail, mobile single column and fixed transfer action, selected navigation/stepper, exact content, and all four theme combinations.
Propose a compact, money-first consumer banking treatment: token hero gradient, differentiated type hierarchy, 16px-radius account/list surfaces, restrained borders and compact transaction grouping.
Keep the mobile accounts stacked, but compose each card internally with identity on the left and balance on the right, allowing wrapping at 360px.
Use display-size total, 22px account values, 18px section headings, 16px transaction descriptions/amounts and 14px metadata, with tabular figures and supplied weights/spacing.
Use 24px desktop and 16px mobile card padding, 24px section gaps and 8px internal text gaps; retain content-driven heights.
Borrow compact card grouping and selective emphasis from inspected Monetra imagery, and amount/metadata separation from Appetite UI's inspected light/dark finance previews.
Do not import reference navigation, charts, actions, fonts, palettes, decorative backgrounds, or reduced decimal contrast.
The candidate explicitly approved proceeding with this direction and the Figma refinement.
This authorizes the design changes and visual QA; complete-screen acceptance and application slice approval remain separate.

## Accepted correction: remove hero gradients

The candidate rejected the rendered blue and crimson gradients and explicitly requested their removal in the next session.
This supersedes the gradient treatment in the preceding direction approval.
Use flat existing token surfaces while retaining Retail/Premium identity, all four themes, prescribed content and wireframe structure.
The candidate wants to continue without another broad design exploration; the current full design remains unaccepted.
Applied solid hero-from with the existing on-hero text and brand/on-brand actions to all 18 affected compositions.
Rendered review confirmed readable values and distinct transfer actions across the existing theme and breakpoint boards; no replacement palette or layout was introduced.

## Proposed: balance hero and transfer action alternatives

The candidate requested multiple variants after rejecting the outlined button treatment.
A retains the dark hero and uses a light inverse button; B retains the brand button with a pill shape and no outline; C uses a neutral panel with the brand action.
Recommend A for clear action contrast while retaining the balance panel's segment identity.
All alternatives use existing supplied tokens; the inverse button repurposes on-hero as its fill and hero-from as its foreground without introducing colours.
Comparison starts at Figma node 34:537 and includes all four colour modes; no option has been selected or propagated.

## Accepted: hero A and consistent success alignment

The candidate selected A and authorized cleanup of B/C, superseding the preceding proposed status.
Use the light inverse action within the dark balance hero, no outline, 8px button radius and 16px hero radius.
Keep the mobile action outside the hero in brand/on-brand for contrast on the page surface.
Center the entire success message consistently, including recipient, reference and arrival copy.
These corrections do not establish full design acceptance.

## Proposed: transfer-review summary treatment

The candidate requested several alternatives to the existing flat label/value summary.
A groups all fields into a muted receipt with a total divider; B separates account and recipient cards from amount details; C uses thin row dividers and a dark total band.
All preserve From, To, Amount, Fee, Note, Total, arrival copy and explicit Confirm transfer.
Recommend B to make account and recipient identity easier to scan while keeping amounts right-aligned.
Selection and propagation remain pending; compare desktop and 360px variants on the Transfer page.
The candidate prefers exploring C with selective emphasis: semibold names/total, regular muted bank/account metadata, and regular amount/fee/note.
That hierarchy is now previewed in C; leaning toward C does not establish final selection.

## Accepted: refined review C and brand hero action

The candidate explicitly approved refined C and authorized removing A/B.
Use row dividers and the dark total band with semibold names/total, regular muted bank/account metadata, and regular amount/fee/note.
Apply the treatment to review, sending and failure states with compact token spacing where an error banner needs room.
The subsequent request for a blue hero action supersedes the inverse colour choice in hero A while retaining its 8px button radius, 16px hero radius and absent outline.
Use brand/on-brand for that action so Retail, Premium and dark themes follow the supplied semantic colour tokens.
These selections are accepted; complete-screen acceptance and application slice approval remain separate.

## Accepted: complete designs ready for feature planning

The candidate explicitly approved the complete designs on 7 November 2026 and requested the next session continue with feature-dev.
The final design includes a flat hero with brand/on-brand action, consistent success alignment and refined review C with selective text emphasis.
Earlier pending-design statements are historical; further design acceptance is needed only for materially changed or missing design scope.
Application slice plans, runtime verification and candidate understanding/acceptance of implementation remain separate gates.

## Accepted: S1 scope and incremental review

The candidate approved S1 after discussing its scope and assignment coverage.
Use the approved scope in STATE; implement one slice at a time with one MR per slice unless reviewability requires an agreed split.
Pause for candidate review at three S1 checkpoints: data/state/tests, dashboard content, and responsive presentation/verification.
Keep separate customer, accounts and transactions Query caches, with coordinated initial loading and explicit Retry of all three reads.
Disable automatic retries for these reads so errors surface promptly; preserve cached data during background refreshes and expose refresh failures.
S1 theme/segment switching is in memory; persistence and pre-paint initialization stay in S2.
Search and transfer controls remain visibly disabled until their implementing slices.
This keeps S1 reviewable without presenting unfinished actions as working behaviour.
Approval covers local implementation and commits; publication, merge, cleanup and candidate implementation acceptance remain separate.
