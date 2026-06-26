/* ───────────────────────────────────────────
   SyncBadge — Online/offline + pending count
   ─────────────────────────────────────────── */

import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncBadgeProps {
  isOnline: boolean;
  pendingCount: number;
  onSyncClick: () => void;
}

export default function SyncBadge({
  isOnline,
  pendingCount,
  onSyncClick,
}: SyncBadgeProps) {
  return (
    <button
      onClick={onSyncClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
        isOnline
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-red-500/30 text-red-100 hover:bg-red-500/40"
      )}
      title={isOnline ? "Click to sync" : "Offline — changes queued"}
    >
      {isOnline ? (
        <Wifi className="size-3" />
      ) : (
        <WifiOff className="size-3" />
      )}

      {/* Pending count badge */}
      {pendingCount > 0 && (
        <span
          id="sync-badge"
          className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold"
        >
          {pendingCount > 99 ? "99+" : pendingCount}
        </span>
      )}

      <RefreshCw className="size-3 ml-0.5" />
    </button>
  );
}
