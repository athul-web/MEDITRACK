/**
 * Motto Widget Component
 * Per MediTrack UI Spec §12.3
 * Decorative quote mark, three deliberate lines, pulse SVG bottom-right
 */

import { Heart, HeartPulse } from 'lucide-react';

export function MottoCard() {
  return (
    <div className="bg-[var(--color-brand-light)] rounded-[var(--radius-md)] border border-[var(--color-border)] p-5 relative overflow-hidden">
      {/* Decorative pulse/heartbeat SVG - bottom right, low opacity */}
      <div className="absolute bottom-2 right-2 w-20 h-20 opacity-50 text-[var(--color-brand-blue)]">
        <HeartPulse className="w-full h-full" />
      </div>

      <blockquote className="relative z-10 space-y-1.5">
        {/* Large decorative opening quote mark */}
        <div className="flex items-start gap-1.5 text-[var(--color-brand-navy)]" aria-hidden="true">
          <span className="text-[32px] font-light leading-[0.6]">“</span>
          <Heart className="w-5 h-5 text-[var(--color-unavailable)] mt-1 flex-shrink-0" />
        </div>
        {/* Three deliberate lines with line breaks */}
        <div className="pl-10 text-[var(--text-body)] font-semibold text-[var(--color-text-primary)] leading-[1.5]">
          <p>Better information.</p>
          <p>Better decisions.</p>
          <p>More lives saved.</p>
        </div>
      </blockquote>
    </div>
  );
}