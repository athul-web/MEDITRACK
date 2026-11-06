import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Building,
  RotateCcw,
  CheckCircle2,
  X,
  ShieldCheck,
  Activity,
  Heart,
  Phone,
} from 'lucide-react';
import { SiteNavbar } from '../home/SiteNavbar';
import { HospitalDirectoryCard } from './HospitalDirectoryCard';
import { HospitalFilterSidebar } from './HospitalFilterSidebar';
import { HospitalDetailsModal } from './HospitalDetailsModal';
import { useHospitals } from '../../hooks/useHospitals';
import type { DemoHospital, SortOption, FilterState } from '../types/hospital';
import './hospitals.css';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'Nearest', label: 'Nearest First' },
  { id: 'Farthest', label: 'Farthest First' },
  { id: 'Highest Availability', label: 'Highest Availability' },
  { id: 'Recently Updated', label: 'Recently Updated' },
];

const DEFAULT_FILTERS: FilterState = {
  resourceTypes: [],
  availabilityStatus: 'all',
  maxDistanceKm: null,
  district: null,
};

export function HospitalsPage() {
  const { hospitals: realHospitalData, isLoading, error } = useHospitals();

  const mappedHospitals = React.useMemo(() => realHospitalData.map((h) => ({
    id: h.id,
    name: h.name,
    verified: h.verified,
    distanceKm: typeof h.distanceKm === "number" ? h.distanceKm : null,
    driveMinutes: typeof h.durationMin === "number" ? h.durationMin : null,
    address: h.address,
    district: h.district,
    imageUrl: h.image || "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=360&h=360&fit=crop",
    phone: h.contact?.phone || h.phone1 || "",
    lat: h.coordinates?.latitude ?? 0,
    lng: h.coordinates?.longitude ?? 0,
    tags: [],
    resources: [
      { label: "ICU Beds", available: 0, total: 0, tag: "ICU" as const },
      { label: "Ventilators", available: 0, total: 0, tag: "Ventilator" as const },
      { label: "Oxygen", available: 0, total: 0, tag: "Oxygen" as const },
    ],
    lastUpdated: h.lastUpdated || new Date().toISOString(),
  })), [realHospitalData]);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('Nearest');
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<DemoHospital | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // Filter and sort hospitals
  const filteredAndSortedHospitals = useMemo(() => {
    let list = [...mappedHospitals];

    // Filter by resource types
    if (filters.resourceTypes.length > 0) {
      list = list.filter((h) =>
        filters.resourceTypes.every((type) => h.tags.includes(type))
      );
    }

    // Filter by availability status
    if (filters.availabilityStatus === 'available') {
      list = list.filter((h) => {
        const icu = h.resources.find((r) => r.tag === 'ICU');
        return icu ? icu.available > 3 : true;
      });
    } else if (filters.availabilityStatus === 'limited') {
      list = list.filter((h) => {
        const icu = h.resources.find((r) => r.tag === 'ICU');
        return icu ? icu.available <= 3 : false;
      });
    }

    // Filter by district
    if (filters.district) {
      list = list.filter((h) => h.district === filters.district);
    }

    // Filter by distance
    if (filters.district) {
    activeChips.push({
      id: 'district-' + filters.district,
      label: 'District: ' + filters.district,
      onRemove: () => handleFilterChange({ ...filters, district: null }),
    });
  }

  if (filters.maxDistanceKm !== null) {
      list = list.filter((h) => (h.distanceKm ?? Infinity) <= (filters.maxDistanceKm as number));
    }

    // Sorting
    if (sortBy === 'Nearest') {
      list.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    } else if (sortBy === 'Farthest') {
      list.sort((a, b) => b.distanceKm - a.distanceKm);
    } else if (sortBy === 'Highest Availability') {
      list.sort((a, b) => {
        const totalA = a.resources.reduce((sum, r) => sum + r.available, 0);
        const totalB = b.resources.reduce((sum, r) => sum + r.available, 0);
        return totalB - totalA;
      });
    } else if (sortBy === 'Recently Updated') {
      list.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }

    return list;
  }, [filters, sortBy, mappedHospitals]);

  // Paginated calculations
  const totalCount = filteredAndSortedHospitals.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const currentHospitals = filteredAndSortedHospitals.slice(startIndex, endIndex);

  // Active filter removable chips
  const activeChips: { id: string; label: string; onRemove: () => void }[] = [];

  filters.resourceTypes.forEach((type) => {
    activeChips.push({
      id: `resource-${type}`,
      label: type === 'ICU' ? 'ICU Beds' : type === 'Emergency' ? '24/7 Emergency' : type,
      onRemove: () => {
        handleFilterChange({
          ...filters,
          resourceTypes: filters.resourceTypes.filter((t) => t !== type),
        });
      },
    });
  });

  if (filters.availabilityStatus === 'available') {
    activeChips.push({
      id: 'avail-available',
      label: 'Status: Available Now',
      onRemove: () => handleFilterChange({ ...filters, availabilityStatus: 'all' }),
    });
  } else if (filters.availabilityStatus === 'limited') {
    activeChips.push({
      id: 'avail-limited',
      label: 'Status: Limited Capacity',
      onRemove: () => handleFilterChange({ ...filters, availabilityStatus: 'all' }),
    });
  }

  if (filters.maxDistanceKm !== null) {
    activeChips.push({
      id: `dist-${filters.maxDistanceKm}`,
      label: `Within ${filters.maxDistanceKm} km`,
      onRemove: () => handleFilterChange({ ...filters, maxDistanceKm: null }),
    });
  }

  if (isLoading) {
    return (
      <div className="hospitals-page min-h-screen flex items-center justify-center" style={{ background: '#F3F8FC' }}>
        <p>Loading hospitals...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="hospitals-page min-h-screen flex items-center justify-center" style={{ background: '#F3F8FC' }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="hospitals-page min-h-screen flex flex-col font-sans" style={{ background: '#F3F8FC' }}>
      {/* 1. Global Navigation Bar */}
      <SiteNavbar />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          {/* 1. Page Title & Intro */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#087D91]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#087D91]">
                  Regional Directory
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#122B43] tracking-tight">
                Hospital Resource Network
              </h1>
              <p className="text-sm text-[#60778C] max-w-2xl mt-1">
                Real-time critical resource telemetry across verified medical centres in Kerala. Find live ICU beds, ventilators, medical oxygen, and 24/7 trauma departments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="text-xs font-semibold text-[#073B55] hover:text-[#087D91] transition-colors bg-white px-3.5 py-2 rounded-xl border border-[#D9E6EE] shadow-2xs"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* 3. MAIN DIRECTORY LAYOUT: Left Filter Sidebar & Right Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Filter Hospitals Sidebar (Desktop Left Column) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-24">
              <HospitalFilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
                hospitals={mappedHospitals}
              />
            </div>

            {/* Nearby Hospitals Listing Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Controls Bar: Results Counter, Mobile Filter Toggle, Sort Dropdown */}
              <div className="bg-white rounded-2xl border border-[#D9E6EE] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                {/* Dynamic Result Count & Mobile Filter Button */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E4F6FA] text-[#073B55] border border-[#BCEBF5] hover:bg-[#D4F0F7] cursor-pointer transition-colors"
                  >
                    <SlidersHorizontal size={14} />
                    <span>Filters {activeChips.length > 0 && `(${activeChips.length})`}</span>
                  </button>

                  <div className="text-xs font-semibold text-[#60778C]">
                    {totalCount > 0 ? (
                      <span>
                        Showing <strong className="text-[#122B43]">{startIndex + 1}–{endIndex}</strong> of{' '}
                        <strong className="text-[#122B43]">{totalCount}</strong> verified hospitals
                      </span>
                    ) : (
                      <span>0 hospitals match the selected filters</span>
                    )}
                  </div>
                </div>

                {/* District filter */}
                {/* District filter */}
                <select
                  aria-label="District"
                  value={filters.district ?? ''}
                  onChange={(e) => handleFilterChange({ ...filters, district: e.target.value || null })}
                  className="bg-slate-50 border border-[#D9E6EE] rounded-lg text-xs font-semibold text-[#122B43] px-2 py-1 focus:ring-1 focus:ring-[#00D5E8] cursor-pointer"
                >
                  <option value="">All Districts</option>
                  {Array.from(new Set(mappedHospitals.map(h=>h.district))).sort().map(d=>(
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {/* Sorting and Page Size Controls */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#60778C]">
                    <span>Show:</span>
                    <select
                      aria-label="Items per page"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-slate-50 border border-[#D9E6EE] rounded-lg text-xs font-semibold text-[#122B43] px-2 py-1 focus:ring-1 focus:ring-[#00D5E8] cursor-pointer"
                    >
                      <option value={4}>4</option>
                      <option value={6}>6</option>
                      <option value={8}>8</option>
                    </select>
                  </div>

                  {/* Unified Sorting Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSortOpen(!sortOpen)}
                      aria-expanded={sortOpen}
                      aria-haspopup="listbox"
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#D9E6EE] bg-white text-xs font-bold text-[#122B43] hover:border-[#073B55] transition-colors cursor-pointer shadow-2xs"
                    >
                      <span className="text-[#60778C] font-normal">Sort by:</span>
                      <span>{SORT_OPTIONS.find((s) => s.id === sortBy)?.label}</span>
                      <ChevronDown size={14} className="text-slate-400" />
                    </button>

                    {sortOpen && (
                      <div
                        role="listbox"
                        className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-[#D9E6EE] py-1 z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            role="option"
                            aria-selected={sortBy === opt.id}
                            onClick={() => {
                              setSortBy(opt.id);
                              setSortOpen(false);
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                              sortBy === opt.id
                                ? 'bg-[#E4F6FA] text-[#073B55] font-bold'
                                : 'text-[#60778C] hover:bg-slate-50 hover:text-[#122B43]'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {sortBy === opt.id && <CheckCircle2 size={13} className="text-[#087D91]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Removable Filter Chips */}
              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 py-1">
                  <span className="text-xs text-[#60778C] font-semibold">Active Filters:</span>
                  {activeChips.map((chip) => (
                    <span
                      key={chip.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6FA] text-[#073B55] border border-[#BCEBF5]"
                    >
                      <span>{chip.label}</span>
                      <button
                        type="button"
                        onClick={chip.onRemove}
                        aria-label={`Remove filter ${chip.label}`}
                        className="hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-[#087D91] hover:underline ml-1 cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Hospital Cards Stack */}
              <div className="space-y-4">
                {currentHospitals.length > 0 ? (
                  currentHospitals.map((hospital) => (
                    <HospitalDirectoryCard
                      key={hospital.id}
                      hospital={hospital}
                      onViewDetails={(h) => setSelectedHospital(h)}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border border-[#D9E6EE] p-12 text-center shadow-xs">
                    <Building size={40} className="text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#122B43] mb-1">
                      No matching hospitals found
                    </h3>
                    <p className="text-xs text-[#60778C] max-w-sm mx-auto mb-4">
                      No facilities match your active resource, status, or distance filters. Try resetting the filters to browse all hospitals.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#073B55] hover:bg-[#052F4B] transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
                    >
                      <RotateCcw size={13} />
                      <span>Reset Filters</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Intuitive Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-white rounded-2xl border border-[#D9E6EE] p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="text-xs text-[#60778C]">
                    Page <strong className="text-[#122B43]">{currentPage}</strong> of{' '}
                    <strong className="text-[#122B43]">{totalPages}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9E6EE] text-xs font-semibold text-[#122B43] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={14} />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#073B55] text-white shadow-xs'
                                : 'text-[#60778C] hover:bg-slate-100 hover:text-[#122B43]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9E6EE] text-xs font-semibold text-[#122B43] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Drawer Filter Dialog */}
      {mobileFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200"
          >
            <HospitalFilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              hospitals={mappedHospitals}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Hospital Full Details Modal */}
      <HospitalDetailsModal
        hospital={selectedHospital}
        onClose={() => setSelectedHospital(null)}
      />

      {/* Site Footer */}
      <footer
        id="contact"
        className="py-10 text-white mt-auto border-t border-slate-700/50"
        style={{ background: '#052F4B' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#087D91]/40 border border-[#19D5E5] flex items-center justify-center">
              <span className="text-[#19D5E5] font-black text-sm">+</span>
            </div>
            <div>
              <div className="font-bold text-sm text-white">MediTrack</div>
              <div className="text-[11px] text-[#19D5E5]">
                Emergency Resources | When It Matters
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/hospitals" className="text-white font-semibold transition-colors">
              Hospitals
            </Link>
            <Link to="/#about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>

          <div className="text-xs text-slate-400 text-center sm:text-right">
            © {new Date().getFullYear()} MediTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}