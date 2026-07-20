import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useJobs } from "@/hooks/use-jobs";
import { CATEGORY_LABELS } from "@/types";
import type { Category } from "@/types";
import { CITY_COORDINATES, haversineDistance } from "@/utils/city-coordinates";
import { MapPin, Navigation, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ─── SVG Map constants ────────────────────────────────────────────────────────
// Bolivia bounding box (approx): lng -69.6 to -57.5, lat -22.9 to -9.7
// SVG viewport: 320 x 360
const SVG_W = 320;
const SVG_H = 360;
const LNG_MIN = -69.8;
const LNG_MAX = -57.3;
const LAT_MIN = -23.1;
const LAT_MAX = -9.5;

function toSvg(lat: number, lng: number): [number, number] {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * SVG_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * SVG_H;
  return [x, y];
}

// Simplified Bolivia outline polygon
const BOLIVIA_PATH =
  "M 60,12 L 95,8 L 138,4 L 172,2 L 200,10 L 218,22 L 232,40 L 240,58 L 248,80 L 252,108 L 258,130 L 260,152 L 256,172 L 248,188 L 238,200 L 230,215 L 224,232 L 218,248 L 205,260 L 192,270 L 178,278 L 162,284 L 148,288 L 132,285 L 118,280 L 104,270 L 92,258 L 80,246 L 70,234 L 58,222 L 48,208 L 36,194 L 28,180 L 20,165 L 16,148 L 14,130 L 18,112 L 24,94 L 32,76 L 40,58 L 48,40 Z";

// Pre-compute city SVG positions
const CITY_SVG: Record<string, { x: number; y: number }> = Object.fromEntries(
  Object.entries(CITY_COORDINATES).map(([name, { lat, lng }]) => {
    const [x, y] = toSvg(lat, lng);
    return [name, { x, y }];
  }),
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface CityGroup {
  cityLabel: string;
  distanceKm: number | null;
  workers: Array<{
    id: string;
    name: string;
    category: string;
    location: string;
  }>;
}

interface NearbyWorkersModalProps {
  open: boolean;
  onClose: () => void;
  /** Called once after geolocation succeeds with the nearest Bolivian city label */
  onCityDetected?: (cityLabel: string) => void;
}

// ─── SVG Bolivia Map component ────────────────────────────────────────────────────
function BoliviaMap({
  cityGroups,
  nearestCity,
  hasLocation,
}: {
  cityGroups: CityGroup[];
  nearestCity: string | null;
  hasLocation: boolean;
}) {
  const workerCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of cityGroups) map[g.cityLabel] = g.workers.length;
    return map;
  }, [cityGroups]);

  return (
    <div className="relative w-full flex items-center justify-center bg-gradient-to-b from-secondary/10 to-muted/20 py-4">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full max-w-xs sm:max-w-sm drop-shadow-md"
        aria-label="Mapa de Bolivia con trabajadores"
        role="img"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
          <radialGradient id="map-fill" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="oklch(0.94 0.03 165)" />
            <stop offset="100%" stopColor="oklch(0.88 0.04 165)" />
          </radialGradient>
        </defs>

        {/* Bolivia shape */}
        <path
          d={BOLIVIA_PATH}
          fill="url(#map-fill)"
          stroke="oklch(0.55 0.18 165)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          filter="url(#soft-shadow)"
        />

        {/* Subtle grid lines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={`h${t}`}
            x1="0"
            y1={SVG_H * t}
            x2={SVG_W}
            y2={SVG_H * t}
            stroke="oklch(0.55 0.18 165)"
            strokeWidth="0.3"
            strokeDasharray="4 6"
            opacity="0.3"
          />
        ))}

        {/* City markers */}
        {Object.entries(CITY_SVG).map(([city, { x, y }]) => {
          const count = workerCount[city] ?? 0;
          const isNearest = hasLocation && city === nearestCity;
          const r = isNearest ? 10 : count > 0 ? 7 : 5;
          const dotColor = isNearest
            ? "oklch(0.62 0.22 48)"
            : count > 0
              ? "oklch(0.55 0.18 165)"
              : "oklch(0.75 0.04 260)";
          const textColor = isNearest
            ? "oklch(0.62 0.22 48)"
            : "oklch(0.25 0.02 260)";

          return (
            <g key={city}>
              {isNearest && (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={r + 8}
                    fill="none"
                    stroke="oklch(0.62 0.22 48)"
                    strokeWidth="1.5"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="r"
                      values={`${r + 4};${r + 14};${r + 4}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.5;0;0.5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={x}
                    cy={y}
                    r={r + 3}
                    fill="oklch(0.62 0.22 48)"
                    opacity="0.2"
                    filter="url(#glow)"
                  />
                </>
              )}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={dotColor}
                opacity={count > 0 ? 1 : 0.5}
                filter={isNearest ? "url(#glow)" : undefined}
              />
              <circle
                cx={x - r * 0.3}
                cy={y - r * 0.3}
                r={r * 0.3}
                fill="white"
                opacity="0.45"
              />
              {count > 0 && (
                <>
                  <circle
                    cx={x + r}
                    cy={y - r}
                    r={6}
                    fill="oklch(0.98 0 0)"
                    stroke={dotColor}
                    strokeWidth="1"
                  />
                  <text
                    x={x + r}
                    y={y - r + 4}
                    textAnchor="middle"
                    fontSize="6"
                    fontWeight="700"
                    fill={dotColor}
                  >
                    {count}
                  </text>
                </>
              )}
              <text
                x={x}
                y={y + r + 9}
                textAnchor="middle"
                fontSize={isNearest ? 8 : 7}
                fontWeight={isNearest ? "700" : "500"}
                fill={textColor}
              >
                {city}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ background: "oklch(0.62 0.22 48)" }}
          />
          <span className="text-[10px] text-muted-foreground">Tu ciudad</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ background: "oklch(0.55 0.18 165)" }}
          />
          <span className="text-[10px] text-muted-foreground">Con ofertas</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export function NearbyWorkersModal({
  open,
  onClose,
  onCityDetected,
}: NearbyWorkersModalProps) {
  const { coords, error, loading, requestLocation } = useGeolocation();
  const [cityNotified, setCityNotified] = useState<string | null>(null);

  const { data, isLoading: jobsLoading } = useJobs({});
  const jobs = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  // Auto-request location when modal opens
  useEffect(() => {
    if (open && !coords && !error && !loading) {
      requestLocation();
    }
  }, [open, coords, error, loading, requestLocation]);

  // Find nearest city
  const nearestCity = useMemo(() => {
    if (!coords) return null;
    let nearest: string | null = null;
    let minDist = Number.POSITIVE_INFINITY;
    for (const [cityLabel, cityCoords] of Object.entries(CITY_COORDINATES)) {
      const d = haversineDistance(
        coords.latitude,
        coords.longitude,
        cityCoords.lat,
        cityCoords.lng,
      );
      if (d < minDist) {
        minDist = d;
        nearest = cityLabel;
      }
    }
    return nearest;
  }, [coords]);

  // Notify parent once
  useEffect(() => {
    if (!nearestCity || !onCityDetected) return;
    if (nearestCity !== cityNotified) {
      setCityNotified(nearestCity);
      onCityDetected(nearestCity);
    }
  }, [nearestCity, onCityDetected, cityNotified]);

  // Group + sort cities by distance
  const cityGroups = useMemo((): CityGroup[] => {
    const grouped = new Map<string, CityGroup["workers"]>();
    for (const job of jobs) {
      const city = job.location;
      if (!grouped.has(city)) grouped.set(city, []);
      grouped.get(city)!.push({
        id: job.id.toString(),
        name: job.title,
        category: job.category,
        location: city,
      });
    }
    const groups: CityGroup[] = [];
    for (const [cityLabel, workers] of grouped.entries()) {
      let distanceKm: number | null = null;
      if (coords) {
        const cc = CITY_COORDINATES[cityLabel];
        if (cc)
          distanceKm = Math.round(
            haversineDistance(
              coords.latitude,
              coords.longitude,
              cc.lat,
              cc.lng,
            ),
          );
      }
      groups.push({ cityLabel, distanceKm, workers });
    }
    groups.sort((a, b) =>
      a.distanceKm !== null && b.distanceKm !== null
        ? a.distanceKm - b.distanceKm
        : a.cityLabel.localeCompare(b.cityLabel, "es"),
    );
    return groups;
  }, [jobs, coords]);

  const isGettingLocation = loading;
  const hasLocation = !!coords;
  const locationDenied = !!error;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-xl w-full max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl"
        data-ocid="nearby-workers.dialog"
      >
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0 bg-card">
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            Trabajadores cerca de ti
          </DialogTitle>

          {isGettingLocation && (
            <div
              className="mt-2 flex items-center gap-2.5 rounded-full bg-muted/60 border border-border px-3.5 py-1.5 text-xs text-muted-foreground w-fit"
              data-ocid="nearby-workers.loading_state"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              Detectando tu ubicación…
            </div>
          )}

          {locationDenied && (
            <div
              className="mt-2 flex items-center gap-2.5 rounded-full bg-destructive/10 border border-destructive/20 px-3.5 py-1.5 text-xs text-destructive w-fit"
              data-ocid="nearby-workers.error_state"
            >
              <Navigation className="h-3 w-3 shrink-0" />
              Ubicación no disponible
            </div>
          )}

          {hasLocation && nearestCity && (
            <div
              className="mt-2 flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs text-primary w-fit font-semibold"
              data-ocid="nearby-workers.success_state"
            >
              <span>📍</span>
              <span>Tu ciudad más cercana: {nearestCity}</span>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* SVG Map */}
          <BoliviaMap
            cityGroups={cityGroups}
            nearestCity={nearestCity}
            hasLocation={hasLocation}
          />

          {/* Location error detail */}
          {locationDenied && (
            <div className="mx-4 mt-3 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm">
              <p className="font-semibold text-destructive mb-1">
                Activa tu ubicación
              </p>
              <p className="text-muted-foreground text-xs mb-2">
                {error} — También puedes seleccionar una ciudad manualmente.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={requestLocation}
                data-ocid="nearby-workers.retry_location_button"
              >
                Intentar de nuevo
              </Button>
            </div>
          )}

          {/* City list */}
          <div className="px-4 pb-5 pt-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {hasLocation
                ? "Ciudades ordenadas por distancia"
                : "Todas las ciudades"}
            </p>

            {jobsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : cityGroups.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 py-8 text-center"
                data-ocid="nearby-workers.empty_state"
              >
                <Users className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No hay trabajadores disponibles en este momento.
                </p>
              </div>
            ) : (
              <ul className="space-y-2" aria-label="Ciudades con trabajadores">
                {cityGroups.map((group, idx) => {
                  const isNearest =
                    hasLocation && group.cityLabel === nearestCity;
                  return (
                    <li
                      key={group.cityLabel}
                      data-ocid={`nearby-workers.city.${idx + 1}`}
                      className={[
                        "rounded-xl border transition-smooth overflow-hidden",
                        isNearest
                          ? "border-primary/40 bg-primary/5 shadow-sm"
                          : "border-border bg-card",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div
                          className={[
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                            isNearest ? "bg-primary/15" : "bg-muted/50",
                          ].join(" ")}
                        >
                          <MapPin
                            className={[
                              "h-4 w-4",
                              isNearest
                                ? "text-primary"
                                : "text-muted-foreground",
                            ].join(" ")}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={[
                                "font-semibold text-sm truncate",
                                isNearest ? "text-primary" : "text-foreground",
                              ].join(" ")}
                            >
                              {group.cityLabel}
                            </span>
                            {isNearest && (
                              <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                                MÁS CERCA
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {group.workers.length}{" "}
                              {group.workers.length === 1
                                ? "trabajador"
                                : "trabajadores"}
                            </span>
                            {group.distanceKm !== null && (
                              <span className="text-xs font-medium text-primary">
                                · {group.distanceKm} km
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="hidden sm:flex flex-col gap-1 items-end shrink-0">
                          {group.workers.slice(0, 2).map((w) => (
                            <Badge
                              key={w.id}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {CATEGORY_LABELS[
                                w.category as Category | "Todas"
                              ] ?? w.category}
                            </Badge>
                          ))}
                          {group.workers.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{group.workers.length - 2} más
                            </span>
                          )}
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant={isNearest ? "default" : "outline"}
                          className="shrink-0 text-xs h-8 px-3"
                          onClick={() => {
                            if (onCityDetected) onCityDetected(group.cityLabel);
                            onClose();
                          }}
                          data-ocid={`nearby-workers.select_city.${idx + 1}`}
                        >
                          Ver
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
