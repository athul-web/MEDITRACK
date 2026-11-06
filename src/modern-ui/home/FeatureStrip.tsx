import React from 'react';
import { Zap, MapPin, ShieldCheck, Phone } from 'lucide-react';

const FEATURES = [
  {
    icon: <Zap size={22} style={{ color: '#087D91' }} />,
    title: 'Real-Time Availability',
    subtitle: 'See live resource status',
  },
  {
    icon: <MapPin size={22} style={{ color: '#087D91' }} />,
    title: 'Nearby Hospitals',
    subtitle: 'Find the closest verified hospitals',
  },
  {
    icon: <ShieldCheck size={22} style={{ color: '#087D91' }} />,
    title: 'Verified & Reliable',
    subtitle: 'Only trusted hospitals',
  },
  {
    icon: <Phone size={22} style={{ color: '#087D91' }} />,
    title: 'Direct Contact',
    subtitle: 'Get call details instantly',
  },
];

export function FeatureStrip() {
  return (
    <div
      className="rounded-[22px] p-4 sm:p-6 mb-8 border border-[#BDEFF5]/60"
      style={{
        background: '#E4F6FA',
        boxShadow: '0 4px 20px rgba(8,125,145,0.06)',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#BDEFF5]/80">
        {FEATURES.map((item, index) => (
          <div
            key={item.title}
            className={`flex items-center gap-3.5 ${
              index !== 0 ? 'sm:pl-6' : ''
            } ${index !== 0 ? 'pt-3 sm:pt-0' : ''}`}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(8,125,145,0.14)' }}
            >
              {item.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#122B43] leading-snug">
                {item.title}
              </h4>
              <p className="text-xs text-[#60778C] mt-0.5 leading-snug">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
