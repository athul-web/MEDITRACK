/**
 * Contact Page
 * Per MediTrack UI Spec - Contact information and emergency numbers
 */

import { useState } from 'react';
import { PublicHeader } from '../../../components/layout/PublicHeader';
import { PublicFooter } from '../../../components/layout/PublicFooter';
import { MobileNavigation } from '../../../components/layout/MobileNavigation';
import { Mail, Phone, MapPin, Clock, AlertCircle, Send, Loader2 } from 'lucide-react';

const emergencyNumbers = [
  { label: 'National Emergency', number: '108', description: 'Medical, fire, police' },
  { label: 'Ambulance', number: '102', description: 'Emergency medical transport' },
  { label: 'Police', number: '100', description: 'Law enforcement emergency' },
  { label: 'Fire Department', number: '101', description: 'Fire and rescue services' },
  { label: 'Women Helpline', number: '1091', description: 'Women safety emergency' },
  { label: 'Child Helpline', number: '1098', description: 'Child protection emergency' },
];

const contactInfo = [
  { icon: Mail, label: 'General Inquiries', value: 'hello@meditrack.example', href: 'mailto:hello@meditrack.example' },
  { icon: Phone, label: 'Support', value: '+91 80 1234 5678', href: 'tel:+918012345678' },
  { icon: MapPin, label: 'Office', value: 'Bangalore, Karnataka, India', href: null },
  { icon: Clock, label: 'Hours', value: 'Mon-Fri 9AM-6PM IST', href: null },
];

export function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setFormState('success');
    setFormData({ name: '', email: '', subject: '', message: '' });

    // Reset to idle after 3 seconds
    setTimeout(() => setFormState('idle'), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
                Contact <span className="text-[var(--color-brand-blue)]">Us</span>
              </h1>
              <p className="text-[var(--text-body)] text-[var(--color-text-secondary)] leading-[1.6]">
                Have questions, feedback, or need support? We'd love to hear from you.
              </p>
            </div>
          </div>
        </section>

        {/* Emergency Numbers - Prominent at top */}
        <section className="bg-[var(--color-page)] py-[40px] border-b border-[var(--color-border)]">
          <div className="container-page">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-unavailable)]/10">
                <AlertCircle className="w-5 h-5 text-[var(--color-unavailable)]" />
              </div>
              <h2 className="text-[var(--text-section)] font-bold text-[var(--color-text-primary)]">
                Emergency Numbers
              </h2>
            </div>
            <p className="text-[var(--text-body)] text-[var(--color-text-secondary)] mb-6 max-w-2xl">
              For immediate emergencies, please call these numbers directly. Do not use the contact form below for urgent medical situations.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyNumbers.map((emergency, index) => (
                <div key={index} className="card-surface p-4 hover:border-[var(--color-brand-blue)]/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary)]">{emergency.label}</h3>
                    <a href={`tel:${emergency.number}`} className="btn-secondary-filled text-sm px-3 py-1.5 gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      Call
                    </a>
                  </div>
                  <p className="text-[var(--text-meta)] text-[var(--color-text-secondary)]">{emergency.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="bg-[var(--color-page)] py-[64px]">
          <div className="container-page">
            <div className="grid lg:grid-cols-[1fr_1fr] gap-[48px]">
              {/* Contact Form */}
              <div className="space-y-6">
                <h2 className="text-[var(--text-section)] font-bold text-[var(--color-text-primary)]">
                  Send Us a Message
                </h2>
                <p className="text-[var(--text-body)] text-[var(--color-text-secondary)]">
                  For non-emergency inquiries, feedback, or partnership requests, fill out the form below.
                </p>

                {formState === 'success' && (
                  <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-available)]/10 border border-[var(--color-available)]/20 text-[var(--color-available)]">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Thank you! Your message has been sent. We'll get back to you soon.</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="field-label">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={formState === 'submitting'}
                        className="input-field"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="field-label">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={formState === 'submitting'}
                        className="input-field"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="field-label">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      disabled={formState === 'submitting'}
                      className="select-field"
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                      <option value="press">Press / Media</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="field-label">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={formState === 'submitting'}
                      rows={5}
                      className="input-field resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {formState === 'submitting' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <h2 className="text-[var(--text-section)] font-bold text-[var(--color-text-primary)]">
                  Other Ways to Reach Us
                </h2>

                <div className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <a
                      key={index}
                      href={item.href || '#'}
                      className={item.href ? 'flex items-center gap-4 p-4 card-surface hover:border-[var(--color-brand-blue)]/30 transition-colors' : 'flex items-center gap-4 p-4 card-surface'}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-brand-light)] text-[var(--color-brand-blue)] flex-shrink-0">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[var(--text-meta)] text-[var(--color-text-muted)]">{item.label}</p>
                        <p className="text-[var(--text-body)] text-[var(--color-text-primary)] font-medium">{item.value}</p>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="card-surface p-6 space-y-4 border-l-4 border-[var(--color-brand-blue)]">
                  <h3 className="text-[var(--text-component)] font-semibold text-[var(--color-text-primary)]">
                    Hospital Partnership Inquiries
                  </h3>
                  <p className="text-[var(--text-body)] text-[var(--color-text-secondary)]">
                    Are you a hospital administrator interested in joining the MediTrack network?
                    We partner with verified hospitals to provide real-time resource availability to patients in need.
                  </p>
                  <a href="mailto:partnerships@meditrack.example" className="btn-text w-fit">
                    Contact Partnerships Team
                    <Send className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}