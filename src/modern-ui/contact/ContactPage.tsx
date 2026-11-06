import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  MessageSquare,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  ChevronRight,
  Heart,
  Shield,
  Send,
  Building,
} from 'lucide-react';
import { SiteNavbar } from '../home/SiteNavbar';

/* ─── Intersection-observer fade-in ─── */
function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Contact info card ─── */
interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  title: string;
  detail: React.ReactNode;
  accentBg: string;
  accentColor: string;
  accentBorder: string;
}

function InfoCard({ icon, label, title, detail, accentBg, accentColor, accentBorder }: InfoCardProps) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="bg-white rounded-2xl border p-6 flex flex-col gap-3 cursor-default"
      style={{
        borderColor: hov ? accentBorder : '#D9E6EE',
        boxShadow: hov
          ? `0 10px 28px -6px rgba(7,59,85,0.1)`
          : '0 2px 12px rgba(18,43,67,0.04)',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accentBg }}
      >
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <div>
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: accentColor }}
        >
          {label}
        </span>
        <h3 className="text-sm font-bold text-[#122B43] mt-0.5 mb-1">{title}</h3>
        <div className="text-sm text-[#60778C] leading-relaxed">{detail}</div>
      </div>
    </div>
  );
}

/* ─── Form types ─── */
interface FormData {
  fullName: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  subject?: string;
  category?: string;
  message?: string;
}

const CATEGORIES = [
  { value: '', label: 'Select an enquiry category…' },
  { value: 'General Support / Feedback', label: 'General Support / Feedback' },
  { value: 'Hospital Partner Registration', label: 'Hospital Partner Registration' },
  { value: 'Report Data Discrepancy', label: 'Report Data Discrepancy' },
  { value: 'API & Developer Integration', label: 'API & Developer Integration' },
];

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};
  const trimmedName = data.fullName.trim();
  const nameParts = trimmedName.split(/\s+/).filter(Boolean);
  if (!trimmedName) errors.fullName = 'Full name is required.';
  else if (nameParts.length < 2) errors.fullName = 'Please enter your first and last name.';
  else if (nameParts[0].length < 2 || nameParts.slice(1).join(' ').length < 2)
    errors.fullName = 'First and last names must be at least 2 characters.';
  else if (trimmedName.length > 100) errors.fullName = 'Name must be at most 100 characters.';

  if (!data.email.trim()) errors.email = 'Email address is required.';
  else if (data.email.trim().length > 255) errors.email = 'Email address is too long.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Please enter a valid email address.';

  if (!data.subject.trim()) errors.subject = 'Subject is required.';
  else if (data.subject.trim().length < 4) errors.subject = 'Subject must be at least 4 characters.';

  if (!data.category) errors.category = 'Please select an enquiry category.';
  else if (
    ![
      'General Support / Feedback',
      'Hospital Partner Registration',
      'Report Data Discrepancy',
      'API & Developer Integration',
    ].includes(data.category)
  )
    errors.category = 'Please select a valid enquiry category.';

  if (!data.message.trim()) errors.message = 'Message is required.';
  else if (data.message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';
  else if (data.message.trim().length > 2000) errors.message = 'Message must be at most 2000 characters.';

  return errors;
}

/* ─── Contact Form Component ─── */
function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateForm({ ...formData, [name]: value })[name as keyof FormErrors] }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateForm(formData)[name as keyof FormErrors] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(formData).map((k) => [k, true]));
    setTouched(allTouched);
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitState('loading');

    try {
      const nameParts = formData.fullName.trim().split(/\s+/).filter(Boolean);
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: {
          firstName: nameParts[0] ?? '',
          lastName: nameParts.slice(1).join(' ') || nameParts[0] || '',
          email: formData.email.trim(),
          phone: '',
          inquiryType: formData.category,
          message: formData.message.trim(),
          honeypot: '',
        },
      });
      if (error) throw error;
      if (data && data.error) throw new Error(data.error);
      setSubmitState('success');
    } catch {
      setSubmitState('error');
    }
  };

  const handleReset = () => {
    setFormData({ fullName: '', email: '', subject: '', category: '', message: '' });
    setErrors({});
    setTouched({});
    setSubmitState('idle');
  };

  /* Shared input style helpers */
  const fieldBase = 'w-full rounded-xl border text-sm text-[#122B43] placeholder-[#9DB4C5] bg-white px-4 py-3 outline-none transition-all duration-200 focus:ring-2';
  const fieldOk = 'border-[#D9E6EE] focus:border-[#087D91] focus:ring-[#00D5E8]/20';
  const fieldErr = 'border-rose-400 focus:border-rose-500 focus:ring-rose-200/40';

  /* ── Success screen ── */
  if (submitState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: 'linear-gradient(135deg, #E4F6FA 0%, #BCEBF5 100%)', border: '2px solid #19D5E5' }}
        >
          <CheckCircle2 size={38} className="text-[#087D91]" />
        </div>
        <h3 className="text-2xl font-extrabold text-[#122B43] tracking-tight">Message Received</h3>
        <p className="text-sm text-[#60778C] max-w-sm leading-relaxed">
          Thank you for reaching out. The MediTrack team will review your enquiry and respond as soon as possible.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#073B55] hover:bg-[#052F4B] transition-colors cursor-pointer shadow-xs"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Row: Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-bold text-[#122B43] mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="e.g. Avandhika Krishna"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            className={`${fieldBase} ${errors.fullName && touched.fullName ? fieldErr : fieldOk}`}
          />
          {errors.fullName && touched.fullName && (
            <p id="fullName-error" role="alert" className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.fullName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-[#122B43] mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`${fieldBase} ${errors.email && touched.email ? fieldErr : fieldOk}`}
          />
          {errors.email && touched.email && (
            <p id="email-error" role="alert" className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Row: Category + Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-xs font-bold text-[#122B43] mb-1.5">
            Enquiry Category <span className="text-rose-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? 'category-error' : undefined}
            className={`${fieldBase} cursor-pointer ${errors.category && touched.category ? fieldErr : fieldOk}`}
            style={{ appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2360778C' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} disabled={c.value === ''}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.category && touched.category && (
            <p id="category-error" role="alert" className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.category}
            </p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-xs font-bold text-[#122B43] mb-1.5">
            Subject <span className="text-rose-500">*</span>
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            placeholder="Brief topic of your message"
            value={formData.subject}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            className={`${fieldBase} ${errors.subject && touched.subject ? fieldErr : fieldOk}`}
          />
          {errors.subject && touched.subject && (
            <p id="subject-error" role="alert" className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.subject}
            </p>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-xs font-bold text-[#122B43] mb-1.5">
          Message <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Write your message here…"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className={`${fieldBase} resize-none ${errors.message && touched.message ? fieldErr : fieldOk}`}
        />
        <div className="flex items-start justify-between mt-1">
          {errors.message && touched.message ? (
            <p id="message-error" role="alert" className="text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.message}
            </p>
          ) : <span />}
          <span className="text-[11px] text-[#9DB4C5]">{formData.message.length} / 10 min</span>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={submitState === 'loading'}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
          style={{
            background: 'linear-gradient(135deg, #073B55 0%, #087D91 100%)',
          }}
          onMouseEnter={(e) => {
            if (submitState !== 'loading')
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,213,232,0.35)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '';
          }}
        >
          {submitState === 'loading' ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span>Sending…</span>
            </>
          ) : (
            <>
              <Send size={15} />
              <span>Send Message</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: '#F3F8FC' }}>
      <SiteNavbar />

      <main className="flex-1 pt-24">

        {/* ══════════════════════════════════════════
            SECTION 1 — Hero
        ══════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #001525 0%, #052F4B 50%, #073B55 100%)',
          }}
        >
          {/* Radial glows */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(ellipse at top right, #00D5E8 0%, transparent 65%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-[320px] h-[320px] pointer-events-none opacity-10"
            style={{ background: 'radial-gradient(ellipse at bottom left, #087D91 0%, transparent 65%)' }}
          />

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="max-w-3xl">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
                style={{ background: 'rgba(0,213,232,0.12)', color: '#00D5E8', border: '1px solid rgba(0,213,232,0.3)' }}
              >
                <MessageSquare size={12} />
                Contact Us
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5">
                {"Let's"}{' '}
                <span style={{ color: '#00D5E8' }}>Connect.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Have a question, need assistance, or interested in joining the MediTrack network?
                We&apos;d love to hear from you.
              </p>
            </div>
          </div>

          {/* Wave transition */}
          <div className="relative h-14 overflow-hidden">
            <svg
              viewBox="0 0 1440 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute bottom-0 w-full"
              preserveAspectRatio="none"
            >
              <path d="M0,28 C360,56 720,0 1080,28 C1260,42 1380,14 1440,28 L1440,56 L0,56 Z" fill="#F3F8FC" />
            </svg>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION 2 — Contact Info Cards
        ══════════════════════════════════════════ */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeSection>
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#087D91]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#087D91]">
                    How to Reach Us
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#122B43] tracking-tight">
                  We&apos;re here when you need us
                </h2>
              </div>
            </FadeSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <FadeSection delay={0}>
                <InfoCard
                  icon={<Phone size={20} />}
                  label="Emergency Hotline"
                  title="National Ambulance"
                  detail={
                    <a
                      href="tel:108"
                      className="font-bold text-[#073B55] hover:text-[#087D91] transition-colors text-xl tracking-tight"
                    >
                      108
                    </a>
                  }
                  accentBg="#FEF2F2"
                  accentColor="#DC2626"
                  accentBorder="#FECACA"
                />
              </FadeSection>

              <FadeSection delay={80}>
                <InfoCard
                  icon={<Clock size={20} />}
                  label="Support Availability"
                  title="Emergency coordination"
                  detail={
                    <span className="leading-relaxed">
                      Emergency services operate <strong className="text-[#122B43]">24 hours a day, 7 days a week</strong>.
                      Platform support enquiries are reviewed during business hours.
                    </span>
                  }
                  accentBg="#E4F6FA"
                  accentColor="#087D91"
                  accentBorder="#BCEBF5"
                />
              </FadeSection>

              <FadeSection delay={160}>
                <InfoCard
                  icon={<Users size={20} />}
                  label="Staff Portal"
                  title="Hospital Staff Access"
                  detail={
                    <span className="leading-relaxed">
                      Hospital operators can access the{' '}
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="font-semibold text-[#087D91] hover:underline cursor-pointer bg-transparent border-none p-0"
                      >
                        MediTrack Staff Dashboard
                      </button>{' '}
                      to manage resources and update availability.
                    </span>
                  }
                  accentBg="#F5F3FF"
                  accentColor="#7C3AED"
                  accentBorder="#DDD6FE"
                />
              </FadeSection>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION 3 — Contact Form + Side Info
        ══════════════════════════════════════════ */}
        <section
          className="py-16 sm:py-20"
          style={{ background: 'linear-gradient(180deg, #EBF4FA 0%, #F3F8FC 100%)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

              {/* Left — Side panel */}
              <FadeSection className="lg:col-span-4" delay={0}>
                <div className="space-y-6 lg:sticky lg:top-28">
                  {/* Heading */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#087D91]" />
                      <span className="text-xs font-bold uppercase tracking-widest text-[#087D91]">
                        Send a Message
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#122B43] tracking-tight mb-3">
                      We read every enquiry
                    </h2>
                    <p className="text-sm text-[#60778C] leading-relaxed">
                      Whether you have a question about the platform, need help with hospital data, or want to explore a partnership — use the form to get in touch with the MediTrack team.
                    </p>
                  </div>

                  {/* What to expect */}
                  <div
                    className="rounded-2xl p-5 border border-[#D9E6EE] bg-white"
                    style={{ boxShadow: '0 2px 12px rgba(18,43,67,0.04)' }}
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#60778C] mb-4">
                      What to expect
                    </h4>
                    <ul className="space-y-3">
                      {[
                        { icon: <CheckCircle2 size={14} />, text: 'Your message will be acknowledged promptly.' },
                        { icon: <CheckCircle2 size={14} />, text: 'Technical issues are prioritized during business hours.' },
                        { icon: <CheckCircle2 size={14} />, text: 'Hospital registration enquiries are reviewed by our network team.' },
                        { icon: <Shield size={14} />, text: 'Your information is kept confidential and not shared.' },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-[#60778C]">
                          <span className="text-[#087D91] mt-0.5 shrink-0">{item.icon}</span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Emergency callout */}
                  <div
                    className="rounded-2xl p-5 border border-[#FECACA] bg-[#FEF2F2]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Heart size={15} className="text-[#DC2626]" />
                      <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wide">
                        Medical Emergency?
                      </span>
                    </div>
                    <p className="text-xs text-[#60778C] mb-3 leading-relaxed">
                      Do not use this form for medical emergencies. Call the National Ambulance immediately.
                    </p>
                    <a
                      href="tel:108"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-white no-underline transition-colors"
                      style={{ background: '#DC2626' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#b91c1c'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#DC2626'; }}
                    >
                      <Phone size={14} />
                      Call 108 Now
                    </a>
                  </div>
                </div>
              </FadeSection>

              {/* Right — Form card */}
              <FadeSection className="lg:col-span-8" delay={120}>
                <div
                  className="bg-white rounded-3xl border border-[#D9E6EE] p-7 sm:p-10"
                  style={{ boxShadow: '0 4px 24px rgba(18,43,67,0.06)' }}
                >
                  <ContactForm />
                </div>
              </FadeSection>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION 4 — Hospital Partnership CTA
        ══════════════════════════════════════════ */}
        <section className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeSection>
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #001525 0%, #063B56 55%, #073B55 100%)',
                  boxShadow: '0 20px 60px -10px rgba(5,47,75,0.4)',
                }}
              >
                {/* Decorative glows */}
                <div
                  className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-20"
                  style={{ background: 'radial-gradient(circle, #00D5E8 0%, transparent 70%)' }}
                />

                <div className="relative z-10 p-10 sm:p-14 flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
                  {/* Text */}
                  <div className="max-w-lg text-center md:text-left">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                      style={{ background: 'rgba(0,213,232,0.12)', color: '#00D5E8', border: '1px solid rgba(0,213,232,0.3)' }}
                    >
                      <Building size={12} />
                      For Healthcare Facilities
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                      Are you representing a hospital?
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Connect your healthcare facility with MediTrack and help improve access to emergency resource information for people in your region.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-white transition-all cursor-pointer whitespace-nowrap shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #087D91 0%, #00D5E8 100%)', boxShadow: '0 4px 20px rgba(0,213,232,0.3)' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(0,213,232,0.5)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,213,232,0.3)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      }}
                    >
                      <Users size={16} />
                      <span>Hospital Staff Portal</span>
                      <ChevronRight size={16} />
                    </button>

                    <Link
                      to="/about"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold no-underline transition-all whitespace-nowrap"
                      style={{
                        color: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                        (e.currentTarget as HTMLElement).style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)';
                      }}
                    >
                      <ArrowRight size={15} />
                      <span>Learn About MediTrack</span>
                    </Link>
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer
        id="contact-footer"
        className="py-10 text-white border-t border-slate-700/50"
        style={{ background: '#052F4B' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#087D91]/40 border border-[#19D5E5] flex items-center justify-center">
              <span className="text-[#19D5E5] font-black text-sm">+</span>
            </div>
            <div>
              <div className="font-bold text-sm text-white">MediTrack</div>
              <div className="text-[11px] text-[#19D5E5]">Emergency Resources | When It Matters</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/hospitals" className="hover:text-white transition-colors">Hospitals</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="text-white font-semibold transition-colors">Contact</Link>
          </div>

          <div className="text-xs text-slate-400 text-center sm:text-right">
            © {new Date().getFullYear()} MediTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
