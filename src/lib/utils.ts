import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const geocodeCache = new Map<string, { lat: number; lng: number }>();

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null;

  if (geocodeCache.has(address)) {
    return geocodeCache.get(address)!;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      geocodeCache.set(address, location);
      return location;
    } else {
      console.warn(`Geocoding failed for address: "${address}", status: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
