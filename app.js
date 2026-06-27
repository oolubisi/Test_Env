// ===== SAFETY NET: Ensure progress log functions are always defined =====
if (typeof window.deleteProgressLog === "undefined") {
  window.deleteProgressLog = async function (logId) {
    console.warn("deleteProgressLog fallback called");
    if (!confirm("Delete this progress log?")) return;
    try {
      await callApi("deleteProgressLog", { logId });
      const cache = getCache();
      cache.progressLogs = (cache.progressLogs || []).filter(
        (l) => l.logId !== logId,
      );
      setCache(cache);
      loadProgressTimelineFeed(true);
      showSyncToast("✅ Progress log deleted");
    } catch (e) {
      alert("Failed to delete: " + (e.message || "Unknown error"));
    }
  };
}

if (typeof window.updateProgressLog === "undefined") {
  window.updateProgressLog = async function (logId, data) {
    console.warn("updateProgressLog fallback called");
    try {
      const payload = {
        logId,
        projectId: getCurrentProjectId(),
        tradeCategory: data.tradeCategory,
        completionPercentage: data.completionPercentage,
        commentNarrative: data.commentNarrative,
        progressPhotoUrl: data.progressPhotoUrl || "",
      };
      await callApi("updateProgressLog", payload);
      const cache = getCache();
      const idx = (cache.progressLogs || []).findIndex(
        (l) => l.logId === logId,
      );
      if (idx !== -1) {
        cache.progressLogs[idx] = { ...cache.progressLogs[idx], ...payload };
        setCache(cache);
      }
      loadProgressTimelineFeed(true);
      showSyncToast("✅ Progress log updated");
    } catch (e) {
      alert("Failed to update: " + (e.message || "Unknown error"));
    }
  };
}

// ===== app.js =====
let appStarted = false;
let suppressPageRefresh = false;

function showPage(pageId) {
  document
    .querySelectorAll(".page-view:not(.console-tab-window)")
    .forEach((v) => v.classList.remove("active-view"));
  const target = document.getElementById(`view-${pageId}`);
  if (target) target.classList.add("active-view");
  if (!suppressPageRefresh) {
    if (pageId === "dashboard") refreshMasterDashboard();
    if (pageId === "vendors") refreshVendorsListView();
    if (pageId === "accounts") loadAccountsView();
    if (pageId === "reports") initReportsConsoleEngine();
    if (pageId === "print-layouts") renderPrintLayoutsPage();
    if (pageId === "letterhead") loadLetterheadView();
  }
  window.scrollTo(0, 0);
}

function showPageWithoutRefresh(pageId) {
  suppressPageRefresh = true;
  showPage(pageId);
  suppressPageRefresh = false;
}

// ===== PROGRESS LOG DELETE =====
async function deleteProgressLog(logId) {
  if (!confirm("Delete this progress log?")) return;
  try {
    await callApi("deleteProgressLog", { logId });
    const cache = getCache();
    cache.progressLogs = (cache.progressLogs || []).filter(
      (l) => l.logId !== logId,
    );
    setCache(cache);
    loadProgressTimelineFeed(true);
    showSyncToast("✅ Progress log deleted");
  } catch (e) {
    alert("Failed to delete: " + (e.message || "Unknown error"));
  }
}
window.deleteProgressLog = deleteProgressLog;

// ===== PROGRESS LOG UPDATE =====
async function updateProgressLog(logId, data) {
  try {
    const payload = {
      logId: logId,
      projectId: getCurrentProjectId(),
      tradeCategory: data.tradeCategory,
      completionPercentage: data.completionPercentage,
      commentNarrative: data.commentNarrative,
      progressPhotoUrl: data.progressPhotoUrl || "",
    };
    await callApi("updateProgressLog", payload);
    const cache = getCache();
    const idx = (cache.progressLogs || []).findIndex((l) => l.logId === logId);
    if (idx !== -1) {
      cache.progressLogs[idx] = { ...cache.progressLogs[idx], ...payload };
      setCache(cache);
    }
    loadProgressTimelineFeed(true);
    showSyncToast("✅ Progress log updated");
  } catch (e) {
    alert("Failed to update: " + (e.message || "Unknown error"));
  }
}
window.updateProgressLog = updateProgressLog;

// ===== PCR AUTO-UPDATE =====
function updatePcrFields() {
  const overallEl = document.getElementById("console-progress-overall");
  const pcrCompletion = document.getElementById("pcr-completion");
  const pcrStatus = document.getElementById("pcr-status");

  if (!overallEl || !pcrCompletion || !pcrStatus) return;

  const overallText = overallEl.innerText || "";
  const match = overallText.match(/([\d.]+)%/);
  let pct = match ? parseFloat(match[1]) : 0;

  pcrCompletion.value = pct.toFixed(1) + "%";

  if (pct < 95) {
    pcrStatus.value = "Partial Completion";
    pcrStatus.disabled = true;
  } else {
    pcrStatus.disabled = false;
    if (pcrStatus.value === "Partial Completion") {
      pcrStatus.value = "Substantially Complete";
    }
  }
}
window.updatePcrFields = updatePcrFields;

// ===== SAVE PCR FIELDS =====
async function saveProjectPcrFields() {
  const projectId = getCurrentProjectId();
  const pcrStatus = document.getElementById("pcr-status");
  const pcrCompletion = document.getElementById("pcr-completion");
  const pcrSummary = document.getElementById("pcr-summary");
  const pcrDeclaration = document.getElementById("pcr-declaration");

  if (!projectId) {
    alert("No project selected");
    return;
  }

  const payload = {
    projectId: projectId,
    pcrStatus: pcrStatus.value,
    pcrCompletion: pcrCompletion.value,
    pcrSummary: pcrSummary.value,
    pcrDeclaration: pcrDeclaration.value,
  };

  try {
    await callApi("updateProjectPcrFields", payload);
    showSyncToast("✅ PCR fields saved");
  } catch (e) {
    alert("Failed to save: " + (e.message || "Unknown error"));
  }
}
window.saveProjectPcrFields = saveProjectPcrFields;

// ===== WINDOW EXPORTS =====
window.showPage = showPage;
window.loadLetterheadView = loadLetterheadView;
window.printLetterhead = printLetterhead;
window.saveLetterheadPDF = saveLetterheadPDF;
window.shareLetterheadPDF = shareLetterheadPDF;
window.loadProjectConsoleHub = loadProjectConsoleHub;
window.triggerEditProjectProfile = triggerEditProjectProfile;
window.switchConsoleSegment = switchConsoleSegment;
window.toggleScopeEdit = toggleScopeEdit;
window.saveProjectScope = saveProjectScope;
window.updateProjectContractSubtotal = updateProjectContractSubtotal;
window.openModal = openModal;
window.openModalWithRecord = openModalWithRecord;
window.closeModal = closeModal;
window.removeAttachmentByIndex = removeAttachmentByIndex;
window.clearVendorAvatarPhoto = clearVendorAvatarPhoto;
window.triggerManualSync = triggerManualSync;
window.refreshAllData = refreshAllData;
window.handleReportScopePopulation = handleReportScopePopulation;
window.handleReportFilterPopulation = handleReportFilterPopulation;
window.compileFieldReport = compileFieldReport;
window.loadAccountsView = loadAccountsView;
window.updateAccountsSummary = updateAccountsSummary;
window.saveReportPDF = saveReportPDF;
window.toggleTakeOffSelection = toggleTakeOffSelection;
window.toggleTemplateSelection = toggleTemplateSelection;
window.deleteSelectedTakeOffs = deleteSelectedTakeOffs;
window.deleteSelectedTemplates = deleteSelectedTemplates;
window.hideAllBuiltInTemplates = hideAllBuiltInTemplates;
window.showAllBuiltInTemplates = showAllBuiltInTemplates;
window.shareReport = shareReport;
window.previewTemplate = previewTemplate;
window.applyTemplateToProject = applyTemplateToProject;
window.toggleAllTmplRows = toggleAllTmplRows;
window.updateTmplGroupCheckbox = updateTmplGroupCheckbox;
window.applyBulkUnitToTmpl = applyBulkUnitToTmpl;
window.openSaveAsTemplateModal = openSaveAsTemplateModal;
window.loadTemplatesSegment = loadTemplatesSegment;
window.deleteCustomTemplate = deleteCustomTemplate;
window.openEditTemplateModal = openEditTemplateModal;
window.addEditTemplateItemRow = addEditTemplateItemRow;
window.onPaymentDirectionChange = onPaymentDirectionChange;
window.recalcPaymentBalance = recalcPaymentBalance;
window.validateStageAmount = validateStageAmount;
window.getPaymentGroupData = getPaymentGroupData;
window.getAllPaymentGroups = getAllPaymentGroups;
window.openAddStageModal = openAddStageModal;
window.addWorkOrderLineItem = addWorkOrderLineItem;
window.recalcWorkOrderTotal = recalcWorkOrderTotal;
window.populateWorkOrderDropdown = populateWorkOrderDropdown;
window.addTakeOffLineItem = addTakeOffLineItem;
window.addTakeOffHeader = addTakeOffHeader;
window.exportAllTemplatesJSON = exportAllTemplatesJSON;
window.exportSingleTemplateJSON = exportSingleTemplateJSON;
window.importTemplatesFromJSON = importTemplatesFromJSON;
window.openImportTemplatesModal = openImportTemplatesModal;
window.syncTemplatesToSheet = syncTemplatesToSheet;
window.loadTemplatesFromSheet = loadTemplatesFromSheet;
window.deleteProgressLog = deleteProgressLog;
window.updateProgressLog = updateProgressLog;
window.updatePcrFields = updatePcrFields;
window.saveProjectPcrFields = saveProjectPcrFields;

// ===== REFRESH TEMPLATES =====
async function refreshTemplatesFromSheet() {
  const btn = document.querySelector(
    'button[onclick="window.refreshTemplatesFromSheet()"]',
  );
  const origHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Refreshing...`;
    btn.disabled = true;
  }
  try {
    await loadTemplatesFromSheet();
    loadTemplatesSegment();
    showSyncToast("✅ Templates refreshed from sheet");
  } catch (e) {
    showSyncToast("⚠️ Could not reach sheet. Showing local templates.");
  } finally {
    if (btn) {
      btn.innerHTML = origHtml;
      btn.disabled = false;
    }
  }
}
window.refreshTemplatesFromSheet = refreshTemplatesFromSheet;

// ===== SERVICE WORKER =====
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker
      .register("./sw.js?v=11")
      .catch((e) => console.warn(e)),
  );
}
window.addEventListener("online", syncQueuedRequests);
window.addEventListener("offline", updateSyncStatus);

// ===== PWA INSTALL =====
let installPromptEvent = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPromptEvent = e;
  const btn = document.getElementById("pwa-install-btn");
  if (btn) btn.style.display = "inline-flex";
});
window.addEventListener("appinstalled", () => {
  installPromptEvent = null;
  const btn = document.getElementById("pwa-install-btn");
  if (btn) btn.style.display = "none";
});

function initPwaInstall() {
  const btn = document.getElementById("pwa-install-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    if (!installPromptEvent) {
      showInstallFallback();
      return;
    }
    try {
      await installPromptEvent.prompt();
      const result = await installPromptEvent.userChoice;
      if (result.outcome === "accepted") {
        btn.style.display = "none";
      }
      installPromptEvent = null;
    } catch (err) {
      console.error("Install prompt failed:", err);
      showInstallFallback();
    }
  });
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true
  ) {
    btn.style.display = "none";
    return;
  }
  setTimeout(() => {
    if (!installPromptEvent && btn.style.display === "none") {
      btn.style.display = "inline-flex";
      btn.innerHTML = '<i class="fas fa-download"></i> Add to Home Screen';
    }
  }, 3000);
}

function showInstallFallback() {
  const isAndroid = /Android/.test(navigator.userAgent);
  const body = document.getElementById("modalBody");
  const submit = document.getElementById("modalSubmit");
  const title = document.getElementById("modalTitle");
  const overlay = document.getElementById("modalOverlay");
  title.innerText = "Add to Home Screen";
  overlay.style.display = "flex";
  if (isAndroid) {
    body.innerHTML = `<p style="font-size:15px; line-height:1.5;">To install on Android:</p><ol style="font-size:15px; line-height:1.6; padding-left:20px;"><li>Tap the <strong>menu</strong> button <i class="fas fa-ellipsis-v" style="color:var(--primary);"></i> in Chrome.</li><li>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.</li><li>Tap <strong>Add</strong> or <strong>Install</strong>.</li></ol><p style="font-size:13px; color:var(--muted); margin-top:10px;">Once added, open from your home screen for full-screen experience.</p>`;
  } else {
    body.innerHTML = `<p style="font-size:15px; line-height:1.5;">To install this app:</p><ol style="font-size:15px; line-height:1.6; padding-left:20px;"><li>Open your browser menu.</li><li>Look for <strong>Add to Home Screen</strong> or <strong>Install App</strong>.</li><li>Follow the prompts to add the icon to your home screen.</li></ol>`;
  }
  submit.style.display = "block";
  submit.innerText = "Close";
  submit.onclick = closeModal;
}

// ===== LOAD EVENT =====
window.addEventListener("load", () => {
  if (appStarted) return;
  appStarted = true;
  updateSyncStatus();
  showPageWithoutRefresh("dashboard");
  refreshMasterDashboard();
  initPwaInstall();

  (async function preloadAllData() {
    const endpoints = [
      { action: "getVendors", key: "vendors", isArray: true },
      { action: "getPayments", key: "payments", isArray: true },
      { action: "getWorkOrders", key: "workorders", isArray: true },
      { action: "getSnags", key: "snags", isArray: true },
      { action: "getProgressLogs", key: "progressLogs", isArray: true },
      { action: "getTakeOffItems", key: "takeoffs", isArray: true },
      { action: "getSettings", key: "settings", isArray: false },
    ];
    for (const ep of endpoints) {
      try {
        const res = await callApi(ep.action, {});
        const cache = getCache();
        cache[ep.key] = ep.isArray ? res || [] : res || {};
        setCache(cache);
      } catch (e) {
        console.warn("Preload failed for " + ep.action + ":", e);
      }
    }
  })();

  if (navigator.onLine) syncQueuedRequests();
});
