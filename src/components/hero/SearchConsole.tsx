/**
 * Search Console Component
 * Per MediTrack UI Spec §5
 * Primary interaction - single horizontal row with 4 segments on desktop
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import React from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin, Crosshair, Stethoscope, BriefcaseMedical, ChevronDown, Landmark, AlertCircle, X } from 'lucide-react';
import { HospitalSearchFilters, ResourceType, HospitalCategory } from '../../types/public';
import { emergencyPresets } from '../../constants/emergencyPresets';

interface SearchConsoleProps {
  filters: HospitalSearchFilters;
  onChange: (filters: HospitalSearchFilters) => void;
  onSearch?: () => void;
  onSearchWithLocation?: () => Promise<void>;
  variant?: 'horizontal' | 'vertical';
}

const resourceLabels: Record<ResourceType, string> = {
  emergencyDepartment: 'Emergency Dept',
  icu: 'ICU',
  ventilator: 'Ventilator',
  ctScan: 'CT Scan',
  blood: 'Blood',
};

const categoryOptions: { value: HospitalCategory; label: string }[] = [
  { value: 'multi_specialty', label: 'Multi-Specialty' },
  { value: 'single_specialty', label: 'Single-Specialty' },
];

function HospitalNameSearch({
  value,
  onChange,
  onSearch,
  placeholder = "Search hospitals by name..."
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <label className="field-label">Search by Name</label>
      <div className="relative">
        <Search className="field-icon" />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSearch(); }}
          placeholder={placeholder}
          className="input-field pr-12"
        />
        <button
          type="button"
          onClick={onSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-brand-blue)] transition-colors"
          aria-label="Search hospitals"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Single-select dropdown component for Emergency Type / Category
function CustomSelect({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  placeholder
}: {
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value?: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      // Prevent body scroll on mobile when sheet is open
      if (isMobile) document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  // Escape key handler
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const displayValue = value
    ? options.find(o => o.value === value)?.label || value
    : placeholder;

  const handleSelect = useCallback((optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  }, [onChange]);

  const handleOpen = useCallback(() => setIsOpen(true), []);

  // Mobile: render as bottom sheet via portal
  if (isMobile && isOpen) {
    return createPortal(
      <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${label} options`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
        {/* Bottom Sheet */}
        <div
          ref={sheetRef}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[var(--radius-lg)] shadow-[var(--shadow-xl)] animate-in slide-in-from-bottom duration-300 ease-out"
          style={{ maxHeight: '70vh' }}
        >
          {/* Handle bar */}
          <div className="flex items-center justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-slate-600" />
              <span className="font-semibold text-slate-900">{label}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Options */}
          <ul className="max-h-[50vh] overflow-y-auto overscroll-contain" role="listbox" style={{ overscrollBehavior: 'contain' }}>
            {options.map(option => (
              <li key={option.value} role="option" aria-selected={value === option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-4 text-base font-medium text-left transition-colors flex items-center justify-between gap-2 ${
                    value === option.value
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand-navy)] font-semibold'
                      : 'text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <svg className="w-5 h-5 flex-shrink-0 text-[var(--color-brand-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {/* Safe area padding */}
          <div className="pb-safe-area-inset-bottom" />
        </div>
      </div>,
      document.body
    );
  }

  // Desktop: traditional dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white text-left transition-colors hover:bg-[var(--color-page)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{label}</span>
            <span className={`text-[15px] font-medium truncate ${value ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
              {displayValue}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !isMobile && (
        <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] shadow-[var(--shadow-lg)] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 ease-out">
          <ul className="max-h-60 overflow-auto overscroll-contain" role="listbox" style={{ overscrollBehavior: 'contain' }}>
            {options.map(option => (
              <li key={option.value} role="option" aria-selected={value === option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-sm font-medium text-left transition-colors flex items-center justify-between gap-2 ${
                    value === option.value
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand-navy)] font-semibold'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-page)]'
                  }`}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <svg className="w-4 h-4 flex-shrink-0 text-[var(--color-brand-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Multi-select dropdown component for Required Resources
function MultiSelectDropdown({
  label,
  selected,
  options,
  onChange,
  icon: Icon,
  placeholder
}: {
  label: string;
  selected: string[];
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      // Prevent body scroll on mobile when sheet is open
      if (isMobile) document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  // Escape key handler
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleToggle = useCallback((value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(newSelected);
  }, [selected, onChange]);

  const displayValue = selected.length > 0
    ? selected.map(v => options.find(o => o.value === v)?.label || v).join(', ')
    : placeholder;

  // Mobile: render as bottom sheet via portal
  if (isMobile && isOpen) {
    return createPortal(
      <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${label} options`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
        {/* Bottom Sheet */}
        <div
          ref={sheetRef}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[var(--radius-lg)] shadow-[var(--shadow-xl)] animate-in slide-in-from-bottom duration-300 ease-out"
          style={{ maxHeight: '75vh' }}
        >
          {/* Handle bar */}
          <div className="flex items-center justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-slate-600" />
              <span className="font-semibold text-slate-900">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-sm text-[var(--color-brand-blue)] hover:underline font-medium"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Options */}
          <ul className="max-h-[55vh] overflow-y-auto overscroll-contain" role="listbox" style={{ overscrollBehavior: 'contain' }}>
            {options.map(option => (
              <li key={option.value} role="option" aria-selected={selected.includes(option.value)}>
                <button
                  type="button"
                  onClick={() => handleToggle(option.value)}
                  className={`w-full px-4 py-4 text-base font-medium text-left transition-colors flex items-center justify-between gap-2 ${
                    selected.includes(option.value)
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand-navy)] font-semibold'
                      : 'text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{option.label}</span>
                  {selected.includes(option.value) && (
                    <svg className="w-5 h-5 flex-shrink-0 text-[var(--color-brand-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {/* Safe area padding */}
          <div className="pb-safe-area-inset-bottom" />
        </div>
      </div>,
      document.body
    );
  }

  // Desktop: traditional dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white text-left transition-colors hover:bg-[var(--color-page)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{label}</span>
            <span className={`text-[15px] font-medium truncate ${selected.length > 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
              {displayValue}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !isMobile && (
        <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] shadow-[var(--shadow-lg)] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 ease-out">
          <ul className="max-h-60 overflow-auto overscroll-contain" role="listbox" style={{ overscrollBehavior: 'contain' }}>
            {options.map(option => (
              <li key={option.value} role="option" aria-selected={selected.includes(option.value)}>
                <button
                  type="button"
                  onClick={() => handleToggle(option.value)}
                  className={`w-full px-4 py-3 text-sm font-medium text-left transition-colors flex items-center justify-between gap-2 ${
                    selected.includes(option.value)
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand-navy)] font-semibold'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-page)]'
                  }`}
                >
                  <span>{option.label}</span>
                  {selected.includes(option.value) && (
                    <svg className="w-4 h-4 flex-shrink-0 text-[var(--color-brand-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SearchConsole({ filters, onChange, onSearch, onSearchWithLocation, variant = 'horizontal' }: SearchConsoleProps) {
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  const handleEmergencyTypeChange = (emergencyType?: string) => {
    const preset = emergencyPresets.find(p => p.id === emergencyType);
    const requiredResources = preset ? preset.resources : filters.requiredResources;
    onChange({ ...filters, emergencyType, requiredResources });
  };

  const handleCategoryChange = (category?: string) => {
    onChange({ ...filters, category: category as HospitalCategory });
  };

  const handleResourceToggle = (resources: string[]) => {
    onChange({ ...filters, requiredResources: resources as ResourceType[] });
  };

  const handleLocationChange = (label: string) => {
    onChange({
      ...filters,
      // Editing the text invalidates any earlier GPS fix: keep only the label so
      // distances are measured from the place that is now typed, not a stale position.
      location: label ? { label } : undefined,
    });
    setGeolocationError(null);
  };

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      setGeolocationError(null);
      navigator.geolocation.getCurrentPosition(
        pos => {
          setIsLocating(false);
          onChange({
            ...filters,
            location: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              label: 'Current Location',
            },
          });
        },
        error => {
          setIsLocating(false);
          console.warn('Geolocation access error:', error);
          setGeolocationError('Could not determine current location. Please check browser location permissions.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setGeolocationError('Geolocation is not supported by your browser.');
    }
  };

  const handleSearchWithAutoLocation = async () => {
    // If there's already a location with coordinates, use it
    if (filters.location?.latitude !== undefined && filters.location?.longitude !== undefined) {
      onSearchWithLocation?.();
      return;
    }

    // If there's a location label but no coordinates, try to use it as-is
    if (filters.location?.label) {
      onSearchWithLocation?.();
      return;
    }

    // No location set - automatically get user's current location
    if ('geolocation' in navigator) {
      setIsLocating(true);
      setGeolocationError(null);
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });

        setIsLocating(false);
        onChange({
          ...filters,
          location: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            label: 'Current Location',
          },
        });
        onSearchWithLocation?.();
      } catch (error) {
        setIsLocating(false);
        console.warn('Geolocation access error:', error);
        setGeolocationError('Could not determine current location. Please check browser location permissions or enter a location manually.');
        // Still allow search to proceed without location
        onSearchWithLocation?.();
      }
    } else {
      setGeolocationError('Geolocation is not supported by your browser. Please enter a location manually.');
      onSearchWithLocation?.();
    }
  };

  const emergencyTypeOptions = emergencyPresets.map(p => ({ value: p.id, label: p.label }));
  const resourceOptions = Object.entries(resourceLabels).map(([value, label]) => ({ value, label }));

  if (variant === 'vertical') {
    return (
      <div className="space-y-4 w-full">
        <HospitalNameSearch
          value={filters.query}
          onChange={query => onChange({ ...filters, query })}
          onSearch={handleSearchWithAutoLocation}
        />
        <div className="relative">
          <label className="field-label">Emergency Type</label>
          <CustomSelect
            label="Emergency Type"
            value={filters.emergencyType}
            options={emergencyTypeOptions}
            onChange={handleEmergencyTypeChange}
            icon={Stethoscope}
            placeholder="Select emergency type"
          />
        </div>
        <div className="relative">
          <label className="field-label">Hospital Category</label>
          <CustomSelect
            label="Hospital Category"
            value={filters.category}
            options={categoryOptions}
            onChange={handleCategoryChange}
            icon={Landmark}
            placeholder="Select category"
          />
        </div>
        <div className="relative">
          <label className="field-label">Required Resources</label>
          <MultiSelectDropdown
            label="Required Resources"
            selected={filters.requiredResources}
            options={resourceOptions}
            onChange={handleResourceToggle}
            icon={BriefcaseMedical}
            placeholder="Select resources"
          />
        </div>
        <div className="relative">
          <label className="field-label">Your Location</label>
          <div className="relative">
            <MapPin className="field-icon" />
            <input
              type="text"
              value={filters.location?.label || ''}
              onChange={e => handleLocationChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearchWithAutoLocation(); }}
              onFocus={() => setIsLocationFocused(true)}
              onBlur={() => setIsLocationFocused(false)}
              placeholder="Your Location"
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-[var(--radius-sm)] transition-colors ${
                isLocating ? 'text-[var(--color-brand-blue)] animate-spin' : 'text-[var(--color-text-muted)] hover:text-[var(--color-brand-blue)]'
              }`}
              aria-label="Use my current location"
            >
              <Crosshair className="w-5 h-5" />
            </button>
          </div>
          {geolocationError && (
            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {geolocationError}
            </p>
          )}
        </div>
        {(filters.emergencyType || filters.requiredResources.length > 0 || filters.location?.label || filters.category || filters.query) && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)]">Active:</span>
            {filters.query && (
              <span className="badge-preset badge-preset-active flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                {filters.query}
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, query: undefined })}
                  className="ml-1 hover:text-[var(--color-brand-blue)]"
                  aria-label="Remove search query"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.emergencyType && (
              <span className="badge-preset badge-preset-active flex items-center gap-1.5">
                {emergencyPresets.find(p => p.id === filters.emergencyType)?.label}
                <button
                  type="button"
                  onClick={() => handleEmergencyTypeChange(undefined)}
                  className="ml-1 hover:text-[var(--color-brand-blue)]"
                  aria-label="Remove emergency type filter"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.category && (
              <span className="badge-preset badge-preset-active flex items-center gap-1.5">
                {categoryOptions.find(o => o.value === filters.category)?.label}
                <button
                  type="button"
                  onClick={() => handleCategoryChange(undefined)}
                  className="ml-1 hover:text-[var(--color-brand-blue)]"
                  aria-label="Remove category filter"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.requiredResources.map(resource => (
              <span key={resource} className="badge-preset badge-preset-active flex items-center gap-1.5">
                {resourceLabels[resource]}
                <button
                  type="button"
                  onClick={() => handleResourceToggle(filters.requiredResources.filter(r => r !== resource))}
                  className="ml-1 hover:text-[var(--color-brand-blue)]"
                  aria-label={`Remove ${resourceLabels[resource]} filter`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {filters.location?.label && (
              <span className="badge-preset badge-preset-active flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {filters.location.label}
                <button
                  type="button"
                  onClick={() => handleLocationChange('')}
                  className="ml-1 hover:text-[var(--color-brand-blue)]"
                  aria-label="Remove location filter"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange({ requiredResources: [] })}
              className="text-xs text-[var(--color-brand-blue)] hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5">
      {/* Desktop: Single row with 5 segments (removed district) */}
      <div className="hidden lg:flex lg:items-center gap-0">
        {/* Segment 0: Search by Hospital Name */}
        <div className="relative px-4 py-3 border-r border-[var(--color-border)] flex-1 min-w-0 max-w-xs">
          <HospitalNameSearch
            value={filters.query}
            onChange={query => onChange({ ...filters, query })}
            onSearch={handleSearchWithAutoLocation}
            placeholder="Search by name..."
          />
        </div>
        {/* Segment 1: Emergency Type */}
        <div className="relative px-4 py-3 border-r border-[var(--color-border)] flex-1 min-w-0">
          <CustomSelect
            label="Emergency Type"
            value={filters.emergencyType}
            options={emergencyPresets.map(p => ({ value: p.id, label: p.label }))}
            onChange={handleEmergencyTypeChange}
            icon={Stethoscope}
            placeholder="Select emergency type"
          />
        </div>

        {/* Segment 2: Hospital Category */}
        <div className="relative px-4 py-3 border-r border-[var(--color-border)] flex-1 min-w-0">
          <CustomSelect
            label="Hospital Category"
            value={filters.category}
            options={categoryOptions}
            onChange={handleCategoryChange}
            icon={Landmark}
            placeholder="Select category"
          />
        </div>

        {/* Segment 3: Required Resources */}
        <div className="relative px-4 py-3 border-r border-[var(--color-border)] flex-1 min-w-0">
          <MultiSelectDropdown
            label="Required Resources"
            selected={filters.requiredResources}
            options={resourceOptions}
            onChange={handleResourceToggle}
            icon={BriefcaseMedical}
            placeholder="Select resources"
          />
        </div>

        {/* Segment 4: Location (was Segment 5) */}
        <div className="relative px-4 py-3 border-r border-[var(--color-border)] flex-1 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Your Location</span>
              <div className="relative">
                <input
                  type="text"
                  value={filters.location?.label || ''}
                  onChange={e => handleLocationChange(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearchWithAutoLocation(); }}
                  onFocus={() => setIsLocationFocused(true)}
                  onBlur={() => setIsLocationFocused(false)}
                  placeholder="Your Location"
                  className="bg-transparent border-none text-[15px] font-medium w-full placeholder:text-[var(--color-text-muted)] focus:outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 transition-colors ${
                    isLocating ? 'text-[var(--color-brand-blue)] animate-spin' : 'text-[var(--color-text-muted)] hover:text-[var(--color-brand-blue)]'
                  }`}
                  aria-label="Use my current location"
                >
                  <Crosshair className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Segment 5: Search Button (was Segment 6) */}
        <div className="px-4 py-3 pl-6 shrink-0">
          <button
            type="button"
            onClick={handleSearchWithAutoLocation}
            className="btn-primary whitespace-nowrap cursor-pointer"
            aria-label="Search hospitals"
          >
            <Search className="w-5 h-5" />
            <span className="ml-2">Search</span>
          </button>
        </div>
      </div>

      {/* Tablet: 3x2 grid (adjusted to 3 columns without district) */}
      <div className="hidden md:grid lg:hidden md:grid-cols-3 gap-4">
        <div className="md:col-span-3 relative">
          <HospitalNameSearch
            value={filters.query}
            onChange={query => onChange({ ...filters, query })}
            onSearch={handleSearchWithAutoLocation}
          />
        </div>
        <div className="relative">
          <label htmlFor="emergency-type" className="field-label">Emergency Type</label>
          <CustomSelect
            label="Emergency Type"
            value={filters.emergencyType}
            options={emergencyPresets.map(p => ({ value: p.id, label: p.label }))}
            onChange={handleEmergencyTypeChange}
            icon={Stethoscope}
            placeholder="Select emergency type"
          />
        </div>

        <div className="relative">
          <label htmlFor="category" className="field-label">Hospital Category</label>
          <CustomSelect
            label="Hospital Category"
            value={filters.category}
            options={categoryOptions}
            onChange={handleCategoryChange}
            icon={Landmark}
            placeholder="Select category"
          />
        </div>

        <div className="md:col-span-3 relative">
          <label htmlFor="required-resources" className="field-label">Required Resources</label>
          <MultiSelectDropdown
            label="Required Resources"
            selected={filters.requiredResources}
            options={resourceOptions}
            onChange={handleResourceToggle}
            icon={BriefcaseMedical}
            placeholder="Select resources"
          />
        </div>

        <div className="md:col-span-3 relative">
          <label htmlFor="location" className="field-label">Your Location</label>
          <div className="relative">
            <MapPin className="field-icon" />
            <input
              id="location"
              type="text"
              value={filters.location?.label || ''}
              onChange={e => handleLocationChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearchWithAutoLocation(); }}
              onFocus={() => setIsLocationFocused(true)}
              onBlur={() => setIsLocationFocused(false)}
              placeholder="Your Location"
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-[var(--radius-sm)] transition-colors ${
                isLocating ? 'text-[var(--color-brand-blue)] animate-spin' : 'text-[var(--color-text-muted)] hover:text-[var(--color-brand-blue)]'
              }`}
              aria-label="Use my current location"
            >
              <Crosshair className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="md:col-span-3">
          <button
            type="button"
            onClick={handleSearchWithAutoLocation}
            className="btn-primary w-full h-[52px] cursor-pointer"
            aria-label="Search hospitals"
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Mobile: Single column stack */}
      <div className="md:hidden space-y-4">
        <HospitalNameSearch
          value={filters.query}
          onChange={query => onChange({ ...filters, query })}
          onSearch={handleSearchWithAutoLocation}
        />
        <div className="relative">
          <label htmlFor="emergency-type-mobile" className="field-label">Emergency Type</label>
          <CustomSelect
            label="Emergency Type"
            value={filters.emergencyType}
            options={emergencyPresets.map(p => ({ value: p.id, label: p.label }))}
            onChange={handleEmergencyTypeChange}
            icon={Stethoscope}
            placeholder="Select emergency type"
          />
        </div>

        <div className="relative">
          <label htmlFor="category-mobile" className="field-label">Hospital Category</label>
          <CustomSelect
            label="Hospital Category"
            value={filters.category}
            options={categoryOptions}
            onChange={handleCategoryChange}
            icon={Landmark}
            placeholder="Select category"
          />
        </div>

        <div className="relative">
          <label htmlFor="required-resources-mobile" className="field-label">Required Resources</label>
          <MultiSelectDropdown
            label="Required Resources"
            selected={filters.requiredResources}
            options={resourceOptions}
            onChange={handleResourceToggle}
            icon={BriefcaseMedical}
            placeholder="Select resources"
          />
        </div>

        <div className="relative">
          <label htmlFor="location-mobile" className="field-label">Your Location</label>
          <div className="relative">
            <MapPin className="field-icon" />
            <input
              id="location-mobile"
              type="text"
              value={filters.location?.label || ''}
              onChange={e => handleLocationChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearchWithAutoLocation(); }}
              onFocus={() => setIsLocationFocused(true)}
              onBlur={() => setIsLocationFocused(false)}
              placeholder="Your Location"
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-[var(--radius-sm)] transition-colors ${
                isLocating ? 'text-[var(--color-brand-blue)] animate-spin' : 'text-[var(--color-text-muted)] hover:text-[var(--color-brand-blue)]'
              }`}
              aria-label="Use my current location"
            >
              <Crosshair className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearchWithAutoLocation}
          className="btn-primary w-full h-[52px] cursor-pointer"
          aria-label="Search hospitals"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
      </div>

      {(filters.emergencyType || filters.requiredResources.length > 0 || filters.location?.label || filters.category || filters.query) && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">Active:</span>
          {filters.query && (
            <span className="badge-preset badge-preset-active flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              {filters.query}
              <button
                type="button"
                onClick={() => onChange({ ...filters, query: undefined })}
                className="ml-1 hover:text-[var(--color-brand-blue)]"
                aria-label="Remove search query"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.emergencyType && (
            <span className="badge-preset badge-preset-active flex items-center gap-1.5">
              {emergencyPresets.find(p => p.id === filters.emergencyType)?.label}
              <button
                type="button"
                onClick={() => handleEmergencyTypeChange(undefined)}
                className="ml-1 hover:text-[var(--color-brand-blue)]"
                aria-label="Remove emergency type filter"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.category && (
            <span className="badge-preset badge-preset-active flex items-center gap-1.5">
              {categoryOptions.find(o => o.value === filters.category)?.label}
              <button
                type="button"
                onClick={() => handleCategoryChange(undefined)}
                className="ml-1 hover:text-[var(--color-brand-blue)]"
                aria-label="Remove category filter"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.requiredResources.map(resource => (
            <span key={resource} className="badge-preset badge-preset-active flex items-center gap-1.5">
              {resourceLabels[resource]}
              <button
                type="button"
                onClick={() => handleResourceToggle(filters.requiredResources.filter(r => r !== resource))}
                className="ml-1 hover:text-[var(--color-brand-blue)]"
                aria-label={`Remove ${resourceLabels[resource]} filter`}
                >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          {filters.location?.label && (
            <span className="badge-preset badge-preset-active flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {filters.location.label}
              <button
                type="button"
                onClick={() => handleLocationChange('')}
                className="ml-1 hover:text-[var(--color-brand-blue)]"
                aria-label="Remove location filter"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => onChange({ requiredResources: [] })}
            className="text-xs text-[var(--color-brand-blue)] hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}