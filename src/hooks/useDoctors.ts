import { useState, useEffect, useCallback, useRef } from 'react';
import { PublicHospitalDoctor, DoctorSearchFilters, DoctorSort } from '../types/doctor';
import { doctorRepository } from '../data/repositories/doctorRepository';

interface UseDoctorsForHospitalResult {
  doctors: PublicHospitalDoctor[];
  isLoading: boolean;
  error: string | null;
  fetch: (publicHospitalId: string, signal?: AbortSignal) => Promise<void>;
  clear: () => void;
}

export function useDoctorsForHospital(): UseDoctorsForHospitalResult {
  const [doctors, setDoctors] = useState<PublicHospitalDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFetch = useRef<AbortController | null>(null);

  const fetch = useCallback(async (publicHospitalId: string, externalSignal?: AbortSignal) => {
    activeFetch.current?.abort();
    const controller = new AbortController();
    activeFetch.current = controller;
    externalSignal?.addEventListener('abort', () => controller.abort(), { once: true });
    const { signal } = controller;

    setIsLoading(true);
    setError(null);
    try {
      const results = await doctorRepository.getPublishedDoctorsForHospital(publicHospitalId);
      if (signal.aborted) return;
      setDoctors(results);
    } catch (err) {
      if (signal.aborted || (err instanceof Error && err.name === 'AbortError')) return;
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      // Log full error for debugging
      console.error('[useDoctorsForHospital] Failed to load doctors:', {
        publicHospitalId,
        error: err,
        message: errorMessage,
      });
      // Differentiate between RPC not found, permission denied, and other errors
      if (errorMessage.includes('function') && errorMessage.includes('does not exist')) {
        setError('Doctor directory function not available. Please contact administrator.');
      } else if (errorMessage.includes('permission denied') || errorMessage.includes('Permission denied')) {
        setError('Access denied. Please check your permissions.');
      } else {
        setError('Failed to load doctors. Please try again.');
      }
      setDoctors([]);
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const clear = useCallback(() => {
    setDoctors([]);
    setError(null);
  }, []);

  return { doctors, isLoading, error, fetch, clear };
}

interface UseAdminDoctorsForHospitalResult {
  doctors: import('../types/doctor').AdminHospitalDoctor[];
  isLoading: boolean;
  error: string | null;
  fetch: (publicHospitalId: string, signal?: AbortSignal) => Promise<void>;
  clear: () => void;
}

export function useAdminDoctorsForHospital(): UseAdminDoctorsForHospitalResult {
  const [doctors, setDoctors] = useState<import('../types/doctor').AdminHospitalDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFetch = useRef<AbortController | null>(null);

  const fetch = useCallback(async (publicHospitalId: string, externalSignal?: AbortSignal) => {
    activeFetch.current?.abort();
    const controller = new AbortController();
    activeFetch.current = controller;
    externalSignal?.addEventListener('abort', () => controller.abort(), { once: true });
    const { signal } = controller;

    setIsLoading(true);
    setError(null);
    try {
      const results = await doctorRepository.getAllDoctorsForHospitalAdmin(publicHospitalId);
      if (signal.aborted) return;
      setDoctors(results);
    } catch (err) {
      if (signal.aborted || (err instanceof Error && err.name === 'AbortError')) return;
      setError('Failed to load doctors. Please try again.');
      setDoctors([]);
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const clear = useCallback(() => {
    setDoctors([]);
    setError(null);
  }, []);

  return { doctors, isLoading, error, fetch, clear };
}

interface UseDoctorSearchResult {
  doctors: import('../types/doctor').Doctor[];
  isLoading: boolean;
  error: string | null;
  search: (filters: DoctorSearchFilters, sort?: DoctorSort, signal?: AbortSignal) => Promise<void>;
  clear: () => void;
}

export function useDoctorSearch(): UseDoctorSearchResult {
  const [doctors, setDoctors] = useState<import('../types/doctor').Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSearch = useRef<AbortController | null>(null);

  const search = useCallback(async (filters: DoctorSearchFilters, sort: DoctorSort = 'name', externalSignal?: AbortSignal) => {
    activeSearch.current?.abort();
    const controller = new AbortController();
    activeSearch.current = controller;
    externalSignal?.addEventListener('abort', () => controller.abort(), { once: true });
    const { signal } = controller;

    setIsLoading(true);
    setError(null);
    try {
      const results = await doctorRepository.searchDoctors(filters, sort, { signal });
      if (signal.aborted) return;
      setDoctors(results);
    } catch (err) {
      if (signal.aborted || (err instanceof Error && err.name === 'AbortError')) return;
      setError('Failed to search doctors. Please try again.');
      setDoctors([]);
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const clear = useCallback(() => {
    setDoctors([]);
    setError(null);
  }, []);

  return { doctors, isLoading, error, search, clear };
}