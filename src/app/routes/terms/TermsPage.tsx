import React from 'react';
import { PublicHeader } from '../../../components/layout/PublicHeader';
import { PublicFooter } from '../../../components/layout/PublicFooter';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms & Conditions</h1>
          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <p>Welcome to the Kerala Health Care Portal. By accessing this platform, you agree to comply with and be bound by the following terms and conditions.</p>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Use of Information</h2>
              <p>The resource availability data provided on this portal is for informational purposes only. While we strive for real-time accuracy, MediTrack does not guarantee the availability of resources at the moment of arrival. Always contact the hospital directly before transit.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Emergency Disclaimer</h2>
              <p>This platform is a resource discovery tool and NOT an emergency dispatch service. In life-threatening situations, please contact national emergency services immediately.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Data Accuracy</h2>
              <p>Resource updates are provided by hospital administrators. MediTrack is not liable for inaccuracies resulting from delays in facility reporting.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Limitation of Liability</h2>
              <p>In no event shall MediTrack be liable for any direct, indirect, incidental, or consequential damages arising out of the use or inability to use this service.</p>
            </section>

            <p className="pt-6 border-t border-slate-100 italic">Last updated: September 2026</p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
