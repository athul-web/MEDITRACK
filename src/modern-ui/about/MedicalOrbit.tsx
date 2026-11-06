import React from 'react';

/* ─────────────────────────────────────────────────────────────
   ORBIT ANIMATION CSS
   Strictly ONE animation:
   All seven badges continuously revolve clockwise around
   the stationary central ECG circle (30s linear infinite).
   The inner badge content counter-rotates at the exact same
   rate (-360deg) so all text and icons remain perfectly upright.
   No other animations (no pulsing, breathing, scaling, etc.)
───────────────────────────────────────────────────────────── */
const ORBIT_STYLES = `
  @keyframes orbit-revolve-clockwise {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes orbit-counter-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-360deg);
    }
  }

  .orbit-track-revolve {
    position: absolute;
    inset: 0;
    transform-origin: center center;
    animation: orbit-revolve-clockwise 30s linear infinite;
  }

  .orbit-badge-upright {
    animation: orbit-counter-rotate 30s linear infinite;
    transform-origin: center center;
    display: inline-flex;
  }

  @media (prefers-reduced-motion: reduce) {
    .orbit-track-revolve,
    .orbit-badge-upright {
      animation: none !important;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     RESPONSIVE DESIGN TOKENS
     Preserve desktop exactly (1024px+).
     Tablet (768px-1023px): slight proportional scale down.
     Mobile (480px-767px): compact badges, smaller circle & orbit.
     Small Mobile (320px-479px): ultra-compact badges & orbit,
     guaranteeing no collision, full visibility & no overflow.
  ───────────────────────────────────────────────────────────── */
  .medical-orbit-scaler {
    /* Desktop default (1024px and above) */
    --orbit-size: 480px;
    --orbit-radius: 175px;
    --orbit-center-size: 96px;
    --orbit-center-border: 2.5px;
    --orbit-ecg-w: 60px;
    --orbit-ecg-h: 26px;
    --orbit-ecg-stroke: 2.2;
    --orbit-center-label-offset: 58px;
    --orbit-center-label-size: 10px;
    --orbit-badge-pad-y: 6px;
    --orbit-badge-pad-x-right: 13px;
    --orbit-badge-pad-x-left: 9px;
    --orbit-badge-font-size: 12px;
    --orbit-badge-icon-size: 15px;
    --orbit-badge-gap: 6px;
    --orbit-badge-border-w: 1.5px;
    --orbit-badge-letter-spacing: 0.01em;

    width: var(--orbit-size);
    height: var(--orbit-size);
    position: relative;
    margin: 0 auto;
    flex-shrink: 0;
  }

  /* Tablet: 768px - 1023px */
  @media (min-width: 768px) and (max-width: 1023px) {
    .medical-orbit-scaler {
      --orbit-size: 410px;
      --orbit-radius: 150px;
      --orbit-center-size: 82px;
      --orbit-center-border: 2.2px;
      --orbit-ecg-w: 50px;
      --orbit-ecg-h: 22px;
      --orbit-ecg-stroke: 2.0;
      --orbit-center-label-offset: 49px;
      --orbit-center-label-size: 9.5px;
      --orbit-badge-pad-y: 5px;
      --orbit-badge-pad-x-right: 11px;
      --orbit-badge-pad-x-left: 8px;
      --orbit-badge-font-size: 11px;
      --orbit-badge-icon-size: 14px;
      --orbit-badge-gap: 5px;
      --orbit-badge-border-w: 1.5px;
      --orbit-badge-letter-spacing: 0.01em;
    }
  }

  /* Mobile: 480px - 767px */
  @media (min-width: 480px) and (max-width: 767px) {
    .medical-orbit-scaler {
      --orbit-size: 340px;
      --orbit-radius: 124px;
      --orbit-center-size: 68px;
      --orbit-center-border: 2px;
      --orbit-ecg-w: 42px;
      --orbit-ecg-h: 18px;
      --orbit-ecg-stroke: 1.8;
      --orbit-center-label-offset: 41px;
      --orbit-center-label-size: 8.5px;
      --orbit-badge-pad-y: 4px;
      --orbit-badge-pad-x-right: 9px;
      --orbit-badge-pad-x-left: 7px;
      --orbit-badge-font-size: 10px;
      --orbit-badge-icon-size: 12px;
      --orbit-badge-gap: 4px;
      --orbit-badge-border-w: 1.2px;
      --orbit-badge-letter-spacing: 0.005em;
    }
  }

  /* Small Mobile upper tier: 375px - 479px (e.g. 390px, 375px) */
  @media (min-width: 375px) and (max-width: 479px) {
    .medical-orbit-scaler {
      --orbit-size: 290px;
      --orbit-radius: 105px;
      --orbit-center-size: 58px;
      --orbit-center-border: 1.8px;
      --orbit-ecg-w: 36px;
      --orbit-ecg-h: 16px;
      --orbit-ecg-stroke: 1.6;
      --orbit-center-label-offset: 35px;
      --orbit-center-label-size: 8px;
      --orbit-badge-pad-y: 3px;
      --orbit-badge-pad-x-right: 7.5px;
      --orbit-badge-pad-x-left: 6px;
      --orbit-badge-font-size: 9px;
      --orbit-badge-icon-size: 11px;
      --orbit-badge-gap: 3.5px;
      --orbit-badge-border-w: 1px;
      --orbit-badge-letter-spacing: 0;
    }
  }

  /* Small Mobile compact tier: 320px - 374px (e.g. 360px, 320px) */
  @media (max-width: 374px) {
    .medical-orbit-scaler {
      --orbit-size: 244px;
      --orbit-radius: 87px;
      --orbit-center-size: 48px;
      --orbit-center-border: 1.5px;
      --orbit-ecg-w: 28px;
      --orbit-ecg-h: 13px;
      --orbit-ecg-stroke: 1.5;
      --orbit-center-label-offset: 29px;
      --orbit-center-label-size: 7px;
      --orbit-badge-pad-y: 2.5px;
      --orbit-badge-pad-x-right: 5.5px;
      --orbit-badge-pad-x-left: 4.5px;
      --orbit-badge-font-size: 8px;
      --orbit-badge-icon-size: 10px;
      --orbit-badge-gap: 3px;
      --orbit-badge-border-w: 1px;
      --orbit-badge-letter-spacing: 0;
    }
  }

  .orbit-badge-item {
    position: absolute;
    transform: translate(-50%, -50%);
    z-index: 10;
    will-change: transform;
  }

  .orbit-badge-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--orbit-badge-gap);
    white-space: nowrap;
    padding-top: var(--orbit-badge-pad-y);
    padding-bottom: var(--orbit-badge-pad-y);
    padding-left: var(--orbit-badge-pad-x-left);
    padding-right: var(--orbit-badge-pad-x-right);
    border-radius: 999px;
    background: rgba(240, 250, 255, 0.94);
    border: var(--orbit-badge-border-w) solid rgba(0, 213, 232, 0.4);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    user-select: none;
    box-sizing: border-box;
  }

  .orbit-badge-text {
    font-size: var(--orbit-badge-font-size);
    font-weight: 700;
    letter-spacing: var(--orbit-badge-letter-spacing);
    color: #0A2A3F;
    line-height: 1;
  }

  .medical-orbit-center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: var(--orbit-center-size);
    height: var(--orbit-center-size);
    border-radius: 50%;
    background: radial-gradient(circle at 50% 50%, #052F4B 50%, #031E32 100%);
    border: var(--orbit-center-border) solid rgba(0, 213, 232, 0.85);
    box-shadow: 0 0 24px 4px rgba(0, 213, 232, 0.4), inset 0 0 16px rgba(0, 213, 232, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    pointer-events: none;
    box-sizing: border-box;
  }

  .medical-orbit-ecg-svg {
    width: var(--orbit-ecg-w);
    height: var(--orbit-ecg-h);
  }

  .medical-orbit-ecg-path {
    stroke-width: var(--orbit-ecg-stroke);
  }

  .medical-orbit-center-label {
    position: absolute;
    left: 50%;
    top: calc(50% + var(--orbit-center-label-offset));
    transform: translateX(-50%);
    text-align: center;
    z-index: 20;
    pointer-events: none;
    white-space: nowrap;
  }

  .medical-orbit-center-label-text {
    font-size: var(--orbit-center-label-size);
    font-weight: 700;
    color: rgba(0, 213, 232, 0.75);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
`;

/* ─────────────────────────────────────────────────────────────
   7 MEDICAL RESOURCE BADGES
───────────────────────────────────────────────────────────── */
interface BadgeDef {
  label: string;
  icon: React.ReactNode;
}

function NavigationIcon() {
  return (
    <svg viewBox="0 0 18 18" width="100%" height="100%" fill="none" aria-hidden="true">
      <path d="M9 2L14 16L9 13L4 16L9 2Z" stroke="#00D5E8" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function IcuBedsIcon() {
  return (
    <svg viewBox="0 0 18 18" width="100%" height="100%" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="14" height="9" rx="2" stroke="#00D5E8" strokeWidth="1.5" />
      <path d="M6 6V4a3 3 0 0 1 6 0v2" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 9v3M7.5 10.5h3" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function VentilatorsIcon() {
  return (
    <svg viewBox="0 0 18 18" width="100%" height="100%" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="#00D5E8" strokeWidth="1.5" />
      <path d="M9 5.5v3.5l2.5 2.5" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9h1.5" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function OxygenIcon() {
  return (
    <svg viewBox="0 0 18 18" width="100%" height="100%" fill="none" aria-hidden="true">
      <path d="M4 7c0-2.76 2.24-5 5-5s5 2.24 5 5v5H4V7Z" stroke="#00D5E8" strokeWidth="1.5" />
      <path d="M6.5 15.5h5" stroke="#00D5E8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 11v2.5" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 8.5h4" stroke="#00D5E8" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

function EmergencyIcon() {
  return (
    <svg viewBox="0 0 18 18" width="100%" height="100%" fill="none" aria-hidden="true">
      <path d="M9 2L2 15.5h14L9 2Z" stroke="#00D5E8" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 7.5v3.5" stroke="#00D5E8" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9" cy="12.5" r="0.75" fill="#00D5E8" />
    </svg>
  );
}

function LiveStatusIcon() {
  return (
    <svg viewBox="0 0 18 18" width="100%" height="100%" fill="none" aria-hidden="true">
      <path d="M2 10L5.5 6.5L8.5 9.5L13 4.5" stroke="#00D5E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="12" r="2.5" fill="#00D5E8" opacity="0.85" />
      <path d="M12.5 12h1" stroke="#001525" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function AmbulanceIcon() {
  return (
    <svg viewBox="0 0 18 18" width="100%" height="100%" fill="none" aria-hidden="true">
      <rect x="1.5" y="5.5" width="10" height="8" rx="1.5" stroke="#00D5E8" strokeWidth="1.5" />
      <path d="M11.5 8.5h2.5L16 11v2.5h-4.5V8.5Z" stroke="#00D5E8" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="4.5" cy="14" r="1.3" stroke="#00D5E8" strokeWidth="1.2" />
      <circle cx="13" cy="14" r="1.3" stroke="#00D5E8" strokeWidth="1.2" />
      <path d="M4.5 8.5V10M3.75 9.25h1.5" stroke="#00D5E8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

const BADGES: BadgeDef[] = [
  { label: 'Navigation', icon: <NavigationIcon /> },
  { label: 'ICU Beds', icon: <IcuBedsIcon /> },
  { label: 'Ventilators', icon: <VentilatorsIcon /> },
  { label: 'Oxygen', icon: <OxygenIcon /> },
  { label: 'Emergency', icon: <EmergencyIcon /> },
  { label: 'Live Status', icon: <LiveStatusIcon /> },
  { label: 'Ambulance', icon: <AmbulanceIcon /> },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENT: MedicalOrbit
───────────────────────────────────────────────────────────── */
export function MedicalOrbit() {
  const CANVAS = 480;
  const CX = CANVAS / 2; // 240
  const CY = CANVAS / 2; // 240
  const RING_R = 175;    // Orbit track radius
  const RING_INNER = 135;// Subtle inner track

  return (
    <div className="medical-orbit-container w-full flex justify-center items-center select-none py-2">
      <style>{ORBIT_STYLES}</style>

      {/* Responsive scalable frame with pure CSS custom properties */}
      <div className="medical-orbit-scaler">
        {/* 1. Stationary subtle blue grid lines inside the backdrop */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${CANVAS} ${CANVAS}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12, pointerEvents: 'none' }}
        >
          {Array.from({ length: 13 }).map((_, i) => {
            const pos = (i * CANVAS) / 12;
            return (
              <g key={i}>
                <line x1={pos} y1="0" x2={pos} y2={CANVAS} stroke="#00D5E8" strokeWidth="0.6" />
                <line x1="0" y1={pos} x2={CANVAS} y2={pos} stroke="#00D5E8" strokeWidth="0.6" />
              </g>
            );
          })}
        </svg>

        {/* 2. Stationary subtle circular cyan orbit tracks behind badges */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${CANVAS} ${CANVAS}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          {/* Outer glow ring */}
          <circle
            cx={CX}
            cy={CY}
            r={RING_R + 14}
            stroke="rgba(0, 213, 232, 0.04)"
            strokeWidth="20"
            fill="none"
          />
          {/* Inner decorative circle */}
          <circle
            cx={CX}
            cy={CY}
            r={RING_INNER}
            stroke="rgba(0, 213, 232, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 8"
            fill="none"
          />
          {/* Main orbit track */}
          <circle
            cx={CX}
            cy={CY}
            r={RING_R}
            stroke="rgba(0, 213, 232, 0.22)"
            strokeWidth="1.2"
            strokeDasharray="5 7"
            fill="none"
          />
          {/* Radial tick marks at equal 360/7 degree intervals */}
          {BADGES.map((_, i) => {
            const angle = (i * 360) / BADGES.length;
            const rad = (angle * Math.PI) / 180;
            const x1 = CX + (RING_R - 6) * Math.cos(rad);
            const y1 = CY + (RING_R - 6) * Math.sin(rad);
            const x2 = CX + (RING_R + 6) * Math.cos(rad);
            const y2 = CY + (RING_R + 6) * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(0, 213, 232, 0.35)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* 3. REVOLVING ORBIT CONTAINER: 
               Rotates continuously clockwise 360deg over 30s.
               Contains all 7 badges evenly positioned around the circle. */}
        <div
          className="orbit-track-revolve"
        >
          {BADGES.map((badge, i) => {
            // Equal angular spacing: 360 / 7 degrees
            const angleDeg = (i * 360) / BADGES.length;
            const angleRad = (angleDeg * Math.PI) / 180;
            const cosVal = Math.cos(angleRad).toFixed(6);
            const sinVal = Math.sin(angleRad).toFixed(6);

            return (
              <div
                key={badge.label}
                className="orbit-badge-item"
                style={{
                  left: `calc(50% + (var(--orbit-radius) * ${cosVal}))`,
                  top: `calc(50% + (var(--orbit-radius) * ${sinVal}))`,
                }}
              >
                {/* Counter-rotating element: rotates -360deg over 30s so text and icons stay upright */}
                <div className="orbit-badge-upright">
                  <div className="orbit-badge-pill">
                    <span
                      style={{
                        width: 'var(--orbit-badge-icon-size)',
                        height: 'var(--orbit-badge-icon-size)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {badge.icon}
                    </span>
                    <span className="orbit-badge-text">
                      {badge.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Central stationary glowing cyan ECG node
               Stationary: does NOT revolve, NO breathing animation */}
        <div
          aria-label="Central ECG Heartbeat"
          className="medical-orbit-center"
        >
          {/* ECG waveform SVG icon */}
          <svg
            viewBox="0 0 80 36"
            className="medical-orbit-ecg-svg"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0,18 L14,18 L18,8 L22,28 L28,4 L33,32 L38,16 L42,18 L80,18"
              stroke="#00D5E8"
              className="medical-orbit-ecg-path"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Center label below node */}
        <div
          aria-hidden="true"
          className="medical-orbit-center-label"
        >
          <span className="medical-orbit-center-label-text">
            MediTrack
          </span>
        </div>
      </div>
    </div>
  );
}
