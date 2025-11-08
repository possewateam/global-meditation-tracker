interface Profile {
  name?: string;
  countryCode?: string;
  stateCode?: string;
  city?: string;
}

interface GeoResult {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

export async function getGeoOrFallback(profile: Profile): Promise<GeoResult> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Geolocation timeout')), 8000)
  );

  try {
    const coords = await Promise.race([
      timeout,
      new Promise<GeolocationCoordinates>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          (error) => reject(error),
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 300000
          }
        );
      })
    ]);

    console.log('Geolocation success:', coords.latitude, coords.longitude);
    return {
      lat: coords.latitude,
      lng: coords.longitude,
      city: '',
      country: ''
    };
  } catch (error) {
    console.warn('Geolocation failed, fallback not available for this user');

    return {
      lat: 20.5937,
      lng: 78.9629,
      city: profile?.city || 'India',
      country: profile?.countryCode || 'IN'
    };
  }
}
