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
    const { error } = await supabase
      .from('kerala_hospitals')
      .update({ resources })
      .eq('id', id);

    if (error) throw error;
  }

  async searchHospitals(filters: HospitalSearchFilters, sort: HospitalSort = 'nearest'): Promise<Hospital[]> {
    let query = supabase.from('kerala_hospitals').select('*');

    const locationText = (filters.location?.label || filters.district || filters.query || '').trim();
    const normalizedLocationText = locationText.toLowerCase();

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.district) {
      const districtText = filters.district.trim();
      query = query.or(
        `city.ilike.%${districtText}%,district.ilike.%${districtText}%,address.ilike.%${districtText}%`,
      );
    }

    if (normalizedLocationText) {
      query = query.or(
        `name.ilike.%${normalizedLocationText}%,city.ilike.%${normalizedLocationText}%,district.ilike.%${normalizedLocationText}%,address.ilike.%${normalizedLocationText}%,email.ilike.%${normalizedLocationText}%,id::text.ilike.%${normalizedLocationText}%`,
      );
    }

    if (filters.query && filters.query.trim()) {
      const trimmedQuery = filters.query.trim();
      query = query.or(
        `name.ilike.%${trimmedQuery}%,city.ilike.%${trimmedQuery}%,address.ilike.%${trimmedQuery}%,email.ilike.%${trimmedQuery}%,id::text.ilike.%${trimmedQuery}%`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = mapDbToFrontend<Hospital[]>(data ?? []);

    if (locationText) {
      const match = locationText.toLowerCase();
      results = results.filter(hospital => {
        const haystack = [
          hospital.name,
          hospital.city,
          hospital.address,
          hospital.district,
          hospital.email,
          hospital.id,
          hospital.systemOfMedicine,
          hospital.contact?.phone,
          hospital.contact?.emergencyPhone,
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

    if (filters.location?.latitude !== undefined && filters.location?.longitude !== undefined) {
      const { latitude, longitude } = filters.location;
      results.forEach(h => {
        if (h.coordinates?.latitude && h.coordinates?.longitude) {
          const dist = calculateDistanceKm(
            latitude,
            longitude,
            h.coordinates.latitude,
            h.coordinates.longitude,
          );
          h.distanceKm = dist ?? undefined;
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
        results.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
        break;
    }

    return results;
  }
}
