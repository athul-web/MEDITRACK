/**
 * Emergency Widget Component
 * Per MediTrack UI Spec §12.1
 * Background #E0EEF7, icon circle 44px bg brand-dark, CTA solid pill
 */

import { Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';

export function EmergencyCallout() {
  return (
    <div className="bg-[#E0EEF7] rounded-[var(--radius-md)] p-5 space-y-3.5">
      {/* Icon + Heading on same row */}
      <div className="flex items-center gap-3">
        <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-[var(--color-brand-dark)] text-white">
          <Activity className="w-5 h-5" />
        </div>
        <h3 className="text-[16px] font-bold text-[var(--color-text-primary)]">Emergency?</h3>
      </div>

      {/* Description */}
      <p className="text-[var(--text-body)] text-[var(--color-text-secondary)] leading-relaxed">
        Need immediate help? Call 108 or visit the nearest emergency department.
      </p>

      {/* CTA - solid pill button */}
      <Link
        to="/contact"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--color-brand-dark)] text-white text-[13px] font-semibold hover:bg-[var(--color-brand-navy)] transition-colors"
      >
        Emergency Contacts
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}