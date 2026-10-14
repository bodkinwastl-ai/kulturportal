"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CultureSource } from "@/lib/types";
import { Plus, Search, Globe, Users, Star, Clock, Edit3, Trash2, ExternalLink, Filter, Grid3X3, List, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SourceEditDrawer } from "@/components/source-edit-drawer";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list" | "compact";

export default function SourcesPage() {
  const [sources, setSources] = useState<CultureSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [notionConnected, setNotionConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [selectedSource, setSelectedSource] = useState<CultureSource | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("compact");

  const fetchSources = async () => {
    try {
      const response = await fetch("/api/sources");
      const data = await response.json();
      setSources(data.sources || []);
      setNotionConnected(data.notionConnected || false);
    } catch (error) {
      console.error("Fehler beim Laden der Quellen:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === null || source.active === filterActive;
    const matchesPriority = filterPriority === null || source.priority === filterPriority;
    return matchesSearch && matchesFilter && matchesPriority;
  });

  const handleCreateSource = () => {
    setSelectedSource({
      id: "",
      name: "",
      url: "",
      active: true,
      regions: [],
      categories: [],
      priority: 2,
      notes: ""
    });
    setIsCreating(true);
    setIsDrawerOpen(true);
  };

  const handleEditSource = (source: CultureSource) => {
    setSelectedSource(source);
    setIsCreating(false);
    setIsDrawerOpen(true);
  };

  const handleSaveSource = async (source: CultureSource) => {
    try {
      const url = isCreating ? "/api/sources" : `/api/sources/${source.id}`;
      const method = isCreating ? "POST" : "PATCH";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(source)
      });

      if (response.ok) {
        await fetchSources();
        setIsDrawerOpen(false);
        setSelectedSource(null);
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Quelle:", error);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm("Quelle wirklich löschen?")) return;
    
    try {
      const response = await fetch(`/api/sources/${sourceId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        await fetchSources();
      }
    } catch (error) {
      console.error("Fehler beim Löschen der Quelle:", error);
    }
  };

  const toggleActive = async (sourceId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/sources/${sourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active })
      });
      
      if (response.ok) {
        await fetchSources();
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Quelle:", error);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return "priority-high";
    if (priority === 2) return "priority-normal";
    return "priority-low";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 1) return "Hoch";
    if (priority === 2) return "Normal";
    return "Niedrig";
  };

  // Stats
  const stats = {
    total: sources.length,
    active: sources.filter(s => s.active).length,
    high: sources.filter(s => s.priority === 1).length,
    normal: sources.filter(s => s.priority === 2).length,
    low: sources.filter(s => s.priority === 3).length
  };

  const activeFiltersCount = (
    (searchTerm ? 1 : 0) + 
    (filterActive !== null ? 1 : 0) + 
    (filterPriority !== null ? 1 : 0)
  );

  if (loading) {
    return (
      <AppShell notionConnected={notionConnected}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell notionConnected={notionConnected}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quellen Verwaltung</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} Kulturveranstaltungs-Quellen • {stats.active} aktiv
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleCreateSource} size="sm" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Neue Quelle</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="enterprise-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Gesamt</p>
                  <p className="text-xl font-bold text-foreground">{stats.total}</p>
                </div>
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Aktiv</p>
                  <p className="text-xl font-bold text-foreground">{stats.active}</p>
                </div>
                <Globe className="w-4 h-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Hoch</p>
                  <p className="text-xl font-bold text-foreground">{stats.high}</p>
                </div>
                <Star className="w-4 h-4 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Normal</p>
                  <p className="text-xl font-bold text-foreground">{stats.normal}</p>
                </div>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="enterprise-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Niedrig</p>
                  <p className="text-xl font-bold text-foreground">{stats.low}</p>
                </div>
                <Users className="w-4 h-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & View Controls */}
        <Card className="enterprise-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Quellen durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filter Buttons */}
              <div className="flex items-center space-x-2">
                <Badge variant={activeFiltersCount > 0 ? "default" : "outline"} className="text-xs">
                  {activeFiltersCount > 0 ? `${activeFiltersCount} Filter` : "Alle"}
                </Badge>
                
                <Button
                  variant={filterActive === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(null)}
                >
                  Alle
                </Button>
                <Button
                  variant={filterActive === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(true)}
                >
                  Aktiv
                </Button>
                <Button
                  variant={filterActive === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(false)}
                >
                  Inaktiv
                </Button>
              </div>
              
              {/* View Mode */}
              <div className="flex items-center space-x-1 border border-slate-300 rounded-md">
                <button
                  onClick={() => setViewMode("compact")}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === "compact" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sources Display */}
        {filteredSources.length > 0 ? (
          viewMode === "compact" ? (
            // Compact List View - Sehr dicht für viele Einträge
            <Card className="enterprise-card">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200">
                  {filteredSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Checkbox
                          checked={source.active}
                          onCheckedChange={(checked) => 
                            toggleActive(source.id, checked as boolean)
                          }
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-sm text-foreground truncate">
                              {source.name}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getPriorityColor(source.priority))}
                            >
                              {getPriorityLabel(source.priority)}
                            </Badge>
                          </div>
                          <a 
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center mt-1"
                          >
                            <Globe className="w-3 h-3 mr-1" />
                            {new URL(source.url).hostname}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {source.regions && source.regions.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {source.regions.length} Regionen
                          </Badge>
                        )}
                        {source.categories && source.categories.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {source.categories.length} Kategorien
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSource(source)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSource(source.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            // Grid View
            <div className="dense-grid sm:grid-cols-2 xl:grid-cols-3">
              {filteredSources.map((source) => (
                <Card key={source.id} className="enterprise-card hover-lift">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {source.name}
                        </h3>
                        <a 
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:text-primary/80 flex items-center mt-1"
                        >
                          <Globe className="w-3 h-3 mr-1" />
                          <span className="truncate">{new URL(source.url).hostname}</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                      <Checkbox
                        checked={source.active}
                        onCheckedChange={(checked) => 
                          toggleActive(source.id, checked as boolean)
                        }
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-3">
                    {/* Priority & Stats */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getPriorityColor(source.priority))}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {getPriorityLabel(source.priority)}
                      </Badge>
                      {source.lastCheck && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(source.lastCheck).toLocaleDateString('de-DE')}
                        </div>
                      )}
                    </div>

                    {/* Regions & Categories */}
                    <div className="space-y-2">
                      {source.regions && source.regions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {source.regions.slice(0, 2).map((region) => (
                            <Badge key={region} variant="secondary" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                          {source.regions.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{source.regions.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {source.categories && source.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {source.categories.slice(0, 2).map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {source.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{source.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {source.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {source.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSource(source)}
                        className="h-7 px-2 text-xs"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSource(source.id)}
                        className="h-7 px-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card className="enterprise-card">
            <CardContent className="text-center py-12">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || filterActive !== null ? "Keine Quellen gefunden" : "Noch keine Quellen"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchTerm || filterActive !== null 
                  ? "Versuche andere Suchbegriffe oder Filter"
                  : "Füge deine erste Kulturveranstaltungs-Quelle hinzu"
                }
              </p>
              {(!searchTerm && filterActive === null) && (
                <Button onClick={handleCreateSource}>
                  <Plus className="w-4 h-4 mr-2" />
                  Erste Quelle hinzufügen
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit/Create Drawer */}
      <SourceEditDrawer
        source={selectedSource}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSave={handleSaveSource}
        isCreating={isCreating}
      />
    </AppShell>
  );
}