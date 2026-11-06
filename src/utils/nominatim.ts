/**
 * OpenStreetMap Nominatim geocoder: turns a place the user typed ("Aluva",
 * "Kakkanad", "Medical College Kozhikode") into coordinates.
 *
 * This follows the Nominatim usage policy (https://operations.osmfoundation.org/policies/nominatim/):
 *  - at most 1 request per second          -> requests are queued and spaced out
 *  - no autocomplete / search-as-you-type  -> a debounce that an abort cancels
 *  - cache results                         -> memory + localStorage
 *  - identify the application              -> browsers send a Referer automatically;
 *                                             set VITE_NOMINATIM_EMAIL as a contact address
 * The public server is for light use only. For production traffic run your own
 * Nominatim or use a hosted provider, and set VITE_NOMINATIM_BASE_URL.
 *
 * Results are restricted to Kerala so "Pala" means Pala, Kerala.
 */

import { fetchJson, sleep, createAbortError } from './http';

export interface GeocodedPlace {
  latitude: number;
  longitude: number;
  displayName: string;
  /**
   * False when the match is a whole district/state (OSM gives its centre),
   * which is too coarse to measure a road route from.
   */
  precise: boolean;
}

export class NominatimError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NominatimError';
  }
}

const BASE_URL = (import.meta.env.VITE_NOMINATIM_BASE_URL?.trim() || 'https://nominatim.openstreetmap.org').replace(/\/+$/, '');
const CONTACT_EMAIL = import.meta.env.VITE_NOMINATIM_EMAIL?.trim();

/** Kerala bounding box (lon/lat). Used to bias and limit results. */
const KERALA_BBOX = { west: 74.85, north: 12.8, east: 77.45, south: 8.15 };

const DEBOUNCE_MS = 700;
const MIN_REQUEST_INTERVAL_MS = 1100;
const REQUEST_TIMEOUT_MS = 6000;
const HIT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MISS_TTL_MS = 60 * 60 * 1000;
const STORAGE_PREFIX = 'nominatim:v1:';

/** OSM address types that mean "a whole region" rather than a place you can route from. */
const COARSE_TYPES = new Set(['state', 'state_district', 'region', 'county', 'province', 'country']);

type CacheEntry = { expires: number; value: GeocodedPlace | null };
const memoryCache = new Map<string, CacheEntry>();

const normalize = (query: string) => query.trim().toLowerCase().replace(/\s+/g, ' ');

function readCache(key: string): CacheEntry | undefined {
  const now = Date.now();
  const inMemory = memoryCache.get(key);
  if (inMemory && inMemory.expires > now) return inMemory;

  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_PREFIX + key) : null;
    if (raw) {
      const entry = JSON.parse(raw) as CacheEntry;
      if (entry.expires > now) {
        memoryCache.set(key, entry);
        return entry;
      }
      localStorage.removeItem(STORAGE_PREFIX + key);
    }
  } catch {
    // Storage unavailable or corrupt: behave as a cache miss.
  }
  return undefined;
}

function writeCache(key: string, value: GeocodedPlace | null): void {
  const entry: CacheEntry = { expires: Date.now() + (value ? HIT_TTL_MS : MISS_TTL_MS), value };
  memoryCache.set(key, entry);
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota or privacy mode: the in-memory cache still works.
  }
}

// ---- 1 request / second queue -------------------------------------------------

let lastRequestAt = 0;
let queue: Promise<unknown> = Promise.resolve();

function throttled<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  const run = queue.then(async () => {
    if (signal?.aborted) throw createAbortError();
    const wait = lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait, signal);
    lastRequestAt = Date.now();
    return task();
  });
  queue = run.catch(() => undefined); // one failure must not block later requests
  return run;
}

// ---- public API ---------------------------------------------------------------

function buildUrl(query: string): string {
  const params = new URLSearchParams({
    q: /kerala/i.test(query) ? query : `${query}, Kerala`,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'in',
    viewbox: `${KERALA_BBOX.west},${KERALA_BBOX.north},${KERALA_BBOX.east},${KERALA_BBOX.south}`,
    bounded: '1',
    'accept-language': 'en',
  });
  if (CONTACT_EMAIL) params.set('email', CONTACT_EMAIL);
  return `${BASE_URL}/search?${params.toString()}`;
}

function parseResult(data: unknown): GeocodedPlace | null {
  const first = Array.isArray(data) ? data[0] : null;
  if (!first) return null;

  const latitude = Number(first.lat);
  const longitude = Number(first.lon);
  const inKerala =
    Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= KERALA_BBOX.south && latitude <= KERALA_BBOX.north &&
    longitude >= KERALA_BBOX.west && longitude <= KERALA_BBOX.east;
  if (!inKerala) return null;

  return {
    latitude,
    longitude,
    displayName: String(first.display_name ?? ''),
    precise: !COARSE_TYPES.has(String(first.addresstype ?? first.type ?? '')),
  };
}

/**
 * Looks up a place in Kerala.
 *
 * Resolves to null when nothing matched. Throws NominatimError when the service
 * can't be reached, and an AbortError when `signal` aborts. Cached answers return
 * immediately; uncached ones wait out a debounce first so typing doesn't spam
 * the server (abort the previous call when the query changes).
 */
export async function geocodeKeralaPlace(query: string, signal?: AbortSignal): Promise<GeocodedPlace | null> {
  const key = normalize(query);
  if (key.length < 2) return null;

  const cached = readCache(key);
  if (cached) return cached.value;

  await sleep(DEBOUNCE_MS, signal);

  const data = await throttled(
    () =>
      fetchJson(buildUrl(query.trim()), {
        signal,
        timeoutMs: REQUEST_TIMEOUT_MS,
        makeError: message => new NominatimError(`Nominatim request failed: ${message}`),
      }),
    signal,
  );

  const place = parseResult(data);
  writeCache(key, place);
  return place;
}

/** Test helper. */
export function clearGeocodeCache(): void {
  memoryCache.clear();
  try {
    if (typeof localStorage !== 'undefined') {
      Object.keys(localStorage)
        .filter(k => k.startsWith(STORAGE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    }
  } catch {
    // ignore
  }
}
