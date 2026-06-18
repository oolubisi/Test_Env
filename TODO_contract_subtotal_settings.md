# TODO: Contract Subtotal + Settings Sheet (VAT/WHT)

## 1) UI: Remove “scope” from New/Edit Project

- File: `modals.js`
- Replace:
  - `<label>Scope</label>` + `<textarea id="p_scope">`
- With:
  - `<label>Contract Subtotal</label>` + `<input id="p_contract_subtotal" type="number" step="0.01">`
- Update payload to send:
  - `contractSubtotal: Number(value) || 0`
  - remove `scope`

## 2) UI: Remove “Scope” tab from Project Console

- File: `index.html` (Project Console tabs)
- Replace Scope tab section:
  - `#seg-btn-scope` (label)
  - `#console-seg-scope` header/label
  - textarea `#c-meta-scope`
  - edit checkbox/button ids
- New section:
  - `#console-seg-contract-subtotal`
  - Display-only input/textarea or a formatted text element:
    - “Contract Subtotal” formatted as comma-delimited with 2 decimals

## 3) Project Console logic: Contract Subtotal editing

- File: `console.js`
- Remove functions:
  - `toggleScopeEdit`
  - `saveProjectScope`
- Replace with:
  - `toggleContractSubtotalEdit`
  - `saveProjectContractSubtotal`
- Replace `loadProjectConsoleHub` usage:
  - `proj.scope` -> `proj.contractSubtotal`

## 4) Backend schema + persistence

- File: `code.gs`
- Update `SHEET_SCHEMAS.Projects`:
  - remove `scope`
  - add `contractSubtotal`
- Update:
  - `saveProject` to write `contractSubtotal`
  - `updateProject` to write `contractSubtotal`
  - `updateProjectScope` to be replaced by e.g. `updateProjectContractSubtotal`
- Update `doPost` action routing:
  - remove `updateProjectScope`
  - add `updateProjectContractSubtotal`

## 5) Google Sheets “settings” tab structure (template-only)

- File: `code.gs`
- Create/ensure a `settings` sheet (or `Settings`) with columns/cells:
  - VAT (7.5%)
  - WHT (5%)
- Implement `ensureSheet('settings')` integration:
  - add a schema and an ensure step that writes defaults if empty

## 6) Update frontend-to-backend action names

- File: `console.js` (callApi action name)
- Ensure payload keys match backend:
  - `contractSubtotal`

## 7) Build/consistency

- File: `app.bundle.js` may be a build artifact
- If repo uses bundling, regenerate or ensure runtime uses updated modules:
  - `index.html` loads `app.bundle.js`
  - ensure `app.bundle.js` matches updated sources (or switch `index.html` to `type="module"` sourcing)
