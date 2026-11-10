import React from 'react';
import { HospitalSearchPanel } from './HospitalSearchPanel';
import { HeroCrossScene } from './HeroCrossScene';
import { HeroFlowingWaves } from './HeroFlowingWaves';
import { MinimalEcgLine } from './MinimalEcgLine';
import type { QuickAccessTag } from '../types/hospital';

interface HeroSectionProps {
  onSearch: (query: string, tag: QuickAccessTag | null) => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative min-h-[700px] lg:min-h-[760px] flex flex-col justify-center overflow-hidden pt-20 pb-12"
      style={{
        backgroundColor: '#001525',
      }}
    >
      {/* 1. Deep Multi-Layer Gradient Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 75% 45%, rgba(0, 36, 58, 0.95) 0%, transparent 80%),
            radial-gradient(circle 420px at 80% 40%, rgba(0, 213, 232, 0.14) 0%, transparent 70%),
            radial-gradient(circle 500px at 15% 85%, rgba(0, 48, 77, 0.55) 0%, transparent 75%),
            radial-gradient(circle 350px at 90% 10%, rgba(0, 191, 208, 0.08) 0%, transparent 60%),
            linear-gradient(135deg, #001525 0%, #001C30 50%, #001525 100%)
          `,
        }}
      />

      {/* 2. Very faint background medical plus symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20">
        <svg
          viewBox="0 0 1200 800"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Faint Plus 1 (top-left) */}
          <g transform="translate(140, 120)" opacity="0.4" className="hero-faint-cross-1">
            <rect x="18" y="0" width="8" height="44" rx="2" fill="#00D5E8" />
            <rect x="0" y="18" width="44" height="8" rx="2" fill="#00D5E8" />
          </g>

          {/* Faint Plus 2 (mid-left behind text) */}
          <g transform="translate(80, 420)" opacity="0.25" className="hero-faint-cross-2">
            <rect x="12" y="0" width="6" height="30" rx="1.5" fill="#00BFD0" />
            <rect x="0" y="12" width="30" height="6" rx="1.5" fill="#00BFD0" />
          </g>

          {/* Faint Plus 3 (top-right ambient) */}
          <g transform="translate(1050, 90)" opacity="0.3" className="hero-faint-cross-1">
            <rect x="22" y="0" width="10" height="54" rx="3" fill="#00D5E8" />
            <rect x="0" y="22" width="54" height="10" rx="3" fill="#00D5E8" />
          </g>

          {/* Faint Plus 4 (lower-right) */}
          <g transform="translate(1120, 520)" opacity="0.25" className="hero-faint-cross-2">
            <rect x="14" y="0" width="6" height="34" rx="2" fill="#007F95" />
            <rect x="0" y="14" width="34" height="6" rx="2" fill="#007F95" />
          </g>
        </svg>
      </div>

      {/* 3. Bottom Abstract Flowing Wave Layers */}
      <HeroFlowingWaves />

      {/* 4. Minimal ECG Heartbeat Waveform with Traveling Cyan Glowing Dot */}
      <MinimalEcgLine />

      {/* 5. Main Hero Content Layout */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-8">
        <div className="relative flex flex-col lg:flex-row items-start justify-between">
          {/* Left Column: Heading + Description + Search Panel positioned directly below (40-48px gap) */}
          <div className="w-full lg:max-w-3xl z-20 flex flex-col items-start">
            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.08] tracking-tight text-white mb-4">
              Find Nearby Hospitals.
              <br />
              <span style={{ color: '#00D5E8' }}>Get Real-Time Resource</span>
              <br />
              Availability.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed max-w-xl">
              MediTrack helps you quickly locate hospitals with verified emergency resources
              like ICU, ventilator, diffience and more — when every second counts.
            </p>

            {/* Search Container: Positioned directly below description */}
            <div className="w-full mt-7 sm:mt-11">
              <HospitalSearchPanel onSearch={onSearch} />
            </div>
          </div>

          {/* Right Column: Orbital Rings positioned in the top-right corner */}
          <div className="w-full lg:w-auto lg:absolute lg:right-0 lg:top-[-20px] flex justify-center lg:justify-end shrink-0 pointer-events-none z-10 mt-8 lg:mt-0">
            <HeroCrossScene />
          </div>
        </div>
      </div>
    </section>
  );
}
