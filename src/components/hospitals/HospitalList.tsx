/**
 * Hospital List Component
 * Per MediTrack UI Spec §8, §9, §10
 * Container for hospital results with sort, loading, empty, and error states.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, HospitalSearchFilters, HospitalSort } from '../../types/public';
import { useHospitals } from '../../hooks/useHospitals';
import { HospitalCard } from './HospitalCard';
import { ArrowUpDown, Loader2, AlertCircle, MapPin, ChevronLeft, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';

interface HospitalListProps {
  filters: HospitalSearchFilters;
  onFiltersChange: (filters: HospitalSearchFilters) => void;
}

const sortOptions: { value: HospitalSort; label: string }[] = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'availability', label: 'Most Available' },
  { value: 'recentlyUpdated', label: 'Recently Updated' },
];

const pageSizeOptions = [5, 10, 20, 50];

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
  const navigate = useNavigate();
  const [sort, setSort] = useState<HospitalSort>('nearest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { hospitals, isLoading, error, search } = useHospitals();

  useEffect(() => {
    search(filters, sort);
    setCurrentPage(1);
  }, [filters, sort, search]);

  const handleSortChange = useCallback((newSort: HospitalSort) => {
    setSort(newSort);
    search(filters, newSort);
    setCurrentPage(1);
  }, [filters, search]);

  const handleRetry = useCallback(() => {
    search(filters, sort);
  }, [filters, sort, search]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(hospitals.length / pageSize);
  const paginatedHospitals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return hospitals.slice(start, start + pageSize);
  }, [hospitals, currentPage, pageSize]);

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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--color-brand-blue)] flex-shrink-0" />
            <h2 className="text-[var(--text-section)] font-bold text-[var(--color-text-primary]">Nearby Hospitals</h2>
          </div>
          <p className="text-[var(--text-body)] text-[var(--color-text-secondary]">
            Showing hospitals near your location with available resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-[48px] space-y-4 mt-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-unavailable)]/10">
          <AlertCircle className="w-6 h-6 text-[var(--color-unavailable)]" />
        </div>
        <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary]">
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
        <div className="inline-flex items-center justify-center w-10 h-10 text-[var(--color-text-muted)] mx-auto">
          <MapPin className="w-10 h-10" />
        </div>
        <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary]">
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

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, hospitals.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[var(--color-brand-blue)] flex-shrink-0" />
          <h2 className="text-[var(--text-section)] font-bold text-[var(--color-text-primary]">Nearby Hospitals</h2>
        </div>
        <p className="text-[var(--text-body)] text-[var(--color-text-secondary]">
          Showing {startIndex}–{endIndex} of {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''}
        </p>

        <div className="flex items-center gap-2 ml-auto">
          <SortSelect value={sort} onChange={handleSortChange} />
          <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
        </div>
      </div>

      <div className="space-y-4" role="list" aria-label="Hospital results">
        {paginatedHospitals.map(hospital => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            onViewDetails={() => navigate(`/hospitals/${hospital.id}`)}
            onCall={() => {
              const phone = hospital.contact?.emergencyPhone || hospital.contact?.phone || hospital.phone1 || hospital.phone2;
              if (phone) {
                window.location.href = `tel:${phone.replace(/[^\d+]/g, '')}`;
              }
            }}
            onGetDirections={() => {
              let url = '';
              if (hospital.coordinates?.latitude && hospital.coordinates?.longitude) {
                url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.latitude},${hospital.coordinates.longitude}`;
              } else {
                const destination = encodeURIComponent(`${hospital.name}, ${hospital.address || ''}, ${hospital.city || ''}`);
                url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
              }
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

function PageSizeSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white text-[var(--text-meta)] font-medium transition-colors hover:bg-[var(--color-page)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-[var(--color-text-muted)]">Per page:</span>
        <span className="text-[var(--color-text-primary)] font-semibold">{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-20 mt-2 w-32 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] overflow-hidden">
          <ul className="max-h-60 overflow-auto" role="listbox">
            {pageSizeOptions.map(option => (
              <li key={option} role="option" aria-selected={value === option}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-[var(--text-meta)] font-medium text-left transition-colors ${
                    value === option
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand-navy)] font-semibold'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-page)]'
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const pages = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <nav className="flex items-center justify-center gap-1 mt-6" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] font-medium transition-colors hover:bg-[var(--color-page)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((page, index) => (
        <span key={index}>
          {page === '...' ? (
            <span className="px-2 text-[var(--color-text-muted)]">...</span>
          ) : (
            <button
              type="button"
              onClick={() => onPageChange(page as number)}
              className={`w-10 h-10 rounded-[var(--radius-sm)] border font-medium transition-colors ${
                page === currentPage
                  ? 'bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white'
                  : 'bg-white border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-page)] cursor-pointer'
              }`}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )}
        </span>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] font-medium transition-colors hover:bg-[var(--color-page)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}
