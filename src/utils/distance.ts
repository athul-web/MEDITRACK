/**
 * Distance utilities.
 *
 * Road distance and drive time come from OSRM (see ./osrm.ts). Straight-line
 * (haversine) distance is only used to
 *   1. shortlist which hospitals are worth sending to OSRM, and
 *   2. provide a clearly-flagged estimate when OSRM is unreachable or a
 *      hospital only has approximate coordinates.
 */

import type { Hospital } from '../types/public';
import { getRoadRoutes, type RoadRoute } from './osrm';

export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

export { resolveKeralaCoordinates, KERALA_DISTRICT_COORDINATES, KERALA_TOWN_COORDINATES } from './keralaCoordinates';

/** Roads are never straight; ~1.3x is a reasonable detour factor for Kerala. */
export const ROAD_DETOUR_FACTOR = 1.3;

/** Max hospitals sent to OSRM per search (nearest by straight line). Increased from 60 to 100. */
const MAX_ROAD_CANDIDATES = 100;

/** Number of retry attempts for OSRM requests. */
const OSRM_MAX_RETRIES = 2;

/** Delay between OSRM retries in ms. */
const OSRM_RETRY_DELAY_MS = 500;

export function isValidCoordinate(latitude: unknown, longitude: unknown): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
}

/**
 * Straight-line (great-circle) distance in kilometers using the Haversine formula.
 * Returns null for invalid input.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number | null {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return null;
  }

  const R = 6371; // Earth's radius in km
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;

  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number.isFinite(distance) ? distance : null;
}

export interface DistanceOrigin extends UserCoordinates {
  /**
   * True when the origin is a lookup (e.g. a district centre) rather than the
   * user's real position. Road routing from a made-up point would be falsely
   * precise, so only an estimate is produced.
   */
  approximate?: boolean;
}

const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/**
 * Returns copies of `hospitals` with distanceKm / durationMin / distanceSource set.
 *
 * - 'road'     -> real driving distance and time from OSRM
 * - 'estimate' -> straight-line distance x ROAD_DETOUR_FACTOR (no duration)
 *
 * Never throws because OSRM is down: it falls back to estimates. It only
 * rethrows if `signal` was aborted by the caller.
 */
export async function attachDistances(
  hospitals: Hospital[],
  origin: DistanceOrigin,
  signal?: AbortSignal,
): Promise<Hospital[]> {
  if (!isValidCoordinate(origin.latitude, origin.longitude)) {
    return hospitals.map(h => ({ ...h, distanceKm: undefined, durationMin: undefined, distanceSource: undefined }));
  }

  // Pass 1: straight-line estimate for everything that has coordinates.
  const enriched: Hospital[] = hospitals.map(h => {
    const c = h.coordinates;
    const straightKm = c ? calculateDistanceKm(origin.latitude, origin.longitude, c.latitude, c.longitude) : null;

    return {
      ...h,
      distanceKm: straightKm != null ? round(straightKm * ROAD_DETOUR_FACTOR, 2) : undefined,
      durationMin: undefined,
      distanceSource: straightKm != null ? 'estimate' : undefined,
    };
  });

  if (origin.approximate) return enriched;

  // Pass 2: upgrade the nearest hospitals with exact coordinates to OSRM road data.
  const candidates = enriched
    .map((h, index) => ({ h, index }))
    .filter(({ h }) => h.distanceKm != null && !h.coordinatesApproximate)
    .sort((a, b) => a.h.distanceKm! - b.h.distanceKm!)
    .slice(0, MAX_ROAD_CANDIDATES);

  if (candidates.length === 0) return enriched;

  // Retry logic for OSRM requests
  let routes: (RoadRoute | null)[] | null = null;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= OSRM_MAX_RETRIES; attempt++) {
    try {
      routes = await getRoadRoutes(
        origin,
        candidates.map(({ h }) => h.coordinates!),
        signal,
      );
      break; // Success
    } catch (err) {
      lastError = err as Error;
      if (signal?.aborted) throw err;
      if (attempt < OSRM_MAX_RETRIES) {
        console.warn(`OSRM request failed (attempt ${attempt + 1}/${OSRM_MAX_RETRIES + 1}), retrying...`, err);
        await new Promise(resolve => setTimeout(resolve, OSRM_RETRY_DELAY_MS));
      }
    }
  }

  if (routes) {
    candidates.forEach(({ index }, i) => {
      const route = routes[i];
      if (route) {
        enriched[index] = {
          ...enriched[index],
          distanceKm: round(route.distanceKm, 2),
          durationMin: Math.max(1, Math.round(route.durationMin)),
          distanceSource: 'road',
        };
      }
    });
  } else if (lastError) {
    console.warn('OSRM unavailable after retries, showing estimated distances instead:', lastError);
  }

  return enriched;
}
