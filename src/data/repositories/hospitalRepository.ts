/**
 * Hospital Repository Pattern
 * Per architecture.md §8
 * Abstracts data source so UI doesn't depend on implementation.
 */

import { Hospital, HospitalSearchFilters, HospitalSort } from '../../types/public';
import { SupabaseHospitalRepository } from './supabaseHospitalRepository';

export interface HospitalRepository {
  getHospitals(): Promise<Hospital[]>;
  getHospitalById(id: string): Promise<Hospital | null>;
  searchHospitals(
    filters: HospitalSearchFilters,
    sort?: HospitalSort,
    options?: { signal?: AbortSignal },
  ): Promise<Hospital[]>;
  updateResources(id: string, resources: Record<string, string>): Promise<void>;
}

// Export singleton instance
export const hospitalRepository: HospitalRepository = new SupabaseHospitalRepository();
