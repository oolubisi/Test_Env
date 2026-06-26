/* ───────────────────────────────────────────
   ProjectModal — Create / Edit project
   ─────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/types";
import { callApi, setCache, getFullCache } from "@/lib/api";
import { useAppState } from "@/hooks/useAppState";
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const STATUS_OPTIONS = ["Active", "In Planning", "Handed Over", "Declined"];

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProject?: Project | null;
}

export default function ProjectModal({
  isOpen,
  onClose,
  editProject,
}: ProjectModalProps) {
  const { refresh } = useAppState();
  const isEdit = Boolean(editProject);

  const [projectId, setProjectId] = useState("");
  const [clientName, setClientName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectStatus, setProjectStatus] = useState("Active");
  const [contractSubtotal, setContractSubtotal] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* Populate form when editing */
  useEffect(() => {
    if (editProject) {
      setProjectId(editProject.projectId || "");
      setClientName(editProject.clientName || "");
      setSiteLocation(editProject.siteLocation || "");
      setClientPhone(editProject.clientPhone || "");
      setClientEmail(editProject.clientEmail || "");
      setProjectStatus(editProject.projectStatus || "Active");
      setContractSubtotal(
        editProject.contractSubtotal ? String(editProject.contractSubtotal) : ""
      );
      setNotes(editProject.notes || "");
      setError("");
    } else {
      /* Generate new project ID */
      const cache = getFullCache();
      const existingIds = (cache.projects || [])
        .map((p: Project) => parseInt(p.projectId, 10))
        .filter((n: number) => !isNaN(n));
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      setProjectId(String(maxId + 1));
      setClientName("");
      setSiteLocation("");
      setClientPhone("");
      setClientEmail("");
      setProjectStatus("Active");
      setContractSubtotal("");
      setNotes("");
      setError("");
    }
  }, [editProject, isOpen]);

  const validate = useCallback((): boolean => {
    if (!clientName.trim()) {
      setError("Client name is required.");
      return false;
    }
    if (clientPhone && clientPhone.length !== 11) {
      setError("Client phone must be exactly 11 digits.");
      return false;
    }
    setError("");
    return true;
  }, [clientName, clientPhone]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setSaving(true);
      try {
        const payload: Record<string, unknown> = {
          projectId,
          clientName: clientName.trim(),
          siteLocation: siteLocation.trim(),
          clientPhone: clientPhone.trim(),
          clientEmail: clientEmail.trim(),
          projectStatus,
          contractSubtotal: parseFloat(contractSubtotal) || 0,
          notes: notes.trim(),
        };

        const resp = await callApi("saveProject", payload);
        if (resp.status === "success" || resp.status === "queued") {
          /* Optimistically update cache */
          const cache = getFullCache();
          const existingIdx = cache.projects.findIndex(
            (p: Project) => p.projectId === projectId
          );
          const updatedProject: Project = {
            projectId,
            clientName: clientName.trim(),
            siteLocation: siteLocation.trim(),
            clientPhone: clientPhone.trim(),
            clientEmail: clientEmail.trim(),
            projectStatus,
            contractSubtotal: parseFloat(contractSubtotal) || 0,
            notes: notes.trim(),
            scope: editProject?.scope || "",
            lastModified: new Date().toISOString(),
          };

          if (existingIdx >= 0) {
            const updated = [...cache.projects];
            updated[existingIdx] = updatedProject;
            setCache("projects", updated);
          } else {
            setCache("projects", [...cache.projects, updatedProject]);
          }
          refresh();
          onClose();
        } else {
          setError(resp.message || "Failed to save project.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error.");
      } finally {
        setSaving(false);
      }
    },
    [
      validate,
      projectId,
      clientName,
      siteLocation,
      clientPhone,
      clientEmail,
      projectStatus,
      contractSubtotal,
      notes,
      editProject,
      refresh,
      onClose,
    ]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Project" : "New Project"}
      onSubmit={handleSubmit}
      submitText={saving ? "Saving…" : isEdit ? "Update" : "Create"}
      submitDisabled={saving}
      size="lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="pm-projectId">Project ID</Label>
          <Input
            id="pm-projectId"
            value={projectId}
            disabled
            className="mt-1 bg-muted"
          />
        </div>

        <div>
          <Label htmlFor="pm-clientName">
            Client Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="pm-clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Enter client name"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="pm-siteLocation">Site Location</Label>
          <Input
            id="pm-siteLocation"
            value={siteLocation}
            onChange={(e) => setSiteLocation(e.target.value)}
            placeholder="Enter site location"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="pm-clientPhone">Client Phone (11 digits)</Label>
            <Input
              id="pm-clientPhone"
              value={clientPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                setClientPhone(val);
              }}
              placeholder="080XXXXXXXX"
              inputMode="tel"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pm-clientEmail">Client Email</Label>
            <Input
              id="pm-clientEmail"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="pm-projectStatus">Project Status</Label>
            <select
              id="pm-projectStatus"
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="pm-contractSubtotal">Contract Subtotal (₦)</Label>
            <Input
              id="pm-contractSubtotal"
              type="number"
              value={contractSubtotal}
              onChange={(e) => setContractSubtotal(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="pm-notes">Notes</Label>
          <Textarea
            id="pm-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes…"
            className="mt-1"
          />
        </div>
      </div>
    </Modal>
  );
}
