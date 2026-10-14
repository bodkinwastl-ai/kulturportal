"use client";

import { useState, useEffect } from "react";
import { CultureSource } from "@/lib/types";
import { X, Save, Globe, MapPin, Tag, Star, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SourceEditDrawerProps {
  source: CultureSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (source: CultureSource) => void;
  isCreating: boolean;
}

const REGIONS = [
  "Wien", "Oberösterreich", "Salzburg", "Steiermark", "Tirol", 
  "Niederösterreich", "Kärnten", "Vorarlberg", "Burgenland", "Online"
];

const CATEGORIES = [
  "Jazz", "Klassik", "Pop", "Rock", "Electronic", "Folk",
  "Theater", "Musical", "Oper", "Kabarett", "Comedy",
  "Film", "Kino", "Festival", "Konzert", "Ausstellung",
  "Museum", "Kunst", "Literatur", "Lesung", "Vortrag",
  "Workshop", "Kurs", "Food", "Kulinarik", "KI", "AI",
  "Tech", "Startup", "Business", "Networking"
];

export function SourceEditDrawer({
  source,
  open,
  onOpenChange,
  onSave,
  isCreating
}: SourceEditDrawerProps) {
  const [formData, setFormData] = useState<CultureSource>({
    id: "",
    name: "",
    url: "",
    active: true,
    regions: [],
    categories: [],
    priority: 2,
    notes: ""
  });

  const [regionInput, setRegionInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  useEffect(() => {
    if (source) {
      setFormData(source);
    } else {
      setFormData({
        id: "",
        name: "",
        url: "",
        active: true,
        regions: [],
        categories: [],
        priority: 2,
        notes: ""
      });
    }
  }, [source]);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      alert("Name und URL sind erforderlich");
      return;
    }

    onSave(formData);
  };

  const addRegion = (region: string) => {
    if (region && !formData.regions.includes(region)) {
      setFormData(prev => ({
        ...prev,
        regions: [...prev.regions, region]
      }));
    }
    setRegionInput("");
  };

  const removeRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.filter(r => r !== region)
    }));
  };

  const addCategory = (category: string) => {
    if (category && !formData.categories.includes(category)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
    setCategoryInput("");
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return "Hoch";
      case 2: return "Normal";
      case 3: return "Niedrig";
      default: return "Normal";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isCreating ? "Neue Quelle hinzufügen" : "Quelle bearbeiten"}
          </SheetTitle>
          <SheetDescription>
            {isCreating 
              ? "Füge eine neue Kulturveranstaltungs-Quelle hinzu"
              : "Bearbeite die Eigenschaften dieser Quelle"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Name der Quelle *</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Wiener Staatsoper"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="url">Website URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://www.example.com"
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, active: checked as boolean }))
                }
              />
              <Label htmlFor="active">Quelle ist aktiv</Label>
            </div>
          </div>

          {/* Priority */}
          <div>
            <Label className="flex items-center space-x-2 mb-2">
              <Star className="w-4 h-4" />
              <span>Priorität</span>
            </Label>
            <Select
              value={formData.priority.toString()}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, priority: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Hoch</SelectItem>
                <SelectItem value="2">2 - Normal</SelectItem>
                <SelectItem value="3">3 - Niedrig</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Regions */}
          <div>
            <Label className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Regionen</span>
            </Label>
            <Select value={regionInput} onValueChange={addRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Region hinzufügen..." />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.filter(r => !formData.regions.includes(r)).map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.regions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.regions.map(region => (
                  <Badge 
                    key={region} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => removeRegion(region)}
                  >
                    {region}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <Label className="flex items-center space-x-2 mb-2">
              <Tag className="w-4 h-4" />
              <span>Kategorien</span>
            </Label>
            <Select value={categoryInput} onValueChange={addCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie hinzufügen..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter(c => !formData.categories.includes(c)).map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.categories.map(category => (
                  <Badge 
                    key={category} 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => removeCategory(category)}
                  >
                    {category}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Notizen</span>
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Zusätzliche Informationen zu dieser Quelle..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isCreating ? "Quelle erstellen" : "Änderungen speichern"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}