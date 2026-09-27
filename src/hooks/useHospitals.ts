/**
 * Hook for fetching hospitals.
 * Per architecture.md §7 - UI consumes data through hooks, not direct imports.
 */

import { useState, useEffect, useCallback } from 'react';
import { Hospital, HospitalSearchFilters, HospitalSort } from '../types/public';
import { hospitalRepository } from '../data/repositories/hospitalRepository';

interface UseHospitalsResult {
  hospitals: Hospital[];
  isLoading: boolean;
  error: string | null;
  search: (filters: HospitalSearchFilters, sort?: HospitalSort) => Promise<void>;
  clearResults: () => void;
}

export function useHospitals(): UseHospitalsResult {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (filters: HospitalSearchFilters, sort: HospitalSort = 'nearest', signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await hospitalRepository.searchHospitals(filters, sort);
      if (signal?.aborted) return;
      setHospitals(results);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Failed to load hospitals. Please try again.');
      setHospitals([]);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const clearResults = useCallback(() => {
    setHospitals([]);
    setError(null);
  }, []);

  // Load initial hospitals on mount
  useEffect(() => {
    const controller = new AbortController();
    search({ requiredResources: [] }, 'nearest', controller.signal);
    return () => controller.abort();
  }, [search]);

  return { hospitals, isLoading, error, search, clearResults };
}