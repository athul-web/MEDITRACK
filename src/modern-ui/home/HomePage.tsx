import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SiteNavbar } from './SiteNavbar';
import { HeroSection } from './HeroSection';
import { FeatureStrip } from './FeatureStrip';
import { HospitalsSection } from './HospitalsSection';
import { EmergencyPanel } from './EmergencyPanel';
import { StaffPanel } from './StaffPanel';
import { DEMO_HOSPITALS } from '../data/demoHospitals';
import { useHospitals } from '../../hooks/useHospitals';
import { hospitalRepository } from '../../data/repositories/hospitalRepository';
import type { DemoHospital, QuickAccessTag } from '../types/hospital';
import type { Hospital as RealHospital } from '../../types/public';

function mapRealHospitalToDemo(h: RealHospital): DemoHospital {
  return {
    id: h.id,
    name: h.name,
    verified: h.verified,
    distanceKm: typeof h.distanceKm === 'number' ? h.distanceKm : null,
    driveMinutes: typeof h.durationMin === 'number' ? h.durationMin : null,
    address: h.address,
    imageUrl: h.image || 'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=360&h=360&fit=crop',
    phone: h.contact?.phone || h.phone1 || '',
    lat: h.coordinates?.latitude ?? 0,
    lng: h.coordinates?.longitude ?? 0,
    tags: [
      ...(h.resources.icu === 'available' ? ['ICU' as const] : []),
      ...(h.resources.ventilator === 'available' ? ['Ventilator' as const] : []),
      ...(h.resources.emergencyDepartment === 'available' ? ['Emergency' as const, '24/7 Trauma' as const] : []),
      ...(h.resources.ctScan === 'available' ? ['Oxygen' as const] : []),
    ],
    resources: [
      { label: 'ICU Beds', available: h.resources.icu === 'available' ? 8 : h.resources.icu === 'stale' ? 2 : 0, total: 10, tag: 'ICU' as const },
      { label: 'Ventilators', available: h.resources.ventilator === 'available' ? 6 : h.resources.ventilator === 'stale' ? 1 : 0, total: 8, tag: 'Ventilator' as const },
      { label: 'Oxygen', available: h.resources.ctScan === 'available' ? 18 : h.resources.ctScan === 'stale' ? 3 : 0, total: 20, tag: 'Oxygen' as const },
    ],
    lastUpdated: h.lastUpdated || new Date().toISOString(),
  };
}

export function HomePage() {
  const { hospitals: realHospitalData, search } = useHospitals();
  const [displayedHospitals, setDisplayedHospitals] = useState<DemoHospital[]>(DEMO_HOSPITALS);

  const mappedHospitals = useMemo(
    () => realHospitalData.map(mapRealHospitalToDemo),
    [realHospitalData]
  );

  useEffect(() => {
    if (mappedHospitals.length > 0) {
      setDisplayedHospitals(mappedHospitals);
    }
  }, [mappedHospitals]);

  // Geolocation is handled centrally by useHospitals.

  const handleSearch = async (query: string, tag: QuickAccessTag | null) => {
    const trimmed = query.trim();

    // When the user types (or leaves blank), re-query the backend so distances
    // can be measured from a typed place as well as the current GPS position.
    try {
      const results = await hospitalRepository.searchHospitals(
        {
          requiredResources: [],
          query: trimmed || undefined,
          location: trimmed ? { label: trimmed } : undefined,
        },
        'nearest'
      );

      const mapped = results.map(mapRealHospitalToDemo);
      let filtered = mapped.length > 0 ? mapped : (mappedHospitals.length > 0 ? mappedHospitals : DEMO_HOSPITALS);

      if (tag) {
        filtered = filtered.filter((h) => h.tags.includes(tag));
      }

      setDisplayedHospitals(filtered);
    } catch {
      // Fallback to the locally-filtered loaded list if the backend call fails.
      const baseHospitals = mappedHospitals.length > 0 ? mappedHospitals : DEMO_HOSPITALS;
      let filtered = [...baseHospitals];
      if (trimmed) {
        const q = trimmed.toLowerCase();
        filtered = filtered.filter(
          (h) =>
            h.name.toLowerCase().includes(q) ||
            h.address.toLowerCase().includes(q) ||
            h.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (tag) filtered = filtered.filter((h) => h.tags.includes(tag));
      setDisplayedHospitals(filtered);
    }

    // Smoothly scroll to the results section below
    const target = document.getElementById('hospitals');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden" style={{ background: '#F3F8FC' }}>
      {/* 1. Global Navigation Bar */}
      <SiteNavbar />

      {/* 2. Top Hero Section */}
      <main className="flex-1">
        <HeroSection onSearch={handleSearch} />

        {/* 3. Below The Fold Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Feature strip */}
          <FeatureStrip />

          {/* Main Content Layout: Left 68% Hospitals / Right 32% Side Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Hospital List & Filters */}
            <div className="lg:col-span-8 min-w-0">
              <HospitalsSection hospitals={displayedHospitals} />
            </div>

            {/* Right Column: Emergency Hotline & Staff Access */}
            <aside className="lg:col-span-4 min-w-0 flex flex-col gap-6 sticky top-24">
              <EmergencyPanel />
              <StaffPanel />
            </aside>
          </div>
        </div>
      </main>

      {/* 4. Footer */}
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
            <a href="#hero" className="hover:text-white transition-colors">
              Home
            </a>
            <a href="#hospitals" className="hover:text-white transition-colors">
              Hospitals
            </a>
            <a href="#hero" id="about" className="hover:text-white transition-colors">
              About
            </a>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="text-xs text-slate-400 text-center sm:text-right">
            © {new Date().getFullYear()} MediTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
