export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'gps' | 'fallback' | 'manual';
  city?: string;
  country?: string;
  timestamp: Date;
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | 'UNKNOWN';
  message: string;
}

export interface UserProfile {
  country_code?: string;
  state_code?: string;
  city?: string;
  bk_centre_name?: string;
}

const GPS_TIMEOUT = 10000;
const GPS_MAX_AGE = 300000;

export async function requestHighAccuracyLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by this browser'
      } as LocationError);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: GPS_TIMEOUT,
      maximumAge: GPS_MAX_AGE
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'gps',
          timestamp: new Date(position.timestamp)
        });
      },
      (error) => {
        let errorCode: LocationError['code'];
        let errorMessage: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorCode = 'PERMISSION_DENIED';
            errorMessage = 'Location permission was denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorCode = 'POSITION_UNAVAILABLE';
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorCode = 'TIMEOUT';
            errorMessage = 'Location request timed out';
            break;
          default:
            errorCode = 'UNKNOWN';
            errorMessage = 'An unknown error occurred';
        }

        reject({
          code: errorCode,
          message: errorMessage
        } as LocationError);
      },
      options
    );
  });
}

export function getFallbackLocationFromProfile(profile: UserProfile): LocationData {
  const fallbackCoordinates: Record<string, { lat: number; lng: number; name: string }> = {
    'IN': { lat: 20.5937, lng: 78.9629, name: 'India' },
    'US': { lat: 37.0902, lng: -95.7129, name: 'United States' },
    'GB': { lat: 55.3781, lng: -3.4360, name: 'United Kingdom' },
    'CA': { lat: 56.1304, lng: -106.3468, name: 'Canada' },
    'AU': { lat: -25.2744, lng: 133.7751, name: 'Australia' },
  };

  const { country_code, bk_centre_name } = profile;

  if (country_code && fallbackCoordinates[country_code]) {
    const coords = fallbackCoordinates[country_code];
    return {
      latitude: coords.lat,
      longitude: coords.lng,
      source: 'fallback',
      city: bk_centre_name || coords.name,
      country: country_code,
      timestamp: new Date()
    };
  }

  return {
    latitude: 20.5937,
    longitude: 78.9629,
    source: 'fallback',
    city: bk_centre_name || 'India',
    country: 'IN',
    timestamp: new Date()
  };
}

export async function getLocationWithFallback(
  profile: UserProfile
): Promise<LocationData> {
  try {
    const gpsLocation = await requestHighAccuracyLocation();
    console.log('GPS location obtained:', gpsLocation);
    return gpsLocation;
  } catch (error) {
    console.warn('GPS failed, using fallback:', error);
    const fallbackLocation = getFallbackLocationFromProfile(profile);
    return fallbackLocation;
  }
}

export function formatLocationDisplay(location: LocationData): string {
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  }
  if (location.city) {
    return location.city;
  }
  return 'Unknown Location';
}

export function getLocationAccuracyDescription(accuracy?: number): string {
  if (!accuracy) return 'Approximate';
  if (accuracy < 50) return 'Very High';
  if (accuracy < 100) return 'High';
  if (accuracy < 500) return 'Medium';
  return 'Low';
}

export async function checkLocationPermissionStatus(): Promise<PermissionState> {
  if (!navigator.permissions) {
    return 'prompt';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return result.state;
  } catch (error) {
    console.warn('Could not query location permission:', error);
    return 'prompt';
  }
}

export function isLocationValid(lat?: number | null, lng?: number | null): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
