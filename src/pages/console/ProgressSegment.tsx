/* ───────────────────────────────────────────
   Progress Segment — Overall + per-trade progress
   ─────────────────────────────────────────── */

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { callApi, setCache, getCache } from "@/lib/api";
import { cn } from "@/lib/utils";
import ProgressModal from "@/components/modals/ProgressModal";
import type { ProgressLog } from "@/types";

interface ProgressSegmentProps {
  projectId: string;
}

export default function ProgressSegment({ projectId }: ProgressSegmentProps) {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    /* Check cache first */
    const cached = getCache("progressLogs") as ProgressLog[];
    const filtered = cached.filter((l) => l.projectId === projectId);
    if (filtered.length > 0) {
      setLogs(filtered);
    }
    /* Fetch from API */
    const resp = await callApi("getProgressLogs", {});
    if (resp.status === "success" && Array.isArray(resp.data)) {
      setCache("progressLogs", resp.data as ProgressLog[]);
      setLogs((resp.data as ProgressLog[]).filter((l) => l.projectId === projectId));
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  /* ── Overall percentage: average of latest per trade ── */
  const { overallPercent, tradeProgress } = useMemo(() => {
    /* Group by trade, take latest log per trade */
    const byTrade = new Map<string, ProgressLog>();
    [...logs].sort(
      (a, b) =>
        new Date(a.dateRecorded).getTime() -
        new Date(b.dateRecorded).getTime()
    ).forEach((log) => {
      byTrade.set(log.tradeCategory, log);
    });

    const trades = Array.from(byTrade.values());
    const overall =
      trades.length > 0
        ? Math.round(
            trades.reduce((sum, t) => sum + (t.completionPercentage || 0), 0) /
              trades.length
          )
        : 0;

    return {
      overallPercent: overall,
      tradeProgress: trades,
    };
  }, [logs]);

  const overallColorClass =
    overallPercent >= 80
      ? "text-green-600"
      : overallPercent >= 50
      ? "text-orange-500"
      : "text-red-500";

  const overallBarColor =
    overallPercent >= 80
      ? "bg-green-500"
      : overallPercent >= 50
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <div className="space-y-4">
      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Progress</h3>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="action-btn flex items-center gap-1.5"
        >
          <Plus className="size-3.5" />
          Log Progress
        </button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className={cn("size-5", overallColorClass)} />
            <span className="text-sm font-medium">Overall</span>
            <span
              className={cn(
                "text-2xl font-bold ml-auto",
                overallColorClass
              )}
            >
              {overallPercent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", overallBarColor)}
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Loading progress…
        </div>
      )}

      {/* Empty */}
      {!isLoading && tradeProgress.length === 0 && (
        <div className="card text-center py-10">
          <TrendingUp className="size-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No progress logged yet.</p>
        </div>
      )}

      {/* Per-Trade Progress Cards */}
      {!isLoading && tradeProgress.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tradeProgress.map((log) => {
            const pct = log.completionPercentage || 0;
            const colorClass =
              pct >= 80
                ? "text-green-600"
                : pct >= 50
                ? "text-orange-500"
                : "text-red-500";
            const barColor =
              pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-orange-500" : "bg-red-500";

            return (
              <Card key={log.logId} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium truncate">
                      {log.tradeCategory}
                    </span>
                    <span className={cn("text-sm font-semibold", colorClass)}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", barColor)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {log.commentNarrative && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">
                      {log.commentNarrative}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ProgressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        onSaved={loadLogs}
      />
    </div>
  );
}
