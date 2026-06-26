/* ───────────────────────────────────────────
   Scope Segment — Editable project scope
   ─────────────────────────────────────────── */

import { useState, useCallback } from "react";
import { FileText, Edit3, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { callApi, setCache, getCache } from "@/lib/api";
import type { Project } from "@/types";

interface ScopeSegmentProps {
  project: Project;
}

export default function ScopeSegment({ project }: ScopeSegmentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [scope, setScope] = useState(project.scope || "");
  const [isSaving, setIsSaving] = useState(false);
  const [originalScope] = useState(project.scope || "");

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const resp = await callApi("updateProjectScope", {
      projectId: project.projectId,
      scope,
    });
    if (resp.status === "success" || resp.status === "queued") {
      /* Update cache */
      const projects = getCache("projects").map((p: Project) =>
        p.projectId === project.projectId ? { ...p, scope } : p
      );
      setCache("projects", projects);
      window.dispatchEvent(new CustomEvent("cacheupdated"));
      setIsEditing(false);
    }
    setIsSaving(false);
  }, [scope, project.projectId]);

  const handleCancel = useCallback(() => {
    setScope(originalScope);
    setIsEditing(false);
  }, [originalScope]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="size-4 text-[var(--primary)]" />
            Project Scope
          </CardTitle>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isEditing}
              onChange={(e) => {
                if (e.target.checked) {
                  setIsEditing(true);
                } else {
                  handleCancel();
                }
              }}
              className="size-3.5 rounded border-gray-300"
            />
            <Edit3 className="size-3" />
            Edit
          </label>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          readOnly={!isEditing}
          className={`w-full text-sm border rounded-md p-3 resize-none focus:outline-none transition-colors ${
            isEditing
              ? "bg-white border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)]/20"
              : "bg-[var(--card-light)] text-[var(--text)]"
          }`}
          rows={8}
          placeholder={
            isEditing ? "Enter project scope of work…" : "No scope defined"
          }
        />

        {isEditing && (
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-1.5"
            >
              <X className="size-3.5" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || scope === originalScope}
              className="flex items-center gap-1.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90"
            >
              <Save className="size-3.5" />
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
