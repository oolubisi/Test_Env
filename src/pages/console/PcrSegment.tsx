/* ───────────────────────────────────────────
   PCR Console Segment — Project Completion Report
   ─────────────────────────────────────────── */

import { useState, useMemo, useCallback, useEffect } from "react";
import { FileCheck, Save, Loader2 } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { callApi } from "@/lib/api";
import { moneyValue } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
const PCR_STATUSES = [
  "Complete",
  "Substantially Complete",
  "Practical Completion",
  "Pending Snag Resolution",
  "Handed Over",
];

interface PcrSegmentProps {
  projectId: string;
}

export default function PcrSegment({ projectId }: PcrSegmentProps) {
  const { state, refresh } = useAppState();

  const project = useMemo(() => {
    return (state.cache.projects || []).find((p) => p.projectId === projectId) || null;
  }, [state.cache.projects, projectId]);

  /* ─── PCR form state ─── */
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [pcrStatus, setPcrStatus] = useState("");
  const [showWht, setShowWht] = useState(false);
  const [completionSummary, setCompletionSummary] = useState("");
  const [completionDeclaration, setCompletionDeclaration] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  /* ─── Approved variations ─── */
  const approvedVariations = useMemo(() => {
    return (state.cache.variations || [])
      .filter((v) => v.projectId === projectId && v.status === "Approved")
      .sort((a, b) => (a.variationNumber || "").localeCompare(b.variationNumber || ""));
  }, [state.cache.variations, projectId]);

  const totalApprovedVariations = useMemo(() => {
    return approvedVariations.reduce((s, v) => s + (Number(v.total) || 0), 0);
  }, [approvedVariations]);

  /* ─── Load PCR data from project if available ─── */
  useEffect(() => {
    if (project) {
      /* Try to parse PCR fields from project notes or settings */
      try {
        const pcrData = project.notes ? JSON.parse(project.notes) : {};
        if (pcrData.pcr) {
          setCompletionPercentage(pcrData.pcr.completionPercentage || 0);
          setPcrStatus(pcrData.pcr.status || "");
          setShowWht(pcrData.pcr.showWht || false);
          setCompletionSummary(pcrData.pcr.completionSummary || "");
          setCompletionDeclaration(pcrData.pcr.completionDeclaration || "");
        }
      } catch {
        /* No PCR data stored yet — use defaults */
      }
    }
  }, [project]);

  /* ─── Save PCR fields ─── */
  const handleSave = useCallback(async () => {
    if (!project) return;
    setSaving(true);
    setSavedMsg("");

    const payload = {
      projectId,
      pcr: {
        completionPercentage,
        status: pcrStatus,
        showWht,
        completionSummary,
        completionDeclaration,
      },
    };

    try {
      /* Store PCR data inside project notes as JSON */
      let existingNotes = "";
      try {
        const parsed = JSON.parse(project.notes || "{}");
        parsed.pcr = payload.pcr;
        existingNotes = JSON.stringify(parsed);
      } catch {
        existingNotes = JSON.stringify({ pcr: payload.pcr, originalNotes: project.notes || "" });
      }

      const resp = await callApi("updateProject", {
        projectId,
        notes: existingNotes,
      });

      if (resp.status === "success" || resp.status === "queued") {
        setSavedMsg("PCR fields saved successfully.");
        refresh();
        setTimeout(() => setSavedMsg(""), 3000);
      } else {
        alert(resp.message || "Failed to save PCR fields.");
      }
    } catch {
      alert("Network error — changes queued for sync.");
    } finally {
      setSaving(false);
    }
  }, [project, projectId, completionPercentage, pcrStatus, showWht, completionSummary, completionDeclaration, refresh]);

  if (!project) {
    return (
      <div className="card text-center py-8 text-muted-foreground">
        <FileCheck className="size-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <h3 className="text-sm font-semibold flex items-center gap-1.5">
        <FileCheck className="size-4" />
        Project Completion Report
      </h3>

      {/* PCR Form */}
      <div className="card space-y-4">
        {/* Completion % */}
        <div>
          <Label htmlFor="pcr-pct" className="mb-1.5 block">
            Completion Percentage ({completionPercentage}%)
          </Label>
          <Input
            id="pcr-pct"
            type="range"
            min={0}
            max={100}
            value={completionPercentage}
            onChange={(e) => setCompletionPercentage(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span className="font-medium text-[var(--text)]">{completionPercentage}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="pcr-status" className="mb-1.5 block">Completion Status</Label>
          <select
            id="pcr-status"
            value={pcrStatus}
            onChange={(e) => setPcrStatus(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select status...</option>
            {PCR_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Show WHT */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="pcr-wht"
            checked={showWht}
            onCheckedChange={(v) => setShowWht(v === true)}
          />
          <Label htmlFor="pcr-wht" className="text-sm font-normal cursor-pointer">
            Show WHT in financial snapshot
          </Label>
        </div>

        {/* Completion Summary */}
        <div>
          <Label htmlFor="pcr-summary" className="mb-1.5 block">Completion Summary</Label>
          <Textarea
            id="pcr-summary"
            value={completionSummary}
            onChange={(e) => setCompletionSummary(e.target.value)}
            placeholder="Describe the overall completion status of the project..."
            rows={4}
          />
        </div>

        {/* Completion Declaration */}
        <div>
          <Label htmlFor="pcr-declaration" className="mb-1.5 block">Completion Declaration</Label>
          <Textarea
            id="pcr-declaration"
            value={completionDeclaration}
            onChange={(e) => setCompletionDeclaration(e.target.value)}
            placeholder="Official declaration text for project completion..."
            rows={4}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="action-btn w-full justify-center disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : <Save className="size-4 mr-1" />}
          Save PCR Fields
        </button>

        {savedMsg && (
          <p className="text-xs text-green-600 text-center">{savedMsg}</p>
        )}
      </div>

      {/* ─── Approved Variations (read-only) ─── */}
      <div className="card space-y-3">
        <h4 className="text-sm font-semibold">Approved Variations</h4>

        {approvedVariations.length === 0 && (
          <p className="text-xs text-muted-foreground">No approved variations for this project.</p>
        )}

        {approvedVariations.length > 0 && (
          <>
            <div className="space-y-2">
              {approvedVariations.map((v) => (
                <div key={v.variationId} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">{v.variationNumber}</span>
                    <div className="text-sm">{v.title}</div>
                  </div>
                  <div className="font-medium text-sm">{moneyValue(v.total || 0)}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t font-semibold text-sm">
              <span>Total Approved Variations</span>
              <span>{moneyValue(totalApprovedVariations)}</span>
            </div>
          </>
        )}

        {/* Financial snapshot */}
        <div className="card-light mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Original Contract:</span>
            <span className="font-medium">{moneyValue(project.contractSubtotal || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Approved Variations:</span>
            <span className="font-medium text-green-600">+{moneyValue(totalApprovedVariations)}</span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span className="font-semibold">Revised Contract Value:</span>
            <span className="font-bold">{moneyValue((Number(project.contractSubtotal) || 0) + totalApprovedVariations)}</span>
          </div>
          {showWht && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">WHT (5%):</span>
              <span className="text-muted-foreground">{moneyValue(((Number(project.contractSubtotal) || 0) + totalApprovedVariations) * 0.05)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
