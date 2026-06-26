/* ───────────────────────────────────────────
   Take-Off Segment — Take-off document cards
   ─────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Ruler } from "lucide-react";
import { callApi, setCache, getCache } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import TakeOffModal from "@/components/modals/TakeOffModal";
import type { TakeOff } from "@/types";

interface TakeOffSegmentProps {
  projectId: string;
}

export default function TakeOffSegment({ projectId }: TakeOffSegmentProps) {
  const [takeOffs, setTakeOffs] = useState<TakeOff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTakeOff, setEditingTakeOff] = useState<TakeOff | null>(null);

  const loadTakeOffs = useCallback(async () => {
    setIsLoading(true);
    /* First check cache */
    const cached = getCache("takeOffs") as TakeOff[];
    const filtered = cached.filter((t) => t.projectId === projectId);
    if (filtered.length > 0) {
      setTakeOffs(filtered);
    }
    /* Then fetch from API */
    const resp = await callApi("getTakeOffs", { projectId });
    if (resp.status === "success" && Array.isArray(resp.data)) {
      setCache("takeOffs", resp.data as TakeOff[]);
      setTakeOffs((resp.data as TakeOff[]).filter((t) => t.projectId === projectId));
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadTakeOffs();
  }, [loadTakeOffs]);

  const handleNewTakeOff = useCallback(() => {
    setEditingTakeOff(null);
    setModalOpen(true);
  }, []);

  const handleEditTakeOff = useCallback((takeOff: TakeOff) => {
    setEditingTakeOff(takeOff);
    setModalOpen(true);
  }, []);

  const handleSaved = useCallback(() => {
    loadTakeOffs();
  }, [loadTakeOffs]);

  const getLineItemCount = useCallback((takeOff: TakeOff): number => {
    try {
      const parsed = JSON.parse(takeOff.lineItems || "[]");
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleNewTakeOff}
          className="action-btn flex items-center gap-1.5"
        >
          <Plus className="size-3.5" />
          New Take-Off
        </button>
        <button
          type="button"
          onClick={() => alert("Templates — coming soon")}
          className="action-btn secondary flex items-center gap-1.5"
        >
          <FileText className="size-3.5" />
          Templates
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Loading take-offs…
        </div>
      )}

      {/* Empty */}
      {!isLoading && takeOffs.length === 0 && (
        <div className="card text-center py-10">
          <Ruler className="size-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No take-offs yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a new take-off to get started.
          </p>
        </div>
      )}

      {/* Take-Off Cards */}
      {!isLoading && takeOffs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {takeOffs.map((takeOff) => (
            <Card
              key={takeOff.takeOffId}
              className="cursor-pointer hover:border-[var(--primary)]/40 transition-colors"
              onClick={() => handleEditTakeOff(takeOff)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                      <Ruler className="size-4 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium line-clamp-1">
                        {takeOff.title || "Untitled"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getLineItemCount(takeOff)} line item(s)
                      </p>
                    </div>
                  </div>
                </div>
                {takeOff.notes && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {takeOff.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <TakeOffModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        takeOff={editingTakeOff}
        onSaved={handleSaved}
      />
    </div>
  );
}
