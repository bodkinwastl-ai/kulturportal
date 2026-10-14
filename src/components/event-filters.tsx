"use client";

import { CultureEventStatus } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="px-6 py-4">
        {/* Suchleiste und Filter Toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Events durchsuchen..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "relative",
              hasActiveFilters && "border-blue-500 text-blue-700"
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {selectedRegions.length + selectedCategories.length + selectedStatuses.length + (searchTerm ? 1 : 0)}
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4 mr-1" />
              Zurücksetzen
            </Button>
          )}
        </div>
        
        {/* Filter Optionen */}
        {showFilters && (
          <div className="mt-4 space-y-4 pt-4 border-t border-slate-200">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => toggleStatus(value)}
                    className={cn(
                      "px-3 py-1 text-sm rounded-full border transition-colors",
                      selectedStatuses.includes(value)
                        ? "bg-blue-100 border-blue-300 text-blue-800"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Regionen Filter */}
            {availableRegions.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Regionen
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableRegions.map((region) => (
                    <button
                      key={region}
                      onClick={() => toggleRegion(region)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full border transition-colors",
                        selectedRegions.includes(region)
                          ? "bg-green-100 border-green-300 text-green-800"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Kategorien Filter */}
            {availableCategories.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Kategorien
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full border transition-colors",
                        selectedCategories.includes(category)
                          ? "bg-purple-100 border-purple-300 text-purple-800"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}