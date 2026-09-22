/**
 * About Page
 * Per MediTrack UI Spec - Information about the platform
 */

import { useState } from 'react';
import { PublicHeader } from '../../../components/layout/PublicHeader';
import { PublicFooter } from '../../../components/layout/PublicFooter';
import { MobileNavigation } from '../../../components/layout/MobileNavigation';
import { Shield, Zap, MapPin, Phone, Users, Heart } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Verified & Trusted',
    description: 'Every hospital on MediTrack undergoes verification. We partner with healthcare authorities to ensure data accuracy and reliability.'
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'Resource availability updates in real-time. Know exactly what\'s available before you arrive - ICU beds, ventilators, CT scans, and more.'
  },
  {
    icon: MapPin,
    title: 'Location-Aware',
    description: 'Find the nearest hospitals with the resources you need. Distance, travel time, and directions all in one place.'
  },
  {
    icon: Phone,
    title: 'Direct Connection',
    description: 'One-tap calling to hospital emergency departments. No searching for numbers - connect immediately when seconds matter.'
  },
  {
    icon: Users,
    title: 'Community Focused',
    description: 'Built for patients, families, and first responders. We understand the urgency of emergency situations.'
  },
  {
    icon: Heart,
    title: 'Mission Driven',
    description: 'Every feature exists to save time in emergencies. Better information leads to better decisions and more lives saved.'
  },
];

export function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-page)] flex flex-col">
      <PublicHeader onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[var(--color-brand-light)] pt-[64px] pb-[64px]">
          <div className="container-page">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-[var(--text-hero)] font-bold text-[var(--color-text-primary)] leading-[1.15] tracking-tight">
                About <span className="text-[var(--color-brand-blue)]">MediTrack</span>
              </h1>
              <p className="text-[var(--text-body)] text-[var(--color-text-secondary)] leading-[1.6]">
                MediTrack is an emergency resource discovery platform that helps you quickly locate hospitals with verified
                emergency resources like ICU, ventilators, CT scans, and blood - when every second counts.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-[var(--color-page)] py-[64px]">
          <div className="container-page">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-[var(--text-section)] font-bold text-[var(--color-text-primary)]">
                  Our Mission
                </h2>
                <p className="text-[var(--text-body)] text-[var(--color-text-secondary)] leading-[1.7]">
                  In a medical emergency, every second matters. Yet finding a hospital with the right resources - an available ICU bed,
                  a working ventilator, a functional CT scanner - often involves frantic phone calls, wasted time, and uncertainty.
                </p>
                <p className="text-[var(--text-body)] text-[var(--color-text-secondary)] leading-[1.7]">
                  MediTrack was built to solve this. We aggregate real-time resource availability from verified hospitals and present it
                  in a clear, actionable format. Whether you're a patient, a family member, or a first responder, MediTrack gives you
                  the information you need to make the right decision, fast.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card-surface p-6 space-y-4">
                  <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary)]">
                    What We Do
                  </h3>
                  <ul className="space-y-3 text-[var(--text-body)] text-[var(--color-text-secondary)]">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand-blue)] flex items-center justify-center">
                        <Zap className="w-3 h-3" />
                      </span>
                      <span>Real-time resource availability tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand-blue)] flex items-center justify-center">
                        <Shield className="w-3 h-3" />
                      </span>
                      <span>Verified hospital network</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand-blue)] flex items-center justify-center">
                        <MapPin className="w-3 h-3" />
                      </span>
                      <span>Location-based search with distance sorting</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand-blue)] flex items-center justify-center">
                        <Phone className="w-3 h-3" />
                      </span>
                      <span>Direct emergency contact integration</span>
                    </li>
                  </ul>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary)]">
                    Our Commitment
                  </h3>
                  <ul className="space-y-3 text-[var(--text-body)] text-[var(--color-text-secondary)]">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand-blue)] flex items-center justify-center">
                        <Heart className="w-3 h-3" />
                      </span>
                      <span>Accuracy - Data freshness timestamps on every resource</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand-blue)] flex items-center justify-center">
                        <Shield className="w-3 h-3" />
                      </span>
                      <span>Transparency - Clear status: Available, Unavailable, Unknown</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand-blue)] flex items-center justify-center">
                        <Users className="w-3 h-3" />
                      </span>
                      <span>Accessibility - Works for everyone, on any device</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand-blue)] flex items-center justify-center">
                        <Zap className="w-3 h-3" />
                      </span>
                      <span>Speed - Search to call in under 30 seconds</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-[var(--color-page)] py-[64px]">
          <div className="container-page">
            <div className="text-center max-w-2xl mx-auto mb-[48px]">
              <h2 className="text-[var(--text-section)] font-bold text-[var(--color-text-primary)] mb-4">
                Our Values
              </h2>
              <p className="text-[var(--text-body)] text-[var(--color-text-secondary)]">
                These principles guide every decision we make
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <div key={index} className="card-surface p-6 space-y-4 hover:border-[var(--color-brand-blue)]/30 hover:-translate-y-[1px] transition-all duration-150">
                  <div className="flex items-center justify-center w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-brand-light)] text-[var(--color-brand-blue)] mx-auto">
                    <value.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary)] text-center">{value.title}</h3>
                  <p className="text-[var(--text-body)] text-[var(--color-text-secondary)] text-center leading-[1.6]">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}