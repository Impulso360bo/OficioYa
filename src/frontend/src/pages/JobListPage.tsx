import { EmptyState } from "@/components/EmptyState";
import { FilterSidebar, MobileFilterDrawer } from "@/components/FilterSidebar";
import { JobCard } from "@/components/JobCard";
import { JobCardSkeleton } from "@/components/LoadingSpinner";
import { NearbyWorkersModal } from "@/components/NearbyWorkersModal";
import { Button } from "@/components/ui/button";
import { useInitSampleData, useJobs } from "@/hooks/use-jobs";
import type { Category, SearchParams } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Briefcase, ChevronDown, Loader2, MapPin, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

const DEFAULT_FILTERS: SearchParams = {
  query: "",
  category: "Todas",
  location: "",
  isRemote: null,
};

export function JobListPage() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate();

  // Seed backend data on first load
  useInitSampleData();

  const [nearbyModalOpen, setNearbyModalOpen] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(
    (search as { loc?: string }).loc ?? null,
  );

  const [filters, setFilters] = useState<SearchParams>({
    ...DEFAULT_FILTERS,
    query: (search as { q?: string }).q ?? "",
    category:
      ((search as { cat?: string }).cat as Category | "Todas") ?? "Todas",
    location: (search as { loc?: string }).loc ?? "",
  });

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useJobs(filters);

  const handleFilterChange = useCallback(
    (partial: Partial<SearchParams>) => {
      setFilters((prev) => {
        const next = { ...prev, ...partial };
        navigate({
          to: "/",
          search: {
            q: next.query || undefined,
            cat: next.category !== "Todas" ? next.category : undefined,
            loc: next.location || undefined,
          },
        });
        return next;
      });
    },
    [navigate],
  );

  const handleCityDetected = useCallback(
    (cityLabel: string) => {
      setDetectedCity(cityLabel);
      handleFilterChange({ location: cityLabel });
    },
    [handleFilterChange],
  );

  const clearDetectedCity = useCallback(() => {
    setDetectedCity(null);
    handleFilterChange({ location: "" });
  }, [handleFilterChange]);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    navigate({
      to: "/",
      search: { q: undefined, cat: undefined, loc: undefined },
    });
  }, [navigate]);

  // Flatten all paginated results
  const jobs = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const total = data?.pages[0]?.total ? Number(data.pages[0].total) : 0;

  const hasActiveFilters =
    filters.query ||
    filters.category !== "Todas" ||
    filters.location ||
    filters.isRemote !== null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Hero banner */}
      <section
        className="mb-8 rounded-2xl overflow-hidden relative"
        aria-label="Bienvenida"
      >
        <img
          src="/assets/generated/hero-trades.dim_1200x480.jpg"
          alt="Trabajadores de oficios"
          className="w-full h-40 sm:h-52 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent flex flex-col justify-center px-8">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight"
          >
            Encuentra tu próximo
            <br />
            <span className="text-primary">trabajo de oficio</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-2 text-sm text-muted-foreground font-body max-w-xs"
          >
            Albañil, carpintero, pintor, electricista y más — todo en un solo
            lugar.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-4 flex items-center flex-wrap gap-2"
          >
            {detectedCity ? (
              <>
                {/* Uber Eats–style city pill */}
                <div
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1.5 text-sm font-semibold text-primary shadow-sm"
                  data-ocid="detected-city.pill"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{detectedCity}</span>
                  <button
                    type="button"
                    onClick={clearDetectedCity}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Cambiar ciudad"
                    data-ocid="detected-city.clear_button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setNearbyModalOpen(true)}
                  className="text-xs text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
                  data-ocid="detected-city.change_button"
                >
                  Cambiar ciudad
                </button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNearbyModalOpen(true)}
                className="gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary font-semibold shadow-sm"
                data-ocid="nearby-workers.open_modal_button"
              >
                <MapPin className="h-4 w-4" />
                Ver trabajadores cerca
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Results summary bar */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <MobileFilterDrawer
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />
          {!isLoading && (
            <p className="text-sm text-muted-foreground font-body min-w-0">
              <span className="font-semibold text-foreground">{total}</span>{" "}
              {total === 1 ? "oferta encontrada" : "ofertas encontradas"}
              {filters.category !== "Todas" && (
                <span className="text-primary ml-1">
                  · {CATEGORY_LABELS[filters.category]}
                </span>
              )}
              {filters.location && (
                <span className="text-muted-foreground ml-1">
                  · en {filters.location}
                </span>
              )}
              {filters.isRemote && (
                <span className="text-accent ml-1">· Remoto</span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body shrink-0">
          <Briefcase className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            Empleos en {filters.location || "Bolivia"}
          </span>
        </div>
      </div>

      {/* Layout: sidebar + grid */}
      <div className="flex gap-6 items-start">
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
        />

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <JobCardSkeleton key="sk-1" />
              <JobCardSkeleton key="sk-2" />
              <JobCardSkeleton key="sk-3" />
              <JobCardSkeleton key="sk-4" />
              <JobCardSkeleton key="sk-5" />
              <JobCardSkeleton key="sk-6" />
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              type={hasActiveFilters ? "search" : "general"}
              onReset={handleReset}
            />
          ) : (
            <>
              <motion.div
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.06 } },
                }}
                data-ocid="jobs-grid"
              >
                {jobs.map((job) => (
                  <motion.div
                    key={job.id.toString()}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Load more */}
              {(hasNextPage || isFetchingNextPage) && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-smooth hover:bg-muted disabled:opacity-60"
                    data-ocid="load-more-btn"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando…
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Cargar más ofertas
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <NearbyWorkersModal
        open={nearbyModalOpen}
        onClose={() => setNearbyModalOpen(false)}
        onCityDetected={handleCityDetected}
      />
    </div>
  );
}
