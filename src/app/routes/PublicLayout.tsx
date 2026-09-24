import React, { useState } from 'react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { MobileNavigation } from '../../components/layout/MobileNavigation';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <PublicHeader onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />

      <MobileNavigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
