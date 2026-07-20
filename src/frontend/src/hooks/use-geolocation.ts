import { useCallback, useState } from "react";

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  coords: GeolocationCoords | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
}

export function useGeolocation(): GeolocationState {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Activa tu ubicación para ver trabajadores cercanos.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("No se pudo determinar tu ubicación. Intenta de nuevo.");
        } else {
          setError("Tiempo de espera agotado. Por favor intenta de nuevo.");
        }
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  return { coords, error, loading, requestLocation };
}
