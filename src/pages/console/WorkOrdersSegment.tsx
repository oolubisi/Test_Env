/* ───────────────────────────────────────────
   WorkOrders Console Segment
   ─────────────────────────────────────────── */

import { useState, useMemo, useCallback } from "react";
import { ClipboardList, Plus, Pencil } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { moneyValue } from "@/lib/utils";
import { getWorkOrderStatusColor } from "@/lib/workorders";
import WorkOrderModal from "@/components/modals/WorkOrderModal";
import type { WorkOrder } from "@/types";

interface WorkOrdersSegmentProps {
  projectId: string;
}

export default function WorkOrdersSegment({ projectId }: WorkOrdersSegmentProps) {
  const { state, refresh } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWO, setEditingWO] = useState<WorkOrder | null>(null);

  const workOrders = useMemo(() => {
    return (state.cache.workorders || []).filter((w) => w.projectId === projectId);
  }, [state.cache.workorders, projectId]);

  const vendors = useMemo(() => state.cache.vendors || [], [state.cache.vendors]);

  const handleNew = useCallback(() => {
    setEditingWO(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((wo: WorkOrder) => {
    setEditingWO(wo);
    setModalOpen(true);
  }, []);

  const handleSaved = useCallback(() => {
    refresh();
    setModalOpen(false);
  }, [refresh]);

  const getVendorName = useCallback((vendorId: string) => {
    const v = vendors.find((ven) => ven.vendorId === vendorId);
    return v ? v.company : vendorId;
  }, [vendors]);

  const formatDescription = useCallback((desc: string) => {
    try {
      const parsed = JSON.parse(desc);
      if (parsed.lineItems && Array.isArray(parsed.lineItems)) {
        return parsed.lineItems.map((li: any) => `${li.description} (${li.quantity} ${li.unit})`).join("\n");
      }
      return desc;
    } catch {
      return desc;
    }
  }, []);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <ClipboardList className="size-4" />
          Work Orders ({workOrders.length})
        </h3>
        <button onClick={handleNew} className="action-btn text-xs py-1.5">
          <Plus className="size-3.5 mr-1" />
          New Work Order
        </button>
      </div>

      {/* List */}
      {workOrders.length === 0 && (
        <div className="card text-center py-8 text-muted-foreground">
          <ClipboardList className="size-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No work orders yet.</p>
          <button onClick={handleNew} className="action-btn mt-3 text-xs">
            <Plus className="size-3.5 mr-1" />
            Create Work Order
          </button>
        </div>
      )}

      {workOrders.map((wo) => (
        <button
          key={wo.workOrderId}
          onClick={() => handleEdit(wo)}
          className="card w-full text-left hover:bg-[var(--card-light)] transition-colors group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{wo.workOrderId}</span>
                <span
                  className="status-badge text-[10px]"
                  style={{
                    background: `${getWorkOrderStatusColor(wo.status)}20`,
                    color: getWorkOrderStatusColor(wo.status),
                  }}
                >
                  {wo.status}
                </span>
              </div>
              <div className="font-medium text-sm mt-0.5">{getVendorName(wo.vendorId)}</div>
              <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap font-sans leading-relaxed">
                {formatDescription(wo.description)}
              </pre>
            </div>
            <div className="text-right shrink-0">
              <div className="font-semibold text-sm">{moneyValue(wo.amount)}</div>
              <Pencil className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 ml-auto" />
            </div>
          </div>
        </button>
      ))}

      {/* Modal */}
      <WorkOrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        workOrder={editingWO}
        vendors={vendors}
        onSaved={handleSaved}
      />
    </div>
  );
}
