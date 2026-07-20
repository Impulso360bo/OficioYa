import { Button } from "@/components/ui/button";
import { Briefcase, SearchX } from "lucide-react";

interface EmptyStateProps {
  type?: "search" | "general";
  onReset?: () => void;
}

export function EmptyState({ type = "general", onReset }: EmptyStateProps) {
  const isSearch = type === "search";
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
      data-ocid="empty-state"
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        {isSearch ? (
          <SearchX className="h-9 w-9 text-muted-foreground" />
        ) : (
          <Briefcase className="h-9 w-9 text-muted-foreground" />
        )}
      </div>
      <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
        {isSearch ? "Sin resultados" : "No hay ofertas aún"}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground font-body leading-relaxed">
        {isSearch
          ? "No encontramos trabajos que coincidan con tu búsqueda. Intenta con otros términos o cambia los filtros."
          : "Todavía no hay empleos publicados en esta categoría. Vuelve pronto."}
      </p>
      {isSearch && onReset && (
        <Button
          variant="outline"
          onClick={onReset}
          data-ocid="empty-state-reset"
        >
          Limpiar búsqueda
        </Button>
      )}
    </div>
  );
}
