/**
 * Hospital Card Component
 * Per MediTrack UI Spec §10
 * 3-column grid on desktop: Image (96px) | Content (1fr) | Actions (200px)
 */

import { Hospital } from '../../types/public';
import { CheckCircle2, MapPin, Clock, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { ResourceStatusGrid } from './ResourceStatusGrid';

interface HospitalCardProps {
  hospital: Hospital;
  onViewDetails?: () => void;
  onCall?: () => void;
}

export function HospitalCard({ hospital, onViewDetails, onCall }: HospitalCardProps) {
  const formatDistance = (km?: number) => {
    if (!km) return '';
    return km < 1 ? `${Math.round(km * 1000)} m away` : `${km} km away`;
  };

  const formatAddress = (hospital: Hospital) => {
    return `${hospital.address}, ${hospital.city}, ${hospital.state}`;
  };

  // Determine if data is stale (>30 minutes)
  // Parse "X mins ago" or "X hours ago" format from mock data
  const isStale = (() => {
    const match = hospital.lastUpdated.match(/(\d+)\s*(min|hour)s?\s*ago/i);
    if (!match) return false;
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const minutes = unit.startsWith('hour') ? value * 60 : value;
    return minutes > 30;
  })();

  return (
    <article className="card-surface card-surface-hover overflow-hidden" role="listitem">
      {/* Desktop: 3-column grid. Tablet: Image + Content stacked, Actions horizontal below. Mobile: Full vertical stack. */}
      <div className="grid lg:grid-cols-[96px_1fr_200px] gap-5 items-start p-5">
        {/* Column A: Image - 96x96px, radius-sm */}
        <div className="relative lg:h-[96px] w-full lg:w-[96px] lg:flex-shrink-0">
          <div className="relative h-full w-full rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-page)]">
            {hospital.image ? (
              <img
                src={hospital.image}
                alt={`${hospital.name} building exterior`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
            {/* Verified Badge - top right */}
            {hospital.verified && (
              <div className="absolute top-2 right-2" aria-label="Verified hospital">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-brand-blue)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column B: Identity + Resource Grid */}
        <div className="min-w-0 lg:col-span-1 space-y-3">
          {/* Name row: name + verified badge inline */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-[var(--text-hospital-name)] font-semibold text-[var(--color-text-primary)] line-clamp-1">
              {hospital.name}
            </h3>
            {hospital.verified && (
              <span className="inline-flex items-center gap-1.5" aria-label="Verified hospital">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-brand-blue)]">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              </span>
            )}
          </div>

          {/* Distance row */}
          {hospital.distanceKm && (
            <div className="flex items-center gap-1.5 text-[var(--text-meta)] text-[var(--color-text-secondary)]">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-text-muted)]" />
              <span className="font-medium text-[var(--color-brand-navy)]">{formatDistance(hospital.distanceKm)}</span>
            </div>
          )}

          {/* Address row */}
          <div className="flex items-center gap-1.5 text-[var(--text-meta)] text-[var(--color-text-secondary)]">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-text-muted)]" />
            <span className="truncate">{formatAddress(hospital)}</span>
          </div>

          {/* Last updated row - pill/badge */}
          <div className="inline-flex items-center gap-1.5">
            <span className={`badge-updated ${isStale ? 'badge-updated-stale' : ''}`}>
              {isStale ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  Data may be outdated
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  Last updated {hospital.lastUpdated}
                </>
              )}
            </span>
          </div>

          {/* Resource Status Grid - 2-column grid within Column B */}
          <ResourceStatusGrid resources={hospital.resources} size="sm" />
        </div>

        {/* Column C: Actions - 200px, right-aligned, stacked vertically */}
        <div className="hidden lg:flex lg:flex-col lg:items-stretch lg:w-[200px] lg:justify-start gap-2">
          {/* Call Hospital - Primary Action */}
          <button
            type="button"
            onClick={onCall}
            className="btn-secondary-filled w-full justify-center gap-2"
            aria-label={hospital.contact.emergencyPhone || hospital.contact.phone ? `Call ${hospital.contact.emergencyPhone || hospital.contact.phone}` : 'Call hospital'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Call Hospital</span>
          </button>

          {/* View Details → - Secondary Action */}
          <button
            type="button"
            onClick={onViewDetails}
            className="btn-text w-full justify-center gap-1.5"
            aria-label="View hospital details"
          >
            <span>View Details</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          {/* Emergency phone number */}
          {(hospital.contact.emergencyPhone || hospital.contact.phone) && (
            <div className="text-center text-[11px] text-[var(--color-text-muted)] pt-1">
              Emergency: <strong className="text-[var(--color-text-primary)]">{hospital.contact.emergencyPhone || hospital.contact.phone}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Tablet (768-1023px): Image 72x72, Content + Actions horizontal below */}
      <div className="lg:hidden md:flex md:items-start md:gap-4 p-5">
        <div className="relative h-[72px] w-[72px] flex-shrink-0">
          <div className="relative h-full w-full rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-page)]">
            {hospital.image ? (
              <img
                src={hospital.image}
                alt={`${hospital.name} building exterior`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                <ImageIcon className="w-10 h-10" />
              </div>
            )}
            {hospital.verified && (
              <div className="absolute top-2 right-2" aria-label="Verified hospital">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-brand-blue)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-[var(--text-hospital-name)] font-semibold text-[var(--color-text-primary)] line-clamp-1">
              {hospital.name}
            </h3>
            {hospital.verified && (
              <span className="inline-flex items-center gap-1.5" aria-label="Verified hospital">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-brand-blue)]">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              </span>
            )}
          </div>
          {hospital.distanceKm && (
            <div className="flex items-center gap-1.5 text-[var(--text-meta)] text-[var(--color-text-secondary)]">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-text-muted)]" />
              <span className="font-medium text-[var(--color-brand-navy)]">{formatDistance(hospital.distanceKm)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[var(--text-meta)] text-[var(--color-text-secondary)]">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-text-muted)]" />
            <span className="truncate">{formatAddress(hospital)}</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <span className={`badge-updated ${isStale ? 'badge-updated-stale' : ''}`}>
              {isStale ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  Data may be outdated
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  Last updated {hospital.lastUpdated}
                </>
              )}
            </span>
          </div>
          <ResourceStatusGrid resources={hospital.resources} size="sm" />
          {/* Actions horizontal on tablet */}
          <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onCall}
              className="btn-secondary-filled flex-1 justify-center gap-2"
              aria-label={hospital.contact.emergencyPhone || hospital.contact.phone ? `Call ${hospital.contact.emergencyPhone || hospital.contact.phone}` : 'Call hospital'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Call Hospital</span>
            </button>
            <button
              type="button"
              onClick={onViewDetails}
              className="btn-text whitespace-nowrap"
              aria-label="View hospital details"
            >
              <span>View Details</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile (<768px): Full vertical stack */}
      <div className="md:hidden p-5 space-y-4">
        {/* Image full width, 160px height */}
        <div className="relative h-[160px] w-full rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-page)]">
          {hospital.image ? (
            <img
              src={hospital.image}
              alt={`${hospital.name} building exterior`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
              <ImageIcon className="w-16 h-16" />
            </div>
          )}
          {hospital.verified && (
            <div className="absolute top-2 right-2" aria-label="Verified hospital">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-brand-blue)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-[var(--text-hospital-name)] font-semibold text-[var(--color-text-primary)] line-clamp-1">
              {hospital.name}
            </h3>
            {hospital.verified && (
              <span className="inline-flex items-center gap-1.5" aria-label="Verified hospital">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-brand-blue)]">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              </span>
            )}
          </div>
          {hospital.distanceKm && (
            <div className="flex items-center gap-1.5 text-[var(--text-meta)] text-[var(--color-text-secondary)]">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-text-muted)]" />
              <span className="font-medium text-[var(--color-brand-navy)]">{formatDistance(hospital.distanceKm)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[var(--text-meta)] text-[var(--color-text-secondary)]">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-text-muted)]" />
            <span className="truncate">{formatAddress(hospital)}</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <span className={`badge-updated ${isStale ? 'badge-updated-stale' : ''}`}>
              {isStale ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  Data may be outdated
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  Last updated {hospital.lastUpdated}
                </>
              )}
            </span>
          </div>
          <ResourceStatusGrid resources={hospital.resources} size="sm" />
          {/* Actions stacked on mobile */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onCall}
              className="btn-secondary-filled w-full h-[48px] justify-center gap-2"
              aria-label={hospital.contact.emergencyPhone || hospital.contact.phone ? `Call ${hospital.contact.emergencyPhone || hospital.contact.phone}` : 'Call hospital'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Call Hospital</span>
            </button>
            <button
              type="button"
              onClick={onViewDetails}
              className="btn-text w-full justify-center gap-1.5"
              aria-label="View hospital details"
            >
              <span>View Details</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            {(hospital.contact.emergencyPhone || hospital.contact.phone) && (
              <div className="text-center text-[11px] text-[var(--color-text-muted)]">
                Emergency: <strong className="text-[var(--color-text-primary)]">{hospital.contact.emergencyPhone || hospital.contact.phone}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}