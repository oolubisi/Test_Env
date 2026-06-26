/* ───────────────────────────────────────────
   Take-Off Modal — Create / edit take-off documents
   ─────────────────────────────────────────── */

import { useState, useCallback, useEffect } from "react";
import { Trash2, Plus, X } from "lucide-react";
import { callApi, setCache, getCache } from "@/lib/api";
import { cn } from "@/lib/utils";
import Modal from "@/components/Modal";
import type { TakeOff } from "@/types";

interface TakeOffLineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
}

interface TakeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  takeOff?: TakeOff | null;
  onSaved: () => void;
}

export default function TakeOffModal({
  isOpen,
  onClose,
  projectId,
  takeOff,
  onSaved,
}: TakeOffModalProps) {
  const isEdit = Boolean(takeOff);
  const [trade, setTrade] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<TakeOffLineItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (takeOff) {
      setTrade(takeOff.title || "");
      setNotes(takeOff.notes || "");
      try {
        const parsed = JSON.parse(takeOff.lineItems || "[]");
        setLineItems(Array.isArray(parsed) ? parsed : []);
      } catch {
        setLineItems([]);
      }
    } else {
      setTrade("");
      setNotes("");
      setLineItems([]);
    }
  }, [takeOff, isOpen]);

  const addLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: "",
        qty: 0,
        unit: "",
      },
    ]);
  }, []);

  const updateLineItem = useCallback(
    (id: string, field: keyof TakeOffLineItem, value: string | number) => {
      setLineItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      );
    },
    []
  );

  const removeLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleSave = useCallback(async () => {
    if (!trade.trim()) return;
    setIsSaving(true);

    const payload = {
      projectId,
      title: trade.trim(),
      notes: notes.trim(),
      lineItems: JSON.stringify(lineItems),
    };

    const resp = await callApi(
      isEdit ? "updateTakeOff" : "saveTakeOff",
      isEdit ? { ...payload, takeOffId: takeOff!.takeOffId } : payload
    );

    if (resp.status === "success" || resp.status === "queued") {
      /* Update cache optimistically */
      const existing = getCache("takeOffs") as TakeOff[];
      const updatedItem: TakeOff = {
        takeOffId: isEdit ? takeOff!.takeOffId : ((resp.data as Record<string, unknown>)?.takeOffId as string || crypto.randomUUID()),
        projectId,
        title: trade.trim(),
        notes: notes.trim(),
        lineItems: JSON.stringify(lineItems),
        date: isEdit ? takeOff!.date : new Date().toISOString().split("T")[0],
        lastModified: new Date().toISOString(),
      };
      const updated = isEdit
        ? existing.map((t) => (t.takeOffId === takeOff!.takeOffId ? updatedItem : t))
        : [...existing, updatedItem];
      setCache("takeOffs", updated);
      window.dispatchEvent(new CustomEvent("cacheupdated"));
      onSaved();
      onClose();
    }
    setIsSaving(false);
  }, [trade, notes, lineItems, projectId, isEdit, takeOff, onSaved, onClose]);

  const handleDelete = useCallback(async () => {
    if (!takeOff) return;
    if (!window.confirm("Delete this take-off?")) return;
    setIsDeleting(true);
    const resp = await callApi("deleteTakeOff", {
      takeOffId: takeOff.takeOffId,
    });
    if (resp.status === "success" || resp.status === "queued") {
      const existing = getCache("takeOffs") as TakeOff[];
      setCache(
        "takeOffs",
        existing.filter((t) => t.takeOffId !== takeOff.takeOffId)
      );
      window.dispatchEvent(new CustomEvent("cacheupdated"));
      onSaved();
      onClose();
    }
    setIsDeleting(false);
  }, [takeOff, onSaved, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Take-Off" : "New Take-Off"}
      onSubmit={handleSave}
      submitText={isSaving ? "Saving…" : "Save"}
      submitDisabled={!trade.trim() || isSaving}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full mt-4">
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              <Trash2 className="size-3.5" />
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md border hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!trade.trim() || isSaving}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--primary)] text-white transition-colors",
                (!trade.trim() || isSaving) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Trade / Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Trade</label>
          <input
            type="text"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            placeholder="e.g., Electrical, Plumbing…"
            className="w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Line Items Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Line Items</label>
            <span className="text-[10px] text-muted-foreground">
              {lineItems.length} item(s)
            </span>
          </div>

          {lineItems.length > 0 && (
            <div className="border rounded-md overflow-hidden mb-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--card-light)]">
                    <th className="text-left px-2 py-1.5 font-medium border-b w-full">
                      Description
                    </th>
                    <th className="text-left px-2 py-1.5 font-medium border-b w-16">
                      Qty
                    </th>
                    <th className="text-left px-2 py-1.5 font-medium border-b w-16">
                      Unit
                    </th>
                    <th className="px-1 py-1.5 border-b w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(item.id, "description", e.target.value)
                          }
                          placeholder="Description"
                          className="w-full text-xs bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={item.qty || ""}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              "qty",
                              Number(e.target.value)
                            )
                          }
                          placeholder="0"
                          className="w-full text-xs bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) =>
                            updateLineItem(item.id, "unit", e.target.value)
                          }
                          placeholder="m²"
                          className="w-full text-xs bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className="px-1 py-1">
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="p-0.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="button"
            onClick={addLineItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border hover:bg-accent transition-colors"
          >
            <Plus className="size-3.5" />
            Add Line Item
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes…"
            rows={3}
            className="w-full text-sm border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>
      </div>
    </Modal>
  );
}
