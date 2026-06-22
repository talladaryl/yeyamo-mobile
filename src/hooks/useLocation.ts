import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationResult {
  lat: number;
  lng: number;
  city: string | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied.');
        return null;
      }

      const coords = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get city name
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
      });

      const result: LocationResult = {
        lat: coords.coords.latitude,
        lng: coords.coords.longitude,
        city: geocode?.city ?? geocode?.subregion ?? null,
      };

      setLocation(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not get location.';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { location, isLoading, error, requestLocation };
}
