/**
 * Search Console Component
 * Per MediTrack UI Spec §5
 * Primary interaction - single horizontal row with 4 segments on desktop
 */

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Crosshair, Stethoscope, BriefcaseMedical, ChevronDown } from 'lucide-react';
import { HospitalSearchFilters, ResourceType } from '../../types/public';
import { emergencyPresets } from '../../data/mock/emergencyTypes';

interface SearchConsoleProps {
  filters: HospitalSearchFilters;
  onChange: (filters: HospitalSearchFilters) => void;
  variant?: 'horizontal' | 'vertical';
}

const resourceLabels: Record<ResourceType, string> = {
  emergencyDepartment: 'Emergency Dept',
  icu: 'ICU',
  ventilator: 'Ventilator',
  ctScan: 'CT Scan',
  blood: 'Blood',
};

// Single-select dropdown component for Emergency Type
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

  const displayValue = value
    ? options.find(o => o.value === value)?.label || value
    : placeholder;

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
            <span className={`text-[15px] font-medium truncate ${value ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
              {displayValue}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] overflow-hidden">
          <ul className="max-h-60 overflow-auto" role="listbox">
            {options.map(option => (
              <li key={option.value} role="option" aria-selected={value === option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
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

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const displayValue = selected.length > 0
    ? selected.map(v => options.find(o => o.value === v)?.label || v).join(', ')
    : placeholder;

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
        <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] overflow-hidden">
          <ul className="max-h-60 overflow-auto" role="listbox">
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

export function SearchConsole({ filters, onChange, variant = 'horizontal' }: SearchConsoleProps) {
  const [isLocationFocused, setIsLocationFocused] = useState(false);

  const handleEmergencyTypeChange = (emergencyType?: string) => {
    onChange({ ...filters, emergencyType });
  };

  const handleResourceToggle = (resources: string[]) => {
    onChange({ ...filters, requiredResources: resources as ResourceType[] });
  };

  const handleLocationChange = (label: string) => {
    onChange({ ...filters, location: { ...filters.location, label } });
  };

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          onChange({
            ...filters,
            location: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              label: 'Current Location',
            },
          });
        },
        () => {
          // Fallback or error handling
        }
      );
    }
  };

  const emergencyTypeOptions = emergencyPresets.map(p => ({ value: p.id, label: p.label }));
  const resourceOptions = Object.entries(resourceLabels).map(([value, label]) => ({ value, label }));

  if (variant === 'vertical') {
    return (
      <div className="space-y-4 w-full">
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
              onFocus={() => setIsLocationFocused(true)}
              onBlur={() => setIsLocationFocused(false)}
              placeholder="Your Location"
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-brand-blue)] transition-colors"
              aria-label="Use my current location"
            >
              <Crosshair className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          type="button"
          className="btn-primary w-full h-[52px]"
          aria-label="Search hospitals"
        >
          <Search className="w-5 h-5" />
          <span className="ml-2">Search</span>
        </button>
        {(filters.emergencyType || filters.requiredResources.length > 0 || filters.location?.label) && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)]">Active:</span>
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
      {/* Desktop: Single row with 4 segments */}
      <div className="hidden lg:flex lg:items-center gap-0 overflow-hidden">
        {/* Segment 1: Emergency Type - Custom Select Dropdown */}
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

        {/* Segment 2: Required Resources */}
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

        {/* Segment 3: Location */}
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
                  onFocus={() => setIsLocationFocused(true)}
                  onBlur={() => setIsLocationFocused(false)}
                  placeholder="Your Location"
                  className="bg-transparent border-none text-[15px] font-medium w-full placeholder:text-[var(--color-text-muted)] focus:outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-blue)] transition-colors"
                  aria-label="Use my current location"
                >
                  <Crosshair className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Segment 4: Search Button */}
        <div className="px-4 py-3 pl-6 shrink-0">
          <button
            type="button"
            className="btn-primary whitespace-nowrap"
            aria-label="Search hospitals"
          >
            <Search className="w-5 h-5" />
            <span className="ml-2">Search</span>
          </button>
        </div>
      </div>

      {/* Tablet: 2x2 grid */}
      <div className="lg:hidden md:grid md:grid-cols-2 gap-4">
        {/* Emergency Type - Custom Select */}
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

        {/* Required Resources */}
        <div className="relative">
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

        {/* Location */}
        <div className="md:col-span-2 relative">
          <label htmlFor="location" className="field-label">Your Location</label>
          <div className="relative">
            <MapPin className="field-icon" />
            <input
              id="location"
              type="text"
              value={filters.location?.label || ''}
              onChange={e => handleLocationChange(e.target.value)}
              onFocus={() => setIsLocationFocused(true)}
              onBlur={() => setIsLocationFocused(false)}
              placeholder="Your Location"
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-brand-blue)] transition-colors"
              aria-label="Use my current location"
            >
              <Crosshair className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Button - full width on tablet */}
        <div className="md:col-span-2">
          <button
            type="button"
            className="btn-primary w-full h-[52px]"
            aria-label="Search hospitals"
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Mobile: Single column stack */}
      <div className="md:hidden space-y-4">
        {/* Emergency Type - Custom Select */}
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

        {/* Required Resources */}
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

        {/* Location */}
        <div className="relative">
          <label htmlFor="location-mobile" className="field-label">Your Location</label>
          <div className="relative">
            <MapPin className="field-icon" />
            <input
              id="location-mobile"
              type="text"
              value={filters.location?.label || ''}
              onChange={e => handleLocationChange(e.target.value)}
              onFocus={() => setIsLocationFocused(true)}
              onBlur={() => setIsLocationFocused(false)}
              placeholder="Your Location"
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-brand-blue)] transition-colors"
              aria-label="Use my current location"
            >
              <Crosshair className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="button"
          className="btn-primary w-full h-[52px]"
          aria-label="Search hospitals"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
      </div>

      {/* Active Filters Display - shown on all breakpoints */}
      {(filters.emergencyType || filters.requiredResources.length > 0 || filters.location?.label) && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">Active:</span>
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