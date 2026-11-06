import React from 'react';

export function HeroFlowingWaves() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-44 sm:h-56 lg:h-64 pointer-events-none overflow-hidden select-none z-0">
      {/* Wave Layer 1: Back Wave - Deep Midnight Teal (slow moving) */}
      <svg
        viewBox="0 0 2880 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 left-0 w-[200%] h-full opacity-35 hero-wave-anim-1"
        preserveAspectRatio="none"
      >
        <path
          d="M0,192 C320,240 640,140 960,180 C1280,220 1600,280 1920,210 C2240,140 2560,200 2880,180 L2880,320 L0,320 Z"
          fill="url(#waveGrad1)"
        />
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00243A" />
            <stop offset="50%" stopColor="#003D5B" />
            <stop offset="100%" stopColor="#00243A" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wave Layer 2: Middle Wave - Glowing cyan-edged deep blue wave */}
      <svg
        viewBox="0 0 2880 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 left-0 w-[200%] h-full opacity-45 hero-wave-anim-2"
        preserveAspectRatio="none"
      >
        <path
          d="M0,230 C360,160 720,260 1080,200 C1440,140 1800,240 2160,190 C2520,140 2700,210 2880,200 L2880,320 L0,320 Z"
          fill="url(#waveGrad2)"
        />
        {/* Subtle luminous cyan crest line along the wave edge */}
        <path
          d="M0,230 C360,160 720,260 1080,200 C1440,140 1800,240 2160,190 C2520,140 2700,210 2880,200"
          stroke="#00D5E8"
          strokeWidth="1.5"
          strokeOpacity="0.45"
          fill="none"
        />
        <defs>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00182B" />
            <stop offset="40%" stopColor="#002E48" />
            <stop offset="80%" stopColor="#001F35" />
            <stop offset="100%" stopColor="#00182B" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wave Layer 3: Foreground Wave with soft gradient fade to the next section */}
      <svg
        viewBox="0 0 2880 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 left-0 w-[200%] h-full opacity-65 hero-wave-anim-3"
        preserveAspectRatio="none"
      >
        <path
          d="M0,270 C480,220 960,290 1440,240 C1920,190 2400,270 2880,240 L2880,320 L0,320 Z"
          fill="url(#waveGrad3)"
        />
        {/* Soft edge highlight */}
        <path
          d="M0,270 C480,220 960,290 1440,240 C1920,190 2400,270 2880,240"
          stroke="#00BFD0"
          strokeWidth="1.2"
          strokeOpacity="0.3"
          fill="none"
        />
        <defs>
          <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#001525" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#001525" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
