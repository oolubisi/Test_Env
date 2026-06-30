// =========================================================
// REPORTS.JS — Reports Engine (profile/layout selectors,
//              report compilers, apartment manifest/dossier)
// Load order: 7th (last)
// Depends on: core.js, init.js, pdf.js (compileAndDownloadUnifiedPDF)
// =========================================================

// § REPORTS ENGINE
// ─────────────────────────────────────────────
function initReportsEngine() {
  setGlobalLoading(true, "Loading reports...");
  Promise.all([
    callApi("getApartments", {}).then(
      (r) => (cache.apts = Array.isArray(r) ? r : []),
    ),
    callApi("getAssets", {}).then(
      (r) => (cache.assets = Array.isArray(r) ? r : []),
    ),
    callApi("getMaintenance", {}).then(
      (r) => (cache.tickets = Array.isArray(r) ? r : []),
    ),
    callApi("getWorkOrders", {}).then(
      (r) => (cache.workorders = Array.isArray(r) ? r : []),
    ),
    callApi("getUtilities", {}).then(
      (r) => (cache.utilities = Array.isArray(r) ? r : []),
    ),
    callApi("getPayments", {}).then(
      (r) => (cache.payments = Array.isArray(r) ? r : []),
    ),
    callApi("getExpenseRequests", {}).then(
      (r) => (cache.expenseRequests = Array.isArray(r) ? r : []),
    ),
    callApi("getCashExpenses", {}).then(
      (r) => (cache.cashExpenses = Array.isArray(r) ? r : []),
    ),
  ])
    .then(() => {
      if (cache.apts) sortApartmentsCacheList();
      document.getElementById("rep-profile-selector").value = "";
      document.getElementById("rep-layout-selector").innerHTML =
        "<option value=''>-- Choose Configurations --</option>";
      document.getElementById("rep-dynamic-parameters-frame").innerHTML = "";
      document.getElementById("report-onscreen-preview-card").style.display =
        "none";
      setGlobalLoading(false);
    })
    .catch(() => setGlobalLoading(false));
}

function handleReportProfileSwitch() {
  const profile = document.getElementById("rep-profile-selector").value;
  const layoutSel = document.getElementById("rep-layout-selector");
  const paramsFrame = document.getElementById("rep-dynamic-parameters-frame");
  layoutSel.innerHTML = "";
  paramsFrame.innerHTML = "";
  document.getElementById("report-onscreen-preview-card").style.display =
    "none";

  const options = {
    apartments: [
      ["", "-- Select Report --"],
      ["occupancy_report", "Apartment Occupancy Report"],
      ["apt_custom_print", "Apartments Manifest"],
      ["detailed_profile", "Detailed Apartment Profile"],
    ],
    equipment: [
      ["", "-- Select Report --"],
      ["generator_log", "Generator & Diesel Log"],
      ["pm_schedule", "PM Schedule"],
      ["asset_register", "Master Asset Register"],
      ["ticket_report", "Maintenance Tickets"],
    ],
    financials: [
      ["", "-- Select Report --"],
      ["ledger_summary", "Comprehensive Financial Ledger"],
      ["fin_wo", "Approved Work Orders Ledger"],
    ],
    executive: [
      ["", "-- Select Report --"],
      ["daily_operations", "Daily Operations Report"],
      ["monthly_fm", "Monthly FM Report"],
      ["kpi_dashboard", "Executive KPI Dashboard"],
    ],
  };
  (options[profile] || []).forEach(([val, label]) => {
    const o = document.createElement("option");
    o.value = val;
    o.textContent = label;
    layoutSel.appendChild(o);
  });
}

function handleReportLayoutSwitch() {
  const layout = document.getElementById("rep-layout-selector").value;
  const paramsFrame = document.getElementById("rep-dynamic-parameters-frame");
  paramsFrame.innerHTML = "";
  if (layout === "detailed_profile") {
    paramsFrame.innerHTML = `<label>SELECT APARTMENT UNIT</label><select id="rep-param-unit" class="form-control"></select>`;
    populateUnitDropdown("rep-param-unit");
  } else if (
    ["ledger_summary", "generator_log", "ticket_report", "fin_wo"].includes(
      layout,
    )
  ) {
    paramsFrame.innerHTML = `<div style="display:flex; gap:10px;"><div style="flex:1;"><label>START DATE</label><input type="date" id="rep_start_date"></div><div style="flex:1;"><label>END DATE</label><input type="date" id="rep_end_date"></div></div>`;
  } else if (layout === "daily_operations") {
    paramsFrame.innerHTML = `<label>REPORT DATE</label><input type="date" id="rep-param-date" value="${new Date().toISOString().split("T")[0]}">`;
  } else if (layout === "monthly_fm" || layout === "kpi_dashboard") {
    paramsFrame.innerHTML = `<label>SELECT MONTH</label><input type="month" id="rep-param-month" value="${new Date().toISOString().slice(0, 7)}">`;
  }
}

function compileReportPreview() {
  const layout = document.getElementById("rep-layout-selector").value;
  const viewport = document.getElementById("report-preview-viewport");
  if (!layout) return;

  if (layout === "apt_custom_print") {
    generateApartmentManifestReport();
    return;
  }
  if (layout === "detailed_profile") {
    const unit = document.getElementById("rep-param-unit")?.value;
    if (!unit) {
      showToast("Please select a unit.", "warning");
      return;
    }
    generateApartmentDossierReport(unit);
    return;
  }

  const generateTitleBar = (titleText) => `
    <div style="border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:flex-end;">
      <h2 style="margin:0; font-size:18px; font-weight:900; text-transform:uppercase;">${escapeHtml(titleText)}</h2>
      <div style="text-align:right; font-size:12px;"><p style="margin:0; color:#555;">RUN DATE:</p><p style="margin:2px 0 0 0; font-weight:bold;">${new Date().toLocaleDateString("en-GB")}</p></div>
    </div>`;

  let out = `<div style="font-family:'Helvetica','Inter',sans-serif; color:#000; background:#fff; box-sizing:border-box; width:100%; max-width:900px; margin:0 auto; padding:0; line-height:1.4;">`;

  if (layout === "occupancy_report") {
    out += generateTitleBar("APARTMENT OCCUPANCY REPORT");
    const rows = (cache.apts || [])
      .map((a) => {
        if (!a) return "";
        const isOcc = String(a.status || "").toLowerCase() === "occupied";
        return `<tr><td style="padding:6px; border:1px solid #000;">${escapeHtml(a.unit || a.Unit || a.apt || "N/A")}</td><td style="padding:6px; border:1px solid #000;">${escapeHtml(a.type || a.Type || "N/A")}</td><td style="padding:6px; border:1px solid #000; font-weight:bold; color:${isOcc ? "#198754" : "#DC3545"};">${escapeHtml((a.status || "VACANT").toUpperCase())}</td><td style="padding:6px; border:1px solid #000;">${escapeHtml(a.tenant || a.Tenant || "N/A")}</td><td style="padding:6px; border:1px solid #000;">${escapeHtml(a.leaseEnd || "N/A")}</td></tr>`;
      })
      .join("");
    out += `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:20px;"><thead><tr style="background:#f4f4f4; -webkit-print-color-adjust:exact;"><th style="padding:8px 6px; border:1px solid #000;">Unit</th><th style="padding:8px 6px; border:1px solid #000;">Type</th><th style="padding:8px 6px; border:1px solid #000;">Status</th><th style="padding:8px 6px; border:1px solid #000;">Tenant</th><th style="padding:8px 6px; border:1px solid #000;">Lease Expiry</th></tr></thead><tbody>${rows || `<tr><td colspan="5" style="padding:10px; text-align:center;">No data.</td></tr>`}</tbody></table>`;
  } else if (layout === "pm_schedule") {
    out += generateTitleBar("PREVENTIVE MAINTENANCE SCHEDULE");
    const rows = (cache.assets || [])
      .filter((a) => a && String(a.status || "") !== "Archived")
      .map((a) => {
        let pmStatus = "Active",
          color = "#198754";
        if (a.nextService) {
          const diff =
            (new Date(a.nextService) - new Date()) / (1000 * 60 * 60 * 24);
          if (diff < 0) {
            pmStatus = "Overdue";
            color = "#DC3545";
          } else if (diff <= 14) {
            pmStatus = "Due Soon";
            color = "#FFC107";
          }
        }
        return `<tr><td style="padding:6px; border:1px solid #000; font-weight:bold;">${escapeHtml(a.tag || "N/A")}</td><td style="padding:6px; border:1px solid #000;">${escapeHtml(a.type || "N/A")}</td><td style="padding:6px; border:1px solid #000;">${escapeHtml(a.loc || a.location || "N/A")}</td><td style="padding:6px; border:1px solid #000;">${escapeHtml(a.lastServiced || "-")}</td><td style="padding:6px; border:1px solid #000;">${escapeHtml(a.nextService || "-")}</td><td style="padding:6px; border:1px solid #000; font-weight:bold; color:${color};">${escapeHtml(pmStatus.toUpperCase())}</td></tr>`;
      })
      .join("");
    out += `<table style="width:100%; border-collapse:collapse; font-size:12px;"><thead><tr style="background:#f4f4f4; -webkit-print-color-adjust:exact;"><th style="padding:8px 6px; border:1px solid #000;">Tag</th><th style="padding:8px 6px; border:1px solid #000;">Type</th><th style="padding:8px 6px; border:1px solid #000;">Location</th><th style="padding:8px 6px; border:1px solid #000;">Last Service</th><th style="padding:8px 6px; border:1px solid #000;">Next Service</th><th style="padding:8px 6px; border:1px solid #000;">PM Status</th></tr></thead><tbody>${rows || `<tr><td colspan="6" style="padding:10px; text-align:center;">No data.</td></tr>`}</tbody></table>`;
  } else if (layout === "ledger_summary") {
    const startRaw = document.getElementById("rep_start_date")?.value;
    const endRaw = document.getElementById("rep_end_date")?.value;
    if (!startRaw || !endRaw) {
      showToast("Please select a date range.", "warning");
      return;
    }
    const startDate = new Date(startRaw),
      endDate = new Date(endRaw);
    out += generateTitleBar("COMPREHENSIVE FINANCIAL LEDGER");
    out += `<p style="font-weight:700; font-size:12px; margin-bottom:15px;">Period: ${startDate.toLocaleDateString("en-GB")} to ${endDate.toLocaleDateString("en-GB")}</p>`;
    let totalInflow = 0,
      totalOutflow = 0;
    const rows = (cache.payments || [])
      .filter((p) => {
        const d = new Date(fromSheetDate(p?.date || "") || 0);
        return d >= startDate && d <= endDate;
      })
      .map((p) => {
        if (!p) return "";
        const amt = parseFloat(p.amount || p.Amount || 0);
        if (p.direction === "OUTFLOW") totalOutflow += amt;
        else totalInflow += amt;
        const color = p.direction === "OUTFLOW" ? "#DC3545" : "#198754";
        const sign = p.direction === "OUTFLOW" ? "-" : "+";
        return `<tr><td style="padding:6px; border:1px solid #000;">${escapeHtml(p.paymentId || p.PaymentId)}</td><td style="padding:6px; border:1px solid #000;">${formatDateForDisplay(p.date)}</td><td style="padding:6px; border:1px solid #000;">${escapeHtml(p.party || "")}</td><td style="padding:6px; border:1px solid #000; font-weight:bold; color:${color};">${sign}₦${formatMoney(amt)}</td><td style="padding:6px; border:1px solid #000;">${escapeHtml(p.type || "")}</td></tr>`;
      })
      .join("");
    out += `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:10px;"><thead><tr style="background:#f4f4f4; -webkit-print-color-adjust:exact;"><th style="padding:8px 6px; border:1px solid #000;">ID</th><th style="padding:8px 6px; border:1px solid #000;">Date</th><th style="padding:8px 6px; border:1px solid #000;">Party</th><th style="padding:8px 6px; border:1px solid #000;">Amount</th><th style="padding:8px 6px; border:1px solid #000;">Type</th></tr></thead><tbody>${rows || `<tr><td colspan="5" style="padding:10px; text-align:center;">No records for this period.</td></tr>`}<tr style="font-weight:900; font-size:13px; background:#eee; -webkit-print-color-adjust:exact;"><td colspan="3" style="padding:8px; border:1px solid #000; text-align:right;">TOTALS:</td><td style="padding:8px; border:1px solid #000; color:${totalInflow - totalOutflow >= 0 ? "#198754" : "#DC3545"};">Net: ${totalInflow - totalOutflow >= 0 ? "+" : "-"}₦${formatMoney(Math.abs(totalInflow - totalOutflow))}</td><td style="padding:8px; border:1px solid #000;"></td></tr></tbody></table>`;
  } else if (layout === "asset_register") {
    out += generateTitleBar("MASTER ASSET REGISTER");
    const rows = (cache.assets || [])
      .filter((a) => a && String(a.status || "") !== "Archived")
      .map((a) => {
        return `<tr><td style="padding:6px; border:1px solid #000; font-weight:bold;">${escapeHtml(a.tag || "N/A")}</td><td style="padding:6px; border:1px solid #000;">${escapeHtml(a.type || "N/A")}</td><td style="padding:6px; border:1px solid #000;">Unit ${escapeHtml(getUnitNumber(a))}</td><td style="padding:6px; border:1px solid #000;">${escapeHtml(a.specs || "N/A")}</td><td style="padding:6px; border:1px solid #000; font-weight:bold;">${escapeHtml(String(a.status || "").toUpperCase())}</td></tr>`;
      })
      .join("");
    out += `<table style="width:100%; border-collapse:collapse; font-size:12px;"><thead><tr style="background:#f4f4f4; -webkit-print-color-adjust:exact;"><th style="padding:8px 6px; border:1px solid #000;">Tag</th><th style="padding:8px 6px; border:1px solid #000;">Type</th><th style="padding:8px 6px; border:1px solid #000;">Unit</th><th style="padding:8px 6px; border:1px solid #000;">Specs</th><th style="padding:8px 6px; border:1px solid #000;">Status</th></tr></thead><tbody>${rows || `<tr><td colspan="5" style="padding:10px; text-align:center;">No assets registered.</td></tr>`}</tbody></table>`;
  } else {
    out += `<p style="padding:20px; font-weight:700; color:var(--muted);">Report type not yet implemented. Please select a different report.</p>`;
  }

  out += `</div>`;
  const ref = generateReportRef("RPT");
  const wrapped = wrapReportContent(
    out,
    layout.replace(/_/g, " ").toUpperCase(),
    ref,
  );
  if (viewport) viewport.innerHTML = wrapped;
  const printContainer = document.getElementById("report-print-container");
  if (printContainer) printContainer.innerHTML = wrapped;
  window.currentReportFilename = "Facility_Report_" + Date.now();
  window.currentReportAttachmentManifest = [];
  window.currentReportTitle = layout;
  window.currentReportRef = ref;
  window.currentReportRawContent = out; // unwrapped content only, for PDF download (avoids double header/footer)
  const previewCard = document.getElementById("report-onscreen-preview-card");
  if (previewCard) previewCard.style.display = "block";
}

function downloadCurrentReportPDF() {
  const source = document.getElementById("report-preview-viewport");
  if (!source || !source.innerHTML.trim()) {
    showToast("Please generate a report first.", "warning");
    return;
  }
  // Use the raw (unwrapped) content here — the viewport's innerHTML is already wrapped with
  // header/footer for on-screen preview, and compileAndDownloadUnifiedPDF wraps again internally.
  // Passing the wrapped HTML would duplicate the header and footer in the final PDF.
  const rawContent = window.currentReportRawContent || source.innerHTML;
  compileAndDownloadUnifiedPDF(
    rawContent,
    window.currentReportAttachmentManifest || [],
    window.currentReportFilename || "Facility_Report",
    window.currentReportTitle || "Report",
    window.currentReportRef || "",
  );
}

function printCurrentReport() {
  const source = document.getElementById("report-preview-viewport");
  if (!source || !source.innerHTML.trim()) {
    showToast("Please generate a report first.", "warning");
    return;
  }
  const originalTitle = document.title;
  document.title = window.currentReportFilename || "Facility_Report";
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}

function generateApartmentManifestReport() {
  const viewport = document.getElementById("report-preview-viewport");
  if (!viewport) return;
  window.currentReportFilename = "Apartment_Manifest_" + Date.now();
  window.currentReportAttachmentManifest = [];

  let html = `<div style="font-family:'Arial',sans-serif; color:#000; background:#fff; padding:0; width:100%; margin:0 auto; line-height:1.4;">
    <h3 style="font-size:16px; font-weight:900; text-transform:uppercase; margin:0 0 15px 0; text-decoration:underline;">Apartments Manifest</h3>`;

  (cache.apts || [])
    .filter((a) => a && String(a.type || "").toLowerCase() !== "services")
    .forEach((apt) => {
      const unitId = escapeHtml(getUnitNumber(apt));
      const tenant = escapeHtml(apt.tenant || apt.Tenant || "VACANT");
      const type = escapeHtml(apt.type || apt.Type || "Standard");
      const meter = escapeHtml(
        apt.meterNo || apt.MeterNo || apt.meter || "N/A",
      );
      const unitAssets = (cache.assets || []).filter(
        (a) =>
          a &&
          String(getUnitNumber(a)) === String(getUnitNumber(apt)) &&
          String(a.status || "") !== "Archived",
      );

      html += `<div style="margin-bottom:25px; page-break-inside:avoid;">
      <table style="width:100%; border-collapse:collapse; border:2px solid #000; font-size:14px; font-weight:bold;">
        <tr><td style="border:1px solid #000; padding:6px; width:15%; background:#f9f9f9;">Unit</td><td style="border:1px solid #000; padding:6px; width:35%;">${unitId}</td><td style="border:1px solid #000; padding:6px; width:15%; background:#f9f9f9;">Tenant</td><td style="border:1px solid #000; padding:6px; width:35%; color:${tenant.toUpperCase() === "VACANT" ? "#DC3545" : "#198754"};">${tenant.toUpperCase()}</td></tr>
        <tr><td style="border:1px solid #000; padding:6px; background:#f9f9f9;">Type</td><td style="border:1px solid #000; padding:6px;">${type}</td><td style="border:1px solid #000; padding:6px; background:#f9f9f9;">Meter No</td><td style="border:1px solid #000; padding:6px;">${meter}</td></tr>
      </table>
      <div style="margin-top:10px;"><p style="margin:0 0 5px 0; font-size:13px; font-weight:bold; text-decoration:underline;">REGISTERED ASSETS:</p>
        <ul style="margin:0; padding-left:20px; font-size:13px;">
          ${unitAssets.length > 0 ? unitAssets.map((asset) => `<li style="margin-bottom:4px;">${escapeHtml(asset.type || "Asset")} (${escapeHtml(asset.tag || asset.Tag || "NO-TAG")})${asset.specs || asset.Specs ? ` - ${escapeHtml(asset.specs || asset.Specs)}` : ""}</li>`).join("") : `<li style="color:#666; font-style:italic;">No registered assets</li>`}
        </ul>
      </div>
    </div>`;
    });

  html += `</div>`;
  const ref = generateReportRef("RPT");
  const wrapped = wrapReportContent(html, "Apartments Manifest", ref);
  viewport.innerHTML = wrapped;
  const printContainer = document.getElementById("report-print-container");
  if (printContainer) printContainer.innerHTML = wrapped;
  window.currentReportTitle = "Apartments Manifest";
  window.currentReportRef = ref;
  window.currentReportRawContent = html;
  document.getElementById("report-onscreen-preview-card").style.display =
    "block";
}

function generateApartmentDossierReport(targetUnitId) {
  const viewport = document.getElementById("report-preview-viewport");
  if (!viewport) return;
  window.currentReportFilename =
    `Apartment_Dossier_${targetUnitId}_` + Date.now();
  window.currentReportAttachmentManifest = [];

  const apt = (cache.apts || []).find(
    (a) => a && String(getUnitNumber(a)) === String(targetUnitId),
  );
  if (!apt) {
    showToast("Apartment not found.", "error");
    return;
  }

  const type = escapeHtml(apt.type || apt.Type || "Standard");
  const status = escapeHtml(apt.status || apt.Status || "Vacant");
  const meter = escapeHtml(apt.meterNo || apt.MeterNo || apt.meter || "N/A");

  let html = `<div style="font-family:'Arial',sans-serif; color:#000; background:#fff; padding:0; width:100%; margin:0 auto; line-height:1.4;">
    <h3 style="font-size:16px; font-weight:900; text-transform:uppercase; margin:0 0 15px 0; text-decoration:underline;">Apartment Dossier &bull; Unit ${escapeHtml(targetUnitId)}</h3>
    <table style="width:100%; border-collapse:collapse; border:2px solid #000; font-size:14px; font-weight:bold; margin-bottom:20px;">
      <tr><td style="border:1px solid #000; padding:6px; width:15%; background:#f9f9f9;">Type</td><td style="border:1px solid #000; padding:6px; width:35%;">${type}</td><td style="border:1px solid #000; padding:6px; width:15%; background:#f9f9f9;">Status</td><td style="border:1px solid #000; padding:6px; width:35%; color:${status.toUpperCase() === "VACANT" ? "#DC3545" : "#198754"};">${status}</td></tr>
      <tr><td style="border:1px solid #000; padding:6px; background:#f9f9f9;">Meter No</td><td colspan="3" style="border:1px solid #000; padding:6px;">${meter}</td></tr>
    </table>
    <h3 style="font-size:14px; font-weight:bold; margin:20px 0 10px 0; text-decoration:underline;">ASSETS:</h3>
    <div style="display:flex; flex-wrap:wrap; gap:2%; row-gap:15px;">`;

  const unitAssets = (cache.assets || []).filter(
    (a) =>
      a &&
      String(getUnitNumber(a)) === String(targetUnitId) &&
      String(a.status || "") !== "Archived",
  );
  if (unitAssets.length > 0) {
    unitAssets.forEach((asset) => {
      let imgHtml = `<div style="height:120px; background:#eee; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; color:#aaa; border-bottom:1px solid #ccc;">No Image</div>`;
      if (asset.photos || asset.Photos) {
        const firstPhoto = String(asset.photos || asset.Photos).split(",")[0];
        if (firstPhoto)
          imgHtml = `<div style="height:120px; border-bottom:1px solid #ccc; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#fff;"><img src="${getDirectImageUrl(firstPhoto)}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="${escapeHtml(asset.type || "Asset")}"></div>`;
      }
      html += `<div style="width:32%; border:1px solid #000; border-radius:4px; overflow:hidden; page-break-inside:avoid;">${imgHtml}<div style="padding:10px; font-size:12px; line-height:1.5;"><div style="font-weight:900; font-size:13px; margin-bottom:5px;">${escapeHtml(asset.type || asset.Type || "Asset")}</div><div><strong>Specs:</strong> ${escapeHtml(asset.specs || asset.Specs || "N/A")}</div><div><strong>Tag:</strong> ${escapeHtml(asset.tag || asset.Tag)}</div><div><strong>Status:</strong> ${escapeHtml(asset.status || asset.Status || "N/A")}</div></div></div>`;
    });
  } else {
    html += `<div style="font-style:italic; color:#666; font-size:13px;">No physical assets recorded for this unit.</div>`;
  }

  html += `</div></div>`;
  const ref = generateReportRef("RPT");
  const wrapped = wrapReportContent(
    html,
    `Apartment Dossier - Unit ${targetUnitId}`,
    ref,
  );
  viewport.innerHTML = wrapped;
  const printContainer = document.getElementById("report-print-container");
  if (printContainer) printContainer.innerHTML = wrapped;
  window.currentReportTitle = `Apartment Dossier - Unit ${targetUnitId}`;
  window.currentReportRef = ref;
  window.currentReportRawContent = html;
  document.getElementById("report-onscreen-preview-card").style.display =
    "block";
}
