import { HospitalRepository } from './hospitalRepository';
import { Hospital, HospitalSearchFilters, HospitalSort } from '../../types/public';
import { supabase, mapDbToFrontend } from '../../lib/supabase';
import { calculateDistanceKm } from '../../utils/distance';

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

  async searchHospitals(filters: HospitalSearchFilters, sort: HospitalSort = 'nearest'): Promise<Hospital[]> {
    let query = supabase.from('kerala_hospitals').select('*');

    const isCurrentLocation = (label?: string) => {
      if (!label) return false;
      const lower = label.trim().toLowerCase();
      return lower === 'current location' || lower === 'my location' || lower === 'use my location';
    };

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.district) {
      const districtText = filters.district.trim();
      query = query.or(
        `city.ilike.%${districtText}%,district.ilike.%${districtText}%,address.ilike.%${districtText}%`,
      );
    }

    const customLocationText = filters.location?.label && !isCurrentLocation(filters.location.label)
      ? filters.location.label.trim()
      : '';

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

    // Determine reference coordinates for distance calculations
    let userLat = filters.location?.latitude;
    let userLng = filters.location?.longitude;

    if ((userLat === undefined || userLng === undefined) && filters.district) {
      const { resolveKeralaCoordinates } = await import('../../utils/keralaCoordinates');
      const resolved = resolveKeralaCoordinates(filters.district);
      if (resolved) {
        userLat = resolved.latitude;
        userLng = resolved.longitude;
      }
    }

    // If user location is available, calculate distances
    if (userLat !== undefined && userLng !== undefined) {
      // Import resolveKeralaCoordinates for hospital fallback
      const { resolveKeralaCoordinates } = await import('../../utils/keralaCoordinates');

      results.forEach(h => {
        // Use hospital's own coordinates if available
        let hospitalLat = h.coordinates?.latitude;
        let hospitalLng = h.coordinates?.longitude;

        // If hospital doesn't have coordinates, try to resolve from city/address
        if (hospitalLat === undefined || hospitalLng === undefined) {
          const resolved = resolveKeralaCoordinates(h.city, h.address);
          if (resolved) {
            hospitalLat = resolved.latitude;
            hospitalLng = resolved.longitude;
            // Cache the resolved coordinates on the hospital object
            h.coordinates = { latitude: hospitalLat, longitude: hospitalLng };
          }
        }

        if (hospitalLat !== undefined && hospitalLng !== undefined) {
          const dist = calculateDistanceKm(
            userLat!,
            userLng!,
            hospitalLat,
            hospitalLng,
          );
          h.distanceKm = dist != null ? Math.round(dist * 10) / 10 : undefined;

          // Debug logging (can be removed in production)
          if (process.env.NODE_ENV === 'development') {
            console.log(`Distance to ${h.name}: ${h.distanceKm} km (user: ${userLat}, ${userLng}, hospital: ${hospitalLat}, ${hospitalLng})`);
          }
        }
      });
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
