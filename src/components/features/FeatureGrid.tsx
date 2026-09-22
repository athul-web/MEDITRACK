/**
 * Feature Value Bar Component
 * Per MediTrack UI Spec §7
 * 4-column horizontal grid, no card backgrounds/borders - just icon circles + text
 */

import { Zap, MapPin, Shield, Phone } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Real-Time Availability',
    description: 'See live resource status with freshness timestamps.',
  },
  {
    icon: MapPin,
    title: 'Nearby Hospitals',
    description: 'Find the closest verified hospitals in your area.',
  },
  {
    icon: Shield,
    title: 'Verified & Reliable',
    description: 'Only trusted hospitals with real-time data.',
  },
  {
    icon: Phone,
    title: 'Direct Contact',
    description: 'Get call details and directions instantly.',
  },
];

export function FeatureGrid() {
  return (
    <div className="container-page py-[40px] bg-[var(--color-page)]">
      {/* Desktop: 4-column grid */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-[32px]">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-[14px]">
            {/* Icon circle: 44x44px, rounded-full, bg brand-light, icon 20px brand-blue */}
            <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand-blue)]">
              <feature.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary)]">{feature.title}</h3>
              <p className="text-[var(--text-meta)] text-[var(--color-text-secondary)] leading-[1.5] mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tablet: 2x2 grid */}
      <div className="lg:hidden md:grid md:grid-cols-2 gap-y-[24px] gap-x-[32px]">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-[14px]">
            <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand-blue)]">
              <feature.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary)]">{feature.title}</h3>
              <p className="text-[var(--text-meta)] text-[var(--color-text-secondary)] leading-[1.5] mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Single column stack */}
      <div className="md:hidden space-y-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-[12px]">
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand-blue)]">
              <feature.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary)]">{feature.title}</h3>
              <p className="text-[var(--text-meta)] text-[var(--color-text-secondary)] leading-[1.5] mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}