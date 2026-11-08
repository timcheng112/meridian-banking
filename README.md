# Meridian Banking - Timothy Cheng

- [Live app](https://meridian-banking-one.vercel.app)
- [Figma designs](https://www.figma.com/design/LVZHN7v88I6WOCMr80nXlu/Meridian-Banking---Clarity?node-id=2-124)
- Run locally: `npm install && npm run dev` with Node 22.

Built with the supplied React, TypeScript, TanStack Query, React Hook Form, Zod and MSW stack.
The mock API runs in the browser; reloading resets the seed data as specified.

## Project structure

```text
src/
├── api/
│   # API types, requests and errors
├── components/
│   ├── layout/
│   │   # Header, theme and segment controls
│   └── ui/
│       # Shared UI components
├── features/
│   ├── dashboard/
│   │   ├── components/
│   │   │   # Components used in the dashboard
│   │   ├── Dashboard.tsx
│   │   │   # Connects data and the transfer dialog
│   │   ├── DashboardContent.tsx
│   │   │   # Arranges dashboard sections
│   │   ├── queries.ts
│   │   │   # Dashboard API requests
│   │   └── use*.ts
│   │       # Hooks for data, search and dialog controls
│   └── transfer/
│       ├── components/
│       │   # Components used in the transfer feature
│       ├── TransferDialog.tsx
│       │   # Connects the form and transfer steps
│       ├── queries.ts
│       │   # Saved-payee request
│       ├── transferSchema.ts
│       │   # Form validation rules
│       ├── transferSubmission.ts
│       │   # Builds requests and maps API field errors
│       └── use*.ts
│           # Hooks for form steps, sending and refresh
├── lib/
│   # Money and date formatting
├── mocks/
│   # Browser mock API setup
├── test/
│   # Shared test setup
└── useAppPreferences.ts
    # Theme and segment choices

docs/
├── STATE.md
│   # Progress, checks and next steps
└── DECISIONS.md
    # Choices and reasons

.github/workflows/
    # CI checks
```


Tests (`*.test.ts`, `*.test.tsx`) and feature styles sit beside the code they cover.

## Decisions and trade-offs

- **API search:** searches beyond the recent eight transactions, with a 300 ms debounce to reduce requests.
- **Native dialog:** uses the browser’s built-in modal behaviour, moves focus between steps and returns focus to the opening button.
- **Refetch after sending:** marks customer, account and transaction data as out of date and fetches it again instead of editing each cached result; this adds requests but uses the server’s latest values.
- **Keep transfers while sending:** closing the dialog keeps the current transfer so its result can be reopened and a second transfer cannot start; closing an unsent draft clears it.

More detail: [docs/DECISIONS.md](docs/DECISIONS.md).

## Loading, empty and error states

- **Dashboard loading:** reload the page to see skeleton placeholders for the balance, accounts, transactions and daily limit while data loads.
- **Payee loading:** after reloading, click New transfer to see four skeleton rows while saved payees load.
- **Search loading:** typing in transaction search shows eight skeleton rows during the short typing delay or while new results load.
- **No matches:** search for an unmatched phrase to see a message and Clear search.
- **Field errors:** enter invalid recipient details, an amount above the balance/limit or a note over 50 characters.
- **Send error:** submit with `#fail` in the note; the error appears and entered values stay available; go Back, remove `#fail` and retry.

Dashboard errors offer Retry; failed refreshes keep the last loaded data with a warning.
Empty lists and initial API failures are tested by replacing API responses within tests.
There is no debug menu; the [scenario hooks](brief/api-contract.md#test-and-demo-hooks) apply to API requests, not the page URL.

## Tests

`npm run check` runs lint, TypeScript checks and 107 Vitest tests; `npm run build` creates the production build.
GitHub Actions runs both checks.

Tests cover the three required scenarios: over-balance errors with no POST, successful transfers that update the dashboard, and a failed dashboard request that succeeds after Retry.
Additional cases cover validation, search, preferences, repeated clicks on Confirm and overlapping refresh requests.

Chrome checks covered responsive layouts, keyboard focus and all four themes with text contrast checks on selected screens.
The deployed app passed saved/new-recipient transfers, retry after failure, dashboard refresh and page reload without a local server.
Successful flows produced no console errors.

## AI use

I used OpenAI Codex for planning, design exploration, Figma work, implementation, review, testing and documentation.
I created a project [feature-dev skill](.agents/skills/feature-dev/SKILL.md) to guide development, with [AGENTS.md](AGENTS.md), [STATE.md](docs/STATE.md) and [DECISIONS.md](docs/DECISIONS.md) saving instructions, progress and decisions between sessions.

Examples of changes I requested while reviewing AI-generated code:

- [Header configuration](https://github.com/timcheng112/meridian-banking/pull/1#discussion_r4502002380): pass navigation, branding and customer details through props rather than hardcoding them in the UI.
- [Preference logic](https://github.com/timcheng112/meridian-banking/pull/1#discussion_r4502181670): extract theme/segment logic into `useAppPreferences` to keep `App` focused on arranging the page.
- [Search separation](https://github.com/timcheng112/meridian-banking/pull/2#discussion_r4502821277): move search state and result handling into `useTransactionSearch`, keeping display and input focus in the component.

## Not done / known issues

- Playwright browser tests and CI support are still planned.
- With more time, I would continue reviewing repeated code, shared components, readability and the split between UI and logic.
- Full screen-reader tests, checks in other browsers and contrast checks for icons and controls are still pending.
- If the mock worker stops responding, refresh the page; Retry fetches data again but does not restart the worker.
