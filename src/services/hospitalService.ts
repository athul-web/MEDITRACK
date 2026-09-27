import { supabase, mapDbToFrontend } from '../lib/supabase';
import type { Hospital, HospitalSearchFilters, HospitalCategory } from '../types/public';

export async function fetchKeralaHospitals(filters?: HospitalSearchFilters): Promise<Hospital[]> {
  let query = supabase
    .from('kerala_hospitals')
    .select('*');

  if (filters) {
    if (filters.district) {
      query = query.eq('district', filters.district);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.emergencyType) {
      // This would typically involve joining with resources or filtering based on resource availability
      // For now, we focus on the kerala_hospitals table.
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching Kerala hospitals:', error);
    throw error;
  }

  // Map DB snake_case to Frontend camelCase using the utility in lib/supabase
  return mapDbToFrontend(data) as Hospital[];
}

export async function searchHospitalsByName(name: string): Promise<Hospital[]> {
  const { data, error } = await supabase
    .from('kerala_hospitals')
    .select('*')
    .ilike('name', `%${name}%`);

  if (error) {
    console.error('Error searching hospitals by name:', error);
    throw error;
  }

  return mapDbToFrontend(data) as Hospital[];
}

export async function getDistricts(): Promise<string[]> {
  const { data, error } = await supabase
    .from('kerala_hospitals')
    .select('district');

  if (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }

  // Return unique districts
  return [...new Set(data.map(h => h.district))].filter(Boolean).sort();
}
