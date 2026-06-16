import { escapeHtml, escapeAttr } from "./utils.js";
import { callApi, getCache, setCache, getCurrentProjectId } from "./api.js";
import { round2, moneyValue2 } from "./utils.js";
import {
  openClosedProjectLocksDB,
  getClosedProjectLock,
  upsertClosedProjectLock,
} from "./db.js";

function getClosedStatus(projectStatus) {
  // Closed = anything except Active + In Planning
  return projectStatus !== "Active" && projectStatus !== "In Planning";
}

export function setupAccountsPage() {
  const pSel = document.getElementById("accounts-project-sel");
  if (pSel) {
    pSel.addEventListener("change", () => renderAccountsForSelectedProject());
  }
  const vatInput = document.getElementById("accounts-settings-vat");
  const whtInput = document.getElementById("accounts-settings-wht");
  const subtotalInput = document.getElementById("accounts-contract-subtotal");

  if (vatInput)
    vatInput.addEventListener("input", () => renderAccountsComputed(false));
  if (whtInput)
    whtInput.addEventListener("input", () => renderAccountsComputed(false));
  if (subtotalInput)
    subtotalInput.addEventListener("input", () =>
      renderAccountsComputed(false),
    );
}

export async function initAccountsEngine() {
  let cache = getCache();
  // Ensure projects exist before we try to populate dropdown / compute totals
  if (!cache.projects || !cache.projects.length) {
    try {
      const items = await callApi("getProjects", {});
      cache = getCache();
      setCache({ ...cache, projects: items || [] });
    } catch (e) {
      // Keep UI empty; offline mode will rely on cached projects (if any)
      cache = getCache();
    }
  }

  const projects = (getCache().projects || []).filter(Boolean);
  const pSel = document.getElementById("accounts-project-sel");
  if (pSel) {
    pSel.innerHTML =
      '<option value="">-- Select Project --</option>' +
      projects
        .map(
          (p) =>
            `<option value="${escapeAttr(p.projectId)}">${escapeHtml(p.clientName)} (${escapeAttr(p.projectId)})</option>`,
        )
        .join("");
  }

  setupAccountsPage();

  // If we have projects and dropdown is empty selection, auto-pick first one
  if (pSel && !pSel.value && projects.length) {
    pSel.value = projects[0].projectId;
  }

  await renderAccountsForSelectedProject();
}

export function renderAccountsForSelectedProject() {
  const cache = getCache();
  const pSel = document.getElementById("accounts-project-sel");
  const projectId = pSel ? pSel.value : getCurrentProjectId();

  if (!projectId) {
    setAccountsEmptyState();
    return;
  }

  const project = (cache.projects || []).find((p) => p.projectId === projectId);
  if (!project) {
    setAccountsEmptyState();
    return;
  }

  // Populate VAT/WHT inputs with current settings (editable unless locked)
  // Default settings: VAT 7.5%, WHT 5%
  // If there's a locked snapshot for closed project, use it and lock inputs.
  return (async () => {
    const closed = getClosedStatus(project.projectStatus);
    const lock = closed ? await getClosedProjectLock(projectId) : null;

    const vatInput = document.getElementById("accounts-settings-vat");
    const whtInput = document.getElementById("accounts-settings-wht");
    const subtotalInput = document.getElementById("accounts-contract-subtotal");

    const vatPct = lock?.vatPct ?? 7.5;
    const whtPct = lock?.whtPct ?? 5;

    // subtotal snapshot stored only when locked; otherwise derive from local editable input
    if (vatInput) {
      vatInput.value = String(vatPct);
      vatInput.readOnly = !!lock;
      vatInput.disabled = !!lock;
      vatInput.style.background = lock ? "#f5f5f5" : "";
    }
    if (whtInput) {
      whtInput.value = String(whtPct);
      whtInput.readOnly = !!lock;
      whtInput.disabled = !!lock;
      whtInput.style.background = lock ? "#f5f5f5" : "";
    }

    const subtotalDefault =
      lock?.subtotal ??
      (subtotalInput ? String(subtotalInput.value || 0) : "0");
    if (subtotalInput) {
      subtotalInput.value = String(subtotalDefault);
      subtotalInput.readOnly = !!lock;
      subtotalInput.disabled = !!lock;
      subtotalInput.style.background = lock ? "#f5f5f5" : "";
    }

    await renderAccountsComputed(true, lock);
  })();
}

function setAccountsEmptyState() {
  const keys = [
    "accounts-contract-vat",
    "accounts-contract-value",
    "accounts-wht",
    "accounts-client-receipts",
    "accounts-outgoing",
    "accounts-small-expenses",
    "accounts-pending-payments",
    "accounts-balance-expected",
    "accounts-net-profit",
  ];
  keys.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "₦0.00";
  });

  const subtotal = document.getElementById("accounts-contract-subtotal");
  if (subtotal) subtotal.value = "0";
}

function getNumericInput(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const n = Number(el.value || 0);
  return isNaN(n) ? 0 : n;
}

function renderValue(id, val, opts = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const rounded = round2(val);
  el.textContent = `₦${moneyValue2(rounded)}`;
}

function renderComputedLocked(contractLock) {
  // locked values are stored precomputed so VAT/WHT settings changes won't affect outputs
  renderValue("accounts-contract-vat", contractLock.vatAmount);
  renderValue("accounts-contract-value", contractLock.contractValue);
  renderValue("accounts-wht", contractLock.whtAmount);

  renderValue("accounts-client-receipts", contractLock.totalClientReceipts);
  renderValue("accounts-outgoing", contractLock.totalOutgoing);
  renderValue("accounts-small-expenses", contractLock.smallExpenses);
  renderValue("accounts-pending-payments", contractLock.pendingPayments);

  renderValue("accounts-balance-expected", contractLock.balanceExpected);
  renderValue("accounts-net-profit", contractLock.netProfit);
}

async function renderAccountsComputed(isReRender, existingLock = null) {
  const cache = getCache();
  const pSel = document.getElementById("accounts-project-sel");
  const projectId = pSel ? pSel.value : getCurrentProjectId();
  if (!projectId) return;

  const project = (cache.projects || []).find((p) => p.projectId === projectId);
  if (!project) return;

  // If locked snapshot exists, render it and do not recalc.
  if (existingLock) {
    renderComputedLocked(existingLock);
    return;
  }

  // Otherwise compute live
  const vatPct = getNumericInput("accounts-settings-vat");
  const whtPct = getNumericInput("accounts-settings-wht");
  const subtotal = getNumericInput("accounts-contract-subtotal");

  const vatAmount = round2(subtotal * (vatPct / 100));
  const contractValue = round2(subtotal + vatAmount);
  const whtAmount = round2(subtotal * (whtPct / 100));

  // Payments derived from local cache (ensure present before computing)
  if (!cache.payments || !cache.payments.length) {
    try {
      const allPayments = await callApi("getPayments", {});
      setCache({ ...cache, payments: allPayments || [] });
    } catch (e) {
      // If offline and cache isn't available, compute with empty payments
      setCache({ ...cache, payments: cache.payments || [] });
    }
  }
  const payments = (getCache().payments || []).filter(
    (p) => p.projectId === projectId,
  );

  const totalClientReceipts = round2(
    payments
      .filter(
        (p) =>
          p.status !== "Pending" &&
          (p.paymentDirection === "Client Receipt" ||
            p.paymentDirection === "Client Receipt"),
      )
      .reduce((s, p) => s + Number(p.amount || 0), 0),
  );

  const totalOutgoing = round2(
    payments
      .filter(
        (p) =>
          p.status !== "Pending" && p.paymentDirection !== "Client Receipt",
      )
      .reduce((s, p) => s + Number(p.amount || 0), 0),
  );

  // Small expenses = payments with paymentDirection Small Expense
  const smallExpenses = round2(
    payments
      .filter(
        (p) => p.status !== "Pending" && p.paymentDirection === "Small Expense",
      )
      .reduce((s, p) => s + Number(p.amount || 0), 0),
  );

  const pendingPayments = round2(
    payments
      .filter(
        (p) =>
          p.status === "Pending" && p.paymentDirection !== "Client Receipt",
      )
      .reduce((s, p) => s + Number(p.amount || 0), 0),
  );

  const balanceExpected = round2(contractValue - whtAmount);
  const netProfit = round2(balanceExpected - totalOutgoing);

  // Render
  renderValue("accounts-contract-vat", vatAmount);
  renderValue("accounts-contract-value", contractValue);
  renderValue("accounts-wht", whtAmount);

  renderValue("accounts-client-receipts", totalClientReceipts);
  renderValue("accounts-outgoing", totalOutgoing);
  renderValue("accounts-small-expenses", smallExpenses);
  renderValue("accounts-pending-payments", pendingPayments);

  renderValue("accounts-balance-expected", balanceExpected);
  renderValue("accounts-net-profit", netProfit);

  // If project is closed, snapshot the computed values so future settings edits don't affect it.
  const closed = getClosedStatus(project.projectStatus);
  if (closed) {
    const lock = {
      projectId,
      createdAt: Date.now(),
      vatPct: vatPct,
      whtPct: whtPct,
      subtotal,
      vatAmount,
      whtAmount,
      contractValue,
      totalClientReceipts,
      totalOutgoing,
      smallExpenses,
      pendingPayments,
      balanceExpected,
      netProfit,
    };
    await upsertClosedProjectLock(projectId, lock);
    // After snapshot, disable inputs by re-rendering with lock
    await renderComputedLocked(lock);
    const vatInput = document.getElementById("accounts-settings-vat");
    const whtInput = document.getElementById("accounts-settings-wht");
    const subtotalInput = document.getElementById("accounts-contract-subtotal");
    if (vatInput) {
      vatInput.disabled = true;
      vatInput.style.background = "#f5f5f5";
    }
    if (whtInput) {
      whtInput.disabled = true;
      whtInput.style.background = "#f5f5f5";
    }
    if (subtotalInput) {
      subtotalInput.disabled = true;
      subtotalInput.style.background = "#f5f5f5";
    }
  }
}

export async function ensureAccountsPageVisibility(projectId = null) {
  const view = document.getElementById("view-accounts");
  if (!view) return;
  if (projectId) {
    const pSel = document.getElementById("accounts-project-sel");
    if (pSel) pSel.value = projectId;
  }
  await renderAccountsForSelectedProject();
}
