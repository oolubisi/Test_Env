/* ───────────────────────────────────────────
   Utility Functions
   ─────────────────────────────────────────── */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ATTACHMENT_DELIMITER } from "@/config/constants";
import { BRANDING } from "@/config/constants";
import type { Payment } from "@/types";

/** Tailwind class merger */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── HTML sanitisation ─── */

export function escapeHtml(str: string): string {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function escapeAttr(str: string): string {
  if (!str) return "";
  return str.replace(/["&<>]/g, (c) => ({ '"': "&quot;", "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

/* ─── Currency / number formatting (Naira) ─── */

export function roundMoney(val: number | string): number {
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (!isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export function moneyValue(val: number | string): string {
  const n = roundMoney(val);
  return "\u20A6 " + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Attachment helpers ─── */

export function splitAttachments(val: string | undefined | null): string[] {
  if (!val) return [];
  return val.split(ATTACHMENT_DELIMITER).filter((s) => s.trim() !== "");
}

export function normalizeAttachments(
  files: string | string[] | undefined | null
): string {
  if (!files) return "";
  if (typeof files === "string") return files;
  return files.join(ATTACHMENT_DELIMITER);
}

/* ─── Identity comparison ─── */

export function idsMatch(a: string | undefined | null, b: string | undefined | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return String(a).trim() === String(b).trim();
}

/* ─── Image compression ─── */

export function compressImageToTargetLimit(
  base64: string,
  maxBytes: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      let quality = 0.92;

      /* Try reducing dimensions first */
      while (width > 800 && height > 800) {
        width = Math.round(width * 0.75);
        height = Math.round(height * 0.75);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      const tryCompress = () => {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const size = Math.ceil((dataUrl.length * 3) / 4);
        if (size > maxBytes && quality > 0.15) {
          quality -= 0.1;
          tryCompress();
        } else {
          resolve(dataUrl);
        }
      };
      tryCompress();
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

/* ─── PDF compression ─── */

export async function compressPdfToTargetLimit(
  base64: string,
  maxBytes: number
): Promise<string> {
  try {
    const { PDFDocument } = await import("pdf-lib");
    const bytes = Uint8Array.from(
      atob(base64.split(",")[1] || base64),
      (c) => c.charCodeAt(0)
    );
    const pdfDoc = await PDFDocument.load(bytes, { updateMetadata: false });

    /* Try to compress by re-saving with lower quality images */
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      /* If page is very large, scale it down */
      if (width > 2000 || height > 2000) {
        const scale = Math.min(2000 / width, 2000 / height);
        page.setSize(width * scale, height * scale);
      }
    }

    const compressed = await pdfDoc.save({ useObjectStreams: true });
    const compressedBase64 = btoa(
      Array.from(compressed as Uint8Array)
        .map((b: number) => String.fromCharCode(b))
        .join("")
    );
    const result = "data:application/pdf;base64," + compressedBase64;

    /* If still too large, we did our best — return anyway */
    const size = Math.ceil((compressedBase64.length * 3) / 4);
    if (size > maxBytes) {
      console.warn("PDF could not be compressed below target size");
    }
    return result;
  } catch {
    /* pdf-lib not available or error — return original */
    return base64;
  }
}

/* ─── Drive URL conversion ─── */

export function getDirectImageUrl(url: string): string {
  if (!url) return "";
  /* Google Drive file ID extraction */
  const driveMatch = url.match(/(?:id=|\/d\/|drive\.google\.com\/file\/d\/)([\w-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    /* Use a proxy endpoint via GAS */
    return `${(window as any).GAS_URL || ""}?id=${fileId}&type=image`;
  }
  return url;
}

/* ─── GPS helper ─── */

export function getGPSLocation(): Promise<string> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        resolve(`${lat}, ${lng}`);
      },
      () => resolve(""),
      { timeout: 8000, enableHighAccuracy: false }
    );
  });
}

/* ─── Date formatting ─── */

export function todayFormatted(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatDateForInput(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

export function parseInputDate(isoStr: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/* ─── Payment helpers ─── */

export function paymentDirectionOf(p: Payment): "out" | "in" | "" {
  return (p.paymentDirection as "out" | "in" | "") || "";
}

export function isClientReceipt(p: Payment): boolean {
  return paymentDirectionOf(p) === "in";
}

export function isPettyExpense(p: Payment): boolean {
  return paymentDirectionOf(p) === "out" && (p.payee || "").toLowerCase().includes("petty");
}

/* ─── Tax helpers ─── */

export function getTaxRate(key: "VAT" | "WHT" | string): number {
  try {
    const settings = JSON.parse(localStorage.getItem("settings_backup") || "{}");
    if (settings[key] !== undefined) return Number(settings[key]);
  } catch { /* ignore */ }
  if (key === "VAT") return BRANDING.defaultVat;
  if (key === "WHT") return BRANDING.defaultWht;
  return 0;
}

export function formatTaxRate(rate: number): string {
  return `${rate}%`;
}

export function calculateTax(amount: number, key: "VAT" | "WHT" | string): number {
  const rate = getTaxRate(key) / 100;
  return roundMoney(amount * rate);
}

/* ─── Toast helper (non-blocking) ─── */

export function showSyncToast(message: string, durationMs = 3000): void {
  /* Use sonner if available, else fall back to a custom DOM toast */
  const sonner = (window as any).toast;
  if (sonner && typeof sonner.info === "function") {
    sonner.info(message, { duration: durationMs });
    return;
  }

  /* Custom DOM toast */
  let toastEl = document.getElementById("sync-toast");
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.id = "sync-toast";
    toastEl.style.cssText = `
      position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%);
      background: #1a1a1a; color: #fff; padding: 0.6rem 1.2rem;
      border-radius: 0.5rem; font-size: 0.85rem; z-index: 9999;
      opacity: 0; transition: opacity 0.3s; pointer-events: none;
    `;
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.style.opacity = "1";
  setTimeout(() => {
    if (toastEl) toastEl.style.opacity = "0";
  }, durationMs);
}

/* ─── PDF compression UI ─── */

export function showPdfCompressing(): void {
  showSyncToast("Compressing PDF…", 10000);
}

export function hidePdfCompressing(): void {
  /* Toast auto-hides, no-op */
}
