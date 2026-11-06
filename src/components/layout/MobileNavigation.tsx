/**
 * Mobile Navigation Drawer
 * Per MediTrack UI Spec §3 Mobile
 * Full-height slide-in panel from right, bg brand-navy, nav links stacked, login pill button
 */

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Plus, LayoutDashboard } from 'lucide-react';
import { createPortal } from 'react-dom';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/hospitals', label: 'Hospitals' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer - full height, bg brand-navy, slide in from right */}
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-[var(--color-brand-navy)] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link to="/" onClick={onClose} className="flex items-center gap-2" aria-label="MediTrack Home">
            <div className="h-8 w-8 rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base">MediTrack</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-[var(--radius-sm)] text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links - stacked, 52px tall tap targets */}
        <nav className="flex-1 py-4 px-4 space-y-0 overflow-y-auto" aria-label="Main navigation">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center h-[52px] px-3 text-base font-medium transition-colors rounded-[var(--radius-sm)] ${
                isActive(item.path)
                  ? 'bg-white/10 text-white'
                  : 'text-white/85 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-white/10 px-4" />

        {/* Hospital Staff Login - full-width pill button with 16px top margin */}
        <Link
          to="/login"
          onClick={onClose}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--radius-pill)] border border-white/40 bg-transparent text-white text-[14px] font-medium mt-4 mx-4 transition-colors hover:bg-white/10"
        >
          <LayoutDashboard className="w-5 h-5" />
          Hospital Staff Login
        </Link>

        {/* Emergency Numbers */}
        <div className="px-4 pb-6 space-y-2 text-sm text-white/70">
          <p className="font-semibold text-white">Emergency Numbers</p>
          <div className="grid grid-cols-2 gap-2">
            <p>National Emergency: <strong className="text-white">108</strong></p>
            <p>Ambulance: <strong className="text-white">102</strong></p>
            <p>Police: <strong className="text-white">100</strong></p>
            <p>Fire: <strong className="text-white">101</strong></p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}