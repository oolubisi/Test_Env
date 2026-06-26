/* ───────────────────────────────────────────
   Layout — Mobile-first app shell
   Phone-width constrained (max 500px), large
   touch targets, sticky header, safe-area aware.
   ─────────────────────────────────────────── */

import type { ReactNode } from "react";
import { useLocation, Link } from "wouter";
import {
  Home,
  HardHat,
  Truck,
  Calculator,
  FileText,
  Mail,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/hooks/useAppState";
import { triggerManualSync } from "@/lib/api";
import SyncBadge from "./SyncBadge";

const SEGMENTS = [
  { path: "/", label: "Projects", icon: HardHat },
  { path: "/vendors", label: "Vendors", icon: Truck },
  { path: "/accounts", label: "Accounts", icon: Calculator },
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/letterhead", label: "Letterhead", icon: Mail },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { state } = useAppState();

  /* Determine active top-level path */
  const activeSegment =
    SEGMENTS.find((s) =>
      s.path === "/" ? location === "/" : location.startsWith(s.path)
    )?.path || "/";

  /* PWA install prompt */
  const handleInstall = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      await promptEvent.userChoice;
      (window as any).deferredPrompt = null;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg)]">
      {/* ─── Header — sticky, safe-area aware ─── */}
      <header
        className="sticky top-0 z-50 bg-[var(--primary)] text-white shadow-md"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: home + title */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="flex items-center justify-center w-[44px] h-[44px] rounded-[12px] bg-white/15 hover:bg-white/25 transition-colors"
              title="Home"
            >
              <Home className="size-5" />
            </Link>
            <h1 className="text-[22px] font-extrabold tracking-tight">
              FieldScan<span className="font-normal"> Pro</span>
            </h1>
          </div>

          {/* Right: sync + install + refresh */}
          <div className="flex items-center gap-2">
            <SyncBadge
              isOnline={state.isOnline}
              pendingCount={state.pendingSyncCount}
              onSyncClick={triggerManualSync}
            />
            <button
              onClick={handleInstall}
              className="install-btn flex items-center gap-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 px-3 py-2 rounded-full transition-colors"
              title="Install App"
            >
              <i className="fas fa-download" />
              Install
            </button>
          </div>
        </div>

        {/* ─── Segment Navigation — scrollable, large touch targets ─── */}
        <nav className="segment-bar flex overflow-x-auto px-1.5 pb-1.5 gap-1">
          {SEGMENTS.map((seg) => {
            const isActive = activeSegment === seg.path;
            return (
              <Link
                key={seg.path}
                href={seg.path}
                className={cn(
                  "segment-btn flex items-center gap-1.5 px-3 py-3 text-[13px] font-bold rounded-[12px] whitespace-nowrap transition-colors min-h-[44px]",
                  isActive
                    ? "bg-[var(--text)] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--card-light)]"
                )}
              >
                <seg.icon className="size-4" />
                {seg.label}
              </Link>
            );
          })}
          <button
            onClick={triggerManualSync}
            className="segment-btn flex items-center gap-1.5 px-3 py-3 text-[13px] font-bold rounded-[12px] whitespace-nowrap text-[var(--muted)] hover:bg-[var(--card-light)] min-h-[44px]"
          >
            <i className="fas fa-sync-alt" />
            Sync
            {state.pendingSyncCount > 0 && (
              <span className="sync-count-badge">{state.pendingSyncCount}</span>
            )}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="segment-btn flex items-center gap-1.5 px-3 py-3 text-[13px] font-bold rounded-[12px] whitespace-nowrap text-[var(--muted)] hover:bg-[var(--card-light)] min-h-[44px]"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </nav>
      </header>

      {/* ─── Content ─── */}
      <main
        className="flex-1 overflow-y-auto p-4"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </main>
    </div>
  );
}
