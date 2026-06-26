/* ───────────────────────────────────────────
   Dashboard — Projects list with search + modal
   ─────────────────────────────────────────── */

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Plus, Loader2Icon, HardHat } from "lucide-react";
import type { Project } from "@/types";
import { callApi, setCache } from "@/lib/api";
import { useAppState } from "@/hooks/useAppState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProjectModal from "@/components/modals/ProjectModal";

export default function Dashboard() {
  const { state, loadData } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* Initial data load */
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Refresh projects from API */
  const refreshProjects = useCallback(async () => {
    setIsRefreshing(true);
    setError("");
    try {
      const resp = await callApi("getProjects", {});
      if (resp.status === "success" && Array.isArray(resp.data)) {
        setCache("projects", resp.data as Project[]);
        window.dispatchEvent(new CustomEvent("cacheupdated"));
      } else if (resp.status === "error") {
        setError(resp.message || "Failed to load projects.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /* Filter projects by search term */
  const filteredProjects = useMemo(() => {
    const projects = state.cache.projects || [];
    if (!searchTerm.trim()) return projects;

    const term = searchTerm.toLowerCase().trim();
    return projects.filter(
      (p: Project) =>
        (p.clientName || "").toLowerCase().includes(term) ||
        (p.projectId || "").toLowerCase().includes(term)
    );
  }, [state.cache.projects, searchTerm]);

  const openNewModal = useCallback(() => {
    setEditProject(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((project: Project) => {
    setEditProject(project);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditProject(null);
  }, []);

  /* Status border color */
  const statusBorderClass = (status: string): string => {
    if (status === "Active") return "border-l-4 border-l-emerald-500";
    return "border-l-4 border-l-muted-foreground/30";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <span className="text-xs text-muted-foreground">
          {filteredProjects.length} project(s)
        </span>
      </div>

      {/* Search + New */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search client or project ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={openNewModal}
          className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 shrink-0"
          size="sm"
        >
          <Plus className="size-4 mr-1" />
          New
        </Button>
      </div>

      {/* Loading */}
      {state.isLoading && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Loader2Icon className="inline-block size-4 animate-spin mr-2" />
          Loading projects…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
          <button
            onClick={refreshProjects}
            className="ml-2 underline text-destructive hover:no-underline"
            disabled={isRefreshing}
          >
            {isRefreshing ? "Retrying…" : "Retry"}
          </button>
        </div>
      )}

      {/* No projects */}
      {!state.isLoading &&
        (!state.cache.projects || state.cache.projects.length === 0) && (
          <div className="card text-center py-12">
            <div className="text-4xl text-muted-foreground/30 mb-3">
              <HardHat className="inline-block size-12" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No projects yet. Add your first project to get started.
            </p>
            <Button
              onClick={openNewModal}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90"
              size="sm"
            >
              <Plus className="size-4 mr-1" />
              Add Project
            </Button>
          </div>
        )}

      {/* Project cards */}
      {!state.isLoading && filteredProjects.length > 0 && (
        <div className="grid gap-3">
          {filteredProjects.map((project: Project) => (
            <div
              key={project.projectId}
              className={`card p-4 cursor-pointer hover:border-[var(--primary)]/40 transition-colors ${statusBorderClass(
                project.projectStatus
              )}`}
              onClick={() => openEditModal(project)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  openEditModal(project);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[20px] leading-tight truncate">
                    {project.clientName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {project.siteLocation}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-muted-foreground">
                      ID: {project.projectId}
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        project.projectStatus === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : project.projectStatus === "In Planning"
                          ? "bg-blue-50 text-blue-700"
                          : project.projectStatus === "Handed Over"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {project.projectStatus || "Active"}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-right shrink-0 ml-3">
                  {project.contractSubtotal
                    ? `\u20A6 ${Number(
                        project.contractSubtotal
                      ).toLocaleString()}`
                    : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No search results */}
      {!state.isLoading &&
        searchTerm.trim() &&
        filteredProjects.length === 0 &&
        state.cache.projects &&
        state.cache.projects.length > 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No projects match &ldquo;{searchTerm}&rdquo;.
          </div>
        )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editProject={editProject}
      />
    </div>
  );
}
