/* ───────────────────────────────────────────
   Reports Page — Full report generation system
   ─────────────────────────────────────────── */

import { useState, useMemo, useCallback, useRef } from "react";
import { FileText, Download, Share2, Loader2 } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { wrapUnifiedPage } from "@/lib/branding";
import { getCache } from "@/lib/api";
import { moneyValue, roundMoney, escapeHtml, todayFormatted } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Project, Vendor, WorkOrder, Payment, Variation, Snag, ProgressLog, TakeOffItem } from "@/types";

const REPORT_TYPES = [
  { value: "financial-summary", label: "Financial Summary (All Projects)" },
  { value: "financial-project", label: "Financial Report (Project)" },
  { value: "financial-client", label: "Financial Report (Client)" },
  { value: "financial-vendor", label: "Financial Report (Vendor)" },
  { value: "project-scope", label: "Project Scope" },
  { value: "snags", label: "Snags Report" },
  { value: "progress", label: "Progress Report" },
  { value: "pcr", label: "Project Completion Report (PCR)" },
  { value: "takeoff", label: "Take-Off Report" },
  { value: "workorders", label: "Work Orders" },
];

const SCOPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "project", label: "Specific Project" },
  { value: "client", label: "Specific Client" },
  { value: "vendor", label: "Specific Vendor" },
];

type ScopeType = "all" | "project" | "client" | "vendor";

export default function Reports() {
  const { state } = useAppState();
  const [reportType, setReportType] = useState(REPORT_TYPES[0].value);
  const [scope, setScope] = useState<ScopeType>("all");
  const [filterId, setFilterId] = useState("");
  const [includeSignature, setIncludeSignature] = useState(true);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const previewRef = useRef<HTMLDivElement>(null);

  const projects = state.cache.projects || [];
  const vendors = state.cache.vendors || [];

  /* ─── Filter dropdown options ─── */
  const filterOptions = useMemo(() => {
    if (scope === "project") {
      return projects.map((p) => ({ value: p.projectId, label: `${p.clientName} — ${p.siteLocation}` }));
    }
    if (scope === "client") {
      const clients = Array.from(new Set(projects.map((p) => p.clientName)));
      return clients.map((c) => ({ value: c, label: c }));
    }
    if (scope === "vendor") {
      return vendors.map((v) => ({ value: v.vendorId, label: `${v.company} (${v.trade})` }));
    }
    return [];
  }, [scope, projects, vendors]);

  /* ─── Get settings for signature ─── */
  const getSignatureOptions = useCallback(() => {
    const settings = getCache("settings");
    return {
      name: settings.Name_Signed || "",
      signImage: settings.Sign_Signed || "",
      date: todayFormatted(),
    };
  }, []);

  /* ─── Generate Report ─── */
  const generateReport = useCallback(async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 100)); // let UI update

    let html = "";
    const sig = includeSignature ? getSignatureOptions() : undefined;

    try {
      switch (reportType) {
        case "financial-summary":
          html = generateFinancialSummary(projects, sig);
          break;
        case "financial-project":
          html = generateFinancialProject(filterId, projects, sig);
          break;
        case "financial-client":
          html = generateFinancialClient(filterId, projects, sig);
          break;
        case "financial-vendor":
          html = generateFinancialVendor(filterId, projects, sig);
          break;
        case "project-scope":
          html = generateProjectScope(filterId, projects, sig);
          break;
        case "snags":
          html = generateSnagsReport(filterId, projects, state.cache.snags || [], sig);
          break;
        case "progress":
          html = generateProgressReport(filterId, projects, state.cache.progressLogs || [], sig);
          break;
        case "pcr":
          html = generatePcrReport(filterId, projects, state.cache.variations || [], sig);
          break;
        case "takeoff":
          html = generateTakeOffReport(filterId, projects, state.cache.takeoffs || [], sig);
          break;
        case "workorders":
          html = generateWorkOrdersReport(filterId, projects, state.cache.workorders || [], sig);
          break;
      }
    } catch (err) {
      html = `<div style="color:red;padding:2rem;">Error generating report: ${escapeHtml(String(err))}</div>`;
    }

    setPreviewHtml(html);
    setIsGenerating(false);
  }, [reportType, scope, filterId, includeSignature, projects, state.cache, getSignatureOptions]);

  /* ─── PDF Generation ─── */
  const generatePDF = useCallback(async () => {
    if (!previewHtml) return;
    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.cssText = "position:fixed;left:-9999px;top:0;width:900px;z-index:-1;";
    hiddenDiv.innerHTML = previewHtml;
    document.body.appendChild(hiddenDiv);

    try {
      const html2canvas = (window as any).html2canvas;
      const jsPDF = (window as any).jspdf?.jsPDF;
      if (!html2canvas || !jsPDF) {
        alert("PDF libraries not loaded yet. Please try again.");
        return;
      }

      const canvas = await html2canvas(hiddenDiv, { scale: 2, useCORS: true });

      const isLandscape = orientation === "landscape";
      const pdf = new jsPDF({
        orientation: isLandscape ? "l" : "p",
        unit: "mm",
        format: "a4",
      });

      const pageW = isLandscape ? 297 : 210;
      const pageH = isLandscape ? 210 : 297;
      const margin = 10;
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;

      const imgW = canvas.width;
      const imgH = canvas.height;
      const scale = Math.min(contentW / (imgW * 0.264583), contentH / (imgH * 0.264583));
      const scaledW = imgW * 0.264583 * scale;
      const scaledH = imgH * 0.264583 * scale;

      /* Multi-page if needed */
      let remainingH = scaledH;
      let srcY = 0;
      let pageNum = 0;

      while (remainingH > 0) {
        if (pageNum > 0) pdf.addPage();
        const drawH = Math.min(contentH, remainingH);
        const srcHpx = (drawH / scaledH) * imgH;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = imgW;
        tempCanvas.height = Math.ceil(srcHpx);
        const ctx = tempCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, -srcY);
        const sliceData = tempCanvas.toDataURL("image/png");

        pdf.addImage(sliceData, "PNG", margin, margin, scaledW, drawH);
        remainingH -= drawH;
        srcY += srcHpx;
        pageNum++;
        if (pageNum > 20) break; // safety limit
      }

      pdf.save(`report-${reportType}-${todayFormatted().replace(/\//g, "-")}.pdf`);
    } finally {
      document.body.removeChild(hiddenDiv);
    }
  }, [previewHtml, orientation, reportType]);

  /* ─── Share ─── */
  const shareReport = useCallback(async () => {
    if (!previewHtml) return;
    if (navigator.share) {
      try {
        const blob = new Blob([previewHtml], { type: "text/html" });
        const file = new File([blob], `report-${reportType}.html`, { type: "text/html" });
        await navigator.share({
          title: `FieldScan Pro Report — ${reportType}`,
          files: [file],
        });
      } catch {
        /* user cancelled */
      }
    } else {
      alert("Sharing not supported on this device.");
    }
  }, [previewHtml, reportType]);

  /* ─── Show/hide filter dropdown ─── */
  const showFilter = scope !== "all";
  const filterLabel = scope === "project" ? "Project" : scope === "client" ? "Client" : scope === "vendor" ? "Vendor" : "";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="size-5" />
        Reports
      </h2>

      {/* ─── Controls Card ─── */}
      <div className="card space-y-4">
        {/* Report Type */}
        <div>
          <Label htmlFor="report-type" className="mb-1.5 block">Report Type</Label>
          <select
            id="report-type"
            value={reportType}
            onChange={(e) => { setReportType(e.target.value); setPreviewHtml(""); }}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {REPORT_TYPES.map((rt) => (
              <option key={rt.value} value={rt.value}>{rt.label}</option>
            ))}
          </select>
        </div>

        {/* Scope */}
        <div>
          <Label htmlFor="scope" className="mb-1.5 block">Scope</Label>
          <select
            id="scope"
            value={scope}
            onChange={(e) => { setScope(e.target.value as ScopeType); setFilterId(""); setPreviewHtml(""); }}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {SCOPE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Filter dropdown */}
        {showFilter && (
          <div>
            <Label htmlFor="filter" className="mb-1.5 block">{filterLabel}</Label>
            <select
              id="filter"
              value={filterId}
              onChange={(e) => { setFilterId(e.target.value); setPreviewHtml(""); }}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select {filterLabel}...</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Include signature */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="sig-check"
            checked={includeSignature}
            onCheckedChange={(v) => setIncludeSignature(v === true)}
          />
          <Label htmlFor="sig-check" className="text-sm font-normal cursor-pointer">
            Include signature block
          </Label>
        </div>

        {/* Orientation */}
        <div>
          <Label className="mb-1.5 block">PDF Orientation</Label>
          <div className="flex gap-2">
            {(["portrait", "landscape"] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOrientation(o)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  orientation === o
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-card text-[var(--text)] border-input hover:bg-accent"
                }`}
              >
                {o.charAt(0).toUpperCase() + o.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={generateReport}
          disabled={isGenerating || (showFilter && !filterId)}
          className="action-btn w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Loader2 className="size-4 animate-spin mr-1" /> : <FileText className="size-4 mr-1" />}
          Generate Report
        </button>
      </div>

      {/* ─── Preview ─── */}
      {previewHtml && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Preview</h3>
            <div className="flex gap-2">
              <button onClick={shareReport} className="action-btn secondary text-xs py-1.5">
                <Share2 className="size-3.5 mr-1" />
                Share
              </button>
              <button onClick={generatePDF} className="action-btn text-xs py-1.5">
                <Download className="size-3.5 mr-1" />
                Save PDF
              </button>
            </div>
          </div>
          <div
            ref={previewRef}
            className="border rounded-md overflow-auto max-h-[70vh] bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Report Generators
   ═══════════════════════════════════════════ */

function generateFinancialSummary(projects: Project[], sig?: { name: string; signImage: string; date: string }): string {
  if (!projects.length) {
    return wrapUnifiedPage("<p>No projects found.</p>", { title: "Financial Summary (All Projects)" });
  }

  const payments = (getCache("payments") || []) as Payment[];
  let totalContract = 0;
  let totalReceipts = 0;
  let totalOutgoing = 0;

  const rows = projects.map((p) => {
    const projectPayments = payments.filter((pay) => pay.projectId === p.projectId);
    const receipts = projectPayments
      .filter((pay) => pay.paymentDirection === "in")
      .reduce((s, pay) => s + (Number(pay.amount) || 0), 0);
    const outgoing = projectPayments
      .filter((pay) => pay.paymentDirection === "out")
      .reduce((s, pay) => s + (Number(pay.amount) || 0), 0);
    const balance = roundMoney(receipts - outgoing);
    const contract = Number(p.contractSubtotal) || 0;

    totalContract += contract;
    totalReceipts += receipts;
    totalOutgoing += outgoing;

    return `
      <tr>
        <td>${escapeHtml(p.clientName)}</td>
        <td>${escapeHtml(p.siteLocation)}</td>
        <td style="text-align:right;">${moneyValue(contract)}</td>
        <td style="text-align:right;color:var(--success);">${moneyValue(receipts)}</td>
        <td style="text-align:right;color:var(--danger);">${moneyValue(outgoing)}</td>
        <td style="text-align:right;font-weight:600;">${moneyValue(balance)}</td>
      </tr>`;
  }).join("");

  const body = `
    <table class="report-table">
      <thead>
        <tr>
          <th>Client</th><th>Location</th><th style="text-align:right;">Contract Value</th>
          <th style="text-align:right;">Receipts</th><th style="text-align:right;">Outgoing</th><th style="text-align:right;">Balance</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr style="font-weight:700;background:var(--card-light);">
          <td colspan="2">TOTAL</td>
          <td style="text-align:right;">${moneyValue(totalContract)}</td>
          <td style="text-align:right;">${moneyValue(totalReceipts)}</td>
          <td style="text-align:right;">${moneyValue(totalOutgoing)}</td>
          <td style="text-align:right;">${moneyValue(roundMoney(totalReceipts - totalOutgoing))}</td>
        </tr>
      </tbody>
    </table>`;

  return wrapUnifiedPage(body, { title: "Financial Summary (All Projects)", signature: sig });
}

function generateFinancialProject(projectId: string, projects: Project[], sig?: { name: string; signImage: string; date: string }): string {
  const project = projects.find((p) => p.projectId === projectId);
  if (!project) return wrapUnifiedPage("<p>Project not found.</p>", { title: "Financial Report (Project)" });

  const payments = (getCache("payments") || []) as Payment[];
  const projectPayments = payments.filter((p) => p.projectId === projectId);

  const receipts = projectPayments.filter((p) => p.paymentDirection === "in");
  const outgoings = projectPayments.filter((p) => p.paymentDirection === "out");
  const totalReceipts = receipts.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalOutgoing = outgoings.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const contractValue = Number(project.contractSubtotal) || 0;

  const receiptRows = receipts.map((p) => `
    <tr><td>${escapeHtml(p.paymentDate)}</td><td>${escapeHtml(p.payee || "Client")}</td>
    <td>${escapeHtml(p.expenseCategory || "")}</td><td style="text-align:right;color:var(--success);">+${moneyValue(p.amount)}</td></tr>
  `).join("") || '<tr><td colspan="4" style="text-align:center;color:#888;">No receipts</td></tr>';

  const outgoingRows = outgoings.map((p) => `
    <tr><td>${escapeHtml(p.paymentDate)}</td><td>${escapeHtml(p.payee || "")}</td>
    <td>${escapeHtml(p.expenseCategory || "")}</td><td style="text-align:right;color:var(--danger);">-${moneyValue(p.amount)}</td></tr>
  `).join("") || '<tr><td colspan="4" style="text-align:center;color:#888;">No outgoing payments</td></tr>';

  const body = `
    <div style="margin-bottom:1rem;">
      <strong>Project:</strong> ${escapeHtml(project.clientName)} — ${escapeHtml(project.siteLocation)}<br/>
      <strong>Contract Value:</strong> ${moneyValue(contractValue)}<br/>
      <strong>Net Balance:</strong> ${moneyValue(roundMoney(totalReceipts - totalOutgoing))}
    </div>
    <h3 style="font-size:1rem;margin:1rem 0 0.5rem;">Receipts</h3>
    <table class="report-table"><thead><tr><th>Date</th><th>From</th><th>Category</th><th style="text-align:right;">Amount</th></tr></thead><tbody>${receiptRows}</tbody></table>
    <h3 style="font-size:1rem;margin:1rem 0 0.5rem;">Outgoing Payments</h3>
    <table class="report-table"><thead><tr><th>Date</th><th>To</th><th>Category</th><th style="text-align:right;">Amount</th></tr></thead><tbody>${outgoingRows}</tbody></table>
    <div style="margin-top:1rem;display:flex;gap:2rem;">
      <div><strong>Total Receipts:</strong> <span style="color:var(--success);">${moneyValue(totalReceipts)}</span></div>
      <div><strong>Total Outgoing:</strong> <span style="color:var(--danger);">${moneyValue(totalOutgoing)}</span></div>
    </div>`;

  return wrapUnifiedPage(body, { title: "Financial Report — Project", subtitle: `${project.clientName} — ${project.siteLocation}`, signature: sig });
}

function generateFinancialClient(clientName: string, projects: Project[], sig?: { name: string; signImage: string; date: string }): string {
  if (!clientName) return wrapUnifiedPage("<p>Please select a client.</p>", { title: "Financial Report (Client)" });
  const clientProjects = projects.filter((p) => p.clientName === clientName);
  if (!clientProjects.length) return wrapUnifiedPage("<p>No projects found for this client.</p>", { title: "Financial Report (Client)" });

  const payments = (getCache("payments") || []) as Payment[];
  let totalContract = 0;
  let totalReceipts = 0;
  let totalOutgoing = 0;

  const rows = clientProjects.map((p) => {
    const pp = payments.filter((pay) => pay.projectId === p.projectId);
    const receipts = pp.filter((pay) => pay.paymentDirection === "in").reduce((s, pay) => s + (Number(pay.amount) || 0), 0);
    const outgoing = pp.filter((pay) => pay.paymentDirection === "out").reduce((s, pay) => s + (Number(pay.amount) || 0), 0);
    totalContract += Number(p.contractSubtotal) || 0;
    totalReceipts += receipts;
    totalOutgoing += outgoing;
    return `<tr><td>${escapeHtml(p.siteLocation)}</td><td style="text-align:right;">${moneyValue(p.contractSubtotal)}</td><td style="text-align:right;color:var(--success);">${moneyValue(receipts)}</td><td style="text-align:right;color:var(--danger);">${moneyValue(outgoing)}</td><td style="text-align:right;font-weight:600;">${moneyValue(roundMoney(receipts - outgoing))}</td></tr>`;
  }).join("");

  const body = `
    <p><strong>Client:</strong> ${escapeHtml(clientName)}</p>
    <table class="report-table">
      <thead><tr><th>Project Location</th><th style="text-align:right;">Contract</th><th style="text-align:right;">Receipts</th><th style="text-align:right;">Outgoing</th><th style="text-align:right;">Balance</th></tr></thead>
      <tbody>${rows}
        <tr style="font-weight:700;background:var(--card-light);"><td>TOTAL</td><td style="text-align:right;">${moneyValue(totalContract)}</td><td style="text-align:right;">${moneyValue(totalReceipts)}</td><td style="text-align:right;">${moneyValue(totalOutgoing)}</td><td style="text-align:right;">${moneyValue(roundMoney(totalReceipts - totalOutgoing))}</td></tr>
      </tbody>
    </table>`;

  return wrapUnifiedPage(body, { title: "Financial Report — Client", subtitle: clientName, signature: sig });
}

function generateFinancialVendor(vendorId: string, projects: Project[], sig?: { name: string; signImage: string; date: string }): string {
  if (!vendorId) return wrapUnifiedPage("<p>Please select a vendor.</p>", { title: "Financial Report (Vendor)" });
  const vendors = (getCache("vendors") || []) as Vendor[];
  const vendor = vendors.find((v) => v.vendorId === vendorId);
  const vendorName = vendor ? `${vendor.company} (${vendor.trade})` : vendorId;

  const workorders = (getCache("workorders") || []) as WorkOrder[];
  const payments = (getCache("payments") || []) as Payment[];
  const vendorWOs = workorders.filter((w) => w.vendorId === vendorId);
  const vendorPayments = payments.filter((p) => vendorWOs.some((w) => w.projectId === p.projectId && p.payee?.includes(vendor?.company || "")));

  const totalWO = vendorWOs.reduce((s, w) => s + (Number(w.amount) || 0), 0);
  const totalPaid = vendorPayments.filter((p) => p.paymentDirection === "out").reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const woRows = vendorWOs.map((w) => {
    const project = projects.find((p) => p.projectId === w.projectId);
    return `<tr><td>${escapeHtml(w.workOrderId)}</td><td>${escapeHtml(project?.siteLocation || w.projectId)}</td><td>${escapeHtml(w.status)}</td><td style="text-align:right;">${moneyValue(w.amount)}</td></tr>`;
  }).join("") || '<tr><td colspan="4" style="text-align:center;color:#888;">No work orders</td></tr>';

  const body = `
    <p><strong>Vendor:</strong> ${escapeHtml(vendorName)}</p>
    <h3 style="font-size:1rem;margin:1rem 0 0.5rem;">Work Orders</h3>
    <table class="report-table"><thead><tr><th>WO #</th><th>Project</th><th>Status</th><th style="text-align:right;">Amount</th></tr></thead><tbody>${woRows}</tbody></table>
    <div style="margin-top:1rem;display:flex;gap:2rem;">
      <div><strong>Total WO Value:</strong> ${moneyValue(totalWO)}</div>
      <div><strong>Total Paid:</strong> ${moneyValue(totalPaid)}</div>
      <div><strong>Balance:</strong> ${moneyValue(roundMoney(totalWO - totalPaid))}</div>
    </div>`;

  return wrapUnifiedPage(body, { title: "Financial Report — Vendor", subtitle: vendorName, signature: sig });
}

function generateProjectScope(projectId: string, projects: Project[], sig?: { name: string; signImage: string; date: string }): string {
  const project = projects.find((p) => p.projectId === projectId);
  if (!project) return wrapUnifiedPage("<p>Project not found.</p>", { title: "Project Scope" });

  const scopeText = project.scope || "No scope defined for this project.";
  const body = `
    <div style="margin-bottom:1rem;">
      <strong>Client:</strong> ${escapeHtml(project.clientName)}<br/>
      <strong>Location:</strong> ${escapeHtml(project.siteLocation)}<br/>
      <strong>Contract Value:</strong> ${moneyValue(project.contractSubtotal)}
    </div>
    <div style="white-space:pre-wrap;line-height:1.7;font-size:0.9rem;padding:1rem;background:#fafafa;border:1px solid #eee;border-radius:4px;">
      ${escapeHtml(scopeText)}
    </div>`;

  return wrapUnifiedPage(body, { title: "Project Scope", subtitle: `${project.clientName} — ${project.siteLocation}`, signature: sig });
}

function generateSnagsReport(projectId: string, projects: Project[], allSnags: Snag[], sig?: { name: string; signImage: string; date: string }): string {
  const project = projects.find((p) => p.projectId === projectId);
  const snags = allSnags.filter((s) => s.projectId === projectId);
  if (!snags.length) return wrapUnifiedPage("<p>No snags found for this project.</p>", { title: "Snags Report" });

  /* 2x3 grid layout — 6 snags per page */
  const snagCards = snags.map((s) => `
    <div style="border:1px solid #ddd;border-radius:6px;padding:0.75rem;background:#fff;break-inside:avoid;">
      <div style="font-weight:600;font-size:0.85rem;margin-bottom:0.25rem;">Snag #${escapeHtml(s.snagId)}</div>
      ${s.photoUrl ? `<img src="${escapeHtml(s.photoUrl)}" style="width:100%;max-height:150px;object-fit:cover;border-radius:4px;margin-bottom:0.5rem;" onerror="this.style.display='none'" />` : ""}
      <div style="font-size:0.8rem;color:#555;margin-bottom:0.25rem;">${escapeHtml(s.notes)}</div>
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#888;">
        <span>Assigned: ${escapeHtml(s.assigned)}</span>
        <span style="padding:0.1rem 0.4rem;border-radius:999px;background:${s.status === "Resolved" ? "#d4edda" : s.status === "In Progress" ? "#fff3cd" : "#f8d7da"};color:${s.status === "Resolved" ? "#155724" : s.status === "In Progress" ? "#856404" : "#721c24"};">${escapeHtml(s.status)}</span>
      </div>
    </div>
  `).join("");

  const body = `
    <p><strong>Project:</strong> ${escapeHtml(project?.clientName || "")} — ${escapeHtml(project?.siteLocation || "")} &middot; <strong>Total Snags:</strong> ${snags.length}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem;">
      ${snagCards}
    </div>`;

  return wrapUnifiedPage(body, { title: "Snags Report", subtitle: project ? `${project.clientName} — ${project.siteLocation}` : "", signature: sig });
}

function generateProgressReport(projectId: string, projects: Project[], allLogs: ProgressLog[], sig?: { name: string; signImage: string; date: string }): string {
  const project = projects.find((p) => p.projectId === projectId);
  const logs = allLogs.filter((l) => l.projectId === projectId).sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime());
  if (!logs.length) return wrapUnifiedPage("<p>No progress logs found for this project.</p>", { title: "Progress Report" });

  /* Group by trade */
  const byTrade = new Map<string, ProgressLog[]>();
  for (const l of logs) {
    if (!byTrade.has(l.tradeCategory)) byTrade.set(l.tradeCategory, []);
    byTrade.get(l.tradeCategory)!.push(l);
  }

  let tradeHtml = "";
  byTrade.forEach((tradeLogs, trade) => {
    const latest = tradeLogs[0];
    const pct = latest.completionPercentage || 0;
    const barColor = pct >= 100 ? "var(--success)" : pct >= 50 ? "#f0ad4e" : "var(--primary)";
    const rows = tradeLogs.map((l) => `
      <tr><td>${escapeHtml(l.dateRecorded)}</td><td>${l.completionPercentage}%</td><td>${escapeHtml(l.commentNarrative)}</td></tr>
    `).join("");

    tradeHtml += `
      <div style="margin-bottom:1.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <strong>${escapeHtml(trade)}</strong>
          <span style="font-weight:600;">${pct}%</span>
        </div>
        <div style="background:#eee;border-radius:4px;height:20px;overflow:hidden;margin-bottom:0.5rem;">
          <div style="width:${pct}%;background:${barColor};height:100%;transition:width 0.3s;"></div>
        </div>
        <table class="report-table" style="font-size:0.75rem;"><thead><tr><th>Date</th><th>%</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>
      </div>`;
  });

  const body = `
    <p><strong>Project:</strong> ${escapeHtml(project?.clientName || "")} — ${escapeHtml(project?.siteLocation || "")}</p>
    ${tradeHtml}`;

  return wrapUnifiedPage(body, { title: "Progress Report", subtitle: project ? `${project.clientName} — ${project.siteLocation}` : "", signature: sig });
}

function generatePcrReport(projectId: string, projects: Project[], allVariations: Variation[], sig?: { name: string; signImage: string; date: string }): string {
  const project = projects.find((p) => p.projectId === projectId);
  if (!project) return wrapUnifiedPage("<p>Project not found.</p>", { title: "Project Completion Report" });

  const variations = allVariations.filter((v) => v.projectId === projectId && v.status === "Approved");
  const totalVariations = variations.reduce((s, v) => s + (Number(v.total) || 0), 0);

  const varRows = variations.map((v) => `
    <tr><td>${escapeHtml(v.variationNumber)}</td><td>${escapeHtml(v.title)}</td><td style="text-align:right;">${moneyValue(v.total)}</td></tr>
  `).join("") || '<tr><td colspan="3" style="text-align:center;color:#888;">No approved variations</td></tr>';

  const body = `
    <div style="margin-bottom:1rem;">
      <strong>Project:</strong> ${escapeHtml(project.clientName)} — ${escapeHtml(project.siteLocation)}<br/>
      <strong>Contract Value:</strong> ${moneyValue(project.contractSubtotal)}<br/>
      <strong>Approved Variations:</strong> ${moneyValue(totalVariations)}<br/>
      <strong>Final Contract Value:</strong> ${moneyValue(roundMoney((Number(project.contractSubtotal) || 0) + totalVariations))}
    </div>
    <h3 style="font-size:1rem;margin:1rem 0 0.5rem;">Approved Variations</h3>
    <table class="report-table"><thead><tr><th>Number</th><th>Title</th><th style="text-align:right;">Amount</th></tr></thead><tbody>${varRows}</tbody></table>
    <div style="margin-top:1rem;padding:1rem;background:#f8f9fa;border-radius:4px;">
      <strong>Project Status:</strong> ${escapeHtml(project.projectStatus || "Not specified")}
    </div>`;

  return wrapUnifiedPage(body, { title: "Project Completion Report", subtitle: `${project.clientName} — ${project.siteLocation}`, signature: sig });
}

function generateTakeOffReport(projectId: string, projects: Project[], allItems: TakeOffItem[], sig?: { name: string; signImage: string; date: string }): string {
  const project = projects.find((p) => p.projectId === projectId);
  const items = allItems.filter((i) => i.projectId === projectId);
  if (!items.length) return wrapUnifiedPage("<p>No take-off items found for this project.</p>", { title: "Take-Off Report" });

  /* Group by trade category */
  const byCategory = new Map<string, TakeOffItem[]>();
  for (const i of items) {
    if (!byCategory.has(i.tradeCategory)) byCategory.set(i.tradeCategory, []);
    byCategory.get(i.tradeCategory)!.push(i);
  }

  let catHtml = "";
  byCategory.forEach((catItems, cat) => {
    const rows = catItems.map((i) => `
      <tr><td>${escapeHtml(i.roomArea)}</td><td>${escapeHtml(i.description)}</td><td style="text-align:right;">${i.quantity}</td><td>${escapeHtml(i.unit)}</td><td style="text-align:right;">${moneyValue(0)}</td><td style="text-align:right;">${moneyValue(0)}</td></tr>
    `).join("");
    catHtml += `
      <h3 style="font-size:0.95rem;margin:1rem 0 0.5rem;font-weight:700;">${escapeHtml(cat)}</h3>
      <table class="report-table"><thead><tr><th>Room</th><th>Description</th><th style="text-align:right;">Qty</th><th>U/M</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Amount</th></tr></thead><tbody>${rows}</tbody></table>`;
  });

  const body = `
    <p><strong>Project:</strong> ${escapeHtml(project?.clientName || "")} — ${escapeHtml(project?.siteLocation || "")}</p>
    ${catHtml}`;

  return wrapUnifiedPage(body, { title: "Take-Off Report", subtitle: project ? `${project.clientName} — ${project.siteLocation}` : "", signature: sig });
}

function generateWorkOrdersReport(projectId: string, projects: Project[], allWOs: WorkOrder[], sig?: { name: string; signImage: string; date: string }): string {
  const project = projects.find((p) => p.projectId === projectId);
  const wos = allWOs.filter((w) => w.projectId === projectId);
  if (!wos.length) return wrapUnifiedPage("<p>No work orders found for this project.</p>", { title: "Work Orders Report" });

  const vendors = (getCache("vendors") || []) as Vendor[];

  const rows = wos.map((w) => {
    const vendor = vendors.find((v) => v.vendorId === w.vendorId);
    let desc = "";
    try {
      const parsed = JSON.parse(w.description);
      if (parsed.lineItems) desc = parsed.lineItems.map((li: any) => `${li.description} (${li.quantity} ${li.unit})`).join("; ");
      else desc = w.description;
    } catch {
      desc = w.description;
    }
    return `<tr><td>${escapeHtml(w.workOrderId)}</td><td>${escapeHtml(vendor?.company || w.vendorId)}</td><td>${escapeHtml(desc)}</td><td style="text-align:right;">${moneyValue(w.amount)}</td><td><span style="padding:0.1rem 0.4rem;border-radius:999px;font-size:0.7rem;background:${w.status === "Completed" ? "#d4edda" : w.status === "In Progress" ? "#fff3cd" : "#e2e3e5"};color:${w.status === "Completed" ? "#155724" : w.status === "In Progress" ? "#856404" : "#383d41"};">${escapeHtml(w.status)}</span></td></tr>`;
  }).join("");

  const total = wos.reduce((s, w) => s + (Number(w.amount) || 0), 0);

  const body = `
    <p><strong>Project:</strong> ${escapeHtml(project?.clientName || "")} — ${escapeHtml(project?.siteLocation || "")}</p>
    <table class="report-table">
      <thead><tr><th>WO #</th><th>Vendor</th><th>Description</th><th style="text-align:right;">Amount</th><th>Status</th></tr></thead>
      <tbody>${rows}
        <tr style="font-weight:700;background:var(--card-light);"><td colspan="3">TOTAL</td><td style="text-align:right;">${moneyValue(total)}</td><td></td></tr>
      </tbody>
    </table>`;

  return wrapUnifiedPage(body, { title: "Work Orders Report", subtitle: project ? `${project.clientName} — ${project.siteLocation}` : "", signature: sig });
}
