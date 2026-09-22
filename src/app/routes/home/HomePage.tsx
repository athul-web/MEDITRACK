/**
 * MediTrack Public Homepage
 * Main entry point for the public-facing emergency resource discovery platform.
 * Per MediTrack UI Spec §1 - Page Structure & Section Hierarchy
 */

import { useState } from 'react';
import { PublicHeader } from '../../../components/layout/PublicHeader';
import { PublicFooter } from '../../../components/layout/PublicFooter';
import { MobileNavigation } from '../../../components/layout/MobileNavigation';
import { HeroSection } from '../../../components/hero/HeroSection';
import { SearchConsole } from '../../../components/hero/SearchConsole';
import { EmergencyPresets } from '../../../components/hero/EmergencyPresets';
import { FeatureGrid } from '../../../components/features/FeatureGrid';
import { HospitalList } from '../../../components/hospitals/HospitalList';
import { EmergencyCallout } from '../../../components/sidebar/EmergencyCallout';
import { HospitalPortalCard } from '../../../components/sidebar/HospitalPortalCard';
import { MottoCard } from '../../../components/sidebar/MottoCard';
import { emergencyPresets } from '../../../data/mock/emergencyTypes';
import { HospitalSearchFilters, ResourceType } from '../../../types/public';

export function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<HospitalSearchFilters>({
    requiredResources: [],
  });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetClick = (presetId: string) => {
    const preset = emergencyPresets.find(p => p.id === presetId);
    if (!preset) return;

    // Toggle preset
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
    // Clear preset selection when user manually changes filters
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
    <div className="min-h-screen bg-[var(--color-page)] flex flex-col">
      <PublicHeader onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="flex-1">
        {/* 1. Hero Section - full-bleed brand-light background */}
        <section className="relative bg-[var(--color-brand-light)] pt-[64px] pb-0 lg:pb-0">
          <HeroSection>{searchConsoleAndPresets}</HeroSection>
        </section>

        {/* 2. Feature Value Bar - page-bg background, sits directly below hero */}
        <section className="bg-[var(--color-page)]">
          <FeatureGrid />
        </section>

        {/* 3. Main Content Grid - Hospital Results + Sidebar */}
        <section className="bg-[var(--color-page)] py-[40px]">
          <div className="container-page">
            <div className="grid lg:grid-cols-[1fr_340px] gap-[32px] items-start">
              {/* Left column: Hospital Results */}
              <div>
                <HospitalList
                  filters={searchFilters}
                  onFiltersChange={handleSearchChange}
                />
              </div>

              {/* Right column: Sidebar - sticky on desktop ≥1280px */}
              <aside className="hidden lg:block sticky top-[88px] space-y-5">
                <EmergencyCallout />
                <HospitalPortalCard />
                <MottoCard />
              </aside>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}