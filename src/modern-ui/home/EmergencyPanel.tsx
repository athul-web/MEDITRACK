import React, { useState } from 'react';
import { Phone, Heart, ChevronDown } from 'lucide-react';

const EMERGENCY_SERVICES = [
  { label: 'National Ambulance', number: '108' },
  { label: 'Police Emergency', number: '100' },
  { label: 'Fire & Rescue', number: '101' },
  { label: 'Disaster Helpline', number: '1077' },
];

export function EmergencyPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-[22px] overflow-hidden relative text-white"
      style={{
        background: 'linear-gradient(145deg, #052F4B 0%, #073B55 60%, #087D91 100%)',
        boxShadow: '0 8px 24px rgba(5,47,75,0.25)',
      }}
    >
      {/* 24/7 Red Badge */}
      <div className="absolute top-4 right-4 z-20">
        <span
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase text-white shadow-sm"
          style={{ background: '#DC2626' }}
        >
          <Phone size={10} />
          24/7 HOTLINE
        </span>
      </div>

      {/* Ambulance illustration background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=400&fit=crop&crop=center')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 p-6 flex flex-col justify-between">
        <div>
          {/* Heart icon */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#19D5E5]/20 border border-[#19D5E5]/40 shadow-inner">
            <Heart size={22} className="text-[#19D5E5]" />
          </div>

          <h3 className="text-xl font-bold tracking-tight mb-1">
            Need immediate help?
          </h3>
          <p className="text-xs text-slate-200/90 mb-5">
            Call our emergency hotline
          </p>

          {/* Hotline large digits */}
          <a
            href="tel:108"
            className="inline-flex items-center gap-3.5 mb-6 text-white no-underline group hover:opacity-95 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Phone size={24} className="text-[#19D5E5]" />
            </div>
            <span className="text-5xl font-black tracking-tight leading-none">
              108
            </span>
          </a>
        </div>

        {/* Emergency Contacts dropdown button */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white text-[#073B55] hover:bg-slate-50 transition-colors text-xs font-bold shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-[#073B55]" />
              <span>Emergency Contacts</span>
            </div>
            <ChevronDown
              size={15}
              className={`text-[#073B55] transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Expanded contact list */}
          {expanded && (
            <div className="mt-2.5 rounded-xl bg-black/30 border border-white/15 p-2.5 space-y-2 text-xs">
              {EMERGENCY_SERVICES.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between px-2 py-1 border-b border-white/10 last:border-b-0"
                >
                  <span className="text-slate-200">{s.label}</span>
                  <a
                    href={`tel:${s.number}`}
                    className="font-bold text-[#19D5E5] hover:underline"
                  >
                    {s.number}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
