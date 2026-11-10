import { LocationData, CalculationMethodKey } from '../types';

export interface CityPreset extends LocationData {
  preferredMethod: CalculationMethodKey;
}

export const WORLD_CITIES: CityPreset[] = [
  {
    city: 'Mecca (Makkah)',
    country: 'Saudi Arabia',
    latitude: 21.4225,
    longitude: 39.8262,
    timezone: 'Asia/Riyadh',
    isManual: true,
    preferredMethod: 'UmmAlQura',
  },
  {
    city: 'Medina (Madinah)',
    country: 'Saudi Arabia',
    latitude: 24.4672,
    longitude: 39.6112,
    timezone: 'Asia/Riyadh',
    isManual: true,
    preferredMethod: 'UmmAlQura',
  },
  {
    city: 'Jerusalem (Al-Quds)',
    country: 'Palestine',
    latitude: 31.7683,
    longitude: 35.2137,
    timezone: 'Asia/Jerusalem',
    isManual: true,
    preferredMethod: 'MuslimWorldLeague',
  },
  {
    city: 'Hyderabad',
    country: 'India',
    latitude: 17.3850,
    longitude: 78.4867,
    timezone: 'Asia/Kolkata',
    isManual: true,
    preferredMethod: 'Karachi',
  },
  {
    city: 'New Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    isManual: true,
    preferredMethod: 'Karachi',
  },
  {
    city: 'Mumbai',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
    isManual: true,
    preferredMethod: 'Karachi',
  },
  {
    city: 'Bengaluru',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 'Asia/Kolkata',
    isManual: true,
    preferredMethod: 'Karachi',
  },
  {
    city: 'Cairo',
    country: 'Egypt',
    latitude: 30.0444,
    longitude: 31.2357,
    timezone: 'Africa/Cairo',
    isManual: true,
    preferredMethod: 'Egyptian',
  },
  {
    city: 'Istanbul',
    country: 'Turkey',
    latitude: 41.0082,
    longitude: 28.9784,
    timezone: 'Europe/Istanbul',
    isManual: true,
    preferredMethod: 'MuslimWorldLeague',
  },
  {
    city: 'Dubai',
    country: 'United Arab Emirates',
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 'Asia/Dubai',
    isManual: true,
    preferredMethod: 'Dubai',
  },
  {
    city: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    isManual: true,
    preferredMethod: 'MuslimWorldLeague',
  },
  {
    city: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    isManual: true,
    preferredMethod: 'NorthAmerica',
  },
  {
    city: 'Toronto',
    country: 'Canada',
    latitude: 43.6532,
    longitude: -79.3832,
    timezone: 'America/Toronto',
    isManual: true,
    preferredMethod: 'NorthAmerica',
  },
  {
    city: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris',
    isManual: true,
    preferredMethod: 'MuslimWorldLeague',
  },
  {
    city: 'Berlin',
    country: 'Germany',
    latitude: 52.52,
    longitude: 13.405,
    timezone: 'Europe/Berlin',
    isManual: true,
    preferredMethod: 'MuslimWorldLeague',
  },
  {
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    latitude: 3.139,
    longitude: 101.6869,
    timezone: 'Asia/Kuala_Lumpur',
    isManual: true,
    preferredMethod: 'MuslimWorldLeague',
  },
  {
    city: 'Jakarta',
    country: 'Indonesia',
    latitude: -6.2088,
    longitude: 106.8456,
    timezone: 'Asia/Jakarta',
    isManual: true,
    preferredMethod: 'Singapore',
  },
  {
    city: 'Karachi',
    country: 'Pakistan',
    latitude: 24.8607,
    longitude: 67.0011,
    timezone: 'Asia/Karachi',
    isManual: true,
    preferredMethod: 'Karachi',
  },
  {
    city: 'Lahore',
    country: 'Pakistan',
    latitude: 31.5204,
    longitude: 74.3587,
    timezone: 'Asia/Karachi',
    isManual: true,
    preferredMethod: 'Karachi',
  },
  {
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: 23.8103,
    longitude: 90.4125,
    timezone: 'Asia/Dhaka',
    isManual: true,
    preferredMethod: 'Karachi',
  },
  {
    city: 'Riyadh',
    country: 'Saudi Arabia',
    latitude: 24.7136,
    longitude: 46.6753,
    timezone: 'Asia/Riyadh',
    isManual: true,
    preferredMethod: 'UmmAlQura',
  },
  {
    city: 'Doha',
    country: 'Qatar',
    latitude: 25.2854,
    longitude: 51.531,
    timezone: 'Asia/Qatar',
    isManual: true,
    preferredMethod: 'Qatar',
  },
  {
    city: 'Casablanca',
    country: 'Morocco',
    latitude: 33.5731,
    longitude: -7.5898,
    timezone: 'Africa/Casablanca',
    isManual: true,
    preferredMethod: 'MuslimWorldLeague',
  },
  {
    city: 'Sydney',
    country: 'Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
    isManual: true,
    preferredMethod: 'MuslimWorldLeague',
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
    isManual: true,
    preferredMethod: 'MuslimWorldLeague',
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: 'Asia/Singapore',
    isManual: true,
    preferredMethod: 'Singapore',
  },
  {
    city: 'Johannesburg',
    country: 'South Africa',
    latitude: -26.2041,
    longitude: 28.0473,
    timezone: 'Africa/Johannesburg',
    isManual: true,
    preferredMethod: 'MuslimWorldLeague',
  },
  {
    city: 'Chicago',
    country: 'United States',
    latitude: 41.8781,
    longitude: -87.6298,
    timezone: 'America/Chicago',
    isManual: true,
    preferredMethod: 'NorthAmerica',
  },
  {
    city: 'Los Angeles',
    country: 'United States',
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: 'America/Los_Angeles',
    isManual: true,
    preferredMethod: 'NorthAmerica',
  },
];

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestPresetCity(
  latitude: number,
  longitude: number
): { city: CityPreset; distanceKm: number } {
  let closest = WORLD_CITIES[0];
  let minDistance = calculateDistanceKm(
    latitude,
    longitude,
    closest.latitude,
    closest.longitude
  );

  for (let i = 1; i < WORLD_CITIES.length; i++) {
    const candidate = WORLD_CITIES[i];
    const dist = calculateDistanceKm(
      latitude,
      longitude,
      candidate.latitude,
      candidate.longitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = candidate;
    }
  }

  return { city: closest, distanceKm: minDistance };
}
