/* ───────────────────────────────────────────
   useAppState — Global app state hook

   Wraps the imperative cache object from api.ts
   with React state so components re-render.
   ─────────────────────────────────────────── */

import { useState, useEffect, useCallback, useRef } from "react";
import type { AppCache, Project } from "@/types";
import {
  getFullCache,
  getCurrentProjectId,
  setCurrentProjectId as setCurrentProjectIdApi,
  refreshAllData,
} from "@/lib/api";
import { seedCacheFromBackup } from "@/lib/backup";

/* ─── Eagerly seed cache from localStorage on first import ───
   This matches the original api.js IIFE pattern so data is
   available before any React component mounts.            */
seedCacheFromBackup();

interface AppState {
  cache: AppCache;
  currentProjectId: string;
  currentProject: Project | null;
  isLoading: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
}

/** Global mutable state shared across hook instances */
let globalListeners: Array<() => void> = [];
let globalState: AppState | null = null;

function getInitialState(): AppState {
  return {
    cache: getFullCache(),
    currentProjectId: getCurrentProjectId(),
    currentProject: null,
    isLoading: true, /* Start loading until first refresh completes */
    isOnline: navigator.onLine,
    pendingSyncCount: 0,
  };
}

export function useAppState() {
  const [, forceUpdate] = useState(0);
  const stateRef = useRef<AppState>(globalState || getInitialState());

  if (!globalState) {
    globalState = stateRef.current;
  }

  const syncFromCache = useCallback(() => {
    const cache = getFullCache();
    const currentProjectId = getCurrentProjectId();
    const currentProject =
      cache.projects.find((p: Project) => p.projectId === currentProjectId) ||
      null;
    stateRef.current = {
      ...stateRef.current,
      cache,
      currentProjectId,
      currentProject,
    };
    if (globalState) globalState = stateRef.current;
    forceUpdate((v) => v + 1);
  }, []);

  useEffect(() => {
    const listener = () => forceUpdate((v) => v + 1);
    globalListeners.push(listener);

    /* Listen for cache update events from api.ts */
    const onCacheUpdate = () => syncFromCache();
    window.addEventListener("cacheupdated" as any, onCacheUpdate);

    /* Online / offline */
    const onOnline = () => {
      stateRef.current.isOnline = true;
      forceUpdate((v) => v + 1);
    };
    const onOffline = () => {
      stateRef.current.isOnline = false;
      forceUpdate((v) => v + 1);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    /* Sync queue changes */
    const onSyncQueue = (e: Event) => {
      const count = (e as CustomEvent).detail?.count || 0;
      stateRef.current.pendingSyncCount = count;
      forceUpdate((v) => v + 1);
    };
    window.addEventListener("syncqueuechange" as any, onSyncQueue);

    return () => {
      globalListeners = globalListeners.filter((l) => l !== listener);
      window.removeEventListener("cacheupdated" as any, onCacheUpdate);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("syncqueuechange" as any, onSyncQueue);
    };
  }, [syncFromCache]);

  const setCurrentProjectId = useCallback((id: string) => {
    setCurrentProjectIdApi(id);
    const cache = getFullCache();
    const currentProject =
      cache.projects.find((p: Project) => p.projectId === id) || null;
    stateRef.current = {
      ...stateRef.current,
      currentProjectId: id,
      currentProject,
    };
    if (globalState) globalState = stateRef.current;
    forceUpdate((v) => v + 1);
  }, []);

  const loadData = useCallback(async () => {
    /* Cache already seeded from localStorage at module import time.
       Sync React state so UI shows cached data immediately. */
    syncFromCache();

    /* Now try to refresh from the server */
    try {
      await refreshAllData();
      syncFromCache();
    } catch {
      /* Network error — cached data is already showing */
    } finally {
      stateRef.current.isLoading = false;
      forceUpdate((v) => v + 1);
    }
  }, [syncFromCache]);

  return {
    state: stateRef.current,
    setCurrentProjectId,
    loadData,
    refresh: syncFromCache,
  };
}
