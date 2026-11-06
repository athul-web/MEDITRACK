import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Building,
  Wind,
  Droplets,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import type { DemoHospital, HospitalResource } from '../types/hospital';
import { parseISO } from 'date-fns';

interface HospitalDirectoryCardProps {
  hospital: DemoHospital;
  onViewDetails?: (hospital: DemoHospital) => void;
}

type AvailabilityLevel = 'available' | 'limited' | 'unavailable' | 'unknown';

interface ResourceStatus {
  label: string;
  countText: string;
  level: AvailabilityLevel;
  icon: React.ReactNode;
}

function getResourceStatus(res: HospitalResource): ResourceStatus {
  let level: AvailabilityLevel = 'unknown';
  let countText = 'Not reported';

  if (res.total > 0) {
    const ratio = res.available / res.total;
    level = 'available';
    countText = res.available + '/' + res.total;
    if (res.available === 0) {
      level = 'unavailable';
    } else if (ratio < 0.25 || res.available <= 3) {
      level = 'limited';
    }
  }

  let icon = <Building size={13} />;
  if (res.tag === 'Ventilator') icon = <Wind size={13} />;
  if (res.tag === 'Oxygen') icon = <Droplets size={13} />;

  return {
    label: res.label,
    countText,

    level,
    icon,
  };
}

function formatRelativeTime(isoString: string): { text: string; isFresh: boolean } {
  try {
    const date = parseISO(isoString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return { text: 'Just now', isFresh: true };
    if (diffMinutes < 60) return { text: `${diffMinutes}m ago`, isFresh: diffMinutes < 30 };
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return { text: `${diffHours}h ago`, isFresh: false };
    const diffDays = Math.floor(diffHours / 24);
    return { text: `${diffDays}d ago`, isFresh: false };
  } catch {
    return { text: 'Recently', isFresh: false };
  }
}

export function HospitalDirectoryCard({ hospital, onViewDetails }: HospitalDirectoryCardProps) {
  const [calling, setCalling] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalling(true);
    window.location.href = `tel:${hospital.phone}`;
    setTimeout(() => setCalling(false), 2000);
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const { text: relativeTime, isFresh } = formatRelativeTime(hospital.lastUpdated);

  // Compute status for all critical resources
  const icuRes = hospital.resources.find((r) => r.tag === 'ICU');
  const ventRes = hospital.resources.find((r) => r.tag === 'Ventilator');
  const o2Res = hospital.resources.find((r) => r.tag === 'Oxygen');
  const hasEmergency = hospital.tags.includes('Emergency');

  const resourceStatuses: ResourceStatus[] = [];
  if (icuRes) resourceStatuses.push(getResourceStatus(icuRes));
  if (ventRes) resourceStatuses.push(getResourceStatus(ventRes));
  if (o2Res) resourceStatuses.push(getResourceStatus(o2Res));

  // Add Emergency status
  resourceStatuses.push({
    label: 'Emergency',
    countText: hasEmergency ? '24/7 Ready' : 'Unavailable',
    level: hasEmergency ? 'available' : 'unavailable',
    icon: <AlertCircle size={13} />,
  });

  return (
    <article
      className="hospital-card-lift bg-white rounded-2xl border border-[#D9E6EE] p-4 sm:p-5 shadow-xs transition-all duration-200"
    >
      <div className="flex flex-col md:flex-row gap-4 sm:gap-5 items-start">
        {/* 1. Consistent Hospital Thumbnail: Exactly 88 × 88 px */}
        <div className="w-[88px] h-[88px] rounded-xl overflow-hidden shrink-0 relative bg-slate-100 border border-slate-200/80 shadow-xs flex items-center justify-center">
          {!imgError ? (
            <img
              src={hospital.imageUrl}
              alt={`${hospital.name} medical building`}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#E4F6FA] to-[#C8EDF5] text-[#073B55]">
              <Building size={32} className="opacity-80" />
            </div>
          )}

          {/* Quick badge on thumbnail */}
          {hasEmergency && (
            <span
              className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-red-600 text-white tracking-wider shadow-xs"
              title="24/7 Emergency Available"
            >
              24/7
            </span>
          )}
        </div>

        {/* 2. Structured Information Hierarchy */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
          <div>
            {/* PRIMARY: Hospital Name & Verified Badge */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base sm:text-lg font-bold text-[#122B43] tracking-tight leading-snug">
                {hospital.name}
              </h3>
              {hospital.verified && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E4F6FA] text-[#087D91] border border-[#BCEBF5]"
                  title="Verified MediTrack Network Facility"
                >
                  <ShieldCheck size={12} className="text-[#087D91]" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            {/* SECONDARY: Distance & Drive Time, Last Updated */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#60778C] mb-2">
              <div className="flex items-center gap-1 font-semibold text-[#073B55]">
                <MapPin size={13} className="text-[#087D91]" />
                {typeof hospital.distanceKm === 'number' ? (
                  <>
                    <span>{hospital.distanceKm} km away</span>
                    {typeof hospital.driveMinutes === 'number' && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-[#60778C] font-normal">{hospital.driveMinutes} min drive</span>
                      </>
                    )}
                  </>
                ) : (
                  <span>Distance unavailable</span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-[#60778C]">
                <Clock size={12} />
                <span>Updated {relativeTime}</span>
                {isFresh && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                    title="Live recent report"
                  />
                )}
              </div>
            </div>

            {/* Full hospital address with sensible truncation & view full toggle */}
            <div className="text-xs text-[#60778C] mb-3.5 flex items-start gap-1.5">
              <span className="shrink-0 mt-0.5 text-slate-400">📍</span>
              <div className="flex-1">
                <span className={showFullAddress ? 'block leading-relaxed text-[#122B43]' : 'line-clamp-1 leading-relaxed'}>
                  {hospital.address}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullAddress(!showFullAddress)}
                  className="text-[11px] font-semibold text-[#087D91] hover:underline cursor-pointer focus:outline-none"
                >
                  {showFullAddress ? 'Hide full address' : 'View complete address'}
                </button>
              </div>
            </div>

            {/* TERTIARY: Resource Availability Indicators (Green, Amber, Red) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 sm:mb-1">
              {resourceStatuses.map((res) => {
                let badgeClass = 'bg-slate-50 text-slate-600 border-slate-200';
                let dotClass = 'bg-slate-400';
                let statusLabel = 'Not Reported';

                if (res.level === 'available') {
                  badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  dotClass = 'bg-emerald-500';
                  statusLabel = 'Available';
                } else if (res.level === 'limited') {
                  badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                  dotClass = 'bg-amber-500';
                  statusLabel = 'Limited Capacity';
                } else if (res.level === 'unavailable') {
                  badgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
                  dotClass = 'bg-rose-500';
                  statusLabel = 'Unavailable';
                }

                return (
                  <div
                    key={res.label}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs ${badgeClass} transition-colors`}
                    title={`${res.label}: ${statusLabel} (${res.countText})`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                      <span className="font-medium truncate text-[11px]">{res.label}</span>
                    </div>
                    <span className="font-bold text-[11px] ml-1 shrink-0">{res.countText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons Column */}
        <div className="w-full md:w-44 shrink-0 flex flex-col justify-center gap-2 pt-2 md:pt-0 md:pl-2 border-t md:border-t-0 md:border-l border-slate-100">
          <button
            type="button"
            onClick={handleCall}
            className="btn-call w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold text-white cursor-pointer shadow-xs"
          >
            <Phone size={13} />
            <span>{calling ? 'Connecting...' : 'Call Hospital'}</span>
          </button>

          <button
            type="button"
            onClick={handleDirections}
            className="btn-directions w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold text-[#073B55] bg-white border border-[#073B55]/30 cursor-pointer shadow-2xs"
          >
            <Navigation size={13} />
            <span>Get Directions</span>
          </button>

          <button
            type="button"
            onClick={() => onViewDetails?.(hospital)}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-[#087D91] hover:text-[#073B55] transition-colors cursor-pointer"
          >
            <span>View Details</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}