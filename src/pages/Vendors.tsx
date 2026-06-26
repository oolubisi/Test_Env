/* ───────────────────────────────────────────
   Vendors — Vendor list with search, trade filter + modal
   ─────────────────────────────────────────── */

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Plus, Loader2Icon, UsersRound } from "lucide-react";
import type { Vendor } from "@/types";
import { callApi, setCache } from "@/lib/api";
import { useAppState } from "@/hooks/useAppState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { splitAttachments } from "@/lib/utils";
import VendorModal from "@/components/modals/VendorModal";

export default function Vendors() {
  const { state, loadData } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [tradeFilter, setTradeFilter] = useState("");
  const [trades, setTrades] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* Initial data load */
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Refresh vendors + extract unique trades */
  const refreshVendors = useCallback(async () => {
    setIsRefreshing(true);
    setError("");
    try {
      const resp = await callApi("getVendors", {});
      if (resp.status === "success" && Array.isArray(resp.data)) {
        const vendors = resp.data as Vendor[];
        setCache("vendors", vendors);
        window.dispatchEvent(new CustomEvent("cacheupdated"));

        /* Extract unique trades */
        const uniqueTrades = Array.from(
          new Set(vendors.map((v) => v.trade).filter(Boolean))
        ).sort();
        setTrades(uniqueTrades);
      } else if (resp.status === "error") {
        setError(resp.message || "Failed to load vendors.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vendors.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /* Extract trades from cache on mount */
  useEffect(() => {
    const vendors = state.cache.vendors || [];
    const uniqueTrades = Array.from(
      new Set(vendors.map((v: Vendor) => v.trade).filter(Boolean))
    ).sort();
    setTrades(uniqueTrades);
  }, [state.cache.vendors]);

  /* Filter vendors */
  const filteredVendors = useMemo(() => {
    const vendors = state.cache.vendors || [];
    return vendors.filter((v: Vendor) => {
      const matchesSearch =
        !searchTerm.trim() ||
        (v.company || "").toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (v.contactName || "").toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesTrade =
        !tradeFilter || v.trade === tradeFilter;

      return matchesSearch && matchesTrade;
    });
  }, [state.cache.vendors, searchTerm, tradeFilter]);

  const openNewModal = useCallback(() => {
    setEditVendor(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((vendor: Vendor) => {
    setEditVendor(vendor);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditVendor(null);
  }, []);

  /* Get first passport photo for vendor */
  const getPassportUrl = (vendor: Vendor): string | null => {
    if (!vendor.passport) return null;
    const photos = splitAttachments(vendor.passport);
    return photos.length > 0 ? photos[0] : null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vendors</h2>
        <span className="text-xs text-muted-foreground">
          {filteredVendors.length} vendor(s)
        </span>
      </div>

      {/* Search + Trade Filter + Add */}
      <div className="flex gap-2">
        <div className="relative flex-[2]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search company or contact…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={tradeFilter}
          onChange={(e) => setTradeFilter(e.target.value)}
          className="flex-1 min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="">All Trades</option>
          {trades.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Button
          onClick={openNewModal}
          className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 shrink-0"
          size="sm"
        >
          <Plus className="size-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Loading */}
      {state.isLoading && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Loader2Icon className="inline-block size-4 animate-spin mr-2" />
          Loading vendors…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
          <button
            onClick={refreshVendors}
            className="ml-2 underline text-destructive hover:no-underline"
            disabled={isRefreshing}
          >
            {isRefreshing ? "Retrying…" : "Retry"}
          </button>
        </div>
      )}

      {/* No vendors */}
      {!state.isLoading &&
        (!state.cache.vendors || state.cache.vendors.length === 0) && (
          <div className="card text-center py-12">
            <div className="text-4xl text-muted-foreground/30 mb-3">
              <UsersRound className="inline-block size-12" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No vendors yet. Add your first vendor.
            </p>
            <Button
              onClick={openNewModal}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90"
              size="sm"
            >
              <Plus className="size-4 mr-1" />
              Add Vendor
            </Button>
          </div>
        )}

      {/* Vendor cards */}
      {!state.isLoading && filteredVendors.length > 0 && (
        <div className="grid gap-2">
          {filteredVendors.map((vendor: Vendor) => {
            const passportUrl = getPassportUrl(vendor);
            return (
              <div
                key={vendor.vendorId}
                className="card p-3 flex items-center gap-3 cursor-pointer hover:border-[var(--primary)]/40 transition-colors"
                onClick={() => openEditModal(vendor)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    openEditModal(vendor);
                  }
                }}
              >
                {/* Passport photo */}
                <div className="shrink-0">
                  {passportUrl ? (
                    <img
                      src={passportUrl}
                      alt={vendor.company}
                      className="w-[50px] h-[50px] rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-[50px] h-[50px] rounded-full bg-muted flex items-center justify-center border">
                      <UsersRound className="size-5 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {vendor.company}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {vendor.trade}
                    {vendor.trade && vendor.contactName ? " — " : ""}
                    {vendor.contactName}
                  </div>
                </div>

                {/* Phone */}
                <div className="text-xs text-muted-foreground shrink-0">
                  {vendor.phone1}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No filter results */}
      {!state.isLoading &&
        (searchTerm || tradeFilter) &&
        filteredVendors.length === 0 &&
        state.cache.vendors &&
        state.cache.vendors.length > 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No vendors match your filters.
          </div>
        )}

      {/* Vendor Modal */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editVendor={editVendor}
      />
    </div>
  );
}
