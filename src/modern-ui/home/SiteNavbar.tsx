import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export function SiteNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHospitals = location.pathname.startsWith('/hospitals');
  const isAbout = location.pathname.startsWith('/about');
  const isContact = location.pathname.startsWith('/contact');

  const NAV_LINKS = [
    { label: 'Home', href: (isHospitals || isAbout || isContact) ? '/' : '#hero', isRouterLink: isHospitals || isAbout || isContact },
    { label: 'Hospitals', href: '/hospitals', isRouterLink: true },
    { label: 'About', href: '/about', isRouterLink: true },
    { label: 'Contact', href: '/contact', isRouterLink: true },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3"
      style={{
        background: 'rgba(5,47,75,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
      aria-label="Site navigation"
    >
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 no-underline shrink-0 min-w-0">
        {/* Logo mark */}
        <div className="relative w-10 h-10 lg:w-[70px] lg:h-[70px] shrink-0">
          <img src="/logo.png" alt="MediTrack logo" width="70" height="70" className="w-10 h-10 lg:w-[70px] lg:h-[70px] object-contain" />
        </div>
        <div className="min-w-0">
          <div className="text-white font-bold text-base lg:text-lg leading-tight tracking-wide">MediTrack</div>
          <div className="hidden lg:block text-xs leading-tight" style={{ color: '#19D5E5' }}>
            Emergency Resources | When It Matters
          </div>
        </div>
      </Link>

      {/* Desktop nav links */}
      <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0 absolute left-1/2 -translate-x-1/2">
        {NAV_LINKS.map((link) => {
          const isActive = isHospitals ? link.label === 'Hospitals' : isAbout ? link.label === 'About' : isContact ? link.label === 'Contact' : link.label === 'Home';
          const linkClasses = "px-4 py-2 text-sm font-medium rounded-md no-underline flex flex-col items-center transition-colors";
          const linkStyle = { color: isActive ? '#19D5E5' : 'rgba(255,255,255,0.75)' };

          return (
            <li key={link.label}>
              {link.isRouterLink ? (
                <Link
                  to={link.href}
                  className={linkClasses}
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="mt-0.5 h-0.5 w-full rounded-full"
                      style={{ background: '#19D5E5' }}
                    />
                  )}
                </Link>
              ) : (
                <a
                  href={link.href}
                  className={linkClasses}
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)';
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="mt-0.5 h-0.5 w-full rounded-full"
                      style={{ background: '#19D5E5' }}
                    />
                  )}
                </a>
              )}
            </li>
          );
        })}
      </ul>

      {/* Staff Login CTA */}
      <button
        onClick={() => navigate('/dashboard')}
        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white border border-white/30 transition-all cursor-pointer shrink-0"
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
        aria-label="Hospital Staff Login"
      >
        <Users size={15} />
        Hospital Staff Login
      </button>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white p-2 cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        style={{ background: 'transparent', border: 'none' }}
      >
        <span className="flex flex-col gap-1.5">
          <span className="block w-5 h-0.5 bg-white" />
          <span className="block w-5 h-0.5 bg-white" />
          <span className="block w-5 h-0.5 bg-white" />
        </span>
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="absolute top-full left-0 right-0 md:hidden flex flex-col py-4 px-6 gap-2"
          style={{
            background: 'rgba(5,47,75,0.98)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {NAV_LINKS.map((link) =>
            link.isRouterLink ? (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-white/80 py-2 text-sm no-underline hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-white/80 py-2 text-sm no-underline hover:text-white transition-colors"
              >
                {link.label}
              </a>
            )
          )}
          <button
            onClick={() => {
              setMobileOpen(false);
              navigate('/dashboard');
            }}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-white/30 text-white w-fit cursor-pointer"
            style={{ background: 'transparent' }}
          >
            <Users size={15} />
            Hospital Staff Login
          </button>
        </div>
      )}
    </nav>
  );
}
