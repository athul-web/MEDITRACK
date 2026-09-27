import React from 'react';
import { PublicHeader } from '../../../components/layout/PublicHeader';
import { PublicFooter } from '../../../components/layout/PublicFooter';

export function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Cookie Policy</h1>
          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <p>This policy explains how the Kerala Health Care Portal uses cookies and similar technologies to provide and improve our service.</p>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">What are Cookies?</h2>
              <p>Cookies are small text files stored on your device that help us remember your preferences and improve your user experience.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">How We Use Cookies</h2>
              <p>We use essential cookies to maintain session stability and analytical cookies to understand how visitors interact with our portal to optimize resource discovery flows.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Your Choices</h2>
              <p>You can manage or disable cookies through your browser settings. However, disabling essential cookies may affect the functionality of certain features of the portal.</p>
            </section>

            <p className="pt-6 border-t border-slate-100 italic">Last updated: September 2026</p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
