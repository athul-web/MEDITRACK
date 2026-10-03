/**
 * Minimal OSRM client used to get real road distance / drive time.
 *
 * Uses the Table service (one origin -> many destinations in a single HTTP
 * request) instead of one Route call per hospital.
 *
 * NOTE: OSRM expects coordinates as "longitude,latitude" (x,y), the reverse of
 * the {latitude, longitude} objects used in the rest of the app. All of that
 * swapping is confined to this file.
 *
 * The default base URL is the public OSRM demo server. It is fine for
 * development and low traffic, but it is rate limited, car-only and has no
 * uptime guarantee. For production point VITE_OSRM_BASE_URL at your own OSRM
 * instance (or a hosted provider that exposes the same HTTP API).
 */

import { fetchJson } from './http';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RoadRoute {
  distanceKm: number;
  durationMin: number;
}

export class OsrmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OsrmError';
  }
}

const DEFAULT_OSRM_BASE_URL = 'https://router.project-osrm.org';

const configuredUrl = import.meta.env.VITE_OSRM_BASE_URL?.trim();
const OSRM_BASE_URL = (configuredUrl || DEFAULT_OSRM_BASE_URL).replace(/\/+$/, '');

// Warn if using the default public OSRM server (rate limited)
if (!configuredUrl && typeof window !== 'undefined') {
  console.warn(
    'Using default public OSRM server (https://router.project-osrm.org). ' +
    'This server is heavily rate-limited and not suitable for production. ' +
    'Set VITE_OSRM_BASE_URL to your own OSRM instance for reliable road distances.'
  );
}

/** The public demo server rejects tables above 100 coordinates (origin included). */
const MAX_DESTINATIONS_PER_REQUEST = 80;
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_LIMIT = 1000;

const routeCache = new Map<string, RoadRoute | null>();

function cacheKey(origin: LatLng, destination: LatLng): string {
  // ~11 m precision on the origin so GPS jitter doesn't defeat the cache.
  return `${origin.latitude.toFixed(4)},${origin.longitude.toFixed(4)}>${destination.latitude.toFixed(5)},${destination.longitude.toFixed(5)}`;
}

function toOsrmCoordinate(point: LatLng): string {
  return `${point.longitude},${point.latitude}`;
}

async function fetchTableChunk(
  origin: LatLng,
  destinations: LatLng[],
  signal?: AbortSignal,
): Promise<(RoadRoute | null)[]> {
  const coordinates = [origin, ...destinations].map(toOsrmCoordinate).join(';');
  const destinationIndexes = destinations.map((_, i) => i + 1).join(';');
  const url =
    `${OSRM_BASE_URL}/table/v1/driving/${coordinates}` +
    `?sources=0&destinations=${destinationIndexes}&annotations=distance,duration`;

  const data = await fetchJson(url, {
    signal,
    timeoutMs: REQUEST_TIMEOUT_MS,
    makeError: message => new OsrmError(`OSRM request failed: ${message}`),
  });

  if (data?.code !== 'Ok' || !Array.isArray(data.distances?.[0]) || !Array.isArray(data.durations?.[0])) {
    throw new OsrmError(`OSRM table request failed: ${data?.code ?? 'invalid response'}${data?.message ? ` (${data.message})` : ''}`);
  }

  const distancesM: (number | null)[] = data.distances[0];
  const durationsS: (number | null)[] = data.durations[0];

  // OSRM snaps every input point to the nearest road. If the point is far from
  // any road (e.g. a GPS fix in a paddy field) the snap gap isn't part of the
  // route distance, so add it back to avoid under-reporting.
  const sourceSnapM: number = data.sources?.[0]?.distance ?? 0;

  return destinations.map((_, i) => {
    const distanceM = distancesM[i];
    const durationS = durationsS[i];
    if (distanceM == null || durationS == null) return null; // no drivable route

    const destinationSnapM: number = data.destinations?.[i]?.distance ?? 0;
    return {
      distanceKm: (distanceM + sourceSnapM + destinationSnapM) / 1000,
      durationMin: durationS / 60,
    };
  });
}

/**
 * Road distance and drive time from one origin to many destinations.
 *
 * Returns an array aligned with `destinations`; an entry is null when OSRM
 * found no drivable route. Throws OsrmError if the service can't be reached,
 * and rethrows the AbortError if `signal` is aborted.
 */
export async function getRoadRoutes(
  origin: LatLng,
  destinations: LatLng[],
  signal?: AbortSignal,
): Promise<(RoadRoute | null)[]> {
  const results: (RoadRoute | null | undefined)[] = destinations.map(d => {
    const key = cacheKey(origin, d);
    return routeCache.has(key) ? routeCache.get(key) : undefined;
  });

  const missing = results
    .map((value, index) => (value === undefined ? index : -1))
    .filter(index => index !== -1);

  for (let start = 0; start < missing.length; start += MAX_DESTINATIONS_PER_REQUEST) {
    const indexes = missing.slice(start, start + MAX_DESTINATIONS_PER_REQUEST);
    const chunk = await fetchTableChunk(origin, indexes.map(i => destinations[i]), signal);

    if (routeCache.size + chunk.length > CACHE_LIMIT) routeCache.clear();

    indexes.forEach((destinationIndex, i) => {
      results[destinationIndex] = chunk[i];
      routeCache.set(cacheKey(origin, destinations[destinationIndex]), chunk[i]);
    });
  }

  return results.map(value => value ?? null);
}

/** Test helper. */
export function clearOsrmCache(): void {
  routeCache.clear();
}
