import React, { useState } from 'react';
import { PublicHeader } from '../../../components/layout/PublicHeader';
import { PublicFooter } from '../../../components/layout/PublicFooter';
import { MobileNavigation } from '../../../components/layout/MobileNavigation';
import { SearchConsole } from '../../../components/hero/SearchConsole';
import { EmergencyPresets } from '../../../components/hero/EmergencyPresets';
import { HospitalList } from '../../../components/hospitals/HospitalList';
import { EmergencyCallout } from '../../../components/sidebar/EmergencyCallout';
import { HospitalPortalCard } from '../../../components/sidebar/HospitalPortalCard';
import { MottoCard } from '../../../components/sidebar/MottoCard';
import { emergencyPresets } from '../../../data/mock/emergencyTypes';
import { HospitalSearchFilters } from '../../../types/public';

export function HospitalsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<HospitalSearchFilters>({
    requiredResources: [],
  });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetClick = (presetId: string) => {
    const preset = emergencyPresets.find(p => p.id === presetId);
    if (!preset) return;

    if (selectedPreset === presetId) {
      setSelectedPreset(null);
      setSearchFilters(prev => ({ ...prev, requiredResources: [] }));
    } else {
      setSelectedPreset(presetId);
      setSearchFilters(prev => ({ ...prev, requiredResources: preset.resources }));
    }
  };

  const handleSearchChange = (filters: HospitalSearchFilters) => {
    setSearchFilters(filters);
    if (filters.requiredResources.length === 0 || filters.emergencyType) {
      setSelectedPreset(null);
    }
  };

  const searchConsoleAndPresets = (
    <>
      <SearchConsole
        filters={searchFilters}
        onChange={handleSearchChange}
      />
      <EmergencyPresets
        presets={emergencyPresets}
        selectedId={selectedPreset}
        onSelect={handlePresetClick}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <PublicHeader onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="flex-1">
        {/* Page Header Section - Based on gemini-code-1790186784755.html */}
        <div className="relative bg-gradient-to-r from-cyan-900 via-sky-800 to-slate-900 text-white overflow-hidden pb-12">
          {/* Background Image Overlay */}
          <div
            className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1600')" }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-widest">Directory & Live Status</span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
                  Hospital Resource Network
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl">
                  Browse verified medical facilities, check real-time ICU/Ventilator availability, and get direct directions.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl self-start sm:self-center">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-slate-100">Live Network Feed Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Sidebar: Filters -- Part of the search experience */}
            <aside className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="text-cyan-600">⚙️</span> Filter Hospitals
                  </h3>
                  <button
                    onClick={() => setSearchFilters({ requiredResources: [] })}
                    className="text-[11px] font-semibold text-cyan-700 hover:underline"
                  >
                    Reset
                  </button>
                </div>

                {/* Integrated Search Console for Filters */}
                <div className="space-y-6">
                  {searchConsoleAndPresets}
                </div>
              </div>
            </aside>

            {/* Right Column: Hospital Directory Cards */}
            <section className="lg:col-span-9 space-y-6">
              <HospitalList
                filters={searchFilters}
                onFiltersChange={handleSearchChange}
              />
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
