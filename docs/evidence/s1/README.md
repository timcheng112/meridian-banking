# S1 review evidence

Captured on 7 November 2026 against application revision `9945d4a03092d650f0e41526e965b39bab9940de` using the production build and Chrome.
`npm run check` passed lint, strict TypeScript and all 16 tests; `npm run build` and `git diff --check` passed.
The customer-identity assertion verifies a server-provided Maya Tan renders MT instead of the fixture-specific AC.

## Browser verification

- [Responsive measurements](results.json): 360, 390, 639, 640, 1023, 1024, 1280 and 1440px, no overflow or target-size failures, and zero measured section shifts for the supplied fixtures.
- [Interaction results](interactions.json): 53 passing assertions covering alignment, footer clearance, keyboard controls, focus, reduced motion, no persistence and Retry refetching all three reads.
- [Theme toggle results](theme-toggle-results.json): distinct moon/sun icons and Enter/Space roundtrips in both segments with no recorded console errors.

The temporary interaction script was updated to follow the theme button's changing action name after activation.
An initial run timed out on its outdated locator; the corrected run passed.
The in-app browser was unavailable; verification used the existing external Chrome harness.
These checks cover the supplied fixtures and Chrome, with cross-browser, assistive-technology and comprehensive contrast audits still pending.

## Captures

| Capture | Purpose |
| --- | --- |
| [Desktop Retail light](ready-1280.png) | Header, account grid and 300px rail |
| [Mobile Retail light](ready-390.png) | Stacked content and fixed transfer action |
| [Mobile loading](loading-390.png) | Held loading skeleton geometry |
| [Mobile initial error](error-mobile.png) | Error and Retry state |
| [Desktop Retail dark](theme-1280-Retail-dark.png) | Dark mode and sun action icon |
| [Desktop Premium light](theme-1280-Premium-light.png) | Premium token palette |
| [Mobile Premium dark](theme-390-Premium-dark.png) | Combined dark/Premium state |
| [Mobile footer clearance](footer-390.png) | Scrolled viewport with content above the fixed action |

Full-page mobile captures retain the fixed action at the original viewport edge, so it appears partway down the tall image.
The separate footer capture and interaction assertions demonstrate bottom-of-page clearance.
Search and transfer remain disabled within the approved S1 scope.
