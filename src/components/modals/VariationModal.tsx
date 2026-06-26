/* ───────────────────────────────────────────
   Variation Modal — Create / Edit
   ─────────────────────────────────────────── */

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { callApi } from "@/lib/api";
import { roundMoney, moneyValue } from "@/lib/utils";
import type { Variation } from "@/types";

interface VariationLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const VARIATION_STATUSES = ["Draft", "Submitted", "Approved", "Rejected"];

interface VariationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectSuffix: string;
  variation?: Variation | null;
  existingVariations: Variation[];
  onSaved: () => void;
  onDelete?: (variationId: string) => void;
}

export default function VariationModal({
  isOpen,
  onClose,
  projectId,
  projectSuffix,
  variation,
  existingVariations,
  onSaved,
  onDelete,
}: VariationModalProps) {
  const isEdit = !!variation;

  const [variationNumber, setVariationNumber] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Draft");
  const [lineItems, setLineItems] = useState<VariationLineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [saving, setSaving] = useState(false);

  /* ─── Calculated totals ─── */
  const subtotal = useMemo(() => {
    return roundMoney(lineItems.reduce((s, li) => s + li.amount, 0));
  }, [lineItems]);

  const vat = useMemo(() => {
    return roundMoney(subtotal * 0.075);
  }, [subtotal]);

  const total = useMemo(() => {
    return roundMoney(subtotal + vat);
  }, [subtotal, vat]);

  /* ─── Populate on open ─── */
  useEffect(() => {
    if (!isOpen) return;

    if (variation) {
      setVariationNumber(variation.variationNumber);
      setDate(variation.date || "");
      setTitle(variation.title || "");
      setStatus(variation.status || "Draft");
      setNotes(variation.notes || "");
      setApprovedBy(variation.approvedBy || "");

      /* Parse line items */
      try {
        const parsed = JSON.parse(variation.lineItems || "[]");
        if (Array.isArray(parsed)) {
          setLineItems(parsed.map((li: any, idx: number) => ({
            id: li.id || `var-li-${Date.now()}-${idx}`,
            description: li.description || "",
            quantity: Number(li.quantity) || 0,
            rate: Number(li.rate) || 0,
            amount: roundMoney((Number(li.quantity) || 0) * (Number(li.rate) || 0)),
          })));
        } else {
          setLineItems([]);
        }
      } catch {
        setLineItems([]);
      }
    } else {
      /* New variation */
      const seq = existingVariations.length + 1;
      setVariationNumber(`VAR-${projectSuffix}-${String(seq).padStart(2, "0")}`);
      setDate(new Date().toISOString().split("T")[0]);
      setTitle("");
      setStatus("Draft");
      setNotes("");
      setApprovedBy("");
      setLineItems([]);
    }
  }, [isOpen, variation, existingVariations, projectSuffix]);

  /* ─── Line item helpers ─── */
  const addLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `var-li-${Date.now()}-${prev.length}`,
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  }, []);

  const updateLineItem = useCallback((id: string, field: keyof VariationLineItem, value: string | number) => {
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
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    setSaving(true);
    const lineItemsJson = JSON.stringify(lineItems);
    const payload = {
      projectId,
      variationId: isEdit ? variation!.variationId : "",
      variationNumber,
      date,
      title,
      status,
      lineItems: lineItemsJson,
      subtotal,
      vat,
      total,
      notes,
      approvedBy,
    };

    try {
      const resp = await callApi(isEdit ? "updateVariation" : "saveVariation", payload);
      if (resp.status === "success" || resp.status === "queued") {
        onSaved();
        onClose();
      } else {
        alert(resp.message || "Failed to save variation.");
      }
    } catch {
      alert("Network error — variation queued for sync.");
    } finally {
      setSaving(false);
    }
  }, [title, projectId, variationNumber, date, status, lineItems, subtotal, vat, total, notes, approvedBy, isEdit, variation, onSaved, onClose]);

  /* ─── Delete ─── */
  const handleDelete = useCallback(async () => {
    if (!variation) return;
    if (!window.confirm("Delete this variation? This action cannot be undone.")) return;

    try {
      const resp = await callApi("deleteVariation", { variationId: variation.variationId });
      if (resp.status === "success" || resp.status === "queued") {
        onDelete?.(variation.variationId);
        onSaved();
        onClose();
      } else {
        alert(resp.message || "Failed to delete variation.");
      }
    } catch {
      alert("Network error — delete queued for sync.");
    }
  }, [variation, onDelete, onSaved, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Variation" : "New Variation"}
      size="lg"
      onSubmit={handleSave}
      submitText={saving ? "Saving..." : "Save"}
      submitDisabled={saving}
      footer={
        <div className="flex items-center justify-between w-full mt-4">
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-md text-xs font-medium border border-input hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="action-btn text-xs py-2 px-3 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Variation Number */}
        <div>
          <Label htmlFor="var-num" className="mb-1.5 block">Variation Number</Label>
          <Input id="var-num" value={variationNumber} disabled className="bg-muted font-mono text-xs" />
        </div>

        {/* Date */}
        <div>
          <Label htmlFor="var-date" className="mb-1.5 block">Date</Label>
          <Input
            id="var-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="var-title" className="mb-1.5 block">Title</Label>
          <Input
            id="var-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Variation title / description"
          />
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="var-status" className="mb-1.5 block">Status</Label>
          <select
            id="var-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {VARIATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
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
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Description"
                    value={li.description}
                    onChange={(e) => updateLineItem(li.id, "description", e.target.value)}
                  />
                </div>
                <Input
                  type="number"
                  placeholder="Qty"
                  value={li.quantity}
                  min={0}
                  step="any"
                  onChange={(e) => updateLineItem(li.id, "quantity", parseFloat(e.target.value) || 0)}
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
              <div className="text-right text-sm font-medium">
                Amount: {moneyValue(li.amount)}
              </div>
            </div>
          ))}

          {/* Totals */}
          {lineItems.length > 0 && (
            <div className="card-light space-y-1 text-sm mt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{moneyValue(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (7.5%):</span>
                <span className="font-medium">{moneyValue(vat)}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="font-semibold">Total:</span>
                <span className="font-bold">{moneyValue(total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="var-notes" className="mb-1.5 block">Notes</Label>
          <Textarea
            id="var-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        {/* Approved By */}
        <div>
          <Label htmlFor="var-approved" className="mb-1.5 block">Approved By</Label>
          <Input
            id="var-approved"
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            placeholder="Name of approver"
          />
        </div>
      </div>
    </Modal>
  );
}
