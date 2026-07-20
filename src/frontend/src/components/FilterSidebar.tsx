import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useCategoryCount } from "@/hooks/use-jobs";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/types";
import type { Category, SearchParams } from "@/types";
import { MapPin, SlidersHorizontal } from "lucide-react";

const CATEGORIES: Array<Category | "Todas"> = [
  "Todas",
  "Albanil",
  "Carpintero",
  "Pintor",
  "Electricista",
  "Plomero",
  "Soldador",
  "Jardinero",
  "Mecanico",
  "Otros",
];

interface FilterContentProps {
  filters: SearchParams;
  onChange: (f: Partial<SearchParams>) => void;
  onReset: () => void;
}

function FilterContent({ filters, onChange, onReset }: FilterContentProps) {
  const { data: counts } = useCategoryCount() as {
    data: Record<string, number> | undefined;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-foreground text-base">
          Filtros
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-primary transition-colors font-body"
          data-ocid="filter-reset"
        >
          Limpiar todo
        </button>
      </div>

      <Separator />

      {/* Category */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-body">
          Categoría
        </p>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => {
            const isActive = filters.category === cat;
            const count =
              cat !== "Todas" && counts ? (counts[cat as Category] ?? 0) : null;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange({ category: cat })}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm font-body transition-smooth text-left",
                  isActive
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-foreground hover:bg-muted",
                )}
                data-ocid={`filter-cat-${cat.toLowerCase()}`}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                {count !== null && (
                  <span
                    className={cn(
                      "text-xs rounded-full px-1.5",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Location */}
      <div>
        <Label
          htmlFor="filter-location"
          className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-body"
        >
          <MapPin className="h-3.5 w-3.5" />
          Ciudad / Ubicación
        </Label>
        <Input
          id="filter-location"
          type="text"
          placeholder="Ciudad en Bolivia..."
          value={filters.location}
          onChange={(e) => onChange({ location: e.target.value })}
          className="h-9 text-sm font-body"
          data-ocid="filter-location"
        />
      </div>

      <Separator />

      {/* Remote toggle */}
      <div className="flex items-center justify-between">
        <Label
          htmlFor="filter-remote"
          className="font-body text-sm cursor-pointer"
        >
          Solo trabajos remotos
        </Label>
        <Switch
          id="filter-remote"
          checked={filters.isRemote === true}
          onCheckedChange={(v) => onChange({ isRemote: v ? true : null })}
          data-ocid="filter-remote"
        />
      </div>
    </div>
  );
}

interface FilterSidebarProps {
  filters: SearchParams;
  onChange: (f: Partial<SearchParams>) => void;
  onReset: () => void;
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <aside
      className="sticky top-20 hidden lg:block w-64 shrink-0"
      data-ocid="filter-sidebar"
    >
      <div className="rounded-lg border border-border bg-card p-4">
        <FilterContent
          filters={filters}
          onChange={onChange}
          onReset={onReset}
        />
      </div>
    </aside>
  );
}

export function MobileFilterDrawer({
  filters,
  onChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden gap-2"
          data-ocid="filter-mobile-trigger"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {(filters.category !== "Todas" || filters.isRemote) && (
            <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display">Filtros de búsqueda</SheetTitle>
        </SheetHeader>
        <FilterContent
          filters={filters}
          onChange={onChange}
          onReset={onReset}
        />
      </SheetContent>
    </Sheet>
  );
}
