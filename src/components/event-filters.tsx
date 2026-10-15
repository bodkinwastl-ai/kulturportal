"use client";

import { CultureEventStatus } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { categoryColor } from "@/lib/category-colors";

interface EventFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedRegions: string[];
  onRegionsChange: (regions: string[]) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedStatuses: CultureEventStatus[];
  onStatusesChange: (statuses: CultureEventStatus[]) => void;
  availableRegions: string[];
  availableCategories: string[];
  onClearFilters: () => void;
}

const statusOptions: { value: CultureEventStatus; label: string }[] = [
  { value: "Neu", label: "Neu" },
  { value: "Interessant", label: "Interessant" },
  { value: "Kalender", label: "Kalender" },
  { value: "Einladen", label: "Einladen" },
  { value: "Gebucht", label: "Gebucht" },
  { value: "Vielleicht", label: "Vielleicht" },
  { value: "Ignorieren", label: "Ignorieren" },
];

export function EventFilters({
  searchTerm,
  onSearchChange,
  selectedRegions,
  onRegionsChange,
  selectedCategories,
  onCategoriesChange,
  selectedStatuses,
  onStatusesChange,
  availableRegions,
  availableCategories,
  onClearFilters
}: EventFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  
  const hasActiveFilters = 
    selectedRegions.length > 0 || 
    selectedCategories.length > 0 || 
    selectedStatuses.length > 0 ||
    searchTerm.length > 0;
  
  const toggleRegion = (region: string) => {
    if (selectedRegions.includes(region)) {
      onRegionsChange(selectedRegions.filter(r => r !== region));
    } else {
      onRegionsChange([...selectedRegions, region]);
    }
  };
  
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };
  
  const toggleStatus = (status: CultureEventStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };
  
  const activeCount = selectedRegions.length + selectedCategories.length + selectedStatuses.length + (searchTerm ? 1 : 0);

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-sm transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-input bg-card text-foreground hover:bg-secondary"
    );

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Search + toggle */}
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Events durchsuchen"
            placeholder="Events durchsuchen…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          aria-expanded={showFilters}
          onClick={() => setShowFilters(!showFilters)}
          className={cn(hasActiveFilters && "border-accent text-accent")}
        >
          <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
          Filter
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-accent px-1.5 text-xs text-accent-foreground">{activeCount}</span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground">
            <X className="mr-1 h-4 w-4" aria-hidden="true" />
            Zurücksetzen
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">Status</legend>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(({ value, label }) => (
                <button key={value} type="button" aria-pressed={selectedStatuses.includes(value)} onClick={() => toggleStatus(value)} className={chip(selectedStatuses.includes(value))}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {availableRegions.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">Regionen</legend>
              <div className="flex flex-wrap gap-2">
                {availableRegions.map((region) => (
                  <button key={region} type="button" aria-pressed={selectedRegions.includes(region)} onClick={() => toggleRegion(region)} className={chip(selectedRegions.includes(region))}>
                    {region}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {availableCategories.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">Kategorien</legend>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => {
                  const active = selectedCategories.includes(category);
                  return (
                    <button key={category} type="button" aria-pressed={active} onClick={() => toggleCategory(category)} className={cn(chip(active), "inline-flex items-center gap-2")}>
                      <span className={cn("h-2 w-2 rounded-full", categoryColor(category).bar)} aria-hidden="true" />
                      {category}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
}
