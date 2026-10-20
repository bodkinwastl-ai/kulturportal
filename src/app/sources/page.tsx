"use client";

import { useState } from "react";
import { AlertTriangle, Edit3, ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CultureSource } from "@/lib/types";
import { useSources } from "@/lib/use-sources";
import { agoLabel, cn, daysSince, hostOf } from "@/lib/utils";
import { PRIORITY_LABEL, PrioritySegment } from "@/components/priority-segment";
import { SourceEditDrawer } from "@/components/source-edit-drawer";
import { ToastNotice } from "@/components/toast-notice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type Filter = "all" | "active" | "inactive" | "nohits";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "active", label: "Aktiv" },
  { value: "inactive", label: "Inaktiv" },
  { value: "nohits", label: "Ohne Treffer" },
];

const STALE_DAYS = 3;

export default function SourcesPage() {
  const { sources, loading, notionConnected, notice, dismissNotice, hitsFor, update, remove, save } = useSources();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<CultureSource | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const openCreate = () => {
    setSelected({ id: "", name: "", url: "", active: true, regions: [], categories: [], priority: 2, notes: "" });
    setCreating(true);
    setDrawerOpen(true);
  };
  const openEdit = (source: CultureSource) => {
    setSelected(source);
    setCreating(false);
    setDrawerOpen(true);
  };
  const handleSave = async (source: CultureSource) => {
    if (await save(source, creating)) {
      setDrawerOpen(false);
      setSelected(null);
    }
  };

  const q = query.trim().toLowerCase();
  const shown = sources.filter((s) => {
    if (q && !`${s.name} ${s.url}`.toLowerCase().includes(q)) return false;
    if (filter === "active") return s.active;
    if (filter === "inactive") return !s.active;
    if (filter === "nohits") return s.active && hitsFor(s.id) === 0;
    return true;
  });

  // "Letzter Check" is written by the radar job; if it never fills it, hide the column instead of warning on every row
  const hasChecks = sources.some((s) => s.lastCheck);

  const stats = [
    { label: "Gesamt", value: sources.length },
    { label: "Aktiv", value: sources.filter((s) => s.active).length },
    { label: "Hoch", value: sources.filter((s) => s.priority === 1).length },
    { label: "Normal", value: sources.filter((s) => s.priority === 2).length },
    { label: "Niedrig", value: sources.filter((s) => s.priority === 3).length },
    { label: "Ohne Treffer", value: sources.filter((s) => s.active && hitsFor(s.id) === 0).length },
  ];

  const groups = [1, 2, 3]
    .map((priority) => ({
      priority,
      items: shown.filter((s) => (s.priority === 1 || s.priority === 3 ? s.priority : 2) === priority).sort((a, b) => a.name.localeCompare(b.name, "de")),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <AppShell notionConnected={notionConnected}>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Quellen</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats[0].value} Quellen · {stats[1].value} aktiv
            </p>
          </div>
          <Button onClick={openCreate} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Neue Quelle
          </Button>
        </div>

        <dl className="grid grid-cols-3 divide-x divide-y divide-border overflow-hidden rounded-lg border border-border bg-card md:grid-cols-6 md:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-3">
              <dt className="text-xs font-medium text-muted-foreground">{s.label}</dt>
              <dd className="font-display text-2xl font-semibold text-foreground">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label="Quellen durchsuchen"
              placeholder="Quellen durchsuchen…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]",
                  filter === f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card text-foreground hover:bg-secondary"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center" role="status" aria-label="Lädt">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : groups.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-medium text-foreground">
              {sources.length === 0 ? "Noch keine Quellen" : "Keine Quellen gefunden"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {sources.length === 0 ? "Füge deine erste Quelle hinzu." : "Andere Suche oder anderer Filter?"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.priority} aria-labelledby={`prio-${group.priority}`}>
                <h2
                  id={`prio-${group.priority}`}
                  className="section-label"
                >
                  {PRIORITY_LABEL[group.priority]}
                  <span className="font-normal">{group.items.length}</span>
                </h2>
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                  {group.items.map((source) => {
                    const hits = hitsFor(source.id);
                    const days = daysSince(source.lastCheck);
                    const stale = hasChecks && source.active && (days === null || days > STALE_DAYS);
                    const host = hostOf(source.url);
                    return (
                      <li
                        key={source.id}
                        className={cn(
                          "flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3",
                          hasChecks
                            ? "lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto_7rem_9rem_auto]"
                            : "lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto_7rem_auto]",
                          !source.active && "bg-secondary/40"
                        )}
                      >
                        <span className="-m-3 flex p-3">
                          <Checkbox
                            checked={source.active}
                            aria-label={`${source.name} aktiv`}
                            onCheckedChange={(checked) =>
                              update(source.id, { active: checked === true }, checked === true ? "Quelle aktiviert" : "Quelle deaktiviert")
                            }
                          />
                        </span>

                        <div className="min-w-0 flex-1 basis-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("truncate font-medium", source.active ? "text-foreground" : "text-muted-foreground")}>
                              {source.name}
                            </span>
                            {!source.active && <span className="shrink-0 text-xs text-muted-foreground">inaktiv</span>}
                          </div>
                          {host ? (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              {host}
                              <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                          ) : (
                            <span className="text-xs text-amber-700">Keine gültige URL</span>
                          )}
                        </div>

                        <PrioritySegment
                          className="order-4 lg:order-none"
                          value={source.priority}
                          name={source.name}
                          onChange={(priority) => update(source.id, { priority }, `Priorität: ${PRIORITY_LABEL[priority]}`)}
                        />

                        <span
                          className={cn(
                            "order-4 text-sm lg:order-none",
                            source.active && hits === 0 ? "font-medium text-amber-700" : "text-muted-foreground"
                          )}
                          title="Kommende Events dieser Quelle"
                        >
                          {hits} {hits === 1 ? "Event" : "Events"}
                        </span>

                        {hasChecks && (
                        <span
                          className={cn("order-4 flex items-center gap-1 text-sm lg:order-none", stale ? "text-amber-700" : "text-muted-foreground")}
                          title="Letzter Check durch den Radar"
                        >
                          {stale && <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                          {days === null ? "nie geprüft" : agoLabel(days)}
                        </span>
                        )}

                        <div className="order-3 ml-auto flex items-center gap-1 lg:order-none">
                          <Button variant="ghost" size="icon" aria-label={`${source.name} bearbeiten`} onClick={() => openEdit(source)}>
                            <Edit3 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`${source.name} löschen`}
                            onClick={() => remove(source.id)}
                            className="text-red-700 hover:bg-red-50 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <SourceEditDrawer
        source={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={handleSave}
        isCreating={creating}
      />
      <ToastNotice notice={notice} onDismiss={dismissNotice} />
    </AppShell>
  );
}
