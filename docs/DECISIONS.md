# Decisions

Record meaningful choices here once, with status, rationale, and alternatives.
Submission README should reference this record rather than duplicate extended rationale.

## Accepted process: finish S1 before candidate MR review

The candidate explicitly requested completing all S1 checkpoints before review, using feature-dev with candidate review at the MR stage only.
This supersedes intermediate checkpoint acceptance and per-checkpoint HTML-plan approval pauses for the already-approved S1 scope.
Continue planning, Sol implementation, verification and independent Astra review internally; preserve the approved designs and the accepted header-alignment adjustment.
Prepare the complete MR locally; external publication, merge and cleanup still require authorization.
S2-S4 remain separate slices; this instruction does not expand S1 into search persistence or transfer implementation.

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
Present a local HTML technical plan before implementation for each slice/checkpoint, following the later accepted workflow correction; routine edits within that approved plan do not require a new artifact.
Use Astra-led planning and review with explicitly selected Sol workers for approved implementation and tests; see the later workflow correction for the required HTML plan approval gate.
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

## Accepted correction: HTML technical plans and model roles

The candidate identified missing HTML technical-plan review and absent subagent delegation as defects in the first feature-dev run.
Before each implementation checkpoint, present a local HTML plan with proposed files, responsibilities, data flow, trade-offs, meaningful tests, verification and delegated ownership, then wait for explicit approval.
The candidate wants Astra to lead planning and the feature-dev workflow, and lower-cost Sol workers to build the approved plan and its tests.
This authorizes bounded delegation for the explicitly invoked feature-dev workflow; use explicit model selection rather than inheriting the lead model.
Keep plan approval, integration review, candidate explanation and acceptance with the lead.
The candidate accepted checkpoint 1 after reviewing its types, concurrency/retry behaviour and test purposes.
Checkpoint 2 remains paused until its concrete HTML technical plan is approved; no application changes have been made for it.
This correction changes the workflow, not the agreed application requirements or external-write authorization boundaries.

## Accepted: checkpoint 2 content boundary and missing-state treatment

The candidate approved HTML technical plan v1 after reviewing the proposed Dashboard/DashboardContent split and integration-test location.
Keep request-state handling in Dashboard and loaded financial content/derived values in DashboardContent, with small private card/row components where useful.
Empty accounts use No accounts to display., a zero deposit total and derived deposit count; empty transactions use No recent transactions.
On refresh failure, retain available cached values and show We couldn't refresh your dashboard. Showing previously loaded data. with Retry.
These modest additions use the existing panels; final responsive and visual verification remains checkpoint 3.

## Accepted direction: dashboard component files

The candidate accepted separate AccountCard, TransactionRow and DashboardSkeleton files in a single feature-local components folder for readability and review, even without reuse elsewhere.
Keep Dashboard responsible for request states and DashboardContent responsible for derived financial values and section composition.
The concrete extraction HTML plan still requires approval before implementation under the existing workflow.

## Accepted: header content alignment

The candidate accepted a full-width header background with its contents inside a centered 1200px container aligned with the dashboard content.
Use the supplied desktop/mobile gutters and responsive placement for navigation, segment switch, theme toggle and avatar.
This supersedes the accepted desktop Figma header's viewport-edge logo alignment for implementation; include the adjustment in the checkpoint 3 technical plan.
The direction approval does not authorize starting checkpoint 3 before its concrete plan review.

## Accepted: incremental project-local component library

Use src/components/ui for native token-based controls and src/features/dashboard/components for banking-specific compositions.
Plan v2 proposes extracting Button, SearchInput and Skeleton plus the existing dashboard's meaningful presentation responsibilities, without new dependencies or behaviour.
Treat the brief's suggested list as a coverage guide; keep simple empty copy and Pending markup local until a separate responsibility warrants extraction.
Implement header/preferences in checkpoint 3 and transfer-only components within their approved slices, using the accepted Figma designs and current requirements to shape interfaces.
The candidate explicitly approved the concrete v2 HTML plan and authorized implementation.
This broadens the earlier shared-UI-only-when-reused rule for these three named primitives; SearchInput has one current consumer, and its placement serves the candidate-requested library organization.


## Accepted S1 implementation details

The candidate authorized completing the existing S1 scope and accepted designs before MR review, with no intermediate approval pauses.
The App preference owner observes the existing customer Query cache for the default segment; local override and theme remain in memory until S2.
At 640px the accepted tablet layout keeps compact stacked accounts, shows the segment switch in the header and retains full-width search; at 1024px the desktop navigation, three-column account grid and 300px rail appear.
Use shared skeleton/content sizing to reserve the expected three-account/eight-row layout while retaining content-driven growth for longer values.
Narrow rows reserve enough space for wrapped metadata and descriptions; the Chrome verification records exact stable section geometry for the supplied fixtures.
Download Figma SVG assets locally and use their unchanged silhouettes as semantic-colour masks, preserving native 16px grid and 20px theme/plus dimensions.
The empty data favicon avoids a browser request for an absent starter asset without introducing a new visual design.

## Accepted feedback: theme action icon

The candidate pointed out that the theme icon stayed unchanged between light and dark modes.
Show the moon in light mode with Switch to dark mode, and a sun in dark mode with Switch to light mode.
The accessible name and tooltip describe the action; omit aria-pressed because this is an action button with a changing name.
Retain the downloaded moon and add a local 20px sun SVG using the same semantic-colour mask treatment; Figma was not edited.

## Accepted: S1 review configuration and preference ownership

The candidate requested props for header content and segment choices, extraction of App preference logic, and destructuring in AccountCard and Dashboard.
App supplies fixed application configuration; Header and SegmentSwitch render typed props, and avatar identity derives from the customer query.
useAppPreferences owns the in-memory override, theme and document attributes while observing the existing customer cache.
Retain the mobilePreferences composition slot to position the supplied control in loading, error and ready states without adding preference ownership to dashboard presentation.

## Accepted: composed header controls

The candidate approved reducing Header to brand, navigation, customer and controls props.
Group avatar name and initials in customer and supply HeaderControls through a ReactNode controls slot.
Header owns layout and avatar rendering; HeaderControls presents segment and theme controls, while useAppPreferences retains state ownership.
Use explicit multiline props and preserve the existing DOM structure without adding context.

## Accepted: React and composition review during slice planning

The candidate requested a focused review of current S1 and investigation of the unresolved idle skeleton issue before proceeding.
Starting with S2, every slice plan must apply the React best-practices and composition-patterns skills before implementation approval.
Assess relevant rules, state ownership, rendering boundaries and composition candidates in the existing technical plan, with concrete rationale for introducing or declining abstractions.
Use the existing implementation review and release verification to check the resulting work; no separate recurring post-S4 architecture-review stage is mandated.
This supersedes the earlier proposal for a dedicated recurring review round and does not authorize starting S2.
The discussed useHeader/container/shared-preferences design remains a candidate for review, not an approved implementation.

## Accepted: retain S1 composition and keep response handling simple

After the focused React and composition review, the candidate agreed to retain useAppPreferences and the existing Header/mobilePreferences slots without adding useHeader, context or memoization.
The candidate initially authorized response validation and mock-worker recovery, then explicitly prioritized simplicity when the recovery approach grew complex.
Keep only the response-handling correction: reject successful malformed JSON or null before caching, preserve cancellation and valid API errors, and use the existing dashboard error/Retry behavior.
Do not duplicate all response types as schemas; retain the accepted controlled typed API boundary.
Remove the attempted worker lifecycle coordinator and internal-protocol bridge, restoring the existing bootstrap and dashboard hook implementation.
Public stop/start showed an MSW registration-update race; the alternative protocol bridge introduced a maintenance dependency disproportionate to this assessment.
A stopped mock worker still requires a page refresh; Retry retries the GETs but does not repair mock interception.
General GET deadlines, automatic request replay, new UI and preference changes remain excluded.
Continue under the accepted S1 MR-only review cadence with the simplified internal plan /private/tmp/meridian-s1-recovery-plan.html, version 3.

## Accepted: S1 complete and prioritize mandatory remaining scope

The candidate approved and merged S1 on 8 November 2026 and requested a handoff for the next planned work.
After about eight hours invested, prioritize S2 search/preferences, the complete S3-S4 transfer flow, essential accessibility verification, deployment and submission documentation.
Keep the small invalid-response correction and document the mock-worker refresh limitation; defer further lifecycle repair, optional features and broad architecture or visual redesign.
The existing feature-dev S2 plan approval and React/composition assessment still apply; the user has not waived those gates or approved S2 implementation.

## Accepted: S2 technical plan v1

The candidate approved the concrete HTML plan /private/tmp/meridian-s2-technical-plan.html, version 1, and authorized local implementation.
TransactionList owns feature-local search state; useDashboard retains parallel initial reads and recent rows for immediate clear.
Use eight skeleton rows while debouncing or loading an uncached term, preserve input focus, and confine search failures and Retry to the transaction panel.
Keep same-term cached results during refresh and distinguish refresh failure from an initial search failure.
Persist explicit theme and segment choices under versioned localStorage keys; initialize HTML attributes synchronously in the document head before application startup.
Without an override, theme follows system preference at startup and segment follows customer data with retail before the response.
Handle invalid/blocked storage safely and preserve the existing hook/slots; omit live system tracking, cross-tab synchronization, context and memoization.
The required React/composition assessment is included in the approved plan and will be checked during Astra review.
Further mock-worker lifecycle work, transfer functionality, optional features and broad refactors remain excluded.

## Accepted follow-up: bidirectional Figma fidelity after S2

The candidate requested a dedicated fidelity round after S2 to align the implementation and existing Figma design file.
Reconcile in both directions: implemented UI missing in Figma belongs in Figma, and approved design details missing in the implemented scope belong in code.
Requirements and supplied tokens override either representation; future transfer designs remain assigned to S3-S4 rather than being pulled into this pass.
Use the existing feature-dev plan/design review gates for material corrections and preserve explicit publication boundaries.

## Accepted: daily-limit card stays in normal flow

The candidate explicitly chose to keep the right-hand daily-limit card scrolling with the dashboard.
The wireframe right rail does not prescribe sticky positioning, while D8 explicitly requires the fixed mobile transfer action.
Preserve this behavior during Figma/code reconciliation.

## Accepted: S2 MR first and preserve application search presentation

The candidate clarified that the S2 MR must be opened before proceeding with fidelity corrections.
They prefer the current S2 application search presentation over the older Figma search example.
Use the accepted application composition as the target for later Figma synchronization; the fidelity correction plan remains pending approval.
This does not authorize the proposed input-color correction, merge or cleanup.

## Accepted: fidelity technical plan v2

The candidate approved /private/tmp/meridian-fidelity-plan-v2.html, including listed existing-file Figma edits and the SearchInput text/placeholder token correction.
Synchronize accepted S1-S2 presentation and implemented states into Figma while keeping requirements and supplied tokens authoritative.
Retain accepted search composition, normal-flow daily-limit rail, current query/hook boundaries and existing component slots.
Use merged development including d7c0268 and approval records as the verified implementation base.
Screenshots remain outside Git; transfer work, further mock-worker repair and broad refactoring remain deferred.
