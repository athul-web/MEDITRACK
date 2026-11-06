import React, { useState } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  Building,
  Wind,
  Droplets,
  AlertCircle,
  X,
} from 'lucide-react';
import type { FilterState, DemoHospital } from '../types/hospital';

interface HospitalFilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  hospitals: DemoHospital[];
  className?: string;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export function HospitalFilterSidebar({
  filters,
  onChange,
  onReset,
  hospitals,
  className = '',
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: HospitalFilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    resources: true,
    availability: true,
    distance: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleResourceToggle = (type: 'ICU' | 'Ventilator' | 'Oxygen' | 'Emergency') => {
    const exists = filters.resourceTypes.includes(type);
    const updated = exists
      ? filters.resourceTypes.filter((t) => t !== type)
      : [...filters.resourceTypes, type];
    onChange({ ...filters, resourceTypes: updated });
  };

  const handleAvailabilityChange = (status: FilterState['availabilityStatus']) => {
    onChange({ ...filters, availabilityStatus: status });
  };

  const handleDistanceChange = (km: number | null) => {
    onChange({ ...filters, maxDistanceKm: km });
  };

  const activeCount =
    filters.resourceTypes.length +
    (filters.availabilityStatus !== 'all' ? 1 : 0) +
    (filters.maxDistanceKm !== null ? 1 : 0);

  const RESOURCE_OPTIONS: { id: 'ICU' | 'Ventilator' | 'Oxygen' | 'Emergency'; label: string; icon: React.ReactNode }[] = [
    { id: 'ICU', label: 'ICU Beds', icon: <Building size={14} className="text-[#087D91]" /> },
    { id: 'Ventilator', label: 'Ventilators', icon: <Wind size={14} className="text-[#087D91]" /> },
    { id: 'Oxygen', label: 'Medical Oxygen', icon: <Droplets size={14} className="text-[#087D91]" /> },
    { id: 'Emergency', label: '24/7 Emergency', icon: <AlertCircle size={14} className="text-[#DC2626]" /> },
  ];

  const DISTANCE_OPTIONS: { label: string; km: number | null }[] = [
    { label: 'Any Distance', km: null },
    { label: '< 5 km', km: 5 },
    { label: '< 10 km', km: 10 },
    { label: '< 15 km', km: 15 },
    { label: '< 25 km', km: 25 },
  ];

  return (
    <aside
      className={`bg-white rounded-2xl border border-[#D9E6EE] overflow-hidden ${className}`}
      style={{
        boxShadow: '0 2px 12px rgba(18, 43, 67, 0.04)',
      }}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#D9E6EE] flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#073B55]" />
          <h3 className="text-sm font-bold text-[#122B43] tracking-tight">Filter Hospitals</h3>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#073B55] text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold text-[#087D91] hover:text-[#073B55] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          {isMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              aria-label="Close filters drawer"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Category 1: Resource Type */}
        <div className="border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('resources')}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#60778C] hover:text-[#122B43] transition-colors py-1 cursor-pointer"
          >
            <span>Resource Type</span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                openSections.resources ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.resources && (
            <div className="mt-2.5 space-y-1.5">
              {RESOURCE_OPTIONS.map((opt) => {
                const checked = filters.resourceTypes.includes(opt.id);
                const matchCount = hospitals.filter((h) => h.tags.includes(opt.id)).length;

                return (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      checked
                        ? 'bg-[#E4F6FA] text-[#073B55] font-semibold border border-[#BCEBF5]'
                        : 'text-[#122B43] hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleResourceToggle(opt.id)}
                        className="rounded border-[#D9E6EE] text-[#073B55] focus:ring-[#00D5E8] cursor-pointer"
                      />
                      <span className="flex items-center gap-1.5">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#60778C] px-1.5 py-0.5 rounded bg-white/80 border border-slate-200/60">
                      {matchCount}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Category 2: Availability Status */}
        <div className="border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('availability')}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#60778C] hover:text-[#122B43] transition-colors py-1 cursor-pointer"
          >
            <span>Availability Status</span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                openSections.availability ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.availability && (
            <div className="mt-2.5 space-y-1.5">
              {[
                { id: 'all', label: 'All Statuses', desc: 'Show all facilities' },
                {
                  id: 'available',
                  label: 'Available Now',
                  desc: 'Adequate critical beds ready',
                  dot: 'bg-emerald-500',
                },
                {
                  id: 'limited',
                  label: 'Limited Capacity',
                  desc: 'Critical or low availability',
                  dot: 'bg-amber-500',
                },
              ].map((opt) => {
                const checked = filters.availabilityStatus === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                      checked
                        ? 'bg-[#E4F6FA] text-[#073B55] border border-[#BCEBF5]'
                        : 'text-[#122B43] hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name="availability"
                      checked={checked}
                      onChange={() => handleAvailabilityChange(opt.id as FilterState['availabilityStatus'])}
                      className="mt-0.5 text-[#073B55] focus:ring-[#00D5E8] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        {opt.dot && <span className={`w-2 h-2 rounded-full ${opt.dot}`} />}
                        <span>{opt.label}</span>
                      </div>
                      <span className="text-[10px] text-[#60778C] leading-tight block mt-0.5">
                        {opt.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Category 3: Distance Radius */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('distance')}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#60778C] hover:text-[#122B43] transition-colors py-1 cursor-pointer"
          >
            <span>Distance Radius</span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                openSections.distance ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.distance && (
            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              {DISTANCE_OPTIONS.map((opt) => {
                const isSelected = filters.maxDistanceKm === opt.km;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleDistanceChange(opt.km)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#073B55] text-white shadow-xs'
                        : 'bg-slate-50 text-[#60778C] border border-[#D9E6EE] hover:border-[#087D91] hover:text-[#073B55]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Bottom Apply Button */}
      {isMobileDrawer && (
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#073B55] hover:bg-[#052F4B] transition-colors shadow-xs cursor-pointer"
          >
            Apply Filters ({activeCount})
          </button>
        </div>
      )}
    </aside>
  );
}