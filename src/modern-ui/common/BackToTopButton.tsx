import React from 'react';
import { ArrowUp } from 'lucide-react';

interface BackToTopButtonProps {
  visible: boolean;
  onScrollToTop?: () => void;
  label?: string;
}

export function BackToTopButton({
  visible,
  onScrollToTop,
  label = 'Back to Top',
}: BackToTopButtonProps) {
  const handleClick = () => {
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out ${
        visible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-8 scale-90 pointer-events-none'
      }`}
    >
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-bold text-white cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #073B55 0%, #087D91 100%)',
          boxShadow: '0 8px 24px rgba(7, 59, 85, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        aria-label={label}
      >
        <ArrowUp size={16} className="shrink-0" />
        <span>{label}</span>
      </button>
    </div>
  );
}
