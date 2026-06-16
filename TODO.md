# TODO - FieldScan Pro (Test_Env)

## 1) PWA/Offline completeness checks (already done earlier)

- [x] Update `manifest.json` icons
- [x] Update `sw.js` cache version and precache list

## 2) Project Accounts / VAT/WHT settings + fixed calculations after project close

- [x] Add “Accounts” menu (top-level) and move Payments summary UI into it
- [x] Create new Settings sheet UI (VAT 7.5% + WHT 5%) and ensure values are used for calculations
- [x] Ensure all currency fields are rounded to 2 decimals everywhere totals are computed (via `round2` + `moneyValue2`)
- [x] Add “Contract Subtotal / VAT / Contract Value / WHT” inputs and the expanded totals:
  - Total of Client Receipts
  - Total Outgoing
  - Small Expenses
  - Pending Payments
  - Balance Expected = Contract Value - WHT
  - Net Profit = Contract Value - WHT - Total Outgoing
- [x] Implement “closed project immutability”:
  - Once `projectStatus` is marked closed (`projectStatus !== 'Active' && projectStatus !== 'In Planning'`), lock all these Accounts fields as read-only
  - Snapshot VAT/WHT inputs on close so later Settings edits do not change computed values

## 3) Remove Work Orders tab/pages

- [ ] Remove “Work Orders” segment button from project console UI
- [ ] Remove Work Orders console segment content + listings rendering
- [ ] Remove Work Order modal(s) and related save/update flows from frontend
- [ ] Remove calls/loading for work orders from `api.js` and refresh flows
- [ ] Remove backend endpoints/actions for work orders (or leave but unused—confirm desired behavior)

## 4) Reports overhaul

- [ ] Replace/extend `reports.js` templates with the required report types:
  - A4 financial report for all projects (shared via WhatsApp, email, or saved)
  - Financial report for selected project
  - Financial report for selected client
  - Financial report for selected vendor
  - Project Scope report for selected project (include project + client header)
  - Snags report for selected project (2 columns x 3 rows per page; header with client + project)
  - Progress report for selected project
  - Take-off report for selected project
- [ ] Ensure printing/PDF generation outputs A4 layout
- [ ] Implement sharing actions:
  - Save PDF to device
  - Share via WhatsApp
  - Share via email
- [ ] Update UI flow in `index.html` for report selection and generation

## 5) Thorough testing (required)

- [ ] Offline install + upgrade test (sw cache v8)
- [ ] Offline fallback navigation test
- [ ] UI walkthrough: Dashboard → Vendors → Accounts → Reports → Console segments
- [ ] Report generation for every report type (selected project/client/vendor)
- [ ] Closed-project locking test: verify values remain fixed even if settings VAT/WHT change
- [ ] Ensure Work Orders tab/pages are completely removed and no errors remain
