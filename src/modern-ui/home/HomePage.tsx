import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteNavbar } from './SiteNavbar';
import { HeroSection } from './HeroSection';
import { FeatureStrip } from './FeatureStrip';
import { HospitalsSection } from './HospitalsSection';
import { EmergencyPanel } from './EmergencyPanel';
import { StaffPanel } from './StaffPanel';
import { DEMO_HOSPITALS } from '../data/demoHospitals';
import type { DemoHospital, QuickAccessTag } from '../types/hospital';

export function HomePage() {
  const [displayedHospitals, setDisplayedHospitals] = useState<DemoHospital[]>(DEMO_HOSPITALS);

  const handleSearch = (query: string, tag: QuickAccessTag | null) => {
    let filtered = [...DEMO_HOSPITALS];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (tag) {
      filtered = filtered.filter((h) => h.tags.includes(tag));
    }

    setDisplayedHospitals(filtered);

    // Smoothly scroll to the results section below
    const target = document.getElementById('hospitals');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: '#F3F8FC' }}>
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
            <div className="lg:col-span-8">
              <HospitalsSection hospitals={displayedHospitals} />
            </div>

            {/* Right Column: Emergency Hotline & Staff Access */}
            <aside className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
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
