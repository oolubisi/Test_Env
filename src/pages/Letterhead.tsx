/* ───────────────────────────────────────────
   Letterhead Page — Professional letter editor
   ─────────────────────────────────────────── */

import { useState, useCallback, useRef } from "react";
import { Printer, Download, Share2 } from "lucide-react";
import { BRANDING } from "@/config/constants";
import { generateLogoBlock, generateUnifiedFooter, generateUnifiedSignatureBlock } from "@/lib/branding";
import { escapeHtml, todayFormatted } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function defaultDate(): string {
  const d = new Date();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Letterhead() {
  const [date, setDate] = useState(defaultDate());
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [salutation, setSalutation] = useState("Dear Sir/Madam,");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryTitle, setSignatoryTitle] = useState("");
  const [includeSignature, setIncludeSignature] = useState(true);
  const [previewHtml, setPreviewHtml] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  /* ─── Generate letter HTML ─── */
  const generateLetterHTML = useCallback((): string => {
    const logoBlock = generateLogoBlock();
    const footer = generateUnifiedFooter();
    const sigBlock = includeSignature
      ? generateUnifiedSignatureBlock({
          name: signatoryName || BRANDING.companyName,
          signImage: "",
          date: date || todayFormatted(),
        })
      : "";

    /* Format body paragraphs */
    const paragraphs = body
      .split("\n")
      .filter((p) => p.trim())
      .map((p) => `<p style="margin-bottom:0.75rem;text-align:justify;">${escapeHtml(p)}</p>`)
      .join("");

    return `
      <div style="font-family:'Calibri','Georgia',serif;font-size:11pt;line-height:1.6;color:#1a1a1a;max-width:210mm;margin:0 auto;padding:20mm;background:white;">
        ${logoBlock}
        <div style="text-align:right;margin-bottom:1.5rem;font-size:11pt;">
          ${escapeHtml(date)}
        </div>
        <div style="margin-bottom:1.5rem;font-size:11pt;">
          <div style="font-weight:700;">${escapeHtml(clientName)}</div>
          <div style="white-space:pre-line;">${escapeHtml(clientAddress)}</div>
        </div>
        <div style="margin-bottom:1rem;font-size:11pt;">${escapeHtml(salutation)}</div>
        ${title ? `<div style="font-size:14pt;font-weight:700;margin-bottom:1rem;border-bottom:2px solid #1a1a1a;padding-bottom:0.3rem;">${escapeHtml(title)}</div>` : ""}
        <div style="font-size:11pt;">
          ${paragraphs || "<p style=\"color:#888;\">[Letter body will appear here]</p>"}
        </div>
        ${sigBlock}
        ${footer}
      </div>
    `;
  }, [date, clientName, clientAddress, salutation, title, body, signatoryName, includeSignature]);

  /* ─── Generate preview ─── */
  const handleGeneratePreview = useCallback(() => {
    setPreviewHtml(generateLetterHTML());
  }, [generateLetterHTML]);

  /* ─── Print ─── */
  const handlePrint = useCallback(() => {
    const html = generateLetterHTML();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>${escapeHtml(title || "Letter")}</title></head>
      <body style="margin:0;padding:0;">${html}</body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  }, [generateLetterHTML, title]);

  /* ─── PDF Save ─── */
  const handleSavePDF = useCallback(async () => {
    const html = generateLetterHTML();
    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;z-index:-1;";
    hiddenDiv.innerHTML = html;
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
      const margin = 0;
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

      const safeTitle = (title || "letter").replace(/[^a-z0-9]/gi, "_").toLowerCase();
      pdf.save(`letter-${safeTitle}-${todayFormatted().replace(/\//g, "-")}.pdf`);
    } finally {
      document.body.removeChild(hiddenDiv);
    }
  }, [generateLetterHTML, title]);

  /* ─── Share ─── */
  const handleShare = useCallback(async () => {
    const html = generateLetterHTML();
    if (navigator.share) {
      try {
        const blob = new Blob([html], { type: "text/html" });
        const file = new File([blob], `letter-${(title || "draft").replace(/\s+/g, "_")}.html`, { type: "text/html" });
        await navigator.share({
          title: `Letter — ${title || "Draft"}`,
          files: [file],
        });
      } catch {
        /* user cancelled */
      }
    } else {
      alert("Sharing not supported on this device.");
    }
  }, [generateLetterHTML, title]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Printer className="size-5" />
        Letterhead
      </h2>

      {/* ─── Form Card ─── */}
      <div className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lh-date" className="mb-1.5 block">Date</Label>
            <Input
              id="lh-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="21 June 2026"
            />
          </div>
          <div>
            <Label htmlFor="lh-client" className="mb-1.5 block">Client Name</Label>
            <Input
              id="lh-client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client / Recipient name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="lh-address" className="mb-1.5 block">Client Address</Label>
          <Textarea
            id="lh-address"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            placeholder="Full address"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="lh-salutation" className="mb-1.5 block">Salutation</Label>
          <Input
            id="lh-salutation"
            value={salutation}
            onChange={(e) => setSalutation(e.target.value)}
            placeholder="Dear Sir/Madam,"
          />
        </div>

        <div>
          <Label htmlFor="lh-title" className="mb-1.5 block">Subject / Title</Label>
          <Input
            id="lh-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="RE: Subject of the letter"
            className="font-semibold"
          />
        </div>

        <div>
          <Label htmlFor="lh-body" className="mb-1.5 block">Body</Label>
          <Textarea
            id="lh-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type the letter body here. Each new line will be a new paragraph."
            rows={8}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lh-sig-name" className="mb-1.5 block">Signatory Name</Label>
            <Input
              id="lh-sig-name"
              value={signatoryName}
              onChange={(e) => setSignatoryName(e.target.value)}
              placeholder="Name for signature"
            />
          </div>
          <div>
            <Label htmlFor="lh-sig-title" className="mb-1.5 block">Signatory Title</Label>
            <Input
              id="lh-sig-title"
              value={signatoryTitle}
              onChange={(e) => setSignatoryTitle(e.target.value)}
              placeholder="e.g. Managing Director"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="lh-sig-check"
            checked={includeSignature}
            onCheckedChange={(v) => setIncludeSignature(v === true)}
          />
          <Label htmlFor="lh-sig-check" className="text-sm font-normal cursor-pointer">
            Include signature block
          </Label>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" onClick={handleGeneratePreview} className="action-btn">
            <Printer className="size-4 mr-1" />
            Preview Letter
          </button>
          <button type="button" onClick={handlePrint} className="action-btn secondary">
            <Printer className="size-4 mr-1" />
            Print Letter
          </button>
          <button type="button" onClick={handleSavePDF} className="action-btn secondary">
            <Download className="size-4 mr-1" />
            Save PDF
          </button>
          <button type="button" onClick={handleShare} className="action-btn secondary">
            <Share2 className="size-4 mr-1" />
            Share
          </button>
        </div>
      </div>

      {/* ─── Preview ─── */}
      {previewHtml && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Preview</h3>
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
