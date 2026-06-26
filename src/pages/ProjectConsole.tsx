/* ───────────────────────────────────────────
   Project Console — Parent shell with segment nav
   Profile | Scope | Take-Off | Progress | Snags
   | Work Orders | Payments | Variations | PCR
   ─────────────────────────────────────────── */

import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  User,
  FileText,
  Ruler,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  CreditCard,
  Receipt,
  FileCheck,
} from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { setCurrentProjectId, getFullCache, setCache } from "@/lib/api";
import { cn } from "@/lib/utils";
import ProfileSegment from "./console/ProfileSegment";
import ScopeSegment from "./console/ScopeSegment";
import TakeOffSegment from "./console/TakeOffSegment";
import ProgressSegment from "./console/ProgressSegment";
import SnagsSegment from "./console/SnagsSegment";
import WorkOrdersSegment from "./console/WorkOrdersSegment";
import PaymentsSegment from "./console/PaymentsSegment";
import VariationsSegment from "./console/VariationsSegment";
import PcrSegment from "./console/PcrSegment";

interface ProjectConsoleProps {
  projectId: string;
  segment?: string;
}

type ConsoleSegment =
  | "profile"
  | "scope"
  | "takeoff"
  | "progress"
  | "snags"
  | "workorders"
  | "payments"
  | "variations"
  | "pcr";

const SEGMENTS: { key: ConsoleSegment; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "scope", label: "Scope", icon: FileText },
  { key: "takeoff", label: "Take-Off", icon: Ruler },
  { key: "progress", label: "Progress", icon: TrendingUp },
  { key: "snags", label: "Snags", icon: AlertTriangle },
  { key: "workorders", label: "Work Orders", icon: ClipboardList },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "variations", label: "Variations", icon: Receipt },
  { key: "pcr", label: "PCR", icon: FileCheck },
];

export default function ProjectConsole({
  projectId,
  segment,
}: ProjectConsoleProps) {
  const { state } = useAppState();
  const [activeSegment, setActiveSegment] = useState<ConsoleSegment>(
    (segment as ConsoleSegment) || "profile"
  );
  /* Track which segments have been loaded to avoid re-fetching */
  const [, setLoadedSegments] = useState<Set<ConsoleSegment>>(new Set());

  /* Sync active segment from URL */
  useEffect(() => {
    if (segment) {
      setActiveSegment(segment as ConsoleSegment);
    }
  }, [segment]);

  /* Set current project ID in API layer */
  useEffect(() => {
    setCurrentProjectId(projectId);
  }, [projectId]);

  /* Find project */
  const project = useMemo(() => {
    return state.cache.projects.find((p) => p.projectId === projectId);
  }, [state.cache.projects, projectId]);

  /* If project not found in cache, seed from backup */
  useEffect(() => {
    if (!project) {
      const cache = getFullCache();
      if (!cache.projects.length) {
        /* Try to seed from localStorage backup */
        try {
          const backup = localStorage.getItem("projects_backup");
          if (backup) {
            const parsed = JSON.parse(backup);
            if (Array.isArray(parsed)) {
              setCache("projects", parsed);
              window.dispatchEvent(new CustomEvent("cacheupdated"));
            }
          }
        } catch {
          /* No backup available */
        }
      }
    }
  }, [project]);

  const handleSegmentClick = useCallback(
    (seg: ConsoleSegment) => {
      setActiveSegment(seg);
      /* Mark as loaded so child won't re-fetch if already done */
      setLoadedSegments((prev) => new Set(prev).add(seg));
    },
    []
  );

  if (!project) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <h2 className="text-lg font-semibold mb-2">Project Not Found</h2>
        <p className="text-sm">The project you are looking for does not exist.</p>
        <Link href="/">
          <span className="action-btn mt-4 inline-flex items-center gap-1.5 cursor-pointer">
            <ArrowLeft className="size-3.5" />
            Back to Projects
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Back button + Project Title ── */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[var(--card-light)] border hover:bg-accent transition-colors cursor-pointer">
            <ArrowLeft className="size-4" />
          </span>
        </Link>
        <div className="min-w-0">
          <h2 className="text-base font-semibold truncate">
            {project.clientName}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {project.siteLocation}
          </p>
        </div>
      </div>

      {/* ── Sub-segment Navigation ── */}
      <div className="flex overflow-x-auto gap-1 pb-1 segment-bar">
        {SEGMENTS.map((seg) => {
          const isActive = activeSegment === seg.key;
          return (
            <a
              key={seg.key}
              href={`#/console/${projectId}/${seg.key}`}
              onClick={(e) => {
                e.preventDefault();
                handleSegmentClick(seg.key);
              }}
              className={cn(
                "segment-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "bg-card border text-[var(--text)] hover:bg-accent"
              )}
            >
              <seg.icon className="size-3.5" />
              {seg.label}
            </a>
          );
        })}
      </div>

      {/* ── Segment Content ── */}
      {activeSegment === "profile" && (
        <ProfileSegment project={project} settings={state.cache.settings} />
      )}

      {activeSegment === "scope" && <ScopeSegment project={project} />}

      {activeSegment === "takeoff" && (
        <TakeOffSegment projectId={projectId} />
      )}

      {activeSegment === "progress" && (
        <ProgressSegment projectId={projectId} />
      )}

      {activeSegment === "snags" && <SnagsSegment projectId={projectId} />}

      {activeSegment === "workorders" && (
        <WorkOrdersSegment projectId={projectId} />
      )}

      {activeSegment === "payments" && (
        <PaymentsSegment projectId={projectId} />
      )}

      {activeSegment === "variations" && (
        <VariationsSegment projectId={projectId} />
      )}

      {activeSegment === "pcr" && <PcrSegment projectId={projectId} />}
    </div>
  );
}
