# Work Orders Removal (frontend) — TODO

## 1) Update UI

- [ ] `index.html`: remove Work Orders segment button
- [ ] `index.html`: remove `console-seg-workorders` tab/window and its “+ New Work Order” button

## 2) Update segment routing + listings

- [ ] `console.js`: remove Work Orders segment handling in `switchConsoleSegment()`
- [ ] `console.js`: remove `loadWorkOrdersListings()` implementation

## 3) Update modal flows

- [ ] `modals.js`: remove the entire `type === "workorder"` modal implementation (UI + save flow)

## 4) Update sync/refresh + API wiring

- [ ] `api.js`: remove `loadWorkOrdersListings` import
- [ ] `api.js`: remove `getWorkOrders` refresh calls
- [ ] `api.js`: remove queued sync reload for work orders

## 5) Patch bundle entrypoint for consistency

- [ ] `app.bundle.js`: remove Work Orders segment button/window and all Work Orders wiring to avoid runtime errors
- [ ] `app.bundle.js`: remove modal workorder handler and any `getWorkOrders` calls

## 6) Sanity check

- [ ] App loads without errors
- [ ] Console segment list no longer includes “Work Orders”
- [ ] Switching segments doesn’t throw
- [ ] Sync/Refresh doesn’t call `getWorkOrders`

## 7) Mark completion

- [ ] Update `TODO.md` checkboxes for “Remove Work Orders tab/pages”
