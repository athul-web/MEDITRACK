import { HospitalRepository } from './hospitalRepository';
import { Hospital, HospitalSearchFilters, HospitalSort } from '../../types/public';
import { supabase, mapDbToFrontend } from '../../lib/supabase';
import { attachDistances, isValidCoordinate, type DistanceOrigin } from '../../utils/distance';
import { resolveKeralaCoordinates } from '../../utils/keralaCoordinates';
import { geocodeKeralaPlace, type GeocodedPlace } from '../../utils/nominatim';
import { isAbortError } from '../../utils/http';

export class SupabaseHospitalRepository implements HospitalRepository {
  async getHospitals(): Promise<Hospital[]> {
    const { data, error } = await supabase
      .from('kerala_hospitals')
      .select('*')
      .order('name');

    if (error) throw error;
    return mapDbToFrontend(data);
  }

  async getHospitalById(id: string): Promise<Hospital | null> {
    const { data, error } = await supabase
      .from('kerala_hospitals')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapDbToFrontend(data) : null;
  }

  async updateResources(id: string, resources: Record<string, string>): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`hospital_resources_${id}`, JSON.stringify(resources));
      } catch {
        // Ignore localStorage error
      }
    }

    try {
      await supabase
        .from('kerala_hospitals')
        .update({ resources })
        .eq('id', id);
    } catch (err) {
      console.warn('Backend resources column may not exist, cached locally:', err);
    }
  }

  async searchHospitals(
    filters: HospitalSearchFilters,
    sort: HospitalSort = 'nearest',
    options?: { signal?: AbortSignal },
  ): Promise<Hospital[]> {
    let query = supabase.from('kerala_hospitals').select('*');

    const isCurrentLocation = (label?: string) => {
      if (!label) return false;
      const lower = label.trim().toLowerCase();
      return lower === 'current location' || lower === 'my location' || lower === 'use my location';
    };

    // A typed place ("Aluva") is geocoded with OpenStreetMap Nominatim and used as
    // the point distances are measured from. If it can't be resolved we fall back
    // to the old behaviour: treat the text as a filter on hospital name/address.
    const typedLocation = filters.location?.label && !isCurrentLocation(filters.location.label)
      ? filters.location.label.trim()
      : '';
    let geocoded: GeocodedPlace | null = null;

    if (typedLocation) {
      try {
        geocoded = await geocodeKeralaPlace(typedLocation, options?.signal);
      } catch (err) {
        if (isAbortError(err)) throw err;
        console.warn('Nominatim lookup failed, filtering by text instead:', err);
      }
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.district) {
      const districtText = filters.district.trim();
      query = query.or(
        `city.ilike.%${districtText}%,district.ilike.%${districtText}%,address.ilike.%${districtText}%`,
      );
    }

    const customLocationText = geocoded ? '' : typedLocation;

    if (customLocationText) {
      query = query.or(
        `name.ilike.%${customLocationText}%,city.ilike.%${customLocationText}%,address.ilike.%${customLocationText}%,email.ilike.%${customLocationText}%`,
      );
    }

    if (filters.query && filters.query.trim()) {
      const trimmedQuery = filters.query.trim();
      query = query.or(
        `name.ilike.%${trimmedQuery}%,city.ilike.%${trimmedQuery}%,address.ilike.%${trimmedQuery}%,email.ilike.%${trimmedQuery}%`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = mapDbToFrontend<Hospital[]>(data ?? []);

    if (customLocationText) {
      const match = customLocationText.toLowerCase();
      results = results.filter(hospital => {
        const haystack = [
          hospital.name,
          hospital.city,
          hospital.address,
          hospital.district,
          hospital.email,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(match);
      });
    }

    if (filters.requiredResources && filters.requiredResources.length > 0) {
      results = results.filter(hospital => {
        const resourceMap = hospital.resources ?? {};
        return filters.requiredResources.every(resource => {
          const value = resourceMap[resource as keyof typeof resourceMap];
          return value === 'available';
        });
      });
    }

    // Work out where distances are measured from, best source first:
    //  1. a place the user typed, found by Nominatim
    //  2. the user's GPS position
    //  3. a district centre (rough, so estimates only)
    let origin: DistanceOrigin | null = null;

    if (geocoded) {
      origin = {
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        approximate: !geocoded.precise,
      };
    } else if (isValidCoordinate(filters.location?.latitude, filters.location?.longitude)) {
      origin = {
        latitude: filters.location!.latitude!,
        longitude: filters.location!.longitude!,
      };
    } else if (filters.district) {
      const resolved = resolveKeralaCoordinates(filters.district);
      if (resolved) origin = { ...resolved, approximate: true };
    }

    if (origin) {
      results = await attachDistances(results, origin, options?.signal);
    }

    switch (sort) {
      case 'recentlyUpdated':
        results.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.lastUpdated).getTime();
          const dateB = new Date(b.updatedAt || b.lastUpdated).getTime();
          return dateB - dateA;
        });
        break;
      case 'availability':
        results.sort((a, b) => {
          const aAvailable = Object.values(a.resources ?? {}).filter(r => r === 'available').length;
          const bAvailable = Object.values(b.resources ?? {}).filter(r => r === 'available').length;
          return bAvailable - aAvailable;
        });
        break;
      case 'nearest':
      default:
        results.sort((a, b) => {
          if (a.distanceKm != null && b.distanceKm != null) {
            return a.distanceKm - b.distanceKm;
          }
          if (a.distanceKm != null) return -1;
          if (b.distanceKm != null) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    return results;
  }
}
