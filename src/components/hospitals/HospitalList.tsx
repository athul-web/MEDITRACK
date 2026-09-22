/**
 * Hospital List Component
 * Per MediTrack UI Spec §8, §9, §10
 * Container for hospital results with sort, loading, empty, and error states.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Hospital, HospitalSearchFilters, HospitalSort } from '../../types/public';
import { useHospitals } from '../../hooks/useHospitals';
import { HospitalCard } from './HospitalCard';
import { ArrowUpDown, Loader2, AlertCircle, MapPin } from 'lucide-react';

interface HospitalListProps {
  filters: HospitalSearchFilters;
  onFiltersChange: (filters: HospitalSearchFilters) => void;
}

const sortOptions: { value: HospitalSort; label: string }[] = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'availability', label: 'Most Available' },
  { value: 'recentlyUpdated', label: 'Recently Updated' },
];

// Custom sort select - text-button style per spec §9
function SortSelect({ value, onChange }: { value: HospitalSort; onChange: (value: HospitalSort) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = sortOptions.find(o => o.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white text-[var(--text-meta)] font-medium transition-colors hover:bg-[var(--color-page)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-[var(--color-text-muted)]">Sort by:</span>
        <span className="text-[var(--color-text-primary)] font-semibold">{currentOption?.label || value}</span>
        <ArrowUpDown className={`w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-20 mt-2 w-48 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] overflow-hidden">
          <ul className="max-h-60 overflow-auto" role="listbox">
            {sortOptions.map(option => (
              <li key={option.value} role="option" aria-selected={value === option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-[var(--text-meta)] font-medium text-left transition-colors ${
                    value === option.value
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand-navy)] font-semibold'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-page)]'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function HospitalList({ filters, onFiltersChange }: HospitalListProps) {
  const [sort, setSort] = useState<HospitalSort>('nearest');
  const { hospitals, isLoading, error, search } = useHospitals();

  const handleSortChange = useCallback((newSort: HospitalSort) => {
    setSort(newSort);
    search(filters, newSort);
  }, [filters, search]);

  const handleRetry = useCallback(() => {
    search(filters, sort);
  }, [filters, sort, search]);

  // Skeleton card for loading state
  const SkeletonCard = () => (
    <article className="card-surface overflow-hidden animate-pulse">
      <div className="h-[96px] bg-[var(--color-border)]" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-[var(--color-border)] rounded w-3/4" />
        <div className="h-4 bg-[var(--color-border)] rounded w-1/2" />
        <div className="h-4 bg-[var(--color-border)] rounded w-5/6" />
        <div className="space-y-2">
          <div className="h-4 bg-[var(--color-border)] rounded w-full" />
          <div className="h-4 bg-[var(--color-border)] rounded w-full" />
          <div className="h-4 bg-[var(--color-border)] rounded w-full" />
          <div className="h-4 bg-[var(--color-border)] rounded w-full" />
          <div className="h-4 bg-[var(--color-border)] rounded w-full" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-10 bg-[var(--color-border)] rounded-[var(--radius-sm)] flex-1" />
          <div className="h-10 bg-[var(--color-border)] rounded-[var(--radius-sm)] w-36" />
        </div>
      </div>
    </article>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header with Sort */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--color-brand-blue)] flex-shrink-0" />
            <h2 className="text-[var(--text-section)] font-bold text-[var(--color-text-primary)]">Nearby Hospitals</h2>
          </div>
          <p className="text-[var(--text-body)] text-[var(--color-text-secondary)]">
            Showing hospitals near your location with available resources
          </p>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-[48px] space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-unavailable)]/10">
          <AlertCircle className="w-6 h-6 text-[var(--color-unavailable)]" />
        </div>
        <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary)]">
          We couldn't load hospital availability
        </h3>
        <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
          Something went wrong while fetching hospital data. Please try again.
        </p>
        <button
          onClick={handleRetry}
          className="btn-outline inline-flex items-center gap-2 mx-auto"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Try Again
        </button>
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <div className="text-center py-[48px] space-y-4">
        <MapPin className="w-10 h-10 text-[var(--color-text-muted)] mx-auto" />
        <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary)]">
          No matching hospitals found
        </h3>
        <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
          Try adjusting your search criteria to find available hospitals.
        </p>
        <ul className="text-[var(--color-text-secondary)] text-sm space-y-2 max-w-md mx-auto text-left">
          <li className="flex items-center gap-2">• Expanding your search area</li>
          <li className="flex items-center gap-2">• Removing a required resource</li>
          <li className="flex items-center gap-2">• Choosing another emergency type</li>
        </ul>
        <button
          onClick={() => onFiltersChange({ requiredResources: [] })}
          className="btn-outline inline-flex items-center gap-2 mx-auto"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Sort */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[var(--color-brand-blue)] flex-shrink-0" />
          <h2 className="text-[var(--text-section)] font-bold text-[var(--color-text-primary)]">Nearby Hospitals</h2>
        </div>
        <p className="text-[var(--text-body)] text-[var(--color-text-secondary)]">
          Showing {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} near your location
        </p>

        {/* Sort control - text-button style */}
        <div className="flex items-center gap-2 ml-auto">
          <SortSelect value={sort} onChange={handleSortChange} />
        </div>
      </div>

      {/* Hospital Cards - vertical stack with gap */}
      <div className="space-y-4" role="list" aria-label="Hospital results">
        {hospitals.map(hospital => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            onViewDetails={() => { /* TODO: navigate to hospital details */ }}
            onCall={() => { /* TODO: initiate call */ }}
          />
        ))}
      </div>
    </div>
  );
}