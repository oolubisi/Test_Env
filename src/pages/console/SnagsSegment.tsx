/* ───────────────────────────────────────────
   Snags Segment — Snag list with local photos
   ─────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react";
import { Plus, AlertTriangle, Info, CheckCircle2, User, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { callApi, setCache, getCache } from "@/lib/api";
import { cn } from "@/lib/utils";
import SnagModal from "@/components/modals/SnagModal";
import type { Snag } from "@/types";

interface SnagsSegmentProps {
  projectId: string;
}

export default function SnagsSegment({ projectId }: SnagsSegmentProps) {
  const [snags, setSnags] = useState<Snag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSnag, setEditingSnag] = useState<Snag | null>(null);

  const loadSnags = useCallback(async () => {
    setIsLoading(true);
    /* Check cache first */
    const cached = getCache("snags") as Snag[];
    const filtered = cached.filter((s) => s.projectId === projectId);
    if (filtered.length > 0) {
      setSnags(filtered);
    }
    /* Fetch from API */
    const resp = await callApi("getSnags", {});
    if (resp.status === "success" && Array.isArray(resp.data)) {
      setCache("snags", resp.data as Snag[]);
      setSnags((resp.data as Snag[]).filter((s) => s.projectId === projectId));
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadSnags();
  }, [loadSnags]);

  const handleNewSnag = useCallback(() => {
    setEditingSnag(null);
    setModalOpen(true);
  }, []);

  const handleEditSnag = useCallback((snag: Snag) => {
    setEditingSnag(snag);
    setModalOpen(true);
  }, []);

  const handleSaved = useCallback(() => {
    loadSnags();
  }, [loadSnags]);

  return (
    <div className="space-y-4">
      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Snags</h3>
        <button
          type="button"
          onClick={handleNewSnag}
          className="action-btn flex items-center gap-1.5"
        >
          <Plus className="size-3.5" />
          New Snag
        </button>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-amber-50 border border-amber-200 rounded-md p-2.5">
        <Info className="size-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
        <span>
          Photos stay on this device only and are not uploaded to the server.
        </span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Loading snags…
        </div>
      )}

      {/* Empty */}
      {!isLoading && snags.length === 0 && (
        <div className="card text-center py-10">
          <AlertTriangle className="size-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No snags recorded yet.</p>
        </div>
      )}

      {/* Snag Cards */}
      {!isLoading && snags.length > 0 && (
        <div className="space-y-3">
          {snags.map((snag) => {
            const isOpen = snag.status !== "Completed";
            return (
              <Card
                key={snag.snagId}
                className={cn(
                  "cursor-pointer hover:border-[var(--primary)]/40 transition-colors overflow-hidden",
                  isOpen ? "border-l-4 border-l-red-500" : "border-l-4 border-l-green-500"
                )}
                onClick={() => handleEditSnag(snag)}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">
                        {snag.notes || "No notes"}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                        {snag.assigned && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <User className="size-3" />
                            {snag.assigned}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="size-3" />
                          {snag.dateLogged}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <Badge
                        variant={isOpen ? "destructive" : "default"}
                        className={cn(
                          "text-[10px] px-1.5 py-0.5",
                          !isOpen && "bg-green-500 hover:bg-green-500"
                        )}
                      >
                        {isOpen ? (
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="size-2.5" />
                            Open
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="size-2.5" />
                            Completed
                          </span>
                        )}
                      </Badge>
                      {!isOpen && snag.dateCompleted && (
                        <span className="text-[10px] text-muted-foreground">
                          Done: {snag.dateCompleted}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Photo indicator */}
                  {snag.photoUrl && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <Info className="size-3" />
                      Has photo(s)
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <SnagModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        snag={editingSnag}
        onSaved={handleSaved}
      />
    </div>
  );
}
