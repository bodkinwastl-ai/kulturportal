"use client";

import { useEffect, useRef, useState } from "react";
import { CultureEvent, CultureSource } from "@/lib/types";
import { isUpcoming } from "@/lib/utils";
import type { Notice } from "@/lib/use-events";

/** Loads sources (+ events for hit counts) and owns every write: optimistic, rollback, undo. */
export function useSources() {
  const [sources, setSources] = useState<CultureSource[]>([]);
  const [events, setEvents] = useState<CultureEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notionConnected, setNotionConnected] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeId = useRef(0);
  const sourcesRef = useRef(sources);
  useEffect(() => {
    sourcesRef.current = sources;
  }, [sources]);

  const show = (n: Omit<Notice, "id">) => setNotice({ ...n, id: ++noticeId.current });
  const errorText = (e: unknown) => (e instanceof Error ? e.message : "unbekannter Fehler");

  async function loadSources() {
    const data = await (await fetch("/api/sources")).json();
    setSources(data.sources || []);
    setNotionConnected(data.notionConnected || false);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/sources").then((r) => r.json()),
      fetch("/api/events").then((r) => r.json()),
    ])
      .then(([src, ev]) => {
        if (cancelled) return;
        setSources(src.sources || []);
        setNotionConnected(src.notionConnected || false);
        setEvents(ev.events || []);
      })
      .catch((error) => console.error("Fehler beim Laden der Quellen:", error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function request(url: string, method: string, body?: unknown) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Fehler ${response.status}`);
    }
  }

  const apply = (id: string, patch: Partial<CultureSource>) =>
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  async function update(id: string, patch: Partial<CultureSource>, okMessage?: string) {
    const before = sourcesRef.current.find((s) => s.id === id);
    if (!before) return;
    const previous = Object.fromEntries(
      (Object.keys(patch) as (keyof CultureSource)[]).map((k) => [k, before[k]])
    ) as Partial<CultureSource>;

    apply(id, patch);
    try {
      await request(`/api/sources/${id}`, "PATCH", patch);
      if (okMessage) show({ kind: "ok", message: okMessage, undo: () => update(id, previous, "Rückgängig gemacht") });
    } catch (error) {
      apply(id, previous);
      show({ kind: "error", message: `Speichern fehlgeschlagen: ${errorText(error)}` });
    }
  }

  async function remove(id: string) {
    const index = sourcesRef.current.findIndex((s) => s.id === id);
    const removed = sourcesRef.current[index];
    if (!removed) return;

    setSources((prev) => prev.filter((s) => s.id !== id));
    try {
      await request(`/api/sources/${id}`, "DELETE");
      show({
        kind: "ok",
        message: `„${removed.name}“ gelöscht`,
        undo: async () => {
          try {
            await request(`/api/sources/${id}`, "PATCH", { restore: true });
            setSources((prev) => (prev.some((s) => s.id === id) ? prev : [...prev, removed]));
            show({ kind: "ok", message: "Quelle wiederhergestellt" });
          } catch (error) {
            show({ kind: "error", message: `Wiederherstellen fehlgeschlagen: ${errorText(error)}` });
          }
        },
      });
    } catch (error) {
      setSources((prev) => [...prev.slice(0, index), removed, ...prev.slice(index)]);
      show({ kind: "error", message: `Löschen fehlgeschlagen: ${errorText(error)}` });
    }
  }

  /** Create or edit from the drawer; returns true on success. */
  async function save(source: CultureSource, isCreating: boolean): Promise<boolean> {
    try {
      await request(isCreating ? "/api/sources" : `/api/sources/${source.id}`, isCreating ? "POST" : "PATCH", source);
      await loadSources();
      show({ kind: "ok", message: isCreating ? "Quelle angelegt" : "Quelle gespeichert" });
      return true;
    } catch (error) {
      show({ kind: "error", message: `Speichern fehlgeschlagen: ${errorText(error)}` });
      return false;
    }
  }

  // Upcoming, non-ignored events per source (by relation id; demo data falls back to the name)
  const hits = new Map<string, number>();
  for (const e of events) {
    if (e.status === "Ignorieren" || !isUpcoming(e.date)) continue;
    const source = sources.find((s) => (e.sourceId ? s.id === e.sourceId : !!e.sourceName && s.name === e.sourceName));
    if (source) hits.set(source.id, (hits.get(source.id) ?? 0) + 1);
  }

  return {
    sources,
    loading,
    notionConnected,
    notice,
    dismissNotice: () => setNotice(null),
    hitsFor: (id: string) => hits.get(id) ?? 0,
    update,
    remove,
    save,
  };
}
