/**
 * Approximate center coordinates for Bolivia's major cities.
 * Used for Haversine distance calculations when workers only have a city label.
 */
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "La Paz": { lat: -16.5, lng: -68.15 },
  Cochabamba: { lat: -17.39, lng: -66.16 },
  "Santa Cruz": { lat: -17.78, lng: -63.18 },
  Sucre: { lat: -19.04, lng: -65.26 },
  Oruro: { lat: -17.98, lng: -67.11 },
  Potosí: { lat: -19.57, lng: -65.75 },
  Tarija: { lat: -21.54, lng: -64.73 },
  Beni: { lat: -14.83, lng: -64.9 },
  Pando: { lat: -11.02, lng: -68.74 },
  "El Alto": { lat: -16.5, lng: -68.19 },
};

const R = 6371; // Earth radius in km

/**
 * Haversine formula — returns distance in kilometres between two lat/lng points.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
