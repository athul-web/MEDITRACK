import { useState, useEffect } from 'react';
import { hospitalRepository } from '../data/repositories/hospitalRepository';
import { Hospital } from '../types/public';

interface UseHospitalResult {
  hospital: Hospital | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useHospital(id: string): UseHospitalResult {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHospital = async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await hospitalRepository.getHospitalById(id);
      if (signal?.aborted) return;
      setHospital(data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Failed to load hospital details. Please try again.');
      console.error(`Error fetching hospital ${id}:`, err);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    if (id) {
      fetchHospital(controller.signal);
    }
    return () => controller.abort();
  }, [id]);

  return {
    hospital,
    isLoading,
    error,
    refresh: fetchHospital,
  };
}
