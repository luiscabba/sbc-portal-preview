# SBC Capital Portal Preview

Client-facing prototype of the SBC Strategic Portal. Demo data only. The site is set to noindex.

- `/` holding page with the portals
- `/officer` SBC officer console (sign in with the demo account, then the board)
- `/company` company portal (earlier screens, rebuilt in phase 2)
- `/buyer` buyer portal (earlier screens, rebuilt in phase 3)
- `/tour` guided tour of the earlier screens, relinked in phase 5

## How the rebuilt views work

Plain static HTML and JavaScript, no build step.

- `portal/data.js` is the demo data every view shares: companies in every state, buyers, investors, needs, tenders, mandates, directory requests, the agent panel and the audit log.
- `portal/store.js` keeps that data in the viewer's browser, holds the written rules (the five checks) and the four match stages, and makes every change through one set of actions that also writes the audit log. "Reset demo data" in the sidebar puts everything back.
- `portal/docs.js` draws the evidence papers in the document viewer from each company's data.
- `portal/officer.js` is the officer console. `officer.html` loads it.

Rules first: the rules run every check and match, officers confirm or request, and two different officers sign every decision. "Switch to Officer B" in the sidebar lets one person play both officers.
