/* ───────────────────────────────────────────
   Progress Modal — Log progress for a trade
   ─────────────────────────────────────────── */

import { useState, useCallback } from "react";
import { callApi, setCache, getCache } from "@/lib/api";
import { getGPSLocation, todayFormatted } from "@/lib/utils";
import Modal from "@/components/Modal";
import AttachmentUpload from "@/components/AttachmentUpload";
import type { ProgressLog } from "@/types";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSaved: () => void;
}

export default function ProgressModal({
  isOpen,
  onClose,
  projectId,
  onSaved,
}: ProgressModalProps) {
  const [trade, setTrade] = useState("");
  const [completion, setCompletion] = useState<number>(0);
  const [comments, setComments] = useState("");
  const [photos, setPhotos] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = useCallback(() => {
    setTrade("");
    setCompletion(0);
    setComments("");
    setPhotos("");
  }, []);

  const handleSave = useCallback(async () => {
    if (!trade.trim()) return;
    setIsSaving(true);

    /* Append GPS location to comments */
    let finalComments = comments.trim();
    try {
      const gps = await getGPSLocation();
      if (gps) {
        finalComments += finalComments
          ? `\n[Location: ${gps}]`
          : `[Location: ${gps}]`;
      }
    } catch {
      /* GPS is optional */
    }

    const payload = {
      projectId,
      tradeCategory: trade.trim(),
      completionPercentage: Math.min(100, Math.max(0, completion)),
      commentNarrative: finalComments,
      progressPhotoUrl: photos,
      dateRecorded: todayFormatted(),
    };

    const resp = await callApi("saveProgressLog", payload);

    if (resp.status === "success" || resp.status === "queued") {
      /* Update cache optimistically */
      const existing = getCache("progressLogs") as ProgressLog[];
      const newLog: ProgressLog = {
        logId: (resp.data as Record<string, unknown>)?.logId as string || crypto.randomUUID(),
        projectId,
        tradeCategory: trade.trim(),
        completionPercentage: Math.min(100, Math.max(0, completion)),
        commentNarrative: finalComments,
        progressPhotoUrl: photos,
        dateRecorded: todayFormatted(),
        lastModified: new Date().toISOString(),
      };
      setCache("progressLogs", [...existing, newLog]);
      window.dispatchEvent(new CustomEvent("cacheupdated"));
      resetForm();
      onSaved();
      onClose();
    }
    setIsSaving(false);
  }, [trade, completion, comments, photos, projectId, resetForm, onSaved, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Log Progress"
      onSubmit={handleSave}
      submitText={isSaving ? "Saving…" : "Save"}
      submitDisabled={!trade.trim() || isSaving}
      size="md"
    >
      <div className="space-y-4">
        {/* Trade */}
        <div>
          <label className="block text-sm font-medium mb-1">Trade</label>
          <input
            type="text"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            placeholder="e.g., Electrical, Painting…"
            className="w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Completion % */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Completion %
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={completion}
              onChange={(e) => setCompletion(Number(e.target.value))}
              className="flex-1 accent-[var(--primary)]"
            />
            <span className="text-sm font-medium w-12 text-right">
              {completion}%
            </span>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium mb-1">Comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Progress notes…"
            rows={3}
            className="w-full text-sm border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Photo Attachment */}
        <AttachmentUpload
          value={photos}
          onChange={setPhotos}
          label="Photo"
          maxFiles={5}
        />
      </div>
    </Modal>
  );
}
