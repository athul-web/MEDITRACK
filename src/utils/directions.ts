import type { Hospital } from '../types/public';

/**
 * Google Maps directions link for a hospital.
 *
 * Coordinates are only used when they are exact. Approximate ones (a town or
 * district centre guessed from the address) would send people to the wrong
 * place, so the name + address is used instead.
 */
export function getDirectionsUrl(
  hospital: Pick<Hospital, 'name' | 'address' | 'city' | 'state' | 'coordinates' | 'coordinatesApproximate'>,
): string {
  const { coordinates } = hospital;

  if (coordinates && !hospital.coordinatesApproximate) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
  }

  const destination = [hospital.name, hospital.address, hospital.city, hospital.state].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
