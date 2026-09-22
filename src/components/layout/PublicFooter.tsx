/**
 * Public Footer Component
 * Per MediTrack UI Spec §13
 * Single row: logo+name+tagline | nav links | copyright
 */

import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-brand-dark)] text-white border-t border-white/10">
      <div className="container-page py-[40px]">
        <div className="flex flex-col md:flex-row items-center justify-between flex-wrap gap-4">
          {/* Left cluster: logo + name + tagline inline */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/" className="flex items-center gap-2" aria-label="MediTrack Home">
              <div className="h-7 w-7 rounded-[var(--radius-sm)] bg-white flex items-center justify-center">
                <Plus className="w-4 h-4 text-[var(--color-brand-navy)]" />
              </div>
              <span className="font-bold text-[16px]">MediTrack</span>
            </Link>
            <span className="text-[12px] text-white/65">· Emergency Resources Platform</span>
          </div>

          {/* Center cluster: nav links */}
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link to="/" className="text-[13px] text-white/75 hover:text-white underline-offset-2 hover:underline transition-colors">Home</Link>
            <Link to="/hospitals" className="text-[13px] text-white/75 hover:text-white underline-offset-2 hover:underline transition-colors">Hospitals</Link>
            <Link to="/about" className="text-[13px] text-white/75 hover:text-white underline-offset-2 hover:underline transition-colors">About</Link>
            <Link to="/contact" className="text-[13px] text-white/75 hover:text-white underline-offset-2 hover:underline transition-colors">Contact</Link>
          </nav>

          {/* Right cluster: copyright */}
          <p className="text-[12px] text-white/55">
            © {currentYear} MediTrack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}