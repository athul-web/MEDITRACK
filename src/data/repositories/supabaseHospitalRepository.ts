import { Hospital, HospitalRepository, HospitalSearchFilters, HospitalSort } from './hospitalRepository';
import { supabase, mapDbToFrontend } from '../../lib/supabase';

export class SupabaseHospitalRepository implements HospitalRepository {
  async getHospitals(): Promise<Hospital[]> {
    const { data, error } = await supabase
      .from('public_hospitals')
      .select('*')
      .order('name');

    if (error) throw error;
    return mapDbToFrontend(data);
  }

  async getHospitalById(id: string): Promise<Hospital | null> {
    const { data, error } = await supabase
      .from('public_hospitals')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapDbToFrontend(data) : null;
  }

  async searchHospitals(filters: HospitalSearchFilters, sort: HospitalSort = 'nearest'): Promise<Hospital[]> {
    let query = supabase.from('public_hospitals').select('*');

    // 1. Resource Filtering (The core requirement)
    const requiredResources: Record<string, string> = {};

    // Direct required resources
    if (filters.requiredResources && filters.requiredResources.length > 0) {
      filters.requiredResources.forEach(res => {
        requiredResources[res] = 'available';
      });
    }

    // Emergency Type Presets
    if (filters.emergencyType) {
      const presets: Record<string, string[]> = {
        accident: ['icu', 'ventilator', 'ctScan'],
        heart: ['emergencyDepartment', 'icu'],
        breathing: ['emergencyDepartment', 'icu', 'ventilator'],
        burn: ['emergencyDepartment', 'icu'],
      };
      const presetResources = presets[filters.emergencyType];
      if (presetResources) {
        presetResources.forEach(res => {
          requiredResources[res] = 'available';
        });
      }
    }

    // Apply resource filter using JSONB 'contains' operator (@>)
    if (Object.keys(requiredResources).length > 0) {
      query = query.filter('resources', 'cs', requiredResources);
    }

    const { data, error } = await query;

    if (error) throw error;

    const results = mapDbToFrontend(data);

    // 2. Sorting
    switch (sort) {
      case 'recentlyUpdated':
        // Sorted by last_updated DESC in DB if we wanted, but let's stay consistent with UI
        results.sort((a, b) => {
          const dateA = new Date(a.lastUpdated).getTime();
          const dateB = new Date(b.lastUpdated).getTime();
          return dateB - dateA;
        });
        break;
      case 'availability':
        results.sort((a, b) => {
          const aAvailable = Object.values(a.resources).filter(r => r === 'available').length;
          const bAvailable = Object.values(b.resources).filter(r => r === 'available').length;
          return bAvailable - aAvailable;
        });
        break;
      case 'nearest':
        // In a real app, we'd pass user coordinates to the query or use PostGIS.
        // For this phase, we maintain existing behavior (distanceKm is optional).
        results.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
        break;
    }

    return results;
  }
}
