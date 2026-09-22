/**
 * Placeholder page for routes not yet fully implemented.
 * Per Phase 1 focus - keep minimal for now.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { MobileNavigation } from '../../components/layout/MobileNavigation';
import { ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-page)] flex flex-col">
      <PublicHeader onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <main className="flex-1 container-page py-16 lg:py-24 flex items-center">
        <div className="w-full max-w-2xl mx-auto text-center space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[var(--color-brand-blue)] hover:text-[var(--color-brand-navy)] font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">{title}</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">{description}</p>
          <p className="text-[var(--color-text-muted)] text-sm">
            This page is under development. The full implementation will be added in a future phase.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}