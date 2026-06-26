/* ───────────────────────────────────────────
   Variations Console Segment
   ─────────────────────────────────────────── */

import { useState, useMemo, useCallback, useEffect } from "react";
import { FileText, Plus, Pencil, FileOutput } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { moneyValue } from "@/lib/utils";
import { callApi, getCache } from "@/lib/api";
import VariationModal from "@/components/modals/VariationModal";
import VariationReportModal from "@/components/modals/VariationReportModal";
import type { Variation } from "@/types";

interface VariationsSegmentProps {
  projectId: string;
}

export default function VariationsSegment({ projectId }: VariationsSegmentProps) {
  const { state, refresh } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editingVariation, setEditingVariation] = useState<Variation | null>(null);
  const [reportVariation, setReportVariation] = useState<Variation | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [loading, setLoading] = useState(true);

  const project = useMemo(() => {
    return (state.cache.projects || []).find((p) => p.projectId === projectId) || null;
  }, [state.cache.projects, projectId]);

  const projectSuffix = useMemo(() => {
    return projectId.slice(-3).padStart(3, "0");
  }, [projectId]);

  /* ─── Load variations ─── */
  useEffect(() => {
    async function load() {
      setLoading(true);
      /* Try API first, fall back to cache */
      try {
        const resp = await callApi("getVariations", { projectId });
        if (resp.status === "success" && resp.data && Array.isArray(resp.data)) {
          setVariations(resp.data as Variation[]);
        } else {
          const cached = (state.cache.variations || []).filter((v) => v.projectId === projectId);
          setVariations(cached);
        }
      } catch {
        const cached = (state.cache.variations || []).filter((v) => v.projectId === projectId);
        setVariations(cached);
      }
      setLoading(false);
    }
    load();
  }, [projectId, state.cache.variations]);

  const handleNew = useCallback(() => {
    setEditingVariation(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((v: Variation) => {
    setEditingVariation(v);
    setModalOpen(true);
  }, []);

  const handleReport = useCallback((v: Variation) => {
    setReportVariation(v);
    setReportModalOpen(true);
  }, []);

  const handleSaved = useCallback(() => {
    refresh();
    /* Refresh local list */
    const cached = (getCache("variations") || []).filter((v: Variation) => v.projectId === projectId);
    setVariations(cached);
    setModalOpen(false);
  }, [refresh, projectId]);

  const handleDelete = useCallback((variationId: string) => {
    setVariations((prev) => prev.filter((v) => v.variationId !== variationId));
  }, []);

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "Approved": return "border-l-green-500";
      case "Submitted": return "border-l-blue-500";
      case "Rejected": return "border-l-red-500";
      default: return "border-l-gray-400";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Approved": return { bg: "#d4edda", color: "#155724" };
      case "Submitted": return { bg: "#cce5ff", color: "#004085" };
      case "Rejected": return { bg: "#f8d7da", color: "#721c24" };
      default: return { bg: "#e2e3e5", color: "#383d41" };
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-8 text-muted-foreground">
        <FileText className="size-6 mx-auto mb-2 animate-pulse" />
        <p className="text-sm">Loading variations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <FileText className="size-4" />
          Variations ({variations.length})
        </h3>
        <button onClick={handleNew} className="action-btn text-xs py-1.5">
          <Plus className="size-3.5 mr-1" />
          New Variation
        </button>
      </div>

      {/* List */}
      {variations.length === 0 && (
        <div className="card text-center py-8 text-muted-foreground">
          <FileText className="size-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No variations recorded yet.</p>
          <button onClick={handleNew} className="action-btn mt-3 text-xs">
            <Plus className="size-3.5 mr-1" />
            Create Variation
          </button>
        </div>
      )}

      {variations.map((v) => {
        const badge = getStatusBadgeStyle(v.status);
        return (
          <div
            key={v.variationId}
            className={`card border-l-4 ${getStatusBorderColor(v.status)} p-0 overflow-hidden`}
          >
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{v.variationNumber}</span>
                    <span
                      className="status-badge text-[10px]"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {v.status}
                    </span>
                  </div>
                  <div className="font-medium text-sm mt-0.5">{v.title}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{v.date || "No date"}</span>
                    {v.approvedBy && <span>Approved by: {v.approvedBy}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-sm">{moneyValue(v.total || 0)}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                <button
                  onClick={() => handleEdit(v)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  <Pencil className="size-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleReport(v)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  <FileOutput className="size-3" />
                  Report
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Variation Modal */}
      <VariationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        projectSuffix={projectSuffix}
        variation={editingVariation}
        existingVariations={variations}
        onSaved={handleSaved}
        onDelete={handleDelete}
      />

      {/* Report Modal */}
      <VariationReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        variation={reportVariation}
        project={project}
      />
    </div>
  );
}
