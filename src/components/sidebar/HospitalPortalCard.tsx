/**
 * Hospital Portal Widget Component
 * Per MediTrack UI Spec §12.2
 * Text block on top (65%), image at bottom (35%), no text overlapping image
 */

import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowRight } from 'lucide-react';

export function HospitalPortalCard() {
  return (
    <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)] bg-white">
      {/* Text block - top ~65% */}
      <div className="p-5 pb-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)]">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-[16px] font-bold text-[var(--color-text-primary)]">For Hospitals</h3>
        </div>
        <p className="text-[var(--text-body)] text-[var(--color-text-secondary)] leading-relaxed">
          Access your dashboard, manage resources and connect IoT devices.
        </p>
        <Link
          to="/login"
          className="btn-text w-fit mt-1"
        >
          Staff Login
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Image - bottom ~35%, full bleed, rounded bottom corners only */}
      <div className="relative h-[96px] bg-[var(--color-page)]">
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop"
          alt="Hospital staff at work"
          className="w-full h-full object-cover rounded-b-[var(--radius-md)]"
          loading="lazy"
        />
      </div>
    </div>
  );
}