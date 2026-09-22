/**
 * Hospital Repository Pattern
 * Per architecture.md §8
 * Abstracts data source so UI doesn't depend on implementation.
 */

import { Hospital, HospitalSearchFilters, HospitalSort } from '../../types/public';
import { mockHospitals } from '../mock/hospitals';

export interface HospitalRepository {
  getHospitals(): Promise<Hospital[]>;
  getHospitalById(id: string): Promise<Hospital | null>;
  searchHospitals(filters: HospitalSearchFilters, sort?: HospitalSort): Promise<Hospital[]>;
}

class MockHospitalRepository implements HospitalRepository {
  async getHospitals(): Promise<Hospital[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockHospitals];
  }

  async getHospitalById(id: string): Promise<Hospital | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockHospitals.find(h => h.id === id) ?? null;
  }

  async searchHospitals(filters: HospitalSearchFilters, sort: HospitalSort = 'nearest'): Promise<Hospital[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let results = [...mockHospitals];

    // Filter by required resources
    if (filters.requiredResources.length > 0) {
      results = results.filter(hospital =>
        filters.requiredResources.every(resource => hospital.resources[resource] === 'available')
      );
    }

    // Filter by emergency type (maps to required resources)
    if (filters.emergencyType) {
      const preset = {
        accident: ['icu', 'ventilator', 'ctScan'] as const,
        heart: ['emergencyDepartment', 'icu'] as const,
        breathing: ['emergencyDepartment', 'icu', 'ventilator'] as const,
        burn: ['emergencyDepartment', 'icu'] as const,
      }[filters.emergencyType];

      if (preset) {
        results = results.filter(hospital =>
          preset.every(resource => hospital.resources[resource] === 'available')
        );
      }
    }

    // Sort
    switch (sort) {
      case 'nearest':
        results.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
        break;
      case 'availability':
        results.sort((a, b) => {
          const aAvailable = Object.values(a.resources).filter(r => r === 'available').length;
          const bAvailable = Object.values(b.resources).filter(r => r === 'available').length;
          return bAvailable - aAvailable;
        });
        break;
      case 'recentlyUpdated':
        // In real impl, would parse lastUpdated timestamps
        results.sort((a, b) => a.lastUpdated.localeCompare(b.lastUpdated));
        break;
    }

    return results;
  }
}

// Export singleton instance
export const hospitalRepository: HospitalRepository = new MockHospitalRepository();

// Future implementations:
// export class SupabaseHospitalRepository implements HospitalRepository { ... }
// export class APIHospitalRepository implements HospitalRepository { ... }
// export class RealtimeHospitalRepository implements HospitalRepository { ... }