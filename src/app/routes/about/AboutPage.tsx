import React, { useState } from 'react';
import { PublicHeader } from '../../../components/layout/PublicHeader';
import { PublicFooter } from '../../../components/layout/PublicFooter';
import { MobileNavigation } from '../../../components/layout/MobileNavigation';
import { Target, ShieldCheck, Heart, Zap, MapPin, Phone, Users } from 'lucide-react';

/**
 * About Page implementation based on gemini-code-1790186876109.html
 */
export function AboutPage() {
  return (
    <>
      {/* Header Hero Section */}
      <div className="relative bg-gradient-to-r from-cyan-900 via-sky-800 to-slate-900 text-white overflow-hidden pb-16">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1600')" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-widest">Our Mission & Platform</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-1 leading-tight">
              Bridging the Gap Between Patients & Emergency Care
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              MediTrack was built to eliminate critical delays during medical emergencies by providing real-time visibility into hospital beds, ICU units, ventilators, and emergency diagnostic facilities.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics / Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xl">
          <StatItem value="120+" label="Verified Hospitals" />
          <StatItem value="< 2 min" label="Data Sync Refresh" />
          <StatItem value="15,000+" label="Searches Assisted" />
          <StatItem value="24 / 7" label="Network Availability" />
        </div>
      </section>

      {/* Core Values & Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-700 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">The Problem We Solve</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                During critical trauma, cardiac, or respiratory emergencies, families often waste precious minutes driving from hospital to hospital, only to find filled ICU beds or unavailable equipment. MediTrack stops this guesswork by showing direct live statuses before you leave home.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-700 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Verified & Reliable Data</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                Every hospital listed on MediTrack is authenticated with official administration dashboards or automated IoT triggers, ensuring that resource updates reflect true, on-ground status with accurate timestamps.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Timeline */}
        <section className="bg-slate-100/70 rounded-2xl border border-slate-200/80 p-6 sm:p-10">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">How MediTrack Operates</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">A simple three-step synchronization pipeline</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              step="Step 01"
              title="Hospital Staff Updates"
              description="Staff update room and machinery availability via a quick one-tap portal whenever beds open up or close."
            />
            <StepCard
              step="Step 02"
              title="Real-Time Processing"
              description="Data is formatted, tagged with high-priority emergency categories, and indexed with GPS proximity metadata."
            />
            <StepCard
              step="Step 03"
              title="Instant Citizen Access"
              description="Patients and ambulance services search, filter by equipment needs, and connect with direct emergency desks instantly."
            />
          </div>
        </section>

        {/* Bottom CTA Card */}
        <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-2xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl font-bold">Are you a healthcare facility manager?</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Integrate your facility into the MediTrack emergency network to help redirect emergency patients to available beds seamlessly.
            </p>
          </div>
          <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shrink-0">
            Register Your Hospital
          </button>
        </div>
      </div>
    </>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center border-r last:border-r-0 border-slate-100 px-2">
      <span className="text-2xl sm:text-4xl font-extrabold text-cyan-700">{value}</span>
      <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative">
      <div className="text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-full w-fit mb-3">
        {step}
      </div>
      <h4 className="font-bold text-slate-900 text-base">{title}</h4>
      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
