/* ───────────────────────────────────────────
   Snag Modal — Create / edit snags with local photos
   ─────────────────────────────────────────── */

import { useState, useCallback, useEffect } from "react";
import { Trash2, Info } from "lucide-react";
import { callApi, setCache, getCache } from "@/lib/api";
import { todayFormatted, formatDateForInput, parseInputDate } from "@/lib/utils";
import { saveSnagPhotosLocally, deleteSnagPhotosLocally } from "@/lib/db";
import Modal from "@/components/Modal";
import AttachmentUpload from "@/components/AttachmentUpload";
import type { Snag } from "@/types";

interface SnagModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  snag?: Snag | null;
  onSaved: () => void;
}

export default function SnagModal({
  isOpen,
  onClose,
  projectId,
  snag,
  onSaved,
}: SnagModalProps) {
  const isEdit = Boolean(snag);
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState<"Open" | "Completed">("Open");
  const [dateLogged, setDateLogged] = useState("");
  const [dateCompleted, setDateCompleted] = useState("");
  const [photos, setPhotos] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (snag) {
      setNotes(snag.notes || "");
      setAssignedTo(snag.assigned || "");
      setStatus((snag.status as "Open" | "Completed") || "Open");
      setDateLogged(snag.dateLogged || todayFormatted());
      setDateCompleted(snag.dateCompleted || "");
      /* Load local photos */
      setPhotos(snag.photoUrl || "");
    } else {
      setNotes("");
      setAssignedTo("");
      setStatus("Open");
      setDateLogged(todayFormatted());
      setDateCompleted("");
      setPhotos("");
    }
  }, [snag, isOpen]);

  /* Auto-set date completed when status changes to Completed */
  useEffect(() => {
    if (status === "Completed" && !dateCompleted) {
      setDateCompleted(todayFormatted());
    }
  }, [status, dateCompleted]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    const payload = {
      projectId,
      notes: notes.trim(),
      assigned: assignedTo.trim(),
      status,
      dateLogged,
      dateCompleted: status === "Completed" ? dateCompleted : "",
    };

    const resp = await callApi(
      isEdit ? "updateSnag" : "saveSnag",
      isEdit ? { ...payload, snagId: snag!.snagId } : payload
    );

    if (resp.status === "success" || resp.status === "queued") {
      const snagId = isEdit ? snag!.snagId : ((resp.data as Record<string, unknown>)?.snagId as string || crypto.randomUUID());

      /* Save photos locally */
      if (photos) {
        await saveSnagPhotosLocally(snagId, photos);
      } else if (isEdit && snag?.photoUrl) {
        await deleteSnagPhotosLocally(snagId);
      }

      /* Update cache */
      const existing = getCache("snags") as Snag[];
      const updatedItem: Snag = {
        snagId,
        projectId,
        notes: notes.trim(),
        photoUrl: photos,
        assigned: assignedTo.trim(),
        dateLogged,
        dateCompleted: status === "Completed" ? dateCompleted : "",
        status,
        lastModified: new Date().toISOString(),
      };
      const updated = isEdit
        ? existing.map((s) => (s.snagId === snag!.snagId ? updatedItem : s))
        : [...existing, updatedItem];
      setCache("snags", updated);
      window.dispatchEvent(new CustomEvent("cacheupdated"));
      onSaved();
      onClose();
    }
    setIsSaving(false);
  }, [
    notes, assignedTo, status, dateLogged, dateCompleted, photos,
    projectId, isEdit, snag, onSaved, onClose,
  ]);

  const handleDelete = useCallback(async () => {
    if (!snag) return;
    if (!window.confirm("Delete this snag?")) return;
    setIsDeleting(true);
    const resp = await callApi("deleteSnag", {
      snagId: snag.snagId,
    });
    if (resp.status === "success" || resp.status === "queued") {
      /* Delete local photos too */
      await deleteSnagPhotosLocally(snag.snagId);
      const existing = getCache("snags") as Snag[];
      setCache(
        "snags",
        existing.filter((s) => s.snagId !== snag.snagId)
      );
      window.dispatchEvent(new CustomEvent("cacheupdated"));
      onSaved();
      onClose();
    }
    setIsDeleting(false);
  }, [snag, onSaved, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Snag" : "New Snag"}
      onSubmit={handleSave}
      submitText={isSaving ? "Saving…" : "Save"}
      submitDisabled={isSaving}
      size="md"
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
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--primary)] text-white disabled:opacity-50 transition-colors"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the snag…"
            rows={3}
            className="w-full text-sm border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium mb-1">Assigned To</label>
          <input
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Person responsible"
            className="w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Date Logged */}
        <div>
          <label className="block text-sm font-medium mb-1">Date Logged</label>
          <input
            type="date"
            value={formatDateForInput(dateLogged)}
            disabled
            className="w-full text-sm border rounded-md px-3 py-2 bg-muted text-muted-foreground"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "Open" | "Completed")}
            className="w-full text-sm border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          >
            <option value="Open">Open</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Date Completed — shown when status is Completed */}
        {status === "Completed" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Date Completed
            </label>
            <input
              type="date"
              value={formatDateForInput(dateCompleted)}
              onChange={(e) => setDateCompleted(parseInputDate(e.target.value))}
              className="w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            />
          </div>
        )}

        {/* Photo Upload — LOCAL ONLY */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <label className="text-sm font-medium">Photos</label>
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              <Info className="size-3" />
              Device only — not uploaded
            </span>
          </div>
          <AttachmentUpload
            value={photos}
            onChange={setPhotos}
            label=""
            maxFiles={5}
          />
        </div>
      </div>
    </Modal>
  );
}
