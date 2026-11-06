import React from 'react';

export function MinimalEcgLine() {
  // SVG path definitions for the ECG heartbeat waveform
  // Total viewBox: 520px width x 140px height, baseline: Y = 80px
  // Realistic, recognizable medical rhythm:
  // Flat baseline -> P wave crest -> PR interval -> Q dip -> sharp R peak -> deep S trough -> ST segment -> T wave crest -> trailing baseline
  const pathD =
    'M 0,80 ' +
    'L 170,80 ' +                   // horizontal leading baseline
    'C 182,80 188,71 196,71 ' +     // P wave crest
    'C 204,71 210,80 220,80 ' +     // return to baseline (PR segment)
    'L 238,80 ' +
    'L 248,88 ' +                   // Q dip
    'L 264,12 ' +                   // R peak (prominent, high-contrast spike reaching Y=12)
    'L 278,105 ' +                  // S trough (sharp descent to Y=105)
    'L 288,80 ' +                   // return to baseline (J point)
    'L 316,80 ' +                   // ST segment
    'C 328,80 334,64 346,64 ' +     // T wave crest
    'C 358,64 364,80 376,80 ' +     // T wave return
    'L 520,80';                     // horizontal trailing baseline

  return (
    <div
      className="hidden md:block absolute z-20 pointer-events-none select-none"
      style={{
        left: '73%',
        top: '55%',
        transform: 'translate(-50%, -50%)',
        width: '520px',
        maxWidth: '42vw',
        height: '140px',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 520 140"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle gradient so ends dissolve gracefully into the dark space */}
          <linearGradient id="ecgProminentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D5E8" stopOpacity="0" />
            <stop offset="10%" stopColor="#00D5E8" stopOpacity="0.5" />
            <stop offset="30%" stopColor="#00E5FF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#26F0FF" stopOpacity="1" />
            <stop offset="70%" stopColor="#00E5FF" stopOpacity="0.9" />
            <stop offset="90%" stopColor="#00D5E8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00D5E8" stopOpacity="0" />
          </linearGradient>

          {/* Controlled cyan glow filter */}
          <filter id="ecgGlowFilter" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Path reference for the animateMotion traveler dot */}
          <path id="prominentEcgWavePath" d={pathD} />
        </defs>

        {/* 1. Ambient soft glow shadow path */}
        <path
          d={pathD}
          stroke="#00D5E8"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.28"
          style={{ filter: 'blur(5px)' }}
        />

        {/* 2. Main prominent, sharp cyan ECG waveform */}
        <path
          d={pathD}
          stroke="url(#ecgProminentGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ecgGlowFilter)"
        />

        {/* 3. Small glowing cyan dot that travels smoothly along the waveform */}
        <g className="hero-ecg-traveler">
          {/* Outer soft halo */}
          <circle r="7" fill="#00D5E8" opacity="0.35" style={{ filter: 'blur(2px)' }} />
          {/* Mid glow ring */}
          <circle r="4" fill="#00E5FF" opacity="0.65" />
          {/* Inner bright core dot */}
          <circle r="2.4" fill="#FFFFFF" stroke="#00D5E8" strokeWidth="1.2" />

          {/* SVG animateMotion: hardware-accelerated, zero-JS smooth linear motion */}
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            calcMode="linear"
            keyTimes="0;1"
            keyPoints="0;1"
          >
            <mpath href="#prominentEcgWavePath" />
          </animateMotion>
        </g>
      </svg>
    </div>
  );
}
