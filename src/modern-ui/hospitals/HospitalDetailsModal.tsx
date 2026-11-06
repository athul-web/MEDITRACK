import React, { useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import type { DemoHospital } from '../types/hospital';

interface HospitalDetailsModalProps {
  hospital: DemoHospital | null;
  onClose: () => void;
}

export function HospitalDetailsModal({ hospital, onClose }: HospitalDetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (hospital) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hospital, onClose]);

  if (!hospital) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hospital-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-[#D9E6EE] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header Banner */}
        <div
          className="relative p-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #001525 0%, #073B55 70%, #087D91 100%)',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#19D5E5]/20 text-[#19D5E5] border border-[#19D5E5]/40">
              <ShieldCheck size={13} />
              Verified Healthcare Facility
            </span>
            <span className="text-xs text-slate-300">• {hospital.distanceKm} km away</span>
          </div>

          <h2 id="hospital-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
            {hospital.name}
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-200/90">
            <MapPin size={14} className="text-[#19D5E5] shrink-0" />
            <span>{hospital.address}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Resource Breakdown Card */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-3">
              Live Medical Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {hospital.resources.map((res) => {
                const ratio = res.total > 0 ? res.available / res.total : 0;
                const isLimited = ratio < 0.25 || res.available <= 3;
                const isNone = res.available === 0;

                let stateColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                let stateText = 'Available';
                if (isNone) {
                  stateColor = 'text-rose-700 bg-rose-50 border-rose-200';
                  stateText = 'Full / Critical';
                } else if (isLimited) {
                  stateColor = 'text-amber-700 bg-amber-50 border-amber-200';
                  stateText = 'Limited';
                }

                return (
                  <div key={res.label} className={`p-3.5 rounded-xl border ${stateColor} flex flex-col justify-between`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold">{res.label}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/70">
                        {stateText}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black tracking-tight">{res.available}</span>
                      <span className="text-xs font-semibold opacity-70">/ {res.total} total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Specialties & Tags */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-2.5">
              Available Units & Capabilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {hospital.tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6FA] text-[#073B55] border border-[#BCEBF5]"
                >
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Contact & Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-[#122B43]">
            <div className="flex items-center justify-between">
              <span className="text-[#60778C]">Direct Emergency Desk:</span>
              <a href={`tel:${hospital.phone}`} className="font-bold text-[#073B55] hover:text-[#087D91]">
                {hospital.phone}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#60778C]">Estimated Drive Time:</span>
              <span className="font-semibold">{hospital.driveMinutes} minutes via primary road</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#60778C]">GPS Coordinates:</span>
              <span className="font-mono text-[11px] text-[#60778C]">
                {hospital.lat.toFixed(4)}, {hospital.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-[#073B55] bg-white border border-[#D9E6EE] hover:border-[#073B55] transition-colors"
          >
            <Navigation size={14} />
            <span>Open in Google Maps</span>
          </a>

          <a
            href={`tel:${hospital.phone}`}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#073B55] hover:bg-[#052F4B] transition-colors shadow-xs"
          >
            <Phone size={14} />
            <span>Call Hotline</span>
          </a>
        </div>
      </div>
    </div>
  );
}