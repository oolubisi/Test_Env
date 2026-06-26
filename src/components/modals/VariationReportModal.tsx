/* ───────────────────────────────────────────
   VariationReport Modal — Preview & PDF
   ─────────────────────────────────────────── */

import { useState, useCallback, useMemo } from "react";
import { Download } from "lucide-react";
import Modal from "@/components/Modal";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { wrapUnifiedPage } from "@/lib/branding";
import { moneyValue, roundMoney, escapeHtml, todayFormatted } from "@/lib/utils";
import type { Variation, Project } from "@/types";

interface VariationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  variation: Variation | null;
  project: Project | null;
}

function renderVariationReport(variation: Variation, project: Project | null, includeClientSig: boolean): string {
  const items = (() => {
    try {
      const parsed = JSON.parse(variation.lineItems || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const itemRows = items.length
    ? items.map((li: any) => `
      <tr>
        <td>${escapeHtml(li.description || "")}</td>
        <td style="text-align:right;">${li.quantity || 0}</td>
        <td style="text-align:right;">${moneyValue(li.rate || 0)}</td>
        <td style="text-align:right;">${moneyValue(roundMoney((Number(li.quantity) || 0) * (Number(li.rate) || 0)))}</td>
      </tr>
    `).join("")
    : '<tr><td colspan="4" style="text-align:center;color:#888;">No line items</td></tr>';

  const clientSigBlock = includeClientSig
    ? `
    <div style="margin-top:3rem;display:flex;justify-content:space-between;align-items:flex-end;">
      <div style="text-align:center;">
        <div style="border-top:1px solid #333;width:200px;margin:0.5rem auto 0.2rem;"></div>
        <div style="font-size:0.8rem;font-weight:600;">Contractor Signature</div>
        <div style="font-size:0.7rem;color:#666;">Date: ${todayFormatted()}</div>
      </div>
      <div style="text-align:center;">
        <div style="border-top:1px solid #333;width:200px;margin:0.5rem auto 0.2rem;"></div>
        <div style="font-size:0.8rem;font-weight:600;">Client Signature</div>
        <div style="font-size:0.7rem;color:#666;">Date: _____________</div>
      </div>
    </div>`
    : "";

  const body = `
    <div style="margin-bottom:1rem;">
      <strong>Project:</strong> ${escapeHtml(project?.clientName || "")} — ${escapeHtml(project?.siteLocation || "")}<br/>
      <strong>Variation No:</strong> ${escapeHtml(variation.variationNumber)}<br/>
      <strong>Date:</strong> ${escapeHtml(variation.date || todayFormatted())}<br/>
      <strong>Title:</strong> ${escapeHtml(variation.title)}<br/>
      <strong>Status:</strong> <span style="padding:0.15rem 0.5rem;border-radius:999px;font-size:0.75rem;background:${variation.status === "Approved" ? "#d4edda" : variation.status === "Rejected" ? "#f8d7da" : "#fff3cd"};color:${variation.status === "Approved" ? "#155724" : variation.status === "Rejected" ? "#721c24" : "#856404"};">${escapeHtml(variation.status)}</span>
    </div>

    <h3 style="font-size:0.95rem;font-weight:700;margin:1rem 0 0.5rem;">Line Items</h3>
    <table class="report-table">
      <thead>
        <tr><th>Description</th><th style="text-align:right;">Qty</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Amount</th></tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div style="margin-top:1rem;text-align:right;">
      <div style="margin-bottom:0.25rem;"><strong>Subtotal:</strong> ${moneyValue(variation.subtotal || 0)}</div>
      <div style="margin-bottom:0.25rem;"><strong>VAT (7.5%):</strong> ${moneyValue(variation.vat || 0)}</div>
      <div style="font-size:1rem;font-weight:700;"><strong>Total:</strong> ${moneyValue(variation.total || 0)}</div>
    </div>

    ${variation.notes ? `<div style="margin-top:1rem;padding:0.75rem;background:#fafafa;border:1px solid #eee;border-radius:4px;"><strong>Notes:</strong><br/>${escapeHtml(variation.notes)}</div>` : ""}

    ${variation.approvedBy ? `<div style="margin-top:0.5rem;"><strong>Approved By:</strong> ${escapeHtml(variation.approvedBy)}</div>` : ""}

    ${clientSigBlock}
  `;

  return wrapUnifiedPage(body, {
    title: "Variation Report",
    subtitle: `${variation.variationNumber} — ${variation.title}`,
    signature: undefined,
  });
}

export default function VariationReportModal({ isOpen, onClose, variation, project }: VariationReportModalProps) {
  const [includeClientSig, setIncludeClientSig] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  /* Generate preview when modal opens or checkbox changes */
  useMemo(() => {
    if (isOpen && variation) {
      setPreviewHtml(renderVariationReport(variation, project, includeClientSig));
    }
  }, [isOpen, variation, project, includeClientSig]);

  /* ─── PDF Save ─── */
  const handleSavePDF = useCallback(async () => {
    if (!variation || !previewHtml) return;
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

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const margin = 10;
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;

      const imgW = canvas.width;
      const imgH = canvas.height;
      const scale = Math.min(contentW / (imgW * 0.264583), contentH / (imgH * 0.264583));
      const scaledW = imgW * 0.264583 * scale;
      const scaledH = imgH * 0.264583 * scale;

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
        if (pageNum > 10) break;
      }

      pdf.save(`variation-${variation.variationNumber}-${todayFormatted().replace(/\//g, "-")}.pdf`);
    } finally {
      document.body.removeChild(hiddenDiv);
    }
  }, [variation, previewHtml]);

  if (!variation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Variation Report Preview"
      size="xl"
      onSubmit={undefined}
    >
      <div className="space-y-3">
        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="client-sig"
              checked={includeClientSig}
              onCheckedChange={(v) => setIncludeClientSig(v === true)}
            />
            <Label htmlFor="client-sig" className="text-sm font-normal cursor-pointer">
              Include client signature line
            </Label>
          </div>
          <button onClick={handleSavePDF} className="action-btn text-xs py-1.5">
            <Download className="size-3.5 mr-1" />
            Save PDF
          </button>
        </div>

        {/* Preview */}
        {previewHtml && (
          <div
            className="border rounded-md overflow-auto max-h-[60vh] bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>
    </Modal>
  );
}
