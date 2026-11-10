import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HospitalDetailsModal } from '../hospitals/HospitalDetailsModal';
import { BackToTopButton } from '../common/BackToTopButton';
import type { DemoHospital as DemoHospitalType } from '../types/hospital';
import {
  MapPin,
  ChevronDown,
  LayoutGrid,
  Wind,
  Droplets,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { HospitalCard } from './HospitalCard';
import type { DemoHospital, ResourceFilter, SortOption } from '../types/hospital';

interface HospitalsSectionProps {
  hospitals: DemoHospital[];
}

const FILTER_TABS: { id: ResourceFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'All', label: 'All', icon: <LayoutGrid size={14} /> },
  { id: 'ICU', label: 'ICU', icon: <Building size={14} /> },
  { id: 'Ventilator', label: 'Ventilator', icon: <Wind size={14} /> },
  { id: 'Oxygen', label: 'Oxygen', icon: <Droplets size={14} /> },
  { id: 'Emergency', label: 'Emergency', icon: <AlertTriangle size={14} /> },
];

const SORT_OPTIONS: SortOption[] = ['Nearest', 'Farthest', 'Recently Updated'];

export function HospitalsSection({ hospitals }: HospitalsSectionProps) {
  const [activeTab, setActiveTab] = useState<ResourceFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('Nearest');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<DemoHospitalType | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const fifthTileRef = useRef<HTMLDivElement>(null);

  // Apply filtering by tab & sorting
  const processedHospitals = useMemo(() => {
    let list = [...hospitals];

    if (activeTab !== 'All') {
      list = list.filter((h) => h.tags.includes(activeTab));
    }

    const dist = (value: number | undefined) => (typeof value === 'number' ? value : Number.POSITIVE_INFINITY);
    if (sortBy === 'Nearest') {
      list.sort((a, b) => dist(a.distanceKm) - dist(b.distanceKm));
    } else if (sortBy === 'Farthest') {
      list.sort((a, b) => dist(b.distanceKm) - dist(a.distanceKm));
    } else if (sortBy === 'Recently Updated') {
      list.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }

    return list;
  }, [hospitals, activeTab, sortBy]);

  useEffect(() => {
    const handleScroll = () => {
      if (!fifthTileRef.current) {
        setShowBackToTop(false);
        return;
      }
      const rect = fifthTileRef.current.getBoundingClientRect();
      // Pops up when the user scrolls past the 5th tile (tile 5 top is above viewport mid/top)
      setShowBackToTop(rect.top < 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [processedHospitals]);

  return (
    <section id="hospitals" className="scroll-mt-24">
      {/* Header with Title and Sort control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={22} className="text-[#073B55]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#122B43] tracking-tight">
              Nearby Hospitals
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#60778C] pl-7">
            Hospitals near your location with available resources
          </p>
        </div>

        {/* Sort by dropdown */}
        <div className="relative pl-7 sm:pl-0 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#60778C]">
            <span>Sort by:</span>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9E6EE] bg-white text-xs font-bold text-[#122B43] shadow-xs cursor-pointer hover:border-[#073B55] transition-colors"
            >
              <span>{sortBy}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>

          {sortOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-[#D9E6EE] py-1 z-30 overflow-hidden"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSortBy(opt);
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    sortBy === opt
                      ? 'bg-[#E4F6FA] text-[#073B55] font-bold'
                      : 'text-[#60778C] hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter tab pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#073B55] text-white shadow-sm'
                  : 'bg-white text-[#60778C] border border-[#D9E6EE] hover:border-[#087D91]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hospital Card List */}
      <div className="flex flex-col gap-4">
        {processedHospitals.length > 0 ? (
          processedHospitals.map((hospital, index) => (
            <div
              key={hospital.id}
              ref={index === 4 ? fifthTileRef : undefined}
            >
              <HospitalCard hospital={hospital} onViewDetails={setSelectedHospital} />
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[22px] border border-[#D9E6EE] p-12 text-center">
            <Building size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#122B43] mb-1">
              No hospitals found matching your filter.
            </p>
            <p className="text-xs text-[#60778C]">
              Try clearing your search query or selecting a different resource tag.
            </p>
            <button
              onClick={() => setActiveTab('All')}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#073B55] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <HospitalDetailsModal hospital={selectedHospital} onClose={() => setSelectedHospital(null)} />
      <BackToTopButton visible={showBackToTop} />
    </section>
  );
}
