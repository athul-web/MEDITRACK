import React, { useState } from 'react';
import { PublicHeader } from '../../../components/layout/PublicHeader';
import { PublicFooter } from '../../../components/layout/PublicFooter';
import { MobileNavigation } from '../../../components/layout/MobileNavigation';
import { Mail, Phone, MapPin, Clock, AlertCircle, Send, Loader2, PhoneCall } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

/**
 * Contact Page implementation based on gemini-code-1790187003514.html
 */
export function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    inquiryType: 'General Support / Feedback',
    message: '',
    honeypot: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: formData,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setFormState('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        inquiryType: 'General Support / Feedback',
        message: '',
        honeypot: '',
      });
    } catch (err: any) {
      setFormState('error');
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <PublicHeader onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="flex-1">
        {/* Header Hero Section */}
        <div className="relative bg-gradient-to-r from-cyan-900 via-sky-800 to-slate-900 text-white overflow-hidden pb-16">
          {/* Background Image Overlay */}
          <div
            className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1600')" }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold text-cyan-300 uppercase tracking-widest">Immediate Assistance & Inquiries</span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-1 leading-tight">
                Emergency Numbers & Support
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                Access immediate national emergency helplines below or reach out to our team for platform support and hospital onboarding.
              </p>
            </div>
          </div>
        </div>

        {/* National Emergency Helplines Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h2 className="text-lg font-bold text-slate-900">National Emergency Helplines</h2>
              </div>
              <span className="hidden sm:inline-flex bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                Immediate Dispatch
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <EmergencyNumberCard
                label="National Emergency"
                number="112 / 108"
                description="Medical, fire, police"
                color="bg-rose-600"
                callLink="tel:112"
              />
              <EmergencyNumberCard
                label="Ambulance"
                number="102 / 108"
                description="Emergency medical transport"
                color="bg-cyan-700"
                callLink="tel:102"
              />
              <EmergencyNumberCard
                label="Police"
                number="100"
                description="Law enforcement emergency"
                color="bg-slate-900"
                callLink="tel:100"
              />
              <EmergencyNumberCard
                label="Fire Department"
                number="101"
                description="Fire and rescue services"
                color="bg-amber-600"
                callLink="tel:101"
              />
              <EmergencyNumberCard
                label="Women Helpline"
                number="1091"
                description="Women safety emergency"
                color="bg-purple-700"
                callLink="tel:1091"
              />
              <EmergencyNumberCard
                label="Child Helpline"
                number="1098"
                description="Child protection emergency"
                color="bg-teal-700"
                callLink="tel:1098"
              />
            </div>
          </div>
        </section>

        {/* Contact Form & Platform Details Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Platform Offices */}
            <aside className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">MediTrack Offices</h3>

                <div className="flex items-start gap-4">
                  <div className="bg-cyan-50 text-cyan-700 p-3 rounded-xl shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Email Inquiries</h4>
                    <p className="text-xs text-slate-500 mt-0.5">support@meditrack.in</p>
                    <p className="text-xs text-slate-500">hospitals@meditrack.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-cyan-50 text-cyan-700 p-3 rounded-xl shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Platform Desk</h4>
                    <p className="text-xs text-slate-500 mt-0.5">+91 1800-425-9999 (Toll-Free)</p>
                    <p className="text-xs text-slate-500">Mon - Sat: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-cyan-50 text-cyan-700 p-3 rounded-xl shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Headquarters</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      MediTrack Health Technologies <br />
                      Infopark Campus, Kakkanad, Kochi, Kerala 682030
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Column: Contact Form */}
            <section className="lg:col-span-7">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">Send Us a Message</h3>
                <p className="text-xs text-slate-500 mt-1">For general inquiries, data corrections, or onboarding support.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                        disabled={formState === 'submitting'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                        disabled={formState === 'submitting'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        disabled={formState === 'submitting'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        disabled={formState === 'submitting'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Inquiry Type</label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option>General Support / Feedback</option>
                      <option>Hospital Partner Registration</option>
                      <option>Report Data Discrepancy</option>
                      <option>API & Developer Integration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={formState === 'submitting'}
                      rows={4}
                      placeholder="How can we help you?"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    ></textarea>
                  </div>

                    {formState === 'success' && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="text-emerald-500">✓</span>
                        Message sent successfully! We'll get back to you soon.
                      </div>
                    )}

                    {formState === 'error' && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        {errorMessage}
                      </div>
                    )}

                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="w-full sm:w-auto bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs px-8 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {formState === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function EmergencyNumberCard({ label, number, description, color, callLink }: { label: string; number: string; description: string; color: string; callLink: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-lg font-black text-slate-900 group-hover:text-cyan-600 transition-colors">{number}</span>
      </div>
      <p className="text-xs text-slate-600 font-medium">{description}</p>
      <a
        href={callLink}
        className={`mt-4 w-full ${color} hover:brightness-90 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors`}
      >
        <PhoneCall className="w-3.5 h-3.5" />
        <span>Call {number.split(' / ')[0]}</span>
      </a>
    </div>
  );
}
