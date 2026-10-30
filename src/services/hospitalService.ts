import { supabase, mapDbToFrontend } from '../lib/supabase';
import type { Hospital, HospitalSearchFilters, HospitalCategory } from '../types/public';

// Fallback Kerala districts in case database query fails
const KERALA_DISTRICTS_FALLBACK = [
  'Alappuzha',
  'Ernakulam',
  'Idukki',
  'Kannur',
  'Kasaragod',
  'Kollam',
  'Kottayam',
  'Kozhikode',
  'Malappuram',
  'Palakkad',
  'Pathanamthitta',
  'Thiruvananthapuram',
  'Thrissur',
  'Wayanad',
];

export async function fetchKeralaHospitals(filters?: HospitalSearchFilters): Promise<Hospital[]> {
  let query = supabase
    .from('public_hospitals')
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
      // For now, we focus on the public_hospitals table.
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
  const trimmedName = name.trim();
  if (!trimmedName) {
    return [];
  }

  // The Supabase .ilike query parameter is transported as a URL query value,
  // so it does not permit PostgREST filter-clause injection. Escape LIKE
  // wildcards and the escape character itself so user input is matched literally.
  const escapedName = trimmedName.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');

  const { data, error } = await supabase
    .from('public_hospitals')
    .select('*')
    .ilike('name', `%${escapedName}%`);

  if (error) {
    console.error('Error searching hospitals by name:', error);
    throw error;
  }

  return mapDbToFrontend(data) as Hospital[];
}

export async function getDistricts(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('public_hospitals')
      .select('city, district');

    if (error) {
      console.warn('Error fetching districts from DB, using fallback:', error);
      return KERALA_DISTRICTS_FALLBACK;
    }

    const values = (data ?? [])
      .flatMap((h: any) => [h.city, h.district].filter(Boolean))
      .map((value: string) => value.trim())
      .filter(Boolean);

    const uniqueValues = [...new Set(values)].sort((a, b) => a.localeCompare(b));

    // If we got results from DB, use them; otherwise fallback
    return uniqueValues.length > 0 ? uniqueValues : KERALA_DISTRICTS_FALLBACK;
  } catch (err) {
    console.warn('Error in getDistricts, using fallback:', err);
    return KERALA_DISTRICTS_FALLBACK;
  }
}
