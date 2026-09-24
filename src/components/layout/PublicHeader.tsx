/**
 * Public Header Component
 * Per MediTrack UI Spec §3
 * Separate from hospital staff header.
 */

import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

interface PublicHeaderProps {
  onMenuClick: () => void;
}

export function PublicHeader({ onMenuClick }: PublicHeaderProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-brand-navy)] text-white h-[72px]">
      <div className="container-page h-full">
        {/* Using grid for 3-column layout: left cluster | center nav | right cluster */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-full gap-4">
          {/* Left cluster: Logo + Wordmark + Tagline */}
          <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="MediTrack Home">
            <img
              src="/logo.png"
              alt="MediTrack Logo"
              className="h-12 w-auto object-contain ml-2"
            />
            <div className="hidden md:block">
              <span className="font-bold text-[20px] tracking-tight leading-tight">MediTrack</span>
              <p className="text-[var(--color-brand-light)] text-[12px] leading-none -mt-0.5">Emergency Resources | When It Matters</p>
            </div>
          </Link>

          {/* Center cluster: Primary Nav - centered using grid */}
          <nav className="hidden md:flex items-center justify-center gap-8" aria-label="Main navigation">
            <Link
              to="/"
              className={`relative text-[15px] font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-white/85 hover:text-white'}`}
            >
              Home
              {isActive('/') && (
                <span className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-white" aria-hidden="true" />
              )}
            </Link>
            <Link
              to="/hospitals"
              className={`relative text-[15px] font-medium transition-colors ${isActive('/hospitals') ? 'text-white' : 'text-white/85 hover:text-white'}`}
            >
              Hospitals
              {isActive('/hospitals') && (
                <span className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-white" aria-hidden="true" />
              )}
            </Link>
            <Link
              to="/about"
              className={`relative text-[15px] font-medium transition-colors ${isActive('/about') ? 'text-white' : 'text-white/85 hover:text-white'}`}
            >
              About
              {isActive('/about') && (
                <span className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-white" aria-hidden="true" />
              )}
            </Link>
            <Link
              to="/contact"
              className={`relative text-[15px] font-medium transition-colors ${isActive('/contact') ? 'text-white' : 'text-white/85 hover:text-white'}`}
            >
              Contact
              {isActive('/contact') && (
                <span className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-white" aria-hidden="true" />
              )}
            </Link>
          </nav>

          {/* Right cluster: Hospital Staff Login */}
          <div className="flex items-center justify-end shrink-0">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-pill)] border border-white/40 bg-transparent text-white text-[14px] font-medium transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-navy)]"
            >
              <LayoutDashboard className="w-4 h-4" />
              Hospital Staff Login
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2.5 rounded-[var(--radius-sm)] bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Open menu"
              aria-expanded="false"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}