import React, { useMemo } from 'react';

export function HeroCrossScene() {
  // 12 subtle, widely spaced ambient cyan/blue particles
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const top = 18 + Math.sin(i * 1.8) * 32 + 25; // 18% to 75%
      const left = 22 + Math.cos(i * 2.2) * 32 + 25; // 22% to 78%
      const size = 1.8 + (i % 3) * 0.8; // 1.8px to 3.4px
      const opacity = 0.25 + (i % 4) * 0.12; // 0.25 to 0.6
      const duration = 8 + (i % 4) * 2.5; // 8s to 15s
      const delay = (i * 0.9) % 6;
      const isTurquoise = i % 2 === 0;

      return {
        id: i,
        top: `${top}%`,
        left: `${left}%`,
        size,
        opacity,
        duration,
        delay,
        color: isTurquoise ? '#00D5E8' : '#00BFD0',
        shadowColor: isTurquoise ? 'rgba(0, 213, 232, 0.6)' : 'rgba(0, 191, 208, 0.4)',
      };
    });
  }, []);

  return (
    <div className="relative w-full max-w-[440px] sm:max-w-[500px] lg:max-w-[560px] aspect-square flex items-center justify-center select-none pointer-events-none">
      {/* 1. Soft radial cyan glow in background (wide, airy, low-opacity) */}
      <div
        className="absolute w-[380px] h-[380px] rounded-full pointer-events-none opacity-30 blur-[90px]"
        style={{
          background: 'radial-gradient(circle, rgba(0,213,232,0.22) 0%, rgba(0,127,149,0.10) 45%, transparent 70%)',
        }}
      />

      {/* 2. Deep ambient backlight halo */}
      <div
        className="absolute w-[460px] h-[460px] rounded-full pointer-events-none opacity-20 blur-[110px]"
        style={{
          background: 'radial-gradient(circle, rgba(0,80,120,0.4) 0%, transparent 65%)',
        }}
      />

      {/* 3. Three Luminous Orbital Light Trails (EXACTLY PRESERVED) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Orbit Line 1: Primary wide tilted ellipse (slow 42s rotation) */}
        <div
          className="absolute w-[420px] h-[190px] rounded-[50%] border border-[#00D5E8]/35 hero-orbit-1"
          style={{
            transform: 'rotate(-28deg)',
            boxShadow: '0 0 16px rgba(0, 213, 232, 0.18), inset 0 0 12px rgba(0, 213, 232, 0.08)',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.9) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.9) 100%)',
          }}
        >
          {/* Subtle luminous beacon on Orbit 1 */}
          <div
            className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#00D5E8]"
            style={{
              boxShadow: '0 0 8px #00D5E8, 0 0 16px rgba(0, 213, 232, 0.6)',
            }}
          />
        </div>

        {/* Orbit Line 2: Counter-rotating steep ellipse (slow 48s rotation) */}
        <div
          className="absolute w-[360px] h-[160px] rounded-[50%] border border-[#00BFD0]/30 hero-orbit-2"
          style={{
            transform: 'rotate(38deg)',
            boxShadow: '0 0 14px rgba(0, 191, 208, 0.15)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.85) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.85) 100%)',
          }}
        >
          {/* Subtle beacon on Orbit 2 */}
          <div
            className="absolute -top-1 left-1/3 w-1.5 h-1.5 rounded-full bg-[#00BFD0]"
            style={{
              boxShadow: '0 0 8px #00BFD0',
            }}
          />
        </div>

        {/* Orbit Line 3: Faint outer dashed energy contour (slow 55s rotation) */}
        <div
          className="absolute w-[470px] h-[220px] rounded-[50%] border border-dashed border-[#00D5E8]/20 hero-orbit-3"
          style={{
            transform: 'rotate(-8deg)',
            boxShadow: '0 0 18px rgba(0, 213, 232, 0.10)',
          }}
        />
      </div>

      {/* 4. Minimal Central Light Element */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Soft radial pulse halo */}
        <div className="absolute w-20 h-20 rounded-full bg-[#00D5E8]/10 blur-md hero-center-pulse" />
        
        {/* Subtle mid ring */}
        <div className="absolute w-8 h-8 rounded-full border border-[#00D5E8]/20 bg-[#00D5E8]/5" />
        
        {/* Tiny cyan luminous center dot */}
        <div
          className="relative w-2 h-2 rounded-full bg-[#00D5E8] hero-center-dot"
          style={{
            boxShadow: '0 0 10px #00D5E8, 0 0 20px rgba(0, 213, 232, 0.7)',
          }}
        />
      </div>

      {/* 5. Subtle Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full hero-particle-drift"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
              boxShadow: `0 0 6px ${p.shadowColor}`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
