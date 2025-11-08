export interface AddressComponents {
  country?: string;
  country_code?: string;
  state?: string;
  state_code?: string;
  district?: string;
  city_town?: string;
}

export interface GeocodingResult extends AddressComponents {
  formatted_address?: string;
  success: boolean;
  error?: string;
}

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/reverse';

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult> {
  try {
    const response = await fetch(
      `${NOMINATIM_API_URL}?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
      {
        headers: {
          'User-Agent': 'PowerOfSakash-MeditationApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (import.meta.env.DEV) {
      console.log('[Geocoding] Full API response:', data);
      console.log('[Geocoding] Address object:', data.address);
    }

    if (!data.address) {
      return {
        success: false,
        error: 'No address data found for these coordinates'
      };
    }

    const address = data.address;

    const city_town =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.suburb ||
      address.locality ||
      address.hamlet ||
      address.neighbourhood ||
      address.city_district ||
      address.county ||
      address.state_district ||
      address.district;

    const district = address.county || address.state_district || address.district;

    const result: GeocodingResult = {
      success: true,
      formatted_address: data.display_name,
      country: address.country,
      country_code: address.country_code?.toUpperCase(),
      state: address.state || address.province || address.region,
      state_code: address.state_code || address['ISO3166-2-lvl4']?.split('-')[1],
      district: district,
      city_town: city_town || district
    };

    if (import.meta.env.DEV) {
      console.log('[Geocoding] Full address object keys:', Object.keys(address));
      console.log('[Geocoding] Extracted components:', result);
      console.log('[Geocoding] City/Town found:', city_town);
      if (!city_town && district) {
        console.log('[Geocoding] Using district as city fallback:', district);
      }
    }

    return result;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to geocode location'
    };
  }
}

export function formatAddress(components: AddressComponents): string {
  const parts: string[] = [];

  if (components.city_town) parts.push(components.city_town);
  if (components.district && components.district !== components.city_town) {
    parts.push(components.district);
  }
  if (components.state) parts.push(components.state);
  if (components.country) parts.push(components.country);

  return parts.filter(Boolean).join(', ');
}

export function validateAddressComponents(components: AddressComponents): {
  isValid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  if (!components.country) missingFields.push('country');
  if (!components.country_code) missingFields.push('country_code');

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}
