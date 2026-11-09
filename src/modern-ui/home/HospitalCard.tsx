import React, { useState } from 'react';
import {
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  Navigation,
  ChevronRight,
  Building,
} from 'lucide-react';
import type { DemoHospital } from '../types/hospital';
import { format, parseISO } from 'date-fns';

interface HospitalCardProps {
  hospital: DemoHospital;
  onViewDetails?: (hospital: DemoHospital) => void;
}

export function HospitalCard({ hospital, onViewDetails }: HospitalCardProps) {
  const [calling, setCalling] = useState(false);

  const handleCall = () => {
    setCalling(true);
    window.location.href = `tel:${hospital.phone}`;
    setTimeout(() => setCalling(false), 2000);
  };

  const handleDirections = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  // Format last updated
  let formattedTime = hospital.lastUpdated;
  try {
    formattedTime = format(parseISO(hospital.lastUpdated), 'yyyy-MM-dd HH:mm:ss');
  } catch {
    // fallback if already simple string
  }

  return (
    <div
      className="bg-white rounded-[22px] border border-[#D9E6EE] overflow-hidden card-lift"
      style={{
        boxShadow: '0 2px 14px rgba(18,43,67,0.04)',
      }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Hospital photo */}
        <div className="w-full md:w-52 h-48 md:h-auto shrink-0 relative overflow-hidden bg-slate-100">
          <img
            src={hospital.imageUrl}
            alt={hospital.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Center hospital details */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            {/* Title & Verified check */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-[#122B43] tracking-wide">
                {hospital.name}
                {hospital.id.startsWith('demo-') && (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                    Demo
                  </span>
                )}
              </h3>
              {hospital.verified && (
                <CheckCircle2 size={18} className="text-[#087D91] shrink-0 fill-[#E4F6FA]" />
              )}
            </div>

            {/* Distance & Travel time */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#60778C] mb-2">
              <MapPin size={13} className="text-[#087D91] shrink-0" />
              {typeof hospital.distanceKm === 'number' ? (
                <>
                  <span>{hospital.distanceKm} km</span>
                  {typeof hospital.driveMinutes === 'number' && (
                    <>
                      <span>•</span>
                      <span>{hospital.driveMinutes} min drive</span>
                    </>
                  )}
                </>
              ) : (
                <span>Distance unavailable</span>
              )}
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-xs text-[#60778C] mb-4">
              <Building size={13} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-relaxed">{hospital.address}</span>
            </div>

            {/* Resource availability pills */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {hospital.resources.map((res) => {
                let badgeStyle = {
                  bg: '#F0FDF4',
                  text: '#15803D',
                  border: '#BBF7D0',
                };

                if (res.tag === 'ICU') {
                  badgeStyle = {
                    bg: '#E0F2FE',
                    text: '#0369A1',
                    border: '#BAE6FD',
                  };
                } else if (res.tag === 'Oxygen') {
                  badgeStyle = {
                    bg: '#F5F3FF',
                    text: '#6D28D9',
                    border: '#DDD6FE',
                  };
                }

                return (
                  <div
                    key={res.label}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: badgeStyle.bg,
                      color: badgeStyle.text,
                      border: `1px solid ${badgeStyle.border}`,
                    }}
                  >
                    <span>{res.label}</span>
                    <span className="font-bold opacity-90">
                      {res.available}/{res.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timestamp footer */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#60778C]/80 pt-2 border-t border-slate-100">
            <Clock size={12} />
            <span>Last updated: {formattedTime}</span>
          </div>
        </div>

        {/* Right action column */}
        <div className="p-5 md:pl-0 flex flex-col justify-center gap-2.5 shrink-0 md:w-44 border-t md:border-t-0 md:border-l border-slate-100">
          <button
            onClick={handleCall}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
            style={{
              background: calling ? '#15803D' : '#073B55',
              boxShadow: '0 2px 10px rgba(7,59,85,0.2)',
            }}
          >
            <Phone size={13} />
            {calling ? 'Calling...' : 'Call Hospital'}
          </button>

          <button
            onClick={handleDirections}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#073B55] border border-[#073B55] hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Navigation size={13} />
            Get Directions
          </button>

          <button
            type="button"
            onClick={() => onViewDetails?.(hospital)}
            className="flex items-center justify-center gap-1 text-xs font-semibold text-[#073B55] hover:text-[#087D91] transition-colors py-1 cursor-pointer"
          >
            View Details <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
