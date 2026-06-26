/* ───────────────────────────────────────────
   Profile Segment — Project details + financials
   ─────────────────────────────────────────── */

import { useMemo } from "react";
import { Phone, MapPin, User, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { moneyValue, getTaxRate, roundMoney } from "@/lib/utils";
import type { Project, Settings } from "@/types";

interface ProfileSegmentProps {
  project: Project;
  settings: Settings;
}

export default function ProfileSegment({
  project,
  settings,
}: ProfileSegmentProps) {
  /* ── Financial calculations ── */
  const financials = useMemo(() => {
    const subtotal = Number(project.contractSubtotal) || 0;
    const vatRate = getTaxRate("VAT");
    const whtRate = getTaxRate("WHT");
    const vat = roundMoney(subtotal * (vatRate / 100));
    const total = roundMoney(subtotal + vat);
    const wht = roundMoney(total * (whtRate / 100));
    const netReceivable = roundMoney(total - wht);
    return { subtotal, vatRate, whtRate, vat, total, wht, netReceivable };
  }, [project.contractSubtotal, settings.VAT, settings.WHT]);

  return (
    <div className="space-y-4">
      {/* ── Client Details Card ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="size-4 text-[var(--primary)]" />
            Client Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Client Name
            </label>
            <p className="text-sm font-medium mt-0.5">
              {project.clientName || "—"}
            </p>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Location
            </label>
            <p className="text-sm mt-0.5 flex items-start gap-1.5">
              <MapPin className="size-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              {project.siteLocation || "—"}
            </p>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Phone
            </label>
            <p className="text-sm mt-0.5">
              {project.clientPhone ? (
                <a
                  href={`tel:${project.clientPhone}`}
                  className="flex items-center gap-1.5 text-[var(--primary)] hover:underline"
                >
                  <Phone className="size-3.5" />
                  {project.clientPhone}
                </a>
              ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="size-3.5" />—
                </span>
              )}
            </p>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Notes
            </label>
            <textarea
              readOnly
              value={project.notes || ""}
              className="w-full mt-0.5 text-sm bg-[var(--card-light)] border rounded-md p-2 resize-none focus:outline-none"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Financial Breakdown Card ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="size-4 text-[var(--primary)]" />
            Financial Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center py-1">
            <span className="text-sm">Contract Subtotal</span>
            <span className="text-sm font-semibold">
              {moneyValue(financials.subtotal)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">
              VAT ({financials.vatRate}%)
            </span>
            <span className="text-sm text-muted-foreground">
              {moneyValue(financials.vat)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">
              WHT ({financials.whtRate}%)
            </span>
            <span className="text-sm text-muted-foreground">
              {moneyValue(financials.wht)}
            </span>
          </div>

          <div className="border-t pt-2 mt-1">
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-semibold">Total Contract Value</span>
              <span className="text-sm font-semibold">
                {moneyValue(financials.total)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-muted-foreground">
              Net Receivable (after WHT)
            </span>
            <span className="text-xs text-muted-foreground">
              {moneyValue(financials.netReceivable)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
