/* ───────────────────────────────────────────
   WorkOrder Modal — Create / Edit
   ─────────────────────────────────────────── */

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Plus } from "lucide-react";
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AttachmentUpload from "@/components/AttachmentUpload";
import { callApi } from "@/lib/api";
import { roundMoney, moneyValue } from "@/lib/utils";
import { populateWorkOrderDropdown, WORK_ORDER_STATUSES } from "@/lib/workorders";
import type { WorkOrder, Vendor } from "@/types";

interface WorkOrderLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  workOrder?: WorkOrder | null;
  vendors: Vendor[];
  onSaved: () => void;
}

function generateWorkOrderId(existingWOs: WorkOrder[]): string {
  const yy = new Date().getFullYear().toString().slice(-2);
  const seq = existingWOs.length + 1;
  return `WKO/${yy}/${String(seq).padStart(3, "0")}`;
}

export default function WorkOrderModal({ isOpen, onClose, projectId, workOrder, vendors, onSaved }: WorkOrderModalProps) {
  const isEdit = !!workOrder;
  const vendorOptions = useMemo(() => populateWorkOrderDropdown(vendors), [vendors]);

  const [workOrderId, setWorkOrderId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [lineItems, setLineItems] = useState<WorkOrderLineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Pending");
  const [attachments, setAttachments] = useState("");
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);

  /* ─── Populate on open ─── */
  useEffect(() => {
    if (isOpen) {
      if (workOrder) {
        setWorkOrderId(workOrder.workOrderId);
        setVendorId(workOrder.vendorId);
        setStatus(workOrder.status || "Pending");
        setAttachments(workOrder.attachments || "");
        /* Parse description JSON */
        try {
          const parsed = JSON.parse(workOrder.description || "{}");
          setNotes(parsed.notes || "");
          if (parsed.lineItems && Array.isArray(parsed.lineItems)) {
            setLineItems(parsed.lineItems.map((li: any, idx: number) => ({
              id: li.id || `wo-li-${Date.now()}-${idx}`,
              description: li.description || "",
              quantity: Number(li.quantity) || 0,
              unit: li.unit || "nos",
              rate: Number(li.rate) || 0,
              amount: roundMoney((Number(li.quantity) || 0) * (Number(li.rate) || 0)),
            })));
          } else {
            setLineItems([]);
          }
        } catch {
          setNotes(workOrder.description || "");
          setLineItems([]);
        }
      } else {
        /* New work order */
        setWorkOrderId("");
        setVendorId("");
        setNotes("");
        setStatus("Pending");
        setAttachments("");
        setLineItems([]);
        /* Generate ID from local cache */
        try {
          const cache = (window as any).cache || {};
          const projectWOs = (cache.workorders || []).filter((w: WorkOrder) => w.projectId === projectId);
          setWorkOrderId(generateWorkOrderId(projectWOs));
        } catch {
          const yy = new Date().getFullYear().toString().slice(-2);
          setWorkOrderId(`WKO/${yy}/001`);
        }
      }
    }
  }, [isOpen, workOrder, projectId]);

  /* ─── Recalculate total ─── */
  useEffect(() => {
    const t = lineItems.reduce((sum, li) => sum + li.amount, 0);
    setTotal(roundMoney(t));
  }, [lineItems]);

  /* ─── Line item helpers ─── */
  const addLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `wo-li-${Date.now()}-${prev.length}`,
        description: "",
        quantity: 1,
        unit: "nos",
        rate: 0,
        amount: 0,
      },
    ]);
  }, []);

  const updateLineItem = useCallback((id: string, field: keyof WorkOrderLineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((li) => {
        if (li.id !== id) return li;
        const updated = { ...li, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.amount = roundMoney(updated.quantity * updated.rate);
        }
        return updated;
      })
    );
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  }, []);

  /* ─── Save ─── */
  const handleSave = useCallback(async () => {
    if (!vendorId) {
      alert("Please select a vendor.");
      return;
    }

    setSaving(true);
    const descJson = JSON.stringify({ lineItems, notes });
    const payload = {
      projectId,
      workOrderId: isEdit ? workOrder!.workOrderId : workOrderId,
      vendorId,
      description: descJson,
      amount: total,
      status,
      attachments,
    };

    try {
      const resp = await callApi(isEdit ? "updateWorkOrder" : "saveWorkOrder", payload);
      if (resp.status === "success" || resp.status === "queued") {
        onSaved();
        onClose();
      } else {
        alert(resp.message || "Failed to save work order.");
      }
    } catch {
      alert("Network error — work order queued for sync.");
    } finally {
      setSaving(false);
    }
  }, [vendorId, projectId, workOrderId, total, status, attachments, isEdit, workOrder, onSaved, onClose, lineItems, notes]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Work Order" : "New Work Order"}
      size="lg"
      onSubmit={handleSave}
      submitText={saving ? "Saving..." : "Save"}
      submitDisabled={saving || !vendorId}
    >
      <div className="space-y-4">
        {/* Work Order ID */}
        <div>
          <Label htmlFor="wo-id" className="mb-1.5 block">Work Order ID</Label>
          <Input id="wo-id" value={workOrderId} disabled className="bg-muted" />
        </div>

        {/* Vendor */}
        <div>
          <Label htmlFor="wo-vendor" className="mb-1.5 block">Vendor</Label>
          <select
            id="wo-vendor"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select vendor...</option>
            {vendorOptions.map((vo) => (
              <option key={vo.value} value={vo.value}>{vo.label}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="wo-status" className="mb-1.5 block">Status</Label>
          <select
            id="wo-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {WORK_ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="mb-0">Line Items</Label>
            <button type="button" onClick={addLineItem} className="action-btn text-xs py-1 px-2">
              <Plus className="size-3 mr-1" />
              Add Item
            </button>
          </div>

          {lineItems.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">No line items yet. Click "Add Item" to add.</p>
          )}

          {lineItems.map((li, idx) => (
            <div key={li.id} className="card-light mb-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Item {idx + 1}</span>
                <button type="button" onClick={() => removeLineItem(li.id)} className="text-[var(--danger)] hover:opacity-70">
                  <X className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Description"
                  value={li.description}
                  onChange={(e) => updateLineItem(li.id, "description", e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={li.quantity}
                    min={0}
                    step="any"
                    onChange={(e) => updateLineItem(li.id, "quantity", parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    placeholder="Unit"
                    value={li.unit}
                    onChange={(e) => updateLineItem(li.id, "unit", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={li.rate}
                    min={0}
                    step="any"
                    onChange={(e) => updateLineItem(li.id, "rate", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="text-right text-sm font-medium">
                Amount: {moneyValue(li.amount)}
              </div>
            </div>
          ))}

          {lineItems.length > 0 && (
            <div className="text-right font-semibold text-sm pt-1 border-t">
              Total: {moneyValue(total)}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="wo-notes" className="mb-1.5 block">Notes</Label>
          <Textarea
            id="wo-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        {/* Attachments */}
        <AttachmentUpload value={attachments} onChange={setAttachments} />
      </div>
    </Modal>
  );
}
