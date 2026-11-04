# SBC Capital Portal Preview

Client-facing prototype of the SBC Strategic Portal. Demo data only. The site is set to noindex.

- `/` holding page with the portals
- `/officer` SBC officer console (sign in with the demo account, then the board)
- `/company` company portal (opens as Orrin Labs; "Demo account" in the sidebar switches company or registers a new one)
- `/buyer` buyer portal (opens as Abu Dhabi water utility; "Demo account" switches between the 7 demo buyers)
- `/tour` guided tour of the earlier screens, relinked in phase 5

## How the rebuilt views work

Plain static HTML and JavaScript, no build step.

- `portal/data.js` is the demo data every view shares: companies in every state, buyers, investors, needs, tenders, mandates, directory requests, the agent panel and the audit log.
- `portal/store.js` keeps that data in the viewer's browser, holds the written rules (the five checks) and the four match stages, and makes every change through one set of actions that also writes the audit log. "Reset demo data" in the sidebar puts everything back.
- `portal/docs.js` draws the evidence papers in the document viewer from each company's data.
- `portal/officer.js` is the officer console. `officer.html` loads it.
- `portal/company.js` is the company portal. `company.html` loads it.
- `portal/buyer.js` and `portal/buyer.css` are the buyer portal. `buyer.html` loads them.

The views share one copy of the data per browser. Open the officer console, the company portal and the buyer portal in separate tabs and a change in one shows in the others. A buyer sees a company's name only after two officers approve the introduction and the company accepts it.

Rules first: the rules run every check and match, officers confirm or request, and two different officers sign every decision. "Switch to Officer B" in the sidebar lets one person play both officers.
