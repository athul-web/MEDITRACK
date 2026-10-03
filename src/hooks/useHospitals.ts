/**
 * Hook for fetching hospitals.
 * Per architecture.md §7 - UI consumes data through hooks, not direct imports.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Hospital, HospitalSearchFilters, HospitalSort } from '../types/public';
import { hospitalRepository } from '../data/repositories/hospitalRepository';

interface UseHospitalsResult {
  hospitals: Hospital[];
  isLoading: boolean;
  error: string | null;
  search: (filters: HospitalSearchFilters, sort?: HospitalSort, signal?: AbortSignal) => Promise<void>;
  clearResults: () => void;
}

export function useHospitals(): UseHospitalsResult {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only the newest search may update state; starting one cancels the previous
  // (which also cancels its pending geocoding request).
  const activeSearch = useRef<AbortController | null>(null);

  const search = useCallback(async (filters: HospitalSearchFilters, sort: HospitalSort = 'nearest', externalSignal?: AbortSignal) => {
    activeSearch.current?.abort();
    const controller = new AbortController();
    activeSearch.current = controller;
    externalSignal?.addEventListener('abort', () => controller.abort(), { once: true });
    const { signal } = controller;

    setIsLoading(true);
    setError(null);
    try {
      const results = await hospitalRepository.searchHospitals(filters, sort, { signal });
      if (signal.aborted) return;
      setHospitals(results);
    } catch (err) {
      if (signal.aborted || (err instanceof Error && err.name === 'AbortError')) return;
      setError('Failed to load hospitals. Please try again.');
      setHospitals([]);
    } finally {
      if (!signal.aborted) {
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
    return () => {
      controller.abort();
      activeSearch.current?.abort();
    };
  }, [search]);

  return { hospitals, isLoading, error, search, clearResults };
}