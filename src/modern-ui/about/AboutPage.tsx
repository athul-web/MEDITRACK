import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Zap,
  ShieldCheck,
  Phone,
  Users,
  Activity,
  ArrowRight,
  Heart,
  Building,
  Wind,
  Droplets,
  RefreshCw,
  Search,
  Navigation,
  ChevronRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { SiteNavbar } from '../home/SiteNavbar';
import { MedicalOrbit } from './MedicalOrbit';

/* ─── Intersection Observer hook for section fade-ins ─── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

/* ─── Section wrapper with fade-in animation ─── */
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
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Capability card ─── */
interface CapabilityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  bgColor: string;
}

function CapabilityCard({ icon, title, description, accentColor, bgColor }: CapabilityCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl border border-[#D9E6EE] p-6 cursor-default"
      style={{
        boxShadow: hovered
          ? '0 12px 32px -6px rgba(7,59,85,0.12), 0 4px 8px -2px rgba(7,59,85,0.06)'
          : '0 2px 12px rgba(18,43,67,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'box-shadow 220ms ease, transform 220ms ease, border-color 220ms ease',
        borderColor: hovered ? 'rgba(0,213,232,0.5)' : '#D9E6EE',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: bgColor }}
      >
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <h3 className="text-base font-bold text-[#122B43] mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-[#60778C] leading-relaxed">{description}</p>
    </div>
  );
}

/* ─── How-It-Works step ─── */
function WorkflowStep({
  number,
  icon,
  title,
  description,
  isLast,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
      {/* Number + connecting line */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md"
          style={{ background: 'linear-gradient(135deg, #073B55 0%, #087D91 100%)' }}
        >
          {number}
        </div>
        {!isLast && (
          <div
            className="hidden sm:block w-0.5 flex-1 mt-2"
            style={{ background: 'linear-gradient(to bottom, #087D91, transparent)', minHeight: '40px' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8 sm:pb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold mb-3"
          style={{ background: '#E4F6FA', color: '#073B55', border: '1px solid #BCEBF5' }}
        >
          {icon}
          <span>{title}</span>
        </div>
        <p className="text-sm text-[#60778C] leading-relaxed max-w-lg">{description}</p>
      </div>
    </div>
  );
}

/* ─── Main Page Component ─── */
export function AboutPage() {
  const capabilities = [
    {
      icon: <Search size={20} />,
      title: 'Hospital Discovery',
      description:
        'Locate verified medical facilities in your region instantly. Filter by specialty, distance, and available resources.',
      accentColor: '#087D91',
      bgColor: '#E4F6FA',
    },
    {
      icon: <Activity size={20} />,
      title: 'Emergency Resource Availability',
      description:
        'View live ICU bed counts, ventilator availability, and medical oxygen levels at a glance before you travel.',
      accentColor: '#15803D',
      bgColor: '#F0FDF4',
    },
    {
      icon: <RefreshCw size={20} />,
      title: 'Real-Time Resource Updates',
      description:
        'Hospital staff update resource telemetry regularly, giving you the most current picture of capacity across the network.',
      accentColor: '#7C3AED',
      bgColor: '#F5F3FF',
    },
    {
      icon: <MapPin size={20} />,
      title: 'Location-Based Search',
      description:
        'Sort results by proximity, see estimated drive times, and get one-tap navigation to the nearest available facility.',
      accentColor: '#B45309',
      bgColor: '#FFFBEB',
    },
    {
      icon: <Phone size={20} />,
      title: 'Direct Hospital Contact',
      description:
        'Call a hospital&apos;s emergency desk directly from the platform. No searching, no delays — just one tap to connect.',
      accentColor: '#DC2626',
      bgColor: '#FEF2F2',
    },
    {
      icon: <Users size={20} />,
      title: 'Hospital Staff Integration',
      description:
        'A dedicated operator dashboard lets hospital staff update resource data, manage alerts, and monitor live telemetry.',
      accentColor: '#0369A1',
      bgColor: '#E0F2FE',
    },
  ];

  const workflowSteps = [
    {
      number: 1,
      icon: <Building size={14} />,
      title: 'Hospitals join the network',
      description:
        'Verified healthcare facilities register with MediTrack and connect their resource management systems to the platform. Each facility is reviewed before appearing in search results.',
    },
    {
      number: 2,
      icon: <RefreshCw size={14} />,
      title: 'Resources are updated continuously',
      description:
        'Hospital operators use the MediTrack staff dashboard to log current availability of ICU beds, ventilators, oxygen supplies, and emergency unit status — keeping data current and accurate.',
    },
    {
      number: 3,
      icon: <Search size={14} />,
      title: 'Users discover nearby hospitals',
      description:
        'When someone needs urgent care, they open MediTrack and search by location or resource type. The platform instantly ranks nearby facilities by distance and resource availability.',
    },
    {
      number: 4,
      icon: <Phone size={14} />,
      title: 'Users contact hospitals directly',
      description:
        'Once the right facility is identified, users can call the emergency desk with a single tap or get turn-by-turn directions — reducing the critical time between need and care.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: '#F3F8FC' }}>
      <SiteNavbar />

      <main className="flex-1 pt-20 sm:pt-24">
        {/* ═══════════════════════════════════════════
            SECTION 1 — Hero: About MediTrack
        ═══════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #001525 0%, #052F4B 45%, #073B55 100%)',
          }}
        >
          {/* Background decorative glows */}
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top right, rgba(0,213,232,0.08) 0%, transparent 65%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at bottom left, rgba(8,125,145,0.1) 0%, transparent 60%)',
            }}
          />

          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left — Text Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
                  style={{ background: 'rgba(0,213,232,0.12)', color: '#00D5E8', border: '1px solid rgba(0,213,232,0.3)' }}>
                  <Heart size={12} />
                  <span>About MediTrack</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 break-words">
                  Healthcare resource
                  <span style={{ color: '#00D5E8' }}> discovery</span>,<br />
                  when it matters most.
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
                  MediTrack is a healthcare resource discovery and emergency coordination platform built to close the information gap between patients in need and hospitals with available capacity.
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                  <Link
                    to="/hospitals"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white no-underline transition-all min-h-[44px]"
                    style={{ background: '#087D91' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#0a95ac';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,213,232,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#087D91';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <span>Find Hospitals</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold no-underline transition-all min-h-[44px]"
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                      (e.currentTarget as HTMLElement).style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                    }}
                  >
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>

              {/* Right — Medical Orbit Visualization */}
              <div className="flex items-center justify-center w-full mt-6 sm:mt-10 lg:mt-0">
                <MedicalOrbit />
              </div>
            </div>
          </div>

          {/* Wave transition bottom */}
          <div className="relative h-16 overflow-hidden">
            <svg
              viewBox="0 0 1440 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute bottom-0 w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z"
                fill="#F3F8FC"
              />
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 2 — Our Mission
        ═══════════════════════════════════════════ */}
        <section className="py-14 sm:py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* Left — Mission statement */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#087D91]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#087D91]">
                      Our Mission
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#122B43] tracking-tight mb-6 leading-tight">
                    Bridging the gap between<br />
                    <span style={{ color: '#087D91' }}>critical need</span> and available care.
                  </h2>

                  <div className="space-y-5 text-sm text-[#60778C] leading-relaxed">
                    <p>
                      In a medical emergency, every minute counts. Yet families and emergency responders frequently spend precious time calling hospital after hospital to find available ICU beds, functioning ventilators, or sufficient oxygen supplies — information that should be immediately accessible.
                    </p>
                    <p>
                      MediTrack was built to address this gap. We provide a transparent, centralized view of emergency resource availability across a network of verified hospitals — so that the right care can be found faster, and reaching it is simpler.
                    </p>
                    <p>
                      Our goal is not to replace emergency services, but to give people better information at a critical moment — transforming a stressful, uncertain search into a clear, confident decision.
                    </p>
                  </div>
                </div>

                {/* Right — Problem cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Clock size={22} />,
                      heading: 'Time-Critical Decisions',
                      body: 'Emergency resource searches often happen under extreme time pressure, where delays in finding care can have serious consequences.',
                      color: '#FEF2F2',
                      iconColor: '#DC2626',
                      border: '#FECACA',
                    },
                    {
                      icon: <Search size={22} />,
                      heading: 'Information Fragmentation',
                      body: "Hospital resource data is spread across phone calls, websites, and internal systems — there's no single source of truth for patients.",
                      color: '#FFFBEB',
                      iconColor: '#B45309',
                      border: '#FDE68A',
                    },
                    {
                      icon: <ShieldCheck size={22} />,
                      heading: 'Verification Gap',
                      body: 'Outdated or unverified capacity data leads to wasted trips and increased stress during already difficult medical situations.',
                      color: '#F0FDF4',
                      iconColor: '#15803D',
                      border: '#BBF7D0',
                    },
                    {
                      icon: <Navigation size={22} />,
                      heading: 'Navigation Complexity',
                      body: 'Finding the nearest available facility that matches the specific medical need requires coordination that most people cannot do alone.',
                      color: '#E4F6FA',
                      iconColor: '#087D91',
                      border: '#BCEBF5',
                    },
                  ].map((item) => (
                    <div
                      key={item.heading}
                      className="rounded-2xl p-5 border"
                      style={{ background: item.color, borderColor: item.border }}
                    >
                      <div className="mb-3" style={{ color: item.iconColor }}>{item.icon}</div>
                      <h4 className="text-sm font-bold text-[#122B43] mb-1.5">{item.heading}</h4>
                      <p className="text-xs text-[#60778C] leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 3 — How It Works
        ═══════════════════════════════════════════ */}
        <section
          className="py-14 sm:py-20 lg:py-28"
          style={{ background: 'linear-gradient(180deg, #EBF4FA 0%, #F3F8FC 100%)' }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeSection>
              <div className="text-center mb-10 sm:mb-14">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#087D91]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#087D91]">
                    How It Works
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#122B43] tracking-tight mb-4">
                  From hospital registration to emergency care
                </h2>
                <p className="text-sm text-[#60778C] max-w-xl mx-auto leading-relaxed">
                  MediTrack connects hospitals with the people who need them through a simple, reliable four-step workflow.
                </p>
              </div>
            </FadeSection>

            <FadeSection delay={150}>
              <div
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E6EE] p-5 sm:p-8 md:p-12"
                style={{ boxShadow: '0 4px 24px rgba(18,43,67,0.06)' }}
              >
                {workflowSteps.map((step, i) => (
                  <WorkflowStep
                    key={step.number}
                    number={step.number}
                    icon={step.icon}
                    title={step.title}
                    description={step.description}
                    isLast={i === workflowSteps.length - 1}
                  />
                ))}
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 4 — Core Capabilities
        ═══════════════════════════════════════════ */}
        <section className="py-14 sm:py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeSection>
              <div className="text-center mb-10 sm:mb-14">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#087D91]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#087D91]">
                    Core Capabilities
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#122B43] tracking-tight mb-4">
                  Everything you need in a critical moment
                </h2>
                <p className="text-sm text-[#60778C] max-w-xl mx-auto leading-relaxed">
                  MediTrack brings together the information and tools needed to navigate healthcare emergencies with clarity and speed.
                </p>
              </div>
            </FadeSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((cap, i) => (
                <FadeSection key={cap.title} delay={i * 80}>
                  <CapabilityCard {...cap} />
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 5 — Call to Action
        ═══════════════════════════════════════════ */}
        <section className="py-14 sm:py-20 lg:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeSection>
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #001525 0%, #063B56 55%, #073B55 100%)',
                  boxShadow: '0 20px 60px -10px rgba(5,47,75,0.4)',
                }}
              >
                {/* Background decorative glow */}
                <div
                  className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-20"
                  style={{ background: 'radial-gradient(circle, #00D5E8 0%, transparent 70%)' }}
                />
                <div
                  className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none opacity-10"
                  style={{ background: 'radial-gradient(circle, #087D91 0%, transparent 70%)' }}
                />

                <div className="relative z-10 p-6 sm:p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
                  {/* Text */}
                  <div className="max-w-lg text-center md:text-left">
                    {/* Live pulsing badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                      style={{ background: 'rgba(0,213,232,0.12)', color: '#00D5E8', border: '1px solid rgba(0,213,232,0.3)' }}>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D5E8] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D5E8]" />
                      </span>
                      Network is live
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                      Ready to find the right hospital when it matters?
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed mb-0">
                      Browse our directory of verified healthcare facilities and discover real-time resource availability across hospitals near you.
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                    <Link
                      to="/hospitals"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-white no-underline transition-all whitespace-nowrap min-h-[48px]"
                      style={{
                        background: 'linear-gradient(135deg, #087D91 0%, #00D5E8 100%)',
                        boxShadow: '0 4px 20px rgba(0,213,232,0.3)',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(0,213,232,0.5)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,213,232,0.3)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      }}
                    >
                      <MapPin size={16} />
                      <span>Explore Hospitals</span>
                      <ChevronRight size={16} />
                    </Link>

                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer min-h-[48px]"
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
                      <Users size={16} />
                      <span>Hospital Staff Portal</span>
                    </button>
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer
        id="contact"
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

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/hospitals" className="hover:text-white transition-colors">Hospitals</Link>
            <Link to="/about" className="text-white font-semibold transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="text-xs text-slate-400 text-center sm:text-right">
            © {new Date().getFullYear()} MediTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
