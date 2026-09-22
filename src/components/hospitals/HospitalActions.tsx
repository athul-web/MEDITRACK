/**
 * Hospital Actions Component
 * Per DESIGN.md §19
 * Call Hospital (primary) and View Details (secondary) buttons.
 */

import { Phone, ArrowRight } from 'lucide-react';

interface HospitalActionsProps {
  phone?: string;
  emergencyPhone?: string;
  onCall?: () => void;
  onViewDetails?: () => void;
}

export function HospitalActions({ phone, emergencyPhone, onCall, onViewDetails }: HospitalActionsProps) {
  const displayPhone = emergencyPhone || phone;

  return (
    <div className="flex flex-col sm:flex-row gap-2.5 pt-2.5 border-t border-[var(--color-border)]">
      {/* Call Hospital - Primary Action */}
      <button
        type="button"
        onClick={onCall}
        className="btn-secondary w-full sm:flex-1 justify-center gap-1.5 py-2 text-sm"
        aria-label={displayPhone ? `Call ${displayPhone}` : 'Call hospital'}
      >
        <Phone className="w-4 h-4" />
        <span>Call Hospital</span>
      </button>

      {/* View Details - Secondary Action */}
      <button
        type="button"
        onClick={onViewDetails}
        className="btn-ghost w-full sm:flex-1 justify-center gap-1.5 py-2 text-sm"
        aria-label="View hospital details"
      >
        <span>View Details</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {displayPhone && (
        <div className="text-center sm:text-left text-[11px] text-[var(--color-text-muted)] sm:col-span-2 pt-1">
          Emergency: <strong className="text-[var(--color-text-primary)]">{displayPhone}</strong>
        </div>
      )}
    </div>
  );
}