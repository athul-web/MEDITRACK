/**
 * Hero Section Component
 * Per MediTrack UI Spec §4
 * Two-column layout on desktop with headline + search + presets on left, hero image on right
 */

import { MapPin, Zap, Shield } from 'lucide-react';
import React from 'react';

interface HeroSectionProps {
  children?: React.ReactNode;
}

export function HeroSection({ children }: HeroSectionProps) {
  return (
    <div className="container-page">
      {/* Desktop: Two-column grid. Mobile: Single column (handled by responsive classes) */}
      <div className="grid lg:grid-cols-[1.05fr_1fr] gap-[48px] items-center">
        {/* Left Column: Headline + Search Console + Presets */}
        <div className="space-y-5 lg:pr-8">
          {/* Headline - Two lines with emphasis words in brand-blue */}
          <h1 className="text-[var(--text-hero)] font-bold text-[var(--color-text-primary)] leading-[1.15] tracking-tight text-left">
            <span>Find Nearby </span>
            <span className="text-[var(--color-brand-blue)]">Hospitals.</span>
            <br />
            <span>Get Real-Time </span>
            <span className="text-[var(--color-brand-blue)]">Resource Availability.</span>
          </h1>

          {/* Description */}
          <p className="text-[var(--text-body)] text-[var(--color-text-secondary)] max-w-[480px] leading-[1.6] text-left">
            MediTrack helps you quickly locate hospitals with verified emergency resources like ICU, ventilators, CT scans and more — when every second counts.
          </p>

          {/* Search Console and Presets - passed as children */}
          <div className="mt-8 lg:mt-0">
            {children}
          </div>
        </div>

        {/* Right Column: Hero Image with Decorative Callout */}
        <div className="relative lg:block hidden" aria-hidden="true">
          <div className="relative aspect-[4/3] rounded-[var(--radius-lg)] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop"
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
            {/* Dark scrim for callout legibility - subtle gradient at bottom right */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

            {/* Decorative Callout - Handwritten style, aria-hidden, positioned in bottom-right ~25% of image, overlapping edge slightly */}
            <div
              className="absolute bottom-[15%] right-[-10%] max-w-[50%] pointer-events-none"
              aria-hidden="true"
              style={{ fontFamily: '"Caveat", "Segoe Script", cursive' }}
            >
              <div className="text-white text-[22px] leading-snug font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                <div>Right hospital.</div>
                <div>Right resources.</div>
                <div className="relative inline-block">Faster care.<span className="absolute bottom-0 left-0 right-0 h-[1px] bg-white" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Hero Image - cropped 16:9, shown above headline on mobile per DESIGN.md §29 */}
        <div className="lg:hidden mb-6" aria-hidden="true">
          <div className="relative aspect-[16/9] rounded-[var(--radius-lg)] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop"
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </div>
  );
}